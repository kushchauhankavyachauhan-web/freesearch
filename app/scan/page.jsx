"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { scanFile, getStatus } from '../../lib/scanner.js';
import { useStore } from '../../lib/store.js';
import { StatusBadge, HazardBadge, Card, IconCircle, MintButton, NavyButton, SectionHeader, PointsChip } from '../../components/ui.jsx';

const GEO_TAGS = ['Mumbai, MH','Delhi, DL','Bengaluru, KA','Chennai, TN','Hyderabad, TS','Pune, MH','Kolkata, WB','Ahmedabad, GJ','Jaipur, RJ','Lucknow, UP'];

export default function ScanPage() {
  const router = useRouter();
  const { addScannedDevice, addRecord } = useStore();
  const [phase, setPhase] = useState('idle'); // idle | uploading | scanning | result | component
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [drag, setDrag] = useState(false);
  const [listedComponents, setListedComponents] = useState({});
  const [recycledComponents, setRecycledComponents] = useState({});
  const { addListing } = useStore();
  const inputRef = useRef();

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setFileName(file.name);
    setFileSize(file.size);
    setImageUrl(URL.createObjectURL(file));
    setPhase('scanning');
    runSimulatedScan(file.name, file.size);
  }

  function runSimulatedScan(name, size) {
    setProgress(0);
    const steps = [
      [15, 'Reading image metadata...'],
      [35, 'Matching against device database...'],
      [60, 'Analysing component signatures...'],
      [80, 'Estimating lifecycle parameters...'],
      [95, 'Generating report...'],
    ];
    let i = 0;
    const tick = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i][0]);
        setProgressLabel(steps[i][1]);
        i++;
      } else {
        clearInterval(tick);
        const matched = scanFile(name, size);
        const geoTag = GEO_TAGS[Math.floor(Math.random() * GEO_TAGS.length)];
        const entry = { ...matched, geoTag };
        setResult(entry);
        addScannedDevice(entry);
        setProgress(100);
        setTimeout(() => setPhase('result'), 400);
      }
    }, 500);
  }

  const status = result ? getStatus(result.predictedLifespanMonthsRemaining) : null;

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
    setFileName('');
    setFileSize(0);
    setListedComponents({});
    setRecycledComponents({});
  }

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          label="Layer 1 & 2"
          title="Predictive + Component Scan"
          sub="Upload any device photo — our AI matches it against 1,000+ Indian household electronics profiles."
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
              <p className="text-navy/45 text-sm mb-1">or click to browse from your device</p>
              <p className="text-navy/30 text-xs">Supports JPG · PNG · WEBP · HEIC</p>
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleFile(e.target.files[0])} />

            <div className="mt-6 p-4 bg-mint/5 border border-mint/20 rounded-xl">
              <p className="text-xs text-navy/60 text-center">
                <span className="font-bold text-mint">No real AI needed.</span> Every upload is matched deterministically
                against our 1,000+ entry Indian e-waste dataset — different filenames return different devices.
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
                  <img src={imageUrl} alt="Device" className="w-full h-64 object-cover opacity-50" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-mint/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-mint border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  </div>
                  <div className="scan-line" />
                  <p className="text-mint font-bold text-sm mt-2">Analysing...</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-navy text-xl mb-6">AI Processing</h3>
                <div className="space-y-3 mb-6">
                  {['Reading metadata', 'Matching database', 'Analysing components', 'Estimating lifecycle', 'Generating report'].map((label, i) => {
                    const stepPct = (i + 1) * 20;
                    const done = progress >= stepPct;
                    const active = progress >= stepPct - 20 && progress < stepPct;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 transition-all ${
                          done ? 'bg-mint text-white' : active ? 'border-2 border-mint animate-pulse' : 'border-2 border-navy/20'
                        }`}>
                          {done ? '✓' : ''}
                        </div>
                        <span className={`text-sm ${done ? 'text-navy font-semibold' : 'text-navy/40'}`}>{label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="h-2 bg-navy/10 rounded-full overflow-hidden">
                  <div className="h-full bg-mint rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-navy/40 mt-2">{progressLabel}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Result card */}
        {phase === 'result' && result && (
          <div className="animate-fade-slide space-y-5">
            <div className="flex items-center justify-between mb-2">
              <PointsChip pts={10} />
              <button onClick={reset} className="text-sm text-navy/50 hover:text-navy underline">Scan another</button>
            </div>

            {/* Main result */}
            <Card className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Image + name */}
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

                {/* Stats */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  {[
                    { icon: '⏱', label: 'Lifespan Remaining', value: `${result.predictedLifespanMonthsRemaining} months` },
                    { icon: '🏷', label: 'Age Range', value: `${result.ageRangeYears} years` },
                    { icon: '💰', label: 'Resale Value (INR)', value: result.estimatedResaleValueINR },
                    { icon: '🏭', label: 'Brand', value: result.brandName },
                    { icon: '📋', label: 'EPR Category', value: result.eprCategory },
                    { icon: '📍', label: 'Geo Tag', value: result.geoTag },
                  ].map((s,i) => (
                    <div key={i} className="bg-bg rounded-xl p-4">
                      <div className="text-lg mb-1">{s.icon}</div>
                      <div className="text-xs text-navy/45 font-semibold mb-0.5">{s.label}</div>
                      <div className="font-bold text-navy text-sm leading-snug">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifespan bar */}
              <div className="mt-6 pt-5 border-t border-navy/8">
                <div className="flex justify-between text-xs text-navy/45 mb-2">
                  <span>End of Life</span>
                  <span>{result.predictedLifespanMonthsRemaining} months remaining</span>
                  <span>Healthy (48m+)</span>
                </div>
                <div className="h-3 bg-navy/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      status === 'Healthy' ? 'bg-green-400' : status === 'Aging' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min(100, (result.predictedLifespanMonthsRemaining / 48) * 100)}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Component scan */}
            <Card className="p-6">
              <h3 className="font-black text-navy text-xl mb-1">Component Breakdown</h3>
              <p className="text-navy/50 text-sm mb-5">
                <span className="text-green-600 font-semibold">{result.components.filter(c=>c.usable).length} usable</span>
                {' · '}
                <span className="text-red-600 font-semibold">{result.components.filter(c=>!c.usable).length} unusable</span>
                {' — tap an action on each component'}
              </p>

              <div className="space-y-3">
                {result.components.map((comp, i) => (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    comp.usable ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                      comp.usable ? 'bg-green-500 text-white' : 'bg-red-400 text-white'
                    }`}>
                      {comp.usable ? '✓' : '✗'}
                    </div>
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
              <NavyButton onClick={() => router.push('/history')} className="flex-1">View Recycling Records →</NavyButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
