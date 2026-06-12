import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import OrbBackground from '../components/OrbBackground';
import Button from '../components/Button';

const features = [
  { icon: '🧠', title: 'AI Life Filter', desc: 'Paste anything — messages, news, emails. Lifen reads it against your goals and returns only what matters.' },
  { icon: '🎯', title: 'Daily Brief', desc: 'Every morning, a concise AI-generated list of 3–5 priorities based on your life profile.' },
  { icon: '⏳', title: 'Deep Work Mode', desc: 'Full-screen focus sessions that block distractions and track your deep work time.' },
  { icon: '📊', title: 'Weekly Reports', desc: 'See your focus time, habit streaks, and goal progress in beautiful charts.' },
];

function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay, duration: 0.6 }}
      className="glass rounded-2xl p-6 hover:border-indigo-500/30 transition-colors duration-300">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const scrollToFeatures = () => featuresRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#0D0B2A]">
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <OrbBackground />
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl font-bold gradient-text">Lifen</motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log in</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>Get started</Button>
          </motion.div>
        </nav>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <motion.h1 className="text-7xl md:text-9xl font-bold tracking-tight mb-4" style={{ fontWeight: 800 }}>
              <span className="gradient-text">Lifen</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-white/60 mb-2 font-light tracking-wide">Making life feel real.</motion.p>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="text-base text-white/35 mb-12 max-w-lg mx-auto">Your AI-powered life filter. Cut through the noise. Focus on what actually moves the needle.</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/signup')} className="glow">Start for free</Button>
              <Button variant="secondary" size="lg" onClick={scrollToFeatures}>See how it works</Button>
            </motion.div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 cursor-pointer" onClick={scrollToFeatures}>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full bg-indigo-500" />
          </motion.div>
        </motion.div>
      </section>
      <section ref={featuresRef} className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need to live intentionally</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Built for people who want to protect their attention and make real progress on what matters.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 0.1} />)}
          </div>
        </div>
      </section>
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10" />
        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-white mb-6">Ready to take your life back?</h2>
            <p className="text-white/50 mb-8">Join thousands reclaiming their focus and living with intention.</p>
            <Button size="lg" onClick={() => navigate('/signup')} className="glow">Get started — it's free</Button>
          </motion.div>
        </div>
      </section>
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-white/30 text-sm">
          <span className="gradient-text font-semibold text-base">Lifen</span>
          <span>Making life feel real.</span>
        </div>
      </footer>
    </div>
  );
}
