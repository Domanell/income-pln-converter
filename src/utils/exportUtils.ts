import type { CalculatedTransaction } from '../types';

const CSV_HEADERS = [
    'Payment Date',
    'Amount',
    'Currency',
    'Rate Date (NBP)',
    'NBP Mid Rate',
    'Amount PLN',
];

function escapeCSVField(value: string | number): string {
    const str = String(value);
    // Wrap in quotes if the field contains comma, quote, or newline
    if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * Converts an array of calculated transactions into a CSV string.
 * Uses semicolons as delimiters (Excel-friendly in European locale).
 */
export function toCSVString(rows: CalculatedTransaction[]): string {
    const SEP = ';';
    const header = CSV_HEADERS.map(escapeCSVField).join(SEP);

    const dataRows = rows.map((r) =>
        [
            r.date,
            r.amount.toString().replace('.', ','),
            r.currency,
            r.rateDateUsed,
            r.nbpRate.toString().replace('.', ','),
            r.amountPLN.toString().replace('.', ','),
        ]
            .map(escapeCSVField)
            .join(SEP)
    );

    return [header, ...dataRows].join('\r\n');
}

/**
 * Triggers a browser file download for the given CSV content.
 */
export function downloadCSV(csvContent: string, filename: string): void {
    // BOM makes Excel auto-detect UTF-8
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Copies tab-separated data (Excel-pasteable) to the clipboard.
 * Each row is: Date \t Amount \t Currency \t Rate Date \t NBP Rate \t PLN
 */
export async function copyToClipboard(rows: CalculatedTransaction[]): Promise<void> {
    const header = CSV_HEADERS.join('\t');
    const dataRows = rows.map((r) =>
        [
            r.date,
            r.amount.toString().replace('.', ','),
            r.currency,
            r.rateDateUsed,
            r.nbpRate.toString().replace('.', ','),
            r.amountPLN.toString().replace('.', ','),
        ].join('\t')
    );
    const text = [header, ...dataRows].join('\n');
    await navigator.clipboard.writeText(text);
}
