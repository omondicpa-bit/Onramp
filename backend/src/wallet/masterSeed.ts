/**
 * masterSeed.ts
 * ------------------------------------------------------------------
 * Generates and loads the BIP39 mnemonic that is the root of every
 * deposit address in the system (both BTC and ETH derive from this
 * same seed, via different derivation paths — this is what "HD
 * wallet" means: Hierarchical Deterministic).
 *
 * LEARNING-PROJECT SECURITY NOTE (read this before doing anything else):
 * In a real system, this seed would NEVER sit in a .env file next to
 * your API code. It would live in an offline signer / HSM / MPC setup,
 * and your live API would only ever see DERIVED PUBLIC KEYS (enough
 * to generate deposit addresses) — never the seed itself.
 *
 * For this learning build we keep it simple and local so you can see
 * the whole mechanism working. We'll separate signing from the API
 * later once the basic flow works end-to-end.
 * ------------------------------------------------------------------
 */

import * as bip39 from 'bip39';
import * as fs from 'fs';
import * as path from 'path';

const SEED_FILE = path.join(__dirname, '../../.seed'); // gitignored, local only

/**
 * Generates a brand new 24-word mnemonic and saves it locally.
 * Only ever call this ONCE per environment. Regenerating it would mean
 * you can no longer derive previously-issued deposit addresses.
 */
export function generateNewMnemonic(): string {
  if (fs.existsSync(SEED_FILE)) {
    throw new Error(
      'A seed already exists at .seed — refusing to overwrite. ' +
      'Delete it manually first if you really want a fresh one (this would orphan any addresses already derived from it).'
    );
  }
  const mnemonic = bip39.generateMnemonic(256); // 256 bits = 24 words (more entropy than the 12-word default)
  fs.writeFileSync(SEED_FILE, mnemonic, { mode: 0o600 });
  console.log('New mnemonic generated and saved to .seed');
  console.log('This is a TESTNET learning project — but treat this file like a password anyway. It is in .gitignore.');
  return mnemonic;
}

/**
 * Loads the existing mnemonic, or generates one if this is the first run.
 */
export function loadOrCreateMnemonic(): string {
  if (fs.existsSync(SEED_FILE)) {
    return fs.readFileSync(SEED_FILE, 'utf-8').trim();
  }
  return generateNewMnemonic();
}

/**
 * Converts the mnemonic into the raw seed bytes used for key derivation.
 */
export function mnemonicToSeed(mnemonic: string): Buffer {
  return bip39.mnemonicToSeedSync(mnemonic);
}
