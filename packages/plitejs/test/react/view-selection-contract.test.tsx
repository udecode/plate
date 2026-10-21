import { render } from '@testing-library/react';
import { createEditorView, type Point } from 'plitejs';
import { describe, expect, it } from 'vitest';

import { EditorRoot, useEditorContext, useRootEditor } from '../../src/react';
import {
  createPliteDecorationManager,
  type DecorationSource,
} from '../../src/react/decoration-source';
import { getSnapshot as editorGetSnapshot } from '../../src/react/editable/runtime-editor-api';
import type { ReactRuntimeEditor } from '../../src/react/plugin/react-editor';
import { createEditor } from '../../src/react/plugin/with-react';
import {
  createPliteViewBoundaryGraph,
  getPliteViewBoundaryOwnerKey,
  type PliteViewBoundaryOwner,
} from '../../src/react/view-boundary-graph';
import {
  collapsePliteViewSelection,
  createMainRootPliteViewSelection,
  createPliteViewSelection,
  extendPliteViewSelection,
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  refreshPliteViewSelection,
  subscribePliteViewSelection,
  writePliteViewSelection,
} from '../../src/react/view-selection';
import { createPliteViewSelectionDecorationSource } from '../../src/react/view-selection-decoration';

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

const graph = createPliteViewBoundaryGraph([
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
  it('stores a view selection over visible graph segments', () => {
    const selection = createPliteViewSelection(graph, {
      anchor: { point: point(undefined, [0, 0], 1) },
      focus: {
        owner: firstSharedOwner,
        point: point(SHARED_ROOT, [1, 0], 4),
      },
    });

    expect(isPliteViewSelectionCollapsed(selection)).toBe(false);
    expect(
      selection.segments.parts.map((part) => ({
        ownerKey: part.ownerKey,
        root: part.root,
      }))
    ).toEqual([
      { ownerKey: null, root: 'main' },
      {
        ownerKey: getPliteViewBoundaryOwnerKey(firstSharedOwner),
        root: SHARED_ROOT,
      },
    ]);
    expect(JSON.stringify(selection.anchor.point)).not.toContain('owner');
    expect(JSON.stringify(selection.focus.point)).not.toContain('owner');
  });

  it('treats implicit and explicit main roots as the same point', () => {
    const selection = createPliteViewSelection(graph, {
      anchor: { point: point(undefined, [0, 0], 1) },
      focus: { point: point('main', [0, 0], 1) },
    });

    expect(isPliteViewSelectionCollapsed(selection)).toBe(true);
  });

  it('collapses and extends without losing repeated-root owner identity', () => {
    const selection = createPliteViewSelection(graph, {
      anchor: { point: point(undefined, [0, 0], 1) },
      focus: {
        owner: secondSharedOwner,
        point: point(SHARED_ROOT, [0, 0], 2),
      },
    });
    const extended = extendPliteViewSelection(graph, selection, {
      owner: separateOwner,
      point: point(SEPARATE_ROOT, [0, 0], 8),
    });

    expect(collapsePliteViewSelection(selection, 'focus')).toEqual({
      owner: secondSharedOwner,
      point: { root: SHARED_ROOT, path: [0, 0], offset: 2 },
    });
    expect(extended.anchor).toEqual(selection.anchor);
    expect(extended.focus).toEqual({
      owner: separateOwner,
      point: { root: SEPARATE_ROOT, path: [0, 0], offset: 8 },
    });
  });

  it('keeps state per mounted root and shares notifications across its editors', () => {
    const editor = createEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    });
    const editors = new Map<
      string,
      { content: ReactRuntimeEditor; root: ReactRuntimeEditor }
    >();
    const Probe = ({ name }: { name: string }) => {
      editors.set(name, { content: useEditorContext(), root: useRootEditor() });
      return null;
    };

    render(
      <>
        <EditorRoot editor={editor}>
          <Probe name="A" />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <Probe name="B" />
        </EditorRoot>
      </>
    );
    const a = editors.get('A')!;
    const b = editors.get('B')!;
    const selection = createPliteViewSelection(graph, {
      anchor: { point: point(undefined, [0, 0], 1) },
      focus: {
        owner: separateOwner,
        point: point(SEPARATE_ROOT, [0, 0], 8),
      },
    });
    const events: unknown[] = [];

    const unsubscribe = subscribePliteViewSelection(a.content, (event) => {
      events.push(event ?? readPliteViewSelection(a.content));
    });
    writePliteViewSelection(a.root, selection);
    refreshPliteViewSelection(a.root);
    unsubscribe();

    expect(readPliteViewSelection(a.content)).toEqual(selection);
    expect(readPliteViewSelection(b.content)).toBeNull();
    expect(readPliteViewSelection(b.root)).toBeNull();
    expect(readPliteViewSelection(editor)).toBeNull();
    expect(events).toEqual([selection, { forceInvalidate: true }]);
  });

  it('reads a selection written before source observation starts', () => {
    const editor = createEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    });
    const selection = createMainRootPliteViewSelection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    });

    writePliteViewSelection(editor, selection);
    const source = createPliteViewSelectionDecorationSource(editor);
    const text = editorGetSnapshot(editor).children[0].children[0];

    expect(source.read({ editor, entry: [text, [0, 0]] })).toEqual([
      expect.objectContaining({
        attributes: expect.objectContaining({
          'data-editor-view-selection': 'true',
        }),
        range: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 4 },
        },
      }),
    ]);
  });

  it('projects one selection range into exact node buckets', () => {
    const editor = createEditor({
      initialValue: [
        { type: 'paragraph', children: [{ text: 'zero' }] },
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
      ],
    });
    writePliteViewSelection(
      editor,
      createMainRootPliteViewSelection({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [2, 0], offset: 2 },
      })
    );
    const manager = createPliteDecorationManager(editor, [
      createPliteViewSelectionDecorationSource(editor) as DecorationSource<
        typeof editor
      >,
    ]);
    const unmount = manager.mount();
    const snapshot = editorGetSnapshot(editor);
    const firstKey = snapshot.index.keyAt([0, 0])!;
    const middleKey = snapshot.index.keyAt([1, 0])!;
    const lastKey = snapshot.index.keyAt([2, 0])!;

    expect(manager.getNodeSnapshot(firstKey)).toEqual([
      expect.objectContaining({ start: 1, end: 4 }),
    ]);
    expect(manager.getNodeSnapshot(middleKey)).toEqual([
      expect.objectContaining({ start: 0, end: 3 }),
    ]);
    expect(manager.getNodeSnapshot(lastKey)).toEqual([
      expect.objectContaining({ start: 0, end: 2 }),
    ]);
    unmount();
    manager.destroy();
  });

  it('scopes repeated-root decorations to the matching mounted owner', () => {
    const editor = createEditor({
      initialValue: {
        children: [{ type: 'paragraph', children: [{ text: 'main' }] }],
        roots: {
          [SHARED_ROOT]: [
            { type: 'paragraph', children: [{ text: 'shared' }] },
          ],
        },
      },
    });
    const viewEditor = createEditorView(editor, {
      root: SHARED_ROOT,
    }) as unknown as ReactRuntimeEditor;
    const selection = createPliteViewSelection(graph, {
      anchor: {
        owner: firstSharedOwner,
        point: point(SHARED_ROOT, [0, 0], 0),
      },
      focus: {
        owner: firstSharedOwner,
        point: point(SHARED_ROOT, [0, 0], 4),
      },
    });
    const text = editorGetSnapshot(viewEditor).children[0].children[0];

    writePliteViewSelection(viewEditor, selection);

    expect(
      createPliteViewSelectionDecorationSource(
        viewEditor,
        firstSharedOwner
      ).read({ editor: viewEditor, entry: [text, [0, 0]] })
    ).toHaveLength(1);
    expect(
      createPliteViewSelectionDecorationSource(
        viewEditor,
        secondSharedOwner
      ).read({ editor: viewEditor, entry: [text, [0, 0]] })
    ).toEqual([]);
  });
});
