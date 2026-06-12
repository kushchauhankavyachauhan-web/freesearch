import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Button from '../components/Button';

const PRESETS = [25, 45, 60, 90];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function FloatingParticle({ index }) {
  const style = {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 4}s`,
    animationDuration: `${4 + Math.random() * 4}s`,
  };

  return (
    <div
      className="absolute w-1 h-1 rounded-full bg-indigo-500/30 animate-pulse"
      style={style}
    />
  );
}

export default function DeepWork() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [task, setTask] = useState('');
  const intervalRef = useRef(null);
  const startSecondsRef = useRef(25 * 60);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setCompleted(true);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (completed) {
      api.focus.log(duration).catch(() => {});
    }
  }, [completed, duration]);

  const start = () => {
    startSecondsRef.current = duration * 60;
    setSecondsLeft(duration * 60);
    setCompleted(false);
    setRunning(true);
  };

  const pause = () => setRunning(false);
  const resume = () => setRunning(true);

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setCompleted(false);
    setSecondsLeft(duration * 60);
  };

  const selectPreset = (min) => {
    if (!running) {
      setDuration(min);
      setSecondsLeft(min * 60);
      setCompleted(false);
    }
  };

  const progress = 1 - secondsLeft / (duration * 60);
  const circumference = 2 * Math.PI * 120;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#060416] flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Minimal particle bg */}
      {Array.from({ length: 30 }).map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))}

      {/* Back */}
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-6 left-6 text-white/30 hover:text-white/70 transition-colors text-sm"
      >
        ← Dashboard
      </button>

      <div className="relative z-10 flex flex-col items-center">
        {/* Task label */}
        <AnimatePresence>
          {!running && !completed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 w-64"
            >
              <input
                type="text"
                value={task}
                onChange={e => setTask(e.target.value)}
                placeholder="What are you working on?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 focus:outline-none focus:border-indigo-500/50 text-center text-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {task && (running || completed) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/40 text-sm mb-8 tracking-wide"
          >
            {task}
          </motion.p>
        )}

        {/* Circle timer */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
            <motion.circle
              cx="130" cy="130" r="120"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              transition={{ duration: 0.5 }}
              style={{ filter: 'drop-shadow(0 0 12px #4F46E5)' }}
            />
          </svg>

          <div className="text-center">
            <AnimatePresence mode="wait">
              {completed ? (
                <motion.div
                  key="done"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-2">🎯</div>
                  <p className="text-white font-semibold">Done!</p>
                  <p className="text-white/40 text-sm">{duration}m session complete</p>
                </motion.div>
              ) : (
                <motion.div key="timer">
                  <div className="text-6xl font-light text-white tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatTime(secondsLeft)}
                  </div>
                  <div className="text-white/30 text-xs mt-2 uppercase tracking-widest">
                    {running ? 'Focus' : 'Ready'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Preset buttons */}
        {!running && !completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mt-8 mb-6"
          >
            {PRESETS.map(min => (
              <button
                key={min}
                onClick={() => selectPreset(min)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
                  duration === min
                    ? 'bg-indigo-600 text-white'
                    : 'text-white/40 border border-white/10 hover:text-white hover:border-white/30'
                }`}
              >
                {min}m
              </button>
            ))}
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex gap-3 mt-4">
          {!running && !completed && (
            <Button onClick={start} size="lg" className="px-12 glow">
              Start
            </Button>
          )}
          {running && (
            <Button onClick={pause} variant="secondary" size="lg">
              Pause
            </Button>
          )}
          {!running && secondsLeft < duration * 60 && !completed && (
            <Button onClick={resume} size="lg">Resume</Button>
          )}
          {(running || (!running && secondsLeft < duration * 60)) && !completed && (
            <Button onClick={reset} variant="ghost" size="lg">Reset</Button>
          )}
          {completed && (
            <>
              <Button onClick={start} size="lg">Another round</Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard')}>Back</Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
