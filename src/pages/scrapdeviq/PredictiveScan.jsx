import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Groq from 'groq-sdk';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const STATUS_CONFIG = {
  Healthy: {
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    icon: '✅',
    bar: 'bg-green-400',
    width: 'w-4/5',
  },
  Aging: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200',
    icon: '⚠️',
    bar: 'bg-yellow-400',
    width: 'w-1/2',
  },
  'Replace Soon': {
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    icon: '🔴',
    bar: 'bg-red-400',
    width: 'w-1/4',
  },
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function analyzeDeviceImage(base64Image, mimeType) {
  const client = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });

  const response = await client.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64Image}` },
          },
          {
            type: 'text',
            text: `You are an AI e-waste lifecycle analyst. Analyze this electronic device image and return ONLY valid JSON (no markdown, no explanation) with these fields:
{
  "deviceType": "string (e.g. Laptop, Smartphone, Monitor, Tablet, Desktop PC, etc.)",
  "estimatedBrand": "string (brand name or 'Unknown')",
  "estimatedModel": "string (model or 'Unknown')",
  "estimatedAge": "string (e.g. '3-5 years')",
  "monthsUntilEwaste": number (integer, months until device is likely to become e-waste based on visible condition),
  "status": "Healthy" | "Aging" | "Replace Soon",
  "conditionNotes": "string (2-3 sentence description of visible condition, wear, damage)",
  "repairability": "High" | "Medium" | "Low",
  "resaleValue": "string (estimated range e.g. '$50-$150')",
  "keyFindings": ["string", "string", "string"] (3 bullet point findings)
}
Status rules: Healthy = 18+ months, Aging = 6-18 months, Replace Soon = <6 months.`,
          },
        ],
      },
    ],
    max_tokens: 600,
  });

  const text = response.choices[0].message.content.trim();
  const json = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(json);
}

export default function PredictiveScan() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setImage(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }

  async function runScan() {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    try {
      const b64 = await fileToBase64(imageFile);
      const data = await analyzeDeviceImage(b64, imageFile.type);
      setResult(data);
    } catch (e) {
      setError('Analysis failed. Make sure your Groq API key is set and try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const status = result?.status;
  const statusCfg = STATUS_CONFIG[status];

  return (
    <div className="min-h-screen bg-bg pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <div className="text-xs font-bold text-mint uppercase tracking-widest mb-2">Layer 1</div>
          <h1 className="text-4xl font-black text-navy mb-3">Predictive Scan</h1>
          <p className="text-navy/60 text-lg">
            Upload a photo of any electronic device. AI estimates its lifecycle status and months until e-waste.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Zone */}
          <div>
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => !image && inputRef.current.click()}
              className={`card border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                drag ? 'border-mint bg-mint/5' : image ? 'border-navy/20' : 'border-navy/20 hover:border-mint hover:bg-mint/5'
              }`}
              style={{ minHeight: 320 }}
            >
              {image ? (
                <div className="relative">
                  <img src={image} alt="Device" className="w-full object-cover max-h-80" />
                  {loading && (
                    <div className="absolute inset-0 bg-navy/60 flex flex-col items-center justify-center">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-4 border-mint/30 rounded-full" />
                        <div className="absolute inset-0 border-4 border-mint border-t-transparent rounded-full animate-spin" />
                      </div>
                      <div className="text-mint font-semibold mt-4 text-sm">Analyzing device...</div>
                      <div className="scan-line absolute left-0 right-0 h-0.5 bg-mint/60" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 text-center p-8">
                  <div className="text-5xl mb-4">📷</div>
                  <p className="text-navy font-semibold mb-1">Drop a device photo here</p>
                  <p className="text-navy/40 text-sm">or click to browse</p>
                  <p className="text-navy/30 text-xs mt-4">Supports: JPG, PNG, WEBP</p>
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />

            {image && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={runScan}
                  disabled={loading}
                  className="flex-1 py-3 bg-mint text-navy font-bold rounded-xl hover:bg-mint-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Scanning...' : '🔍 Analyze Device'}
                </button>
                <button
                  onClick={() => { setImage(null); setImageFile(null); setResult(null); setError(null); }}
                  className="px-4 py-3 border border-navy/20 text-navy rounded-xl hover:bg-navy/5 transition-all"
                >
                  Clear
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Results */}
          <div>
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card p-8 h-full flex flex-col items-center justify-center text-center"
                  style={{ minHeight: 320 }}
                >
                  <div className="text-6xl mb-4 opacity-30">📊</div>
                  <p className="text-navy/40 font-medium">Upload a device photo<br />to see AI analysis results</p>
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Status Badge */}
                  <div className={`card p-6 border-2 ${statusCfg.bg}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{statusCfg.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-navy/50 uppercase tracking-widest">Device Status</div>
                        <div className={`text-2xl font-black ${statusCfg.color}`}>{result.status}</div>
                      </div>
                    </div>
                    {/* Health bar */}
                    <div className="h-2 bg-navy/10 rounded-full overflow-hidden">
                      <div className={`h-full ${statusCfg.bar} ${statusCfg.width} rounded-full transition-all`} />
                    </div>
                    <div className="flex justify-between text-xs text-navy/40 mt-1">
                      <span>End of Life</span>
                      <span>Healthy</span>
                    </div>
                  </div>

                  {/* Device Info */}
                  <div className="card p-6">
                    <h3 className="font-bold text-navy mb-4 text-sm uppercase tracking-wider">Device Info</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        ['Type', result.deviceType],
                        ['Brand', result.estimatedBrand],
                        ['Model', result.estimatedModel],
                        ['Est. Age', result.estimatedAge],
                        ['Resale Value', result.resaleValue],
                        ['Repairability', result.repairability],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <div className="text-navy/40 text-xs">{label}</div>
                          <div className="font-semibold text-navy">{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Months countdown */}
                  <div className="card p-6 bg-navy text-white">
                    <div className="text-xs font-bold text-mint uppercase tracking-widest mb-2">E-Waste Timeline</div>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black text-mint">{result.monthsUntilEwaste}</span>
                      <span className="text-white/60 mb-2">months remaining</span>
                    </div>
                    <p className="text-white/50 text-sm mt-3">{result.conditionNotes}</p>
                  </div>

                  {/* Key Findings */}
                  <div className="card p-6">
                    <h3 className="font-bold text-navy mb-3 text-sm uppercase tracking-wider">Key Findings</h3>
                    <ul className="space-y-2">
                      {result.keyFindings?.map((f, i) => (
                        <li key={i} className="flex gap-2 text-sm text-navy/70">
                          <span className="text-mint mt-0.5">→</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
