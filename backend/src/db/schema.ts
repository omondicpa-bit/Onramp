/**
 * schema.ts
 * ------------------------------------------------------------------
 * The ledger. This is the part that matters most for a payments
 * system — more than the blockchain code, honestly.
 *
 * Two core tables:
 *
 * 1. deposit_addresses — one row per (user, asset). Maps a derivation
 *    index to an actual address, so the monitor knows which addresses
 *    to watch and which user to credit.
 *
 * 2. ledger_entries — an APPEND-ONLY, DOUBLE-ENTRY log. We never
 *    UPDATE a balance directly. Instead every event writes a new row,
 *    and a user's balance is the SUM of their entries. This means:
 *      - You can always reconstruct how a balance was arrived at
 *      - A bug can't silently overwrite history
 *      - Reconciling against the blockchain later is just "does the
 *        sum of confirmed on-chain amounts match the sum of ledger
 *        entries" — a real query, not a guess
 * ------------------------------------------------------------------
 */

import Database from 'better-sqlite3';
import * as path from 'path';

const DB_PATH = path.join(__dirname, '../../ledger.db');

export function getDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  initSchema(db);
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_ref TEXT UNIQUE NOT NULL,      -- e.g. your app's user ID
      derivation_index INTEGER UNIQUE NOT NULL, -- this user's unique HD index
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS deposit_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      asset TEXT NOT NULL,               -- 'BTC_TESTNET' | 'ETH_SEPOLIA' | 'BSC_TESTNET' etc.
      address TEXT NOT NULL,
      derivation_path TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(asset, address)
    );

    CREATE TABLE IF NOT EXISTS ledger_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      asset TEXT NOT NULL,
      amount TEXT NOT NULL,              -- stored as string; crypto amounts need exact decimal handling, never floats
      direction TEXT NOT NULL CHECK(direction IN ('credit','debit')),
      status TEXT NOT NULL CHECK(status IN ('pending','confirming','confirmed','failed')),
      tx_hash TEXT,                      -- the on-chain transaction hash, for reconciliation
      confirmations INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger_entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_ledger_txhash ON ledger_entries(tx_hash);
  `);
}
