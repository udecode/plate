import type { Point } from 'plitejs';
import { describe, expect, it } from 'vitest';

import {
  createPliteViewBoundaryGraph,
  getPliteViewBoundaryOwnerKey,
  PliteViewBoundaryGraph,
  resolvePliteViewBoundarySegmentEndpoint,
  type PliteViewBoundaryOwner,
} from '../../src/react/view-boundary-graph';
import {
  createPliteViewSelection,
  isPliteViewSelectionCollapsed,
} from '../../src/react/view-selection';

const SHARED_ROOT = 'synced-block:shared:body';
const SEPARATE_ROOT = 'synced-block:separate:body';

const firstSharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [1],
  ownerRoot: 'main',
} satisfies PliteViewBoundaryOwner;

const separateOwner = {
  childRoot: SEPARATE_ROOT,
  ownerPath: [3],
  ownerRoot: 'main',
} satisfies PliteViewBoundaryOwner;

const secondSharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [5],
  ownerRoot: 'main',
} satisfies PliteViewBoundaryOwner;

const point = (
  root: string | undefined,
  path: readonly number[],
  offset: number
): Point => ({
  ...(root ? { root } : {}),
  path: [...path],
  offset,
});

const createSyncedBlocksViewBoundaryGraph = () =>
  createPliteViewBoundaryGraph([
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

describe('plite projection graph', () => {
  it('segments retained content between both affinities of the same editable point', () => {
    const fragment = { id: 'removed', changeId: 'alice' };
    const graph = createPliteViewBoundaryGraph([
      { path: [0, 0], root: 'main', text: { start: 0, end: 1 } },
      { fragment, path: [0, 0], root: 'main' },
      { path: [0, 0], root: 'main', text: { start: 1, end: 2 } },
    ]);
    const before = {
      affinity: 'backward',
      point: point(undefined, [0, 0], 1),
    } as const;
    const after = {
      affinity: 'forward',
      point: point(undefined, [0, 0], 1),
    } as const;
    const forward = createPliteViewSelection(graph, {
      anchor: before,
      focus: after,
    });
    const backward = createPliteViewSelection(graph, {
      anchor: after,
      focus: before,
    });
    expect(isPliteViewSelectionCollapsed(forward)).toBe(false);
    expect(backward.segments.backward).toBe(true);
    expect(
      forward.segments.parts.map((part) => part.fragment?.id ?? null)
    ).toEqual([null, 'removed', null]);
    expect(backward.segments.parts).toEqual(forward.segments.parts);
    const first = forward.segments.parts[0];
    const last = forward.segments.parts[2];
    expect(
      resolvePliteViewBoundarySegmentEndpoint({}, first, first.end)
    ).toEqual(point(undefined, [0, 0], 1));
    expect(
      resolvePliteViewBoundarySegmentEndpoint({}, last, last.start)
    ).toEqual(point(undefined, [0, 0], 1));
    const retained = createPliteViewSelection(graph, {
      anchor: { fragmentId: 'removed', point: point(undefined, [0, 0], 1) },
      focus: { fragmentId: 'removed', point: point(undefined, [0, 0], 2) },
    });
    expect(retained.segments.parts).toHaveLength(1);
    expect(retained.segments.parts[0].fragment).toEqual(fragment);
    expect(JSON.stringify(retained.anchor.point)).not.toContain('fragment');
  });
  it('walks visible order and keeps repeated root copies distinct', () => {
    const graph = createSyncedBlocksViewBoundaryGraph();
    const firstSharedKey = getPliteViewBoundaryOwnerKey(firstSharedOwner);
    const secondSharedKey = getPliteViewBoundaryOwnerKey(secondSharedOwner);

    expect(graph.nodes.map((node) => node.ownerKey)).toEqual([
      null,
      firstSharedKey,
      firstSharedKey,
      null,
      getPliteViewBoundaryOwnerKey(separateOwner),
      getPliteViewBoundaryOwnerKey(separateOwner),
      null,
      secondSharedKey,
      secondSharedKey,
      null,
    ]);
    expect(
      PliteViewBoundaryGraph.nextNode(graph, graph.nodes[0])?.ownerKey
    ).toBe(firstSharedKey);
    expect(
      PliteViewBoundaryGraph.previousNode(graph, graph.nodes[9])?.ownerKey
    ).toBe(secondSharedKey);
    expect(
      PliteViewBoundaryGraph.comparePoints(
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
    const graph = createSyncedBlocksViewBoundaryGraph();
    const firstSharedKey = getPliteViewBoundaryOwnerKey(firstSharedOwner);
    const separateKey = getPliteViewBoundaryOwnerKey(separateOwner);

    const segments = PliteViewBoundaryGraph.segmentRange(graph, {
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

  it('keeps projection owner metadata outside serialized Plite points', () => {
    const graph = createSyncedBlocksViewBoundaryGraph();
    const segments = PliteViewBoundaryGraph.segmentRange(graph, {
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
