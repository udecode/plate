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
} from 'plitejs';
import { history } from 'plitejs/history';

import {
  insertNodes as editorInsertNodes,
  removeNodes as editorRemoveNodes,
  runTrustedUpdate,
  splitNodes as editorSplitNodes,
} from '../src/internal';
import {
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
} from '../src/testing';
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

const disjointNodeSelection = () =>
  SelectionApi.nodes([[0], [2]], { mode: 'block' });

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

  it('wraps the blocks a selector matches from the document root', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });

    editor.update((tx) => {
      assert.equal(
        tx.nodes.wrap(
          { type: 'quote', children: [] },
          { at: [], type: 'paragraph' }
        ),
        true
      );
    });

    assert.deepEqual(editor.read.children(), [
      { type: 'quote', children: [paragraph('one'), paragraph('two')] },
    ]);
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

  it('blocks.insert inserts after the target block', () => {
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

    editor.update.blocks.insert(inserted);
    editor.update.blocks.insert(
      { type: 'paragraph', children: [{ text: 'after target' }] },
      { after: target }
    );

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
      { type: 'paragraph', children: [{ text: 'inserted' }] },
      { type: 'paragraph', children: [{ text: 'three' }] },
      { type: 'paragraph', children: [{ text: 'after target' }] },
    ]);
  });

  it('blocks.insert uses the last exact node-selection member', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('one'), paragraph('middle'), paragraph('three')],
      selection: disjointNodeSelection(),
    });

    editor.update.blocks.insert(paragraph('inserted'));

    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('one'),
      paragraph('middle'),
      paragraph('three'),
      paragraph('inserted'),
    ]);
  });

  it('blocks.insert resolves a named-root node key in its owner root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header'), paragraph('tail')] },
      },
    });
    const header = createEditorView(editor, { root: 'header' });
    const target = header.key([0]);

    assert.ok(target);
    editor.update.blocks.insert(paragraph('inserted'), { after: target });

    assert.deepEqual(editor.read.children(), [paragraph('body')]);
    assert.deepEqual(header.read.children(), [
      paragraph('header'),
      paragraph('inserted'),
      paragraph('tail'),
    ]);
  });

  it('blocks.insert replaces an empty source in one undoable commit', () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: [paragraph('before'), paragraph('')],
      initialSelection: collapsedSelection([1, 0], 0),
    });
    const version = editor.read.lastCommit()?.version ?? 0;
    const inserted = editor.update.blocks.insert(paragraph('inserted'), {
      replaceEmpty: true,
      select: true,
    });

    assert.deepEqual(inserted, [editor.key([1])]);
    assert.equal(editor.read.lastCommit()?.version, version + 1);
    assert.deepEqual(editor.read.children(), [
      paragraph('before'),
      paragraph('inserted'),
    ]);
    assert.deepEqual(editor.read.selection()?.anchor, {
      path: [1, 0],
      offset: 8,
    });
    editor.api.history.undo();
    assert.deepEqual(editor.read.children(), [
      paragraph('before'),
      paragraph(''),
    ]);
    editor.api.history.redo();
    assert.deepEqual(editor.read.children(), [
      paragraph('before'),
      paragraph('inserted'),
    ]);
  });

  it('recognizes an empty draft after inline removal before replacing its block', () => {
    const editor = createEditor({
      plugins: [
        history(),
        defineTestSchema('draft-empty-inline', { input: { void: 'inline' } }),
      ],
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: '' },
            { type: 'input', children: [{ text: '' }] },
            { text: '' },
          ],
        },
      ],
      initialSelection: collapsedSelection([0, 0], 0),
    });
    const before = editor.read.value();
    const version = editor.read.lastCommit()?.version ?? 0;
    editor.update((tx) => {
      tx.nodes.remove({ at: [0, 1] });
      const block = tx.nodes.block()!;
      assert.equal(block[0].children.length, 2);
      assert.equal(tx.nodes.isEmpty(block[0]), true);
      const inserted = tx.blocks.insert(paragraph('inserted'), {
        replaceEmpty: true,
        select: true,
      });

      assert.deepEqual(inserted, [tx.key([0])]);
    });
    assert.deepEqual(editor.read.children(), [paragraph('inserted')]);
    assert.equal(editor.read.lastCommit()?.version, version + 1);
    editor.api.history.undo();
    assert.deepEqual(editor.read.value(), before);
    editor.api.history.redo();
    assert.deepEqual(editor.read.children(), [paragraph('inserted')]);
  });

  it('blocks.insert keeps nonempty content and does not delete for an empty insertion', () => {
    const editor = createEditor({
      initialValue: [paragraph('content'), paragraph('')],
      initialSelection: collapsedSelection([0, 0], 2),
    });
    const inserted = editor.update.blocks.insert(paragraph('inserted'), {
      replaceEmpty: true,
    });

    assert.deepEqual(inserted, [editor.key([1])]);
    assert.deepEqual(editor.read.children(), [
      paragraph('content'),
      paragraph('inserted'),
      paragraph(''),
    ]);
    assert.equal(
      editor.update.blocks.insert([], { after: [2], replaceEmpty: true }),
      undefined
    );
    assert.deepEqual(editor.read.children(), [
      paragraph('content'),
      paragraph('inserted'),
      paragraph(''),
    ]);
  });

  it('blocks.insert replaces only the final exact node-selection member', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('middle'), paragraph('')],
      initialSelection: disjointNodeSelection(),
    });
    const inserted = editor.update.blocks.insert(paragraph('inserted'), {
      replaceEmpty: true,
    });

    assert.deepEqual(inserted, [editor.key([2])]);
    assert.deepEqual(editor.read.children(), [
      paragraph('one'),
      paragraph('middle'),
      paragraph('inserted'),
    ]);
  });

  it('blocks.insert replaces an empty named-root source through its key', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph(''), paragraph('tail')] },
      },
    });
    const header = createEditorView(editor, { root: 'header' });
    const at = header.key([0]);
    assert.ok(at);
    const inserted = editor.update.blocks.insert(paragraph('inserted'), {
      after: at,
      replaceEmpty: true,
    });

    assert.deepEqual(inserted, [header.key([0])]);
    assert.deepEqual(editor.read.children(), [paragraph('body')]);
    assert.deepEqual(header.read.children(), [
      paragraph('inserted'),
      paragraph('tail'),
    ]);
  });

  it('blocks.insert retains an empty atomic block', () => {
    const image = { type: 'image', children: [{ text: '' }] };
    const editor = createEditor({
      plugins: [
        defineTestSchema('insert-after-atom', { image: { void: 'block' } }),
      ],
      initialValue: [image],
      initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
    });
    const inserted = editor.update.blocks.insert(paragraph('inserted'), {
      replaceEmpty: true,
    });

    assert.deepEqual(inserted, [editor.key([1])]);
    assert.deepEqual(editor.read.children(), [image, paragraph('inserted')]);
  });

  it('blocks.insert preserves an empty structural container', () => {
    const container = { type: 'container', children: [] };
    const editor = createEditor({
      plugins: [
        defineTestSchema('insert-after-container', {
          container: { content: schema.content.types(['paragraph']) },
        }),
      ],
      initialValue: [container],
    });
    assert.deepEqual(editor.read.children(), [container]);
    const inserted = editor.update.blocks.insert(paragraph('inserted'), {
      after: [0],
      replaceEmpty: true,
    });

    assert.deepEqual(inserted, [editor.key([1])]);
    assert.deepEqual(editor.read.children(), [
      container,
      paragraph('inserted'),
    ]);
  });

  it('blocks.insert retains an empty source when maxLength rejects insertion', () => {
    const editor = createEditor({
      initialValue: [paragraph('full'), paragraph('')],
      initialSelection: collapsedSelection([1, 0], 0),
      maxLength: 4,
    });
    assert.equal(
      editor.update.blocks.insert(paragraph('more'), {
        replaceEmpty: true,
      }),
      undefined
    );
    assert.deepEqual(editor.read.children(), [
      paragraph('full'),
      paragraph(''),
    ]);
  });

  it('blocks.insert refuses blocks once their parent is full', () => {
    const editor = createEditor({
      plugins: [
        defineTestSchema('insert-full', {
          holder: { content: schema.content.types(['paragraph'], { max: 3 }) },
        }),
      ],
      initialValue: [{ type: 'holder', children: [paragraph('one')] }],
    });
    let inserted: unknown[] = [];

    editor.update((tx) => {
      inserted = [
        tx.blocks.insert(paragraph('two'), { after: [0, 0] }),
        tx.blocks.insert(paragraph('zero'), { before: [0, 0] }),
        tx.blocks.insert(paragraph('after'), { after: [0, 2] }),
        tx.blocks.insert(paragraph('before'), { before: [0, 0] }),
        tx.blocks.insert(paragraph('at'), { at: [0, 1] }),
      ];
    });

    assert.deepEqual(
      { children: editor.read.children(), inserted },
      {
        children: [
          {
            type: 'holder',
            children: [paragraph('zero'), paragraph('one'), paragraph('two')],
          },
        ],
        inserted: [
          [editor.key([0, 2])],
          [editor.key([0, 0])],
          undefined,
          undefined,
          undefined,
        ],
      }
    );
  });

  it('blocks.insert refuses a block type its parent does not allow', () => {
    const editor = createEditor({
      plugins: [
        defineTestSchema('insert-type', {
          holder: { content: schema.content.types(['quote']) },
        }),
      ],
      initialValue: [
        {
          type: 'holder',
          children: [{ type: 'quote', children: [{ text: 'q' }] }],
        },
      ],
    });
    const before = editor.read.children();

    assert.deepEqual(
      {
        inserted: editor.update.blocks.insert(paragraph('p'), {
          after: [0, 0],
        }),
        children: editor.read.children(),
      },
      { inserted: undefined, children: before }
    );
  });

  it('blocks.insert replaces the empty only child of a full parent', () => {
    const editor = createEditor({
      plugins: [
        defineTestSchema('insert-replace-full', {
          holder: {
            content: schema.content.types(['paragraph', 'quote'], { max: 1 }),
          },
        }),
      ],
      initialValue: [{ type: 'holder', children: [paragraph('')] }],
    });
    const quote = { type: 'quote', children: [{ text: 'q' }] };

    assert.deepEqual(
      {
        inserted: editor.update.blocks.insert(quote, {
          after: [0, 0],
          replaceEmpty: true,
        }),
        children: editor.read.children(),
      },
      {
        inserted: [editor.key([0, 0])],
        children: [{ type: 'holder', children: [quote] }],
      }
    );
  });

  it('blocks.insert returns the keys of the blocks a length limit admits', () => {
    const editor = createEditor({
      initialValue: [paragraph('')],
      maxLength: 2,
    });

    const inserted = editor.update.blocks.insert(
      [paragraph('ab'), paragraph('cd'), paragraph('')],
      { after: [0] }
    );

    assert.deepEqual(
      { inserted, children: editor.read.children() },
      {
        inserted: [editor.key([1]), editor.key([2])],
        children: [paragraph(''), paragraph('ab'), paragraph('')],
      }
    );
  });

  it('blocks.insert returns keys that resolve in the root the blocks land in', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body'), paragraph('tail')],
        roots: { header: [paragraph('h0'), paragraph('h1')] },
      },
      initialSelection: collapsedSelection([0, 0], 0),
    });
    const header = createEditorView(editor, { root: 'header' });
    const target = header.key([1]);

    assert.ok(target);
    const inserted = editor.update.blocks.insert(paragraph('new'), {
      before: target,
    });

    assert.deepEqual(inserted, [header.key([1])]);
  });

  it('blocks.insert throws for replaceEmpty beside before or at', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });
    const target = editor.key([0]);

    assert.ok(target);
    assert.throws(
      () =>
        editor.update.blocks.insert(paragraph('two'), {
          before: target,
          // @ts-expect-error replaceEmpty applies only to an after landing
          replaceEmpty: true,
        }),
      /replaceEmpty applies only to an after landing/
    );
    assert.throws(
      () =>
        editor.update.blocks.insert(paragraph('two'), {
          at: [1],
          // @ts-expect-error replaceEmpty applies only to an after landing
          replaceEmpty: false,
        }),
      /replaceEmpty applies only to an after landing/
    );
    assert.deepEqual(editor.read.children(), [paragraph('one')]);
  });

  it('blocks.insert keeps the rest of an update when it refuses', () => {
    const editor = createEditor({
      plugins: [
        defineTestSchema('insert-keeps-update', {
          holder: { content: schema.content.types(['paragraph'], { max: 1 }) },
        }),
      ],
      initialValue: [{ type: 'holder', children: [paragraph('one')] }],
    });

    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0, 0], offset: 3 } });
      tx.blocks.insert(paragraph('two'), { after: [0, 0] });
    });

    assert.deepEqual(editor.read.children(), [
      { type: 'holder', children: [paragraph('one!')] },
    ]);
  });

  it('blocks.insert lands after and before named-root blocks while main holds the selection', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
      initialSelection: collapsedSelection([0, 0], 0),
    });
    const header = createEditorView(editor, { root: 'header' });
    const target = header.key([0]);

    assert.ok(target);
    header.update.blocks.insert(paragraph('after'), { after: [0] });
    editor.update.blocks.insert(paragraph('before'), { before: target });

    assert.deepEqual(
      { body: editor.read.children(), header: header.read.children() },
      {
        body: [paragraph('body')],
        header: [paragraph('before'), paragraph('header'), paragraph('after')],
      }
    );
  });

  it('blocks.insert changes nothing for a missing nested before or after target', () => {
    const editor = createEditor({
      plugins: [
        defineTestSchema('insert-missing', {
          holder: { content: schema.content.types(['paragraph']) },
        }),
      ],
      initialValue: [{ type: 'holder', children: [paragraph('one')] }],
    });
    const before = editor.read.children();
    const found = { path: [0, 0, 0], offset: 0 };
    const missing = { path: [0, 9], offset: 0 };
    const targets = [
      [0, 9],
      missing,
      { anchor: found, focus: missing },
      { anchor: missing, focus: found },
    ];

    assert.deepEqual(
      {
        block: editor.read.nodes.block({ at: [0, 9] }),
        paths: targets.flatMap((target) => [
          editor.update.blocks.insert(paragraph('x'), { before: target }),
          editor.update.blocks.insert(paragraph('y'), { after: target }),
        ]),
        children: editor.read.children(),
      },
      {
        block: undefined,
        paths: targets.flatMap(() => [undefined, undefined]),
        children: before,
      }
    );
  });

  it('blocks.insert throws for an at that names no slot', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });

    assert.throws(
      () => editor.update.blocks.insert(paragraph('two'), { at: [3] }),
      /no such slot/
    );
  });

  it('blocks.insert throws for a point at', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });

    assert.throws(
      () =>
        editor.update.blocks.insert(paragraph('two'), {
          // @ts-expect-error A block insert's at is a path.
          at: { path: [0, 0], offset: 1 },
        }),
      /takes a path for at/
    );
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
      plugins: [
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

  it('changes a named-root element type by key without replacing its identity', () => {
    const editor = createEditor({
      plugins: [
        defineTestSchema('keyed-named-root-type-change', {
          draft: { properties: { kind: property.string() } },
          image: { properties: { url: property.string() }, void: 'block' },
        }),
      ],
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [
            {
              children: [{ text: '' }],
              kind: 'image',
              type: 'draft',
            },
          ],
        },
      },
    });
    const header = createEditorView(editor, { root: 'header' });
    const elementKey = header.key([0]);
    const textKey = header.key([0, 0]);

    assert.ok(elementKey);
    assert.ok(textKey);
    editor.update((tx) => {
      tx.nodes.set(
        { type: 'image', url: 'https://example.com/image.png' },
        { at: elementKey }
      );
      tx.nodes.unset('kind', { at: elementKey });
    });

    assert.deepEqual(editor.read.children(), [paragraph('body')]);
    assert.deepEqual(header.read.children(), [
      {
        children: [{ text: '' }],
        type: 'image',
        url: 'https://example.com/image.png',
      },
    ]);
    assert.equal(header.key([0]), elementKey);
    assert.equal(header.key([0, 0]), textKey);
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

  for (const [write, type, options] of [
    ['a custom compare', 'paragraph', { compare: () => true }],
    ['a merge that keeps the old type', 'quote', { merge: () => 'paragraph' }],
  ] as const) {
    it(`setNodes keeps the properties and marks of a block whose type ${write} leaves as it was`, () => {
      const editor = createEditor({
        plugins: [
          defineEditorSchema(`schema:same-type-write-${write}`, {
            elements: {
              paragraph: { content: schema.content.text() },
              quote: { content: schema.content.text() },
            },
            properties: [
              schema.elementProperty('tone', property.string(), {
                target: schemaTarget.type('paragraph'),
              }),
              schema.textProperty('lang', property.string(), {
                target: schemaTarget.type('paragraph'),
              }),
            ],
            root: schema.content.types(['paragraph', 'quote']),
          }),
        ],
        initialValue: [
          {
            type: 'paragraph',
            tone: 'loud',
            children: [{ text: 'one', lang: 'fr' }],
          },
        ],
      });

      editor.update((tx) => {
        tx.nodes.set({ type }, { at: [0], ...options });
      });

      assert.deepEqual(editorGetSnapshot(editor).children, [
        {
          type: 'paragraph',
          tone: 'loud',
          children: [{ text: 'one', lang: 'fr' }],
        },
      ]);
    });
  }

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
      plugins: [
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
      plugins: [
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
      plugins: [
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

  it('blocks.toggle turns a block on but refuses to turn it off where its parent has no element default', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:toggle-missing-default', {
          elements: {
            box: {
              content: schema.content.types(['paragraph', 'quote'], {
                default: { type: 'paragraph' },
              }),
            },
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.text() },
          },
          root: schema.content.types(['box', 'paragraph', 'quote'], {
            min: 0,
          }),
        }),
      ],
      initialValue: [
        {
          type: 'box',
          children: [{ type: 'quote', children: [{ text: 'one' }] }],
        },
        paragraph('two'),
      ],
    });

    assert.equal(
      editor.update.blocks.toggle({ type: 'quote' }, { at: [1] }),
      true
    );
    const before = editor.read.children();
    let toggled: boolean | undefined;
    let draft: readonly Descendant[] = [];

    editor.update((tx) => {
      tx.selection.setNodes([[0, 0], [1]]);
      toggled = tx.blocks.toggle({ type: 'quote' });
      draft = tx.children();
    });

    assert.equal(toggled, false);
    assert.deepEqual(draft, before);
  });

  it('blocks.toggle builds each default once and writes the one it checked', () => {
    let stamps = 0;
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:toggle-default-once', {
          elements: {
            paragraph: {
              content: schema.content.text(),
              properties: {
                stamp: property.string({
                  generate: () => {
                    stamps += 1;

                    return `stamp-${stamps}`;
                  },
                }),
              },
            },
            quote: { content: schema.content.text() },
          },
          root: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
      ],
      initialValue: [{ type: 'quote', children: [{ text: 'one' }] }],
    });
    const before = stamps;

    assert.equal(
      editor.update.blocks.toggle({ type: 'quote' }, { at: [0] }),
      true
    );
    assert.equal(stamps - before, 1);
    assert.deepEqual(editor.read.children(), [
      {
        type: 'paragraph',
        stamp: `stamp-${before + 1}`,
        children: [{ text: 'one' }],
      },
    ]);
  });

  it('blocks.toggle throws when a later default fails to build another way, even after an earlier target refused', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:toggle-bad-generated-default', {
          elements: {
            box: {
              content: schema.content.types(['quote', 'token'], {
                default: { type: 'token' },
              }),
            },
            quote: { content: schema.content.text() },
            token: {
              content: schema.content.text(),
              properties: {
                token: property.string({
                  generate: () => 1 as unknown as string,
                }),
              },
            },
          },
          root: schema.content.types(['box', 'quote'], { min: 0 }),
        }),
      ],
      initialValue: [
        { type: 'quote', children: [{ text: 'zero' }] },
        {
          type: 'box',
          children: [{ type: 'quote', children: [{ text: 'one' }] }],
        },
      ],
    });

    editor.update.selection.setNodes([[0], [1, 0]]);

    assert.throws(
      () => editor.update.blocks.toggle({ type: 'quote' }),
      /must be string/
    );
  });

  it('blocks.reset uses the immediate schema default', () => {
    const editor = createEditor({
      plugins: [
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
      plugins: [
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

  it('block formatting targets the lowest blocks inside selected containers', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:node-selection-container-blocks', {
          elements: {
            cell: {
              content: schema.content.types(['heading', 'paragraph'], {
                default: { type: 'paragraph' },
                min: 1,
              }),
            },
            heading: { content: schema.content.text() },
            paragraph: { content: schema.content.text() },
          },
          root: schema.content.type('cell', {
            default: { type: 'cell' },
            min: 1,
          }),
        }),
      ],
      initialValue: [
        { type: 'cell', children: [paragraph('one')] },
        { type: 'cell', children: [paragraph('two')] },
      ],
    });

    editor.update.selection.setNodes([[0], [1]]);

    assert.deepEqual(
      editor.read.nodes.blocks({ mode: 'lowest' }).map(([, path]) => path),
      [
        [0, 0],
        [1, 0],
      ]
    );

    editor.update.blocks.toggle({ type: 'heading' });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'cell',
        children: [{ type: 'heading', children: [{ text: 'one' }] }],
      },
      {
        type: 'cell',
        children: [{ type: 'heading', children: [{ text: 'two' }] }],
      },
    ]);

    editor.update.blocks.toggle({ type: 'heading' });

    assert.deepEqual(editor.read.children(), [
      { type: 'cell', children: [paragraph('one')] },
      { type: 'cell', children: [paragraph('two')] },
    ]);
  });

  it('blocks.reset uses the editor view root default', () => {
    const editor = createEditor({
      plugins: [
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

  it('blocks.reset refuses every target when one parent has no element default', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-missing-default', {
          elements: {
            box: {
              content: schema.content.types(['paragraph', 'quote'], {
                default: { type: 'paragraph' },
              }),
            },
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.text() },
          },
          root: schema.content.types(['box', 'quote'], { min: 0 }),
        }),
      ],
      initialValue: [
        {
          type: 'box',
          children: [{ type: 'quote', children: [{ text: 'one' }] }],
        },
        { type: 'quote', children: [{ text: 'two' }] },
      ],
    });
    const before = editor.read.children();
    let reset: boolean | undefined;
    let draft: readonly Descendant[] = [];

    editor.update((tx) => {
      tx.selection.setNodes([[0, 0], [1]]);
      reset = tx.blocks.reset();
      draft = tx.children();
    });

    assert.equal(reset, false);
    assert.deepEqual(draft, before);
  });

  it('blocks.reset keeps a property the type change preserves instead of building a new one', () => {
    let generated = 0;
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-preserved-generated-id', {
          elements: {
            heading: { content: schema.content.text() },
            paragraph: { content: schema.content.text() },
          },
          properties: [
            schema.elementProperty(
              'id',
              property.string({
                generate: () => {
                  generated += 1;

                  return 'generated';
                },
              }),
              {
                role: 'metadata',
                target: schemaTarget.group('element'),
                typeChange: 'preserve-if-allowed',
              }
            ),
          ],
          root: schema.content.types(['heading', 'paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
      ],
      initialValue: [
        { type: 'heading', id: 'kept', children: [{ text: 'one' }] },
      ],
    });

    const kept = [
      { type: 'paragraph', id: 'kept', children: [{ text: 'one' }] },
    ];

    assert.equal(editor.update.blocks.reset({ at: [0] }), true);
    assert.deepEqual(editor.read.children(), kept);
    assert.equal(
      editor.update.blocks.toggle({ type: 'heading' }, { at: [0] }),
      true
    );
    assert.equal(
      editor.update.blocks.toggle({ type: 'heading' }, { at: [0] }),
      true
    );
    assert.deepEqual(editor.read.children(), kept);
    assert.equal(generated, 0);
  });

  it('blocks.reset keeps a required property of a block that is already its default type', () => {
    const value = [
      {
        type: 'box',
        children: [{ type: 'tagged', id: 't', children: [{ text: 'one' }] }],
      },
    ];
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-same-type-required', {
          elements: {
            box: {
              content: schema.content.types(['paragraph', 'tagged'], {
                default: { type: 'tagged' },
              }),
            },
            paragraph: { content: schema.content.text() },
            tagged: {
              content: schema.content.text(),
              properties: { id: property.string({ required: true }) },
            },
          },
          root: schema.content.types(['box'], { min: 1 }),
        }),
      ],
      initialValue: value,
    });

    assert.equal(editor.update.blocks.reset({ at: [0, 0] }), true);
    assert.deepEqual(editor.read.children(), value);
  });

  it('blocks.reset converts a block whose kept text has a required property a fresh default could not fill', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-keeps-required-text', {
          elements: {
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.text() },
          },
          properties: [
            schema.textProperty('lang', property.string({ required: true }), {
              target: schemaTarget.types(['paragraph', 'quote']),
              typeChange: 'preserve-if-allowed',
            }),
          ],
          root: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
      ],
      initialValue: [
        { type: 'quote', children: [{ text: 'one', lang: 'fr' }] },
      ],
    });

    assert.equal(editor.update.blocks.reset({ at: [0] }), true);
    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'one', lang: 'fr' }] },
    ]);
  });

  it('blocks.reset refuses when the kept text lacks a property the new type requires', () => {
    const value = [{ type: 'quote', children: [{ text: 'one' }] }];
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-missing-required-text', {
          elements: {
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.text() },
          },
          properties: [
            schema.textProperty('lang', property.string({ required: true }), {
              target: schemaTarget.type('paragraph'),
            }),
          ],
          root: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 0,
          }),
        }),
      ],
      initialValue: value,
    });
    let reset: boolean | undefined;
    let draft: readonly Descendant[] = [];

    editor.update((tx) => {
      reset = tx.blocks.reset({ at: [0] });
      draft = tx.children();
    });

    assert.equal(reset, false);
    assert.deepEqual(draft, value);
  });

  it('blocks.reset restores a default on a block of the default type whose text keeps a property a type change would drop', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-same-type-required-text', {
          elements: { paragraph: { content: schema.content.text() } },
          properties: [
            schema.elementProperty(
              'tone',
              property.string({ default: 'plain' }),
              { target: schemaTarget.type('paragraph') }
            ),
            schema.textProperty('lang', property.string({ required: true }), {
              target: schemaTarget.type('paragraph'),
            }),
          ],
          root: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 0,
          }),
        }),
      ],
      initialValue: [
        {
          type: 'paragraph',
          tone: 'loud',
          children: [{ text: 'one', lang: 'fr' }],
        },
      ],
    });

    assert.equal(editor.update.blocks.reset({ at: [0] }), true);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        tone: 'plain',
        children: [{ text: 'one', lang: 'fr' }],
      },
    ]);
  });

  it('blocks.reset refuses when text inside an inline lacks a property the new type requires', () => {
    const value = [
      {
        type: 'quote',
        children: [
          { text: '' },
          { type: 'link', children: [{ text: 'site' }] },
          { text: '' },
        ],
      },
    ];
    const withLinks = schema.content.any([
      schema.content.text(),
      schema.content.type('link'),
    ]);
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-inline-required-text', {
          elements: {
            link: { content: schema.content.text(), inline: true },
            paragraph: { content: withLinks },
            quote: { content: withLinks },
          },
          properties: [
            schema.textProperty('lang', property.string({ required: true }), {
              target: schemaTarget.and(
                schemaTarget.type('link'),
                schemaTarget.parent(schemaTarget.type('paragraph'))
              ),
            }),
          ],
          root: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 0,
          }),
        }),
      ],
      initialValue: value,
    });
    let reset: boolean | undefined;
    let draft: readonly Descendant[] = [];

    editor.update((tx) => {
      reset = tx.blocks.reset({ at: [0] });
      draft = tx.children();
    });

    assert.equal(reset, false);
    assert.deepEqual(draft, value);
  });

  it('blocks.reset converts a block that holds an inline whose text the new type accepts', () => {
    const withLinks = schema.content.any([
      schema.content.text(),
      schema.content.type('link'),
    ]);
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-inline-accepted', {
          elements: {
            link: { content: schema.content.text(), inline: true },
            paragraph: { content: withLinks },
            quote: { content: withLinks },
          },
          properties: [
            schema.textProperty('lang', property.string(), {
              target: schemaTarget.and(
                schemaTarget.type('link'),
                schemaTarget.parent(schemaTarget.type('paragraph'))
              ),
            }),
          ],
          root: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 0,
          }),
        }),
      ],
      initialValue: [
        {
          type: 'quote',
          children: [
            { text: '' },
            { type: 'link', children: [{ text: 'site' }] },
            { text: '' },
          ],
        },
      ],
    });

    assert.equal(editor.update.blocks.reset({ at: [0] }), true);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          { type: 'link', children: [{ text: 'site' }] },
          { text: '' },
        ],
      },
    ]);
  });

  it('blocks.reset keeps a property that targets the block inside an undeclared wrapper', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-undeclared-wrapper', {
          elements: {
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.text() },
          },
          properties: [
            schema.elementProperty('mark', property.string(), {
              target: schemaTarget.and(
                schemaTarget.types(['paragraph', 'quote']),
                schemaTarget.parent(
                  schemaTarget.not(schemaTarget.type('paragraph'))
                )
              ),
              typeChange: 'preserve-if-allowed',
            }),
          ],
          root: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 0,
          }),
          unknown: 'preserve',
        }),
      ],
      initialValue: [
        {
          type: 'wrapper',
          children: [
            { type: 'quote', mark: 'kept', children: [{ text: 'one' }] },
          ],
        },
      ] as never,
    });

    assert.equal(editor.update.blocks.reset({ at: [0, 0] }), true);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'wrapper',
        children: [
          { type: 'paragraph', mark: 'kept', children: [{ text: 'one' }] },
        ],
      },
    ]);
  });

  it('blocks.reset keeps the children of a block when unset names them', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-unset-children', {
          elements: {
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.text() },
          },
          root: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 0,
          }),
        }),
      ],
      initialValue: [{ type: 'quote', children: [{ text: 'one' }] }],
    });

    assert.equal(
      editor.update.blocks.reset({ at: [0], unset: 'children' }),
      true
    );
    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'paragraph', children: [{ text: 'one' }] },
    ]);
  });

  it('blocks.reset restores a default in a required leading slot when unset names children', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-leading-slot-unset-children', {
          elements: {
            box: {
              content: schema.content.prefix(
                [{ element: 'heading', properties: { level: 1 } }],
                schema.content.types(['heading', 'paragraph'], {
                  default: { type: 'paragraph' },
                })
              ),
            },
            heading: {
              content: schema.content.text(),
              properties: {
                level: property.number(),
                tone: property.string({ default: 'plain' }),
              },
            },
            paragraph: { content: schema.content.text() },
          },
          root: schema.content.types(['box'], { min: 1 }),
        }),
      ],
      initialValue: [
        {
          type: 'box',
          children: [
            {
              level: 1,
              tone: 'loud',
              type: 'heading',
              children: [{ text: 'Title' }],
            },
          ],
        },
      ],
    });

    assert.equal(
      editor.update.blocks.reset({ at: [0, 0], unset: 'children' }),
      true
    );
    assert.deepEqual(editor.read.children(), [
      {
        type: 'box',
        children: [
          {
            level: 1,
            tone: 'plain',
            type: 'heading',
            children: [{ text: 'Title' }],
          },
        ],
      },
    ]);
  });

  it('blocks.reset converts a block of the default type whose text an earlier edit left without a required property', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-same-type-stripped-text', {
          elements: { paragraph: { content: schema.content.text() } },
          properties: [
            schema.elementProperty(
              'tone',
              property.string({ default: 'plain' }),
              { target: schemaTarget.type('paragraph') }
            ),
            schema.textProperty('lang', property.string({ required: true }), {
              target: schemaTarget.type('paragraph'),
            }),
          ],
          root: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 0,
          }),
        }),
      ],
      initialValue: [
        {
          type: 'paragraph',
          tone: 'loud',
          children: [{ text: 'one', lang: 'fr' }],
        },
      ],
    });
    let reset: boolean | undefined;

    editor.update((tx) => {
      tx.nodes.unset('lang', { at: [0, 0] });
      reset = tx.blocks.reset({ at: [0] });
      tx.nodes.set({ lang: 'fr' }, { at: [0, 0] });
    });

    assert.equal(reset, true);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        tone: 'plain',
        children: [{ text: 'one', lang: 'fr' }],
      },
    ]);
  });

  it('blocks.reset keeps a required property the type change carries and refuses when the lifecycle drops it', () => {
    const resetWith = (typeChange: 'drop' | 'preserve-if-allowed') => {
      const editor = createEditor({
        plugins: [
          defineEditorSchema(`schema:reset-carried-required-${typeChange}`, {
            elements: {
              box: {
                content: schema.content.types(['paragraph', 'tagged'], {
                  default: { type: 'tagged' },
                }),
              },
              paragraph: { content: schema.content.text() },
              tagged: { content: schema.content.text() },
            },
            properties: [
              schema.elementProperty('id', property.string(), {
                target: schemaTarget.type('paragraph'),
                typeChange,
              }),
              schema.elementProperty(
                'id',
                property.string({ required: true }),
                { target: schemaTarget.type('tagged'), typeChange }
              ),
            ],
            root: schema.content.types(['box'], { min: 1 }),
          }),
        ],
        initialValue: [
          {
            type: 'box',
            children: [
              { type: 'paragraph', id: 'p', children: [{ text: 'one' }] },
            ],
          },
        ],
      });

      return [editor.update.blocks.reset({ at: [0, 0] }), editor] as const;
    };
    const [kept, keptEditor] = resetWith('preserve-if-allowed');
    const [dropped] = resetWith('drop');

    assert.equal(kept, true);
    assert.deepEqual(keptEditor.read.children(), [
      {
        type: 'box',
        children: [{ type: 'tagged', id: 'p', children: [{ text: 'one' }] }],
      },
    ]);
    assert.equal(dropped, false);
  });

  it('blocks.reset restores a defaulted property of a block already of the default type', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-same-type-default', {
          elements: {
            paragraph: {
              content: schema.content.text(),
              properties: { tone: property.string({ default: 'plain' }) },
            },
          },
          root: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
      ],
      initialValue: [
        { type: 'paragraph', tone: 'loud', children: [{ text: 'one' }] },
      ],
    });

    assert.equal(editor.update.blocks.reset({ at: [0] }), true);
    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', tone: 'plain', children: [{ text: 'one' }] },
    ]);
  });

  it('blocks.reset removes an unset property that the type change would keep', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-unset-preserved', {
          elements: {
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.text() },
          },
          properties: [
            schema.elementProperty('shared', property.string(), {
              target: schemaTarget.types(['paragraph', 'quote']),
              typeChange: 'preserve-if-allowed',
            }),
          ],
          root: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
      ],
      initialValue: [
        { type: 'quote', shared: 'x', children: [{ text: 'one' }] },
      ],
    });

    assert.equal(
      editor.update.blocks.reset({ at: [0], unset: 'shared' }),
      true
    );
    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'one' }] },
    ]);
  });

  it('blocks.reset refuses a default that needs a property it cannot fill', () => {
    const value = [
      {
        type: 'box',
        children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      },
    ];
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-required-property-default', {
          elements: {
            box: {
              content: schema.content.types(['paragraph', 'tagged'], {
                default: { type: 'tagged' },
              }),
            },
            paragraph: { content: schema.content.text() },
            tagged: {
              content: schema.content.text(),
              properties: { id: property.string({ required: true }) },
            },
          },
          root: schema.content.types(['box'], { min: 1 }),
        }),
      ],
      initialValue: value,
    });

    assert.equal(editor.update.blocks.reset({ at: [0, 0] }), false);
    assert.deepEqual(editor.read.children(), value);
  });

  it('blocks.reset refuses a text default', () => {
    const value = [
      {
        type: 'box',
        children: [{ type: 'quote', children: [{ text: 'one' }] }],
      },
    ];
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-text-default', {
          elements: {
            box: {
              content: schema.content.any(
                [
                  schema.content.text(),
                  schema.content.types(['paragraph', 'quote']),
                ],
                { default: 'text' }
              ),
            },
            paragraph: { content: schema.content.text() },
            quote: { content: schema.content.text() },
          },
          root: schema.content.types(['box'], { min: 1 }),
        }),
      ],
      initialValue: value,
    });

    assert.equal(editor.update.blocks.reset({ at: [0, 0] }), false);
    assert.deepEqual(editor.read.children(), value);
  });

  it('blocks.reset throws when a later default fails to build another way, even after an earlier target refused', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-bad-generated-default', {
          elements: {
            box: {
              content: schema.content.types(['paragraph', 'token'], {
                default: { type: 'token' },
              }),
            },
            paragraph: { content: schema.content.text() },
            token: {
              content: schema.content.text(),
              properties: {
                token: property.string({
                  generate: () => 1 as unknown as string,
                }),
              },
            },
          },
          root: schema.content.types(['box', 'paragraph'], { min: 0 }),
        }),
      ],
      initialValue: [
        paragraph('zero'),
        {
          type: 'box',
          children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
        },
      ],
    });

    editor.update.selection.setNodes([[0], [1, 0]]);

    assert.throws(() => editor.update.blocks.reset(), /must be string/);
  });

  it('blocks.reset gives a block in a required leading slot that slot', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-required-position', {
          elements: {
            box: {
              content: schema.content.prefix(
                [{ element: 'heading', properties: { level: 1 } }],
                schema.content.types(['heading', 'paragraph'], {
                  default: { type: 'paragraph' },
                })
              ),
            },
            heading: {
              content: schema.content.text(),
              properties: { level: property.number() },
            },
            paragraph: { content: schema.content.text() },
          },
          root: schema.content.types(['box'], { min: 1 }),
        }),
      ],
      initialValue: [
        {
          type: 'box',
          children: [
            { level: 1, type: 'heading', children: [{ text: 'Title' }] },
            { level: 2, type: 'heading', children: [{ text: 'Sub' }] },
          ],
        },
      ],
    });

    editor.update.selection.setNodes([
      [0, 0],
      [0, 1],
    ]);

    assert.equal(editor.update.blocks.reset(), true);
    assert.deepEqual(editor.read.children(), [
      {
        type: 'box',
        children: [
          { level: 1, type: 'heading', children: [{ text: 'Title' }] },
          { type: 'paragraph', children: [{ text: 'Sub' }] },
        ],
      },
    ]);
  });

  it('blocks.reset removes unset properties the default keeps', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:reset-unset', {
          elements: {
            box: {
              content: schema.content.types(['title'], {
                default: { type: 'title' },
                min: 1,
              }),
            },
            title: {
              content: schema.content.text(),
              properties: { level: property.number() },
            },
          },
          root: schema.content.types(['box'], { min: 1 }),
        }),
      ],
      initialValue: [
        {
          type: 'box',
          children: [{ level: 2, type: 'title', children: [{ text: 'T' }] }],
        },
      ],
    });

    editor.update.blocks.reset({ at: [0, 0], unset: 'level' });

    assert.deepEqual(editor.read.children(), [
      { type: 'box', children: [{ type: 'title', children: [{ text: 'T' }] }] },
    ]);
  });

  it('blocks.toggle changes only exact disjoint node selections', () => {
    const editor = createEditor({
      plugins: [
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
      plugins: [
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
      plugins: [
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

  it('insertNodes lands a block between the halves at either edge of an inline', () => {
    const link = { type: 'link', children: [{ text: 'two' }] };
    const embed = { type: 'embed', children: [{ text: '' }] };

    for (const [offset, expected] of [
      [
        3,
        [
          {
            type: 'paragraph',
            children: [{ text: 'one' }, link, { text: '' }],
          },
          embed,
          paragraph('three'),
        ],
      ],
      [
        0,
        [
          paragraph('one'),
          embed,
          {
            type: 'paragraph',
            children: [{ text: '' }, link, { text: 'three' }],
          },
        ],
      ],
    ] as const) {
      const editor = createEditor();

      editor.install(
        defineTestSchema('insert-inline-edge', {
          embed: {},
          link: { inline: true },
        })
      );
      editorReplace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'one' }, link, { text: 'three' }],
          },
        ],
        selection: collapsedSelection([0, 1, 0], offset),
      });

      editor.update((tx) => {
        tx.nodes.insert(embed);
      });

      assert.deepEqual(editor.read.children(), expected);
    }
  });

  it('insertNodes lands a block after an empty block holding the caret', () => {
    const editor = createEditor();

    editor.install(defineTestSchema('insert-empty-block', { embed: {} }));
    editorReplace(editor, {
      children: [paragraph('')],
      selection: collapsedSelection([0, 0], 0),
    });

    editor.update((tx) => {
      tx.nodes.insert({ type: 'embed', children: [{ text: '' }] });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(''),
      { type: 'embed', children: [{ text: '' }] },
    ]);
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

  it('wrapNodes with split refuses a range inside a read-only block, even with voids', () => {
    const editor = createEditor();

    editor.install(
      defineTestSchema('wrap-read-only-block-badge', {
        badge: { inline: true, readOnly: true },
        link: { inline: true },
        locked: { readOnly: true },
      })
    );
    editorReplace(editor, {
      children: [
        {
          type: 'locked',
          children: [
            { text: 'a' },
            { type: 'badge', children: [{ text: 'b' }] },
            { text: '.' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 2], offset: 1 },
      },
    });
    const before = editorGetSnapshot(editor).children;
    let wrapped: boolean | undefined;

    editor.update((tx) => {
      wrapped = tx.nodes.wrap(
        { type: 'link', children: [] },
        { split: true, voids: true }
      );
    });

    assert.equal(wrapped, false);
    assert.deepEqual(editorGetSnapshot(editor).children, before);
  });

  it('wrapNodes with split and voids wraps a selected inline void whole', () => {
    const editor = createEditor();

    editor.install(
      defineTestSchema('wrap-voids-inline-void', {
        link: {
          content: schema.content.any([
            schema.content.text(),
            schema.content.group('inline'),
          ]),
          inline: true,
        },
        mention: { void: 'inline' },
      })
    );
    editorReplace(editor, {
      children: [
        {
          type: 'block',
          children: [
            { text: 'a' },
            { type: 'mention', children: [{ text: '' }] },
            { text: 'b' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 2], offset: 0 },
      },
    });
    let wrapped: boolean | undefined;

    editor.update((tx) => {
      wrapped = tx.nodes.wrap(
        { type: 'link', children: [] },
        { split: true, voids: true }
      );
    });

    assert.equal(wrapped, true);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'block',
        children: [
          { text: 'a' },
          {
            type: 'link',
            children: [
              { text: '' },
              { type: 'mention', children: [{ text: '' }] },
              { text: '' },
            ],
          },
          { text: 'b' },
        ],
      },
    ]);
  });

  it('wrapNodes with split and a type keeps text before a selected inline void out', () => {
    const editor = createEditor();
    const open = schema.content.any([
      schema.content.text(),
      schema.content.group('inline'),
    ]);

    editor.install(
      defineTestSchema('wrap-type-start-void', {
        mention: { void: 'inline' },
        outer: { content: open, inline: true },
        wrapper: { content: open, inline: true },
      })
    );
    editorReplace(editor, {
      children: [
        {
          type: 'block',
          children: [
            { text: '' },
            {
              type: 'outer',
              children: [
                { text: 'a' },
                { type: 'mention', children: [{ text: '' }] },
                { text: 'tail' },
              ],
            },
            { text: '' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 1, 0], offset: 1 },
        focus: { path: [0, 1, 2], offset: 2 },
      },
    });

    editor.update((tx) => {
      tx.nodes.wrap(
        { type: 'wrapper', children: [] },
        { split: true, type: 'outer' }
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'block',
        children: [
          { text: '' },
          { type: 'outer', children: [{ text: 'a' }] },
          { text: '' },
          {
            type: 'wrapper',
            children: [
              { text: '' },
              {
                type: 'outer',
                children: [
                  { text: '' },
                  { type: 'mention', children: [{ text: '' }] },
                  { text: 'ta' },
                ],
              },
              { text: '' },
            ],
          },
          { text: '' },
          { type: 'outer', children: [{ text: 'il' }] },
          { text: '' },
        ],
      },
    ]);
  });

  it('wrapNodes with voids refuses a link over a badge in a read-only block', () => {
    const editor = createEditor();

    editor.install(
      defineTestSchema('wrap-voids-read-only-badge', {
        badge: { inline: true, readOnly: true },
        link: { inline: true },
        locked: { readOnly: true },
      })
    );
    editorReplace(editor, {
      children: [
        {
          type: 'locked',
          children: [
            { text: 'a' },
            { type: 'badge', children: [{ text: 'b' }] },
            { text: '.' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 2], offset: 1 },
      },
    });
    const before = editorGetSnapshot(editor).children;
    let wrapped: boolean | undefined;

    editor.update((tx) => {
      wrapped = tx.nodes.wrap({ type: 'link', children: [] }, { voids: true });
    });

    assert.equal(wrapped, false);
    assert.deepEqual(editorGetSnapshot(editor).children, before);
  });

  it('wrapNodes with split wraps text inside an inline that can hold the wrapper', () => {
    const editor = createEditor();

    editor.install(
      defineTestSchema('wrap-inside-open-inline', {
        link: { inline: true },
        span: {
          content: schema.content.any([
            schema.content.text(),
            schema.content.group('inline'),
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
            { type: 'span', children: [{ text: 'abc' }] },
            { text: '' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 1, 0], offset: 1 },
        focus: { path: [0, 1, 0], offset: 2 },
      },
    });
    let wrapped: boolean | undefined;

    editor.update((tx) => {
      wrapped = tx.nodes.wrap({ type: 'link', children: [] }, { split: true });
    });

    assert.equal(wrapped, true);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'block',
        children: [
          { text: '' },
          {
            type: 'span',
            children: [
              { text: 'a' },
              { type: 'link', children: [{ text: 'b' }] },
              { text: 'c' },
            ],
          },
          { text: '' },
        ],
      },
    ]);
  });

  it('wrapNodes with split leaves a read-only inline at the range end whole', () => {
    const editor = createEditor();

    editor.install(
      defineTestSchema('wrap-read-only-end', {
        badge: { inline: true, readOnly: true },
        span: {
          content: schema.content.any([
            schema.content.text(),
            schema.content.group('inline'),
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
            { text: 'a' },
            { type: 'badge', children: [{ text: 'b' }] },
            { text: '.' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 2], offset: 0 },
      },
    });

    editor.update((tx) => {
      tx.nodes.wrap({ type: 'span', children: [] }, { split: true });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'block',
        children: [
          { text: '' },
          { type: 'span', children: [{ text: 'a' }] },
          { text: '' },
          { type: 'badge', children: [{ text: 'b' }] },
          { text: '.' },
        ],
      },
    ]);
  });

  it('wrapNodes with split and a text match wraps text that only touches a link', () => {
    const editor = createEditor();

    editor.install(
      defineTestSchema('wrap-match-beside-link', { link: { inline: true } })
    );
    editorReplace(editor, {
      children: [
        {
          type: 'block',
          children: [
            { text: 'a' },
            { type: 'link', children: [{ text: 'b' }] },
            { text: '.' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 0 },
      },
    });
    let wrapped: boolean | undefined;

    editor.update((tx) => {
      wrapped = tx.nodes.wrap(
        { type: 'link', children: [] },
        { match: NodeApi.isText, split: true }
      );
    });

    assert.equal(wrapped, true);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'block',
        children: [
          { text: '' },
          { type: 'link', children: [{ text: 'a' }] },
          { text: '' },
          { type: 'link', children: [{ text: 'b' }] },
          { text: '.' },
        ],
      },
    ]);
  });

  it('wrapNodes in all mode refuses a wrapper that cannot hold an inline it matched', () => {
    const editor = createEditor();

    editor.install(
      defineTestSchema('wrap-all-mode-nested', {
        link: { inline: true },
        span: {
          content: schema.content.any([
            schema.content.text(),
            schema.content.group('inline'),
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
            { type: 'span', children: [{ text: 'abc' }] },
            { text: '' },
          ],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 1, 0], offset: 1 },
        focus: { path: [0, 1, 0], offset: 2 },
      },
    });
    const before = editorGetSnapshot(editor).children;
    let wrapped: boolean | undefined;

    editor.update((tx) => {
      wrapped = tx.nodes.wrap({ type: 'link', children: [] }, { mode: 'all' });
    });

    assert.equal(wrapped, false);
    assert.deepEqual(editorGetSnapshot(editor).children, before);
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

  for (const direction of ['forward', 'backward'] as const) {
    it(`liftNodes preserves ${direction} range direction through structural mapping`, () => {
      const start = { path: [0, 0, 0], offset: 1 };
      const end = { path: [0, 1, 0], offset: 2 };
      const editor = createEditor({
        initialSelection: {
          kind: 'text' as const,
          anchor: direction === 'forward' ? start : end,
          focus: direction === 'forward' ? end : start,
        },
        initialValue: [
          {
            type: 'quote',
            children: [paragraph('one'), paragraph('two')],
          },
        ],
      });

      editor.update.nodes.lift();

      const mappedStart = { path: [0, 0], offset: 1 };
      const mappedEnd = { path: [1, 0], offset: 2 };

      assert.deepEqual(editor.read.children(), [
        paragraph('one'),
        paragraph('two'),
      ]);
      assert.deepEqual(editor.read.runtime.snapshot().selection, {
        kind: 'text',
        anchor: direction === 'forward' ? mappedStart : mappedEnd,
        focus: direction === 'forward' ? mappedEnd : mappedStart,
      });
    });

    it(`unwrapNodes preserves ${direction} range direction through structural mapping`, () => {
      const start = { path: [0, 0, 0], offset: 1 };
      const end = { path: [0, 1, 0], offset: 2 };
      const editor = createEditor({
        initialSelection: {
          kind: 'text' as const,
          anchor: direction === 'forward' ? start : end,
          focus: direction === 'forward' ? end : start,
        },
        initialValue: [
          {
            type: 'quote',
            children: [paragraph('one'), paragraph('two')],
          },
        ],
      });

      editor.update.nodes.unwrap();

      const mappedStart = { path: [0, 0], offset: 1 };
      const mappedEnd = { path: [1, 0], offset: 2 };

      assert.deepEqual(editor.read.children(), [
        paragraph('one'),
        paragraph('two'),
      ]);
      assert.deepEqual(editor.read.runtime.snapshot().selection, {
        kind: 'text',
        anchor: direction === 'forward' ? mappedStart : mappedEnd,
        focus: direction === 'forward' ? mappedEnd : mappedStart,
      });
    });
  }

  for (const operation of ['lift', 'unwrap'] as const) {
    it(`${operation}Nodes preserves backward selection and undo in a named root`, () => {
      const editor = createEditor({
        initialValue: {
          children: [paragraph('body')],
          roots: {
            header: [
              {
                type: 'quote',
                children: [paragraph('one'), paragraph('two')],
              },
            ],
          },
        },
        plugins: [history()],
      });
      const header = createEditorView(editor, { root: 'header' });
      const selection = {
        kind: 'text' as const,
        anchor: { path: [0, 1, 0], offset: 2 },
        focus: { path: [0, 0, 0], offset: 1 },
      };

      header.update.selection.set(selection);
      if (operation === 'lift') {
        header.update.nodes.lift();
      } else {
        header.update.nodes.unwrap();
      }

      assert.deepEqual(editor.read.children(), [paragraph('body')]);
      assert.deepEqual(header.read.children(), [
        paragraph('one'),
        paragraph('two'),
      ]);
      assert.deepEqual(header.read.selection(), {
        anchor: { path: [1, 0], offset: 2, root: 'header' },
        focus: { path: [0, 0], offset: 1, root: 'header' },
      });

      editor.api.history.undo();

      assert.deepEqual(header.read.children(), [
        {
          type: 'quote',
          children: [paragraph('one'), paragraph('two')],
        },
      ]);
      assert.deepEqual(header.read.selection(), {
        anchor: { ...selection.anchor, root: 'header' },
        focus: { ...selection.focus, root: 'header' },
      });
    });
  }

  it('liftNodes refuses lifting a required leading slot child', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:lift-required-leading-slot', {
          elements: {
            box: {
              content: schema.content.prefix(
                [{ element: 'heading' }],
                schema.content.types(['paragraph'])
              ),
            },
            heading: { content: schema.content.text() },
            paragraph: { content: schema.content.text() },
          },
          root: schema.content.types(['box'], { min: 1 }),
        }),
      ],
      initialValue: [
        {
          type: 'box',
          children: [
            { type: 'heading', children: [{ text: 'Title' }] },
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ],
        },
      ],
    });

    editor.update((tx) => {
      tx.nodes.lift({ at: [0, 0] });
    });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'box',
        children: [
          { type: 'heading', children: [{ text: 'Title' }] },
          { type: 'paragraph', children: [{ text: 'Body' }] },
        ],
      },
    ]);
  });

  it('liftNodes leaves the parent unsplit when the grandparent refuses a middle child', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:lift-refused-middle-child', {
          elements: {
            box: { content: schema.content.types(['heading', 'paragraph']) },
            heading: { content: schema.content.text() },
            paragraph: { content: schema.content.text() },
          },
          root: schema.content.types(['box', 'paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
      ],
      initialValue: [
        {
          type: 'box',
          children: [
            { type: 'paragraph', children: [{ text: 'Before' }] },
            { type: 'heading', children: [{ text: 'Middle' }] },
            { type: 'paragraph', children: [{ text: 'After' }] },
          ],
        },
      ],
    });

    editor.update((tx) => {
      tx.nodes.lift({ at: [0, 1] });
    });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'box',
        children: [
          { type: 'paragraph', children: [{ text: 'Before' }] },
          { type: 'heading', children: [{ text: 'Middle' }] },
          { type: 'paragraph', children: [{ text: 'After' }] },
        ],
      },
    ]);
  });

  it('liftNodes preserves a collapsed selection through structural mapping', () => {
    const editor = createEditor({
      initialSelection: collapsedSelection([0, 0, 0], 2),
      initialValue: [
        {
          type: 'quote',
          children: [paragraph('one'), paragraph('two')],
        },
      ],
    });

    editor.update.nodes.lift();

    assert.deepEqual(
      editor.read.runtime.snapshot().selection,
      collapsedSelection([0, 0], 2)
    );
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

describe('blocks built for a required position', () => {
  const CardSchema = defineEditorSchema('schema:card-required-caption', {
    elements: {
      blockquote: {
        content: schema.content.types(['paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      caption: { content: schema.content.text({ default: 'text', min: 1 }) },
      card: {
        content: schema.content.prefix(
          [{ element: 'caption' }],
          schema.content.types(['paragraph', 'blockquote', 'divider'], {
            default: { type: 'paragraph' },
          })
        ),
      },
      divider: { void: 'block' },
      heading: {
        content: schema.content.text({ default: 'text', min: 1 }),
        properties: { level: property.number() },
      },
      paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
    },
    root: schema.content.types(['card', 'paragraph', 'divider'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
  });
  const caption = (text: string): Element => ({
    children: [{ text }],
    type: 'caption',
  });
  const card = (...children: Element[]): Element => ({
    children,
    type: 'card',
  });
  const divider: Element = { children: [{ text: '' }], type: 'divider' };
  const create = () =>
    createEditor({
      plugins: [CardSchema],
      initialValue: [card(caption('Title'), paragraph('Body'))],
    });
  const textRange = (from: number, to: number) => ({
    kind: 'text' as const,
    anchor: { path: [0, 0, 0], offset: from },
    focus: { path: [0, 0, 0], offset: to },
  });

  it('gives the tail of a split caption the body type', () => {
    for (const [from, to, expected] of [
      [2, 2, [caption('Ti'), paragraph('tle')]],
      [5, 5, [caption('Title'), paragraph('')]],
      [1, 3, [caption('T'), paragraph('le')]],
    ] as const) {
      const editor = create();

      editor.update((tx) => {
        tx.selection.set(textRange(from, to));
        tx.break.insert();
      });

      assert.deepEqual(editor.read.children(), [
        card(...expected, paragraph('Body')),
      ]);
    }
  });

  it('gives the tail of a split root title the next slot type', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:root-required-title', {
          elements: {
            paragraph: {
              content: schema.content.text({ default: 'text', min: 1 }),
            },
            title: {
              content: schema.content.text({ default: 'text', min: 1 }),
            },
          },
          root: schema.content.prefix(
            [{ element: 'title' }, { element: 'paragraph' }],
            schema.content.group('block')
          ),
          unknown: 'reject',
        }),
      ],
      initialValue: [
        { children: [{ text: 'Title' }], type: 'title' },
        paragraph('Body'),
      ],
    });

    editor.update((tx) => {
      tx.selection.set(collapsedSelection([0, 0], 2));
      tx.break.insert();
    });

    assert.deepEqual(editor.read.children(), [
      { children: [{ text: 'Ti' }], type: 'title' },
      paragraph('tle'),
      paragraph('Body'),
    ]);
  });

  it('duplicates a picked caption as body blocks', () => {
    for (const [paths, expected] of [
      [[[0, 0]], [caption('Title'), paragraph('Title'), paragraph('Body')]],
      [
        [
          [0, 0],
          [0, 1],
        ],
        [
          caption('Title'),
          paragraph('Body'),
          paragraph('Title'),
          paragraph('Body'),
        ],
      ],
    ] as const) {
      const editor = create();

      editor.update((tx) => {
        tx.blocks.duplicate({
          at: SelectionApi.nodes(paths as unknown as [Path], { mode: 'block' }),
        });
      });

      assert.deepEqual(editor.read.children(), [card(...expected)]);
    }
  });

  it('splits a caption around a void inserted at its caret', () => {
    const editor = create();

    editor.update((tx) => {
      tx.selection.set(textRange(2, 2));
      tx.nodes.insert(divider);
    });

    assert.deepEqual(editor.read.children(), [
      card(caption('Ti'), divider, paragraph('tle'), paragraph('Body')),
    ]);
  });

  it('refuses formatting that splits off the end of a caption', () => {
    const editor = create();

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.selection.set(textRange(2, 5));
          tx.nodes.set({ type: 'paragraph' }, { split: true });
        }),
      /cannot contain "caption"/
    );
    assert.deepEqual(editor.read.children(), [
      card(caption('Title'), paragraph('Body')),
    ]);
  });

  it('refuses formatting that splits off the start or middle of a caption', () => {
    for (const change of [
      (tx: Parameters<Parameters<Editor['update']>[0]>[0]) =>
        tx.nodes.set({ type: 'paragraph' }, { split: true }),
      (tx: Parameters<Parameters<Editor['update']>[0]>[0]) =>
        tx.nodes.wrap({ children: [], type: 'blockquote' }, { split: true }),
    ]) {
      const editor = create();
      const before = editor.read.children();

      assert.throws(
        () =>
          editor.update((tx) => {
            tx.selection.set(textRange(1, 3));
            change(tx);
          }),
        /cannot contain "caption"/
      );
      assert.deepEqual(editor.read.children(), before);
    }
  });

  it('keeps each lower level whole when a split goes up through a card', () => {
    for (const change of [
      (tx: Parameters<Parameters<Editor['update']>[0]>[0]) =>
        tx.nodes.split({ type: 'card' }),
      (tx: Parameters<Parameters<Editor['update']>[0]>[0]) =>
        tx.nodes.insert(divider, { mode: 'highest' }),
    ]) {
      const editor = create();

      editor.update((tx) => {
        tx.selection.set(textRange(2, 2));
        change(tx);
      });

      assert.deepEqual(
        editor.read.children().filter((node) => node.type === 'card'),
        [card(caption('Ti')), card(caption('tle'), paragraph('Body'))]
      );
    }
  });

  it('inserts a block mid-caption when the split names the caption type', () => {
    const editor = create();

    editor.update((tx) => {
      tx.nodes.insert(divider, {
        at: { offset: 2, path: [0, 0, 0] },
        split: { type: 'caption' },
      });
    });

    assert.deepEqual(editor.read.children(), [
      card(caption('Ti'), divider, paragraph('tle'), paragraph('Body')),
    ]);
  });

  it('keeps a preserved caption property over the body default', () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:card-caption-tone', {
          ...CardSchema.schema,
          properties: [
            schema.elementProperty(
              'tone',
              property.string({ default: 'plain' }),
              {
                split: 'preserve',
                target: schemaTarget.types(['caption', 'paragraph']),
                typeChange: 'preserve-if-allowed',
              }
            ),
          ],
        }),
      ],
      initialValue: [
        card(
          { ...caption('Title'), tone: 'loud' },
          { ...paragraph('Body'), tone: 'plain' }
        ),
      ],
    });

    editor.update((tx) => {
      tx.selection.set(textRange(2, 2));
      tx.break.insert();
    });

    assert.deepEqual(editor.read.children(), [
      card(
        { ...caption('Ti'), tone: 'loud' },
        { ...paragraph('tle'), tone: 'loud' },
        { ...paragraph('Body'), tone: 'plain' }
      ),
    ]);
  });

  it("keeps a required slot's fixed property and the other preserved ones", () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:card-required-tone', {
          ...CardSchema.schema,
          elements: {
            ...CardSchema.schema.elements,
            card: {
              content: schema.content.prefix(
                [
                  { element: 'caption' },
                  { element: 'paragraph', properties: { tone: 'plain' } },
                ],
                schema.content.types(['paragraph'], {
                  default: { type: 'paragraph' },
                })
              ),
            },
          },
          properties: [
            schema.elementProperty(
              'align',
              property.string({ default: 'left' }),
              {
                split: 'preserve',
                target: schemaTarget.types(['caption', 'paragraph']),
                typeChange: 'preserve-if-allowed',
              }
            ),
            schema.elementProperty(
              'tone',
              property.string({ default: 'plain' }),
              {
                split: 'preserve',
                target: schemaTarget.types(['caption', 'paragraph']),
                typeChange: 'preserve-if-allowed',
              }
            ),
          ],
        }),
      ],
      initialValue: [
        card(
          { ...caption('Title'), align: 'center', tone: 'loud' },
          { ...paragraph('Body'), align: 'left', tone: 'plain' }
        ),
      ],
    });

    editor.update((tx) => {
      tx.selection.set(textRange(2, 2));
      tx.break.insert();
    });

    assert.deepEqual(editor.read.children(), [
      card(
        { ...caption('Ti'), align: 'center', tone: 'loud' },
        { ...paragraph('tle'), align: 'center', tone: 'plain' },
        { ...paragraph('Body'), align: 'left', tone: 'plain' }
      ),
    ]);
  });

  it("keeps a required slot's fixed property when its default is omitted", () => {
    const editor = createEditor({
      plugins: [
        defineEditorSchema('schema:card-required-omitted-tone', {
          ...CardSchema.schema,
          elements: {
            ...CardSchema.schema.elements,
            card: {
              content: schema.content.prefix(
                [
                  { element: 'caption' },
                  { element: 'paragraph', properties: { tone: 'plain' } },
                ],
                schema.content.types(['paragraph'], {
                  default: { type: 'paragraph' },
                })
              ),
            },
          },
          properties: [
            schema.elementProperty(
              'tone',
              property.string({ default: 'plain', omitDefault: true }),
              {
                split: 'preserve',
                target: schemaTarget.types(['caption', 'paragraph']),
                typeChange: 'preserve-if-allowed',
              }
            ),
          ],
        }),
      ],
      initialValue: [
        card({ ...caption('Title'), tone: 'loud' }, paragraph('Body')),
      ],
    });

    editor.update((tx) => {
      tx.selection.set(textRange(2, 2));
      tx.break.insert();
    });

    assert.deepEqual(editor.read.children(), [
      card(
        { ...caption('Ti'), tone: 'loud' },
        paragraph('tle'),
        paragraph('Body')
      ),
    ]);
  });
});
