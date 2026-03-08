# Foreign Income to PLN Converter

A React + TypeScript + Vite app for converting foreign income amounts into Polish złoty (PLN) using official NBP exchange rates. Designed for PIT-36 / PIT/ZG tax reporting.

---

## Features

- Paste or enter transactions (date & amount) in any order
- Select source currency (UAH, EUR, USD, GBP)
- Fetches historical NBP rates (Table A/B) for each transaction date
- Handles Polish public holidays and weekends automatically
- Shows conversion results in a sortable table
- Export results as CSV (Excel-ready) or copy to clipboard
- All calculations are client-side, no data leaves your browser

## Technical Details

- **Stack:** React 19, TypeScript, Vite, Tailwind CSS 4
- **Exchange rates:** Official NBP API (api.nbp.pl), Table A/B fallback for UAH
- **Date parsing:** Accepts multiple formats (e.g. 01.01.2024, 2024-01-01, 01/01/2024)
- **CSV export:** Excel-friendly (semicolon delimiter, UTF-8 BOM)
- **Privacy:** All calculations are performed locally in your browser

## Example Input

```
01.01.2024    4500,00
01.02.2024    4500,00
01.03.2024    4600,50
```

## Notes

- NBP mid rate is taken from the last working day before the income date, as required by Polish tax law (Art. 11a updof)
- Handles weekends and Polish public holidays automatically
- For PIT-36, enter the total PLN value in the PIT/ZG attachment

---

**License:** MIT
