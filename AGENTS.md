# ShopLedger

## Stack

Node.js CommonJS app using Express 4 and body-parser; a static browser UI in `public/`; JSON-file persistence in `data/db.json`.

## Module map

- `routes/customers.js` — lists customers and records Khata settlements.
- `routes/orders.js` — lists, creates, reads, and cancels orders.
- `routes/products.js` — lists products and active coupons.
- `routes/reports.js` — serves dashboard, GST reconciliation, pricing preview, and export endpoints.
- `lib/coupons.js` — normalizes, validates, calculates, and lists coupons.
- `lib/dates.js` — creates and normalizes dates and derives fiscal years.
- `lib/inventory.js` — finds products and checks, reserves, releases, and summarizes stock.
- `lib/invoice.js` — computes figures and renders printable invoice HTML.
- `lib/ledger.js` — finds/lists customers and manages Khata charges, reversals, and settlements.
- `lib/orders.js` — adds, gets, cancels, and lists orders.
- `lib/pricing.js` — calculates subtotals, discounts, and totals.
- `lib/reports.js` — builds dashboard summaries and GST reconciliation.
- `lib/store.js` — reads/writes the JSON store and appends audit events.
- `lib/tax.js` — resolves GST rates and splits CGST/SGST.

## Commands

- Start the app: `node server.js` (or `npm start`).
- Run tests: `node --test`.

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Order history sorting and date filtering are broken, and Khata settlements corrupt customer balances.

Allowed files: `lib/orders.js` (`list` only), `lib/dates.js`, `lib/ledger.js`, and `routes/customers.js`.
