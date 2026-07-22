import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getSnapshot as editorGetSnapshot,
  insertNodes as editorInsertNodes,
  removeNodes as editorRemoveNodes,
  replace as editorReplace,
  runTrustedUpdate,
  splitNodes as editorSplitNodes,
} from '@platejs/plite/internal';

import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  type Descendant,
  type Element,
  type Editor,
  type Node,
  NodeApi,
  type NodeEntry,
  type Path,
  schema,
  TextApi,
} from '@platejs/plite';
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

const getNodeEntry = <T extends Node>(
  editor: Editor,
  path: Path
): NodeEntry<T> => {
  const entry = editor.read.nodes.get<T>(path);
  assert(entry);

  return entry;
};

describe('plite transforms contract', () => {
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

    assert.deepEqual(editor.read.selection(), collapsedSelection([1, 0], 0));
  });

  it('preserves descendant runtime identity after replacing then moving across levels', () => {
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
    const movedTextRuntimeId = editorGetSnapshot(editor).index.idAt([0, 1, 0]);

    assert.ok(movedTextRuntimeId);

    editor.update((tx) => {
      tx.nodes.move({ at: [0, 1], to: [1] });
    });

    const movedSnapshot = editorGetSnapshot(editor);

    assert.equal(movedSnapshot.index.idAt([1, 0]), movedTextRuntimeId);
    assert.deepEqual(movedSnapshot.index.pathOf(movedTextRuntimeId), [1, 0]);
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
      tx.nodes.set(
        { type: 'paragraph' },
        { match: (node) => NodeApi.isElement(node) && tx.nodes.isBlock(node) }
      );
    });

    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ]);
  });

  it('duplicateNodes duplicates explicit node entries after the last entry', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
      ],
      selection: null,
    });

    editor.update((tx) => {
      const entry = tx.nodes.get<Element>([0]);
      assert(entry);
      tx.nodes.duplicate([entry]);
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
        getNodeEntry<Element>(editor, [0]),
        getNodeEntry<Element>(editor, [1]),
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
    const [target] = getNodeEntry<Element>(editor, [2]);

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
    editor.extend(
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

  it('mergeNodes does not cross an isolating block boundary', () => {
    const editor = createEditor();
    editor.extend(
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
    editor.extend(defineTestSchema('inline', { inline: { inline: true } }));

    editorReplace(editor, {
      children: [
        {
          type: 'block',
          children: [
            { text: '' },
            { type: 'inline', children: [{ text: 'word' }] },
            { text: '' },
          ],
        } as Descendant,
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
        } as Descendant,
      ],
      selection: collapsedSelection([0, 0], 0),
    });

    editor.update((tx) => {
      tx.nodes.set<Element>({ type: 'heading-one' }, { at: [0] });
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
      children: { text: string; bold?: true }[];
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
    const [element] = getNodeEntry<CalloutElement>(editor, [0]);
    const [text] = getNodeEntry<CalloutElement['children'][number]>(
      editor,
      [0, 0]
    );

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
    const [element] = getNodeEntry<Element>(editor, [0]);
    const [foreign] = getNodeEntry<Element>(foreignEditor, [0]);
    const detached = paragraph('detached');

    editor.update.nodes.replaceChildren([{ text: 'two' }], { at: element });
    editor.update.nodes.replaceChildren([{ text: 'wrong' }], { at: foreign });
    editor.update.nodes.replaceChildren([{ text: 'wrong' }], { at: detached });

    assert.deepEqual(editor.read.children(), [paragraph('two')]);

    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const header = createEditorView(runtime, { root: 'header' });
    const [bodyNode] = getNodeEntry<Element>(runtime.editor, [0]);
    const [headerNode] = getNodeEntry<Element>(header, [0]);

    header.update.nodes.replaceChildren([{ text: 'next' }], {
      at: headerNode,
    });
    runtime.editor.update.nodes.replaceChildren([{ text: 'wrong' }], {
      at: headerNode,
    });
    header.update.nodes.replaceChildren([{ text: 'wrong' }], { at: bodyNode });

    assert.deepEqual(runtime.editor.read.children(), [paragraph('body')]);
    assert.deepEqual(header.read.children(), [paragraph('next')]);
  });

  it('keeps node targets live across immutable writes and moves', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });
    const [first] = getNodeEntry<Element>(editor, [0]);

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
    const [foreign] = getNodeEntry<Element>(foreignEditor, [0]);
    const detached = paragraph('detached');

    editor.update.nodes.set({ tone: 'wrong' }, { at: foreign });
    editor.update.nodes.set({ tone: 'wrong' }, { at: detached });

    assert.deepEqual(editor.read.children(), [paragraph('body')]);

    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const header = createEditorView(runtime, { root: 'header' });
    const [bodyNode] = getNodeEntry<Element>(runtime.editor, [0]);
    const [headerNode] = getNodeEntry<Element>(header, [0]);

    runtime.editor.update.nodes.set({ tone: 'wrong' }, { at: headerNode });
    header.update.nodes.set({ tone: 'wrong' }, { at: bodyNode });

    assert.deepEqual(runtime.editor.read.children(), [paragraph('body')]);
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
      { at: [], match: { type: ['paragraph', 'quote'] } }
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
        } as Descendant,
      ],
      selection: collapsedSelection([0, 0], 0),
    });

    editor.update((tx) => {
      tx.nodes.set<Element>({ type: 'heading-three' }, { at: [0] });
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
          } as Descendant,
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
        } as Descendant,
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

    editor.extend(
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
        } as Descendant,
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

  it('blocks.reset strips block props while preserving requested keys', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'heading-one',
          key: 'keep-me',
          foo: 'drop-me',
          children: [{ text: 'Title' }],
        } as Descendant,
      ],
      selection: collapsedSelection([0, 0], 0),
    });

    editor.update((tx) => {
      tx.blocks.reset({ type: 'paragraph' }, { at: [0], preserve: ['key'] });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        key: 'keep-me',
        children: [{ text: 'Title' }],
      },
    ]);
  });

  it('blocks.toggle uses the editor default block type', () => {
    const editor = createEditor({ defaultBlockType: 'paragraph' });

    editorReplace(editor, {
      children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      selection: collapsedSelection([0, 0], 0),
    });

    editor.update.blocks.toggle('blockquote');

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'blockquote', children: [{ text: 'one' }] },
    ]);

    editor.update.blocks.toggle('blockquote');

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'paragraph', children: [{ text: 'one' }] },
    ]);
  });

  it('blocks.lift exposes the semantic block lift API directly', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'quote',
          children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
        } as Descendant,
      ],
      selection: null,
    });

    editor.update.blocks.lift({ at: [0, 0] });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'paragraph', children: [{ text: 'one' }] },
    ]);
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
        } as Descendant,
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
        } as Descendant,
      ],
      selection: null,
    });

    assert.throws(() => {
      editorSplitNodes(editor, { at: [], position: 0 });
    }, /Cannot split the editor root/);
  });

  it('insertNodes rejects the editor root as an insertion target', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        } as Descendant,
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
        } as Descendant,
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
        } as Descendant,
        {
          type: 'slash_input',
          children: [{ text: '' }],
        } as Descendant,
      ],
      selection: null,
    });

    editorRemoveNodes(editor, {
      at: [],
      match: (node) => 'type' in node && node.type === 'slash_input',
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
    editor.extend(
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
        } as Descendant,
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

  it('toggleNodes switches an inactive block to the target type', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      selection: collapsedSelection([0, 0], 0),
    });

    editor.update((tx) => {
      tx.nodes.toggle('blockquote', { defaultType: 'paragraph' });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'blockquote', children: [{ text: 'one' }] },
    ]);
  });

  it('toggleNodes switches an active block to the default type', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ type: 'blockquote', children: [{ text: 'one' }] }],
      selection: collapsedSelection([0, 0], 0),
    });

    editor.update((tx) => {
      tx.nodes.toggle('blockquote', { defaultType: 'paragraph' });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'paragraph', children: [{ text: 'one' }] },
    ]);
  });

  it('toggleNodes wraps and unwraps an active block when wrap is true', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      selection: collapsedSelection([0, 0], 0),
    });

    editor.update((tx) => {
      tx.nodes.toggle('code-block', { wrap: true });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'code-block',
        children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      },
    ]);

    editor.update((tx) => {
      tx.nodes.toggle('code-block', { wrap: true });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'paragraph', children: [{ text: 'one' }] },
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
      tx.nodes.wrap({ type: 'quote', children: [] } as Element, {
        split: true,
      });
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
        } as Descendant,
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.nodes.wrap({ type: 'quote', children: [] } as Element, {
        match: (node, currentPath) => {
          if ('noneditable' in node && node.noneditable === true) return false;

          for (const [ancestor] of NodeApi.ancestors(editor, currentPath)) {
            if ('noneditable' in ancestor && ancestor.noneditable === true) {
              return false;
            }
          }

          return true;
        },
      });
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
        } as Descendant,
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
    editor.extend(
      defineTestSchema('void-flag', { 'void-block': { void: 'block' } })
    );

    editorReplace(editor, {
      children: [
        {
          type: 'void-block',
          children: [{ text: '' }],
        } as Descendant,
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
