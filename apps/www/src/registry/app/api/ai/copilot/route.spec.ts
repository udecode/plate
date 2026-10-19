import { expect, mock, test } from 'bun:test';

import { NextRequest } from 'next/server';

const gatewayCalls: unknown[] = [];
const completionCalls: Array<Record<string, unknown>> = [];
mock.module('@ai-sdk/gateway', () => ({
  createGateway: (options: unknown) => {
    gatewayCalls.push(options);
    return (model: string) => ({ provider: 'test', model });
  },
}));
mock.module('ai', () => ({
  generateText: async (options: Record<string, unknown>) => {
    completionCalls.push(options);
    return Object.create({ text: 'Completed' });
  },
}));
const { POST } = await import('./route');

for (const model of ['gpt-4o-mini', 'openai/gpt-4o-mini']) {
  test(`Copilot uses the supplied gateway credential and returns completion text for ${model}`, async () => {
    const request = new NextRequest('http://localhost/api/ai/copilot', {
      method: 'POST',
      body: JSON.stringify({
        apiKey: 'test-key',
        model,
        prompt: 'Continue',
        system: 'Finish the sentence',
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ text: 'Completed' });
    expect(gatewayCalls.at(-1)).toEqual({ apiKey: 'test-key' });
    expect(completionCalls.at(-1)).toMatchObject({
      model: { provider: 'test', model: 'openai/gpt-4o-mini' },
      prompt: 'Continue',
      system: 'Finish the sentence',
      abortSignal: request.signal,
    });
  });
}
