import type { TextStreamPart, ToolSet } from 'ai';
import {
  TransformStream as WebTransformStream,
  ReadableStream as WebReadableStream,
} from 'node:stream/web';

import {
  MarkdownJoiner,
  markdownJoinerTransform,
} from '../../../registry/lib/markdown-joiner-transform';

type Chunk = TextStreamPart<ToolSet>;

const runJoiner = (chunks: string[]) => {
  const joiner = new MarkdownJoiner();
  const output: string[] = [];

  for (const chunk of chunks) {
    const processed = joiner.processText(chunk);

    if (processed) output.push(processed);
  }

  const remaining = joiner.flush();

  if (remaining) output.push(remaining);

  return output;
};

const readStream = async (chunks: Chunk[]) => {
  const originalTransformStream = globalThis.TransformStream;
  const originalReadableStream = globalThis.ReadableStream;
  globalThis.ReadableStream =
    WebReadableStream as unknown as typeof ReadableStream;
  globalThis.TransformStream =
    WebTransformStream as unknown as typeof TransformStream;

  try {
    const stream = new ReadableStream<Chunk>({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(chunk);
        }

        controller.close();
      },
    }).pipeThrough(markdownJoinerTransform()());

    const reader = stream.getReader();
    const output: Chunk[] = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;
      output.push(value as Chunk);
    }

    return output;
  } finally {
    globalThis.ReadableStream = originalReadableStream;
    globalThis.TransformStream = originalTransformStream;
  }
};

describe('markdownJoinerTransform', () => {
  it('raises the delay while a fenced code block is streaming and resets after closing', () => {
    const joiner = new MarkdownJoiner();

    expect(joiner.processText('```ts')).toBe('');
    expect(joiner.delayInMs).toBe(100);

    expect(joiner.processText('\nconst x = 1;\n')).toBe(
      '```ts\nconst x = 1;\n'
    );
    expect(joiner.delayInMs).toBe(100);

    expect(joiner.processText('```')).toBe('```');
    expect(joiner.delayInMs).toBe(10);
  });
  it('flushes the buffered markdown before text-end', async () => {
    const output = await readStream([
      { id: '1', text: '**', type: 'text-delta' },
      { id: '1', text: 'bold', type: 'text-delta' },
      { id: '1', type: 'text-end' },
    ]);

    expect(output).toEqual([
      { id: '1', text: '**bold', type: 'text-delta' },
      { id: '1', type: 'text-end' },
    ]);
  });

  it('passes through non-text parts unchanged', async () => {
    const output = await readStream([
      { id: '1', text: 'plain text', type: 'text-delta' },
      { id: 'reasoning', text: 'meta', type: 'reasoning-delta' },
      { id: '1', type: 'text-end' },
    ]);

    expect(output).toEqual([
      { id: '1', text: 'plain text', type: 'text-delta' },
      { id: 'reasoning', text: 'meta', type: 'reasoning-delta' },
      { id: '1', type: 'text-end' },
    ]);
  });
});

describe('MarkdownJoiner', () => {
  describe('chunk joining', () => {
    it.each([
      {
        input: ['**', 'bold', '**'],
        output: ['**bold**'],
        title: 'joins bold markdown split across chunks',
      },
      {
        input: ['hello ', '[Plate', '](https://platejs.org)'],
        output: ['hello ', '[Plate](https://platejs.org)'],
        title: 'joins links split across chunks',
      },
      {
        input: ['1', '. item'],
        output: ['1. item'],
        title: 'joins ordered list markers split across chunks',
      },
      {
        input: ['- [', 'x] task'],
        output: ['- [x] task'],
        title: 'joins todo list markers split across chunks',
      },
      {
        input: [
          '*',
          'plain text that is definitely longer than thirty characters',
        ],
        output: [
          '*plain text that is definitely longer than thirty characters',
        ],
        title: 'flushes long false positives as plain text',
      },
      {
        input: [
          '**',
          'this is plain text that keeps going',
          ' with more chunks after it',
        ],
        output: [
          '**this is plain text that keeps going',
          ' with more chunks after it',
        ],
        title: 'falls back to plain text when bold markup never closes',
      },
      {
        input: ['[Plate', '](https://platejs.org)', ' tail'],
        output: ['[Plate](https://platejs.org)', ' tail'],
        title: 'keeps trailing plain text outside the joined link',
      },
    ])('$title', ({ input, output }) => {
      expect(runJoiner(input)).toEqual(output);
    });
  });
});
