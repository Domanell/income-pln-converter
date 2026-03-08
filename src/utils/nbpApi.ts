import { previousWorkday } from './dateUtils';
import type { SupportedCurrency } from '../types';

const NBP_BASE = 'https://api.nbp.pl/api/exchangerates/rates';

/** In-memory rate cache to avoid duplicate API calls. Key: "CODE:YYYY-MM-DD" */
const rateCache = new Map<string, number>();

/**
 * Fetches the NBP mid exchange rate (PLN per 1 unit of foreign currency)
 * for a given currency code and the NBP table ('a' or 'b').
 * Returns the mid rate on success, or null if no data for that date (404).
 */
async function fetchRateFromTable(
    code: string,
    date: string,
    table: 'a' | 'b'
): Promise<number | null> {
    const cacheKey = `${table.toUpperCase()}:${code}:${date}`;
    if (rateCache.has(cacheKey)) {
        return rateCache.get(cacheKey)!;
    }

    const url = `${NBP_BASE}/${table}/${code.toLowerCase()}/${date}/?format=json`;
    const res = await fetch(url);

    if (res.status === 404) return null;

    if (!res.ok) {
        throw new Error(`NBP API error ${res.status} for ${code} on ${date}`);
    }

    const data = await res.json();
    const mid: number = data.rates[0].mid;
    rateCache.set(cacheKey, mid);
    return mid;
}

/**
 * Returns the NBP mid rate for the given currency on the last WORKING day
 * strictly before the given payment date.
 *
 * "Working day" = weekday that is not a Polish public holiday.
 *
 * Algorithm:
 *   1. Start from previousWorkday(paymentDate) — this already skips Sat/Sun
 *      without making any network calls.
 *   2. Try Table A (and Table B fallback for UAH pre-2022).
 *   3. If NBP returns 404, the weekday is a Polish public holiday — step back
 *      to the previous weekday and try again.
 *   4. Repeat up to MAX_RETRIES times (handles up to 10 consecutive holidays,
 *      far more than any real Polish holiday cluster).
 *
 * Returns { rate, rateDateUsed } on success, throws on failure.
 */
export async function fetchNBPRate(
    currency: SupportedCurrency,
    paymentDate: string
): Promise<{ rate: number; rateDateUsed: string }> {
    // 10 consecutive Polish public holidays in a row would be unprecedented
    const MAX_RETRIES = 10;
    const UAH_TABLE_B_CUTOFF = '2022-03-01';

    // Start from the last weekday before the payment date (Sat/Sun already skipped)
    let date = previousWorkday(paymentDate);

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        // Try Table A
        let rate = await fetchRateFromTable(currency, date, 'a');

        // UAH before cutoff: Table A may not have data; fall back to Table B
        if (rate === null && currency === 'UAH' && date < UAH_TABLE_B_CUTOFF) {
            rate = await fetchRateFromTable(currency, date, 'b');
        }

        if (rate !== null) {
            return { rate, rateDateUsed: date };
        }

        // 404 = this weekday is a Polish public holiday — step back to previous weekday
        date = previousWorkday(date);
    }

    throw new Error(
        `Could not find NBP rate for ${currency} within ${MAX_RETRIES} days before ${paymentDate}`
    );
}
