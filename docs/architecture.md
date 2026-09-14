# CashMarker architecture

CashMarker is a single-user personal finance PWA. The UI is intentionally simple, while the data model keeps room for later public self-hosting and transaction imports.

## Runtime boundaries

- Next.js renders the application and will be deployed to Vercel.
- Supabase Auth protects access even though the primary deployment has one user.
- Supabase Postgres is the authoritative cross-device data store.
- Browser state is used only for temporary interaction until persistence is connected.

## Product boundaries

- Quick entry automatically uses the current date in `Asia/Shanghai`.
- Pending fixed bills do not affect current funds or finalized savings.
- Every fixed bill occurrence must be confirmed, edited and confirmed, or skipped separately.
- Monthly savings is final only after the month has ended and no bill occurrences remain pending.
- Dashboard visibility and ordering are preferences; hiding a widget never deletes financial data.

## Code boundaries

- `app/`: route-level screens.
- `components/transactions/`: quick entry and transaction UI.
- `components/bills/`: fixed bill confirmation UI.
- `components/widgets/`: widget registry and dashboard rendering.
- `lib/finance/`: pure money and month-closing calculations.
- `lib/supabase/`: cloud data clients.
- `supabase/migrations/`: reproducible database schema.
- `tests/finance/`: exact tests for money rules.
