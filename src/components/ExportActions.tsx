import { useState } from 'react';
import { toCSVString, downloadCSV, copyToClipboard } from '../utils/exportUtils';
import type { CalculatedTransaction } from '../types';

interface Props {
	results: CalculatedTransaction[];
}

export function ExportActions({ results }: Props) {
	const [copied, setCopied] = useState(false);

	if (results.length === 0) return null;

	// Only export rows that were calculated successfully
	const exportable = results.filter((r) => !r.error);

	function handleDownloadCSV() {
		const csv = toCSVString(exportable);
		const year = exportable[0]?.date.slice(0, 4) ?? 'export';
		downloadCSV(csv, `income-pln-${year}.csv`);
	}

	async function handleCopy() {
		await copyToClipboard(exportable);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="flex flex-wrap gap-3">
			<button
				onClick={handleDownloadCSV}
				className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
			>
				<DownloadIcon />
				Download CSV
			</button>
			<button
				onClick={handleCopy}
				className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
			>
				{copied ? <CheckIcon /> : <ClipboardIcon />}
				{copied ? 'Copied!' : 'Copy to clipboard'}
			</button>
		</div>
	);
}

function DownloadIcon() {
	return (
		<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
		</svg>
	);
}

function ClipboardIcon() {
	return (
		<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"
			/>
		</svg>
	);
}

function CheckIcon() {
	return (
		<svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
		</svg>
	);
}
