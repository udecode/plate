import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  DocumentChange,
  type Editor,
  type Element,
  NodeApi,
  SelectionApi,
  type SchemaPropertyHandle,
  type SnapshotInput,
  type Value,
} from '@platejs/plite';
import {
  getChildren as editorGetChildren,
  getEditorSelectionRoot,
  getSnapshot as editorGetSnapshot,
  isEditor as editorIsEditor,
  replace as editorReplace,
  string as editorString,
  subscribe as editorSubscribe,
} from '@platejs/plite/internal';

import { defineTestSchema } from './support/schema';

const paragraph = (
  text: string,
  props: Record<string, unknown> = {}
): Element => ({
  type: 'paragraph',
  ...props,
  children: [{ text }],
});

const clone = <T>(value: T): T => structuredClone(value);

const replaceSnapshot = editorReplace as unknown as <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
  input: SnapshotInput<V>
) => void;

const replaceChildren = (
  editor: Editor<any, readonly unknown[]>,
  children: readonly Element[]
) => {
  replaceSnapshot(editor, {
    children: clone(children),
    selection: null,
  });
};

const getVisibleState = (editor: ReturnType<typeof createEditor>) => {
  const snapshot = editorGetSnapshot(editor);

  return {
    children: snapshot.children,
    runtimeEntries: snapshot.index.entries(),
    selection: snapshot.selection,
  };
};

describe('plite public accessor + transaction boundary', () => {
  it('sets one exact property by object and unsets it by schema handle', () => {
    const editor = createEditor<
      ReadonlyArray<{
        children: ReadonlyArray<{ text: string }>;
        id?: string;
        type: 'paragraph';
      }>
    >({
      initialValue: [{ type: 'paragraph', children: [{ text: 'one' }] }],
    });
    const id = Object.freeze({
      id: 'element:id@type:paragraph',
      key: 'id',
      kind: 'schema-property' as const,
      placement: 'element' as const,
    }) satisfies SchemaPropertyHandle<'id', string, 'element'>;

    editor.update.nodes.set({ id: 'p1' }, { at: [0] });
    assert.equal(editor.read.children()[0]?.id, 'p1');

    editor.update.nodes.set({ [id.key]: 'p2' }, { at: [0] });
    assert.equal(editor.read.children()[0]?.id, 'p2');

    editor.update.nodes.unset(id, { at: [0] });
    assert.equal(editor.read.children()[0]?.id, undefined);
  });

  it('rejects prefix property handles for exact node unsets', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });
    const prefix = Object.freeze({
      id: 'text:suggestion_*@all',
      key: { kind: 'prefix' as const, prefix: 'suggestion_' },
      kind: 'schema-property' as const,
      placement: 'text' as const,
    });

    assert.throws(
      () =>
        (editor.update.nodes.unset as (...args: unknown[]) => void)(prefix, {
          at: [0, 0],
        }),
      /Prefix schema-property handles/
    );
  });

  it('exposes direct read methods for schema, point, and runtime state', () => {
    const editor = createEditor({
      extensions: [
        defineTestSchema('test-schema', {
          caption: { selectable: false, void: 'block' },
          mention: { inline: true },
        }),
      ] as const,
    });
    const value = [
      paragraph('one'),
      { type: 'caption', children: [{ text: '' }] },
    ] as Element[];

    replaceChildren(editor, value);

    const mention = { type: 'mention', children: [{ text: '' }] };
    const caption = value[1];
    const start = editor.read.points.start([]);
    const nodeKey = editor.key([0]);

    assert.ok(start);
    assert.ok(nodeKey);
    assert.equal(editor.read.schema.isInline(mention), true);
    assert.equal(editor.read.schema.isVoid(caption), true);
    assert.equal(editor.read.schema.isSelectable(caption), false);
    assert.equal(editor.read.points.isEnd(start, []), false);
    assert.deepEqual(editor.read.nodes.path(nodeKey), [0]);
  });

  it('read and replace are the public snapshot state path', () => {
    const editor = createEditor();
    const value = [paragraph('one')];

    editorReplace(editor, { children: value, selection: null });
    const currentValue = editor.read((state) => state.value());

    assert.deepEqual(currentValue, { children: value });
    assert.equal(editorIsEditor(editor, { deep: true }), true);
    assert.deepEqual(editorGetChildren(editor), value);
    assert.equal('children' in editor, false);
    assert.equal('getChildren' in editor, false);
  });

  it('does not expose setChildren as an overrideable public state method', () => {
    const editor = createEditor();
    const value = [paragraph('set')];

    assert.equal('setChildren' in editor, false);

    editorReplace(editor, { children: value, selection: null });
    assert.deepEqual(editorGetChildren(editor), value);
  });

  it('internal transaction keeps direct replacement draft-visible and publishes once on exit', () => {
    const editor = createEditor();
    const publishedStates: Array<ReturnType<typeof getVisibleState>> = [];

    replaceChildren(editor, [paragraph('one'), paragraph('two')]);

    const unsubscribe = editorSubscribe(editor, () => {
      publishedStates.push(getVisibleState(editor));
    });

    publishedStates.length = 0;

    editor.update((tx) => {
      tx.value.replace({
        children: [paragraph('replacement')],
        selection: null,
      });

      assert.equal(publishedStates.length, 0);
      assert.equal(editorString(editor, [0]), 'replacement');

      tx.nodes.set({ id: 'p0' } as never, { at: [0] });

      assert.equal(publishedStates.length, 0);
      assert.deepEqual(editorGetChildren(editor), [
        {
          type: 'paragraph',
          id: 'p0',
          children: [{ text: 'replacement' }],
        },
      ]);
    });

    unsubscribe();

    assert.equal(publishedStates.length, 1);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        id: 'p0',
        children: [{ text: 'replacement' }],
      },
    ]);
  });

  it('sets the selected suffix after draft replacement and insertion', () => {
    const editor = createEditor({ initialValue: [paragraph('old')] });

    editor.update((tx) => {
      tx.value.replace({
        children: [paragraph('a')],
        selection: null,
      });
      tx.text.insert('b', { at: { path: [0, 0], offset: 1 } });
      tx.nodes.set(
        { suggestion: true },
        {
          at: {
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [0, 0], offset: 2 },
          },
          match: NodeApi.isText,
          split: true,
        }
      );
    });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'paragraph',
        children: [{ text: 'a' }, { suggestion: true, text: 'b' }],
      },
    ]);
  });

  it('internal transaction discards staged changes when a later write throws', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one'), paragraph('two')]);

    const before = getVisibleState(editor);

    assert.throws(() => {
      editor.update((tx) => {
        tx.nodes.set({ id: 'blue' } as never, { at: [0] });
        throw new Error('abort transaction');
      });
    }, /abort transaction/);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('publishes structurally shared snapshots and keeps the committed snapshot on abort', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });
    const before = editor.read.runtime.snapshot();

    editor.update((tx) => {
      tx.nodes.set({ id: 'blue' }, { at: [0] });
    });

    const committed = editor.read.runtime.snapshot();

    assert.notStrictEqual(committed.children, before.children);
    assert.notStrictEqual(committed.children[0], before.children[0]);
    assert.strictEqual(committed.children[1], before.children[1]);

    assert.throws(() => {
      editor.update((tx) => {
        tx.nodes.set({ id: 'red' }, { at: [1] });
        throw new Error('abort');
      });
    }, /abort/);

    const afterAbort = editor.read.runtime.snapshot();

    assert.strictEqual(afterAbort, committed);
    assert.strictEqual(afterAbort.children, committed.children);
  });

  it('uses the frozen committed snapshot as read state', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });
    const snapshot = editor.read.runtime.snapshot();
    const children = editor.read.children();

    assert.strictEqual(children, snapshot.children);
    assert.equal(Object.isFrozen(children), true);
    assert.equal(Object.isFrozen(children[0]), true);
    assert.equal(Object.isFrozen(children[0].children), true);

    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 3 } });
    });

    assert.strictEqual(
      editor.read.children(),
      editor.read.runtime.snapshot().children
    );
  });

  it('publishes one canonical document change that replays to the committed snapshot', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });
    const before = editor.read.runtime.snapshot();

    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 3 } });
      tx.nodes.move({ at: [1], to: [0] });
    });

    const after = editor.read.runtime.snapshot();
    const commit = editor.read.lastCommit();
    const { changes } = commit as unknown as {
      changes: {
        apply: (value: { children: readonly Element[] }) => {
          children: readonly Element[];
        };
      };
    };

    assert.ok(commit);
    assert.deepEqual(
      changes.apply({ children: before.children }).children,
      after.children
    );
  });

  it('publishes one atomic document change across roots', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const before = {
      children: editor.read.children(),
      roots: { header: editor.read.root('header') },
    };

    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      tx.roots.replace('header', [paragraph('updated')]);
    });

    const after = {
      children: editor.read.children(),
      roots: { header: editor.read.root('header') },
    };
    const commit = editor.read.lastCommit();

    assert.ok(commit?.changes);
    assert.deepEqual(commit.changes.apply(before), after);
  });

  it('classifies mixed text and property changes after canonical serialization', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });
    const before = { children: editor.read.children() };
    const elementNodeKey = editor.key([0]);
    const textNodeKey = editor.key([0, 0]);
    const after = {
      children: [paragraph('one!', { align: 'center' })],
    };
    const change = DocumentChange.fromJSON(
      DocumentChange.between(before, after).toJSON()
    );

    editor.update((tx) => {
      tx.changes.apply(change);
    });

    const commit = editor.read.lastCommit();

    assert.ok(commit);
    assert.equal(commit.changed.has('text'), true);
    assert.equal(commit.changed.has('properties'), true);
    assert.equal(commit.changed.has('structure'), false);
    assert.equal(editor.key([0]), elementNodeKey);
    assert.equal(editor.key([0, 0]), textNodeKey);
  });

  it('rejects a noncanonical direct document change atomically', () => {
    const before = {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'one' },
            { code: true, text: 'two' },
            { text: 'three' },
          ],
        },
      ],
    };
    const changed = {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }, { code: true, text: '' }, { text: '' }],
        },
      ],
    };
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      }),
      initialValue: before.children,
    });

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.changes.apply(DocumentChange.between(before, changed));
          tx.selection.set({ path: [0, 0], offset: 3 });
        }),
      /canonical editor representation/i
    );

    assert.deepEqual(editor.read.children(), before.children);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('applies a canonical direct document change with an explicit selection', () => {
    const before = { children: [paragraph('one')] };
    const changed = { children: [paragraph('one!')] };
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      }),
      initialValue: before.children,
    });

    editor.update((tx) => {
      tx.changes.apply(DocumentChange.between(before, changed));
      tx.selection.set({ path: [0, 0], offset: 4 });
    });

    assert.deepEqual(editor.read.children(), changed.children);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    });
  });

  it('keeps runtime indexes isolated by root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const main = createEditorView(runtime);
    const header = createEditorView(runtime, { root: 'header' });
    const mainNodeKey = main.key([0]);
    const headerEntry = header.read.nodes.get([0]);
    assert.ok(headerEntry && NodeApi.isDescendant(headerEntry[0]));
    const headerNode = headerEntry[0];
    const canonicalHeaderNodeKey = runtime.key(headerNode);
    const headerNodeKey = header.key([0]);

    assert.ok(mainNodeKey);
    assert.ok(headerNodeKey);
    assert.equal(canonicalHeaderNodeKey, headerNodeKey);
    assert.notEqual(mainNodeKey, headerNodeKey);
    assert.deepEqual(main.read.nodes.path(mainNodeKey), [0]);
    assert.deepEqual(header.read.nodes.path(headerNodeKey), [0]);
    assert.equal(main.read.nodes.path(headerNodeKey), undefined);
    assert.equal(header.read.nodes.path(mainNodeKey), undefined);
    assert.equal(runtime.key(headerNode), headerNodeKey);

    let canonicalNodeKeyDuringHeaderCommit = null;
    const unsubscribe = runtime.subscribeCommit(() => {
      canonicalNodeKeyDuringHeaderCommit = runtime.key([0]);
    });

    header.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
    });
    unsubscribe();

    assert.equal(canonicalNodeKeyDuringHeaderCommit, mainNodeKey);
  });

  it('scopes explicit selection writes to the editor view root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const main = createEditorView(runtime);
    const header = createEditorView(runtime, { root: 'header' });

    header.update((tx) => {
      tx.selection.set({ path: [0, 0], offset: 2 });
    });

    const headerCommit = runtime.read.lastCommit();

    assert.equal(headerCommit?.selectionBeforeRoot, undefined);
    assert.equal(headerCommit?.selectionAfterRoot, 'header');
    assert.equal(headerCommit?.changed.has('selection', 'header'), true);
    assert.equal(headerCommit?.changed.has('selection'), false);
    assert.equal(getEditorSelectionRoot(runtime), 'header');
    assert.equal(SelectionApi.root(runtime.read.selection()), 'header');
    assert.equal(SelectionApi.root(main.read.selection()), undefined);
    assert.equal(SelectionApi.root(header.read.selection()), 'header');
    assert.equal(main.read.selection(), null);
    assert.deepEqual(header.read.selection(), {
      anchor: { path: [0, 0], root: 'header', offset: 2 },
      focus: { path: [0, 0], root: 'header', offset: 2 },
    });

    main.update((tx) => {
      tx.selection.set({ path: [0, 0], offset: 1 });
    });

    const mainCommit = runtime.read.lastCommit();

    assert.equal(mainCommit?.selectionBeforeRoot, 'header');
    assert.equal(mainCommit?.selectionAfterRoot, undefined);
    assert.equal(mainCommit?.changed.has('selection', 'header'), true);
    assert.equal(mainCommit?.changed.has('selection'), true);
    assert.equal(getEditorSelectionRoot(runtime), 'main');
    assert.equal(SelectionApi.root(runtime.read.selection()), undefined);
    assert.equal(SelectionApi.root(main.read.selection()), undefined);
    assert.equal(SelectionApi.root(header.read.selection()), undefined);
    assert.deepEqual(main.read.selection(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    assert.equal(header.read.selection(), null);
  });
});
