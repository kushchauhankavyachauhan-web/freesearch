const { Client } = require('@notionhq/client');
const { handleCors } = require('../_cors');

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sop } = req.body;
    const notionToken = process.env.NOTION_TOKEN;
    const notionPageId = process.env.NOTION_PAGE_ID;

    if (!notionToken) return res.status(400).json({ error: 'Notion API token not configured' });
    if (!notionPageId) return res.status(400).json({ error: 'Notion page ID not configured' });

    const notion = new Client({ auth: notionToken });

    const blocks = [
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [{ type: 'text', text: { content: `${sop.sopId} | v${sop.version} | ${sop.department} | Owner: ${sop.owner} | Frequency: ${sop.frequency} | Duration: ${sop.duration}` } }],
          icon: { emoji: '📋' },
          color: 'purple_background'
        }
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: 'Purpose' } }] }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: sop.purpose } }] }
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: 'Scope' } }] }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: sop.scope } }] }
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: 'Steps' } }] }
      },
      ...sop.steps.map((step) => ({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [
            { type: 'text', text: { content: `${step.title}: ` }, annotations: { bold: true } },
            { type: 'text', text: { content: `${step.description} (Responsible: ${step.responsible})` } }
          ]
        }
      })),
    ];

    if (sop.warnings?.length) {
      blocks.push(
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Warnings' } }] } },
        ...sop.warnings.map(w => ({
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: [{ type: 'text', text: { content: w } }],
            icon: { emoji: '⚠️' },
            color: 'yellow_background'
          }
        }))
      );
    }

    if (sop.notes?.length) {
      blocks.push(
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Notes' } }] } },
        ...sop.notes.map(n => ({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: { rich_text: [{ type: 'text', text: { content: n } }] }
        }))
      );
    }

    blocks.push(
      { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Success Criteria' } }] } },
      { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: sop.successCriteria } }] } }
    );

    const page = await notion.pages.create({
      parent: { page_id: notionPageId },
      properties: {
        title: { title: [{ text: { content: sop.title } }] }
      },
      children: blocks
    });

    res.json({ success: true, url: page.url });
  } catch (err) {
    console.error('Notion export error:', err);
    res.status(500).json({ error: err.message || 'Failed to export to Notion' });
  }
}
