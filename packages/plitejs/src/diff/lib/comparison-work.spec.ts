import { describe, expect, it } from 'vitest';

import { createEditor } from '../..';
import { createComparisonIndex } from './comparison-index';
import { matchComparison } from './comparison-matcher';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const workFixture = (count: number) => ({
  after: Array.from({ length: count }, (_value, index) =>
    paragraph(`common target ${index}`)
  ),
  before: Array.from({ length: count }, (_value, index) =>
    paragraph(`common source ${index}`)
  ),
});

describe('comparison work bounds', () => {
  it('returns a complete coarse remainder with a diagnostic at the candidate ceiling', async () => {
    const { after, before } = workFixture(4200);
    const editor = createEditor({ initialValue: before });
    const beforeIndex = createComparisonIndex(
      { children: before },
      editor.read.schema
    );
    const afterIndex = createComparisonIndex(
      { children: after },
      editor.read.schema
    );
    const result = await matchComparison(
      beforeIndex,
      afterIndex,
      'work-limit-proof',
      { createdRoots: new Set(), deletedRoots: new Set() }
    );
    const kinds = result.changes.flatMap(({ effects }) =>
      effects.map(({ kind }) => kind)
    );
    const untouchedBlocks = (
      index: typeof beforeIndex,
      side: 'after' | 'before'
    ) =>
      index.roots.get(null)!.topLevelIndexes.filter((nodeIndex) => {
        const { span } = index.nodes[nodeIndex];

        return !result.changes.some((change) =>
          change[side].some(({ from, to }) => from < span.to && to > span.from)
        );
      }).length;

    expect(result.candidateEdges).toBe(100_000);
    expect(result.diagnostics.map(({ code }) => code)).toContain('work-limit');
    expect(kinds).toEqual(expect.arrayContaining(['delete', 'insert']));
    expect([
      untouchedBlocks(beforeIndex, 'before'),
      untouchedBlocks(afterIndex, 'after'),
    ]).toEqual([0, 0]);
  }, 60_000);

  it('rejects cancellation during bounded candidate work without publishing a result', async () => {
    const { after, before } = workFixture(4200);
    const editor = createEditor({ initialValue: before });
    const controller = new AbortController();
    const comparison = matchComparison(
      createComparisonIndex({ children: before }, editor.read.schema),
      createComparisonIndex({ children: after }, editor.read.schema),
      'cancellation-proof',
      {
        createdRoots: new Set(),
        deletedRoots: new Set(),
        signal: controller.signal,
      }
    );

    setTimeout(() => controller.abort(), 0);

    await expect(comparison).rejects.toMatchObject({ name: 'AbortError' });
  }, 60_000);
});
