/**
 * ethWallet.ts
 * ------------------------------------------------------------------
 * Derives unique EVM deposit addresses (works for ETH, and the SAME
 * address also receives ERC-20 tokens like USDT-ERC20 — that's an
 * important EVM concept: one address, many tokens, because tokens are
 * just balances tracked inside a smart contract, not separate wallets).
 *
 * BSC uses the exact same address format/derivation as Ethereum (both
 * are EVM chains) — so the SAME address works on both ETH and BSC.
 * You just need to point your monitor at the right chain's nodes.
 *
 * Path structure: m / 44' / 60' / 0' / 0 / index
 *   60' -> BIP44 coin type for Ethereum (used by convention for all
 *          EVM chains, including BSC, testnets, etc.)
 * ------------------------------------------------------------------
 */

import { HDNodeWallet, Mnemonic } from 'ethers';

export interface EvmDepositAddress {
  index: number;
  address: string;
  derivationPath: string;
}

/**
 * Derives the public deposit address for a given user index.
 * NOTE: ethers derives from the mnemonic phrase directly (it computes the
 * same underlying seed internally), which is the standard approach for
 * EVM wallets.
 */
export function deriveEvmAddress(mnemonicPhrase: string, index: number): EvmDepositAddress {
  const path = `m/44'/60'/0'/0/${index}`;
  const mnemonic = Mnemonic.fromPhrase(mnemonicPhrase);
  const wallet = HDNodeWallet.fromMnemonic(mnemonic, path);

  return { index, address: wallet.address, derivationPath: path };
}
