import { getBalances, getLedgerEntries, ASSET_LABELS, Asset } from './lib/mockData';

export default function OverviewPage() {
  const balances = getBalances();
  const entries = getLedgerEntries().slice(0, 4);
  const hasAny = Object.values(balances).some((b) => parseFloat(b) > 0);

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="text-sm mb-1" style={{ color: 'var(--color-muted)' }}>
          Confirmed balance across all assets
        </p>
        <h1 className="font-display text-5xl font-semibold tracking-tight">
          {hasAny ? '—' : '0.00000000'}
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
          Nothing collected yet — send testnet funds from{' '}
          <span className="font-mono">/deposit</span> to see this update live.
        </p>
      </header>

      <section>
        <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--color-muted)' }}>
          By asset
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(balances) as Asset[]).map((asset) => (
            <div
              key={asset}
              className="rounded-lg border p-4"
              style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-surface)' }}
            >
              <p className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
                {ASSET_LABELS[asset]}
              </p>
              <p className="font-mono text-lg">{balances[asset]}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
            Recent activity
          </h2>
          <a href="/ledger" className="text-sm" style={{ color: 'var(--color-accent)' }}>
            View ledger →
          </a>
        </div>
        <div
          className="rounded-lg border px-4"
          style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-surface)' }}
        >
          {entries.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                No deposits yet. This is expected — the monitoring service
                (Stage 3) hasn&apos;t been built yet, so nothing can be
                detected automatically.
              </p>
            </div>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="ledger-row">
                <div className="flex items-center gap-3">
                  <span className={`status-dot ${e.status}`} />
                  <span className="text-sm">{ASSET_LABELS[e.asset]}</span>
                </div>
                <span className="font-mono text-sm">{e.amount}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
