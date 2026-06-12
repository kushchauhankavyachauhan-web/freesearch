import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Button from '../components/Button';

const PRESETS = [25, 45, 60, 90];
const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

export default function DeepWork() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(25);
  const [left, setLeft] = useState(25*60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [task, setTask] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    if (running) { timer.current = setInterval(() => setLeft(s => { if (s<=1){clearInterval(timer.current);setRunning(false);setDone(true);return 0;} return s-1; }), 1000); }
    return () => clearInterval(timer.current);
  }, [running]);

  useEffect(() => { if (done) api.focus.log(duration).catch(()=>{}); }, [done, duration]);

  const start = () => { setLeft(duration*60); setDone(false); setRunning(true); };
  const circumference = 2*Math.PI*120;
  const progress = 1 - left/(duration*60);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="min-h-screen bg-[#060416] flex flex-col items-center justify-center relative overflow-hidden">
      {Array.from({length:30}).map((_,i)=>(<div key={i} className="absolute w-1 h-1 rounded-full bg-indigo-500/30 animate-pulse" style={{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,animationDelay:`${Math.random()*4}s`}} />))}
      <button onClick={()=>navigate('/dashboard')} className="absolute top-6 left-6 text-white/30 hover:text-white/70 transition-colors text-sm">← Dashboard</button>
      <div className="relative z-10 flex flex-col items-center">
        <AnimatePresence>{!running&&!done&&(
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="mb-8 w-64">
            <input type="text" value={task} onChange={e=>setTask(e.target.value)} placeholder="What are you working on?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 focus:outline-none focus:border-indigo-500/50 text-center text-sm" />
          </motion.div>
        )}</AnimatePresence>
        {task&&(running||done)&&<motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-white/40 text-sm mb-8 tracking-wide">{task}</motion.p>}
        <div className="relative w-72 h-72 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
            <motion.circle cx="130" cy="130" r="120" fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference*(1-progress)} transition={{duration:0.5}} style={{filter:'drop-shadow(0 0 12px #4F46E5)'}} />
          </svg>
          <div className="text-center">
            <AnimatePresence mode="wait">
              {done?(<motion.div key="done" initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} className="text-center"><div className="text-6xl mb-2">🎯</div><p className="text-white font-semibold">Done!</p><p className="text-white/40 text-sm">{duration}m complete</p></motion.div>)
                :(<motion.div key="timer"><div className="text-6xl font-light text-white tracking-tight">{fmt(left)}</div><div className="text-white/30 text-xs mt-2 uppercase tracking-widest">{running?'Focus':'Ready'}</div></motion.div>)}
            </AnimatePresence>
          </div>
        </div>
        {!running&&!done&&<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="flex gap-2 mt-8 mb-6">
          {PRESETS.map(m=>(<button key={m} onClick={()=>{if(!running){setDuration(m);setLeft(m*60);setDone(false);}}} className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${duration===m?'bg-indigo-600 text-white':'text-white/40 border border-white/10 hover:text-white hover:border-white/30'}`}>{m}m</button>))}
        </motion.div>}
        <div className="flex gap-3 mt-4">
          {!running&&!done&&<Button onClick={start} size="lg" className="px-12 glow">Start</Button>}
          {running&&<Button onClick={()=>setRunning(false)} variant="secondary" size="lg">Pause</Button>}
          {!running&&left<duration*60&&!done&&<Button onClick={()=>setRunning(true)} size="lg">Resume</Button>}
          {(running||(!running&&left<duration*60))&&!done&&<Button onClick={()=>{clearInterval(timer.current);setRunning(false);setDone(false);setLeft(duration*60);}} variant="ghost" size="lg">Reset</Button>}
          {done&&<><Button onClick={start} size="lg">Another round</Button><Button variant="secondary" size="lg" onClick={()=>navigate('/dashboard')}>Back</Button></>}
        </div>
      </div>
    </motion.div>
  );
}
