/**
 * mockData.ts
 * ------------------------------------------------------------------
 * Placeholder data shaped identically to what Stage 3/4 (the monitor
 * + API) will eventually write to Supabase's `ledger_entries` and
 * `deposit_addresses` tables. When those are built, these functions
 * get replaced with real Supabase queries — the components below
 * won't need to change shape, just their data source.
 * ------------------------------------------------------------------
 */

export type Asset = 'BTC_TESTNET' | 'ETH_SEPOLIA' | 'BSC_TESTNET';
export type EntryStatus = 'pending' | 'confirming' | 'confirmed' | 'failed';

export interface DepositAddress {
  asset: Asset;
  address: string;
}

export interface LedgerEntry {
  id: number;
  asset: Asset;
  amount: string;
  status: EntryStatus;
  txHash: string | null;
  confirmations: number;
  createdAt: string;
}

export const ASSET_LABELS: Record<Asset, string> = {
  BTC_TESTNET: 'Bitcoin (testnet)',
  ETH_SEPOLIA: 'Ethereum (Sepolia)',
  BSC_TESTNET: 'BNB Chain (testnet)',
};

export const depositAddresses: DepositAddress[] = [
  { asset: 'BTC_TESTNET', address: 'tb1qmdsftfyd65yqtlxzxxxva5sxgz3du4atcl7psv' },
  { asset: 'ETH_SEPOLIA', address: '0x9487e676fb30eE3Ec55E0Dcc07A3A2fFF691aE21' },
  { asset: 'BSC_TESTNET', address: '0x9487e676fb30eE3Ec55E0Dcc07A3A2fFF691aE21' },
];

// Empty by default — this is an honest reflection of where the system
// actually is (Stage 3 monitor not built yet, so nothing is credited).
// Flip USE_SAMPLE_DATA to true locally if you want to see the UI
// populated while building the monitor.
const USE_SAMPLE_DATA = false;

const sampleEntries: LedgerEntry[] = [
  {
    id: 1,
    asset: 'BTC_TESTNET',
    amount: '0.00042000',
    status: 'confirmed',
    txHash: 'a1b2c3d4e5f6...9f00',
    confirmations: 6,
    createdAt: '2026-08-24T10:12:00Z',
  },
  {
    id: 2,
    asset: 'ETH_SEPOLIA',
    amount: '0.015000',
    status: 'confirming',
    txHash: '0xdeadbeef...1234',
    confirmations: 2,
    createdAt: '2026-08-25T09:40:00Z',
  },
];

export function getLedgerEntries(): LedgerEntry[] {
  return USE_SAMPLE_DATA ? sampleEntries : [];
}

export function getBalances(): Record<Asset, string> {
  const entries = getLedgerEntries().filter((e) => e.status === 'confirmed');
  const totals: Record<Asset, number> = {
    BTC_TESTNET: 0,
    ETH_SEPOLIA: 0,
    BSC_TESTNET: 0,
  };
  for (const e of entries) totals[e.asset] += parseFloat(e.amount);
  return {
    BTC_TESTNET: totals.BTC_TESTNET.toFixed(8),
    ETH_SEPOLIA: totals.ETH_SEPOLIA.toFixed(6),
    BSC_TESTNET: totals.BSC_TESTNET.toFixed(6),
  };
}
