const { getDb, initDb } = require('../_db');
const { handleCors } = require('../_cors');

const SYSTEM_PROMPT = `You are an expert technical writer specializing in Standard Operating Procedures (SOPs).
Convert the user's voice transcript or text into a professional SOP document.
Always respond with valid JSON only — no markdown, no code blocks, just the raw JSON object.

Return exactly this structure:
{
  "title": "Clear, action-oriented SOP title",
  "sopId": "SOP-XXX (use a relevant 3-digit number like SOP-001)",
  "version": "1.0",
  "department": "The relevant department (e.g., Operations, HR, IT, Finance)",
  "owner": "The process owner role (e.g., Operations Manager, Team Lead)",
  "frequency": "How often this procedure is performed (e.g., Daily, Weekly, As Needed)",
  "duration": "Estimated time to complete (e.g., 30 minutes, 2 hours)",
  "purpose": "1-2 sentences explaining why this procedure exists",
  "scope": "Who this procedure applies to",
  "steps": [
    {
      "title": "Step title",
      "description": "Detailed step description with clear instructions",
      "responsible": "Role responsible for this step"
    }
  ],
  "warnings": ["Important warnings or cautions (array of strings)"],
  "notes": ["Additional notes or tips (array of strings)"],
  "successCriteria": "How to measure successful completion of this procedure"
}

Make it professional, complete, and actionable. Include 4-8 detailed steps minimum.`;

async function callGroq(apiKey, transcript, inputType) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Convert this ${inputType === 'voice' ? 'voice transcript' : 'text'} into a professional SOP:\n\n${transcript}` }
      ]
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq API error: ${res.status}`);
  }
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript, inputType = 'voice' } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(400).json({ error: 'No AI API key configured. Add a Groq API key in Settings.' });
    }

    const rawText = await callGroq(groqKey, transcript, inputType);

    let sop;
    try {
      sop = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI did not return valid JSON. Try again.');
      sop = JSON.parse(jsonMatch[0]);
    }

    await initDb();
    const sql = getDb();

    const rows = await sql`
      INSERT INTO sops (sop_id, title, department, owner, version, data)
      VALUES (${sop.sopId || 'SOP-001'}, ${sop.title || 'Untitled SOP'}, ${sop.department || ''}, ${sop.owner || ''}, ${sop.version || '1.0'}, ${JSON.stringify(sop)})
      RETURNING id
    `;

    res.json({ sop, dbId: rows[0].id });
  } catch (err) {
    console.error('SOP generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate SOP' });
  }
}
