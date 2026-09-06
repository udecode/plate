import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import { NextRequest } from 'next/server';

const createGateway = mock(() => () => ({}));
mock.module('ai', () => ({
  createGateway,
  createUIMessageStream: () => ({}),
  createUIMessageStreamResponse: () => new Response('stream'),
  generateText: async () => ({ text: 'hello' }),
  Output: {},
  streamText: () => ({}),
  tool: (value: unknown) => value,
  toUIMessageStream: () => ({}),
}));
mock.module('@/registry/components/editor/editor-base-kit', () => ({
  BaseEditorKit: [],
}));
mock.module('@/registry/lib/markdown-joiner-transform', () => ({
  markdownJoinerTransform: () => ({}),
}));

const { POST: copilot } = await import('./copilot/route');
const { POST: command } = await import('./command/route');
const initialApiKey = process.env.AI_GATEWAY_API_KEY;
process.env.AI_GATEWAY_API_KEY = 'unused-server-key';

beforeEach(() => createGateway.mockClear());
afterAll(() => {
  if (initialApiKey === undefined) delete process.env.AI_GATEWAY_API_KEY;
  else process.env.AI_GATEWAY_API_KEY = initialApiKey;
  mock.restore();
});

describe.each([
  { name: 'copilot', post: copilot },
  { name: 'command', post: command },
])('$name credentials', ({ name, post }) => {
  it.each([
    undefined,
    '',
    ' ',
    42,
  ])('requires a caller key: %s', async (apiKey) => {
    const response = await post(
      new NextRequest(`https://example.com/api/ai/${name}`, {
        method: 'POST',
        body: JSON.stringify({ apiKey }),
      })
    );

    expect(response.status).toBe(401);
    expect(createGateway).not.toHaveBeenCalled();
  });

  it('passes the caller key to the provider', async () => {
    const response = await post(
      new NextRequest(`https://example.com/api/ai/${name}`, {
        method: 'POST',
        body: JSON.stringify({
          apiKey: ' caller-key ',
          ctx: { children: [] },
          messages: [],
          prompt: 'hello',
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(createGateway).toHaveBeenCalledWith({ apiKey: 'caller-key' });
  });
});
