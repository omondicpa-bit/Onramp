/**
 * ledger.ts
 * ------------------------------------------------------------------
 * Functions that read/write the ledger. Keeping these in one place
 * (rather than writing raw SQL wherever it's needed) is what makes
 * the ledger trustworthy — every code path that touches balances goes
 * through the same, auditable functions.
 * ------------------------------------------------------------------
 */

import { getDb } from './schema';
import { deriveBtcAddress } from '../wallet/btcWallet';
import { deriveEvmAddress } from '../wallet/ethWallet';

/** Creates a new user and immediately derives + stores their deposit addresses on every supported asset. */
export function createUser(externalRef: string, seed: Buffer, mnemonicPhrase: string) {
  const db = getDb();

  const existing = db.prepare('SELECT * FROM users WHERE external_ref = ?').get(externalRef);
  if (existing) return existing;

  // The derivation index is just this user's row count — simple and deterministic for a learning build.
  // (A production system would allocate this more carefully to guarantee no collisions across retries.)
  const nextIndex = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;

  const insertUser = db.prepare(
    'INSERT INTO users (external_ref, derivation_index) VALUES (?, ?)'
  );
  const result = insertUser.run(externalRef, nextIndex);
  const userId = result.lastInsertRowid as number;

  const btc = deriveBtcAddress(seed, nextIndex);
  const eth = deriveEvmAddress(mnemonicPhrase, nextIndex);

  const insertAddr = db.prepare(
    'INSERT INTO deposit_addresses (user_id, asset, address, derivation_path) VALUES (?, ?, ?, ?)'
  );
  insertAddr.run(userId, 'BTC_TESTNET', btc.address, btc.derivationPath);
  insertAddr.run(userId, 'ETH_SEPOLIA', eth.address, eth.derivationPath); // same address also valid on BSC testnet
  insertAddr.run(userId, 'BSC_TESTNET', eth.address, eth.derivationPath);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
}

export function getDepositAddresses(userId: number) {
  const db = getDb();
  return db.prepare('SELECT * FROM deposit_addresses WHERE user_id = ?').all(userId);
}

/** Records an incoming deposit. Called by the monitor when it sees a new tx on a watched address. */
export function recordDeposit(params: {
  userId: number;
  asset: string;
  amount: string;
  txHash: string;
  confirmations: number;
  status: 'pending' | 'confirming' | 'confirmed';
}) {
  const db = getDb();

  // Idempotency: if we've already seen this tx_hash, UPDATE its confirmation count
  // instead of inserting a duplicate credit. This is essential — blockchain monitors
  // poll repeatedly and WILL see the same transaction many times before it's final.
  const existing = db
    .prepare('SELECT * FROM ledger_entries WHERE tx_hash = ?')
    .get(params.txHash);

  if (existing) {
    db.prepare(
      `UPDATE ledger_entries SET confirmations = ?, status = ?, updated_at = datetime('now') WHERE tx_hash = ?`
    ).run(params.confirmations, params.status, params.txHash);
    return;
  }

  db.prepare(
    `INSERT INTO ledger_entries (user_id, asset, amount, direction, status, tx_hash, confirmations)
     VALUES (?, ?, ?, 'credit', ?, ?, ?)`
  ).run(params.userId, params.asset, params.amount, params.status, params.txHash, params.confirmations);
}

/** Computes a user's confirmed balance for an asset — sum of confirmed credits minus confirmed debits. */
export function getBalance(userId: number, asset: string): string {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN direction = 'credit' THEN CAST(amount AS REAL) ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN direction = 'debit' THEN CAST(amount AS REAL) ELSE 0 END), 0) AS balance
       FROM ledger_entries
       WHERE user_id = ? AND asset = ? AND status = 'confirmed'`
    )
    .get(userId, asset) as { balance: number };

  return row.balance.toString();
}
