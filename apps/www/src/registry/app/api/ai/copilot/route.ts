import type { NextRequest } from 'next/server';

import { createGateway, generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const {
    apiKey: key,
    instructions,
    model = 'gpt-4o-mini',
    prompt,
    system,
  } = await req.json();

  const apiKey = key || process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing ai gateway API key.' },
      { status: 401 }
    );
  }

  const gateway = createGateway({ apiKey });

  try {
    const result = await generateText({
      abortSignal: req.signal,
      instructions: instructions ?? system,
      maxOutputTokens: 50,
      model: gateway(`openai/${model}`),
      prompt,
      temperature: 0.7,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(null, { status: 408 });
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
