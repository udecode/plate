import type { ClipboardEvent } from 'react';
import {
  createEditorRuntime,
  createEditorView,
  defineEditorExtension,
  type Point,
  type RootKey,
} from '@platejs/slate';
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  setDOMClipboardFormatKey,
} from '@platejs/slate-dom/internal';
import { describe, expect, it, vi } from 'vitest';

import { applyEditableCut } from '../src/editable/clipboard-input-strategy';
import {
  getProjectedViewSelectionFragment,
  writeProjectedViewSelectionClipboardData,
} from '../src/editable/projected-clipboard';
import type { ReactRuntimeEditor } from '../src/plugin/react-editor';
import {
  createSlateProjectionGraph,
  type SlateProjectionOwner,
} from '../src/projection-graph';
import {
  createSlateViewSelection,
  readSlateViewSelection,
  writeSlateViewSelection,
} from '../src/view-selection';

const SHARED_ROOT = 'synced-block:shared:body' as RootKey;

const contentRootExtension = defineEditorExtension({
  elements: [
    {
      type: 'content-card',
      contentRoot: { slot: 'body' },
      void: 'editable-island',
    },
  ],
  name: 'projected-clipboard-test',
});

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

const contentCard = (bodyRoot = SHARED_ROOT) => ({
  type: 'content-card',
  childRoots: { body: bodyRoot },
  children: [{ text: '' }],
});

const sharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [1],
  ownerRoot: 'main',
} satisfies SlateProjectionOwner;

const secondSharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [3],
  ownerRoot: 'main',
} satisfies SlateProjectionOwner;

const point = (
  root: RootKey | undefined,
  path: readonly number[],
  offset: number
): Point => ({
  ...(root ? { root } : {}),
  path: [...path],
  offset,
});

const createFixture = () => {
  const runtime = createEditorRuntime({
    extensions: [contentRootExtension],
    initialValue: {
      children: [paragraph('Before'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('Inside'), paragraph('More')] },
    },
  });
  const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
  const graph = createSlateProjectionGraph([
    { path: [0], root: 'main' },
    { owner: sharedOwner, path: [0], root: SHARED_ROOT },
  ]);

  writeSlateViewSelection(
    editor,
    createSlateViewSelection(graph, {
      anchor: { point: point(undefined, [0, 0], 'Bef'.length) },
      focus: {
        owner: sharedOwner,
        point: point(SHARED_ROOT, [0, 0], 'In'.length),
      },
    })
  );

  return { editor };
};

const createRepeatedFixture = () => {
  const runtime = createEditorRuntime({
    extensions: [contentRootExtension],
    initialValue: {
      children: [
        paragraph('First'),
        contentCard(),
        paragraph('Between'),
        contentCard(),
        paragraph('Last'),
      ],
      roots: { [SHARED_ROOT]: [paragraph('Inside')] },
    },
  });
  const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
  const graph = createSlateProjectionGraph([
    { path: [0], root: 'main' },
    { owner: sharedOwner, path: [0], root: SHARED_ROOT },
    { path: [2], root: 'main' },
    { owner: secondSharedOwner, path: [0], root: SHARED_ROOT },
    { path: [4], root: 'main' },
  ]);

  writeSlateViewSelection(
    editor,
    createSlateViewSelection(graph, {
      anchor: {
        owner: sharedOwner,
        point: point(SHARED_ROOT, [0, 0], 'In'.length),
      },
      focus: {
        owner: secondSharedOwner,
        point: point(SHARED_ROOT, [0, 0], 'Insi'.length),
      },
    })
  );

  return { editor };
};

const createClipboardData = () => {
  const data = new Map<string, string>();

  return {
    data,
    setData: (type: string, value: string) => {
      data.set(type, value);
    },
  };
};

const mountEditorRoot = (editor: ReactRuntimeEditor) => {
  const root = document.createElement('div');

  root.setAttribute('contenteditable', 'true');
  root.setAttribute('data-slate-editor', 'true');
  Object.defineProperty(root, 'isContentEditable', {
    configurable: true,
    value: true,
  });
  document.body.append(root);

  EDITOR_TO_ELEMENT.set(editor, root);
  EDITOR_TO_WINDOW.set(editor, window);
  ELEMENT_TO_NODE.set(root, editor);
  NODE_TO_ELEMENT.set(editor, root);

  return root;
};

const cleanupEditorRoot = (editor: ReactRuntimeEditor, root: HTMLElement) => {
  EDITOR_TO_ELEMENT.delete(editor);
  EDITOR_TO_WINDOW.delete(editor);
  ELEMENT_TO_NODE.delete(root);
  NODE_TO_ELEMENT.delete(editor);
  root.remove();
};

const createClipboardEvent = (
  target: EventTarget,
  clipboardData: ReturnType<typeof createClipboardData>
) =>
  ({
    clipboardData,
    nativeEvent: { clipboardData },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target,
  }) as unknown as ClipboardEvent<HTMLDivElement>;

const decodeSlateFragment = (encoded: string) =>
  JSON.parse(decodeURIComponent(globalThis.atob(encoded)));

describe('projected clipboard', () => {
  it('serializes projected selection fragments in visible order across roots', () => {
    const { editor } = createFixture();

    expect(getProjectedViewSelectionFragment(editor)).toEqual([
      paragraph('ore'),
      paragraph('In'),
    ]);
  });

  it('writes plain text, html, and Slate fragment data from the projected model selection', () => {
    const { editor } = createFixture();
    const clipboardData = createClipboardData();

    expect(
      writeProjectedViewSelectionClipboardData(editor, clipboardData)
    ).toBe(true);
    expect(clipboardData.data.get('text/plain')).toBe('ore\nIn');
    expect(clipboardData.data.get('text/html')).toContain(
      'data-slate-fragment='
    );
    expect(
      decodeSlateFragment(
        clipboardData.data.get('application/x-slate-fragment')!
      )
    ).toEqual([paragraph('ore'), paragraph('In')]);
  });

  it('uses the editor clipboard format key for projected Slate fragment data', () => {
    const { editor } = createFixture();
    const clipboardData = createClipboardData();

    setDOMClipboardFormatKey(editor, 'x-custom-slate-fragment');

    expect(
      writeProjectedViewSelectionClipboardData(editor, clipboardData)
    ).toBe(true);
    expect(clipboardData.data.get('application/x-slate-fragment')).toBe(
      undefined
    );
    expect(
      decodeSlateFragment(
        clipboardData.data.get('application/x-custom-slate-fragment')!
      )
    ).toEqual([paragraph('ore'), paragraph('In')]);
    expect(clipboardData.data.get('text/html')).toContain(
      'data-slate-fragment-format="x-custom-slate-fragment"'
    );
  });

  it('uses the runtime clipboard format key when projected copy runs from a view editor', () => {
    const { editor } = createFixture();
    const clipboardData = createClipboardData();
    const runtimeEditor = (
      editor as { runtime: { editor: ReactRuntimeEditor } }
    ).runtime.editor;

    setDOMClipboardFormatKey(runtimeEditor, 'x-custom-slate-fragment');

    expect(
      writeProjectedViewSelectionClipboardData(editor, clipboardData)
    ).toBe(true);
    expect(clipboardData.data.get('application/x-slate-fragment')).toBe(
      undefined
    );
    expect(
      decodeSlateFragment(
        clipboardData.data.get('application/x-custom-slate-fragment')!
      )
    ).toEqual([paragraph('ore'), paragraph('In')]);
    expect(clipboardData.data.get('text/html')).toContain(
      'data-slate-fragment-format="x-custom-slate-fragment"'
    );
  });

  it('serializes repeated content-root owners as visible clipboard fragments', () => {
    const { editor } = createRepeatedFixture();
    const clipboardData = createClipboardData();

    expect(getProjectedViewSelectionFragment(editor)).toEqual([
      paragraph('side'),
      paragraph('Between'),
      paragraph('Insi'),
    ]);
    expect(
      writeProjectedViewSelectionClipboardData(editor, clipboardData)
    ).toBe(true);
    expect(clipboardData.data.get('text/plain')).toBe('side\nBetween\nInsi');
    expect(
      decodeSlateFragment(
        clipboardData.data.get('application/x-slate-fragment')!
      )
    ).toEqual([paragraph('side'), paragraph('Between'), paragraph('Insi')]);
  });

  it('does not cut repeated content-root owners that cannot be deleted as one model mutation', () => {
    const { editor } = createRepeatedFixture();
    const clipboardData = createClipboardData();
    const root = mountEditorRoot(editor);
    const event = createClipboardEvent(root, clipboardData);

    try {
      const beforeValue = structuredClone(
        editor.read((state) => state.value.get())
      );
      const beforeSelection = readSlateViewSelection(editor);

      expect(beforeSelection).not.toBe(null);

      const result = applyEditableCut({
        editor,
        event,
        readOnly: false,
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.command).toBe(null);
      expect(clipboardData.data.size).toBe(0);
      expect(editor.read((state) => state.value.get())).toEqual(beforeValue);
      expect(readSlateViewSelection(editor)).toEqual(beforeSelection);
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });
});
