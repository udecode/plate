import type { NextRequest } from 'next/server';
import type { AIChatRequestContext } from 'platejs/ai';

import { commandDemoConfig } from '@/lib/ai-chat-demo';
import { postWithEmulatedGateway } from '@/lib/ai-gateway-emulator';
import { POST as command } from '@/registry/app/api/ai/command/route';
import type { ChatMessage } from '@/registry/components/editor/use-chat';

export async function POST(request: NextRequest) {
  const body = (await request.clone().json()) as {
    apiKey?: string;
    ctx: AIChatRequestContext;
    messages: ChatMessage[];
  };
  if (body.apiKey) return command(request);

  return postWithEmulatedGateway(
    command,
    request,
    body,
    commandDemoConfig(body)
  );
}
