import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Groq from 'groq-sdk';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

async function generateCertificate(data) {
  const client = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You generate e-waste disposal compliance statements. Return ONLY valid JSON.' },
      {
        role: 'user',
        content: `Generate a Proof-of-Disposal certificate for:
Device: ${data.device}
Serial/ID: ${data.serial || 'N/A'}
Disposal Method: ${data.method}
Recycler/Partner: ${data.recycler || 'Certified Local Partner'}
Organization: ${data.org || 'Individual'}
Date: ${data.date}

Return JSON:
{
  "certId": "string (format: SDQ-YYYY-XXXXX where XXXXX is 5 random uppercase alphanumeric)",
  "complianceStatement": "string (2-3 sentences, formal, ESG-ready compliance declaration)",
  "disposalSummary": "string (1-2 sentences describing what was disposed and how)",
  "environmentalImpact": "string (1-2 sentences about positive environmental outcome)",
  "regulatoryNote": "string (reference to relevant e-waste regulation like R2, e-Stewards, WEEE, or Basel Convention)",
  "verificationCode": "string (hex format e.g. 0xA3F9B2C1)",
  "validUntil": "string (date 2 years from today: ${data.date.split('/').reverse().join('-')})"
}`,
      },
    ],
    max_tokens: 500,
  });
  const text = response.choices[0].message.content.trim();
  return JSON.parse(text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim());
}

const DISPOSAL_METHODS = ['Certified Recycler', 'Manufacturer Take-Back', 'Municipal E-Waste Drop-off', 'Retailer Collection', 'Resold/Donated', 'Corporate Recycling Program'];

export default function ProofOfDisposal() {
  const [form, setForm] = useState({
    device: '',
    serial: '',
    method: 'Certified Recycler',
    recycler: '',
    org: '',
    date: new Date().toLocaleDateString('en-US'),
  });
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const certRef = useRef();

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await generateCertificate(form);
      setCert({ ...data, form });
    } catch (err) {
      setError('Failed to generate certificate. Check API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-bg pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-10">
          <div className="text-xs font-bold text-mint uppercase tracking-widest mb-2">Layer 4</div>
          <h1 className="text-4xl font-black text-navy mb-3">Proof of Disposal</h1>
          <p className="text-navy/60 text-lg">Generate a verified, ESG-ready certificate for responsible e-waste disposal.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleGenerate} className="md:col-span-2 space-y-4">
            <div className="card p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Device Description *</label>
                <input
                  required
                  value={form.device}
                  onChange={e => setForm(f => ({ ...f, device: e.target.value }))}
                  placeholder="e.g. Dell Laptop, Model XPS 15"
                  className="w-full px-4 py-3 rounded-xl border border-navy/20 bg-white text-navy placeholder-navy/30 focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Serial / Asset ID</label>
                <input
                  value={form.serial}
                  onChange={e => setForm(f => ({ ...f, serial: e.target.value }))}
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-xl border border-navy/20 bg-white text-navy placeholder-navy/30 focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Disposal Method *</label>
                <select
                  value={form.method}
                  onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-navy/20 bg-white text-navy focus:outline-none focus:border-mint"
                >
                  {DISPOSAL_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Recycler / Partner Name</label>
                <input
                  value={form.recycler}
                  onChange={e => setForm(f => ({ ...f, recycler: e.target.value }))}
                  placeholder="e.g. EcoVerde Recycling Ltd"
                  className="w-full px-4 py-3 rounded-xl border border-navy/20 bg-white text-navy placeholder-navy/30 focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Organization / Name</label>
                <input
                  value={form.org}
                  onChange={e => setForm(f => ({ ...f, org: e.target.value }))}
                  placeholder="Your company or name"
                  className="w-full px-4 py-3 rounded-xl border border-navy/20 bg-white text-navy placeholder-navy/30 focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Disposal Date</label>
                <input
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-navy/20 bg-white text-navy focus:outline-none focus:border-mint"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-mint text-navy font-bold rounded-xl hover:bg-mint-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating Certificate...' : '📋 Generate Certificate'}
              </button>

              {error && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-xl">{error}</div>}
            </div>
          </form>

          {/* Certificate */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {!cert && !loading && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="card p-12 flex flex-col items-center justify-center text-center h-full" style={{ minHeight: 480 }}>
                  <div className="text-6xl mb-4 opacity-30">📋</div>
                  <p className="text-navy/40 font-medium">Fill in device details<br />to generate your certificate</p>
                </motion.div>
              )}
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="card p-12 flex flex-col items-center justify-center text-center h-full" style={{ minHeight: 480 }}>
                  <div className="w-16 h-16 border-4 border-mint/30 border-t-mint rounded-full animate-spin mb-6" />
                  <p className="text-navy font-semibold">Generating your certificate...</p>
                </motion.div>
              )}
              {cert && (
                <motion.div key="cert" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                  {/* Certificate Document */}
                  <div ref={certRef} className="card border-2 border-navy/20 overflow-hidden">
                    {/* Header */}
                    <div className="bg-navy p-8 text-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #2FC7A8 0, #2FC7A8 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
                      <div className="relative">
                        <div className="flex justify-center items-center gap-1 mb-3">
                          <span className="text-2xl font-black text-white">SCRAP</span>
                          <span className="text-2xl font-black text-mint">DEVIQ</span>
                        </div>
                        <h2 className="text-xl font-black text-white mb-1">PROOF OF RESPONSIBLE DISPOSAL</h2>
                        <p className="text-mint/70 text-sm">E-Waste Lifecycle Certificate</p>
                      </div>
                    </div>

                    {/* Cert ID bar */}
                    <div className="bg-mint/10 border-y border-mint/20 px-8 py-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-navy/40 font-semibold">CERTIFICATE ID</span>
                        <div className="font-black text-navy text-lg tracking-widest">{cert.certId}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-navy/40 font-semibold">VERIFICATION CODE</span>
                        <div className="font-mono text-mint font-bold">{cert.verificationCode}</div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6">
                      {/* Device info row */}
                      <div className="grid grid-cols-2 gap-4 pb-6 border-b border-navy/10">
                        {[
                          ['Device', cert.form.device],
                          ['Serial/ID', cert.form.serial || 'N/A'],
                          ['Disposal Method', cert.form.method],
                          ['Recycler/Partner', cert.form.recycler || 'Certified Partner'],
                          ['Organization', cert.form.org || 'Individual'],
                          ['Date of Disposal', cert.form.date],
                        ].map(([label, val]) => (
                          <div key={label}>
                            <div className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-1">{label}</div>
                            <div className="font-semibold text-navy text-sm">{val}</div>
                          </div>
                        ))}
                      </div>

                      {/* Statements */}
                      {[
                        { label: 'Compliance Statement', text: cert.complianceStatement },
                        { label: 'Environmental Impact', text: cert.environmentalImpact },
                        { label: 'Regulatory Reference', text: cert.regulatoryNote },
                      ].map(s => (
                        <div key={s.label}>
                          <div className="text-xs font-bold text-mint uppercase tracking-wider mb-2">{s.label}</div>
                          <p className="text-navy/70 text-sm leading-relaxed">{s.text}</p>
                        </div>
                      ))}

                      {/* Valid until */}
                      <div className="bg-bg rounded-xl p-4 flex items-center justify-between">
                        <div className="text-xs text-navy/40">Certificate valid until</div>
                        <div className="font-bold text-navy">{cert.validUntil}</div>
                      </div>

                      {/* Verified badge */}
                      <div className="flex items-center gap-3 p-4 bg-mint/10 border border-mint/20 rounded-xl">
                        <div className="w-10 h-10 bg-mint rounded-full flex items-center justify-center text-white font-black text-lg">✓</div>
                        <div>
                          <div className="font-bold text-navy text-sm">Verified by ScrapDevIQ</div>
                          <div className="text-xs text-navy/50">AI-generated compliance record — retain for ESG reporting</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handlePrint}
                      className="flex-1 py-3 bg-navy text-white font-bold rounded-xl hover:bg-navy-light transition-all"
                    >
                      🖨️ Print / Save PDF
                    </button>
                    <button
                      onClick={() => { setCert(null); }}
                      className="px-5 py-3 border border-navy/20 text-navy rounded-xl hover:bg-navy/5 transition-all font-semibold"
                    >
                      New
                    </button>
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
