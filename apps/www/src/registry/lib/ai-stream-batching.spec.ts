import { describe, expect, it } from 'bun:test';

import {
  createAIStreamBatcher,
  shouldFlushAIStreamChunkImmediately,
} from './ai-stream-batching';

const createTimer = (id: number) =>
  ({ id }) as unknown as ReturnType<typeof setTimeout>;

const getTimerId = (timer: ReturnType<typeof setTimeout>) =>
  (timer as unknown as { id: number }).id;

describe('shouldFlushAIStreamChunkImmediately', () => {
  it('treats structural markdown as an immediate flush boundary', () => {
    expect(shouldFlushAIStreamChunkImmediately('hello\nworld')).toBe(true);
    expect(shouldFlushAIStreamChunkImmediately('```ts')).toBe(true);
    expect(shouldFlushAIStreamChunkImmediately('| col |')).toBe(true);
    expect(shouldFlushAIStreamChunkImmediately('plain text')).toBe(false);
  });
});

describe('createAIStreamBatcher', () => {
  it('flushes the first chunk immediately', () => {
    const applied: string[] = [];
    const scheduled: number[] = [];
    const batcher = createAIStreamBatcher({
      applyChunk: (chunk) => {
        applied.push(chunk);
      },
      schedule: (_callback: () => void, delayInMs: number) => {
        scheduled.push(delayInMs);

        return createTimer(1);
      },
    });

    batcher.queue({ chunk: 'hello', isFirst: true });

    expect(applied).toEqual(['hello']);
    expect(scheduled).toEqual([]);
  });

  it('batches later chunks until the scheduled flush runs', () => {
    const applied: string[] = [];
    const scheduled: Array<{
      callback: () => void;
      delayInMs: number;
      id: number;
    }> = [];
    const canceled: number[] = [];
    let nextId = 0;
    const batcher = createAIStreamBatcher({
      applyChunk: (chunk) => {
        applied.push(chunk);
      },
      cancel: (timer) => {
        canceled.push(getTimerId(timer));
      },
      schedule: (callback, delayInMs) => {
        const id = ++nextId;

        scheduled.push({ callback, delayInMs, id });

        return createTimer(id);
      },
    });

    batcher.queue({ chunk: 'hello', isFirst: true });
    batcher.queue({ chunk: ' ', isFirst: false });
    batcher.queue({ chunk: 'world', isFirst: false });

    expect(applied).toEqual(['hello']);
    expect(scheduled).toHaveLength(1);
    expect(scheduled[0]?.delayInMs).toBe(16);
    expect(batcher.getPendingChunk()).toBe(' world');

    scheduled[0]?.callback();

    expect(applied).toEqual(['hello', ' world']);
    expect(canceled).toEqual([]);
    expect(batcher.getPendingChunk()).toBe('');
  });

  it('flushes buffered chunks immediately on structural boundaries', () => {
    const applied: string[] = [];
    const canceled: number[] = [];
    const batcher = createAIStreamBatcher({
      applyChunk: (chunk) => {
        applied.push(chunk);
      },
      cancel: (timer) => {
        canceled.push(getTimerId(timer));
      },
      schedule: () => createTimer(1),
    });

    batcher.queue({ chunk: 'hello', isFirst: true });
    batcher.queue({ chunk: ' world', isFirst: false });
    batcher.queue({ chunk: '\n\n## title', isFirst: false });

    expect(applied).toEqual(['hello', ' world\n\n## title']);
    expect(canceled).toEqual([1]);
    expect(batcher.getPendingChunk()).toBe('');
  });

  it('flushes pending text before reset', () => {
    const applied: string[] = [];
    const canceled: number[] = [];
    const batcher = createAIStreamBatcher({
      applyChunk: (chunk) => {
        applied.push(chunk);
      },
      cancel: (timer) => {
        canceled.push(getTimerId(timer));
      },
      schedule: () => createTimer(1),
    });

    batcher.queue({ chunk: 'hello', isFirst: true });
    batcher.queue({ chunk: ' world', isFirst: false });

    batcher.flush();
    batcher.reset();

    expect(applied).toEqual(['hello', ' world']);
    expect(canceled).toEqual([1]);
    expect(batcher.getPendingChunk()).toBe('');
    expect(batcher.getBatchWindowInMs()).toBe(16);
  });

  it('uses a longer batch window after a slow flush', () => {
    const applied: string[] = [];
    const scheduled: number[] = [];
    let now = 0;
    const batcher = createAIStreamBatcher({
      applyChunk: (chunk) => {
        applied.push(chunk);
        now += 30;
      },
      getNow: () => now,
      schedule: (_callback: () => void, delayInMs: number) => {
        scheduled.push(delayInMs);

        return createTimer(1);
      },
    });

    batcher.queue({ chunk: 'hello', isFirst: true });
    batcher.queue({ chunk: ' ', isFirst: false });

    expect(applied).toEqual(['hello']);
    expect(scheduled).toEqual([32]);
    expect(batcher.getBatchWindowInMs()).toBe(32);
  });
});
