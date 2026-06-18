import type { Point } from '@platejs/slate';
import { describe, expect, it } from 'vitest';

import {
  createSlateProjectionGraph,
  getSlateProjectionOwnerKey,
  SlateProjectionGraph,
  type SlateProjectionOwner,
} from '../src/projection-graph';

const SHARED_ROOT = 'synced-block:shared:body';
const SEPARATE_ROOT = 'synced-block:separate:body';

const firstSharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [1],
  ownerRoot: 'main',
} satisfies SlateProjectionOwner;

const separateOwner = {
  childRoot: SEPARATE_ROOT,
  ownerPath: [3],
  ownerRoot: 'main',
} satisfies SlateProjectionOwner;

const secondSharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [5],
  ownerRoot: 'main',
} satisfies SlateProjectionOwner;

const point = (
  root: string | undefined,
  path: readonly number[],
  offset: number
): Point => ({
  ...(root ? { root } : {}),
  path: [...path],
  offset,
});

const createSyncedBlocksProjectionGraph = () =>
  createSlateProjectionGraph([
    { path: [0], root: 'main' },
    { owner: firstSharedOwner, path: [0], root: SHARED_ROOT },
    { owner: firstSharedOwner, path: [1], root: SHARED_ROOT },
    { path: [2], root: 'main' },
    { owner: separateOwner, path: [0], root: SEPARATE_ROOT },
    { owner: separateOwner, path: [1], root: SEPARATE_ROOT },
    { path: [4], root: 'main' },
    { owner: secondSharedOwner, path: [0], root: SHARED_ROOT },
    { owner: secondSharedOwner, path: [1], root: SHARED_ROOT },
    { path: [6], root: 'main' },
  ]);

describe('slate projection graph', () => {
  it('walks visible order and keeps repeated root copies distinct', () => {
    const graph = createSyncedBlocksProjectionGraph();
    const firstSharedKey = getSlateProjectionOwnerKey(firstSharedOwner);
    const secondSharedKey = getSlateProjectionOwnerKey(secondSharedOwner);

    expect(graph.nodes.map((node) => node.ownerKey)).toEqual([
      null,
      firstSharedKey,
      firstSharedKey,
      null,
      getSlateProjectionOwnerKey(separateOwner),
      getSlateProjectionOwnerKey(separateOwner),
      null,
      secondSharedKey,
      secondSharedKey,
      null,
    ]);
    expect(SlateProjectionGraph.nextNode(graph, graph.nodes[0])?.ownerKey).toBe(
      firstSharedKey
    );
    expect(
      SlateProjectionGraph.previousNode(graph, graph.nodes[9])?.ownerKey
    ).toBe(secondSharedKey);
    expect(
      SlateProjectionGraph.comparePoints(
        graph,
        {
          owner: firstSharedOwner,
          point: point(SHARED_ROOT, [0, 0], 0),
        },
        {
          owner: secondSharedOwner,
          point: point(SHARED_ROOT, [0, 0], 0),
        }
      )
    ).toBe(-1);
  });

  it('segments a visible range through a repeated shared root into a separate root', () => {
    const graph = createSyncedBlocksProjectionGraph();
    const firstSharedKey = getSlateProjectionOwnerKey(firstSharedOwner);
    const separateKey = getSlateProjectionOwnerKey(separateOwner);

    const segments = SlateProjectionGraph.segmentRange(graph, {
      anchor: {
        point: point(undefined, [0, 0], 1),
      },
      focus: {
        owner: separateOwner,
        point: point(SEPARATE_ROOT, [0, 0], 8),
      },
    });

    expect(segments.backward).toBe(false);
    expect(
      segments.parts.map((part) => ({
        end: part.end.kind,
        nodeKeys: part.nodes.map((node) => node.key),
        ownerKey: part.ownerKey,
        root: part.root,
        start: part.start.kind,
      }))
    ).toEqual([
      {
        end: 'boundary',
        nodeKeys: ['main:0'],
        ownerKey: null,
        root: 'main',
        start: 'point',
      },
      {
        end: 'boundary',
        nodeKeys: [
          `${firstSharedKey}:${SHARED_ROOT}:0`,
          `${firstSharedKey}:${SHARED_ROOT}:1`,
        ],
        ownerKey: firstSharedKey,
        root: SHARED_ROOT,
        start: 'boundary',
      },
      {
        end: 'boundary',
        nodeKeys: ['main:2'],
        ownerKey: null,
        root: 'main',
        start: 'boundary',
      },
      {
        end: 'point',
        nodeKeys: [`${separateKey}:${SEPARATE_ROOT}:0`],
        ownerKey: separateKey,
        root: SEPARATE_ROOT,
        start: 'boundary',
      },
    ]);
  });

  it('keeps projection owner metadata outside serialized Slate points', () => {
    const graph = createSyncedBlocksProjectionGraph();
    const segments = SlateProjectionGraph.segmentRange(graph, {
      anchor: {
        point: point(undefined, [0, 0], 1),
      },
      focus: {
        owner: separateOwner,
        point: point(SEPARATE_ROOT, [0, 0], 8),
      },
    });
    const pointEndpoints = segments.parts.flatMap((part) =>
      [part.start, part.end].flatMap((endpoint) =>
        endpoint.kind === 'point' ? [endpoint.point] : []
      )
    );

    expect(pointEndpoints).toEqual([
      { path: [0, 0], offset: 1 },
      { root: SEPARATE_ROOT, path: [0, 0], offset: 8 },
    ]);
    expect(JSON.stringify(pointEndpoints)).not.toContain('owner');
    expect(JSON.stringify(pointEndpoints)).not.toContain('ownerKey');
  });
});
