import type { NextRequest } from 'next/server';

import { copilotDemoConfig } from '@/lib/ai-chat-demo';
import { postWithEmulatedGateway } from '@/lib/ai-gateway-emulator';
import { POST as complete } from '@/registry/app/api/ai/copilot/route';

export async function POST(request: NextRequest) {
  const body = (await request.clone().json()) as {
    apiKey?: string;
    prompt?: string;
  };
  if (body.apiKey) return complete(request);

  return postWithEmulatedGateway(
    complete,
    request,
    body,
    copilotDemoConfig(body)
  );
}
