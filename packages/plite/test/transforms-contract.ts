import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  type Descendant,
  type Element,
  type Editor,
  NodeApi,
  type NodeEntry,
  type Path,
  property,
  schema,
  SelectionApi,
  target as schemaTarget,
  TextApi,
} from '@platejs/plite';
import {
  getSnapshot as editorGetSnapshot,
  insertNodes as editorInsertNodes,
  removeNodes as editorRemoveNodes,
  replace as editorReplace,
  runTrustedUpdate,
  splitNodes as editorSplitNodes,
} from '@platejs/plite/internal';

import { defineTestSchema } from './support/schema';

const collapsedSelection = (path: number[], offset: number) => ({
  kind: 'text' as const,
  anchor: { path, offset },
  focus: { path, offset },
});

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const disjointNodeSelection = () => SelectionApi.nodes([[0], [2]]);

const getNodeEntry = <T extends Descendant>(
  editor: Editor<any, any>,
  path: Path,
  match: (node: Descendant) => node is T
): NodeEntry<T> => {
  const entry = editor.read.nodes.get(path, {
    match: (node): node is T => NodeApi.isDescendant(node) && match(node),
  });
  assert.ok(entry);

  return entry;
};

describe('plite transforms contract', () => {
  it('honors type selectors across every node transform', () => {
    {
      const editor = createEditor({
        initialValue: [{ type: 'container', children: [paragraph('one')] }],
      });
      const before = editor.read.children();

      editor.update((tx) => {
        tx.nodes.lift({ at: [0, 0], type: 'missing' });
      });

      assert.deepEqual(editor.read.children(), before);
    }

    {
      const editor = createEditor({
        initialValue: [paragraph('one'), paragraph('two')],
      });
      const before = editor.read.children();

      editor.update((tx) => {
        tx.nodes.merge({ at: [1], type: 'missing' });
      });

      assert.deepEqual(editor.read.children(), before);
    }

    {
      const editor = createEditor({
        initialValue: [paragraph('one'), paragraph('two')],
      });
      const before = editor.read.children();

      editor.update((tx) => {
        tx.nodes.move({ at: [0], to: [2], type: 'missing' });
      });

      assert.deepEqual(editor.read.children(), before);
    }

    {
      const editor = createEditor({ initialValue: [paragraph('one')] });
      const before = editor.read.children();

      editor.update((tx) => {
        tx.nodes.split({ at: [0], position: 0, type: 'missing' });
      });

      assert.deepEqual(editor.read.children(), before);
    }

    {
      const editor = createEditor({
        initialValue: [{ type: 'container', children: [paragraph('one')] }],
      });
      const before = editor.read.children();

      editor.update((tx) => {
        tx.nodes.unwrap({ at: [0], type: 'missing' });
      });

      assert.deepEqual(editor.read.children(), before);
    }

    {
      const editor = createEditor({ initialValue: [paragraph('one')] });
      const before = editor.read.children();

      editor.update((tx) => {
        tx.nodes.wrap(
          { type: 'quote', children: [] },
          { at: [0], type: 'missing' }
        );
      });

      assert.deepEqual(editor.read.children(), before);
    }
  });

  it('moveNodes is a no-op when the source and destination paths are equal', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        { type: 'block', children: [{ text: '1' }] },
        { type: 'block', children: [{ text: '2' }] },
      ],
      selection: null,
    });

    editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [1] });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'block', children: [{ text: '1' }] },
      { type: 'block', children: [{ text: '2' }] },
    ]);
  });

  it('moveNodes can move a top-level block inside the next block container', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'block',
          children: [{ text: 'one' }],
        },
        {
          type: 'block',
          children: [{ type: 'block', children: [{ text: 'two' }] }],
        },
      ],
      selection: collapsedSelection([0, 0], 0),
    });

    editor.update((tx) => {
      tx.nodes.move({ at: [0], to: [1, 1] });
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'block',
        children: [
          { type: 'block', children: [{ text: 'two' }] },
          { type: 'block', children: [{ text: 'one' }] },
        ],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 1, 0], 0));
  });

  it('keeps selection inside a nested block moved to the document root', () => {
    const editor = createEditor({
      initialSelection: collapsedSelection([0, 1, 0], 0),
      initialValue: [
        {
          type: 'container',
          children: [
            { type: 'block', children: [{ text: 'one' }] },
            { type: 'block', children: [{ text: '' }] },
          ],
        },
      ],
    });

    editor.update((tx) => {
      tx.nodes.move({ at: [0, 1], to: [1] });
    });

    assert.deepEqual(editor.read.selection(), {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });

  it('preserves descendant node key after replacing then moving across levels', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'section',
          children: [paragraph('A'), paragraph('B')],
        },
        paragraph('C'),
      ],
      selection: null,
    });
    const movedTextNodeKey = editorGetSnapshot(editor).index.keyAt([0, 1, 0]);

    assert.ok(movedTextNodeKey);

    editor.update((tx) => {
      tx.nodes.move({ at: [0, 1], to: [1] });
    });

    const movedSnapshot = editorGetSnapshot(editor);

    assert.equal(movedSnapshot.index.keyAt([1, 0]), movedTextNodeKey);
    assert.deepEqual(movedSnapshot.index.pathOf(movedTextNodeKey), [1, 0]);
  });

  it('rebases an implicit selection target through multiple structural moves', () => {
    const editor = createEditor({
      initialSelection: {
        kind: 'text',
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 3 },
      },
      initialValue: [
        {
          type: 'list',
          children: [
            { type: 'item', children: [{ text: 'one' }] },
            { type: 'item', children: [{ text: 'two' }] },
          ],
        },
      ],
    });

    editor.update((tx) => {
      tx.nodes.unwrap({
        match: (node) => NodeApi.isElement(node) && node.type === 'list',
        split: true,
      });
      tx.blocks.set({ type: 'paragraph' });
    });

    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ]);
  });

  it('blocks.duplicate duplicates the target block after itself', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
      ],
      selection: null,
    });

    editor.update((tx) => {
      tx.blocks.duplicate({ at: [0] });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ]);
  });

  it('reads a range from node entries', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
      ],
      selection: null,
    });

    assert.deepEqual(
      editor.read.ranges.fromEntries([
        getNodeEntry(editor, [0], NodeApi.isElement),
        getNodeEntry(editor, [1], NodeApi.isElement),
      ]),
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 3 },
      }
    );
    assert.equal(editor.read.ranges.fromEntries([]), undefined);
  });

  it('duplicateNodes duplicates the block at the current selection', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
      ],
      selection: collapsedSelection([0, 0], 1),
    });

    editor.update.blocks.duplicate();

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ]);
  });

  it('blocks.duplicate preserves exact node-selection membership', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('one'), paragraph('middle'), paragraph('three')],
      selection: disjointNodeSelection(),
    });

    editor.update.blocks.duplicate();

    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('one'),
      paragraph('middle'),
      paragraph('three'),
      paragraph('one'),
      paragraph('three'),
    ]);
  });

  it('blocks.insertAfter inserts after the target block', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
        { type: 'paragraph', children: [{ text: 'three' }] },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 3 },
      },
    });

    const inserted = {
      type: 'paragraph',
      children: [{ text: 'inserted' }],
    };
    const [target] = getNodeEntry(editor, [2], NodeApi.isElement);

    editor.update.blocks.insertAfter(inserted);
    editor.update.blocks.insertAfter(
      { type: 'paragraph', children: [{ text: 'after target' }] },
      { at: target }
    );

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
      { type: 'paragraph', children: [{ text: 'inserted' }] },
      { type: 'paragraph', children: [{ text: 'three' }] },
      { type: 'paragraph', children: [{ text: 'after target' }] },
    ]);
  });

  it('blocks.insertAfter uses the last exact node-selection member', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('one'), paragraph('middle'), paragraph('three')],
      selection: disjointNodeSelection(),
    });

    editor.update.blocks.insertAfter(paragraph('inserted'));

    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('one'),
      paragraph('middle'),
      paragraph('three'),
      paragraph('inserted'),
    ]);
  });

  it('blocks.insertAfter resolves a named-root node key in its owner root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header'), paragraph('tail')] },
      },
    });
    const header = createEditorView(editor, { root: 'header' });
    const target = header.key([0]);

    assert.ok(target);
    editor.update.blocks.insertAfter(paragraph('inserted'), { at: target });

    assert.deepEqual(editor.read.children(), [paragraph('body')]);
    assert.deepEqual(header.read.children(), [
      paragraph('header'),
      paragraph('inserted'),
      paragraph('tail'),
    ]);
  });

  it('insertText keeps the selected mark when replacing a marked leaf', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'This ' },
            { bold: true, text: 'bold' },
            { text: ' text' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 4 },
      },
    });

    editor.update((tx) => {
      tx.text.insert('plain');
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'paragraph',
        children: [
          { text: 'This ' },
          { bold: true, text: 'plain' },
          { text: ' text' },
        ],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 1], 5));
  });

  it('insertText preserves the suffix block after replacing full sibling blocks', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('one'), paragraph('two'), paragraph('three')],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 3 },
      },
    });

    editor.update.text.insert('replacement');

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      paragraph('replacement'),
      paragraph('three'),
    ]);
    assert.deepEqual(
      after.selection,
      collapsedSelection([0, 0], 'replacement'.length)
    );
  });

  it('insertText normalizes adjacent same-mark leaves after replacing part of a marked leaf', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'bold' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update((tx) => {
      tx.text.insert('1');
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'bo1d' }],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 0], 3));
  });

  it('insertText keeps selected marks when replacing the full document text', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'Styled' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'Styled'.length },
      },
    });

    editor.update((tx) => {
      tx.text.insert('Next');
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'Next' }],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 0], 4));
  });

  it('insertText applies pending marks by default for implicit insertion', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'existing ' }],
        },
      ],
      selection: {
        ...collapsedSelection([0, 0], 'existing '.length),
        marks: { bold: true },
      },
    });

    editor.update.text.insert('marked');

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'paragraph',
        children: [{ text: 'existing ' }, { bold: true, text: 'marked' }],
      },
    ]);
    assert.deepEqual(
      after.selection,
      collapsedSelection([0, 1], 'marked'.length)
    );
  });

  it('insertText can skip pending marks for implicit insertion', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'existing ' }],
        },
      ],
      selection: {
        ...collapsedSelection([0, 0], 'existing '.length),
        marks: { bold: true },
      },
    });

    editor.update.text.insert('plain', { marks: false });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'paragraph',
        children: [{ text: 'existing plain' }],
      },
    ]);
    assert.deepEqual(
      after.selection,
      collapsedSelection([0, 0], 'existing plain'.length)
    );
  });

  it('insertText replaces a mixed-mark range without removing text before it', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { bold: true, text: 'This is a ' },
            { italic: true, text: 'test' },
            { bold: true, text: '.' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 2], offset: 1 },
      },
    });

    editor.update((tx) => {
      tx.text.insert('X');
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'This is a X' }],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 0], 11));
  });

  it('insertText replaces a selection spanning a block void without keeping a void anchor', () => {
    const editor = createEditor();
    editor.install(
      defineTestSchema('block-void-insert-selection-contract', {
        image: { void: 'block' },
      })
    );

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Before' }],
        },
        {
          type: 'image',
          children: [{ text: '' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'After' }],
        },
      ] as Element[],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [2, 0], offset: 2 },
      },
    });

    editor.update((tx) => {
      tx.text.insert('X');
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'paragraph',
        children: [{ text: 'BefXter' }],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 0], 4));
  });

  it('node selection text replacement removes only exact selected blocks', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:node-selection-text-replacement', {
          elements: {
            paragraph: { content: schema.content.text() },
          },
          root: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
      ],
    });

    editorReplace(editor, {
      children: [paragraph('first'), paragraph('middle'), paragraph('third')],
      selection: null,
    });
    editor.update.selection.set(disjointNodeSelection());

    editor.update.text.insert('replacement');

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      paragraph('replacement'),
      paragraph('middle'),
    ]);
    assert.deepEqual(
      after.selection,
      collapsedSelection([0, 0], 'replacement'.length)
    );
  });

  it('node selection marks and node transforms skip aggregate-range gaps', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('first'), paragraph('middle'), paragraph('third')],
      selection: null,
    });
    editor.update.selection.set(disjointNodeSelection());

    editor.update((tx) => {
      tx.marks.add('bold', true);
      tx.nodes.set({ selected: true });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        children: [{ bold: true, text: 'first' }],
        selected: true,
        type: 'paragraph',
      },
      paragraph('middle'),
      {
        children: [{ bold: true, text: 'third' }],
        selected: true,
        type: 'paragraph',
      },
    ]);

    editor.update.nodes.remove();

    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('middle')]);
  });

  it('mergeNodes does not cross an isolating block boundary', () => {
    const editor = createEditor();
    editor.install(
      defineTestSchema('isolating-merge-boundary', {
        callout: { isolating: true },
      })
    );

    editorReplace(editor, {
      children: [
        {
          type: 'callout',
          children: [{ type: 'paragraph', children: [{ text: 'inside' }] }],
        },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ] as Element[],
      selection: collapsedSelection([1, 0], 0),
    });

    editor.update((tx) => {
      tx.nodes.merge({ at: [1] });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'callout',
        children: [{ type: 'paragraph', children: [{ text: 'inside' }] }],
      },
      { type: 'paragraph', children: [{ text: 'after' }] },
    ]);
  });

  it('setNodes can target the selected inline element through match without an explicit path', () => {
    const editor = createEditor();
    editor.install(defineTestSchema('inline', { inline: { inline: true } }));

    editorReplace(editor, {
      children: [
        {
          type: 'block',
          children: [
            { text: '' },
            { type: 'inline', children: [{ text: 'word' }] },
            { text: '' },
          ],
        },
      ],
      selection: collapsedSelection([0, 1, 0], 0),
    });

    editor.update((tx) => {
      tx.nodes.set(
        { someKey: true },
        {
          match: (node) => 'children' in node && tx.schema.isInline(node),
        }
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'block',
        children: [
          { text: '' },
          { type: 'inline', someKey: true, children: [{ text: 'word' }] },
          { text: '' },
        ],
      },
    ]);
  });

  it('setNodes accepts typed element props through the transaction API', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        },
      ],
      selection: collapsedSelection([0, 0], 0),
    });

    editor.update((tx) => {
      tx.nodes.set(
        { type: 'heading-one' },
        { at: [0], match: NodeApi.isElement }
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'heading-one',
        children: [{ text: 'one' }],
      },
    ]);
  });

  it('targets live element and text nodes without a path lookup', () => {
    type CalloutElement = {
      type: 'callout';
      icon: string;
      children: Array<{ text: string; bold?: true }>;
    };
    const editor = createEditor<CalloutElement[]>({
      initialValue: [
        {
          type: 'callout',
          icon: 'info',
          children: [{ text: 'one' }],
        },
      ],
    });
    const [element] = getNodeEntry(
      editor,
      [0],
      (node): node is CalloutElement =>
        NodeApi.isElement(node) && node.type === 'callout'
    );
    const [text] = getNodeEntry(editor, [0, 0], TextApi.isText);

    editor.update.nodes.set({ icon: 'warning' }, { at: element });
    editor.update.nodes.set({ bold: true }, { at: text });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'callout',
        icon: 'warning',
        children: [{ bold: true, text: 'one' }],
      },
    ]);
  });

  it('replaces children through live elements and ignores unresolved elements', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });
    const foreignEditor = createEditor({
      initialValue: [paragraph('foreign')],
    });
    const [element] = getNodeEntry(editor, [0], NodeApi.isElement);
    const [foreign] = getNodeEntry(foreignEditor, [0], NodeApi.isElement);
    const detached = paragraph('detached');

    editor.update.nodes.replaceChildren([{ text: 'two' }], { at: element });
    editor.update.nodes.replaceChildren([{ text: 'wrong' }], { at: foreign });
    editor.update.nodes.replaceChildren([{ text: 'wrong' }], { at: detached });

    assert.deepEqual(editor.read.children(), [paragraph('two')]);

    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const header = createEditorView(runtime, { root: 'header' });
    const [bodyNode] = getNodeEntry(runtime, [0], NodeApi.isElement);
    const [headerNode] = getNodeEntry(header, [0], NodeApi.isElement);
    const headerKey = header.key(headerNode);

    header.update.nodes.replaceChildren([{ text: 'next' }], {
      at: headerNode,
    });
    runtime.update.nodes.replaceChildren([{ text: 'wrong' }], {
      at: headerNode,
    });
    header.update.nodes.replaceChildren([{ text: 'wrong' }], { at: bodyNode });

    assert.deepEqual(runtime.read.children(), [paragraph('body')]);
    assert.deepEqual(header.read.children(), [paragraph('next')]);

    runtime.update.nodes.replaceChildren([{ text: 'keyed' }], {
      at: headerKey,
    });

    assert.deepEqual(runtime.read.children(), [paragraph('body')]);
    assert.deepEqual(header.read.children(), [paragraph('keyed')]);
  });

  it('preserves positionally corresponding node keys when requested', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });
    const firstKey = editor.key([0])!;
    const firstTextKey = editor.key([0, 0])!;
    const secondKey = editor.key([1])!;

    editor.update.nodes.replaceChildren(
      [paragraph('next'), paragraph('again'), paragraph('extra')],
      { at: [], preserveKeys: true }
    );

    assert.deepEqual(editor.read.nodes.get(firstKey), [paragraph('next'), [0]]);
    assert.deepEqual(editor.read.nodes.get(firstTextKey), [
      { text: 'next' },
      [0, 0],
    ]);
    assert.deepEqual(editor.read.nodes.get(secondKey), [
      paragraph('again'),
      [1],
    ]);
    assert.notEqual(editor.key([2]), firstKey);
    assert.notEqual(editor.key([2]), secondKey);
  });

  it('keeps node targets live across immutable writes and moves', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });
    const [first] = getNodeEntry(editor, [0], NodeApi.isElement);

    editor.update.nodes.set({ tone: 'quiet' }, { at: first });
    editor.update.nodes.move({ at: first, to: [2] });
    editor.update.nodes.set({ tone: 'loud' }, { at: first });

    assert.deepEqual(editor.read.children(), [
      paragraph('two'),
      { ...paragraph('one'), tone: 'loud' },
    ]);
    assert.deepEqual(editor.read.nodes.path(first), [1]);
  });

  it('can target an inserted node later in the same transaction', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });
    const inserted = paragraph('two');

    editor.update((tx) => {
      tx.nodes.insert(inserted, { at: [1] });
      tx.nodes.set({ tone: 'fresh' }, { at: inserted });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('one'),
      { ...paragraph('two'), tone: 'fresh' },
    ]);
  });

  it('no-ops mutations for detached, foreign, and wrong-root node targets', () => {
    const editor = createEditor({ initialValue: [paragraph('body')] });
    const foreignEditor = createEditor({
      initialValue: [paragraph('foreign')],
    });
    const [foreign] = getNodeEntry(foreignEditor, [0], NodeApi.isElement);
    const detached = paragraph('detached');

    editor.update.nodes.set({ tone: 'wrong' }, { at: foreign });
    editor.update.nodes.set({ tone: 'wrong' }, { at: detached });

    assert.deepEqual(editor.read.children(), [paragraph('body')]);

    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const header = createEditorView(runtime, { root: 'header' });
    const [bodyNode] = getNodeEntry(runtime, [0], NodeApi.isElement);
    const [headerNode] = getNodeEntry(header, [0], NodeApi.isElement);

    runtime.update.nodes.set({ tone: 'wrong' }, { at: headerNode });
    header.update.nodes.set({ tone: 'wrong' }, { at: bodyNode });

    assert.deepEqual(runtime.read.children(), [paragraph('body')]);
    assert.deepEqual(header.read.children(), [paragraph('header')]);
  });

  it('uses property matchers in node mutations', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('one'),
        { type: 'quote', children: [{ text: 'two' }] },
        { type: 'image', children: [{ text: '' }] },
      ],
    });

    editor.update.nodes.set(
      { selected: true },
      { at: [], type: ['paragraph', 'quote'] }
    );

    assert.deepEqual(editor.read.children(), [
      { ...paragraph('one'), selected: true },
      { type: 'quote', selected: true, children: [{ text: 'two' }] },
      { type: 'image', children: [{ text: '' }] },
    ]);
  });

  it('setNodes preserves existing element attrs and text marks when changing type', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'heading-two',
          id: 'stable-heading',
          children: [{ bold: true, text: 'Title' }],
        },
      ],
      selection: collapsedSelection([0, 0], 0),
    });

    editor.update((tx) => {
      tx.nodes.set(
        { type: 'heading-three' },
        { at: [0], match: NodeApi.isElement }
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'heading-three',
        id: 'stable-heading',
        children: [{ bold: true, text: 'Title' }],
      },
    ]);
  });

  it('setNodes with split does not include the next text when a range ends at offset zero', () => {
    const editor = createEditor();

    runTrustedUpdate(editor, (tx) => {
      tx.value.replace({
        children: [
          {
            type: 'paragraph',
            children: [
              { bold: true, text: 'PingCode ' },
              { text: 'Wiki' },
              { italic: true, text: ' & Worktile' },
            ],
          },
        ],
        selection: null,
      });
    });

    editor.update((tx) => {
      tx.nodes.set(
        { diff: true },
        {
          at: {
            anchor: { path: [0, 1], offset: 0 },
            focus: { path: [0, 2], offset: 0 },
          },
          match: TextApi.isText,
          split: true,
        }
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [
          { bold: true, text: 'PingCode ' },
          { diff: true, text: 'Wiki' },
          { italic: true, text: ' & Worktile' },
        ],
      },
    ]);
  });

  it('setNodes with marks splits and marks selected text', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'before text after' }],
        },
      ],
      selection: null,
    });

    editor.update((tx) => {
      tx.nodes.set(
        { suggestion: true },
        {
          at: {
            anchor: { path: [0, 0], offset: 7 },
            focus: { path: [0, 0], offset: 11 },
          },
          marks: true,
        }
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [
          { text: 'before ' },
          { suggestion: true, text: 'text' },
          { text: ' after' },
        ],
      },
    ]);
  });

  it('setNodes with marks respects the caller match', () => {
    const editor = createEditor();

    editor.install(
      defineTestSchema('mention', { mention: { void: 'markable-inline' } })
    );
    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'before text ' },
            { type: 'mention', children: [{ text: '' }] },
            { text: ' after text' },
          ],
        },
      ],
      selection: null,
    });

    editor.update((tx) => {
      tx.nodes.set(
        { suggestion: true },
        {
          at: {
            anchor: { path: [0, 0], offset: 7 },
            focus: { path: [0, 2], offset: 6 },
          },
          marks: true,
          match: (node, path) => {
            if (!TextApi.isText(node)) return false;
            const parent = tx.nodes.parent(path);

            return !parent || !tx.schema.isInline(parent[0]);
          },
        }
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [
          { text: 'before ' },
          { suggestion: true, text: 'text ' },
          { type: 'mention', children: [{ text: '' }] },
          { suggestion: true, text: ' after' },
          { text: ' text' },
        ],
      },
    ]);
  });

  it('blocks.toggle uses the grammar default block type', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:toggle-block-default', {
          elements: {
            blockquote: { content: schema.content.text() },
            paragraph: { content: schema.content.text() },
          },
          root: schema.content.types(['paragraph', 'blockquote'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
      ],
    });

    editorReplace(editor, {
      children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      selection: collapsedSelection([0, 0], 0),
    });

    editor.update.blocks.toggle({ type: 'blockquote' });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'blockquote', children: [{ text: 'one' }] },
    ]);

    editor.update.blocks.toggle({ type: 'blockquote' });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'paragraph', children: [{ text: 'one' }] },
    ]);
  });

  it('blocks.toggle owns target properties with the type', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:toggle-block-props', {
          elements: {
            heading: {
              content: schema.content.text(),
              properties: { level: property.number() },
            },
            paragraph: { content: schema.content.text() },
          },
          root: schema.content.types(['paragraph', 'heading'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
      ],
    });

    editorReplace(editor, {
      children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      selection: collapsedSelection([0, 0], 0),
    });

    editor.update.blocks.toggle({ level: 2, type: 'heading' });

    assert.deepEqual(editor.read.children()[0], {
      level: 2,
      type: 'heading',
      children: [{ text: 'one' }],
    });

    editor.update.blocks.toggle({ level: 2, type: 'heading' });

    assert.deepEqual(editor.read.children()[0], {
      type: 'paragraph',
      children: [{ text: 'one' }],
    });
  });

  it('blocks.toggle uses the immediate parent default when deactivating', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:toggle-nested-default', {
          elements: {
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.text() },
            section: {
              content: schema.content.types(['paragraph', 'quote'], {
                default: { type: 'paragraph' },
                min: 1,
              }),
            },
          },
          root: schema.content.types(['section', 'paragraph'], {
            default: { type: 'section' },
            min: 1,
          }),
        }),
      ],
    });

    editorReplace(editor, {
      children: [
        {
          type: 'section',
          children: [{ type: 'quote', children: [{ text: 'one' }] }],
        },
      ],
      selection: collapsedSelection([0, 0, 0], 0),
    });

    editor.update.blocks.toggle({ type: 'quote' });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'section',
        children: [paragraph('one')],
      },
    ]);
  });

  it('blocks.reset uses the immediate schema default', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:reset-immediate-default', {
          elements: {
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.text() },
            section: {
              content: schema.content.types(['paragraph', 'quote'], {
                default: { type: 'paragraph' },
                min: 1,
              }),
            },
          },
          properties: [
            schema.elementProperty('shared', property.string(), {
              target: schemaTarget.types(['paragraph', 'quote']),
              typeChange: 'preserve-if-allowed',
            }),
            schema.elementProperty('quoteOnly', property.string(), {
              target: schemaTarget.type('quote'),
            }),
            schema.elementProperty(
              'tone',
              property.string({ default: 'plain' }),
              { target: schemaTarget.type('paragraph') }
            ),
            schema.elementProperty(
              'sectionTone',
              property.string({ default: 'nested' }),
              {
                target: schemaTarget.and(
                  schemaTarget.type('paragraph'),
                  schemaTarget.parent(schemaTarget.type('section'))
                ),
              }
            ),
          ],
          root: schema.content.types(['section', 'paragraph', 'quote'], {
            default: { type: 'section' },
            min: 1,
          }),
        }),
      ],
    });

    editorReplace(editor, {
      children: [
        {
          type: 'section',
          children: [
            {
              type: 'quote',
              quoteOnly: 'remove',
              shared: 'keep',
              children: [{ text: 'one' }],
            },
          ],
        },
      ],
      selection: collapsedSelection([0, 0, 0], 1),
    });
    const blockKey = editor.key([0, 0]);

    editor.update.blocks.reset({ at: [0, 0] });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'section',
        children: [
          {
            type: 'paragraph',
            sectionTone: 'nested',
            shared: 'keep',
            tone: 'plain',
            children: [{ text: 'one' }],
          },
        ],
      },
    ]);
    assert.equal(editor.key([0, 0]), blockKey);
    assert.deepEqual(
      editorGetSnapshot(editor).selection,
      collapsedSelection([0, 0, 0], 1)
    );

    editor.update.text.insert('X');

    assert.deepEqual(editor.read.children(), [
      {
        type: 'section',
        children: [
          {
            type: 'paragraph',
            sectionTone: 'nested',
            shared: 'keep',
            tone: 'plain',
            children: [{ text: 'oXne' }],
          },
        ],
      },
    ]);
  });

  it('blocks.reset changes only exact disjoint node selections', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:reset-disjoint-selection', {
          elements: {
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.text() },
          },
          root: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
      ],
    });

    editorReplace(editor, {
      children: [
        { type: 'quote', children: [{ text: 'first' }] },
        { type: 'quote', children: [{ text: 'middle' }] },
        { type: 'quote', children: [{ text: 'third' }] },
      ],
      selection: disjointNodeSelection(),
    });

    editor.update.blocks.reset();

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      paragraph('first'),
      { type: 'quote', children: [{ text: 'middle' }] },
      paragraph('third'),
    ]);
    assert.deepEqual(after.selection, disjointNodeSelection());
  });

  it('blocks.reset uses the editor view root default', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:reset-view-root', {
          elements: {
            heading: { content: schema.content.text() },
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.text() },
          },
          root: schema.content.types(['heading', 'paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          roots: {
            header: schema.content.types(['heading', 'quote'], {
              default: { type: 'quote' },
              min: 1,
            }),
          },
        }),
      ],
      initialValue: {
        children: [{ type: 'heading', children: [{ text: 'body' }] }],
        roots: {
          header: [{ type: 'heading', children: [{ text: 'header' }] }],
        },
      },
    });
    const header = createEditorView(editor, { root: 'header' });

    header.update.blocks.reset({ at: [0] });

    assert.deepEqual(editor.read.children(), [
      { type: 'heading', children: [{ text: 'body' }] },
    ]);
    assert.deepEqual(header.read.children(), [
      { type: 'quote', children: [{ text: 'header' }] },
    ]);
  });

  it('blocks.reset rejects a parent without an element default', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:reset-missing-default', {
          elements: {
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.text() },
          },
          root: schema.content.types(['paragraph', 'quote'], { min: 0 }),
        }),
      ],
      initialValue: [{ type: 'quote', children: [{ text: 'one' }] }],
    });

    assert.throws(
      () => editor.update.blocks.reset({ at: [0] }),
      /element default/
    );
  });

  it('blocks.toggle changes only exact disjoint node selections', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:toggle-disjoint-node-selection', {
          elements: {
            blockquote: { content: schema.content.text() },
            paragraph: { content: schema.content.text() },
          },
          root: schema.content.types(['paragraph', 'blockquote'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
      ],
    });

    editorReplace(editor, {
      children: [paragraph('first'), paragraph('middle'), paragraph('third')],
      selection: null,
    });
    editor.update.selection.set(disjointNodeSelection());

    editor.update.blocks.toggle({ type: 'blockquote' });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'blockquote', children: [{ text: 'first' }] },
      paragraph('middle'),
      { type: 'blockquote', children: [{ text: 'third' }] },
    ]);

    editor.update.blocks.toggle({ type: 'blockquote' });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('first'),
      paragraph('middle'),
      paragraph('third'),
    ]);
  });

  it('blocks.toggle keeps a named-root node selection in that root', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:toggle-named-root-node-selection', {
          elements: {
            blockquote: { content: schema.content.text() },
            paragraph: { content: schema.content.text() },
          },
          root: schema.content.types(['paragraph', 'blockquote'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          roots: {
            header: schema.content.types(['paragraph', 'blockquote'], {
              default: { type: 'paragraph' },
              min: 1,
            }),
          },
        }),
      ],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const header = createEditorView(editor, { root: 'header' });

    header.update.selection.setNodes([[0]]);
    editor.update.blocks.toggle({ type: 'blockquote' });

    assert.deepEqual(editor.read.value(), {
      children: [paragraph('body')],
      roots: {
        header: [{ type: 'blockquote', children: [{ text: 'header' }] }],
      },
    });
  });

  it('blocks.toggle unwraps a named-root node selection in that root', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:toggle-named-root-node-wrapper', {
          elements: {
            'code-block': {
              content: schema.content.type('paragraph', { min: 1 }),
            },
            paragraph: { content: schema.content.text() },
          },
          root: schema.content.types(['paragraph', 'code-block'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          roots: {
            header: schema.content.types(['paragraph', 'code-block'], {
              default: { type: 'paragraph' },
              min: 1,
            }),
          },
        }),
      ],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const header = createEditorView(editor, { root: 'header' });

    header.update.selection.setNodes([[0]]);
    editor.update.blocks.toggle({ type: 'code-block' }, { wrap: true });

    assert.deepEqual(header.read.children(), [
      { type: 'code-block', children: [paragraph('header')] },
    ]);

    editor.update.blocks.toggle({ type: 'code-block' }, { wrap: true });

    assert.deepEqual(editor.read.children(), [paragraph('body')]);
    assert.deepEqual(header.read.children(), [paragraph('header')]);
  });

  it('insertNodes can split the highest selected block for root-level insertion', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'section',
          children: [
            {
              type: 'paragraph',
              children: [{ text: 'Helloworld' }],
            },
          ],
        },
      ],
      selection: collapsedSelection([0, 0, 0], 5),
    });

    editor.update((tx) => {
      tx.nodes.insert(
        {
          type: 'embed',
          children: [{ text: '' }],
        } as Descendant,
        { mode: 'highest' }
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'section',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'Hello' }],
          },
        ],
      },
      {
        type: 'embed',
        children: [{ text: '' }],
      },
      {
        type: 'section',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'world' }],
          },
        ],
      },
    ]);
    assert.deepEqual(
      editorGetSnapshot(editor).selection,
      collapsedSelection([1, 0], 0)
    );
  });

  it('splitNodes rejects the editor root as a split target', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        },
      ],
      selection: null,
    });

    assert.throws(() => {
      editorSplitNodes(editor, { at: [], position: 0 });
    }, /Cannot split the editor root/);
  });

  it('splitNodes preserves selector-free explicit inline path splits', () => {
    const editor = createEditor();

    editor.install(
      defineTestSchema('split-inline-path', {
        inline: { inline: true },
      })
    );
    editorReplace(editor, {
      children: [
        {
          type: 'block',
          children: [
            { text: '' },
            {
              type: 'inline',
              children: [{ bold: true, text: 'one' }, { text: 'two' }],
            },
            { text: '' },
          ],
        },
      ],
      selection: null,
    });

    editor.update((tx) => {
      tx.nodes.split({ at: [0, 1], position: 1 });
    });

    assert.equal(
      editor.read.nodes.toArray({ at: [], type: 'inline' }).length,
      2
    );
  });

  it('splitNodes resolves an ancestor selector from a text path position', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });

    editor.update((tx) => {
      tx.nodes.split({ at: [0, 0], position: 1, type: 'paragraph' });
    });

    assert.deepEqual(editor.read.children(), [paragraph('o'), paragraph('ne')]);
  });

  it('splitNodes forces an ancestor split at a text path boundary', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });

    editor.update((tx) => {
      tx.nodes.split({ at: [0, 0], position: 0, type: 'paragraph' });
    });

    assert.deepEqual(editor.read.children(), [paragraph(''), paragraph('one')]);
  });

  it('insertNodes rejects the editor root as an insertion target', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        },
      ],
      selection: null,
    });

    assert.throws(() => {
      editorInsertNodes(
        editor,
        {
          type: 'embed',
          children: [{ text: '' }],
        } as Descendant,
        { at: [] }
      );
    }, /Cannot insert into the editor root/);
  });

  it('removeNodes rejects the editor root as a removal target', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        },
      ],
      selection: null,
    });

    assert.throws(() => {
      editorRemoveNodes(editor, { at: [] });
    }, /Cannot remove the editor root/);
  });

  it('removeNodes can match children from the editor root', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        },
        {
          type: 'slashInput',
          children: [{ text: '' }],
        },
      ],
      selection: null,
    });

    editorRemoveNodes(editor, {
      at: [],
      match: (node) => 'type' in node && node.type === 'slashInput',
    });

    assert.deepEqual(
      editor.read((state) => state.children()),
      [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        },
      ]
    );
  });

  it('setNodes can target the highest matching inline when mode is highest', () => {
    const editor = createEditor();
    editor.install(
      defineTestSchema('nested-inline-highest', {
        inline: {
          content: schema.content.any([
            schema.content.text(),
            schema.content.type('inline'),
          ]),
          inline: true,
        },
      })
    );

    editorReplace(editor, {
      children: [
        {
          type: 'block',
          children: [
            { text: '' },
            {
              type: 'inline',
              children: [
                { text: '' },
                { type: 'inline', children: [{ text: 'word' }] },
                { text: '' },
              ],
            },
            { text: '' },
          ],
        },
      ],
      selection: collapsedSelection([0, 1, 1, 0], 0),
    });

    editor.update((tx) => {
      tx.nodes.set(
        { someKey: true },
        {
          match: (node) => 'children' in node && tx.schema.isInline(node),
          mode: 'highest',
        }
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'block',
        children: [
          { text: '' },
          {
            type: 'inline',
            someKey: true,
            children: [
              { text: '' },
              {
                type: 'inline',
                children: [{ text: 'word' }],
              },
              { text: '' },
            ],
          },
          { text: '' },
        ],
      },
    ]);
  });

  it('wrapNodes can split a selected block range', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [1, 0], offset: 1 },
      },
    });

    editor.update((tx) => {
      tx.nodes.wrap(
        { type: 'quote', children: [] },
        {
          split: true,
        }
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'block', children: [{ text: 'on' }] },
      {
        type: 'quote',
        children: [
          { type: 'block', children: [{ text: 'e' }] },
          { type: 'block', children: [{ text: 't' }] },
        ],
      },
      { type: 'block', children: [{ text: 'wo' }] },
    ]);
  });

  it('wrapNodes can honor match and leave rejected nodes alone', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'block',
          noneditable: true,
          children: [{ text: 'word' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.nodes.wrap(
        { type: 'quote', children: [] },
        {
          match: (node, currentPath) => {
            if ('noneditable' in node && node.noneditable === true) {
              return false;
            }

            for (const [ancestor] of NodeApi.ancestors(editor, currentPath)) {
              if ('noneditable' in ancestor && ancestor.noneditable === true) {
                return false;
              }
            }

            return true;
          },
        }
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'block',
        noneditable: true,
        children: [{ text: 'word' }],
      },
    ]);
  });

  it('unwrapNodes can honor match with mode all', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'block',
          a: true,
          children: [
            {
              type: 'block',
              a: true,
              children: [{ type: 'block', children: [{ text: 'word' }] }],
            },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.nodes.unwrap({
        match: (node) => 'a' in node && node.a === true,
        mode: 'all',
      });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'block', children: [{ text: 'word' }] },
    ]);
  });

  it('liftNodes and unwrapNodes no-op when the selection has no valid wrapper target', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [1, 0], offset: 2 },
      },
    });

    editor.update((tx) => {
      tx.nodes.lift();
      tx.nodes.unwrap();
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      { type: 'block', children: [{ text: 'one' }] },
      { type: 'block', children: [{ text: 'two' }] },
    ]);
    assert.deepEqual(after.selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    });
  });

  it('liftNodes preserves canonical void content when voids is true', () => {
    const editor = createEditor();
    editor.install(
      defineTestSchema('void-flag', { 'void-block': { void: 'block' } })
    );

    editorReplace(editor, {
      children: [
        {
          type: 'void-block',
          children: [{ text: '' }],
        },
      ],
      selection: null,
    });

    editor.update((tx) => {
      tx.nodes.lift({ at: [0, 0], voids: true });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'void-block', children: [{ text: '' }] },
    ]);
  });
});
