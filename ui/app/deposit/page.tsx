'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { depositAddresses, ASSET_LABELS, Asset } from '../lib/mockData';

export default function DepositPage() {
  const [active, setActive] = useState<Asset>('BTC_TESTNET');
  const [copied, setCopied] = useState(false);

  const current = depositAddresses.find((d) => d.asset === active)!;

  function handleCopy() {
    navigator.clipboard.writeText(current.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-8 max-w-md">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Deposit</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Each asset has its own permanent address, derived from your wallet.
          Sending to the wrong network will not credit your balance.
        </p>
      </header>

      <div className="flex gap-2">
        {depositAddresses.map((d) => (
          <button
            key={d.asset}
            onClick={() => setActive(d.asset)}
            className="px-3 py-1.5 rounded-md text-sm transition-colors"
            style={{
              background: active === d.asset ? 'var(--color-ink)' : 'transparent',
              color: active === d.asset ? '#fff' : 'var(--color-muted)',
              border: `1px solid ${active === d.asset ? 'var(--color-ink)' : 'var(--color-hairline)'}`,
            }}
          >
            {d.asset.split('_')[0]}
          </button>
        ))}
      </div>

      <div
        className="rounded-lg border p-6 flex flex-col items-center gap-5"
        style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-surface)' }}
      >
        <span className="pill pending">awaiting deposit</span>

        <div className="p-3 rounded-md bg-white border" style={{ borderColor: 'var(--color-hairline)' }}>
          <QRCodeSVG value={current.address} size={168} />
        </div>

        <div className="w-full">
          <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>
            {ASSET_LABELS[active]} deposit address
          </p>
          <div
            className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
            style={{ borderColor: 'var(--color-hairline)' }}
          >
            <span className="font-mono text-xs break-all">{current.address}</span>
            <button
              onClick={handleCopy}
              className="shrink-0 text-xs px-2 py-1 rounded"
              style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
        &quot;Awaiting deposit&quot; is a placeholder — live status will
        appear here once the monitoring service (Stage 3) is watching this
        address.
      </p>
    </div>
  );
}
