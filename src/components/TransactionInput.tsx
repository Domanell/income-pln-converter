import { useState } from 'react';
import { parseDate, parseAmount, parseExcelPaste } from '../utils/dateUtils';
import type { ParsedRow, SupportedCurrency } from '../types';

interface Props {
	currency: SupportedCurrency;
	onParsedRows: (rows: ParsedRow[]) => void;
	disabled?: boolean;
}

const PLACEHOLDER = `Paste from Excel (two columns: date and amount):\n\n01.01.2024\t4500,00\n01.02.2024\t4500,00\n01.03.2024\t4600,50`;

export function TransactionInput({ currency, onParsedRows, disabled }: Props) {
	const [text, setText] = useState('');
	const [preview, setPreview] = useState<ParsedRow[]>([]);

	function parseLine(rawDate: string, rawAmount: string): ParsedRow {
		const date = parseDate(rawDate);
		const amount = parseAmount(rawAmount);

		// Detect if columns were swapped (amount in first column, date in second)
		if (date === null && amount !== null) {
			const swappedDate = parseDate(rawAmount);
			const swappedAmount = parseAmount(rawDate);
			if (swappedDate !== null && swappedAmount !== null) {
				return { rawDate, rawAmount, date: swappedDate, amount: swappedAmount };
			}
		}

		const errors: string[] = [];
		if (date === null) errors.push('unrecognized date format');
		if (amount === null) errors.push('unrecognized amount');

		return {
			rawDate,
			rawAmount,
			date,
			amount,
			parseError: errors.length > 0 ? errors.join(', ') : undefined,
		};
	}

	function handleChange(value: string) {
		setText(value);
		if (!value.trim()) {
			setPreview([]);
			onParsedRows([]);
			return;
		}

		const pairs = parseExcelPaste(value);
		const rows = pairs.filter(([a, b]) => a.length > 0 || b.length > 0).map(([a, b]) => parseLine(a, b));

		setPreview(rows);
		onParsedRows(rows);
	}

	const validCount = preview.filter((r) => r.date && r.amount).length;
	const errorCount = preview.filter((r) => r.parseError).length;

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<label className="text-sm font-semibold text-gray-700">
					Income entries — date &amp; amount in <span className="font-bold text-blue-600">{currency}</span>
				</label>
				{preview.length > 0 && (
					<span className="text-xs text-gray-500">
						{validCount} valid
						{errorCount > 0 && <span className="ml-1 text-red-500">, {errorCount} with errors</span>}
					</span>
				)}
			</div>

			<textarea
				value={text}
				disabled={disabled}
				onChange={(e) => handleChange(e.target.value)}
				placeholder={PLACEHOLDER}
				rows={8}
				className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 resize-y"
				spellCheck={false}
			/>

			{/* Parsed preview table */}
			{preview.length > 0 && (
				<div className="overflow-x-auto rounded-lg border border-gray-200">
					<table className="min-w-full text-xs">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-3 py-2 text-left font-semibold text-gray-600">#</th>
								<th className="px-3 py-2 text-left font-semibold text-gray-600">Date (raw)</th>
								<th className="px-3 py-2 text-left font-semibold text-gray-600">Parsed date</th>
								<th className="px-3 py-2 text-right font-semibold text-gray-600">Amount (raw)</th>
								<th className="px-3 py-2 text-right font-semibold text-gray-600">Parsed amount</th>
								<th className="px-3 py-2 text-left font-semibold text-gray-600">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 bg-white">
							{preview.map((row, i) => (
								<tr key={i} className={row.parseError ? 'bg-red-50' : ''}>
									<td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
									<td className="px-3 py-1.5 font-mono text-gray-600">{row.rawDate}</td>
									<td className="px-3 py-1.5 font-mono">{row.date ?? <span className="text-red-500">—</span>}</td>
									<td className="px-3 py-1.5 text-right font-mono text-gray-600">{row.rawAmount}</td>
									<td className="px-3 py-1.5 text-right font-mono">{row.amount !== null ? row.amount : <span className="text-red-500">—</span>}</td>
									<td className="px-3 py-1.5">
										{row.parseError ? <span className="text-red-500">{row.parseError}</span> : <span className="text-green-600">✓</span>}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
