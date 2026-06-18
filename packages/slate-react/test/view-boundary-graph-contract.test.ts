import type { Descendant, Point, RootKey } from '@platejs/slate';
import { describe, expect, it } from 'vitest';

import {
  createSlateViewBoundaryGraph,
  createSlateViewBoundarySelectionTarget,
  getSlateRootBoundaryPoint,
  hasAmbiguousSlateViewBoundarySegments,
  type SlateViewBoundaryOwner,
} from '../src/view-boundary-graph';
import { createSlateViewSelection } from '../src/view-selection';

const SHARED_ROOT = 'synced-block:shared:body' as RootKey;

const firstSharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [1],
  ownerRoot: 'main',
} satisfies SlateViewBoundaryOwner;

const secondSharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [3],
  ownerRoot: 'main',
} satisfies SlateViewBoundaryOwner;

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const contentCard = (): Descendant => ({
  type: 'content-card',
  childRoots: { body: SHARED_ROOT },
  children: [{ text: '' }],
});

const point = (
  root: RootKey | undefined,
  path: readonly number[],
  offset: number
): Point => ({
  ...(root ? { root } : {}),
  offset,
  path: [...path],
});

describe('slate view boundary graph', () => {
  it('creates command targets from visible graph segments across roots', () => {
    const roots = {
      [SHARED_ROOT]: [paragraph('Inside'), paragraph('More')],
      main: [paragraph('Before'), contentCard(), paragraph('After')],
    };
    const graph = createSlateViewBoundaryGraph([
      { path: [0], root: 'main' },
      { owner: firstSharedOwner, path: [0], root: SHARED_ROOT },
      { owner: firstSharedOwner, path: [1], root: SHARED_ROOT },
      { path: [2], root: 'main' },
    ]);
    const selection = createSlateViewSelection(graph, {
      anchor: { point: point(undefined, [0, 0], 'Bef'.length) },
      focus: {
        owner: firstSharedOwner,
        point: point(SHARED_ROOT, [0, 0], 'In'.length),
      },
    });

    expect(createSlateViewBoundarySelectionTarget(roots, selection)).toEqual({
      ranges: [
        {
          anchor: { offset: 'Bef'.length, path: [0, 0] },
          focus: { offset: 'Before'.length, path: [0, 0] },
        },
        {
          anchor: { offset: 0, path: [0, 0], root: SHARED_ROOT },
          focus: { offset: 'In'.length, path: [0, 0], root: SHARED_ROOT },
        },
      ],
      start: { offset: 'Bef'.length, path: [0, 0] },
    });
  });

  it('rejects command targets when a repeated root selection has multiple owners', () => {
    const graph = createSlateViewBoundaryGraph([
      { owner: firstSharedOwner, path: [0], root: SHARED_ROOT },
      { path: [2], root: 'main' },
      { owner: secondSharedOwner, path: [0], root: SHARED_ROOT },
    ]);
    const selection = createSlateViewSelection(graph, {
      anchor: {
        owner: firstSharedOwner,
        point: point(SHARED_ROOT, [0, 0], 1),
      },
      focus: {
        owner: secondSharedOwner,
        point: point(SHARED_ROOT, [0, 0], 3),
      },
    });

    expect(hasAmbiguousSlateViewBoundarySegments(selection.segments)).toBe(
      true
    );
    expect(
      createSlateViewBoundarySelectionTarget(
        {
          [SHARED_ROOT]: [paragraph('Inside')],
          main: [paragraph('Before'), contentCard(), paragraph('After')],
        },
        selection
      )
    ).toBe(null);
  });

  it('shares descendant boundary point traversal for hidden ranges and roots', () => {
    const children: Descendant[] = [
      {
        type: 'section',
        children: [paragraph('Summary'), paragraph('Hidden alpha')],
      },
      paragraph('Visible beta'),
    ];

    expect(getSlateRootBoundaryPoint(children, 'start')).toEqual({
      offset: 0,
      path: [0, 0, 0],
    });
    expect(getSlateRootBoundaryPoint(children, 'end')).toEqual({
      offset: 'Visible beta'.length,
      path: [1, 0],
    });
    expect(getSlateRootBoundaryPoint([], 'start')).toBe(null);
  });
});
