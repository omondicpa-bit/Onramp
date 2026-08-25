# EPH Onramp

Personal learning project: a crypto deposit-collection platform (testnet,
own funds only). See `backend/README.md` and `ui/README.md` for details on
each half.

- `backend/` — HD wallet address generation + SQLite ledger (Node/TypeScript)
- `ui/` — dashboard (Next.js) showing balances, deposit addresses, ledger

## Status
Stage 1 (wallet) and Stage 2 (ledger) complete on the backend. UI built
against mock data shaped like the real schema. Next: Stage 3 (deposit
monitor) and wiring the UI to real data (Supabase).
