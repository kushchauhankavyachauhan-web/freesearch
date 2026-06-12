import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { setAuth } from '../lib/auth';
import Button from '../components/Button';
import OrbBackground from '../components/OrbBackground';

export default function Auth({ mode = 'login' }) {
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = isLogin ? await api.auth.login({ email: form.email, password: form.password }) : await api.auth.signup(form);
      setAuth(res.token, res.user);
      navigate(isLogin ? '/dashboard' : '/onboarding');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0D0B2A] flex items-center justify-center relative overflow-hidden px-4">
      <OrbBackground />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold gradient-text">Lifen</Link>
          <p className="text-white/50 mt-2">{isLogin ? 'Welcome back.' : 'Create your account.'}</p>
        </div>
        <div className="glass rounded-2xl p-8">
          {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-red-400 text-sm">{error}</motion.div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div><label className="block text-sm text-white/60 mb-1.5">Name</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-indigo-500 transition-colors" /></div>
            )}
            <div><label className="block text-sm text-white/60 mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-indigo-500 transition-colors" /></div>
            <div><label className="block text-sm text-white/60 mb-1.5">Password</label>
              <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-indigo-500 transition-colors" /></div>
            <Button type="submit" className="w-full mt-2" disabled={loading} size="lg">{loading ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</Button>
          </form>
          <p className="text-center text-white/40 text-sm mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/signup' : '/login'} className="text-indigo-400 hover:text-indigo-300 transition-colors">{isLogin ? 'Sign up' : 'Log in'}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
