import type { NextRequest } from 'next/server';
import type { AIChatRequestContext } from 'platejs/ai';

import { createAIChatDemoResponse } from '@/lib/ai-chat-demo';
import type { ChatMessage } from '@/registry/components/editor/use-chat';

export async function POST(request: NextRequest) {
  const body = (await request.clone().json()) as {
    messages: ChatMessage[];
    apiKey?: string;
    ctx?: AIChatRequestContext;
  };
  if (body.apiKey || process.env.AI_GATEWAY_API_KEY) {
    const { POST: command } =
      await import('@/registry/app/api/ai/command/route');
    return command(request);
  }

  return createAIChatDemoResponse({ ...body, signal: request.signal });
}
