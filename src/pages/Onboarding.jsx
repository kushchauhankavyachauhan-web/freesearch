import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Button from '../components/Button';
import OrbBackground from '../components/OrbBackground';

const SUGGESTIONS = ['Build my business','Get fit & healthy','Learn a new skill','Write a book','Improve relationships','Financial freedom','Launch a product','Read more','Travel the world'];

function Step1({ data, onChange }) {
  const [input, setInput] = useState('');
  const add = (g) => { if (data.goals.length < 3 && !data.goals.includes(g)) onChange({ goals: [...data.goals, g] }); };
  const remove = (g) => onChange({ goals: data.goals.filter(x => x !== g) });
  const handleAdd = () => { if (input.trim() && data.goals.length < 3) { add(input.trim()); setInput(''); } };
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">What are your top 3 goals?</h2>
      <p className="text-white/50 mb-6">These help Lifen filter what actually matters.</p>
      <div className="flex gap-2 mb-4">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&handleAdd()} placeholder="Type a goal..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-indigo-500" />
        <Button onClick={handleAdd} disabled={data.goals.length>=3||!input.trim()}>Add</Button>
      </div>
      {data.goals.length > 0 && <div className="flex flex-wrap gap-2 mb-6">{data.goals.map(g => <motion.span key={g} initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} className="flex items-center gap-2 bg-indigo-600/30 border border-indigo-500/40 rounded-full px-4 py-1.5 text-sm text-white">{g}<button onClick={()=>remove(g)} className="text-white/40 hover:text-white ml-1">×</button></motion.span>)}</div>}
      <p className="text-white/30 text-xs mb-3">Or choose:</p>
      <div className="flex flex-wrap gap-2">{SUGGESTIONS.filter(s=>!data.goals.includes(s)).map(s=><button key={s} onClick={()=>add(s)} disabled={data.goals.length>=3} className="px-3 py-1.5 rounded-full text-sm border border-white/10 text-white/50 hover:border-indigo-500/50 hover:text-white transition-colors disabled:opacity-30">{s}</button>)}</div>
    </div>
  );
}

function Step2({ data, onChange }) {
  const [input, setInput] = useState('');
  const add = () => { if (input.trim()&&!data.priority_people.includes(input.trim())) { onChange({ priority_people: [...data.priority_people, input.trim()] }); setInput(''); } };
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Who are your priority people?</h2>
      <p className="text-white/50 mb-6">Messages from these people always surface in your Daily Brief.</p>
      <div className="flex gap-2 mb-4">
        <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Name or relationship..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-indigo-500" />
        <Button onClick={add} disabled={!input.trim()}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">{data.priority_people.map(p=><motion.span key={p} initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} className="flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 rounded-full px-4 py-1.5 text-sm text-white"><span className="w-5 h-5 rounded-full bg-purple-500/40 flex items-center justify-center text-xs">{p[0].toUpperCase()}</span>{p}<button onClick={()=>onChange({priority_people:data.priority_people.filter(x=>x!==p)})} className="text-white/40 hover:text-white">×</button></motion.span>)}</div>
      {data.priority_people.length===0&&<p className="text-white/25 text-sm mt-4">You can skip this and add people later.</p>}
    </div>
  );
}

function Step3({ data, onChange }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">When is your deep work time?</h2>
      <p className="text-white/50 mb-8">Lifen will protect this window and help you track it.</p>
      <div className="grid grid-cols-2 gap-6">
        <div><label className="block text-sm text-white/60 mb-2">Start</label><input type="time" value={data.deep_work_start} onChange={e=>onChange({deep_work_start:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" /></div>
        <div><label className="block text-sm text-white/60 mb-2">End</label><input type="time" value={data.deep_work_end} onChange={e=>onChange({deep_work_end:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" /></div>
      </div>
      <div className="mt-6 glass-strong rounded-xl p-4"><p className="text-white/60 text-sm">⏰ Deep work: <span className="text-white font-medium">{data.deep_work_start} – {data.deep_work_end}</span></p></div>
    </div>
  );
}

const steps = [Step1, Step2, Step3];
const stepLabels = ['Goals', 'People', 'Focus time'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ goals: [], priority_people: [], deep_work_start: '09:00', deep_work_end: '12:00' });
  const StepComponent = steps[step];
  const isLast = step === steps.length - 1;
  const next = async () => {
    if (isLast) { setSaving(true); try { await api.profile.update(profile); } catch {} finally { navigate('/dashboard'); setSaving(false); } }
    else setStep(s => s + 1);
  };
  return (
    <div className="min-h-screen bg-[#0D0B2A] flex items-center justify-center relative overflow-hidden px-4">
      <OrbBackground />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold gradient-text mb-6">Lifen</div>
          <div className="flex items-center justify-center gap-2 mb-2">
            {steps.map((_,i) => (<div key={i} className="flex items-center gap-2">
              <motion.div animate={{ backgroundColor: i<=step?'#4F46E5':'rgba(255,255,255,0.1)', scale: i===step?1.1:1 }} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white">{i<step?'✓':i+1}</motion.div>
              {i<steps.length-1&&<div className={`w-12 h-0.5 ${i<step?'bg-indigo-500':'bg-white/10'} transition-colors`} />}
            </div>))}
          </div>
          <p className="text-white/40 text-sm">{stepLabels[step]}</p>
        </div>
        <div className="glass rounded-2xl p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <StepComponent data={profile} onChange={updates => setProfile(p => ({ ...p, ...updates }))} />
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => step>0?setStep(s=>s-1):navigate('/dashboard')}>{step>0?'Back':'Skip setup'}</Button>
            <Button onClick={next} disabled={saving}>{saving?'Saving…':isLast?'Go to dashboard →':'Continue →'}</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
