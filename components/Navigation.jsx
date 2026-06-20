"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../lib/store.js';

const CITIZEN_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/scan', label: 'Scan' },
  { href: '/devices', label: 'My Devices' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/history', label: 'History' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/profile', label: 'Profile' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { state, setViewMode } = useStore();
  const { viewMode, points, badges } = state;

  const badgeCount = Object.values(badges).filter(Boolean).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-navy/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5 shrink-0 select-none">
          <span className="text-lg font-black tracking-tight text-navy">SCRAP</span>
          <span className="text-lg font-black tracking-tight text-mint">DEVIQ</span>
        </Link>

        {/* Nav links — citizen only */}
        {viewMode === 'citizen' && (
          <div className="hidden md:flex items-center gap-0.5 overflow-x-auto">
            {CITIZEN_LINKS.map(l => (
              <Link key={l.href} href={l.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  pathname === l.href
                    ? 'bg-mint text-white'
                    : 'text-navy/70 hover:text-navy hover:bg-mint/10'
                }`}>
                {l.label}
              </Link>
            ))}
            <Link href="/brand"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                pathname === '/brand' ? 'bg-navy text-white' : 'text-navy/70 hover:text-navy hover:bg-navy/10'
              }`}>
              Brand View →
            </Link>
          </div>
        )}
        {viewMode === 'brand' && (
          <div className="hidden md:flex items-center gap-2">
            <Link href="/brand"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                pathname === '/brand' ? 'bg-navy text-white' : 'text-navy/70 hover:bg-navy/10'
              }`}>
              Brand Dashboard
            </Link>
            <Link href="/"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-navy/70 hover:text-navy hover:bg-mint/10">
              ← Citizen View
            </Link>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Points */}
          <div className="flex items-center gap-1.5 bg-mint/10 px-3 py-1.5 rounded-full">
            <span className="text-mint text-sm">⚡</span>
            <span className="font-bold text-navy text-xs">{points} pts</span>
          </div>
          {/* Badges */}
          {badgeCount > 0 && (
            <div className="w-6 h-6 bg-navy rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{badgeCount}</span>
            </div>
          )}
          {/* View toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'citizen' ? 'brand' : 'citizen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
              viewMode === 'brand'
                ? 'border-navy bg-navy text-white'
                : 'border-mint text-mint hover:bg-mint hover:text-white'
            }`}
          >
            {viewMode === 'citizen' ? 'Brand View' : 'Citizen View'}
          </button>
        </div>
      </div>

      {/* Mobile links */}
      {viewMode === 'citizen' && (
        <div className="md:hidden border-t border-navy/5 flex overflow-x-auto gap-0.5 px-3 py-1.5 bg-white">
          {CITIZEN_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                pathname === l.href ? 'bg-mint text-white' : 'text-navy/60 hover:text-navy'
              }`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
