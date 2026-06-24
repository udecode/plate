import type { Point } from '@platejs/plite';
import { describe, expect, it } from 'vitest';

import {
  createPliteProjectionGraph,
  PliteProjectionGraph,
  type PliteProjectionGraphNodeInput,
  type PliteProjectionOwner,
} from '../src/projection-graph';

const SHARED_ROOT = 'synced-block:shared:body';

const point = (
  root: string | undefined,
  path: readonly number[],
  offset: number
): Point => ({
  ...(root ? { root } : {}),
  path: [...path],
  offset,
});

const owner = (index: number): PliteProjectionOwner => ({
  childRoot: SHARED_ROOT,
  ownerPath: [index * 2 + 1],
  ownerRoot: 'main',
});

const repeatedProjectionInputs = (
  projectionCount: number
): PliteProjectionGraphNodeInput[] => {
  const inputs: PliteProjectionGraphNodeInput[] = [{ path: [0], root: 'main' }];

  for (let index = 0; index < projectionCount; index++) {
    const currentOwner = owner(index);

    inputs.push(
      { owner: currentOwner, path: [0], root: SHARED_ROOT },
      { owner: currentOwner, path: [1], root: SHARED_ROOT },
      { path: [index * 2 + 2], root: 'main' }
    );
  }

  return inputs;
};

const runRepeatedProjectionStress = (projectionCount: number) => {
  const graph = createPliteProjectionGraph(
    repeatedProjectionInputs(projectionCount)
  );
  const lastOwner = owner(projectionCount - 1);
  const segments = PliteProjectionGraph.segmentRange(graph, {
    anchor: { point: point(undefined, [0, 0], 0) },
    focus: {
      owner: lastOwner,
      point: point(SHARED_ROOT, [1, 0], 5),
    },
  });

  return { graph, segments };
};

describe('projection stress budgets', () => {
  it.each([
    20, 100,
  ])('keeps %i repeated projections bounded by visible nodes and projection segments', (projectionCount) => {
    const { graph, segments } = runRepeatedProjectionStress(projectionCount);

    expect(graph.nodes).toHaveLength(1 + projectionCount * 3);
    expect(segments.parts.length).toBeLessThanOrEqual(graph.nodes.length);
    expect(
      segments.parts.filter((part) => part.root === SHARED_ROOT)
    ).toHaveLength(projectionCount);
    expect(
      new Set(
        segments.parts.filter((part) => part.owner).map((part) => part.ownerKey)
      ).size
    ).toBe(projectionCount);
  });

  it('keeps the plain single-root path owner-free and one-segment', () => {
    const graph = createPliteProjectionGraph(
      Array.from({ length: 1000 }, (_, index) => ({
        path: [index],
        root: 'main',
      }))
    );
    const segments = PliteProjectionGraph.segmentRange(graph, {
      anchor: { point: point(undefined, [0, 0], 0) },
      focus: { point: point(undefined, [999, 0], 4) },
    });

    expect(segments.parts).toHaveLength(1);
    expect(segments.parts[0]).toMatchObject({
      owner: null,
      ownerKey: null,
      root: 'main',
    });
  });
});
