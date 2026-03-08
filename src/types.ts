export type SupportedCurrency = 'UAH' | 'EUR' | 'USD' | 'GBP';

export interface Transaction {
    id: string;
    /** ISO date string YYYY-MM-DD — the actual income receipt date */
    date: string;
    /** Amount in the source currency */
    amount: number;
    currency: SupportedCurrency;
}

export interface CalculatedTransaction extends Transaction {
    /** The actual date the NBP rate was fetched for (last working day before payment) */
    rateDateUsed: string;
    /** NBP mid rate: PLN per 1 unit of foreign currency */
    nbpRate: number;
    /** amount × nbpRate, rounded to 2 decimal places */
    amountPLN: number;
    error?: string;
}

export interface ParsedRow {
    rawDate: string;
    rawAmount: string;
    date: string | null;
    amount: number | null;
    parseError?: string;
}
