import { parse, isValid, format, subDays, parseISO, isWeekend } from 'date-fns';

const DATE_FORMATS = [
    'dd.MM.yyyy',
    'yyyy-MM-dd',
    'dd-MM-yyyy',
    'MM/dd/yyyy',
    'dd/MM/yyyy',
    'd.M.yyyy',
];

/**
 * Tries to parse a date string using multiple common date formats.
 * Returns an ISO string (YYYY-MM-DD) on success, or null if no format matches.
 */
export function parseDate(raw: string): string | null {
    const trimmed = raw.trim();
    for (const fmt of DATE_FORMATS) {
        const parsed = parse(trimmed, fmt, new Date(2000, 0, 1));
        if (isValid(parsed)) {
            return format(parsed, 'yyyy-MM-dd');
        }
    }
    return null;
}

/**
 * Parses an amount string: removes whitespace, replaces comma decimal separator,
 * strips currency symbols. Returns a number or null if not parseable.
 */
export function parseAmount(raw: string): number | null {
    const cleaned = raw
        .trim()
        // Remove currency symbols and thousands separators (spaces, non-breaking spaces)
        .replace(/[^0-9.,\-]/g, '')
        // Normalize decimal separator: if last separator is comma, treat as decimal
        .replace(/,(?=\d{1,2}$)/, '.')
        // Remove remaining commas (thousands separators)
        .replace(/,/g, '');

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

/**
 * Subtracts one calendar day from an ISO date string.
 */
export function subtractOneDay(isoDate: string): string {
    const d = parseISO(isoDate);
    return format(subDays(d, 1), 'yyyy-MM-dd');
}

/**
 * Returns the last weekday (Mon–Fri) strictly before the given ISO date.
 * Skips Saturday and Sunday directly — no network call needed for those.
 * Polish public holidays are handled separately by the NBP API returning 404.
 *
 * Example: input Friday 2025-01-03 → Thursday 2025-01-02
 *          input Monday 2025-01-06 → Friday 2025-01-03 (skips Sat+Sun)
 *          input Sunday 2025-01-05 → Friday 2025-01-03 (skips Sun+Sat)
 */
export function previousWorkday(isoDate: string): string {
    let d = subDays(parseISO(isoDate), 1);
    // date-fns isWeekend: true for Saturday (day 6) and Sunday (day 0)
    while (isWeekend(d)) {
        d = subDays(d, 1);
    }
    return format(d, 'yyyy-MM-dd');
}

/**
 * Parses tab-separated or comma/semicolon-separated text (as pasted from Excel).
 * Each line should have two columns: date and amount (in either order).
 * Returns an array of [dateStr, amountStr] tuples.
 */
export function parseExcelPaste(text: string): Array<[string, string]> {
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    return lines.map((line) => {
        // Try tab-separated first (Excel default)
        let parts = line.split('\t');
        if (parts.length < 2) {
            // Fall back to semicolon or comma separated
            parts = line.split(/[;,]/);
        }
        const a = (parts[0] ?? '').trim();
        const b = (parts[1] ?? '').trim();
        return [a, b] as [string, string];
    });
}
