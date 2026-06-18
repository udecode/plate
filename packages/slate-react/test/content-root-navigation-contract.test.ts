import {
  createEditorRuntime,
  createEditorView,
  defineEditorExtension,
  type Point,
} from '@platejs/slate';
import { describe, expect, it, vi } from 'vitest';

import {
  applyContentRootNavigation,
  applyContentRootViewSelection,
  createContentRootProjectionGraph,
  findContentRootOwners,
} from '../src/editable/content-root-navigation';
import type { ReactRuntimeEditor } from '../src/plugin/react-editor';
import {
  createSlateViewSelection,
  readSlateViewSelection,
  writeSlateViewSelection,
} from '../src/view-selection';

const contentRootExtension = defineEditorExtension({
  elements: [
    {
      type: 'content-card',
      contentRoot: { slot: 'body' },
      void: 'editable-island',
    },
  ],
  name: 'content-root-navigation-test',
});

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

const contentCard = (bodyRoot = 'card:body') => ({
  type: 'content-card',
  childRoots: { body: bodyRoot },
  children: [{ text: '' }],
});

const section = (children: any[]) => ({
  type: 'section',
  children,
});

const createFixture = () => {
  const runtime = createEditorRuntime({
    extensions: [contentRootExtension],
    initialValue: {
      children: [paragraph('Before'), contentCard(), paragraph('After')],
      roots: { 'card:body': [paragraph('Inside')] },
    },
  });
  const mainEditor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
  const bodyEditor = createEditorView(runtime, {
    root: 'card:body',
  }) as unknown as ReactRuntimeEditor;

  return { bodyEditor, mainEditor, runtime };
};

const createRepeatedProjectionFixture = () => {
  const runtime = createEditorRuntime({
    extensions: [contentRootExtension],
    initialValue: {
      children: [
        paragraph('Before'),
        contentCard(),
        paragraph('Between'),
        contentCard(),
        paragraph('After'),
      ],
      roots: { 'card:body': [paragraph('Inside')] },
    },
  });
  const mainEditor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
  const bodyEditor = createEditorView(runtime, {
    root: 'card:body',
  }) as unknown as ReactRuntimeEditor;

  return { bodyEditor, mainEditor, runtime };
};

const selectPoint = (editor: ReactRuntimeEditor, point: Point) => {
  editor.update((tx) => {
    tx.selection.set({ anchor: point, focus: point });
  });
};

const keyEvent = (
  key: string,
  modifiers: Partial<
    Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>
  > = {}
) =>
  ({
    altKey: modifiers.altKey ?? false,
    ctrlKey: modifiers.ctrlKey ?? false,
    key,
    metaKey: modifiers.metaKey ?? false,
    nativeEvent: {
      altKey: modifiers.altKey ?? false,
      ctrlKey: modifiers.ctrlKey ?? false,
      key,
      metaKey: modifiers.metaKey ?? false,
      shiftKey: modifiers.shiftKey ?? false,
    },
    preventDefault: vi.fn(),
    shiftKey: modifiers.shiftKey ?? false,
  }) as any;

describe('content root navigation', () => {
  it('does not read editor state for unrelated keys', () => {
    const event = keyEvent('a');
    const read = vi.fn(() => {
      throw new Error('state read should be gated by key classification');
    });
    const editor = {
      read,
      update: vi.fn(),
    } as unknown as ReactRuntimeEditor;

    const result = applyContentRootNavigation({
      editor,
      event,
      isRTL: false,
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    expect(result.handled).toBe(false);
    expect(read).not.toHaveBeenCalled();
  });

  it('does not resolve mounted roots for vertical keys when schema has no content roots', () => {
    const runtime = createEditorRuntime({
      initialValue: { children: [paragraph('Plain')] },
    });
    const mainEditor = createEditorView(
      runtime
    ) as unknown as ReactRuntimeEditor;
    const getMountedViewEditor = vi.fn();
    const event = keyEvent('ArrowDown');

    selectPoint(mainEditor, { path: [0, 0], offset: 'Plain'.length });
    const selection = mainEditor.read((state) => state.selection.get());

    const result = applyContentRootNavigation({
      editor: mainEditor,
      event,
      getMountedViewEditor,
      isRTL: false,
      selection,
    });

    expect(result.handled).toBe(false);
    expect(getMountedViewEditor).not.toHaveBeenCalled();
  });

  it('does not scan plain documents when looking for content-root owners', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: Array.from({ length: 5000 }, (_, index) =>
          paragraph(`Plain ${index}`)
        ),
      },
    });
    const mainEditor = createEditorView(
      runtime
    ) as unknown as ReactRuntimeEditor;
    const read = vi.fn(() => {
      throw new Error('plain documents should not be scanned');
    });
    const editor = Object.create(mainEditor) as ReactRuntimeEditor;

    Object.defineProperty(editor, 'read', {
      value: read,
    });

    expect(findContentRootOwners(editor)).toEqual([]);
    expect(read).not.toHaveBeenCalled();
  });

  it('does not exit a content root from the start of its last block on ArrowDown', () => {
    const runtime = createEditorRuntime({
      extensions: [contentRootExtension],
      initialValue: {
        children: [paragraph('Before'), contentCard(), paragraph('After')],
        roots: { 'card:body': [paragraph('First'), paragraph('Second')] },
      },
    });
    const mainEditor = createEditorView(
      runtime
    ) as unknown as ReactRuntimeEditor;
    const bodyEditor = createEditorView(runtime, {
      root: 'card:body',
    }) as unknown as ReactRuntimeEditor;
    const event = keyEvent('ArrowDown');

    selectPoint(bodyEditor, { path: [1, 0], offset: 0 });

    const result = applyContentRootNavigation({
      editor: bodyEditor,
      event,
      getMountedViewEditor: (root) =>
        root === 'main' ? mainEditor : bodyEditor,
      isRTL: false,
      selection: bodyEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(bodyEditor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [1, 0], root: 'card:body' },
      focus: { offset: 0, path: [1, 0], root: 'card:body' },
    });
  });

  it('moves forward from the previous sibling into the content root start', () => {
    const { bodyEditor, mainEditor } = createFixture();
    const event = keyEvent('ArrowRight');
    const focusEditor = vi.fn();

    selectPoint(mainEditor, { path: [0, 0], offset: 'Before'.length });

    const result = applyContentRootNavigation({
      editor: mainEditor,
      event,
      focusEditor,
      getMountedViewEditor: (root) =>
        root === 'card:body' ? bodyEditor : mainEditor,
      isRTL: false,
      selection: mainEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(bodyEditor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 0, root: 'card:body' },
      focus: { path: [0, 0], offset: 0, root: 'card:body' },
    });
    expect(mainEditor.read((state) => state.selection.get())).toBe(null);
    expect(focusEditor).toHaveBeenCalledWith(bodyEditor);
  });

  it('moves word forward from the previous sibling into the content root first word boundary', () => {
    const { bodyEditor, mainEditor } = createFixture();
    const event = keyEvent('ArrowRight', { ctrlKey: true });

    selectPoint(mainEditor, { path: [0, 0], offset: 'Before'.length });

    const result = applyContentRootNavigation({
      editor: mainEditor,
      event,
      getMountedViewEditor: (root) =>
        root === 'card:body' ? bodyEditor : mainEditor,
      isRTL: false,
      selection: mainEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(bodyEditor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 'Inside'.length, root: 'card:body' },
      focus: { path: [0, 0], offset: 'Inside'.length, root: 'card:body' },
    });
  });

  it('moves backward from the next sibling into the content root end', () => {
    const { bodyEditor, mainEditor } = createFixture();
    const event = keyEvent('ArrowLeft');

    selectPoint(mainEditor, { path: [2, 0], offset: 0 });

    const result = applyContentRootNavigation({
      editor: mainEditor,
      event,
      getMountedViewEditor: (root) =>
        root === 'card:body' ? bodyEditor : mainEditor,
      isRTL: false,
      selection: mainEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(bodyEditor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 'Inside'.length, root: 'card:body' },
      focus: { path: [0, 0], offset: 'Inside'.length, root: 'card:body' },
    });
  });

  it('moves word backward from the next sibling into the content root previous word boundary', () => {
    const { bodyEditor, mainEditor } = createFixture();
    const event = keyEvent('ArrowLeft', { ctrlKey: true });

    selectPoint(mainEditor, { path: [2, 0], offset: 0 });

    const result = applyContentRootNavigation({
      editor: mainEditor,
      event,
      getMountedViewEditor: (root) =>
        root === 'card:body' ? bodyEditor : mainEditor,
      isRTL: false,
      selection: mainEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(bodyEditor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 0, root: 'card:body' },
      focus: { path: [0, 0], offset: 0, root: 'card:body' },
    });
  });

  it('moves word forward from the content root end into the next owner word boundary', () => {
    const { bodyEditor, mainEditor } = createFixture();
    const event = keyEvent('ArrowRight', { ctrlKey: true });

    selectPoint(bodyEditor, {
      path: [0, 0],
      offset: 'Inside'.length,
      root: 'card:body',
    });

    const result = applyContentRootNavigation({
      editor: bodyEditor,
      event,
      getMountedViewEditor: (root) =>
        root === 'main' ? mainEditor : bodyEditor,
      isRTL: false,
      selection: bodyEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mainEditor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [2, 0], offset: 'After'.length },
      focus: { path: [2, 0], offset: 'After'.length },
    });
  });

  it('moves forward from the active repeated content root copy to its next sibling', () => {
    const { bodyEditor, mainEditor } = createRepeatedProjectionFixture();
    const event = keyEvent('ArrowRight');

    selectPoint(bodyEditor, { path: [0, 0], offset: 'Inside'.length });

    const result = applyContentRootNavigation({
      editor: bodyEditor,
      event,
      getActiveContentRootOwner: (root) =>
        root === 'card:body'
          ? { childRoot: 'card:body', ownerPath: [3], ownerRoot: 'main' }
          : null,
      getMountedViewEditor: (root) =>
        root === 'main' ? mainEditor : bodyEditor,
      isRTL: false,
      selection: bodyEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(mainEditor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [4, 0], offset: 0 },
      focus: { path: [4, 0], offset: 0 },
    });
  });

  it('moves backward from the active repeated content root copy to its previous sibling', () => {
    const { bodyEditor, mainEditor } = createRepeatedProjectionFixture();
    const event = keyEvent('ArrowLeft');

    selectPoint(bodyEditor, { path: [0, 0], offset: 0 });

    const result = applyContentRootNavigation({
      editor: bodyEditor,
      event,
      getActiveContentRootOwner: (root) =>
        root === 'card:body'
          ? { childRoot: 'card:body', ownerPath: [3], ownerRoot: 'main' }
          : null,
      getMountedViewEditor: (root) =>
        root === 'main' ? mainEditor : bodyEditor,
      isRTL: false,
      selection: bodyEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(mainEditor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [2, 0], offset: 'Between'.length },
      focus: { path: [2, 0], offset: 'Between'.length },
    });
  });

  it('moves backward from the content root start back to the owner position', () => {
    const { bodyEditor, mainEditor } = createFixture();
    const event = keyEvent('ArrowLeft');
    const focusEditor = vi.fn();

    selectPoint(bodyEditor, { path: [0, 0], offset: 0 });

    const result = applyContentRootNavigation({
      editor: bodyEditor,
      event,
      focusEditor,
      getMountedViewEditor: (root) =>
        root === 'main' ? mainEditor : bodyEditor,
      isRTL: false,
      selection: bodyEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(mainEditor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 'Before'.length },
      focus: { path: [0, 0], offset: 'Before'.length },
    });
    expect(bodyEditor.read((state) => state.selection.get())).toBe(null);
    expect(focusEditor).toHaveBeenCalledWith(mainEditor);
  });

  it('uses the selection root when nested contenteditable events reach the containing editor', () => {
    const { bodyEditor, mainEditor } = createFixture();
    const event = keyEvent('ArrowLeft');

    selectPoint(bodyEditor, { path: [0, 0], offset: 0 });

    const result = applyContentRootNavigation({
      editor: mainEditor,
      event,
      getMountedViewEditor: (root) =>
        root === 'main' ? mainEditor : bodyEditor,
      isRTL: false,
      selection: bodyEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(mainEditor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 'Before'.length },
      focus: { path: [0, 0], offset: 'Before'.length },
    });
  });

  it('keeps Backspace at the content root start as boundary navigation', () => {
    const { bodyEditor, mainEditor } = createFixture();
    const event = keyEvent('Backspace');

    selectPoint(bodyEditor, { path: [0, 0], offset: 0 });

    const result = applyContentRootNavigation({
      editor: bodyEditor,
      event,
      getMountedViewEditor: (root) =>
        root === 'main' ? mainEditor : bodyEditor,
      isRTL: false,
      selection: bodyEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(mainEditor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 'Before'.length },
      focus: { path: [0, 0], offset: 'Before'.length },
    });
    expect(runtimeValue(mainEditor).roots?.['card:body']).toEqual([
      paragraph('Inside'),
    ]);
  });

  it('extends an existing projected selection by word from the projected focus', () => {
    const { bodyEditor, mainEditor } = createFixture();
    const event = keyEvent('ArrowRight', {
      ctrlKey: true,
      shiftKey: true,
    });
    const owner = {
      childRoot: 'card:body',
      ownerPath: [1],
      ownerRoot: 'main',
    } as const;
    const graph = createContentRootProjectionGraph(mainEditor, [owner]);

    selectPoint(mainEditor, { path: [0, 0], offset: 'Before'.length });
    writeSlateViewSelection(
      mainEditor,
      createSlateViewSelection(graph, {
        anchor: { point: { path: [0, 0], offset: 'Before'.length } },
        focus: {
          owner,
          point: { path: [0, 0], root: 'card:body', offset: 2 },
        },
      })
    );

    const result = applyContentRootViewSelection({
      editor: mainEditor,
      event,
      getContentRootOwnerViewEditor: (candidate) =>
        candidate.ownerPath[0] === 1 ? bodyEditor : null,
      getMountedViewEditor: (root) =>
        root === 'card:body' ? bodyEditor : mainEditor,
      isRTL: false,
      selection: mainEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(readSlateViewSelection(mainEditor)).toMatchObject({
      anchor: { point: { path: [0, 0], offset: 'Before'.length } },
      focus: {
        owner,
        point: { path: [0, 0], root: 'card:body', offset: 'Inside'.length },
      },
    });
  });

  it('promotes an expanded local selection at a content-root boundary into a projected selection', () => {
    const { bodyEditor, mainEditor } = createFixture();
    const event = keyEvent('ArrowRight', { shiftKey: true });

    mainEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 'Before'.length - 1 },
        focus: { path: [0, 0], offset: 'Before'.length },
      });
    });

    const result = applyContentRootViewSelection({
      editor: mainEditor,
      event,
      getContentRootOwnerViewEditor: (candidate) =>
        candidate.ownerPath[0] === 1 ? bodyEditor : null,
      getMountedViewEditor: (root) =>
        root === 'card:body' ? bodyEditor : mainEditor,
      isRTL: false,
      selection: mainEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(readSlateViewSelection(mainEditor)).toMatchObject({
      anchor: { point: { path: [0, 0], offset: 'Before'.length - 1 } },
      focus: {
        owner: {
          childRoot: 'card:body',
          ownerPath: [1],
          ownerRoot: 'main',
        },
        point: { path: [0, 0], root: 'card:body', offset: 1 },
      },
    });
  });

  it('keeps the real anchor when promoting a backward selection into a content root', () => {
    const { bodyEditor, mainEditor } = createFixture();
    const event = keyEvent('ArrowRight', { shiftKey: true });

    mainEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'Before'.length },
      });
    });

    const result = applyContentRootViewSelection({
      editor: mainEditor,
      event,
      getContentRootOwnerViewEditor: (candidate) =>
        candidate.ownerPath[0] === 1 ? bodyEditor : null,
      getMountedViewEditor: (root) =>
        root === 'card:body' ? bodyEditor : mainEditor,
      isRTL: false,
      selection: mainEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(readSlateViewSelection(mainEditor)).toMatchObject({
      anchor: { point: { path: [2, 0], offset: 0 } },
      focus: {
        owner: {
          childRoot: 'card:body',
          ownerPath: [1],
          ownerRoot: 'main',
        },
        point: { path: [0, 0], root: 'card:body', offset: 1 },
      },
    });
  });

  it('extends a projected selection to the content-root block end with command-shift-right', () => {
    const { bodyEditor, mainEditor } = createFixture();
    const event = keyEvent('ArrowRight', { metaKey: true, shiftKey: true });
    const owner = {
      childRoot: 'card:body',
      ownerPath: [1],
      ownerRoot: 'main',
    } as const;
    const graph = createContentRootProjectionGraph(mainEditor, [owner]);

    selectPoint(mainEditor, { path: [0, 0], offset: 0 });
    writeSlateViewSelection(
      mainEditor,
      createSlateViewSelection(graph, {
        anchor: { point: { path: [0, 0], offset: 0 } },
        focus: {
          owner,
          point: { path: [0, 0], root: 'card:body', offset: 2 },
        },
      })
    );

    const result = applyContentRootViewSelection({
      editor: mainEditor,
      event,
      getContentRootOwnerViewEditor: (candidate) =>
        candidate.ownerPath[0] === 1 ? bodyEditor : null,
      getMountedViewEditor: (root) =>
        root === 'card:body' ? bodyEditor : mainEditor,
      isRTL: false,
      selection: mainEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(readSlateViewSelection(mainEditor)).toMatchObject({
      anchor: { point: { path: [0, 0], offset: 0 } },
      focus: {
        owner,
        point: { path: [0, 0], root: 'card:body', offset: 'Inside'.length },
      },
    });
  });

  it('enters the content root from a selected owner placeholder', () => {
    const { bodyEditor, mainEditor } = createFixture();
    const event = keyEvent('Enter');

    selectPoint(mainEditor, { path: [1, 0], offset: 0 });

    const result = applyContentRootNavigation({
      editor: mainEditor,
      event,
      getMountedViewEditor: (root) =>
        root === 'card:body' ? bodyEditor : mainEditor,
      isRTL: false,
      selection: mainEditor.read((state) => state.selection.get()),
    });

    expect(result.handled).toBe(true);
    expect(bodyEditor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 0, root: 'card:body' },
      focus: { path: [0, 0], offset: 0, root: 'card:body' },
    });
  });

  it('builds projected selection graph nodes for nested content roots', () => {
    const runtime = createEditorRuntime({
      extensions: [contentRootExtension],
      initialValue: {
        children: [
          section([paragraph('Before'), contentCard(), paragraph('After')]),
        ],
        roots: { 'card:body': [paragraph('Inside')] },
      },
    });
    const mainEditor = createEditorView(
      runtime
    ) as unknown as ReactRuntimeEditor;
    const owner = {
      childRoot: 'card:body',
      ownerPath: [0, 1],
      ownerRoot: 'main',
    } as const;
    const graph = createContentRootProjectionGraph(mainEditor, [owner]);
    const selection = createSlateViewSelection(graph, {
      anchor: { point: { path: [0, 0, 0], offset: 'Before'.length } },
      focus: {
        owner,
        point: { path: [0, 0], offset: 'In'.length, root: 'card:body' },
      },
    });

    expect(
      selection.segments.parts.map((part) => ({
        ownerPath: part.owner?.ownerPath ?? null,
        root: part.root,
      }))
    ).toEqual([
      { ownerPath: null, root: 'main' },
      { ownerPath: [0, 1], root: 'card:body' },
    ]);
  });

  it('orders nested content roots inside content roots as visible sibling blocks', () => {
    const runtime = createEditorRuntime({
      extensions: [contentRootExtension],
      initialValue: {
        children: [paragraph('Before'), contentCard(), paragraph('After')],
        roots: {
          'card:body': [
            section([
              paragraph('Inside before'),
              contentCard('nested:body'),
              paragraph('Inside after'),
            ]),
          ],
          'nested:body': [paragraph('Deep')],
        },
      },
    });
    const mainEditor = createEditorView(
      runtime
    ) as unknown as ReactRuntimeEditor;
    const owners = findContentRootOwners(mainEditor);
    const cardOwner = owners.find((owner) => owner.childRoot === 'card:body')!;
    const nestedOwner = owners.find(
      (owner) => owner.childRoot === 'nested:body'
    )!;
    const graph = createContentRootProjectionGraph(mainEditor, owners);
    const selectionIntoNested = createSlateViewSelection(graph, {
      anchor: { point: { path: [0, 0], offset: 'Before'.length } },
      focus: {
        owner: nestedOwner,
        point: {
          path: [0, 0],
          root: 'nested:body',
          offset: 'Deep'.length,
        },
      },
    });
    const selectionOutOfNested = createSlateViewSelection(graph, {
      anchor: {
        owner: nestedOwner,
        point: {
          path: [0, 0],
          root: 'nested:body',
          offset: 'Deep'.length,
        },
      },
      focus: { point: { path: [2, 0], offset: 0 } },
    });
    const summarizeParts = (selection: typeof selectionIntoNested) =>
      selection.segments.parts.map((part) => ({
        ownerPath: part.owner?.ownerPath ?? null,
        ownerRoot: part.owner?.ownerRoot ?? null,
        root: part.root,
      }));

    expect(cardOwner).toMatchObject({
      childRoot: 'card:body',
      ownerPath: [1],
      ownerRoot: 'main',
    });
    expect(nestedOwner).toMatchObject({
      childRoot: 'nested:body',
      ownerPath: [0, 1],
      ownerRoot: 'card:body',
    });
    expect(summarizeParts(selectionIntoNested)).toEqual([
      { ownerPath: null, ownerRoot: null, root: 'main' },
      { ownerPath: [1], ownerRoot: 'main', root: 'card:body' },
      { ownerPath: [0, 1], ownerRoot: 'card:body', root: 'nested:body' },
    ]);
    expect(summarizeParts(selectionOutOfNested)).toEqual([
      { ownerPath: [0, 1], ownerRoot: 'card:body', root: 'nested:body' },
      { ownerPath: [1], ownerRoot: 'main', root: 'card:body' },
      { ownerPath: null, ownerRoot: null, root: 'main' },
    ]);
  });
});

const runtimeValue = (editor: ReactRuntimeEditor) =>
  editor.read((state) => state.value.get());
