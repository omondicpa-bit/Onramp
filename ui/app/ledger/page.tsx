import { getLedgerEntries, ASSET_LABELS } from '../lib/mockData';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LedgerPage() {
  const entries = getLedgerEntries();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Ledger</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Every entry is append-only. Balances on Overview are the sum of
          confirmed entries here — never edited directly.
        </p>
      </header>

      <div
        className="rounded-lg border px-5"
        style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-surface)' }}
      >
        {entries.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Nothing recorded yet.
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Entries appear here the moment the monitoring service detects
              a transaction to one of your deposit addresses — before it&apos;s
              even fully confirmed.
            </p>
          </div>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="ledger-row">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`status-dot ${e.status}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{ASSET_LABELS[e.asset]}</span>
                    <span className={`pill ${e.status}`}>{e.status}</span>
                  </div>
                  <p className="text-xs font-mono truncate" style={{ color: 'var(--color-muted)' }}>
                    {e.txHash ?? 'pending tx hash'} · {e.confirmations} conf ·{' '}
                    {formatDate(e.createdAt)}
                  </p>
                </div>
              </div>
              <span className="font-mono text-sm shrink-0 pl-4">{e.amount}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
