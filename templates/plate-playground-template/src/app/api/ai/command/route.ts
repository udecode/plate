import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';

import { limitTotalCharacters } from '../utils/limitTotalCharacters';
import { truncateSystemPrompt } from '../utils/truncateSystemPrompt';

import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages, system } = await req.json();
  const limitedMessages = limitTotalCharacters(messages, 8000);

  const result = await streamText({
    maxTokens: 2048,
    messages: convertToCoreMessages(limitedMessages),
    model: openai('gpt-4o-mini'),
    system: system ? truncateSystemPrompt(system, 12_000) : undefined,
  });

  return result.toDataStreamResponse();
}
