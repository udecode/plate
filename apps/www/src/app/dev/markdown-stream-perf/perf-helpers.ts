import { transformMarkdownStreamingChunks } from '@/registry/lib/markdown-streaming-chunks';

export type PerfStats = {
  count: number;
  max: number;
  mean: number;
  median: number;
  min: number;
  p95: number;
  p99: number;
  stdDev: number;
};

export type StreamingPerfChunk = {
  chunk: string;
  delayInMs: number;
};

export type StreamingPerfDataset = {
  delayedChunkCount: number;
  rawCharacterCount: number;
  rawChunkCount: number;
  transformedCharacterCount: number;
  transformedChunkCount: number;
  transformedChunks: StreamingPerfChunk[];
};

export function buildStreamingPerfDataset(
  rawChunks: readonly string[]
): StreamingPerfDataset {
  const transformedChunks = transformMarkdownStreamingChunks(rawChunks).map(
    ({ chunk, delayInMs }) => ({
      chunk,
      delayInMs,
    })
  );

  return {
    delayedChunkCount: transformedChunks.filter((chunk) => chunk.delayInMs > 0)
      .length,
    rawCharacterCount: rawChunks.join('').length,
    rawChunkCount: rawChunks.length,
    transformedCharacterCount: transformedChunks
      .map((chunk) => chunk.chunk)
      .join('').length,
    transformedChunkCount: transformedChunks.length,
    transformedChunks,
  };
}

export function calculatePerfStats(samples: readonly number[]): PerfStats {
  if (samples.length === 0) {
    return {
      count: 0,
      max: 0,
      mean: 0,
      median: 0,
      min: 0,
      p95: 0,
      p99: 0,
      stdDev: 0,
    };
  }

  const sorted = [...samples].sort((left, right) => left - right);
  const count = sorted.length;
  const mean = samples.reduce((total, sample) => total + sample, 0) / count;
  const variance =
    samples.reduce((total, sample) => total + (sample - mean) ** 2, 0) / count;

  return {
    count,
    max: sorted[count - 1] ?? 0,
    mean,
    median: sorted[Math.floor(count / 2)] ?? 0,
    min: sorted[0] ?? 0,
    p95: sorted[Math.floor(count * 0.95)] ?? sorted[count - 1] ?? 0,
    p99: sorted[Math.floor(count * 0.99)] ?? sorted[count - 1] ?? 0,
    stdDev: Math.sqrt(variance),
  };
}
