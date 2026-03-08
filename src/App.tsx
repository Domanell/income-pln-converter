import { useState, useCallback } from 'react';
import { CurrencySelect } from './components/CurrencySelect';
import { TransactionInput } from './components/TransactionInput';
import { ResultsTable } from './components/ResultsTable';
import { ExportActions } from './components/ExportActions';
import { fetchNBPRate } from './utils/nbpApi';
import type { SupportedCurrency, ParsedRow, CalculatedTransaction } from './types';

type AppStatus = 'idle' | 'calculating' | 'done';

export default function App() {
	const [currency, setCurrency] = useState<SupportedCurrency>('UAH');
	const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
	const [results, setResults] = useState<CalculatedTransaction[]>([]);
	const [status, setStatus] = useState<AppStatus>('idle');
	const [progress, setProgress] = useState({ done: 0, total: 0 });

	const validRows = parsedRows.filter((r) => r.date && r.amount !== null);

	const handleCalculate = useCallback(async () => {
		if (validRows.length === 0) return;

		setStatus('calculating');
		setResults([]);
		setProgress({ done: 0, total: validRows.length });

		// Process all rows concurrently; use Promise.allSettled so one failure doesn't block others
		const promises = validRows.map(async (row, idx): Promise<CalculatedTransaction> => {
			const base: CalculatedTransaction = {
				id: `row-${idx}`,
				date: row.date!,
				amount: row.amount!,
				currency,
				rateDateUsed: '',
				nbpRate: 0,
				amountPLN: 0,
			};

			try {
				const { rate, rateDateUsed } = await fetchNBPRate(currency, row.date!);
				setProgress((p) => ({ ...p, done: p.done + 1 }));
				return {
					...base,
					rateDateUsed,
					nbpRate: rate,
					// Multiply in groszy, apply epsilon correction before rounding to avoid
					// cases like 1.005 being stored as 1.00499999... and rounding down
					amountPLN: Math.round(row.amount! * rate * 100 + Number.EPSILON) / 100,
				};
			} catch (err) {
				setProgress((p) => ({ ...p, done: p.done + 1 }));
				return {
					...base,
					error: err instanceof Error ? err.message : 'Unknown error',
				};
			}
		});

		const settled = await Promise.allSettled(promises);
		const calculated = settled.map((s) => (s.status === 'fulfilled' ? s.value : ({} as CalculatedTransaction)));

		// Sort by date ascending
		calculated.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));

		setResults(calculated);
		setStatus('done');
	}, [validRows, currency]);

	const isCalculating = status === 'calculating';

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Header */}
			<header className="bg-white border-b border-gray-200 shadow-sm">
				<div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
					<div>
						<h1 className="text-lg font-bold text-gray-900">Foreign Income to PLN Converter</h1>
						<p className="text-xs text-gray-500">Official NBP exchange rates · PIT-36 / PIT/ZG</p>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
				{/* Step 1: Currency */}
				<section className="rounded-xl bg-white shadow-sm border border-gray-200 px-6 py-5">
					<StepLabel n={1} label="Select income currency" />
					<div className="mt-3">
						<CurrencySelect
							value={currency}
							onChange={(c) => {
								setCurrency(c);
								setResults([]);
								setStatus('idle');
							}}
							disabled={isCalculating}
						/>
					</div>
				</section>

				{/* Step 2: Input transactions */}
				<section className="rounded-xl bg-white shadow-sm border border-gray-200 px-6 py-5">
					<StepLabel n={2} label="Enter / paste transactions" />
					<div className="mt-3">
						<TransactionInput
							currency={currency}
							onParsedRows={(rows) => {
								setParsedRows(rows);
								setResults([]);
								setStatus('idle');
							}}
							disabled={isCalculating}
						/>
					</div>
				</section>

				{/* Step 3: Calculate */}
				<section className="rounded-xl bg-white shadow-sm border border-gray-200 px-6 py-5">
					<StepLabel n={3} label="Calculate PLN values" />
					<div className="mt-3 flex items-center gap-4">
						<button
							onClick={handleCalculate}
							disabled={isCalculating || validRows.length === 0}
							className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
						>
							{isCalculating
								? `Fetching rates… (${progress.done}/${progress.total})`
								: `Calculate ${validRows.length > 0 ? `${validRows.length} transaction${validRows.length > 1 ? 's' : ''}` : ''}`}
						</button>
						{isCalculating && (
							<div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
								{/* Progress bar fills as each rate is fetched */}
								<div
									className="h-full bg-green-500 transition-all duration-300 rounded-full"
									style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
								/>
							</div>
						)}
					</div>
					{validRows.length === 0 && parsedRows.length > 0 && (
						<p className="mt-2 text-xs text-red-500">No valid rows to calculate. Check the parse errors above.</p>
					)}
				</section>

				{/* Results */}
				{results.length > 0 && (
					<section className="rounded-xl bg-white shadow-sm border border-gray-200 px-6 py-5 space-y-4">
						<ResultsTable results={results} total={results.reduce((sum, r) => sum + (r.error ? 0 : Math.round(r.amountPLN * 100)), 0) / 100} />
						<div className="border-t border-gray-100 pt-4">
							<ExportActions results={results} />
						</div>
					</section>
				)}
			</main>

			<footer className="mt-8 pb-8 text-center text-xs text-gray-400">Rates sourced from the National Bank of Poland (NBP) public API — api.nbp.pl</footer>
		</div>
	);
}

function StepLabel({ n, label }: { n: number; label: string }) {
	return (
		<div className="flex items-center gap-2">
			<span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{n}</span>
			<span className="text-sm font-semibold text-gray-700">{label}</span>
		</div>
	);
}
