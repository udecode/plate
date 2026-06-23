import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, type Descendant } from '../src';
import { Editor } from '../src/interfaces/editor';
import { replaceEditorValue } from './support/snapshot';

const paragraph = (text: string, props: Record<string, unknown> = {}) =>
  ({
    type: 'paragraph',
    ...props,
    children: [{ text }],
  }) as Descendant;

describe('state/tx public API contract', () => {
  it('initializes document state during editor creation', () => {
    const selection = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };
    const editor = createEditor({
      initialSelection: selection,
      initialValue: [paragraph('one')],
    });

    const state = editor.read((state) => ({
      lastCommit: state.value.lastCommit(),
      operations: state.value.operations(),
      selection: state.selection.get(),
      value: state.value.get(),
    }));

    assert.deepEqual(state.value, { children: [paragraph('one')] });
    assert.deepEqual(
      editor.read((state) => state.value.root()),
      [paragraph('one')]
    );
    assert.throws(
      () => editor.read((state) => state.value.root('main')),
      /primary editor root by key/
    );
    assert.deepEqual(state.selection, selection);
    assert.deepEqual(state.operations, []);
    assert.equal(state.lastCommit, null);
  });

  it('rejects public main root locations', () => {
    const editor = createEditor({ initialValue: [paragraph('body')] });
    const mainPoint = { path: [0, 0], offset: 4, root: 'main' };
    const mainRange = { anchor: mainPoint, focus: mainPoint };
    const mainMixedRange = {
      anchor: mainPoint,
      focus: { path: [0, 0], offset: 0, root: 'header' },
    };
    const mixedRange = {
      anchor: { path: [0, 0], offset: 0, root: 'header' },
      focus: { path: [0, 0], offset: 4, root: 'footer' },
    };

    assert.throws(
      () =>
        createEditor({
          initialSelection: mainRange,
          initialValue: [paragraph('body')],
        }),
      /Omit root to target the primary document/
    );
    assert.throws(
      () =>
        createEditor({
          initialSelection: mainMixedRange,
          initialValue: {
            children: [paragraph('body')],
            roots: { header: [paragraph('header')] },
          },
        }),
      /Omit root to target the primary document/
    );
    assert.throws(
      () =>
        createEditor({
          initialSelection: mixedRange,
          initialValue: {
            children: [paragraph('body')],
            roots: {
              footer: [paragraph('footer')],
              header: [paragraph('header')],
            },
          },
        }),
      /multiple editor roots/
    );
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.text.insert('!', { at: mainPoint });
        }),
      /Omit root to target the primary document/
    );
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.selection.set(mainRange);
        }),
      /Omit root to target the primary document/
    );
    assert.throws(
      () => editor.read((state) => state.text.string(mainRange)),
      /Omit root to target the primary document/
    );
    assert.throws(
      () => editor.read((state) => state.fragment.get({ at: mainRange })),
      /Omit root to target the primary document/
    );
  });

  it('round-trips raw document values through JSON without runtime metadata', () => {
    const value = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: 'Welcome', bold: true }],
      },
      {
        type: 'paragraph',
        align: 'center',
        children: [
          { text: 'Visit ' },
          {
            type: 'link',
            url: 'https://example.com',
            children: [{ text: 'example', italic: true }],
          },
          { text: ' now' },
        ],
      },
      {
        type: 'bulleted-list',
        children: [
          { type: 'list-item', children: [{ text: 'one' }] },
          { type: 'list-item', checked: false, children: [{ text: 'two' }] },
        ],
      },
    ] satisfies Descendant[];
    const serialized = JSON.stringify(value);
    const parsed = JSON.parse(serialized) as Descendant[];
    const editor = createEditor({ initialValue: parsed });
    const exported = editor.read((state) => state.value.get());
    const reserialized = JSON.stringify(exported);
    const rehydrated = createEditor({
      initialValue: JSON.parse(reserialized),
    });

    assert.deepEqual(parsed, value);
    assert.deepEqual(exported, { children: value });
    assert.deepEqual(
      rehydrated.read((state) => state.value.get()),
      { children: value }
    );
    assert.equal(reserialized.includes('pathToId'), false);
    assert.equal(reserialized.includes('idToPath'), false);
  });

  it('rejects an explicitly empty initial value', () => {
    assert.throws(
      () => createEditor({ initialValue: [] }),
      /Expected at least one element/
    );
  });

  it('replaces a mounted document and clears selection in one transaction', () => {
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
      initialValue: [paragraph('one')],
    });

    editor.update((tx) => {
      tx.value.replace({
        children: [paragraph('two')],
        selection: null,
      });
    });

    const state = editor.read((state) => ({
      lastCommit: state.value.lastCommit(),
      operations: state.value.operations(),
      selection: state.selection.get(),
      value: state.value.get(),
    }));

    assert.deepEqual(state.value, { children: [paragraph('two')] });
    assert.deepEqual(state.selection, null);
    assert.equal(state.operations.length, 0);
    assert.equal(state.lastCommit?.childrenChanged, true);
    assert.equal(state.lastCommit?.fullDocumentChanged, true);
    assert.equal(state.lastCommit?.selectionChanged, true);
  });

  const createSeededEditor = () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one'), paragraph('two')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });

    return editor;
  };

  it('passes grouped read state into editor.read', () => {
    const editor = createSeededEditor();

    const state = editor.read((state) => ({
      isVoid: state.schema.isVoid({
        type: 'image',
        children: [{ text: '' }],
      }),
      selection: state.selection.get(),
      text: state.text.string([]),
      value: state.value.get(),
    }));

    assert.equal(state.isVoid, false);
    assert.equal(state.text, 'onetwo');
    assert.deepEqual(state.selection, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.deepEqual(state.value, {
      children: [paragraph('one'), paragraph('two')],
    });
  });

  it('reads fragments through grouped read state', () => {
    const editor = createSeededEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one'), paragraph('two')],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });

    const fragments = editor.read((state) => ({
      explicit: state.fragment.get({
        at: {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        },
      }),
      selected: state.fragment.get(),
    }));

    assert.deepEqual(fragments.selected, [paragraph('one')]);
    assert.deepEqual(fragments.explicit, [paragraph('two')]);
    assert.deepEqual(Editor.getSelection(editor), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    });
  });

  it('exposes complete read-only state groups for document, runtime, and commit metadata', () => {
    const editor = createSeededEditor();
    const firstTextRuntimeId = editor.read((state) =>
      state.runtime.idAt([0, 0])
    );

    assert.equal(typeof firstTextRuntimeId, 'string');

    const state = editor.read((state) => ({
      lastCommit: state.value.lastCommit(),
      operations: state.value.operations(),
      path: state.runtime.pathOf(firstTextRuntimeId!),
      snapshot: state.runtime.snapshot(),
      valueHasSnapshot: 'snapshot' in state.value,
    }));

    assert.equal(state.valueHasSnapshot, false);
    assert.deepEqual(state.snapshot.children, [
      paragraph('one'),
      paragraph('two'),
    ]);
    assert.deepEqual(state.snapshot.selection, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.deepEqual(state.operations, []);
    assert.equal(state.lastCommit?.classes.includes('replace'), true);
    assert.equal(state.lastCommit?.operations.length, 0);
    assert.deepEqual(state.path, [0, 0]);
  });

  it('invalidates runtime index caches when a failed transaction rolls back inserted nodes', () => {
    const editor = createSeededEditor();
    let insertedRuntimeId: string | null = null;

    assert.throws(() => {
      editor.update((tx) => {
        tx.nodes.insert(paragraph('draft'), { at: [1] });
        insertedRuntimeId = tx.runtime.idAt([1]);
        throw new Error('rollback');
      });
    }, /rollback/);

    assert.deepEqual(Editor.getChildren(editor), [
      paragraph('one'),
      paragraph('two'),
    ]);
    assert.equal(
      editor.read((state) => state.runtime.pathOf(insertedRuntimeId!)),
      null
    );
  });

  it('invalidates runtime index caches when replacing the document snapshot', () => {
    const editor = createSeededEditor();
    const oldSecondTextRuntimeId = editor.read((state) =>
      state.runtime.idAt([1, 0])
    );

    assert.equal(typeof oldSecondTextRuntimeId, 'string');
    assert.deepEqual(
      editor.read((state) => state.runtime.pathOf(oldSecondTextRuntimeId!)),
      [1, 0]
    );

    editor.update((tx) => {
      tx.value.replace({
        children: [paragraph('fresh')],
        selection: null,
        marks: null,
      });
    });

    const state = editor.read((state) => ({
      oldSecondTextPath: state.runtime.pathOf(oldSecondTextRuntimeId!),
      nextTextRuntimeId: state.runtime.idAt([0, 0]),
      value: state.value.get(),
    }));

    assert.deepEqual(state.value, { children: [paragraph('fresh')] });
    assert.equal(state.oldSecondTextPath, null);
    assert.equal(typeof state.nextTextRuntimeId, 'string');
  });

  it('keeps cached runtime ids path-stable across text-only transactions', () => {
    const editor = createSeededEditor();
    const textRuntimeId = editor.read((state) => state.runtime.idAt([1, 0]));

    assert.equal(typeof textRuntimeId, 'string');

    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [1, 0], offset: 3 } });
    });

    const state = editor.read((state) => ({
      path: state.runtime.pathOf(textRuntimeId!),
      value: state.value.get(),
    }));

    assert.deepEqual(state.path, [1, 0]);
    assert.deepEqual(state.value, {
      children: [paragraph('one'), paragraph('two!')],
    });
  });

  it('resolves runtime ids through structural draft changes without serializing them', () => {
    const editor = createSeededEditor();
    const firstBlockRuntimeId = editor.read((state) => state.runtime.idAt([0]));
    const secondTextRuntimeId = editor.read((state) =>
      state.runtime.idAt([1, 0])
    );
    let fragmentRuntimeId: string | null = null;

    assert.equal(typeof firstBlockRuntimeId, 'string');
    assert.equal(typeof secondTextRuntimeId, 'string');

    editor.update((tx) => {
      tx.nodes.insert(paragraph('zero'), { at: [0] });

      assert.deepEqual(tx.runtime.pathOf(firstBlockRuntimeId!), [1]);
      assert.deepEqual(tx.runtime.pathOf(secondTextRuntimeId!), [2, 0]);

      tx.nodes.move({ at: [2], to: [0] });

      assert.deepEqual(tx.runtime.pathOf(secondTextRuntimeId!), [0, 0]);
      assert.deepEqual(tx.runtime.pathOf(firstBlockRuntimeId!), [2]);

      tx.selection.set({
        anchor: { path: [2, 0], offset: 1 },
        focus: { path: [2, 0], offset: 1 },
      });
      tx.nodes.split();

      assert.deepEqual(tx.runtime.pathOf(secondTextRuntimeId!), [0, 0]);
      assert.deepEqual(tx.runtime.pathOf(firstBlockRuntimeId!), [2]);

      tx.fragment.insert([paragraph('fragment')], { at: [1] });
      fragmentRuntimeId = tx.runtime.idAt([1]);

      assert.equal(typeof fragmentRuntimeId, 'string');
      assert.deepEqual(tx.runtime.pathOf(secondTextRuntimeId!), [0, 0]);
      assert.deepEqual(tx.runtime.pathOf(firstBlockRuntimeId!), [2]);
    });

    const exportedValue = editor.read((state) => state.value.get());
    const serialized = JSON.stringify(exportedValue);

    assert.deepEqual(exportedValue, {
      children: [
        paragraph('two'),
        paragraph('fragmentzero'),
        paragraph('o'),
        paragraph('ne'),
      ],
    });
    assert.equal(serialized.includes(firstBlockRuntimeId!), false);
    assert.equal(serialized.includes(secondTextRuntimeId!), false);
    assert.equal(serialized.includes(fragmentRuntimeId!), false);
  });

  it('exposes complete query groups through state instead of direct editor aliases', () => {
    const editor = createSeededEditor();

    const state = editor.read((state) => ({
      after: state.points.after({ path: [0, 0], offset: 3 }),
      before: state.points.before({ path: [1, 0], offset: 0 }),
      edge: state.points.isEdge({ path: [0, 0], offset: 0 }, [0]),
      first: state.nodes.first([]),
      hasBlocks: state.nodes.hasBlocks({ children: [paragraph('nested')] }),
      hasPath: state.nodes.hasPath([1, 0]),
      isBlock: state.schema.isBlock(paragraph('one')),
      isEmpty: state.nodes.isEmpty({ children: [{ text: '' }] }),
      last: state.nodes.last([]),
      levels: Array.from(state.nodes.levels({ at: [0, 0] })),
      nodePaths: state.nodes.toArray({ at: [] }, ([, path]) => path),
      projected: state.ranges.project({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      }),
      range: state.ranges.get([0]),
      unhang: state.ranges.unhang({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      }),
      voidNode: state.nodes.void({ at: [] }),
    }));

    assert.deepEqual(state.after, { path: [1, 0], offset: 0 });
    assert.deepEqual(state.before, { path: [0, 0], offset: 3 });
    assert.equal(state.edge, true);
    assert.deepEqual(state.first?.[1], [0, 0]);
    assert.equal(state.hasBlocks, true);
    assert.equal(state.hasPath, true);
    assert.equal(state.isBlock, true);
    assert.equal(state.isEmpty, true);
    assert.deepEqual(state.last?.[1], [1, 0]);
    assert.ok(state.levels.length > 0);
    assert.deepEqual(state.nodePaths, [[], [0], [0, 0], [1], [1, 0]]);
    assert.ok(state.projected.length > 0);
    assert.deepEqual(state.range, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.deepEqual(state.unhang, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.equal(state.voidNode, undefined);
  });

  it('passes grouped tx writes into editor.update and reads the live draft', () => {
    const editor = createSeededEditor();
    let draftText = '';
    let draftSelection = null as ReturnType<typeof Editor.getSelection>;

    editor.update((tx) => {
      tx.text.insert('!');
      tx.nodes.set({ role: 'edited' }, { at: [0] });
      tx.selection.set({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 3 },
      });

      draftText = tx.text.string([]);
      draftSelection = tx.selection.get();
    });

    assert.equal(draftText, 'one!two');
    assert.deepEqual(draftSelection, {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 3 },
    });
    assert.equal(Editor.string(editor, []), 'one!two');
    assert.deepEqual(Editor.getSnapshot(editor).children, [
      paragraph('one!', { role: 'edited' }),
      paragraph('two'),
    ]);
  });

  it('reads fragments through the update transaction draft', () => {
    const editor = createSeededEditor();
    let before = [] as Descendant[];
    let after = [] as Descendant[];

    replaceEditorValue(editor, {
      children: [paragraph('one'), paragraph('two')],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });

    editor.update((tx) => {
      before = tx.fragment.get();
      tx.fragment.insert([paragraph('z')]);
      after = tx.fragment.get({
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        },
      });
    });

    assert.deepEqual(before, [paragraph('one')]);
    assert.deepEqual(after, [paragraph('z')]);
    assert.deepEqual(Editor.getSnapshot(editor).children, [
      paragraph('z'),
      paragraph('two'),
    ]);
  });

  it('groups break and directed text deletes under tx namespaces', () => {
    const editor = createSeededEditor();
    let hasRootBreak = true;

    editor.update((tx) => {
      hasRootBreak = 'insertBreak' in tx || 'insertSoftBreak' in tx;
      tx.text.deleteBackward({ unit: 'character' });
      tx.break.insert();
      tx.text.insert('z');
    });

    assert.equal(hasRootBreak, false);
    assert.equal(Editor.string(editor, []), 'onztwo');
    assert.deepEqual(Editor.getSelection(editor), {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    });
  });

  it('replaces the whole document through the update transaction', () => {
    const editor = createSeededEditor();
    let txValueHasSnapshot = true;

    editor.update((tx) => {
      txValueHasSnapshot = 'snapshot' in tx.value;
      tx.value.replace({
        children: [paragraph('replacement')],
        marks: { bold: true },
        selection: {
          anchor: { path: [0, 0], offset: 11 },
          focus: { path: [0, 0], offset: 11 },
        },
      });
    });

    assert.equal(txValueHasSnapshot, false);
    const snapshot = Editor.getSnapshot(editor);

    assert.deepEqual(snapshot.children, [paragraph('replacement')]);
    assert.deepEqual(snapshot.marks, { bold: true });
    assert.deepEqual(snapshot.selection, {
      anchor: { path: [0, 0], offset: 11 },
      focus: { path: [0, 0], offset: 11 },
    });
  });

  it('routes tx writes through the internal transform registry', () => {
    const editor = createSeededEditor();
    let primitiveCalls = 0;
    const staleInsertTextKey = `insert${'Text'}`;

    (editor as unknown as Record<string, unknown>)[staleInsertTextKey] = () => {
      primitiveCalls += 1;
      throw new Error('primitive instance writer should not back tx writes');
    };

    editor.update((tx) => {
      tx.text.insert('!');
    });

    assert.equal(primitiveCalls, 0);
    assert.equal(Editor.string(editor, []), 'one!two');
  });

  it('keeps tx reads coherent after mark writes in the same update', () => {
    const editor = createSeededEditor();
    let marks = null as unknown;

    editor.update((tx) => {
      tx.marks.add('bold', true);
      marks = tx.marks.get();
      tx.marks.remove('bold');
    });

    assert.deepEqual(marks, { bold: true });
  });

  it('sets exact insertion marks through the update transaction', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });
    editor.update((tx) => {
      tx.marks.set({ bold: true });
      tx.text.insert('!');
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        children: [{ text: 'one' }, { bold: true, text: '!' }],
        type: 'paragraph',
      },
    ]);

    replaceEditorValue(editor, {
      children: [
        {
          children: [{ bold: true, text: 'one' }],
          type: 'paragraph',
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });
    editor.update((tx) => {
      tx.marks.set({});
      tx.text.insert('!');
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        children: [{ bold: true, text: 'one' }, { text: '!' }],
        type: 'paragraph',
      },
    ]);

    replaceEditorValue(editor, {
      children: [
        {
          children: [{ bold: true, text: 'one' }],
          type: 'paragraph',
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });
    editor.update((tx) => {
      tx.marks.set(null);
      tx.text.insert('!');
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        children: [{ bold: true, text: 'one!' }],
        type: 'paragraph',
      },
    ]);
  });

  it('replays operation batches through the update transaction', () => {
    const editor = createSeededEditor();

    editor.update((tx) => {
      tx.operations.replay([
        {
          offset: 3,
          path: [0, 0],
          text: '!',
          type: 'insert_text',
        },
      ]);
    });

    assert.equal(Editor.string(editor, []), 'one!two');
    assert.equal(Editor.getLastCommit(editor)?.operations.length, 1);
  });
});
