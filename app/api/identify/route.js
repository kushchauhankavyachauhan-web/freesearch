import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

let catalog = null;
function getCatalog() {
  if (!catalog) {
    try {
      const raw = readFileSync(join(process.cwd(), 'data', 'ewaste-catalog.json'), 'utf-8');
      catalog = JSON.parse(raw);
    } catch {
      catalog = [];
    }
  }
  return catalog;
}

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function scoreMatch(entry, keywords) {
  const haystack = normalize(`${entry.category} ${entry.subCategory} ${(entry.commonMaterials || []).join(' ')}`);
  let score = 0;
  for (const kw of keywords) {
    if (haystack.includes(kw)) score += kw.length > 4 ? 3 : 1;
  }
  return score;
}

function findMatches(identifiedText, category) {
  const entries = getCatalog();
  if (!entries.length) return { best: null, alternatives: [] };

  const keywords = normalize(`${identifiedText} ${category}`).split(' ').filter(w => w.length > 2);
  const scored = entries.map(e => ({ entry: e, score: scoreMatch(e, keywords) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    best: scored[0]?.entry || null,
    alternatives: scored.slice(1, 4).map(x => x.entry),
  };
}

export async function POST(req) {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const prompt = `You are an expert e-waste identifier for the Indian recycling market.

Analyze this image and:
1. Identify the specific e-waste item shown (be precise, e.g. "laptop battery", "CRT monitor", "smartphone screen")
2. Classify it into one of these broad categories: Laptop, Mobile Phone, Tablet, Desktop PC, Monitor, Television, Keyboard, Mouse, Printer, Charger, Power Bank, Battery, UPS, Inverter, SMPS, Router, Hard Drive, SSD, RAM, Motherboard, Graphics Card, CPU, Cable, Adapter, Speaker, Headphones, Camera, Smartwatch, Gaming Console, Remote Control, Smart Home Device, Air Conditioner, Refrigerator, Washing Machine, Microwave, Electric Fan, Water Purifier, Mixer, Electric Iron, Vacuum Cleaner, Geyser, LED Bulb, CCTV Camera, Set Top Box, Projector, Circuit Board, Other
3. Rate your confidence as: "High", "Medium", or "Low"
4. If Low confidence, suggest 2-3 possible alternatives

Respond ONLY with valid JSON in this exact format:
{
  "itemName": "specific item name",
  "category": "broad category from the list",
  "confidence": "High|Medium|Low",
  "confidenceReason": "brief explanation",
  "alternatives": ["alt1", "alt2"]
}

"alternatives" should be empty array unless confidence is Low.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `Anthropic API error: ${err}` }, { status: 502 });
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || '{}';

    let parsed;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response', raw: rawText }, { status: 502 });
    }

    const { itemName, category, confidence, confidenceReason, alternatives = [] } = parsed;
    const { best, alternatives: catalogAlts } = findMatches(itemName, category);

    return NextResponse.json({
      itemName,
      category,
      confidence,
      confidenceReason,
      alternatives,
      catalogMatch: best,
      catalogAlternatives: catalogAlts,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
