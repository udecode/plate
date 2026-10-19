import { expect, spyOn, test } from 'bun:test';

import { faker } from '@faker-js/faker';
import type { AIChatRequestContext } from 'platejs/ai';

import { createAIChatDemoResponse } from './ai-chat-demo';

test.each(['generate', 'edit', 'comment'] as const)(
  'the demo honors the requested %s tool over prompt words and table references',
  async (toolName) => {
    const request = new AbortController();
    const ctx: AIChatRequestContext = {
      children: [
        {
          type: 'table',
          children: [
            {
              type: 'tr',
              children: ['comments', 'Generate a markdown sample'].map(
                (text) => ({
                  type: 'td',
                  children: [{ type: 'paragraph', children: [{ text }] }],
                })
              ),
            },
          ],
        },
      ],
      nodeSelection: null,
      selection: null,
      refs: {
        blocks: [],
        tableCells: [
          { path: [0, 0, 0], ref: 'c1' },
          { path: [0, 0, 1], ref: 'c2' },
        ],
      },
      toolName,
    };
    const response = await createAIChatDemoResponse({
      ctx,
      messages: [
        {
          id: 'request',
          role: 'user',
          parts: [
            {
              type: 'text',
              text:
                toolName === 'comment' ? 'Give feedback' : 'Explain comments',
            },
          ],
        },
      ],
      signal: request.signal,
    });
    const reader = response.body!.getReader();
    try {
      let stream = '';
      while (!/text-start|data-comment|data-table/.test(stream)) {
        const chunk = await reader.read();
        expect(chunk.done).toBe(false);
        stream += new TextDecoder().decode(chunk.value);
      }
      const event = stream
        .split('\n')
        .find((line) => line.includes('data-toolName'))!;
      expect(JSON.parse(event.slice(6))).toEqual({
        type: 'data-toolName',
        data: toolName,
      });
      expect(stream).toContain(
        `"type":"${
          toolName === 'generate'
            ? 'text-start'
            : toolName === 'edit'
              ? 'data-table'
              : 'data-comment'
        }"`
      );
    } finally {
      request.abort();
      reader.releaseLock();
    }
  }
);

test('Comment streams preserve quoted, escaped and multiline source text as valid JSON', async () => {
  const content = 'Press "⌘ + J" to open C:\\notes\nThen write\ta comment';
  const request = new AbortController();
  const response = await createAIChatDemoResponse({
    ctx: {
      children: [{ type: 'paragraph', children: [{ text: content }] }],
      nodeSelection: null,
      selection: null,
      refs: { blocks: [{ path: [0], ref: 'b1' }], tableCells: [] },
      toolName: 'comment',
    },
    messages: [],
    signal: request.signal,
  });
  const stream = await response.text();
  const events = stream
    .split('\n\n')
    .filter((event) => event.startsWith('data: ') && event !== 'data: [DONE]')
    .map((event) => JSON.parse(event.slice(6)));
  expect(
    events.find(
      (event) =>
        event.type === 'data-comment' && event.data.status === 'streaming'
    )?.data.comment
  ).toMatchObject({ blockRef: 'b1', content });
});

test('Comment streams only the selected second occurrence', async () => {
  const children = [
    {
      type: 'paragraph',
      children: [
        { text: 'repeat / ' },
        { text: 'repeat', bold: true },
        { text: ' outside' },
      ],
    },
  ];
  const original = structuredClone(children);
  const response = await createAIChatDemoResponse({
    ctx: {
      children,
      nodeSelection: null,
      selection: {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 6 },
      },
      refs: { blocks: [{ path: [0], ref: 'b1' }], tableCells: [] },
      toolName: 'comment',
    },
    messages: [],
    signal: new AbortController().signal,
  });
  const stream = await response.text();
  const events = stream
    .split('\n\n')
    .filter((event) => event.startsWith('data: ') && event !== 'data: [DONE]')
    .map((event) => JSON.parse(event.slice(6)));
  expect(
    events.find(
      (event) =>
        event.type === 'data-comment' && event.data.status === 'streaming'
    )?.data.comment
  ).toMatchObject({ blockRef: 'b1', content: 'repeat' });
  expect(children).toEqual(original);
});

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
