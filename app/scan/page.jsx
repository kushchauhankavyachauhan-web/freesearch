"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { scanFile, getStatus, mapLabelToCategory, getEntryByCategory } from '../../lib/scanner.js';
import { useStore } from '../../lib/store.js';
import { StatusBadge, HazardBadge, Card, MintButton, NavyButton, SectionHeader, PointsChip } from '../../components/ui.jsx';

const GEO_TAGS = ['Mumbai, MH','Delhi, DL','Bengaluru, KA','Chennai, TN','Hyderabad, TS','Pune, MH','Kolkata, WB','Jaipur, RJ','Lucknow, UP','Ahmedabad, GJ'];

const STEPS = [
  'Loading vision model...',
  'Preprocessing image...',
  'Running classification...',
  'Matching device database...',
  'Generating report...',
];

export default function ScanPage() {
  const router = useRouter();
  const { addScannedDevice, addListing, addRecord } = useStore();
  const [phase, setPhase] = useState('idle');
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);
  const [modelProgress, setModelProgress] = useState(0);
  const [detectedLabel, setDetectedLabel] = useState('');
  const [detectedCategory, setDetectedCategory] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [drag, setDrag] = useState(false);
  const [listedComponents, setListedComponents] = useState({});
  const [recycledComponents, setRecycledComponents] = useState({});
  const inputRef = useRef();

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResult(null);
    setStep(0);
    setModelProgress(0);
    setDetectedLabel('');
    setDetectedCategory('');
    setListedComponents({});
    setRecycledComponents({});
    setPhase('scanning');
    runAIScan(file, url);
  }

  async function runAIScan(file, url) {
    try {
      // Step 0: Load model
      setStep(0);
      const { pipeline, env } = await import('@xenova/transformers');
      env.allowLocalModels = false;

      let lastProgress = 0;
      const classifier = await pipeline(
        'image-classification',
        'Xenova/mobilenet-v2',
        {
          quantized: true,
          progress_callback: (p) => {
            if (p.status === 'downloading' || p.status === 'progress') {
              const pct = Math.round((p.loaded / (p.total || 1)) * 100);
              if (pct > lastProgress) { lastProgress = pct; setModelProgress(pct); }
            }
          },
        }
      );
      setModelProgress(100);

      // Step 1: Preprocess
      setStep(1);
      await new Promise(r => setTimeout(r, 400));

      // Step 2: Classify
      setStep(2);
      const results = await classifier(url, { topk: 5 });

      // Step 3: Map to category
      setStep(3);
      const topLabel = results[0]?.label || '';
      const topScore = results[0]?.score || 0;
      setDetectedLabel(topLabel);
      setConfidence(Math.round(topScore * 100));

      let matchedCategory = null;
      for (const r of results) {
        matchedCategory = mapLabelToCategory(r.label);
        if (matchedCategory) break;
      }
      setDetectedCategory(matchedCategory || 'Unknown');
      await new Promise(r => setTimeout(r, 500));

      // Step 4: Match dataset entry
      setStep(4);
      const seed = Math.abs(file.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + file.size);
      const entry = matchedCategory
        ? getEntryByCategory(matchedCategory, seed)
        : scanFile(file.name, file.size);

      const geoTag = GEO_TAGS[seed % GEO_TAGS.length];
      const finalEntry = { ...entry, geoTag };
      await new Promise(r => setTimeout(r, 400));

      addScannedDevice(finalEntry);
      setResult(finalEntry);
      setPhase('result');

    } catch (err) {
      console.error('AI scan failed, using fallback:', err);
      // Fallback to hash-based
      setStep(4);
      const seed = Math.abs((imageFile?.name || '').split('').reduce((a,c)=>a+c.charCodeAt(0),0) + (imageFile?.size||0));
      const entry = scanFile(imageFile?.name || 'unknown', imageFile?.size || 0);
      const geoTag = GEO_TAGS[seed % GEO_TAGS.length];
      addScannedDevice({ ...entry, geoTag });
      setResult({ ...entry, geoTag });
      setDetectedLabel('(fallback mode)');
      setPhase('result');
    }
  }

  function handleListComponent(comp) {
    addListing({
      componentName: comp.name,
      deviceName: result.deviceName,
      reason: comp.reason,
      estimatedValue: result.estimatedResaleValueINR,
      category: result.category,
      brandName: result.brandName,
    });
    setListedComponents(p => ({ ...p, [comp.name]: true }));
  }

  function handleRecycleComponent(comp) {
    addRecord({
      deviceName: result.deviceName,
      eprCategory: result.eprCategory,
      component: comp.name,
      brandName: result.brandName,
      geoTag: result.geoTag,
    });
    setRecycledComponents(p => ({ ...p, [comp.name]: true }));
  }

  function reset() {
    setPhase('idle');
    setResult(null);
    setImageUrl(null);
    setImageFile(null);
    setListedComponents({});
    setRecycledComponents({});
    setDetectedLabel('');
    setDetectedCategory('');
  }

  const status = result ? getStatus(result.predictedLifespanMonthsRemaining) : null;

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          label="Layer 1 & 2"
          title="Predictive + Component Scan"
          sub="Upload a device photo — real on-device AI (no API key) classifies it and matches our 1,000+ dataset."
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
              <div className="text-6xl mb-4">📷</div>
              <p className="font-bold text-navy text-lg mb-1">Drop a device photo here</p>
              <p className="text-navy/45 text-sm mb-1">or click to browse</p>
              <p className="text-navy/30 text-xs">JPG · PNG · WEBP</p>
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleFile(e.target.files[0])} />

            <div className="mt-5 p-4 bg-mint/5 border border-mint/20 rounded-xl">
              <p className="text-xs text-navy/60 text-center">
                <span className="font-bold text-mint">Real on-device AI</span> — MobileNet v2 runs in your browser via WebAssembly.
                No API key, no server, ~9MB model downloads once and is cached.
              </p>
            </div>
          </Card>
        )}

        {/* Scanning phase */}
        {phase === 'scanning' && (
          <Card className="p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative overflow-hidden rounded-2xl bg-navy" style={{ minHeight: 260 }}>
                {imageUrl && (
                  <img src={imageUrl} alt="Device" className="w-full h-64 object-cover opacity-40" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-mint/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-mint border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-mint/20" />
                  </div>
                  <div className="scan-line" />
                  <p className="text-mint font-bold text-sm mt-3">{STEPS[step]}</p>
                  {step === 0 && modelProgress < 100 && (
                    <p className="text-mint/60 text-xs mt-1">Downloading model: {modelProgress}%</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-navy text-xl mb-6">On-Device Vision AI</h3>
                <div className="space-y-3 mb-6">
                  {STEPS.map((label, i) => {
                    const done = step > i;
                    const active = step === i;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 transition-all ${
                          done ? 'bg-mint text-white' : active ? 'border-2 border-mint animate-pulse bg-mint/10' : 'border-2 border-navy/20'
                        }`}>
                          {done ? '✓' : ''}
                        </div>
                        <span className={`text-sm ${done ? 'text-navy font-semibold' : active ? 'text-navy font-medium' : 'text-navy/35'}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {step === 0 && (
                  <div>
                    <div className="h-2 bg-navy/10 rounded-full overflow-hidden">
                      <div className="h-full bg-mint rounded-full transition-all duration-300" style={{ width: `${modelProgress}%` }} />
                    </div>
                    <p className="text-xs text-navy/40 mt-1">First load only — cached after this</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Result */}
        {phase === 'result' && result && (
          <div className="animate-fade-slide space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
              <PointsChip pts={10} />
              <button onClick={reset} className="text-sm text-navy/50 hover:text-navy underline">Scan another</button>
            </div>

            {/* AI Detection badge */}
            {detectedLabel && (
              <div className="flex items-center gap-3 p-4 bg-navy rounded-xl flex-wrap">
                <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center text-white text-base shrink-0">🤖</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-mint font-bold uppercase tracking-wider">AI Detected</div>
                  <div className="text-white font-bold truncate">{detectedLabel}</div>
                </div>
                {detectedCategory && detectedCategory !== 'Unknown' && (
                  <div className="bg-mint/20 px-3 py-1 rounded-full text-mint text-xs font-bold">
                    → {detectedCategory}
                  </div>
                )}
                {confidence > 0 && (
                  <div className="text-white/50 text-xs">{confidence}% confidence</div>
                )}
              </div>
            )}

            {/* Main result card */}
            <Card className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  {imageUrl && (
                    <img src={imageUrl} alt="Device" className="w-full h-48 object-cover rounded-xl mb-4" />
                  )}
                  <div className="text-xs text-navy/40 font-semibold uppercase tracking-wider mb-1">{result.category}</div>
                  <h2 className="font-black text-navy text-xl leading-snug mb-3">{result.deviceName}</h2>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={status} />
                    <HazardBadge level={result.hazardLevel} />
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-3">
                  {[
                    { icon: '⏱', label: 'Lifespan Remaining', value: `${result.predictedLifespanMonthsRemaining} months` },
                    { icon: '🏷', label: 'Age Range', value: `${result.ageRangeYears} years` },
                    { icon: '💰', label: 'Resale Value (INR)', value: result.estimatedResaleValueINR },
                    { icon: '🏭', label: 'Brand', value: result.brandName },
                    { icon: '📋', label: 'EPR Category', value: result.eprCategory },
                    { icon: '📍', label: 'Geo Tag', value: result.geoTag },
                  ].map((s, i) => (
                    <div key={i} className="bg-bg rounded-xl p-3">
                      <div className="text-base mb-1">{s.icon}</div>
                      <div className="text-xs text-navy/45 font-semibold mb-0.5">{s.label}</div>
                      <div className="font-bold text-navy text-sm leading-snug">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-navy/8">
                <div className="flex justify-between text-xs text-navy/45 mb-2">
                  <span>End of Life</span>
                  <span>{result.predictedLifespanMonthsRemaining} months remaining</span>
                  <span>Healthy (48m+)</span>
                </div>
                <div className="h-3 bg-navy/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${status === 'Healthy' ? 'bg-green-400' : status === 'Aging' ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(100, (result.predictedLifespanMonthsRemaining / 48) * 100)}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Components */}
            <Card className="p-6">
              <h3 className="font-black text-navy text-xl mb-1">Component Breakdown</h3>
              <p className="text-navy/50 text-sm mb-5">
                <span className="text-green-600 font-semibold">{result.components.filter(c => c.usable).length} usable</span>
                {' · '}
                <span className="text-red-600 font-semibold">{result.components.filter(c => !c.usable).length} unusable</span>
              </p>
              <div className="space-y-3">
                {result.components.map((comp, i) => (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${
                    comp.usable ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                      comp.usable ? 'bg-green-500 text-white' : 'bg-red-400 text-white'
                    }`}>{comp.usable ? '✓' : '✗'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-navy text-sm">{comp.name}</div>
                      <div className="text-xs text-navy/55 mt-0.5 leading-relaxed">{comp.reason}</div>
                    </div>
                    <div className="shrink-0">
                      {comp.usable ? (
                        listedComponents[comp.name] ? (
                          <span className="text-xs bg-mint/20 text-mint px-2 py-1 rounded-lg font-semibold">Listed ✓</span>
                        ) : (
                          <button onClick={() => handleListComponent(comp)}
                            className="text-xs bg-mint text-white px-3 py-1.5 rounded-lg font-bold hover:bg-mint-dark transition-all">
                            List for Resale
                          </button>
                        )
                      ) : (
                        recycledComponents[comp.name] ? (
                          <span className="text-xs bg-navy/10 text-navy/60 px-2 py-1 rounded-lg font-semibold">Logged ✓</span>
                        ) : (
                          <button onClick={() => handleRecycleComponent(comp)}
                            className="text-xs bg-navy text-white px-3 py-1.5 rounded-lg font-bold hover:bg-navy-light transition-all">
                            Log Recycling
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-3">
              <MintButton onClick={() => router.push('/marketplace')} className="flex-1">View Marketplace →</MintButton>
              <NavyButton onClick={() => router.push('/history')} className="flex-1">Recycling Records →</NavyButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
