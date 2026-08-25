# EPH Onramp — backend

A from-scratch build of a crypto deposit-collection platform, in the style of
Coinme/BitPay: unique deposit addresses per user, blockchain monitoring,
confirmation handling, and an internal ledger. **Testnet only. No real funds.
Not production-secure — see Security Notes below.**

## Status: Stage 1 & 2 complete

- [x] **Stage 1 — HD wallet address generation** (`src/wallet/`)
  BIP39 mnemonic → BIP32 derivation → unique BTC testnet + EVM (ETH Sepolia /
  BSC testnet) addresses per user.
- [x] **Stage 2 — Ledger** (`src/db/`)
  SQLite, append-only double-entry style. Balances are *computed* from the
  sum of confirmed entries, never stored/mutated directly.
- [ ] **Stage 3 — Deposit monitor** (`src/monitor/` — scaffolded, not built yet)
  Poll testnet block explorers (e.g. Blockstream API for BTC testnet,
  Etherscan/Alchemy Sepolia API for ETH) for transactions to our addresses,
  track confirmations, call `recordDeposit()`.
- [ ] **Stage 4 — API layer** (`src/api/` — scaffolded, not built yet)
  Express REST API: create user, get deposit address, get balance, webhook
  on confirmation. This is the part that would let an external app plug in,
  the way your app plugged into Coinme.

## Running it

```bash
npm install
npm run demo    # generates a seed (first run only), creates 2 users,
                 # derives their addresses, shows their (zero) balances
```

This creates `.seed` (your mnemonic — gitignored) and `ledger.db` (SQLite —
gitignored) in the project root.

## How the pieces fit together

```
masterSeed.ts  →  one seed, root of everything
      │
      ├── btcWallet.ts   (derives m/44'/1'/0'/0/index  → BTC testnet address)
      └── ethWallet.ts   (derives m/44'/60'/0'/0/index → EVM address, works
                           for ETH Sepolia AND BSC testnet, same address)
                │
                ▼
        db/ledger.ts  →  createUser() stores addresses in deposit_addresses
                          recordDeposit() writes to ledger_entries
                          getBalance() sums confirmed ledger_entries
```

## Security notes (important even for a learning project)

1. **The seed currently lives in a plaintext file (`.seed`).** This is fine
   for testnet learning. It would NEVER be acceptable in production — real
   systems keep signing keys in an HSM or use MPC (multi-party computation)
   so no single machine ever holds a complete key.
2. **Balance arithmetic currently uses SQLite's `REAL` (floating point)
   internally for the SUM.** This is a known shortcut for the demo — for
   real money you'd use a fixed-point/decimal library (e.g. `decimal.js`)
   throughout, because floats lose precision in ways that matter for
   accounting.
3. **No authentication anywhere yet.** Stage 4's API will need it before
   it's even demo-safe to expose.

## What "polepole" scaling looks like from here

1. Build the Stage 3 monitor against BTC + ETH testnets, watching the
   addresses we just generated. Send yourself testnet coins from a faucet
   and watch a deposit get detected → confirmed → credited, live.
2. Build Stage 4's minimal API (`POST /users`, `GET /users/:id/addresses`,
   `GET /users/:id/balance`).
3. Only then think about: withdrawal/disbursement signing, sweeping,
   webhook delivery to a "merchant," and eventually — much later —
   mainnet, real custody architecture, and compliance requirements for a
   production system.
