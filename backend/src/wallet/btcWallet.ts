/**
 * btcWallet.ts
 * ------------------------------------------------------------------
 * Derives unique Bitcoin TESTNET deposit addresses from the master
 * seed, following BIP32/44.
 *
 * Path structure: m / 44' / 1' / 0' / 0 / index
 *   44'  -> BIP44 (standard multi-coin derivation)
 *   1'   -> coin type 1 = Bitcoin TESTNET (0' would be mainnet — we
 *           deliberately never touch mainnet in this project)
 *   0'   -> account 0
 *   0    -> "external" chain (receiving addresses, not change)
 *   index -> ONE UNIQUE NUMBER PER USER. This is how each user gets
 *            their own address without needing a new wallet each time.
 * ------------------------------------------------------------------
 */

import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);
const NETWORK = bitcoin.networks.testnet; // hard-pinned to testnet for this whole project

export interface BtcDepositAddress {
  index: number;
  address: string;
  derivationPath: string;
}

/**
 * Derives the public deposit address for a given user index.
 * This ONLY needs the seed at generation time — after that, the address
 * itself is all the monitor and API need. This is the property that lets
 * you later split "address generation" from "key custody" for security.
 */
export function deriveBtcAddress(seed: Buffer, index: number): BtcDepositAddress {
  const root = bip32.fromSeed(seed, NETWORK);
  const path = `m/44'/1'/0'/0/${index}`;
  const child = root.derivePath(path);

  const { address } = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(child.publicKey),
    network: NETWORK,
  }); // p2wpkh = native SegWit ("bc1..."/"tb1..." style) — lower fees than legacy addresses

  if (!address) throw new Error('Failed to derive BTC address');

  return { index, address, derivationPath: path };
}
