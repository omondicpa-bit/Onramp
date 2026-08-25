/**
 * demo.ts
 * ------------------------------------------------------------------
 * Run this with: npm run demo
 *
 * This proves out Stage 1 + Stage 2: it creates a mnemonic (once),
 * creates a user, derives that user's unique BTC testnet + ETH
 * Sepolia testnet + BSC testnet deposit addresses, and shows you the
 * (currently zero) balance from the ledger.
 *
 * Next stage will add the monitor that watches these addresses on
 * real testnet block explorers and credits the ledger automatically.
 * ------------------------------------------------------------------
 */

import { loadOrCreateMnemonic, mnemonicToSeed } from './wallet/masterSeed';
import { createUser, getDepositAddresses, getBalance } from './db/ledger';

function main() {
  const mnemonic = loadOrCreateMnemonic();
  const seed = mnemonicToSeed(mnemonic);

  console.log('\n--- Creating user "demo-user-1" ---');
  const user: any = createUser('demo-user-1', seed, mnemonic);
  console.log('User:', user);

  console.log('\n--- Their unique deposit addresses ---');
  const addresses = getDepositAddresses(user.id);
  for (const addr of addresses as any[]) {
    console.log(`${addr.asset}: ${addr.address}  (path: ${addr.derivation_path})`);
  }

  console.log('\n--- Creating a second user to prove addresses are unique per user ---');
  const user2: any = createUser('demo-user-2', seed, mnemonic);
  const addresses2 = getDepositAddresses(user2.id);
  for (const addr of addresses2 as any[]) {
    console.log(`${addr.asset}: ${addr.address}  (path: ${addr.derivation_path})`);
  }

  console.log('\n--- Current confirmed balances (should be 0 — nothing deposited yet) ---');
  console.log('User 1 BTC_TESTNET balance:', getBalance(user.id, 'BTC_TESTNET'));

  console.log('\nDone. Addresses above are REAL, VALID TESTNET addresses.');
  console.log('You could technically send testnet coins to them from a faucet — that\'s Stage 3.\n');
}

main();
