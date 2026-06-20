import { Link } from 'react-router-dom';
import RecycleMotif from '../../components/scrapdeviq/RecycleMotif';

const features = [
  {
    icon: '🔍',
    title: 'Predictive Scan',
    desc: 'Upload a photo. AI tells you months until e-waste and device health status.',
    to: '/scan',
    color: 'bg-mint/10 border-mint/20',
  },
  {
    icon: '♻️',
    title: 'Smart Resale Matcher',
    desc: 'AI matches your aging device to the best resale channels and estimated payout.',
    to: '/resale',
    color: 'bg-navy/5 border-navy/10',
  },
  {
    icon: '🌍',
    title: 'Impact Dashboard',
    desc: 'Track your carbon saved, metals recovered, and waste diverted in real time.',
    to: '/impact',
    color: 'bg-mint/10 border-mint/20',
  },
  {
    icon: '📋',
    title: 'Proof of Disposal',
    desc: 'Generate a verified certificate for responsible e-waste disposal. ESG-ready.',
    to: '/proof',
    color: 'bg-navy/5 border-navy/10',
  },
];

const stats = [
  { value: '53.6M', label: 'tonnes of e-waste per year globally' },
  { value: '17.4%', label: 'formally recycled — rest ends in landfills' },
  { value: '$57B', label: 'raw material value discarded annually' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg pt-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-navy min-h-[92vh] flex items-center">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(47,199,168,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(47,199,168,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating circuit dots */}
        {[
          { top: '15%', left: '8%' }, { top: '72%', left: '5%' },
          { top: '30%', left: '85%' }, { top: '80%', left: '78%' },
          { top: '55%', left: '92%' }, { top: '20%', left: '45%' },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-mint opacity-40 pulse-mint"
            style={{ ...pos, animationDelay: `${i * 0.4}s` }}
          />
        ))}

        <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center py-24">
          {/* Left: Text */}
          <div>
            {/* Wordmark */}
            <div className="mb-8 flex items-center gap-1">
              <span className="text-3xl font-black tracking-tight text-white">SCRAP</span>
              <span className="text-3xl font-black tracking-tight text-mint">DEVIQ</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black text-white leading-none mb-6">
              Turn E-Waste<br />
              <span className="text-mint">into IQ</span>
            </h1>

            <p className="text-xl text-white/70 mb-2 font-semibold tracking-wide">
              Predict. Resell. Prove it.
            </p>
            <p className="text-white/50 mb-10 max-w-md leading-relaxed">
              AI-powered lifecycle intelligence for every electronic device — from first scan to verified disposal.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/scan"
                className="px-8 py-4 bg-mint text-navy font-bold rounded-xl hover:bg-mint-light transition-all mint-glow text-lg"
              >
                Scan a Device →
              </Link>
              <Link
                to="/impact"
                className="px-8 py-4 border-2 border-mint/40 text-mint font-bold rounded-xl hover:border-mint hover:bg-mint/10 transition-all text-lg"
              >
                View Impact
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-14 flex flex-wrap gap-8">
              {stats.map((s, i) => (
                <div key={i}>
                  <div className="text-2xl font-black text-mint">{s.value}</div>
                  <div className="text-xs text-white/40 mt-1 max-w-[120px] leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Recycle Motif */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-mint/5 blur-3xl" />
              <RecycleMotif size={360} className="spin-slow opacity-90 drop-shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-navy mb-4">
            4-Layer E-Waste Intelligence
          </h2>
          <p className="text-navy/60 text-lg max-w-2xl mx-auto">
            From prediction to proof — every step of your device's lifecycle, covered.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Link
              key={i}
              to={f.to}
              className={`card p-8 border ${f.color} hover:scale-105 hover:shadow-lg transition-all group`}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <div className="text-xs font-bold text-mint uppercase tracking-widest mb-2">
                Layer {i + 1}
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">{f.title}</h3>
              <p className="text-navy/60 text-sm leading-relaxed">{f.desc}</p>
              <div className="mt-6 text-mint font-semibold text-sm group-hover:translate-x-1 transition-transform">
                Open →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-navy py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4">
            How <span className="text-mint">ScrapDevIQ</span> Works
          </h2>
          <p className="text-white/50 mb-16 text-lg">Three steps. Zero guesswork.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Scan Your Device', desc: 'Upload a photo. Our AI model reads make, model, condition and estimates lifecycle stage.' },
              { step: '02', title: 'Get Matched & Scored', desc: 'Receive resale options, impact scores, and a predicted months-to-waste timeline.' },
              { step: '03', title: 'Dispose Responsibly', desc: 'Follow verified disposal paths and generate your Proof-of-Disposal certificate.' },
            ].map((item, i) => (
              <div key={i} className="text-left">
                <div className="text-6xl font-black text-mint/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg border-t border-navy/10 py-10 text-center">
        <div className="flex justify-center items-center gap-1 mb-2">
          <span className="text-lg font-black text-navy">SCRAP</span>
          <span className="text-lg font-black text-mint">DEVIQ</span>
        </div>
        <p className="text-navy/40 text-sm">AI-powered e-waste lifecycle platform. © 2025</p>
      </footer>
    </div>
  );
}
