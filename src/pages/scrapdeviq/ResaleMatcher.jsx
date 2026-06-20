import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Groq from 'groq-sdk';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const CONDITION_OPTIONS = ['Like New', 'Good', 'Fair', 'Poor'];
const DEVICE_TYPES = ['Smartphone', 'Laptop', 'Tablet', 'Desktop PC', 'Monitor', 'Smartwatch', 'Camera', 'Gaming Console', 'Printer', 'Other'];

async function getResaleMatches(device, brand, model, condition, age) {
  const client = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert e-waste resale advisor. Return ONLY valid JSON, no markdown.',
      },
      {
        role: 'user',
        content: `Device: ${device}, Brand: ${brand || 'Unknown'}, Model: ${model || 'Unknown'}, Condition: ${condition}, Age: ${age} years.

Return JSON:
{
  "summary": "2-sentence overall resale assessment",
  "estimatedValue": { "low": number, "mid": number, "high": number },
  "channels": [
    {
      "name": "channel name (e.g. eBay, Swappa, Back Market, Local Recycler, Manufacturer Trade-In, Facebook Marketplace)",
      "type": "Resale" | "Trade-In" | "Recycle",
      "estimatedPayout": "string (e.g. '$80-$120')",
      "timeToSell": "string (e.g. '3-7 days')",
      "effort": "Low" | "Medium" | "High",
      "bestFor": "string (1 sentence)",
      "url": "string (website domain only, e.g. ebay.com)"
    }
  ],
  "recommendation": "string (which channel to use first and why)",
  "greenTip": "string (eco-friendly disposal advice if resale value is low)"
}
Return exactly 4 channels sorted by estimated payout descending.`,
      },
    ],
    max_tokens: 800,
  });
  const text = response.choices[0].message.content.trim();
  return JSON.parse(text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim());
}

const EFFORT_COLOR = { Low: 'text-green-600 bg-green-50', Medium: 'text-yellow-600 bg-yellow-50', High: 'text-red-600 bg-red-50' };
const TYPE_COLOR = { Resale: 'bg-mint/10 text-mint', 'Trade-In': 'bg-navy/10 text-navy', Recycle: 'bg-green-100 text-green-700' };

export default function ResaleMatcher() {
  const [form, setForm] = useState({ device: '', brand: '', model: '', condition: 'Good', age: '2' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await getResaleMatches(form.device, form.brand, form.model, form.condition, form.age);
      setResult(data);
    } catch (err) {
      setError('Failed to get matches. Check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-10">
          <div className="text-xs font-bold text-mint uppercase tracking-widest mb-2">Layer 2</div>
          <h1 className="text-4xl font-black text-navy mb-3">Smart Resale Matcher</h1>
          <p className="text-navy/60 text-lg">Tell us about your device. We'll find the best resale channels and payout estimates.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-5">
            <div className="card p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Device Type *</label>
                <select
                  value={form.device}
                  onChange={e => setForm(f => ({ ...f, device: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-navy/20 bg-white text-navy focus:outline-none focus:border-mint"
                >
                  <option value="">Select a device...</option>
                  {DEVICE_TYPES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Brand</label>
                <input
                  value={form.brand}
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  placeholder="e.g. Apple, Samsung, Dell"
                  className="w-full px-4 py-3 rounded-xl border border-navy/20 bg-white text-navy placeholder-navy/30 focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Model</label>
                <input
                  value={form.model}
                  onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  placeholder="e.g. iPhone 13, ThinkPad X1"
                  className="w-full px-4 py-3 rounded-xl border border-navy/20 bg-white text-navy placeholder-navy/30 focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITION_OPTIONS.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setForm(f => ({ ...f, condition: c }))}
                      className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${
                        form.condition === c
                          ? 'bg-mint text-navy border-mint'
                          : 'border-navy/20 text-navy hover:border-mint'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Age: <span className="text-mint">{form.age} year{form.age !== '1' ? 's' : ''}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={form.age}
                  onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                  className="w-full accent-mint"
                />
                <div className="flex justify-between text-xs text-navy/40 mt-1">
                  <span>1 yr</span><span>15 yrs</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !form.device}
                className="w-full py-3 bg-mint text-navy font-bold rounded-xl hover:bg-mint-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Finding Matches...' : '♻️ Find Best Channels'}
              </button>

              {error && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-xl">{error}</div>}
            </div>
          </form>

          {/* Results */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="card p-12 flex flex-col items-center justify-center text-center h-full" style={{ minHeight: 400 }}>
                  <div className="text-6xl mb-4 opacity-30">🔄</div>
                  <p className="text-navy/40 font-medium">Fill in your device details<br />to see resale channel matches</p>
                </motion.div>
              )}
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="card p-12 flex flex-col items-center justify-center text-center h-full" style={{ minHeight: 400 }}>
                  <div className="w-16 h-16 border-4 border-mint/30 border-t-mint rounded-full animate-spin mb-6" />
                  <p className="text-navy font-semibold">Analyzing resale market...</p>
                  <p className="text-navy/40 text-sm mt-2">Checking 50+ platforms</p>
                </motion.div>
              )}
              {result && (
                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  {/* Value Summary */}
                  <div className="card p-6 bg-navy text-white">
                    <div className="text-xs font-bold text-mint uppercase tracking-widest mb-3">Estimated Market Value</div>
                    <div className="flex items-end gap-6 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-black text-white/50">${result.estimatedValue?.low}</div>
                        <div className="text-xs text-white/30">Low</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-black text-mint">${result.estimatedValue?.mid}</div>
                        <div className="text-xs text-mint/60">Best Estimate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-white/50">${result.estimatedValue?.high}</div>
                        <div className="text-xs text-white/30">High</div>
                      </div>
                    </div>
                    <p className="text-white/50 text-sm">{result.summary}</p>
                  </div>

                  {/* Channels */}
                  <div className="space-y-3">
                    {result.channels?.map((ch, i) => (
                      <div key={i} className="card p-5 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-navy">{ch.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${TYPE_COLOR[ch.type]}`}>{ch.type}</span>
                            </div>
                            <div className="text-xs text-navy/40">{ch.url}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black text-mint">{ch.estimatedPayout}</div>
                            <div className="text-xs text-navy/40">{ch.timeToSell}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-navy/60 flex-1">{ch.bestFor}</p>
                          <span className={`text-xs px-2 py-1 rounded-lg font-semibold ml-3 ${EFFORT_COLOR[ch.effort]}`}>
                            {ch.effort} effort
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendation */}
                  <div className="card p-5 bg-mint/10 border border-mint/20">
                    <div className="text-xs font-bold text-mint uppercase tracking-widest mb-2">AI Recommendation</div>
                    <p className="text-navy text-sm">{result.recommendation}</p>
                  </div>

                  {result.greenTip && (
                    <div className="card p-5 bg-green-50 border border-green-200">
                      <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">🌱 Green Tip</div>
                      <p className="text-green-800 text-sm">{result.greenTip}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
