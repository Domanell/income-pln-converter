import type { SupportedCurrency } from '../types';

const CURRENCIES: { value: SupportedCurrency; label: string; flag: string }[] = [
	{ value: 'UAH', label: 'Ukrainian Hryvnia (UAH)', flag: '🇺🇦' },
	{ value: 'EUR', label: 'Euro (EUR)', flag: '🇪🇺' },
	{ value: 'USD', label: 'US Dollar (USD)', flag: '🇺🇸' },
	{ value: 'GBP', label: 'British Pound (GBP)', flag: '🇬🇧' },
];

interface Props {
	value: SupportedCurrency;
	onChange: (currency: SupportedCurrency) => void;
	disabled?: boolean;
}

export function CurrencySelect({ value, onChange, disabled }: Props) {
	return (
		<div className="flex items-center gap-3">
			<label htmlFor="currency-select" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
				Income currency:
			</label>
			<select
				id="currency-select"
				value={value}
				disabled={disabled}
				onChange={(e) => onChange(e.target.value as SupportedCurrency)}
				className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
			>
				{CURRENCIES.map((c) => (
					<option key={c.value} value={c.value}>
						{c.flag} {c.label}
					</option>
				))}
			</select>
		</div>
	);
}
