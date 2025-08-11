import type { NextRequest } from 'next/server';

import { createOpenAI } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';
import { NextResponse } from 'next/server';

import { markdownJoinerTransform } from '@/lib/markdown-joiner-transform';

export async function POST(req: NextRequest) {
  const { apiKey: key, messages, system } = await req.json();

  const apiKey = key || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing OpenAI API key.' },
      { status: 401 }
    );
  }

  const openai = createOpenAI({ apiKey });

  try {
    const result = streamText({
      experimental_transform: markdownJoinerTransform(),
      maxTokens: 2048,
      messages: convertToCoreMessages(messages),
      model: openai('gpt-4o'),
      system: system,
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
