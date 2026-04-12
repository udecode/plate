import { MarkdownJoiner } from '@/registry/lib/markdown-joiner-transform';

export type MarkdownStreamingChunk = {
  chunk: string;
  delayInMs: number;
  rawEndIndex: number;
};

export type MarkdownStreamingChunkAccumulator = {
  joiner: MarkdownJoiner;
  rawChunkCount: number;
};

export function createMarkdownStreamingChunkAccumulator(): MarkdownStreamingChunkAccumulator {
  return {
    joiner: new MarkdownJoiner(),
    rawChunkCount: 0,
  };
}

export function appendMarkdownStreamingChunks(
  accumulator: MarkdownStreamingChunkAccumulator,
  rawChunks: readonly string[]
): MarkdownStreamingChunk[] {
  const transformedChunks: MarkdownStreamingChunk[] = [];

  for (const rawChunk of rawChunks) {
    const rawEndIndex = accumulator.rawChunkCount;
    const processed = accumulator.joiner.processText(rawChunk);
    accumulator.rawChunkCount += 1;

    if (processed) {
      transformedChunks.push({
        chunk: processed,
        delayInMs: accumulator.joiner.delayInMs,
        rawEndIndex,
      });
    }
  }

  return transformedChunks;
}

export function flushMarkdownStreamingChunks(
  accumulator: MarkdownStreamingChunkAccumulator
): MarkdownStreamingChunk[] {
  if (accumulator.rawChunkCount === 0) {
    return [];
  }

  const remaining = accumulator.joiner.flush();

  if (!remaining) {
    return [];
  }

  return [
    {
      chunk: remaining,
      delayInMs: accumulator.joiner.delayInMs,
      rawEndIndex: Math.max(accumulator.rawChunkCount - 1, 0),
    },
  ];
}

export function transformMarkdownStreamingChunks(
  rawChunks: readonly string[]
): MarkdownStreamingChunk[] {
  const accumulator = createMarkdownStreamingChunkAccumulator();

  return [
    ...appendMarkdownStreamingChunks(accumulator, rawChunks),
    ...flushMarkdownStreamingChunks(accumulator),
  ];
}
