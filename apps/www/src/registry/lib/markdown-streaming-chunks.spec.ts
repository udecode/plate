import { describe, expect, it } from 'bun:test';

import { liveMarkdownEditorsArticleChunks } from './markdown-streaming-demo-data';
import {
  appendMarkdownStreamingChunks,
  createMarkdownStreamingChunkAccumulator,
  flushMarkdownStreamingChunks,
  type MarkdownStreamingChunk,
  transformMarkdownStreamingChunks,
} from './markdown-streaming-chunks';

function groupChunks(chunks: readonly string[], size: number) {
  const groups: string[][] = [];

  for (let index = 0; index < chunks.length; index += size) {
    groups.push(chunks.slice(index, index + size));
  }

  return groups;
}

function runIncremental(groups: readonly (readonly string[])[]) {
  const accumulator = createMarkdownStreamingChunkAccumulator();
  const output: MarkdownStreamingChunk[] = [];

  for (const group of groups) {
    output.push(...appendMarkdownStreamingChunks(accumulator, group));
  }

  output.push(...flushMarkdownStreamingChunks(accumulator));

  return output;
}

describe('transformMarkdownStreamingChunks', () => {
  it('matches the one-shot transform across different raw chunk regroupings', () => {
    const expected = transformMarkdownStreamingChunks(
      liveMarkdownEditorsArticleChunks
    );

    expect(
      runIncremental(groupChunks(liveMarkdownEditorsArticleChunks, 1))
    ).toEqual(expected);
    expect(
      runIncremental(groupChunks(liveMarkdownEditorsArticleChunks, 5))
    ).toEqual(expected);
    expect(runIncremental([liveMarkdownEditorsArticleChunks])).toEqual(
      expected
    );
  });

  it('flushes pending markdown when the stream ends without a closing token', () => {
    const accumulator = createMarkdownStreamingChunkAccumulator();

    expect(appendMarkdownStreamingChunks(accumulator, ['**'])).toEqual([]);
    expect(flushMarkdownStreamingChunks(accumulator)).toEqual([
      {
        chunk: '**',
        delayInMs: 10,
        rawEndIndex: 0,
      },
    ]);
  });

  it('tracks the last raw chunk index that completed each joined chunk', () => {
    const accumulator = createMarkdownStreamingChunkAccumulator();

    expect(
      appendMarkdownStreamingChunks(accumulator, [
        'hello ',
        '[Plate',
        '](https://platejs.org)',
      ])
    ).toEqual([
      {
        chunk: 'hello ',
        delayInMs: 10,
        rawEndIndex: 0,
      },
      {
        chunk: '[Plate](https://platejs.org)',
        delayInMs: 10,
        rawEndIndex: 2,
      },
    ]);
  });
});
