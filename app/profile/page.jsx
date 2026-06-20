"use client";
import Link from 'next/link';
import { useStore } from '../../lib/store.js';
import { Card, SectionHeader, MintButton } from '../../components/ui.jsx';

const BADGES = [
  { key: 'predictor', icon: '🔮', label: 'Predictor', desc: 'Completed your first predictive scan', pts: 10 },
  { key: 'recycler', icon: '♻️', label: 'Recycler', desc: 'Logged your first recycling record', pts: 30 },
  { key: 'seller', icon: '🏪', label: 'Seller', desc: 'Created your first marketplace listing', pts: 20 },
];

export default function ProfilePage() {
  const { state } = useStore();
  const { points, badges, scannedDevices, recyclingHistory, marketplaceListings, scanCount, listCount, recycleCount } = state;
  const earnedBadges = BADGES.filter(b => badges[b.key]);

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <SectionHeader label="Profile & Badges" title="Your Impact" />

        {/* Points hero */}
        <Card className="p-8 mb-6 bg-navy text-white text-center">
          <div className="w-20 h-20 rounded-full bg-mint/20 flex items-center justify-center text-4xl mx-auto mb-4">⚡</div>
          <div className="text-6xl font-black text-mint mb-1">{points}</div>
          <div className="text-white/60 text-lg mb-6">Total Points Earned</div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Scans', value: scanCount, icon: '🔍' },
              { label: 'Listings', value: listCount, icon: '🛒' },
              { label: 'Recycled', value: recycleCount, icon: '♻️' },
            ].map((s,i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-2xl font-black text-mint">{s.value}</div>
                <div className="text-xs text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Badges */}
        <h2 className="text-2xl font-black text-navy mb-4">Badges</h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {BADGES.map(b => (
            <Card key={b.key} className={`p-5 text-center transition-all ${badges[b.key] ? 'border-mint/40 shadow-md' : 'opacity-45 grayscale'}`}>
              <div className={`text-5xl mb-3 ${badges[b.key] ? '' : 'filter grayscale'}`}>{b.icon}</div>
              <div className="font-black text-navy text-base mb-1">{b.label}</div>
              <div className="text-xs text-navy/50 mb-3 leading-snug">{b.desc}</div>
              {badges[b.key] ? (
                <div className="text-xs bg-mint/10 text-mint px-2 py-1 rounded-full font-bold border border-mint/20">
                  Earned! +{b.pts}pts
                </div>
              ) : (
                <div className="text-xs bg-navy/8 text-navy/40 px-2 py-1 rounded-full font-semibold">
                  Locked
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Activity summary */}
        <h2 className="text-2xl font-black text-navy mb-4">Activity Summary</h2>
        <Card className="p-6 space-y-4 mb-8">
          {[
            { icon: '📱', label: 'Devices Scanned', value: scannedDevices.length, href: '/devices', action: 'View' },
            { icon: '🛒', label: 'Marketplace Listings', value: marketplaceListings.length, href: '/marketplace', action: 'View' },
            { icon: '📋', label: 'Recycling Records', value: recyclingHistory.length, href: '/history', action: 'View' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-navy/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-mint/10 flex items-center justify-center text-lg">{item.icon}</div>
                <span className="font-semibold text-navy text-sm">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-navy text-lg">{item.value}</span>
                <Link href={item.href} className="text-xs text-mint font-bold hover:underline">{item.action} →</Link>
              </div>
            </div>
          ))}
        </Card>

        {/* Points guide */}
        <Card className="p-6 bg-bg border border-mint/20">
          <h3 className="font-bold text-navy mb-4">How to Earn More Points</h3>
          <div className="space-y-2">
            {[
              { action: 'Scan a device', pts: 10 },
              { action: 'List a component for resale', pts: 20 },
              { action: 'Log a recycling record', pts: 30 },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-navy/8 last:border-0">
                <span className="text-sm text-navy/70">{row.action}</span>
                <span className="font-black text-mint">+{row.pts} pts</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/scan"><MintButton className="w-full">Start Scanning →</MintButton></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
