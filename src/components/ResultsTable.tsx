import type { CalculatedTransaction } from '../types';

interface Props {
	results: CalculatedTransaction[];
	total: number;
}

export function ResultsTable({ results, total }: Props) {
	if (results.length === 0) return null;

	const hasErrors = results.some((r) => r.error);

	return (
		<div className="space-y-4">
			<h2 className="text-base font-semibold text-gray-800">
				Calculation Results
				{hasErrors && <span className="ml-2 text-sm font-normal text-amber-600">⚠ Some rows have errors — check below</span>}
			</h2>

			<div className="overflow-x-auto rounded-lg border border-gray-200">
				<table className="min-w-full text-sm">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-4 py-2.5 text-left font-semibold text-gray-600">Income date</th>
							<th className="px-4 py-2.5 text-right font-semibold text-gray-600">Amount</th>
							<th className="px-4 py-2.5 text-left font-semibold text-gray-600">Currency</th>
							<th className="px-4 py-2.5 text-left font-semibold text-gray-600">Rate date (NBP)</th>
							<th className="px-4 py-2.5 text-right font-semibold text-gray-600">NBP mid rate</th>
							<th className="px-4 py-2.5 text-right font-semibold text-gray-600">Amount PLN</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 bg-white">
						{results.map((r) => (
							<tr key={r.id} className={r.error ? 'bg-amber-50' : 'hover:bg-gray-50'}>
								<td className="px-4 py-2 font-mono">{r.date}</td>
								<td className="px-4 py-2 text-right font-mono">{r.amount.toString().replace('.', ',')}</td>
								<td className="px-4 py-2 text-gray-500">{r.currency}</td>
								{r.error ? (
									<td className="px-4 py-2 text-amber-600" colSpan={3}>
										{r.error}
									</td>
								) : (
									<>
										<td className="px-4 py-2 font-mono text-gray-500">{r.rateDateUsed}</td>
										<td className="px-4 py-2 text-right font-mono">{r.nbpRate.toString().replace('.', ',')}</td>
										<td className="px-4 py-2 text-right font-mono font-semibold">{r.amountPLN.toString().replace('.', ',')}</td>
									</>
								)}
							</tr>
						))}
					</tbody>
					<tfoot>
						<tr className="border-t-2 border-gray-300 bg-gray-50">
							<td colSpan={5} className="px-4 py-2.5 text-right font-semibold text-gray-700">
								Total (PLN):
							</td>
							<td className="px-4 py-2.5 text-right font-mono font-bold text-green-700">{total.toString().replace('.', ',')}</td>
						</tr>
					</tfoot>
				</table>
			</div>

			{/* Note for tax declaration */}
			<p className="text-xs text-gray-400">
				* NBP mid rate (Tabela A/B) from the last working day before the income receipt date, as required by Polish tax law (Art. 11a updof). Enter the total in
				PIT-36, attachment PIT/ZG.
			</p>
		</div>
	);
}
