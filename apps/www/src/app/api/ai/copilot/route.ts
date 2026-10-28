import { faker } from '@faker-js/faker';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = (await request.clone().json()) as { apiKey?: string };
  if (body.apiKey || process.env.AI_GATEWAY_API_KEY) {
    const { POST: complete } =
      await import('@/registry/app/api/ai/copilot/route');
    return complete(request);
  }

  return Response.json({ text: ` ${faker.lorem.sentence()}` });
}
