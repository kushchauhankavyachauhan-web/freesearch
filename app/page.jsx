"use client";
import Link from 'next/link';
import { useStore } from '../lib/store.js';
import RecycleMotif from '../components/RecycleMotif.jsx';
import { Card } from '../components/ui.jsx';

const QUICK_STATS = [
  { icon: '📱', label: 'Device categories', value: '17+' },
  { icon: '⚡', label: 'Earn points per scan', value: '10 pts' },
  { icon: '♻️', label: 'EPR-ready records', value: 'Instant' },
  { icon: '🌍', label: 'Dataset entries', value: '1,000+' },
];

export default function HomePage() {
  const { state } = useStore();
  const { points, badges, scannedDevices, recyclingHistory, marketplaceListings } = state;
  const badgeList = [
    { key: 'predictor', icon: '🔮', label: 'Predictor', desc: 'First scan completed' },
    { key: 'recycler', icon: '♻️', label: 'Recycler', desc: 'First item recycled' },
    { key: 'seller', icon: '🏪', label: 'Seller', desc: 'First listing created' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="relative bg-navy overflow-hidden min-h-[88vh] flex items-center">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'linear-gradient(rgba(47,199,168,1) 1px,transparent 1px),linear-gradient(90deg,rgba(47,199,168,1) 1px,transparent 1px)', backgroundSize: '44px 44px' }} />
        {/* Floating dots */}
        {[[12,15],[5,72],[88,30],[78,80],[93,55],[45,8]].map(([l,t],i) => (
          <div key={i} className="absolute w-2 h-2 rounded-full bg-mint opacity-40 animate-pulse-slow"
            style={{ left:`${l}%`, top:`${t}%`, animationDelay:`${i*0.5}s` }} />
        ))}

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="flex items-center gap-0.5 mb-8">
              <span className="text-4xl font-black text-white tracking-tight">SCRAP</span>
              <span className="text-4xl font-black text-mint tracking-tight">DEVIQ</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white leading-[0.95] mb-5">
              Turn E-Waste<br /><span className="text-mint">into IQ</span>
            </h1>
            <p className="text-2xl font-bold text-white/70 mb-3 tracking-wide">Predict. Resell. Prove it.</p>
            <p className="text-white/45 mb-10 max-w-md leading-relaxed">
              AI-powered lifecycle intelligence for every electronic device — from first scan to verified EPR disposal.
            </p>

            <div className="flex flex-wrap gap-3 mb-14">
              <Link href="/scan"
                className="px-8 py-4 bg-mint text-navy font-black rounded-2xl hover:bg-mint-light transition-all mint-glow text-lg">
                Scan a Device →
              </Link>
              <Link href="/leaderboard"
                className="px-8 py-4 border-2 border-mint/40 text-mint font-bold rounded-2xl hover:border-mint hover:bg-mint/10 transition-all text-lg">
                Leaderboard
              </Link>
            </div>

            {/* User stats */}
            <div className="flex flex-wrap gap-8">
              <div>
                <div className="text-3xl font-black text-mint">{points}</div>
                <div className="text-xs text-white/40 mt-0.5">Total Points</div>
              </div>
              <div>
                <div className="text-3xl font-black text-mint">{scannedDevices.length}</div>
                <div className="text-xs text-white/40 mt-0.5">Devices Scanned</div>
              </div>
              <div>
                <div className="text-3xl font-black text-mint">{recyclingHistory.length}</div>
                <div className="text-xs text-white/40 mt-0.5">Items Recycled</div>
              </div>
              <div>
                <div className="text-3xl font-black text-mint">{marketplaceListings.length}</div>
                <div className="text-xs text-white/40 mt-0.5">Listings</div>
              </div>
            </div>
          </div>

          {/* Right — motif */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-mint/5 blur-3xl scale-110" />
              <RecycleMotif size={340} className="animate-spin-slow opacity-95 drop-shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick stats strip */}
      <section className="bg-white border-b border-navy/8">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {QUICK_STATS.map((s,i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center text-xl">{s.icon}</div>
              <div>
                <div className="font-black text-navy">{s.value}</div>
                <div className="text-xs text-navy/50">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature layers */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="text-xs font-bold text-mint uppercase tracking-widest mb-3">What ScrapDevIQ Does</div>
          <h2 className="text-4xl font-black text-navy mb-4">4-Layer E-Waste Intelligence</h2>
          <p className="text-navy/55 text-lg max-w-2xl mx-auto">From prediction to proof — every step of your device's lifecycle, covered.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: '🔍', layer: '01', title: 'Predictive Scan', desc: 'Upload a photo. AI estimates months to e-waste and health status.', href: '/scan', pts: '10 pts' },
            { icon: '🔩', layer: '02', title: 'Component Scan', desc: 'See which parts are salvageable vs. ready for certified recycling.', href: '/devices', pts: 'Free' },
            { icon: '🛒', layer: '03', title: 'Marketplace', desc: 'List usable components for resale with auto-generated descriptions.', href: '/marketplace', pts: '20 pts' },
            { icon: '📋', layer: '04', title: 'EPR Records', desc: 'Verified recycling records for compliance — ESG-ready, fraud-proof.', href: '/history', pts: '30 pts' },
          ].map((f,i) => (
            <Link key={i} href={f.href}
              className="bg-white rounded-2xl p-7 border border-navy/8 hover:shadow-md hover:-translate-y-1 transition-all group card-shadow">
              <div className="w-12 h-12 rounded-2xl bg-mint/10 flex items-center justify-center text-2xl mb-5">{f.icon}</div>
              <div className="text-xs font-bold text-mint uppercase tracking-widest mb-1">Layer {f.layer}</div>
              <h3 className="text-xl font-bold text-navy mb-2">{f.title}</h3>
              <p className="text-navy/55 text-sm leading-relaxed mb-5">{f.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-mint/10 text-mint px-2 py-0.5 rounded-full font-semibold">{f.pts}</span>
                <span className="text-mint font-bold text-sm group-hover:translate-x-1 transition-transform">Open →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Badges section */}
      <section className="pb-20 max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-black text-navy mb-6">Your Badges</h2>
        <div className="grid grid-cols-3 gap-5">
          {badgeList.map(b => (
            <Card key={b.key} className={`p-6 text-center transition-all ${badges[b.key] ? 'border-mint/30' : 'opacity-50'}`}>
              <div className="text-4xl mb-2">{b.icon}</div>
              <div className="font-bold text-navy">{b.label}</div>
              <div className="text-xs text-navy/50 mt-1">{b.desc}</div>
              {badges[b.key] && <div className="mt-3 text-xs bg-mint/10 text-mint px-2 py-0.5 rounded-full font-semibold inline-block">Earned!</div>}
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-navy py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4">How It Works</h2>
          <p className="text-white/45 mb-16 text-lg">Three steps. No setup needed.</p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { n:'01', t:'Scan Your Device', d:'Drop a photo. Our simulated AI matches it against 1,000+ Indian household device profiles and returns a lifecycle estimate.' },
              { n:'02', t:'Get Matched & Scored', d:'See component-level breakdown, resale value in INR, EPR category, and months-remaining estimate.' },
              { n:'03', t:'Dispose Responsibly', d:'Generate a verified EPR record for unusable components. Download your compliance history for ESG reporting.' },
            ].map((s,i) => (
              <div key={i} className="text-left">
                <div className="text-6xl font-black text-mint/20 mb-4">{s.n}</div>
                <h3 className="text-xl font-bold text-white mb-3">{s.t}</h3>
                <p className="text-white/45 leading-relaxed text-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-bg border-t border-navy/10 py-8 text-center">
        <div className="flex justify-center items-center gap-0.5 mb-2">
          <span className="text-lg font-black text-navy">SCRAP</span>
          <span className="text-lg font-black text-mint">DEVIQ</span>
        </div>
        <p className="text-navy/40 text-sm">AI-powered e-waste lifecycle platform · Zero setup · EPR-ready © 2025</p>
      </footer>
    </div>
  );
}
