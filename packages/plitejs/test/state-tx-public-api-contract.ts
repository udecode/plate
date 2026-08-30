import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  type Descendant,
  type Element,
  NodeApi,
  type NodeKey,
  type Range,
  SelectionApi,
} from 'plitejs';

import {
  getChildren as editorGetChildren,
  getLastCommit as editorGetLastCommit,
  getSelection as editorGetSelection,
  getSnapshot as editorGetSnapshot,
  string as editorString,
} from '../src/internal';
import { defineTestSchema } from './support/schema';
import { replaceEditorValue } from './support/snapshot';

const paragraph = (text: string, props: Record<string, unknown> = {}) =>
  ({
    type: 'paragraph',
    ...props,
    children: [{ text }],
  }) as Element;

describe('state/tx public API contract', () => {
  it('initializes document meta during editor creation', () => {
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };
    const editor = createEditor({
      initialSelection: selection,
      initialValue: [paragraph('one')],
    });

    const state = editor.read((innerState) => ({
      lastCommit: innerState.lastCommit(),
      selection: innerState.selection(),
      value: innerState.value(),
    }));

    assert.deepEqual(state.value, { children: [paragraph('one')] });
    assert.deepEqual(
      editor.read((innerState2) => innerState2.children()),
      [paragraph('one')]
    );
    const primaryRoot: string = 'main';

    assert.throws(
      () => editor.read((innerState3) => innerState3.root(primaryRoot)),
      /Use editor\.read\.children/
    );
    assert.deepEqual(state.selection, {
      anchor: selection.anchor,
      focus: selection.focus,
    });
    assert.equal(state.lastCommit, null);
  });

  it('rejects public main root locations', () => {
    const editor = createEditor({ initialValue: [paragraph('body')] });
    const mainPoint = { path: [0, 0], offset: 4, root: 'main' };
    const mainRange = {
      anchor: mainPoint,
      focus: mainPoint,
      kind: 'text' as const,
    };
    const mainMixedRange = {
      anchor: mainPoint,
      focus: { path: [0, 0], offset: 0, root: 'header' },
      kind: 'text' as const,
    };
    const mixedRange = {
      anchor: { path: [0, 0], offset: 0, root: 'header' },
      focus: { path: [0, 0], offset: 4, root: 'footer' },
      kind: 'text' as const,
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
      () => editor.read((state) => state.fragment({ at: mainRange })),
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
    ] satisfies Element[];
    const serialized = JSON.stringify(value);
    const parsed = JSON.parse(serialized) as Element[];
    const editor = createEditor({ initialValue: parsed });
    const exported = editor.read((state) => state.value());
    const reserialized = JSON.stringify(exported);
    const rehydrated = createEditor({
      initialValue: JSON.parse(reserialized),
    });

    assert.deepEqual(parsed, value);
    assert.deepEqual(exported, { children: value });
    assert.deepEqual(
      rehydrated.read((state) => state.value()),
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
        kind: 'text' as const,
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

    const state = editor.read((innerState4) => ({
      lastCommit: innerState4.lastCommit(),
      selection: innerState4.selection(),
      value: innerState4.value(),
    }));

    assert.deepEqual(state.value, { children: [paragraph('two')] });
    assert.deepEqual(state.selection, null);
    assert.equal(state.lastCommit?.changes.empty, false);
    assert.equal(state.lastCommit?.changed.has('document'), true);
    assert.equal(state.lastCommit?.changed.has('replace'), true);
    assert.equal(state.lastCommit?.selectionChanged, true);
  });

  it('shares unchanged root nodes while detaching replacement input', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });
    const before = editor.read.children();
    const appended = paragraph('three');

    editor.update.value.replace({
      children: [paragraph('one'), before[1], appended],
      selection: null,
    });

    const after = editor.read.children();

    assert.notEqual(after, before);
    assert.equal(after[0], before[0]);
    assert.equal(after[1], before[1]);
    assert.notEqual(after[2], appended);
    assert.deepEqual(after, [
      paragraph('one'),
      paragraph('two'),
      paragraph('three'),
    ]);
  });

  it('replaces a mounted document with start/end selection shortcuts', () => {
    const editor = createEditor({
      initialValue: [paragraph('one')],
    });

    editor.update.value.replace({
      children: [paragraph('two')],
      selection: 'end',
    });

    assert.deepEqual(editorGetSelection(editor), {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    editor.update.value.replace({
      children: [paragraph('three')],
      selection: 'start',
    });

    assert.deepEqual(editorGetSelection(editor), {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('validates a replacement node selection against the replacement document', () => {
    const editor = createEditor({
      initialValue: [paragraph('one')],
    });
    const selection = SelectionApi.nodes([[0], [1]]);

    editor.update.value.replace({
      children: [paragraph('two'), paragraph('new')],
      selection,
    });

    assert.deepEqual(editorGetSelection(editor), selection);
  });

  it('repairs replacement selections that point at element paths', () => {
    const editor = createEditor({
      initialValue: [paragraph('one')],
    });

    editor.update.value.replace({
      children: [paragraph('nested')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0], offset: 0 },
        focus: { path: [0], offset: 0 },
      },
    });

    assert.deepEqual(editorGetSelection(editor), {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('keeps a replacement selection after an inline during canonicalization', () => {
    const editor = createEditor({
      extensions: [
        defineTestSchema('inline-schema-definition', {
          inline: { inline: true },
        }),
      ],
      initialValue: [paragraph('seed')],
    });

    editor.update.value.replace({
      children: [
        {
          children: [
            { children: [{ text: '' }], type: 'inline' },
            { text: '' },
            { text: 'after' },
          ],
          type: 'paragraph',
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 0, path: [0, 1] },
      },
    });

    assert.deepEqual(editorGetChildren(editor), [
      {
        children: [
          { text: '' },
          { children: [{ text: '' }], type: 'inline' },
          { text: 'after' },
        ],
        type: 'paragraph',
      },
    ]);
    assert.deepEqual(editorGetSelection(editor), {
      kind: 'text',
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });

  it('keeps a replacement selection before an inline during canonicalization', () => {
    const editor = createEditor({
      extensions: [
        defineTestSchema('inline-schema-definition', {
          inline: { inline: true },
        }),
      ],
      initialValue: [paragraph('seed')],
    });

    editor.update.value.replace({
      children: [
        {
          children: [
            { text: 'before' },
            { text: '' },
            { children: [{ text: '' }], type: 'inline' },
          ],
          type: 'paragraph',
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 0, path: [0, 1] },
      },
    });

    assert.deepEqual(editorGetChildren(editor), [
      {
        children: [
          { text: 'before' },
          { children: [{ text: '' }], type: 'inline' },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ]);
    assert.deepEqual(editorGetSelection(editor), {
      kind: 'text',
      anchor: { offset: 6, path: [0, 0] },
      focus: { offset: 6, path: [0, 0] },
    });
  });

  it('keeps a replacement selection in the retained side of joined text', () => {
    const editor = createEditor({
      initialValue: [paragraph('seed')],
    });

    editor.update.value.replace({
      children: [
        {
          children: [{ text: 'a' }, { text: 'b' }],
          type: 'paragraph',
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    });

    assert.deepEqual(editorGetChildren(editor), [
      {
        children: [{ text: 'ab' }],
        type: 'paragraph',
      },
    ]);
    assert.deepEqual(editorGetSelection(editor), {
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
  });

  it('applies replacement policy through the owning update facade', () => {
    const editor = createEditor({
      initialValue: [paragraph('one')],
    });

    editor.update({ tags: ['external', 'history-skip'] }).value.replace({
      children: [paragraph('two')],
      selection: 'end',
    });

    const commit = editorGetLastCommit(editor);

    assert.deepEqual(commit?.tags, ['external', 'history-skip']);
  });

  const createSeededEditor = () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one'), paragraph('two')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    return editor;
  };

  it('sets a canonical node selection from live paths', () => {
    const editor = createSeededEditor();

    editor.update.selection.setNodes([[1], [0], [1]]);

    assert.deepEqual(editor.read.selection(), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 3 },
    });
    assert.deepEqual(
      editor.read.selection.nodes().map(([, path]) => path),
      [[0], [1]]
    );
  });

  it('sets node selection inside an editor view root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(editor, { root: 'header' });

    headerEditor.update.selection.setNodes([[0]]);

    assert.deepEqual(headerEditor.read.selection(), {
      anchor: { path: [0, 0], offset: 0, root: 'header' },
      focus: { path: [0, 0], offset: 6, root: 'header' },
    });
    assert.deepEqual(headerEditor.read.selection.ranges(), [
      {
        anchor: { path: [0, 0], offset: 0, root: 'header' },
        focus: { path: [0, 0], offset: 6, root: 'header' },
      },
    ]);
    assert.deepEqual(
      headerEditor.read.nodes.blocks().map(([, path]) => path),
      [[0]]
    );
    assert.equal(headerEditor.read.selection.contains([0]), true);
    assert.deepEqual(editor.read.selection.nodes(), [
      [editor.read.root('header')[0], [0]],
    ]);
    assert.equal(SelectionApi.root(headerEditor.read.selection()), 'header');
  });

  it('keeps base editor setNodes in the current named root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body one'), paragraph('body two')],
        roots: {
          header: [paragraph('header one'), paragraph('header two')],
        },
      },
    });
    const headerEditor = createEditorView(editor, { root: 'header' });

    headerEditor.update.selection.setNodes([[0]]);
    editor.update.selection.setNodes([[1]]);

    assert.deepEqual(editor.read.selection(), {
      anchor: { path: [1, 0], offset: 0, root: 'header' },
      focus: { path: [1, 0], offset: 10, root: 'header' },
    });
    assert.deepEqual(editor.read.selection.nodes(), [
      [editor.read.root('header')[1], [1]],
    ]);
  });

  it('sets node selection against structural changes in the same transaction', () => {
    const editor = createSeededEditor();
    let draftSelection: ReturnType<typeof editor.read.selection> = null;

    editor.update((tx) => {
      tx.nodes.insert(paragraph('zero'), { at: [0] });
      tx.selection.setNodes([[2], [0]]);
      draftSelection = tx.selection();
    });

    const expected = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [2, 0], offset: 3 },
    };

    assert.deepEqual(draftSelection, expected);
    assert.deepEqual(editor.read.selection(), expected);
    assert.deepEqual(
      editor.read.selection.nodes().map(([, path]) => path),
      [[0], [2]]
    );
  });

  it('rolls back the update when any selected node path is stale', () => {
    const editor = createSeededEditor();
    const before = editor.read.selection();

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.nodes.set({ role: 'draft' }, { at: [0] });
          tx.selection.setNodes([[0], [9]]);
        }),
      /Cannot select a missing node at path \[9\]/
    );

    assert.deepEqual(editor.read.children()[0], paragraph('one'));
    assert.deepEqual(editor.read.selection(), before);
  });

  it('passes grouped read state into editor.read', () => {
    const editor = createSeededEditor();

    const state = editor.read((innerState5) => ({
      isVoid: innerState5.schema.isVoid({
        type: 'image',
        children: [{ text: '' }],
      }),
      selection: innerState5.selection(),
      text: innerState5.text.string([]),
      value: innerState5.value(),
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
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const fragments = editor.read((state) => ({
      explicit: state.fragment({
        at: {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        },
      }),
      selected: state.fragment(),
    }));

    assert.deepEqual(fragments.selected, [paragraph('one')]);
    assert.deepEqual(fragments.explicit, [paragraph('two')]);
    assert.deepEqual(editorGetSelection(editor), {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    });
  });

  it('exposes complete read-only state groups for document, runtime, and commit metadata', () => {
    const editor = createSeededEditor();
    const firstText = editor.read.nodes.get([0, 0])![0];
    assert.ok(NodeApi.isDescendant(firstText));
    const firstTextNodeKey = editor.read((state) => state.key(firstText));

    assert.equal(typeof firstTextNodeKey, 'string');
    assert.equal(editor.key([0, 0]), firstTextNodeKey);

    const state = editor.read((innerState6) => ({
      lastCommit: innerState6.lastCommit(),
      path: innerState6.nodes.path(firstTextNodeKey),
      snapshot: innerState6.runtime.snapshot(),
      valueHasSnapshot: 'snapshot' in innerState6.value,
    }));

    assert.equal(state.valueHasSnapshot, false);
    assert.deepEqual(state.snapshot.children, [
      paragraph('one'),
      paragraph('two'),
    ]);
    assert.deepEqual(state.snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.equal(state.lastCommit?.changed.has('replace'), true);
    assert.equal(state.lastCommit?.changes.empty, false);
    assert.deepEqual(state.path, [0, 0]);
    assert.throws(
      () => editor.key(paragraph('detached')),
      /requires a live node/i
    );
  });

  it('targets a moved node by node key', () => {
    const editor = createSeededEditor();
    const firstBlock = editor.read.nodes.get([0])![0];
    assert.ok(NodeApi.isDescendant(firstBlock));
    const nodeKey = editor.key(firstBlock);

    editor.update.nodes.move({ at: nodeKey, to: [2] });

    assert.deepEqual(editor.read.nodes.path(nodeKey), [1]);
    assert.equal(editor.read.nodes.get(nodeKey)?.[0], firstBlock);

    editor.update.nodes.remove({ at: nodeKey });

    assert.equal(editor.read.nodes.path(nodeKey), undefined);
  });

  it('targets a named-root node by node key from the runtime editor', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const header = editor.read.root('header')[0];
    const headerEditor = createEditorView(editor, { root: 'header' });
    const nodeKey = headerEditor.key(header);
    const mainTextNodeKey = editor.key([0, 0]);
    const headerTextNodeKey = editor.key({
      offset: 0,
      path: [0, 0],
      root: 'header',
    });

    assert.equal(editor.read.nodes.get(nodeKey)?.[0], header);
    assert.equal(editor.read.text.string(nodeKey), 'header');
    assert.equal(editor.key(header), nodeKey);
    assert.notEqual(headerTextNodeKey, mainTextNodeKey);
    assert.equal(
      editor.read.nodes.get(headerTextNodeKey!)?.[0],
      header.children[0]
    );

    editor.update.nodes.set({ type: 'heading' }, { at: nodeKey });

    assert.equal(editor.read.root('header')[0]?.type, 'heading');
    assert.equal(editor.read.children()[0]?.type, 'paragraph');

    editor.update.nodes.remove({ at: nodeKey });

    assert.deepEqual(editor.read.root('header'), []);
    assert.deepEqual(editor.read.children(), [paragraph('body')]);
  });

  it('invalidates runtime index caches when a failed transaction discards inserted nodes', () => {
    const editor = createSeededEditor();
    let insertedNodeKey: NodeKey | null = null;

    assert.throws(() => {
      editor.update((tx) => {
        tx.nodes.insert(paragraph('draft'), { at: [1] });
        insertedNodeKey = tx.key([1]);
        throw new Error('discard');
      });
    }, /discard/);

    assert.deepEqual(editorGetChildren(editor), [
      paragraph('one'),
      paragraph('two'),
    ]);
    assert.equal(
      editor.read((state) => state.nodes.path(insertedNodeKey!)),
      undefined
    );
  });

  it('invalidates runtime index caches when replacing the document snapshot', () => {
    const editor = createSeededEditor();
    const oldSecondTextNodeKey = editor.read((state) => state.key([1, 0]));

    assert.equal(typeof oldSecondTextNodeKey, 'string');
    assert.deepEqual(
      editor.read((state) => state.nodes.path(oldSecondTextNodeKey!)),
      [1, 0]
    );

    editor.update((tx) => {
      tx.value.replace({
        children: [paragraph('fresh')],
        selection: null,
      });
    });

    const state = editor.read((innerState7) => ({
      oldSecondTextPath: innerState7.nodes.path(oldSecondTextNodeKey!),
      nextTextNodeKey: innerState7.key([0, 0]),
      value: innerState7.value(),
    }));

    assert.deepEqual(state.value, { children: [paragraph('fresh')] });
    assert.equal(state.oldSecondTextPath, undefined);
    assert.equal(typeof state.nextTextNodeKey, 'string');
  });

  it('keeps cached node keys path-stable across text-only transactions', () => {
    const editor = createSeededEditor();
    const textNodeKey = editor.read((state) => state.key([1, 0]));
    const beforeIndex = editorGetSnapshot(editor).index;

    assert.equal(typeof textNodeKey, 'string');

    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [1, 0], offset: 3 } });
    });

    const state = editor.read((innerState8) => ({
      path: innerState8.nodes.path(textNodeKey!),
      value: innerState8.value(),
    }));

    assert.deepEqual(state.path, [1, 0]);
    assert.equal(editorGetSnapshot(editor).index, beforeIndex);
    assert.deepEqual(state.value, {
      children: [paragraph('one'), paragraph('two!')],
    });
  });

  it('resolves node keys through structural draft changes without serializing them', () => {
    const editor = createSeededEditor();
    const firstBlockNodeKey = editor.read((state) => state.key([0]));
    const secondTextNodeKey = editor.read((state) => state.key([1, 0]));
    let fragmentNodeKey: string | null = null;

    assert.equal(typeof firstBlockNodeKey, 'string');
    assert.equal(typeof secondTextNodeKey, 'string');

    editor.update((tx) => {
      tx.nodes.insert(paragraph('zero'), { at: [0] });

      assert.deepEqual(tx.nodes.path(firstBlockNodeKey!), [1]);
      assert.deepEqual(tx.nodes.path(secondTextNodeKey!), [2, 0]);

      tx.nodes.move({ at: [2], to: [0] });

      assert.deepEqual(tx.nodes.path(secondTextNodeKey!), [0, 0]);
      assert.deepEqual(tx.nodes.path(firstBlockNodeKey!), [2]);

      tx.selection.set({
        kind: 'text',
        anchor: { path: [2, 0], offset: 1 },
        focus: { path: [2, 0], offset: 1 },
      });
      tx.nodes.split();

      assert.deepEqual(tx.nodes.path(secondTextNodeKey!), [0, 0]);
      assert.deepEqual(tx.nodes.path(firstBlockNodeKey!), [2]);

      tx.fragment.replace([paragraph('fragment')], {
        at: [1],
      });
      fragmentNodeKey = tx.key([1]);

      assert.equal(typeof fragmentNodeKey, 'string');
      assert.deepEqual(tx.nodes.path(secondTextNodeKey!), [0, 0]);
      assert.deepEqual(tx.nodes.path(firstBlockNodeKey!), [2]);
    });

    const exportedValue = editor.read((state) => state.value());
    const serialized = JSON.stringify(exportedValue);

    assert.deepEqual(exportedValue, {
      children: [
        paragraph('two'),
        paragraph('fragmentzero'),
        paragraph('o'),
        paragraph('ne'),
      ],
    });
    assert.equal(serialized.includes(firstBlockNodeKey!), false);
    assert.equal(serialized.includes(secondTextNodeKey!), false);
    assert.equal(serialized.includes(fragmentNodeKey!), false);
  });

  it('exposes complete query groups through state instead of direct editor aliases', () => {
    const editor = createSeededEditor();

    const state = editor.read((innerState9) => ({
      after: innerState9.points.after({ path: [0, 0], offset: 3 }),
      before: innerState9.points.before({ path: [1, 0], offset: 0 }),
      edge: innerState9.points.isEdge({ path: [0, 0], offset: 0 }, [0]),
      first: innerState9.nodes.first([]),
      isBlock: innerState9.schema.isBlock(paragraph('one')),
      isEmpty: innerState9.nodes.isEmpty({
        type: 'paragraph',
        children: [{ text: '' }],
      }),
      last: innerState9.nodes.last([]),
      levels: Array.from(innerState9.nodes.levels({ at: [0, 0] })),
      nodePaths: innerState9.nodes.toArray({ at: [] }).map(([, path]) => path),
      projected: innerState9.ranges.project({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      }),
      range: innerState9.ranges.get([0]),
      unhang: innerState9.ranges.unhang({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      }),
      voidNode: innerState9.nodes.void({ at: [] }),
    }));

    assert.deepEqual(state.after, { path: [1, 0], offset: 0 });
    assert.deepEqual(state.before, { path: [0, 0], offset: 3 });
    assert.equal(state.edge, true);
    assert.deepEqual(state.first?.[1], [0, 0]);
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
    let draftSelection: Range | null = null;

    editor.update((tx) => {
      tx.text.insert('!');
      tx.nodes.set({ role: 'edited' }, { at: [0] });
      tx.selection.set({
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 3 },
      });

      draftText = tx.text.string([]);
      draftSelection = tx.selection();
    });

    assert.equal(draftText, 'one!two');
    assert.deepEqual(draftSelection, {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 3 },
    });
    assert.equal(editorString(editor, []), 'one!two');
    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('one!', { role: 'edited' }),
      paragraph('two'),
    ]);
  });

  it('reads fragments through the update transaction draft', () => {
    const editor = createSeededEditor();
    let before: readonly Descendant[] = [];
    let after: readonly Descendant[] = [];

    replaceEditorValue(editor, {
      children: [paragraph('one'), paragraph('two')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update((tx) => {
      before = tx.fragment();
      tx.fragment.replace([paragraph('z')]);
      after = tx.fragment({
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        },
      });
    });

    assert.deepEqual(before, [paragraph('one')]);
    assert.deepEqual(after, [paragraph('z')]);
    assert.deepEqual(editorGetSnapshot(editor).children, [
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
    assert.equal(editorString(editor, []), 'onztwo');
    assert.deepEqual(editorGetSelection(editor), {
      kind: 'text',
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
        selection: {
          kind: 'text' as const,
          anchor: { path: [0, 0], offset: 11 },
          focus: { path: [0, 0], offset: 11 },
          marks: { bold: true },
        },
      });
    });

    assert.equal(txValueHasSnapshot, false);
    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [paragraph('replacement')]);
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 11 },
      focus: { path: [0, 0], offset: 11 },
      marks: { bold: true },
    });
  });

  it('routes tx writes through the isolated transaction draft', () => {
    const editor = createSeededEditor();
    let primitiveCalls = 0;
    const staleInsertTextKey = `insertText`;

    (editor as unknown as Record<string, unknown>)[staleInsertTextKey] = () => {
      primitiveCalls += 1;
      throw new Error('primitive instance writer should not back tx writes');
    };

    editor.update((tx) => {
      tx.text.insert('!');
    });

    assert.equal(primitiveCalls, 0);
    assert.equal(editorString(editor, []), 'one!two');
  });

  it('keeps tx reads coherent after mark writes in the same update', () => {
    const editor = createSeededEditor();
    let marks = null as unknown;

    editor.update((tx) => {
      tx.marks.add('bold', true);
      marks = tx.marks();
      tx.marks.remove('bold');
    });

    assert.deepEqual(marks, { bold: true });
  });

  it('sets exact insertion marks through the update transaction', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });
    editor.update((tx) => {
      tx.marks.set({ bold: true });
      tx.text.insert('!');
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
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
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });
    editor.update((tx) => {
      tx.marks.set({});
      tx.text.insert('!');
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
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
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });
    editor.update((tx) => {
      tx.marks.set(null);
      tx.text.insert('!');
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        children: [{ bold: true, text: 'one!' }],
        type: 'paragraph',
      },
    ]);
  });

  it('applies text changes through the update transaction', () => {
    const editor = createSeededEditor();

    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 3 } });
    });

    assert.equal(editorString(editor, []), 'one!two');
    assert.equal(editorGetLastCommit(editor)?.changed.has('text'), true);
  });
});
