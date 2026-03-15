// src/app/api/ai/route.ts
//
// POST /api/ai
// Body: { photoUrls: string[], prompt?: string }
// Calls xAI Grok Vision API server-side so the API key never touches the browser.

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { GrokAnalysisRequest } from '@/types';

export const maxDuration = 60;

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL       = 'grok-2-vision-1212';

const DEFAULT_PROMPT = `You are analyzing multiple photos of the same person.
Provide a rich, detailed description of their physical appearance including:
- Face shape, skin tone, and notable facial features
- Hair color, texture, and style
- Eye color and shape
- General build and presence
- Typical expression and energy

Frame this as a creative brief that a video generation AI (like Runway ML or Kling) 
could use to generate a realistic, natural-looking portrait video of this person.
Be specific, vivid, and cinematic in your language.`;

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'XAI_API_KEY not configured' }, { status: 500 });

  let body: GrokAnalysisRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { photoUrls, prompt } = body;
  if (!photoUrls?.length) {
    return NextResponse.json({ error: 'Provide at least one photo URL' }, { status: 400 });
  }
  if (photoUrls.length > 10) {
    return NextResponse.json({ error: 'Maximum 10 photos per request' }, { status: 400 });
  }

  // Build the message content with images
  const imageContent = photoUrls.map(url => ({
    type: 'image_url',
    image_url: { url },
  }));

  const textContent = {
    type: 'text',
    text: prompt?.trim() || DEFAULT_PROMPT,
  };

  try {
    const response = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: 1500,
        messages: [
          {
            role:    'user',
            content: [...imageContent, textContent],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return NextResponse.json(
        { error: `xAI API error (${response.status}): ${errBody}` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content ?? '';

    return NextResponse.json({ result, model: MODEL });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Network error: ${msg}` }, { status: 500 });
  }
}
