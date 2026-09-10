import { expect, spyOn, test } from 'bun:test';

import { faker } from '@faker-js/faker';

import { createAIChatDemoResponse } from './ai-chat-demo';

test('canceling before the demo delay expires does not generate a response', async () => {
  const request = new AbortController();
  const words = spyOn(faker.lorem, 'words');
  try {
    const pending = createAIChatDemoResponse({
      messages: [],
      signal: request.signal,
    });
    request.abort();
    await expect(pending).rejects.toThrow();
    expect(words).not.toHaveBeenCalled();
  } finally {
    words.mockRestore();
  }
});

test('the demo endpoint exposes a cancellable SDK event stream', async () => {
  const request = new AbortController();
  const response = await createAIChatDemoResponse({
    messages: [],
    signal: request.signal,
  });
  const reader = response.body!.getReader();
  try {
    expect(response.headers.get('content-type')).toBe('text/event-stream');
    expect(response.headers.get('x-vercel-ai-ui-message-stream')).toBe('v1');
    const start = await reader.read();
    expect(new TextDecoder().decode(start.value)).toContain('"type":"start"');
    const tool = await reader.read();
    expect(new TextDecoder().decode(tool.value)).toContain(
      '"type":"data-toolName","data":"generate"'
    );
    request.abort();
    await expect(reader.read()).rejects.toThrow('Stream aborted');
  } finally {
    request.abort();
    reader.releaseLock();
  }
});
