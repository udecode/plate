import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt, system } = await req.json();

  try {
    const result = await generateText({
      abortSignal: req.signal,
      maxTokens: 50,
      model: openai('gpt-4o-mini'),
      prompt: prompt,
      system,
      temperature: 0.7,
    });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return new Response(null, { status: 408 });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
