import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpeech } from '../hooks/useSpeech';
import { api } from '../utils/api';
import SopDocument from '../components/SopDocument';
import ExportPanel from '../components/ExportPanel';

export default function Home() {
  const navigate = useNavigate();
  const { isRecording, transcript, error: speechError, isSupported, startRecording, stopRecording, clearTranscript, setTranscript } = useSpeech();
  const [inputMode, setInputMode] = useState('voice');
  const [textInput, setTextInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSop, setGeneratedSop] = useState(null);
  const [error, setError] = useState(null);
  const [dbId, setDbId] = useState(null);

  const activeTranscript = inputMode === 'voice' ? transcript : textInput;

  async function handleGenerate() {
    const text = activeTranscript.trim();
    if (!text) return;

    setIsGenerating(true);
    setError(null);
    try {
      const result = await api.generateSop(text, inputMode);
      setGeneratedSop(result.sop);
      setDbId(result.dbId);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleReset() {
    setGeneratedSop(null);
    setError(null);
    clearTranscript();
    setTextInput('');
    setDbId(null);
  }

  if (generatedSop) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{generatedSop.title}</h1>
            <p className="text-muted text-sm mt-1">{generatedSop.sopId} · v{generatedSop.version} · {generatedSop.department}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/history')} className="btn-ghost text-sm">
              View History
            </button>
            <button onClick={handleReset} className="btn-primary text-sm">
              + New SOP
            </button>
          </div>
        </div>

        <ExportPanel sop={generatedSop} dbId={dbId} />
        <SopDocument sop={generatedSop} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">
          Generate a <span className="text-accent">Professional SOP</span>
        </h1>
        <p className="text-muted text-lg">Speak or type your process — Claude will structure it into a complete SOP.</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-8 bg-surface rounded-xl p-1 border border-border">
        {[
          { id: 'voice', label: '🎙 Voice', desc: 'Speak your process' },
          { id: 'text', label: '✏️ Text', desc: 'Type it out' }
        ].map(({ id, label, desc }) => (
          <button
            key={id}
            onClick={() => { setInputMode(id); setError(null); clearTranscript(); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              inputMode === id ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-gray-300'
            }`}
          >
            {label}
            <span className="text-xs block opacity-70">{desc}</span>
          </button>
        ))}
      </div>

      {inputMode === 'voice' ? (
        <VoiceInput
          isRecording={isRecording}
          transcript={transcript}
          error={speechError}
          isSupported={isSupported}
          onStart={startRecording}
          onStop={stopRecording}
          onClear={clearTranscript}
        />
      ) : (
        <TextInput value={textInput} onChange={setTextInput} />
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!activeTranscript.trim() || isGenerating}
        className="btn-primary w-full mt-6 py-3 text-base relative overflow-hidden"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <SpinnerIcon />
            Generating SOP with Claude...
          </span>
        ) : (
          '✨ Generate SOP'
        )}
      </button>

      {activeTranscript && !isGenerating && (
        <p className="text-center text-xs text-muted mt-3">
          {activeTranscript.split(' ').length} words · Ready to generate
        </p>
      )}
    </div>
  );
}

function VoiceInput({ isRecording, transcript, error, isSupported, onStart, onStop, onClear }) {
  return (
    <div className="text-center">
      {!isSupported && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
          Speech recognition requires Chrome. Switch to Text mode to continue.
        </div>
      )}

      <div className="flex justify-center mb-6">
        <div className="relative">
          {isRecording && <div className="recording-pulse absolute inset-0 rounded-full" />}
          <button
            onClick={isRecording ? onStop : onStart}
            disabled={!isSupported}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-40 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 scale-110'
                : 'bg-accent hover:bg-accent-dark shadow-lg shadow-accent/30 hover:scale-105'
            }`}
          >
            {isRecording ? (
              <StopIcon />
            ) : (
              <MicIcon />
            )}
          </button>
        </div>
      </div>

      {isRecording && (
        <div className="flex items-center justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="wave-bar"
              style={{ animationDelay: `${i * 0.15}s`, height: '6px' }}
            />
          ))}
          <span className="ml-2 text-red-400 text-sm font-medium">Recording...</span>
        </div>
      )}

      {!isRecording && !transcript && (
        <p className="text-muted text-sm">Tap the mic and describe your process in natural language</p>
      )}

      {(transcript || error) && (
        <div className="mt-4 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted font-medium uppercase tracking-wide">Transcript</span>
            <button onClick={onClear} className="text-xs text-muted hover:text-white transition-colors">Clear</button>
          </div>
          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
          <div className="card p-4 text-sm text-gray-300 leading-relaxed min-h-[100px] whitespace-pre-wrap">
            {transcript || <span className="text-muted italic">Your speech will appear here...</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function TextInput({ value, onChange }) {
  return (
    <div>
      <label className="label">Describe your process</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Example: Every Monday morning, our team lead reviews the sprint backlog. First, they pull up Jira and filter tickets by priority. Then they assign story points based on complexity estimates from the last retro..."
        className="input min-h-[220px] resize-none"
      />
      <p className="text-xs text-muted mt-2">Be descriptive — the more detail you provide, the better your SOP will be.</p>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
      <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="8" y1="22" x2="16" y2="22"/>
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
      <rect x="6" y="6" width="12" height="12" rx="2"/>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
    </svg>
  );
}
