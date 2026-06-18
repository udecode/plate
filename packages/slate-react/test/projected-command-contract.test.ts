import { readFileSync } from 'node:fs';
import {
  createEditorRuntime,
  createEditorView,
  defineEditorExtension,
  type EditorExtension,
  type Point,
  type RootKey,
} from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';
import { dom } from '@platejs/slate-dom';
import { setDOMClipboardFormatKey } from '@platejs/slate-dom/internal';
import { history } from '@platejs/slate-history';
import { describe, expect, it } from 'vitest';
import {
  applyEditableCommand,
  applyModelOwnedHistoryIntent,
  applyModelOwnedTextInput,
} from '../src/editable/mutation-controller';
import type { ReactRuntimeEditor } from '../src/plugin/react-editor';
import {
  createSlateProjectionGraph,
  type SlateProjectionOwner,
} from '../src/projection-graph';
import {
  createSlateViewSelection,
  readSlateViewSelection,
  subscribeSlateViewSelection,
  writeSlateViewSelection,
} from '../src/view-selection';

const SHARED_ROOT = 'synced-block:shared:body' as RootKey;

class FakeDataTransfer {
  private readonly store = new Map<string, string>();

  get types() {
    return Array.from(this.store.keys());
  }

  getData(type: string) {
    return this.store.get(type) ?? '';
  }

  setData(type: string, value: string) {
    this.store.set(type, value);
  }
}

const encodeSlateFragment = (fragment: unknown) =>
  globalThis.btoa(encodeURIComponent(JSON.stringify(fragment)));

const contentRootExtension = defineEditorExtension({
  elements: [
    {
      type: 'content-card',
      contentRoot: { slot: 'body' },
      void: 'editable-island',
    },
  ],
  name: 'projected-command-test',
});

const inlineLinkExtension = defineEditorExtension({
  elements: [{ inline: true, type: 'link' }],
  name: 'projected-command-inline-test',
});

const structuralListExtension = defineEditorExtension({
  elements: [{ type: 'bulleted-list' }, { type: 'list-item' }],
  name: 'projected-command-structural-list-test',
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

const createFixture = (extensions: EditorExtension[] = []) => {
  const runtime = createEditorRuntime({
    extensions: [history(), dom(), contentRootExtension, ...extensions],
    initialValue: {
      children: [paragraph('Before'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('Inside'), paragraph('More')] },
    },
  });
  const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
  const graph = createSlateProjectionGraph([
    { path: [0], root: 'main' },
    { owner: sharedOwner, path: [0], root: SHARED_ROOT },
    { owner: sharedOwner, path: [1], root: SHARED_ROOT },
    { path: [2], root: 'main' },
  ]);

  return { editor, graph };
};

const createRepeatedRootFixture = () => {
  const runtime = createEditorRuntime({
    extensions: [history(), dom(), contentRootExtension],
    initialValue: {
      children: [
        paragraph('Before'),
        contentCard(),
        paragraph('Between'),
        contentCard(),
        paragraph('After'),
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

  return { editor, graph };
};

const getCanonicalRuntimeEditor = (editor: ReactRuntimeEditor) =>
  ((editor as { runtime?: { editor?: ReactRuntimeEditor } }).runtime?.editor ??
    editor) as ReactRuntimeEditor;

const writeForwardProjectedSelection = (
  editor: ReactRuntimeEditor,
  graph: ReturnType<typeof createSlateProjectionGraph>
) => {
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
};

const writeAmbiguousRepeatedSelection = (
  editor: ReactRuntimeEditor,
  graph: ReturnType<typeof createSlateProjectionGraph>
) => {
  writeSlateViewSelection(
    editor,
    createSlateViewSelection(graph, {
      anchor: {
        owner: sharedOwner,
        point: point(SHARED_ROOT, [0, 0], 1),
      },
      focus: {
        owner: secondSharedOwner,
        point: point(SHARED_ROOT, [0, 0], 3),
      },
    })
  );
};

describe('projected editable commands', () => {
  it('keeps full-block delete-fragment profiler buckets for huge-document attribution', () => {
    const source = readFileSync(
      'src/editable/mutation-full-block-editing.ts',
      'utf8'
    );

    expect(source).toContain('delete-fragment.full-top-level-paths');
    expect(source).toContain('delete-fragment.consistent-marks');
    expect(source).toContain('delete-fragment.selected-children');
    expect(source).toContain('delete-fragment.replay-replace');
    expect(source).toContain('markInternalOwnedReplayOperation');
  });

  it('typing over a projected selection replaces the visible span across roots in one commit', () => {
    const { editor, graph } = createFixture();

    writeForwardProjectedSelection(editor, graph);
    expect(readSlateViewSelection(editor)).not.toBe(null);

    expect(
      applyEditableCommand({
        command: { inputType: 'insertText', kind: 'insert-text', text: 'X' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('BefX'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('side'), paragraph('More')] },
    });
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 'BefX'.length },
      focus: { path: [0, 0], offset: 'BefX'.length },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
    const textOperations = Editor.getLastCommit(editor)?.operations.filter(
      (operation) =>
        operation.type === 'insert_text' || operation.type === 'remove_text'
    );

    expect(textOperations).toEqual([
      {
        offset: 0,
        path: [0, 0],
        root: SHARED_ROOT,
        text: 'In',
        type: 'remove_text',
      },
      {
        offset: 'Bef'.length,
        path: [0, 0],
        text: 'ore',
        type: 'remove_text',
      },
      {
        offset: 'Bef'.length,
        path: [0, 0],
        text: 'X',
        type: 'insert_text',
      },
    ]);
  });

  it('pasting over a projected selection replaces the visible span at the projected start', () => {
    const { editor, graph } = createFixture();
    const data = new FakeDataTransfer();

    editor.update((tx) => {
      tx.selection.set({
        anchor: point(undefined, [2, 0], 0),
        focus: point(undefined, [2, 0], 0),
      });
    });
    writeForwardProjectedSelection(editor, graph);
    data.setData('text/plain', 'Z');

    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('BefZ'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('side'), paragraph('More')] },
    });
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 'BefZ'.length },
      focus: { path: [0, 0], offset: 'BefZ'.length },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('pasting from a content root into the owner document is rooted at the projected start', () => {
    const { editor } = createFixture();
    const data = new FakeDataTransfer();
    const graph = createSlateProjectionGraph([
      { path: [0], root: 'main' },
      { owner: sharedOwner, path: [0], root: SHARED_ROOT },
      { owner: sharedOwner, path: [1], root: SHARED_ROOT },
      { path: [2], root: 'main' },
    ]);

    writeSlateViewSelection(
      editor,
      createSlateViewSelection(graph, {
        anchor: {
          owner: sharedOwner,
          point: point(SHARED_ROOT, [0, 0], 'In'.length),
        },
        focus: { point: point(undefined, [2, 0], 'Af'.length) },
      })
    );
    data.setData('text/plain', 'Z');

    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('Before'), contentCard(), paragraph('ter')],
      roots: { [SHARED_ROOT]: [paragraph('InZ')] },
    });
    expect(Editor.getSelection(getCanonicalRuntimeEditor(editor))).toEqual({
      anchor: { path: [0, 0], offset: 'InZ'.length, root: SHARED_ROOT },
      focus: { path: [0, 0], offset: 'InZ'.length, root: SHARED_ROOT },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('unsupported projected paste payloads preserve the projected selection', () => {
    const { editor, graph } = createFixture();
    const data = new FakeDataTransfer();

    writeForwardProjectedSelection(editor, graph);
    data.setData('application/octet-stream', 'ignored');

    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('Before'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('Inside'), paragraph('More')] },
    });
    expect(readSlateViewSelection(editor)).not.toBe(null);
  });

  it('declining clipboard handlers preserve unsupported projected paste payloads', () => {
    let insertCount = 0;
    const clipboardExtension = defineEditorExtension({
      clipboard: {
        insertData() {
          insertCount++;

          return false;
        },
      },
      name: 'projected-command-declining-clipboard',
    });
    const { editor, graph } = createFixture([clipboardExtension]);
    const data = new FakeDataTransfer();

    writeForwardProjectedSelection(editor, graph);
    data.setData('application/octet-stream', 'ignored');

    const beforeViewSelection = readSlateViewSelection(editor);

    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);

    expect(insertCount).toBe(1);
    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('Before'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('Inside'), paragraph('More')] },
    });
    expect(readSlateViewSelection(editor)).toEqual(beforeViewSelection);
  });

  it('pasting a Slate fragment without plain text replaces the projected selection', () => {
    const { editor, graph } = createFixture();
    const data = new FakeDataTransfer();

    writeForwardProjectedSelection(editor, graph);
    data.setData(
      'application/x-slate-fragment',
      encodeSlateFragment([paragraph('Z')])
    );

    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('BefZ'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('side'), paragraph('More')] },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('preserves projected selection for an empty Slate fragment paste so typing can replace it', () => {
    const { editor, graph } = createFixture();
    const data = new FakeDataTransfer();

    writeForwardProjectedSelection(editor, graph);
    data.setData('application/x-slate-fragment', encodeSlateFragment([]));

    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('Before'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('Inside'), paragraph('More')] },
    });
    expect(readSlateViewSelection(editor)).not.toBe(null);

    expect(
      applyEditableCommand({
        command: { inputType: 'insertText', kind: 'insert-text', text: 'Z' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('BefZ'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('side'), paragraph('More')] },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('falls back to plain text for empty Slate fragments over projected selections', () => {
    const { editor, graph } = createFixture();
    const data = new FakeDataTransfer();

    writeForwardProjectedSelection(editor, graph);
    data.setData('application/x-slate-fragment', encodeSlateFragment([]));
    data.setData('text/plain', 'Z');

    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('BefZ'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('side'), paragraph('More')] },
    });
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 'BefZ'.length },
      focus: { path: [0, 0], offset: 'BefZ'.length },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('lets clipboard insertData handlers own projected Slate fragment pastes', () => {
    let insertCount = 0;
    const clipboardExtension = defineEditorExtension({
      clipboard: {
        insertData(_data, { editor: receivedEditor }) {
          insertCount++;
          Editor.insertText(receivedEditor, 'H');

          return true;
        },
      },
      name: 'projected-command-custom-clipboard',
    });
    const { editor, graph } = createFixture([clipboardExtension]);
    const data = new FakeDataTransfer();

    writeForwardProjectedSelection(editor, graph);
    data.setData(
      'application/x-slate-fragment',
      encodeSlateFragment([paragraph('Z')])
    );

    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);

    expect(insertCount).toBe(1);
    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('BefH'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('side'), paragraph('More')] },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('offers unsupported projected paste payloads to clipboard handlers', () => {
    let insertCount = 0;
    const clipboardExtension = defineEditorExtension({
      clipboard: {
        insertData(_data, { editor: receivedEditor }) {
          insertCount++;
          Editor.insertText(receivedEditor, 'H');

          return true;
        },
      },
      name: 'projected-command-custom-payload-clipboard',
    });
    const { editor, graph } = createFixture([clipboardExtension]);
    const data = new FakeDataTransfer();

    writeForwardProjectedSelection(editor, graph);
    data.setData('application/x-custom-image', 'opaque');

    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);

    expect(insertCount).toBe(1);
    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('BefH'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('side'), paragraph('More')] },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('releases projected range refs when clipboard insertData handlers throw', () => {
    const pasteError = new Error('custom paste failed');
    const clipboardExtension = defineEditorExtension({
      clipboard: {
        insertData() {
          throw pasteError;
        },
      },
      name: 'projected-command-throwing-clipboard',
    });
    const { editor, graph } = createFixture([clipboardExtension]);
    const data = new FakeDataTransfer();

    writeForwardProjectedSelection(editor, graph);
    data.setData('application/octet-stream', 'opaque');

    expect(() =>
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toThrow(pasteError);

    expect(Editor.rangeRefs(getCanonicalRuntimeEditor(editor)).size).toBe(0);
    expect(readSlateViewSelection(editor)).not.toBe(null);
  });

  it('ignores foreign Slate HTML fragments without deleting projected text', () => {
    const { editor, graph } = createFixture();
    const data = new FakeDataTransfer();
    const fragment = encodeSlateFragment([paragraph('Z')]);

    writeForwardProjectedSelection(editor, graph);
    data.setData(
      'text/html',
      `<span data-slate-fragment="${fragment}" data-slate-fragment-format="foreign-slate">Z</span>`
    );

    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('Before'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('Inside'), paragraph('More')] },
    });
    expect(readSlateViewSelection(editor)).not.toBe(null);
  });

  it('ignores text that only looks like a Slate HTML fragment attribute', () => {
    const { editor, graph } = createFixture();
    const data = new FakeDataTransfer();
    const fragment = encodeSlateFragment([paragraph('Z')]);

    writeForwardProjectedSelection(editor, graph);
    data.setData(
      'text/html',
      `<pre>data-slate-fragment="${fragment}" data-slate-fragment-format="x-slate-fragment"</pre>`
    );

    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('Before'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('Inside'), paragraph('More')] },
    });
    expect(readSlateViewSelection(editor)).not.toBe(null);
  });

  it('delete-fragment over a projected selection deletes the visible span and collapses at the visual start', () => {
    const { editor, graph } = createFixture();

    writeForwardProjectedSelection(editor, graph);

    expect(
      applyEditableCommand({
        command: { kind: 'delete-fragment' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('Bef'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('side'), paragraph('More')] },
    });
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 'Bef'.length },
      focus: { path: [0, 0], offset: 'Bef'.length },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('delete-fragment from a content root into the owner document deletes each rooted segment', () => {
    const { editor } = createFixture();
    const graph = createSlateProjectionGraph([
      { path: [0], root: 'main' },
      { owner: sharedOwner, path: [0], root: SHARED_ROOT },
      { owner: sharedOwner, path: [1], root: SHARED_ROOT },
      { path: [2], root: 'main' },
    ]);

    writeSlateViewSelection(
      editor,
      createSlateViewSelection(graph, {
        anchor: {
          owner: sharedOwner,
          point: point(SHARED_ROOT, [0, 0], 'In'.length),
        },
        focus: { point: point(undefined, [2, 0], 'Af'.length) },
      })
    );

    expect(
      applyEditableCommand({
        command: { kind: 'delete-fragment' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('Before'), contentCard(), paragraph('ter')],
      roots: { [SHARED_ROOT]: [paragraph('In')] },
    });
    expect(Editor.getSelection(getCanonicalRuntimeEditor(editor))).toEqual({
      anchor: { path: [0, 0], offset: 'In'.length, root: SHARED_ROOT },
      focus: { path: [0, 0], offset: 'In'.length, root: SHARED_ROOT },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('insert-break over a projected selection replaces the visible span at the projected start', () => {
    const { editor, graph } = createFixture();

    writeForwardProjectedSelection(editor, graph);

    expect(
      applyEditableCommand({
        command: { kind: 'insert-break', variant: 'paragraph' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [
        paragraph('Bef'),
        paragraph(''),
        contentCard(),
        paragraph('After'),
      ],
      roots: { [SHARED_ROOT]: [paragraph('side'), paragraph('More')] },
    });
    expect(Editor.getSelection(getCanonicalRuntimeEditor(editor))).toEqual({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('insert-break from a content root into the owner document deletes each rooted segment', () => {
    const { editor } = createFixture();
    const graph = createSlateProjectionGraph([
      { path: [0], root: 'main' },
      { owner: sharedOwner, path: [0], root: SHARED_ROOT },
      { owner: sharedOwner, path: [1], root: SHARED_ROOT },
      { path: [2], root: 'main' },
    ]);

    writeSlateViewSelection(
      editor,
      createSlateViewSelection(graph, {
        anchor: {
          owner: sharedOwner,
          point: point(SHARED_ROOT, [0, 0], 'In'.length),
        },
        focus: { point: point(undefined, [2, 0], 'Af'.length) },
      })
    );

    expect(
      applyEditableCommand({
        command: { kind: 'insert-break', variant: 'paragraph' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('Before'), contentCard(), paragraph('ter')],
      roots: { [SHARED_ROOT]: [paragraph('In'), paragraph('')] },
    });
    expect(Editor.getSelection(getCanonicalRuntimeEditor(editor))).toEqual({
      anchor: { path: [1, 0], offset: 0, root: SHARED_ROOT },
      focus: { path: [1, 0], offset: 0, root: SHARED_ROOT },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('open-line over a projected selection keeps the insertion rooted in the content root', () => {
    const { editor } = createFixture();
    const graph = createSlateProjectionGraph([
      { path: [0], root: 'main' },
      { owner: sharedOwner, path: [0], root: SHARED_ROOT },
      { owner: sharedOwner, path: [1], root: SHARED_ROOT },
      { path: [2], root: 'main' },
    ]);

    writeSlateViewSelection(
      editor,
      createSlateViewSelection(graph, {
        anchor: {
          owner: sharedOwner,
          point: point(SHARED_ROOT, [0, 0], 'In'.length),
        },
        focus: { point: point(undefined, [2, 0], 'Af'.length) },
      })
    );

    expect(
      applyEditableCommand({
        command: { kind: 'insert-break', variant: 'open-line' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('Before'), contentCard(), paragraph('ter')],
      roots: { [SHARED_ROOT]: [paragraph(''), paragraph('In')] },
    });
    expect(Editor.getSelection(getCanonicalRuntimeEditor(editor))).toEqual({
      anchor: { path: [0, 0], offset: 0, root: SHARED_ROOT },
      focus: { path: [0, 0], offset: 0, root: SHARED_ROOT },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('delete-fragment honors an explicit model selection target', () => {
    const seenDirections: Array<string | undefined> = [];
    const runtime = createEditorRuntime({
      extensions: [
        defineEditorExtension({
          name: 'projected-command-delete-fragment-middleware',
          transforms: {
            deleteFragment({ next, options }) {
              seenDirections.push(options?.direction);

              return next();
            },
          },
        }),
      ],
      initialValue: [paragraph('alpha beta')],
    });
    const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;

    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 'alpha beta'.length },
        focus: { path: [0, 0], offset: 'alpha beta'.length },
      });
    });

    expect(
      applyEditableCommand({
        command: {
          kind: 'delete-fragment',
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 'alpha'.length },
          },
        },
        editor,
      })
    ).toBe(true);

    expect(seenDirections).toEqual([undefined]);
    expect(Editor.string(editor, [0])).toBe(' beta');
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('delete-fragment with a collapsed model selection does not delete text', () => {
    const runtime = createEditorRuntime({
      initialValue: [paragraph('alpha')],
    });
    const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;

    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
    });

    expect(
      applyEditableCommand({
        command: {
          kind: 'delete-fragment',
          selection: {
            anchor: { path: [0, 0], offset: 2 },
            focus: { path: [0, 0], offset: 2 },
          },
        },
        editor,
      })
    ).toBe(true);

    expect(Editor.string(editor, [0])).toBe('alpha');
  });

  it('delete-fragment over a whole single paragraph keeps the block', () => {
    const runtime = createEditorRuntime({
      initialValue: [paragraph('alpha')],
    });
    const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;

    expect(
      applyEditableCommand({
        command: {
          kind: 'delete-fragment',
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 'alpha'.length },
          },
        },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.root())).toEqual([paragraph('')]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('delete-fragment over a whole sibling paragraph removes that block', () => {
    const runtime = createEditorRuntime({
      initialValue: [paragraph('alpha'), paragraph('beta')],
    });
    const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;

    expect(
      applyEditableCommand({
        command: {
          kind: 'delete-fragment',
          selection: {
            anchor: { path: [1, 0], offset: 0 },
            focus: { path: [1, 0], offset: 'beta'.length },
          },
        },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.root())).toEqual([
      paragraph('alpha'),
    ]);
  });

  it('delete-fragment over every top-level block uses one replace_children operation', () => {
    const initialValue = Array.from({ length: 1200 }, (_, index) =>
      paragraph(`block-${index}`)
    );
    const runtime = createEditorRuntime({
      initialValue,
    });
    const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
    const operationsBefore = Editor.getOperations(editor).length;

    expect(
      applyEditableCommand({
        command: {
          kind: 'delete-fragment',
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: {
              path: [initialValue.length - 1, 0],
              offset: `block-${initialValue.length - 1}`.length,
            },
          },
        },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.root())).toEqual([paragraph('')]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    expect(
      Editor.getOperations(editor)
        .slice(operationsBefore)
        .map((operation) => operation.type)
    ).toEqual(['replace_children']);
  });

  it('delete-fragment over mixed top-level marks keeps no active marks when the first text is unmarked', () => {
    const runtime = createEditorRuntime({
      initialValue: [
        paragraph('plain'),
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'bold' }],
        },
      ],
    });
    const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;

    expect(
      applyEditableCommand({
        command: {
          kind: 'delete-fragment',
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [1, 0], offset: 'bold'.length },
          },
        },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.marks.get())).toEqual({});
    expect(editor.read((state) => state.value.root())).toEqual([paragraph('')]);
  });

  it('insert-text over a whole text block with inline children preserves the block', () => {
    const runtime = createEditorRuntime({
      extensions: [dom(), inlineLinkExtension],
      initialValue: [
        {
          type: 'heading-one',
          id: 'stable-heading',
          children: [
            { text: 'before ' },
            {
              type: 'link',
              url: 'https://example.com',
              children: [{ text: 'link' }],
            },
            { text: ' after' },
          ],
        },
      ],
    });
    const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;

    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 2], offset: ' after'.length },
      });
    });

    applyModelOwnedTextInput({
      data: 'Z',
      editor,
      inputType: 'insertText',
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 2], offset: ' after'.length },
      },
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        type: 'heading-one',
        id: 'stable-heading',
        children: [{ text: 'Z' }],
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  });

  it('insert-text over a whole structural block falls back to a paragraph', () => {
    const runtime = createEditorRuntime({
      extensions: [structuralListExtension],
      initialValue: [
        {
          type: 'bulleted-list',
          children: [{ text: 'one' }],
        },
      ],
    });
    const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;

    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'one'.length },
      });
    });

    applyModelOwnedTextInput({
      data: 'Z',
      editor,
      inputType: 'insertText',
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'one'.length },
      },
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      paragraph('Z'),
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  });

  it('undo and redo restore the projected selection sidecar instead of losing owner identity', () => {
    const { editor, graph } = createFixture();

    writeForwardProjectedSelection(editor, graph);
    const projectedSelection = readSlateViewSelection(editor);

    expect(projectedSelection).not.toBe(null);
    applyEditableCommand({
      command: { inputType: 'insertText', kind: 'insert-text', text: 'X' },
      editor,
    });
    expect(readSlateViewSelection(editor)).toBe(null);

    expect(applyModelOwnedHistoryIntent({ direction: 'undo', editor })).toBe(
      true
    );
    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('Before'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('Inside'), paragraph('More')] },
    });
    expect(readSlateViewSelection(editor)).toEqual(projectedSelection);

    expect(applyModelOwnedHistoryIntent({ direction: 'redo', editor })).toBe(
      true
    );
    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('BefX'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('side'), paragraph('More')] },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('notifies view-selection subscribers when document history restores sidecars', () => {
    const { editor, graph } = createFixture();

    writeForwardProjectedSelection(editor, graph);
    const projectedSelection = readSlateViewSelection(editor);

    expect(projectedSelection).not.toBe(null);
    applyEditableCommand({
      command: { inputType: 'insertText', kind: 'insert-text', text: 'X' },
      editor,
    });
    expect(readSlateViewSelection(editor)).toBe(null);

    const events: unknown[] = [];
    const unsubscribe = subscribeSlateViewSelection(editor, () => {
      events.push(readSlateViewSelection(editor));
    });

    try {
      expect(applyModelOwnedHistoryIntent({ direction: 'undo', editor })).toBe(
        true
      );
    } finally {
      unsubscribe();
    }

    expect(readSlateViewSelection(editor)).toEqual(projectedSelection);
    expect(events).toEqual([projectedSelection]);
  });

  it('keeps model-owned history undo from normalizing the outer command transaction', () => {
    const blockCount = 128;
    const initialValue = Array.from({ length: blockCount }, (_, index) =>
      paragraph(`block-${index}`)
    );
    const runtime = createEditorRuntime({
      extensions: [history(), dom()],
      initialValue,
    });
    const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
    const selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: {
        path: [blockCount - 1, 0],
        offset: `block-${blockCount - 1}`.length,
      },
    };

    applyEditableCommand({
      command: { kind: 'delete-fragment', selection },
      editor,
    });

    const events: { id?: string | null }[] = [];
    const target = globalThis as typeof globalThis & {
      __SLATE_REACT_RENDER_PROFILER__?: {
        record: (event: { id?: string | null }) => void;
      };
    };
    const previousProfiler = target.__SLATE_REACT_RENDER_PROFILER__;
    target.__SLATE_REACT_RENDER_PROFILER__ = {
      record(event) {
        events.push(event);
      },
    };

    try {
      expect(applyModelOwnedHistoryIntent({ direction: 'undo', editor })).toBe(
        true
      );
    } finally {
      target.__SLATE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    expect(events.map((event) => event.id)).not.toContain(
      'transaction-normalize'
    );
    expect(editor.read((state) => state.value.root())).toEqual(initialValue);
  });

  it('does not type into ambiguous projected selections across repeated content-root owners', () => {
    const { editor, graph } = createRepeatedRootFixture();

    editor.update((tx) => {
      tx.selection.set({
        anchor: point(undefined, [0, 0], 0),
        focus: point(undefined, [0, 0], 0),
      });
    });
    writeAmbiguousRepeatedSelection(editor, graph);

    const beforeValue = structuredClone(
      editor.read((state) => state.value.get())
    );
    const beforeViewSelection = readSlateViewSelection(editor);

    expect(
      applyEditableCommand({
        command: { inputType: 'insertText', kind: 'insert-text', text: 'X' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual(beforeValue);
    expect(readSlateViewSelection(editor)).toEqual(beforeViewSelection);
  });

  it('does not delete ambiguous projected selections across repeated content-root owners', () => {
    const { editor, graph } = createRepeatedRootFixture();

    editor.update((tx) => {
      tx.selection.set({
        anchor: point(undefined, [0, 0], 0),
        focus: point(undefined, [0, 0], 0),
      });
    });
    writeAmbiguousRepeatedSelection(editor, graph);

    const beforeValue = structuredClone(
      editor.read((state) => state.value.get())
    );
    const beforeViewSelection = readSlateViewSelection(editor);

    expect(
      applyEditableCommand({
        command: { kind: 'delete-fragment' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual(beforeValue);
    expect(readSlateViewSelection(editor)).toEqual(beforeViewSelection);
  });

  it('clears stale projected selections and falls back to the model selection', () => {
    const { editor, graph } = createFixture();

    editor.update((tx) => {
      tx.selection.set({
        anchor: point(undefined, [2, 0], 0),
        focus: point(undefined, [2, 0], 0),
      });
    });
    writeForwardProjectedSelection(editor, graph);
    editor.update((tx) => {
      tx.roots.replace(SHARED_ROOT, []);
      tx.selection.set({
        anchor: point(undefined, [2, 0], 0),
        focus: point(undefined, [2, 0], 0),
      });
    });

    expect(readSlateViewSelection(editor)).not.toBe(null);
    expect(
      applyEditableCommand({
        command: { inputType: 'insertText', kind: 'insert-text', text: 'X' },
        editor,
      })
    ).toBe(true);

    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('Before'), contentCard(), paragraph('XAfter')],
      roots: { [SHARED_ROOT]: [] },
    });
    expect(readSlateViewSelection(editor)).toBe(null);
  });

  it('does not paste into ambiguous projected selections across repeated content-root owners', () => {
    const { editor, graph } = createRepeatedRootFixture();
    const data = new FakeDataTransfer();

    editor.update((tx) => {
      tx.selection.set({
        anchor: point(undefined, [0, 0], 0),
        focus: point(undefined, [0, 0], 0),
      });
    });
    writeAmbiguousRepeatedSelection(editor, graph);
    data.setData('text/plain', 'Z');

    const beforeValue = structuredClone(
      editor.read((state) => state.value.get())
    );
    const beforeViewSelection = readSlateViewSelection(editor);

    expect(beforeViewSelection).not.toBe(null);
    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);
    expect(editor.read((state) => state.value.get())).toEqual(beforeValue);
    expect(readSlateViewSelection(editor)).toEqual(beforeViewSelection);
  });

  it('does not delete projected selections for unsupported paste data', () => {
    const { editor, graph } = createFixture();
    const data = new FakeDataTransfer();

    editor.update((tx) => {
      tx.selection.set({
        anchor: point(undefined, [2, 0], 0),
        focus: point(undefined, [2, 0], 0),
      });
    });
    writeForwardProjectedSelection(editor, graph);

    const beforeValue = structuredClone(
      editor.read((state) => state.value.get())
    );
    const beforeViewSelection = readSlateViewSelection(editor);

    expect(beforeViewSelection).not.toBe(null);
    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);
    expect(editor.read((state) => state.value.get())).toEqual(beforeValue);
    expect(readSlateViewSelection(editor)).toEqual(beforeViewSelection);
  });

  it('rejects mismatched Slate HTML fragment formats over projected selections', () => {
    const { editor, graph } = createFixture();
    const data = new FakeDataTransfer();

    setDOMClipboardFormatKey(editor, 'x-custom-slate-fragment');
    editor.update((tx) => {
      tx.selection.set({
        anchor: point(undefined, [2, 0], 0),
        focus: point(undefined, [2, 0], 0),
      });
    });
    writeForwardProjectedSelection(editor, graph);
    data.setData(
      'text/html',
      `<span data-slate-fragment="${encodeSlateFragment([paragraph('Z')])}" data-slate-fragment-format="x-other-slate-fragment"></span>`
    );

    const beforeValue = structuredClone(
      editor.read((state) => state.value.get())
    );
    const beforeViewSelection = readSlateViewSelection(editor);

    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);
    expect(editor.read((state) => state.value.get())).toEqual(beforeValue);
    expect(readSlateViewSelection(editor)).toEqual(beforeViewSelection);
  });

  it('preserves projected selections for empty Slate fragments with empty plain text', () => {
    const { editor, graph } = createFixture();
    const data = new FakeDataTransfer();

    editor.update((tx) => {
      tx.selection.set({
        anchor: point(undefined, [2, 0], 0),
        focus: point(undefined, [2, 0], 0),
      });
    });
    writeForwardProjectedSelection(editor, graph);
    data.setData('application/x-slate-fragment', encodeSlateFragment([]));

    expect(
      applyEditableCommand({
        command: { data: data as unknown as DataTransfer, kind: 'insert-data' },
        editor,
      })
    ).toBe(true);
    expect(editor.read((state) => state.value.get())).toEqual({
      children: [paragraph('Before'), contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [paragraph('Inside'), paragraph('More')] },
    });
    expect(readSlateViewSelection(editor)).not.toBe(null);
  });

  it('clears projected selection when an explicit root-local select command runs', () => {
    const { editor, graph } = createFixture();

    writeForwardProjectedSelection(editor, graph);

    applyEditableCommand({
      command: {
        kind: 'select',
        selection: {
          anchor: point(undefined, [2, 0], 0),
          focus: point(undefined, [2, 0], 'After'.length),
        },
      },
      editor,
    });

    expect(readSlateViewSelection(editor)).toBe(null);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 'After'.length },
    });
  });

  it('extends a projected selection through the move-selection command route', () => {
    const { editor, graph } = createFixture();

    writeSlateViewSelection(
      editor,
      createSlateViewSelection(graph, {
        anchor: { point: point(undefined, [0, 0], 'Before'.length) },
        focus: {
          owner: sharedOwner,
          point: point(SHARED_ROOT, [0, 0], 'In'.length),
        },
      })
    );

    expect(
      applyEditableCommand({
        command: {
          axis: 'horizontal',
          extend: true,
          kind: 'move-selection',
        },
        editor,
      })
    ).toBe(true);

    expect(readSlateViewSelection(editor)).toMatchObject({
      anchor: { point: { path: [0, 0], offset: 'Before'.length } },
      focus: {
        owner: sharedOwner,
        point: {
          offset: 'Ins'.length,
          path: [0, 0],
          root: SHARED_ROOT,
        },
      },
    });
  });

  it('routes projected line move commands through vertical navigation', () => {
    const { editor, graph } = createFixture();

    writeSlateViewSelection(
      editor,
      createSlateViewSelection(graph, {
        anchor: { point: point(undefined, [0, 0], 'Before'.length) },
        focus: {
          owner: sharedOwner,
          point: point(SHARED_ROOT, [0, 0], 'In'.length),
        },
      })
    );

    expect(
      applyEditableCommand({
        command: {
          axis: 'line',
          extend: true,
          kind: 'move-selection',
        },
        editor,
      })
    ).toBe(true);

    expect(readSlateViewSelection(editor)).toMatchObject({
      anchor: { point: { path: [0, 0], offset: 'Before'.length } },
      focus: {
        owner: sharedOwner,
        point: {
          offset: 'Mo'.length,
          path: [1, 0],
          root: SHARED_ROOT,
        },
      },
    });
  });

  it('promotes model selection at a content-root edge through the move-selection command route', () => {
    const { editor } = createFixture();

    editor.update((tx) => {
      tx.selection.set({
        anchor: point(undefined, [0, 0], 'Before'.length),
        focus: point(undefined, [0, 0], 'Before'.length),
      });
    });

    expect(
      applyEditableCommand({
        command: {
          axis: 'horizontal',
          extend: true,
          kind: 'move-selection',
        },
        editor,
      })
    ).toBe(true);

    expect(readSlateViewSelection(editor)).toMatchObject({
      anchor: { point: { path: [0, 0], offset: 'Before'.length } },
      focus: {
        owner: sharedOwner,
        point: {
          offset: 1,
          path: [0, 0],
          root: SHARED_ROOT,
        },
      },
    });
  });
});
