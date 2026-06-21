"use client";
import { useState, useRef } from 'react';
import { Card, SectionHeader, MintButton, NavyButton, HazardBadge } from '../../components/ui.jsx';

const RECYCLABILITY_COLOR = {
  High: 'text-green-600 bg-green-50 border-green-200',
  Medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  Low: 'text-red-600 bg-red-50 border-red-200',
};

const CONFIDENCE_COLOR = {
  High: 'text-green-600',
  Medium: 'text-yellow-600',
  Low: 'text-red-500',
};

const CONFIDENCE_ICON = { High: '✓', Medium: '~', Low: '?' };

export default function IdentifyPage() {
  const [phase, setPhase] = useState('idle'); // idle | analyzing | result | error
  const [imageUrl, setImageUrl] = useState(null);
  const [drag, setDrag] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedAlt, setSelectedAlt] = useState(null);
  const inputRef = useRef();

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResult(null);
    setError('');
    setSelectedAlt(null);
    setPhase('analyzing');
    analyze(file);
  }

  async function analyze(file) {
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setResult(data);
      setPhase('result');
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function reset() {
    setPhase('idle');
    setImageUrl(null);
    setResult(null);
    setError('');
    setSelectedAlt(null);
  }

  const displayEntry = selectedAlt || result?.catalogMatch;

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          label="AI Vision"
          title="Identify E-Waste Item"
          sub="Upload a photo — Claude AI identifies the item and fetches its scrap value, recyclability, and disposal instructions."
        />

        {/* Upload zone */}
        {phase === 'idle' && (
          <Card className="p-8 mb-8">
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => inputRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
                drag ? 'border-mint bg-mint/5' : 'border-navy/20 hover:border-mint hover:bg-mint/5'
              }`}
            >
              <div className="text-6xl mb-4">🔍</div>
              <p className="font-bold text-navy text-lg mb-1">Drop a photo here to identify it</p>
              <p className="text-navy/45 text-sm mb-1">or click to browse</p>
              <p className="text-navy/30 text-xs">JPG · PNG · WEBP</p>
            </div>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => handleFile(e.target.files[0])} />
            <div className="mt-5 p-4 bg-mint/5 border border-mint/20 rounded-xl">
              <p className="text-xs text-navy/60 text-center">
                <span className="font-bold text-mint">Claude claude-sonnet-4-6 Vision</span> — AI analyzes your image and matches it to our 1000+ item e-waste catalog with scrap values in INR.
              </p>
            </div>
          </Card>
        )}

        {/* Analyzing */}
        {phase === 'analyzing' && (
          <Card className="p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative overflow-hidden rounded-2xl bg-navy" style={{ minHeight: 260 }}>
                {imageUrl && (
                  <img src={imageUrl} alt="Uploading" className="w-full h-64 object-cover opacity-40" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-mint/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-mint border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-mint/20" />
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
                  </div>
                  <p className="text-mint font-bold text-sm">Analyzing with Claude AI...</p>
                  <p className="text-mint/50 text-xs mt-1">This may take a few seconds</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-navy text-xl mb-4">Claude Vision is working</h3>
                <div className="space-y-3">
                  {['Sending image to Claude API...', 'Identifying item type...', 'Classifying e-waste category...', 'Matching catalog entry...', 'Fetching scrap values...'].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-mint animate-pulse bg-mint/10 shrink-0" />
                      <span className="text-sm text-navy/60">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Error */}
        {phase === 'error' && (
          <Card className="p-8 mb-8 border-red-200">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-bold text-navy text-lg mb-2">Identification Failed</h3>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <p className="text-navy/50 text-xs mb-4">Make sure ANTHROPIC_API_KEY is set in your environment.</p>
                <MintButton onClick={reset}>Try Again</MintButton>
              </div>
            </div>
          </Card>
        )}

        {/* Result */}
        {phase === 'result' && result && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-sm font-semibold text-navy/50">Identification complete</span>
              <button onClick={reset} className="text-sm text-navy/50 hover:text-navy underline">Identify another</button>
            </div>

            {/* AI result banner */}
            <div className="flex items-center gap-3 p-4 bg-navy rounded-xl flex-wrap">
              <div className="w-10 h-10 rounded-lg bg-mint flex items-center justify-center text-white text-xl shrink-0">🤖</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-mint font-bold uppercase tracking-wider mb-0.5">Claude AI Identified</div>
                <div className="text-white font-bold text-lg leading-snug">{result.itemName}</div>
                {result.confidenceReason && (
                  <div className="text-white/50 text-xs mt-0.5">{result.confidenceReason}</div>
                )}
              </div>
              <div className="shrink-0 text-right">
                <div className={`font-bold text-lg ${CONFIDENCE_COLOR[result.confidence] || 'text-white'}`}>
                  {CONFIDENCE_ICON[result.confidence]} {result.confidence}
                </div>
                <div className="text-white/40 text-xs">confidence</div>
              </div>
            </div>

            {/* Low confidence fallback */}
            {result.confidence === 'Low' && (
              <Card className="p-5 border-yellow-200 bg-yellow-50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤔</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-navy mb-1">Not fully sure — did you mean one of these?</h4>
                    <p className="text-navy/60 text-xs mb-3">Claude wasn't confident. Select the closest match below to see its catalog details.</p>
                    <div className="flex flex-wrap gap-2">
                      {(result.alternatives?.length ? result.alternatives : [result.itemName]).map((alt, i) => {
                        const matchEntry = result.catalogAlternatives?.[i] || result.catalogMatch;
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedAlt(matchEntry)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                              selectedAlt === matchEntry
                                ? 'bg-mint text-white border-mint'
                                : 'bg-white text-navy border-navy/20 hover:border-mint'
                            }`}
                          >
                            {alt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              {/* Image preview */}
              <Card className="p-5">
                {imageUrl && (
                  <img src={imageUrl} alt="Identified item" className="w-full h-52 object-cover rounded-xl mb-4" />
                )}
                <div className="text-xs text-navy/40 font-semibold uppercase tracking-wider mb-1">{result.category}</div>
                <h2 className="font-black text-navy text-xl leading-snug">{result.itemName}</h2>
              </Card>

              {/* Catalog match */}
              {displayEntry ? (
                <Card className="p-5">
                  <div className="text-xs text-mint font-bold uppercase tracking-wider mb-3">Catalog Match</div>
                  <h3 className="font-black text-navy text-lg mb-1">{displayEntry.subCategory}</h3>
                  <p className="text-navy/50 text-xs mb-4">{displayEntry.category}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-bg rounded-xl p-3">
                      <div className="text-base mb-1">💰</div>
                      <div className="text-xs text-navy/45 font-semibold mb-0.5">Scrap Value (INR)</div>
                      <div className="font-bold text-navy text-sm">
                        ₹{displayEntry.estimatedScrapValue?.min} – ₹{displayEntry.estimatedScrapValue?.max}
                      </div>
                    </div>
                    <div className="bg-bg rounded-xl p-3">
                      <div className="text-base mb-1">♻️</div>
                      <div className="text-xs text-navy/45 font-semibold mb-0.5">Recyclability</div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${RECYCLABILITY_COLOR[displayEntry.recyclability] || ''}`}>
                        {displayEntry.recyclability}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap mb-4">
                    <HazardBadge level={displayEntry.hazardLevel} />
                  </div>

                  {displayEntry.commonMaterials?.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-navy/40 font-semibold mb-1.5">Common Materials</div>
                      <div className="flex flex-wrap gap-1.5">
                        {displayEntry.commonMaterials.map((m, i) => (
                          <span key={i} className="text-xs bg-navy/5 text-navy/70 px-2 py-0.5 rounded-full">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-5 flex flex-col items-center justify-center text-center">
                  <div className="text-4xl opacity-30 mb-3">📋</div>
                  <p className="font-bold text-navy mb-1">No catalog match</p>
                  <p className="text-navy/50 text-xs">This item may be too niche. Try a clearer photo or different angle.</p>
                </Card>
              )}
            </div>

            {/* Disposal notes */}
            {displayEntry?.disposalNotes && (
              <Card className="p-5 border-orange-200 bg-orange-50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">⚠️</span>
                  <div>
                    <h4 className="font-bold text-navy mb-1">Disposal Instructions</h4>
                    <p className="text-navy/70 text-sm leading-relaxed">{displayEntry.disposalNotes}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Other catalog alternatives */}
            {result.catalogAlternatives?.length > 0 && result.confidence !== 'Low' && (
              <Card className="p-5">
                <h4 className="font-bold text-navy mb-3 text-sm">Other possible matches</h4>
                <div className="space-y-2">
                  {result.catalogAlternatives.map((alt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedAlt(alt === selectedAlt ? null : alt)}
                      className={`w-full text-left flex items-center justify-between p-3 rounded-xl border transition-all ${
                        selectedAlt === alt
                          ? 'border-mint bg-mint/5'
                          : 'border-navy/10 hover:border-mint/40'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-navy text-sm">{alt.subCategory}</div>
                        <div className="text-xs text-navy/45">{alt.category}</div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <div className="text-xs font-bold text-mint">₹{alt.estimatedScrapValue?.min}–{alt.estimatedScrapValue?.max}</div>
                        <div className="text-xs text-navy/40">{alt.recyclability} recyclability</div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
