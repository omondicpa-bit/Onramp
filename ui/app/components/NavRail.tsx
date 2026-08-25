'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Overview' },
  { href: '/deposit', label: 'Deposit' },
  { href: '/ledger', label: 'Ledger' },
];

export function NavRail() {
  const pathname = usePathname();

  return (
    <nav
      className="w-52 shrink-0 border-r px-6 py-8 flex flex-col gap-8"
      style={{ borderColor: 'var(--color-hairline)' }}
    >
      <div className="font-display font-semibold text-lg tracking-tight">
        EPH Onramp
      </div>
      <ul className="flex flex-col gap-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block px-3 py-2 rounded-md text-sm transition-colors"
                style={{
                  color: active ? 'var(--color-ink)' : 'var(--color-muted)',
                  background: active ? 'var(--color-accent-soft)' : 'transparent',
                  fontWeight: active ? 500 : 400,
                }}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto">
        <span className="pill pending">testnet</span>
      </div>
    </nav>
  );
}
