import { describe, expect, it } from 'bun:test';

import { buildStreamingPerfDataset, calculatePerfStats } from './perf-helpers';

describe('buildStreamingPerfDataset', () => {
  it('summarizes raw and transformed chunk counts from the baseline stream', () => {
    const dataset = buildStreamingPerfDataset([
      'hello ',
      '[Plate',
      '](https://platejs.org)',
    ]);

    expect(dataset.rawChunkCount).toBe(3);
    expect(dataset.transformedChunkCount).toBe(2);
    expect(dataset.transformedChunks.map(({ chunk }) => chunk)).toEqual([
      'hello ',
      '[Plate](https://platejs.org)',
    ]);
    expect(dataset.delayedChunkCount).toBe(2);
    expect(dataset.rawCharacterCount).toBe(
      'hello [Plate](https://platejs.org)'.length
    );
    expect(dataset.transformedCharacterCount).toBe(
      'hello [Plate](https://platejs.org)'.length
    );
  });
});

describe('calculatePerfStats', () => {
  it('returns zeroed stats for an empty sample set', () => {
    expect(calculatePerfStats([])).toEqual({
      count: 0,
      max: 0,
      mean: 0,
      median: 0,
      min: 0,
      p95: 0,
      p99: 0,
      stdDev: 0,
    });
  });

  it('calculates summary stats for measured samples', () => {
    expect(calculatePerfStats([10, 20, 30, 40, 50])).toEqual({
      count: 5,
      max: 50,
      mean: 30,
      median: 30,
      min: 10,
      p95: 50,
      p99: 50,
      stdDev: Math.sqrt(200),
    });
  });
});
