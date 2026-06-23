import { readFileSync } from 'node:fs';

import type { Point } from '@platejs/plite';
import { describe, expect, it } from 'vitest';

import { Editor } from '../src/editable/runtime-editor-api';
import { createReactEditor } from '../src/plugin/with-react';
import {
  createPliteProjectionGraph,
  getPliteProjectionOwnerKey,
  type PliteProjectionOwner,
} from '../src/projection-graph';
import {
  collapsePliteViewSelection,
  createMainRootPliteViewSelection,
  createPliteViewSelection,
  extendPliteViewSelection,
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  setPliteViewSelectionStoreKey,
  subscribePliteViewSelection,
  writePliteViewSelection,
} from '../src/view-selection';
import {
  createPliteViewSelectionDecorationSource,
  hasVisiblePliteViewSelectionDecoration,
} from '../src/view-selection-decoration';

const SHARED_ROOT = 'synced-block:shared:body';
const SEPARATE_ROOT = 'synced-block:separate:body';

const firstSharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [1],
  ownerRoot: 'main',
} satisfies PliteProjectionOwner;

const separateOwner = {
  childRoot: SEPARATE_ROOT,
  ownerPath: [3],
  ownerRoot: 'main',
} satisfies PliteProjectionOwner;

const secondSharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [5],
  ownerRoot: 'main',
} satisfies PliteProjectionOwner;

const point = (
  root: string | undefined,
  path: readonly number[],
  offset: number
): Point => ({
  ...(root ? { root } : {}),
  path: [...path],
  offset,
});

const graph = createPliteProjectionGraph([
  { path: [0], root: 'main' },
  { owner: firstSharedOwner, path: [0], root: SHARED_ROOT },
  { owner: firstSharedOwner, path: [1], root: SHARED_ROOT },
  { path: [2], root: 'main' },
  { owner: separateOwner, path: [0], root: SEPARATE_ROOT },
  { path: [4], root: 'main' },
  { owner: secondSharedOwner, path: [0], root: SHARED_ROOT },
  { owner: secondSharedOwner, path: [1], root: SHARED_ROOT },
  { path: [6], root: 'main' },
]);

describe('plite view selection', () => {
  it('refreshes scoped view-selection decorations when mounted runtime scope changes', () => {
    const source = readFileSync(
      'src/components/editable-text-blocks.tsx',
      'utf8'
    );
    const scopeEffectStart = source.indexOf(
      'React.useEffect(() => {\n    decorateSource?.refresh({'
    );
    const scopeEffectEnd = source.indexOf(
      '  const rootStyle =',
      scopeEffectStart
    );
    const scopeEffect = source.slice(scopeEffectStart, scopeEffectEnd);

    expect(scopeEffectStart).toBeGreaterThanOrEqual(0);
    expect(source).not.toContain('shouldBoundAutoDecorateRuntimeScopeRef');
    expect(scopeEffect).toContain('autoDecorateRuntimeScopeKey');
    expect(scopeEffect).toContain('decorateSource?.refresh');
    expect(scopeEffect).toContain('viewSelectionDecorationSource?.refresh');
    expect(scopeEffect).toContain('viewSelectionDecorationSource,');
  });

  it('stores a projected selection over visible graph segments without widening Plite points', () => {
    const selection = createPliteViewSelection(graph, {
      anchor: { point: point(undefined, [0, 0], 1) },
      focus: {
        owner: firstSharedOwner,
        point: point(SHARED_ROOT, [1, 0], 4),
      },
    });

    expect(isPliteViewSelectionCollapsed(selection)).toBe(false);
    expect(selection.segments.backward).toBe(false);
    expect(
      selection.segments.parts.map((part) => ({
        ownerKey: part.ownerKey,
        root: part.root,
      }))
    ).toEqual([
      { ownerKey: null, root: 'main' },
      {
        ownerKey: getPliteProjectionOwnerKey(firstSharedOwner),
        root: SHARED_ROOT,
      },
    ]);
    expect(JSON.stringify(selection.anchor.point)).not.toContain('owner');
    expect(JSON.stringify(selection.focus.point)).not.toContain('owner');
  });

  it('treats implicit main-root and explicit main-root points as the same view point', () => {
    const selection = createPliteViewSelection(graph, {
      anchor: { point: point(undefined, [0, 0], 1) },
      focus: { point: point('main', [0, 0], 1) },
    });

    expect(isPliteViewSelectionCollapsed(selection)).toBe(true);
  });

  it('creates model-backed selections in the active non-main root', () => {
    const selection = createMainRootPliteViewSelection(
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      },
      SHARED_ROOT
    );

    expect(selection?.anchor.point).toEqual({
      offset: 0,
      path: [0, 0],
      root: SHARED_ROOT,
    });
    expect(selection?.focus.point).toEqual({
      offset: 4,
      path: [1, 0],
      root: SHARED_ROOT,
    });
    expect(
      selection?.segments.parts.map((part) => ({
        root: part.root,
      }))
    ).toEqual([{ root: SHARED_ROOT }]);
  });

  it('collapses by anchor, focus, and visible start/end with repeated-root owner identity intact', () => {
    const forward = createPliteViewSelection(graph, {
      anchor: { point: point(undefined, [0, 0], 1) },
      focus: {
        owner: secondSharedOwner,
        point: point(SHARED_ROOT, [0, 0], 2),
      },
    });
    const backward = createPliteViewSelection(graph, {
      anchor: {
        owner: secondSharedOwner,
        point: point(SHARED_ROOT, [0, 0], 2),
      },
      focus: { point: point(undefined, [0, 0], 1) },
    });

    expect(collapsePliteViewSelection(forward, 'focus')).toEqual({
      owner: secondSharedOwner,
      point: { root: SHARED_ROOT, path: [0, 0], offset: 2 },
    });
    expect(collapsePliteViewSelection(backward, 'start')).toEqual({
      point: { path: [0, 0], offset: 1 },
    });
    expect(collapsePliteViewSelection(backward, 'end')).toEqual({
      owner: secondSharedOwner,
      point: { root: SHARED_ROOT, path: [0, 0], offset: 2 },
    });
  });

  it('extends from a stable anchor to a new projected focus', () => {
    const initial = createPliteViewSelection(graph, {
      anchor: { point: point(undefined, [0, 0], 1) },
      focus: {
        owner: firstSharedOwner,
        point: point(SHARED_ROOT, [0, 0], 2),
      },
    });
    const extended = extendPliteViewSelection(graph, initial, {
      owner: separateOwner,
      point: point(SEPARATE_ROOT, [0, 0], 8),
    });

    expect(extended.anchor).toEqual(initial.anchor);
    expect(extended.focus).toEqual({
      owner: separateOwner,
      point: { root: SEPARATE_ROOT, path: [0, 0], offset: 8 },
    });
    expect(extended.segments.parts.map((part) => part.root)).toEqual([
      'main',
      SHARED_ROOT,
      'main',
      SEPARATE_ROOT,
    ]);
  });

  it('keeps runtime view selection state editor-local', () => {
    const editorA = {};
    const editorB = {};
    const selection = createPliteViewSelection(graph, {
      anchor: { point: point(undefined, [0, 0], 1) },
      focus: {
        owner: separateOwner,
        point: point(SEPARATE_ROOT, [0, 0], 8),
      },
    });

    writePliteViewSelection(editorA, selection);

    expect(readPliteViewSelection(editorA)).toEqual(selection);
    expect(readPliteViewSelection(editorB)).toBe(null);

    writePliteViewSelection(editorA, null);

    expect(readPliteViewSelection(editorA)).toBe(null);
  });

  it('notifies subscribers through shared runtime view-selection storage', () => {
    const runtimeEditor = {};
    const viewEditor = {};
    const selection = createPliteViewSelection(graph, {
      anchor: { point: point(undefined, [0, 0], 1) },
      focus: {
        owner: separateOwner,
        point: point(SEPARATE_ROOT, [0, 0], 8),
      },
    });
    const events: unknown[] = [];

    setPliteViewSelectionStoreKey(viewEditor, runtimeEditor);
    const unsubscribe = subscribePliteViewSelection(viewEditor, () => {
      events.push(readPliteViewSelection(viewEditor));
    });

    writePliteViewSelection(runtimeEditor, selection);
    writePliteViewSelection(runtimeEditor, null);
    unsubscribe();
    writePliteViewSelection(runtimeEditor, selection);

    expect(events).toEqual([selection, null]);
  });

  it('renders selection decoration only for the addressed content-root owner copy', () => {
    const firstCopySlice = {
      data: {
        owner: firstSharedOwner,
        root: SHARED_ROOT,
        pliteViewSelection: true,
      },
    };
    const mainSlice = {
      data: {
        owner: null,
        root: 'main',
        pliteViewSelection: true,
      },
    };

    expect(
      hasVisiblePliteViewSelectionDecoration([firstCopySlice], {
        owner: firstSharedOwner,
        root: SHARED_ROOT,
      })
    ).toBe(true);
    expect(
      hasVisiblePliteViewSelectionDecoration([firstCopySlice], {
        owner: secondSharedOwner,
        root: SHARED_ROOT,
      })
    ).toBe(false);
    expect(
      hasVisiblePliteViewSelectionDecoration([mainSlice], {
        owner: null,
        root: 'main',
      })
    ).toBe(true);
    expect(
      hasVisiblePliteViewSelectionDecoration([mainSlice], {
        owner: firstSharedOwner,
        root: SHARED_ROOT,
      })
    ).toBe(false);
  });

  it('does not recompute view-selection decorations for model-only selection commits', () => {
    const editor = createReactEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    });
    const selection = createPliteViewSelection(
      createPliteProjectionGraph([{ path: [0], root: 'main' }]),
      {
        anchor: { point: point(undefined, [0, 0], 0) },
        focus: { point: point(undefined, [0, 0], 4) },
      }
    );

    writePliteViewSelection(editor, selection);

    const source = createPliteViewSelectionDecorationSource(editor);
    const sourceReadsBefore = source.getMetrics().sourceReadCount;

    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 2 },
      });
    });

    expect(source.getMetrics().sourceReadCount).toBe(sourceReadsBefore);

    source.refresh({ reason: 'external' });

    expect(source.getMetrics().sourceReadCount).toBe(sourceReadsBefore + 1);

    source.destroy();
  });

  it('keeps existing top-level runtime buckets stable as view selection extends', () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'paragraph', children: [{ text: 'zero' }] },
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
        { type: 'paragraph', children: [{ text: 'three' }] },
        { type: 'paragraph', children: [{ text: 'four' }] },
      ],
    });
    const source = createPliteViewSelectionDecorationSource(editor);

    writePliteViewSelection(
      editor,
      createMainRootPliteViewSelection({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [3, 0], offset: 2 },
      })!
    );
    source.refresh({ reason: 'external' });

    writePliteViewSelection(
      editor,
      createMainRootPliteViewSelection({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [4, 0], offset: 2 },
      })!
    );
    const result = source.refresh({ reason: 'external' });

    expect(result.changedRuntimeIds.length).toBeGreaterThan(0);
    expect(result.changedRuntimeIds.length).toBeLessThanOrEqual(2);

    source.destroy();
  });

  it('clips view-selection decorations to scoped top-level runtime ids and endpoints', () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'paragraph', children: [{ text: 'zero' }] },
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
        { type: 'paragraph', children: [{ text: 'three' }] },
        { type: 'paragraph', children: [{ text: 'four' }] },
      ],
    });

    writePliteViewSelection(
      editor,
      createMainRootPliteViewSelection({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [4, 0], offset: 2 },
      })!
    );

    const snapshot = Editor.getSnapshot(editor);
    const anchorTextRuntimeId = snapshot.index.pathToId['0.0'];
    const focusTextRuntimeId = snapshot.index.pathToId['4.0'];
    const mountedBlockRuntimeId = snapshot.index.pathToId['2'];
    const mountedTextRuntimeId = snapshot.index.pathToId['2.0'];
    const unmountedTextRuntimeId = snapshot.index.pathToId['1.0'];

    if (
      !anchorTextRuntimeId ||
      !focusTextRuntimeId ||
      !mountedBlockRuntimeId ||
      !mountedTextRuntimeId ||
      !unmountedTextRuntimeId
    ) {
      throw new Error('Expected runtime ids for scoped view-selection proof');
    }

    const source = createPliteViewSelectionDecorationSource(editor, {
      runtimeScope: () => [mountedBlockRuntimeId],
    });

    expect(Object.keys(source.getSnapshot()).sort()).toEqual(
      [anchorTextRuntimeId, focusTextRuntimeId, mountedTextRuntimeId].sort()
    );
    expect(source.getRuntimeSnapshot(unmountedTextRuntimeId)).toEqual([]);
    expect(source.getRuntimeSnapshot(anchorTextRuntimeId)).toEqual([
      expect.objectContaining({
        end: 4,
        start: 1,
      }),
    ]);
    expect(source.getRuntimeSnapshot(mountedTextRuntimeId)).toEqual([
      expect.objectContaining({
        end: 3,
        start: 0,
      }),
    ]);
    expect(source.getRuntimeSnapshot(focusTextRuntimeId)).toEqual([
      expect.objectContaining({
        end: 2,
        start: 0,
      }),
    ]);
    expect(source.getMetrics().projectedRangeCount).toBe(3);

    source.destroy();
  });
});
