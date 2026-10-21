import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineCommand,
  defineEditorSchema,
  definePlugin,
  DocumentChange,
  editorCommands,
  type Element,
  type EditorViewOptions,
  locateAt,
  type NodeTarget,
  type PluginReference,
  type Point,
  property,
  RangeApi,
  schema,
  SelectionApi,
  target,
  txLocate,
} from 'plitejs';
import { history } from 'plitejs/history';
import {
  dispatchCommand,
  evaluateCommand,
  getCaretOwner,
  getViewPresentation,
  retainViewPresentation,
  withMountedPresentation,
} from 'plitejs/internal';

import { createAuthoredPlugin } from '../../src/authored/authored';
import { applyTransactionSpec } from '../../src/core/public-state';
import {
  getPlacementGeneration,
  resolveParkedCaret,
  setSelectionAsView,
} from '../../src/core/view-carets';
import type { AnyEditor } from '../../src/interfaces/editor';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const point = (offset: number, path = [0, 0]): Point => ({ offset, path });

const releases: Array<() => void> = [];
const names = new Map<unknown, string>();

afterEach(() => {
  for (const release of releases.splice(0)) release();
  names.clear();
});

const retained = <TView extends AnyEditor>(name: string, view: TView) => {
  names.set(getViewPresentation(view), name);
  releases.push(retainViewPresentation(view));

  return view;
};

const createViews = (
  plugins: readonly unknown[] = [],
  options: EditorViewOptions = {}
) => {
  const editor = createEditor({
    initialValue: {
      children: [paragraph('abcdefghij'), paragraph('second')],
      roots: { header: [paragraph('header')], note: [paragraph('note text')] },
    },
    plugins: plugins as never,
  });

  return {
    a: retained('A', createEditorView(editor, options)),
    b: retained('B', createEditorView(editor)),
    editor,
  };
};

const owner = (editor: AnyEditor) => {
  const current = getCaretOwner(editor);

  return (
    current && `${names.get(current.presentation)}:${current.root ?? 'main'}`
  );
};

const parked = (view: AnyEditor) => {
  const selection = resolveParkedCaret(view);

  return SelectionApi.isText(selection) && RangeApi.isCollapsed(selection)
    ? [...selection.anchor.path, selection.anchor.offset].join('.')
    : selection;
};

const live = (editor: AnyEditor) => {
  const selection = editor.read.selection();

  return RangeApi.isRange(selection)
    ? [...selection.anchor.path, selection.anchor.offset].join('.')
    : selection;
};

const place = (view: AnyEditor, at: Point) =>
  view.update((tx) => {
    tx.selection.set(at);
  });

const blocks = schema.content.types(['paragraph'], {
  default: { type: 'paragraph' },
  min: 1,
});

const Blocks = defineEditorSchema('view-carets-blocks', {
  elements: { paragraph: schema.element.textBlock() },
  id: 'view-carets-blocks',
  root: blocks,
  unknown: 'reject',
  version: 1,
});

const NotedBlocks = defineEditorSchema('view-carets-noted-blocks', {
  elements: { paragraph: schema.element.textBlock() },
  id: 'view-carets-noted-blocks',
  root: blocks,
  roots: { note: blocks },
  unknown: 'reject',
  version: 1,
});

const authored = (
  intent: 'edit' | 'propose',
  blockSchema = Blocks
): PluginReference[] => {
  let count = 0;

  return [
    blockSchema,
    createAuthoredPlugin({
      authorId: 'bob',
      createChangeId: () => `bob:${(count += 1)}`,
      intent,
      now: () => 10,
    }),
  ];
};

const createPair = (
  children: Element[],
  plugins: readonly PluginReference[] = []
) => {
  const editor = createEditor({ initialValue: children, plugins });

  return {
    a: retained('A', createEditorView(editor)),
    b: retained('B', createEditorView(editor)),
    editor,
  };
};

const struck = (change: string, kind: 'delete' | 'insert', at: number) => ({
  at,
  author: 'carol',
  change,
  kind,
});

// Stored "Keep oldnew text" holds carol's pending deletion of "old" and
// insertion of "new", so a command frame's projection differs from it.
const reviewed = (): Element[] => [
  {
    type: 'paragraph',
    children: [
      { text: 'Keep ' },
      { authored: [struck('carol:1', 'delete', 1)], text: 'old' },
      { authored: [struck('carol:2', 'insert', 2)], text: 'new' },
      { text: ' text' },
    ],
  },
  paragraph('second'),
];

const moveFirstAndInsert = (text: string) =>
  defineCommand(`view-carets.move-first-and-insert-${text}`, {
    build: ({ state }) =>
      state.transaction((tx) => {
        tx.nodes.move({ at: [0], to: [1] });
        tx.text.insert(text, { at: point(0, [1, 0]) });
      }),
  });

// A command runs on the accept-all line, where the word "text" starts in the
// stored " text" leaf, one character before a caret at its offset 2.
const acceptedLine = 'Keep new text';
const beforeText = point(acceptedLine.indexOf('text'));

const insertBeforeAndPlace = defineCommand('view-carets.insert-and-place', {
  build: ({ state }) =>
    state.transaction((tx) => {
      tx.text.insert('XY', { at: beforeText });
      tx.selection.set(point(3));
    }),
});

const insertBefore = defineCommand('view-carets.insert-before', {
  build: ({ state }) =>
    state.transaction((tx) => {
      tx.text.insert('XY', { at: beforeText });
    }),
});

const movedAndEditedChange = (first: string, inserted: string) => {
  const twin = createEditor({
    initialValue: [paragraph(first), paragraph('second')],
  });

  twin.update((tx) => {
    tx.nodes.move({ at: [0], to: [1] });
    tx.text.insert(inserted, { at: point(0, [1, 0]) });
  });

  return twin.read.lastCommit()!.changes;
};

describe('caret owner', () => {
  it('lets views no root retains never take the caret', () => {
    const editor = createEditor({ initialValue: [paragraph('abcdefghij')] });
    const a = createEditorView(editor);
    const b = createEditorView(editor);

    place(a, point(1));
    place(b, point(8));

    assert.deepEqual(
      [getCaretOwner(editor), resolveParkedCaret(a)],
      [null, null]
    );
  });

  it('restores a parked caret to the nearest point when its block is deleted (R2)', () => {
    const { a, b, editor } = createViews();

    place(a, point(3, [1, 0]));
    place(b, point(1));
    b.update((tx) => tx.nodes.remove({ at: [1] }));

    assert.deepEqual(parked(a), '0.0.10');
    assert.equal(owner(editor), 'B:main');
  });
});

describe('placement credit (R3)', () => {
  it('keeps the owner when a view inserts at an explicit spot before both carets', () => {
    const { a, b, editor } = createViews();

    place(a, point(1));
    place(b, point(8));
    a.update((tx) =>
      tx.command(editorCommands.insertText, {
        options: { at: point(0) },
        text: 'X',
      })
    );

    assert.deepEqual(
      [owner(editor), live(editor), parked(a)],
      ['B:main', '0.0.9', '0.0.2']
    );
  });

  it('keeps the owner when the command continues through next.after', () => {
    const Prefixed = definePlugin('prefixed', {
      commands: ({ around }) => [
        around(editorCommands.insertText, ({ next, state }) =>
          next.after(
            state.transaction((tx) => {
              tx.tags.add('prefix');
            })
          )
        ),
      ],
    });
    const { a, b, editor } = createViews([Prefixed]);

    place(a, point(1));
    place(b, point(8));
    a.update((tx) =>
      tx.command(editorCommands.insertText, {
        options: { at: point(0) },
        text: 'X',
      })
    );

    assert.deepEqual(
      [owner(editor), live(editor), parked(a)],
      ['B:main', '0.0.9', '0.0.2']
    );
  });

  it('keeps the owner when a view removes, lifts or unwraps nodes around the live caret', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('abcdefghij'),
        { type: 'quote', children: [paragraph('lift me')] },
        { type: 'quote', children: [paragraph('unwrap me')] },
        paragraph('remove me'),
      ],
    });
    const a = retained('A', createEditorView(editor));
    const b = retained('B', createEditorView(editor));

    place(b, point(8));
    a.update((tx) => {
      tx.nodes.lift({ at: [1, 0] });
      tx.nodes.unwrap({ at: [2] });
    });
    a.update((tx) => tx.nodes.remove());

    assert.equal(owner(editor), 'B:main');
  });

  it('credits a placement through a routed call into another root to the calling view', () => {
    const Note = definePlugin('note-caret', {
      update: ({ tx }) => ({
        place: txLocate(locateAt(0), (options: { at: NodeTarget }) => {
          tx.command(editorCommands.select, {
            target: { anchor: point(2), focus: point(2), kind: 'text' },
          });

          return options;
        }),
      }),
    });
    const editor = createEditor({
      initialValue: {
        children: [paragraph('abcdefghij')],
        roots: { note: [paragraph('note text')] },
      },
      plugins: [Note],
    });
    const a = retained('A', createEditorView(editor));
    const b = retained('B', createEditorView(editor));
    const noteKey = editor.key(editor.read.root('note')[0]);

    place(a, point(1));
    place(b, point(8));
    a.update['note-caret'].place({ at: noteKey });

    assert.deepEqual(
      [owner(editor), parked(a), parked(b)],
      ['A:note', '0.0.1', '0.0.8']
    );
  });
});

describe('placement at the live spot and discarded placements (R4)', () => {
  it('moves the owner on a placement at the caret it already shows', () => {
    const { a, b, editor } = createViews();

    place(a, point(1));
    place(b, point(5));
    const generation = getPlacementGeneration(editor);
    place(a, point(5));
    const placedAgain = getPlacementGeneration(editor) > generation;
    place(b, point(7));

    assert.deepEqual(
      [placedAgain, owner(editor), parked(a)],
      [true, 'B:main', '0.0.5']
    );
  });

  it('leaves the owner alone after a throwing update or a discarded probe', () => {
    const { a, b, editor } = createViews();

    place(a, point(1));
    place(b, point(5));
    assert.throws(() =>
      a.update((tx) => {
        tx.selection.set(point(2));
        throw new Error('stop');
      })
    );
    evaluateCommand(a, editorCommands.select, {
      target: { anchor: point(3), focus: point(3), kind: 'text' },
    });

    assert.deepEqual([owner(editor), parked(a)], ['B:main', '0.0.1']);
  });

  it('keeps the caret and the bookmarks where they were after an update that places and then throws', () => {
    const { a, b, editor } = createViews();
    const c = retained('C', createEditorView(editor));

    place(a, point(1));
    place(b, point(5));
    assert.throws(() =>
      c.update((tx) => {
        tx.text.insert('XY', { at: point(0) });
        tx.selection.set(point(9));
        throw new Error('stop');
      })
    );

    assert.deepEqual(
      [owner(editor), live(editor), parked(a), parked(b), parked(c)],
      ['B:main', '0.0.5', '0.0.1', null, null]
    );
  });

  it('commits a placement at the live caret and restores the caret it took', () => {
    const { a, b, editor } = createViews();

    place(b, point(4));
    place(a, point(4));
    const reactivated = [owner(editor), parked(b)];
    place(a, point(7));

    assert.deepEqual(
      [reactivated, owner(editor), parked(b)],
      [['A:main', '0.0.4'], 'A:main', '0.0.4']
    );
  });

  it('makes a spec built before a placement at the live caret stale', () => {
    const { a, b, editor } = createViews();

    place(b, point(4));
    const spec = editor.read((state) =>
      state.transaction((tx) => {
        tx.text.insert('!', { at: point(0) });
      })
    );

    place(a, point(4));

    assert.throws(
      () => editor.update(() => applyTransactionSpec(editor, spec)),
      /stale transaction spec/
    );
  });

  it('makes a framed spec evaluated before another view places stale', () => {
    const { a, b, editor } = createPair(reviewed(), authored('edit'));

    place(a, point(2, [0, 3]));
    const { result } = evaluateCommand(a, insertBeforeAndPlace);

    assert.ok(result);
    place(b, point(1, [1, 0]));

    assert.throws(
      () => editor.update(() => applyTransactionSpec(editor, result)),
      /stale framed spec/
    );
  });

  it('credits a selecting replacement to the view that runs it, not the base editor', () => {
    const { a, b, editor } = createViews();
    const observed: Array<string | null> = [];

    place(b, point(5));
    editor.update((tx) =>
      tx.nodes.replace(paragraph('base'), { at: [1], select: true })
    );
    observed.push(owner(editor));
    a.update((tx) =>
      tx.nodes.replace(paragraph('view'), { at: [1], select: true })
    );
    observed.push(owner(editor));
    place(b, point(5));
    editor.update((tx) =>
      tx.value.replace({
        children: [paragraph('abcdefghij')],
        selection: { anchor: point(2), focus: point(2), kind: 'text' },
      })
    );
    observed.push(owner(editor));
    a.update((tx) =>
      tx.value.replace({
        children: [paragraph('abcdefghij')],
        selection: { anchor: point(3), focus: point(3), kind: 'text' },
      })
    );
    observed.push(owner(editor));

    assert.deepEqual(observed, ['B:main', 'A:main', 'B:main', 'A:main']);
  });

  it('parks the owner when a value replacement clears the selection', () => {
    const { a, b, editor } = createViews();

    place(a, point(3));
    a.update((tx) =>
      tx.value.replace({ children: tx.children(), selection: null })
    );
    place(b, point(8));

    assert.deepEqual([owner(editor), parked(a)], ['B:main', '0.0.3']);
  });

  it('parks the owner when a value replacement without a selection clears it', () => {
    const { a, b, editor } = createViews();

    place(a, point(3));
    a.update((tx) => tx.value.replace({ children: tx.children() }));
    place(b, point(8));

    assert.deepEqual([owner(editor), parked(a)], ['B:main', '0.0.3']);
  });
});

describe('parking inside the commit (R5)', () => {
  it('maps a parked caret through a commit a plugin listener makes in answer', () => {
    let answer = (): void => {};
    const Answer = definePlugin('answer', {
      on: {
        commit() {
          const run = answer;

          answer = () => {};
          run();
        },
      },
    });
    const { a, b, editor } = createViews([Answer]);

    place(a, point(4));
    answer = () =>
      editor.update((tx) => tx.text.insert('XY', { at: point(0) }));
    place(b, point(8));

    assert.equal(parked(a), '0.0.6');
  });

  const moveFirstBlockThenPlace = (view: AnyEditor) =>
    view.update((tx) => {
      tx.nodes.move({ at: [0], to: [1] });
      tx.selection.set(point(2));
    });

  it('follows a block the parking update moves', () => {
    const { a, b } = createViews();

    place(a, point(3));
    moveFirstBlockThenPlace(b);

    assert.equal(parked(a), '1.0.3');
  });

  it('follows a selected block the parking update moves', () => {
    const { a, b } = createViews();

    a.update((tx) =>
      tx.selection.set(SelectionApi.nodes([[0]], { mode: 'block' }))
    );
    moveFirstBlockThenPlace(b);

    assert.deepEqual(
      resolveParkedCaret(a),
      SelectionApi.nodes([[1]], { mode: 'block' })
    );
  });
});

describe('bookmarks through one update that moves and edits their block', () => {
  it('follows a block the update that takes the caret moves and then edits', () => {
    const { a, b } = createViews();

    place(a, point(3));
    b.update((tx) => {
      tx.nodes.move({ at: [0], to: [1] });
      tx.text.insert('X', { at: point(0, [1, 0]) });
      tx.selection.set(point(2));
    });

    assert.equal(parked(a), '1.0.4');
  });

  it('follows a block the update moves and edits after it takes the caret', () => {
    const { a, b, editor } = createViews();

    place(a, point(3));
    b.update((tx) => {
      tx.selection.set(point(2, [1, 0]));
      tx.nodes.move({ at: [0], to: [1] });
      tx.text.insert('X', { at: point(0, [1, 0]) });
    });

    assert.deepEqual(
      [owner(editor), live(editor), parked(a)],
      ['B:main', '0.0.2', '1.0.4']
    );
  });

  for (const [name, plugins] of [
    ['a plain', []],
    ['an authored', authored('edit')],
  ] as const) {
    it(`keeps a bookmark for each view the caret passes through in one update of ${name} editor`, () => {
      const { a, b, editor } = createPair(
        [paragraph('abcdefghij'), paragraph('second')],
        plugins
      );
      const c = retained('C', createEditorView(editor));

      place(a, point(3));
      b.update((tx) => {
        tx.selection.set(point(2, [1, 0]));
        tx.nodes.move({ at: [0], to: [1] });
        tx.text.insert('X', { at: point(0, [1, 0]) });
        dispatchCommand(c, editorCommands.select, {
          target: {
            anchor: point(6, [1, 0]),
            focus: point(6, [1, 0]),
            kind: 'text',
          },
        });
      });

      assert.deepEqual(
        [owner(editor), live(editor), parked(a), parked(b)],
        ['C:main', '1.0.6', '1.0.4', '0.0.2']
      );
    });
  }

  for (const [through, plugins] of [
    ['a plain update', []],
    ['a command spec', []],
    ['an authored editor', authored('edit')],
  ] as const) {
    it(`lands where its text went when ${through} moves its block and inserts the repeated letter before it`, () => {
      const { a, b } = createPair(
        [paragraph('aaaa'), paragraph('second')],
        plugins
      );

      place(a, point(2));
      place(b, point(1, [1, 0]));
      b.update((tx) => {
        if (through === 'a command spec') {
          tx.command(moveFirstAndInsert('a'));
          return;
        }
        tx.nodes.move({ at: [0], to: [1] });
        tx.text.insert('a', { at: point(0, [1, 0]) });
      });

      assert.equal(parked(a), '1.0.3');
    });
  }
});

describe('bookmarks in authored editors', () => {
  it('lands where the live caret lands when another view proposes to delete text before it', () => {
    const remove = { anchor: point(2), focus: point(5), kind: 'text' } as const;
    const control = createEditor({
      initialValue: [paragraph('abcdefghij'), paragraph('second')],
      plugins: authored('propose'),
    });

    place(control, point(8));
    control.update((tx) => tx.text.delete({ at: remove }));

    const { a, b } = createPair(
      [paragraph('abcdefghij'), paragraph('second')],
      authored('propose')
    );

    place(a, point(8));
    place(b, point(1, [1, 0]));
    b.update((tx) => tx.text.delete({ at: remove }));

    assert.equal(parked(a), live(control));
  });

  it('lands where the live caret lands when a framed command edits before it across struck text', () => {
    const control = createEditor({
      initialValue: reviewed(),
      plugins: authored('edit'),
    });

    place(control, point(2, [0, 3]));
    control.update((tx) => tx.command(insertBefore));

    const { a, b } = createPair(reviewed(), authored('edit'));

    place(a, point(2, [0, 3]));
    place(b, point(1, [1, 0]));
    b.update((tx) => tx.command(insertBefore));

    assert.equal(parked(a), live(control));
  });

  it('moves a bookmark taken before a framed command that edits before it', () => {
    const control = createEditor({
      initialValue: reviewed(),
      plugins: authored('edit'),
    });

    place(control, point(2, [0, 3]));
    control.update((tx) => tx.command(insertBefore));

    const { a, b, editor } = createPair(reviewed(), authored('edit'));

    place(a, point(2, [0, 3]));
    b.update((tx) => {
      tx.selection.set(point(1, [1, 0]));
      tx.command(insertBefore);
    });

    assert.deepEqual([owner(editor), parked(a)], ['B:main', live(control)]);
  });

  it('moves a bookmark a framed command parks when it edits before it and places', () => {
    const control = createEditor({
      initialValue: reviewed(),
      plugins: authored('edit'),
    });

    place(control, point(2, [0, 3]));
    control.update((tx) => tx.command(insertBefore));

    const { a, b, editor } = createPair(reviewed(), authored('edit'));

    place(a, point(2, [0, 3]));
    b.update((tx) => tx.command(insertBeforeAndPlace));

    assert.deepEqual([owner(editor), parked(a)], ['B:main', live(control)]);
  });
});

describe('bookmarks through removal and conversion', () => {
  it('reactivates a removed block selection at its fallback point, not at the live caret', () => {
    const { a, b, editor } = createViews();

    a.update((tx) =>
      tx.selection.set(SelectionApi.nodes([[0]], { mode: 'block' }))
    );
    place(b, point(2, [1, 0]));
    b.update((tx) => tx.nodes.remove({ at: [0] }));

    assert.deepEqual([live(editor), parked(a)], ['0.0.2', '0.0.0']);
  });

  it("commits another view's conversion of a block whose parked caret carried pending marks", () => {
    const Marks = defineEditorSchema('view-carets-marks', {
      elements: {
        code: { content: schema.content.text({ default: 'text', min: 1 }) },
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      id: 'view-carets-marks',
      properties: [
        schema.textProperty('bold', property.boolean(), {
          target: target.type('paragraph'),
        }),
      ],
      root: schema.content.types(['paragraph', 'code'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const { a, b, editor } = createPair(
      [paragraph('abcdefghij'), paragraph('second')],
      [Marks]
    );

    place(a, point(3));
    a.update((tx) => tx.marks.set({ bold: true }));
    place(b, point(2, [1, 0]));
    b.update((tx) => tx.nodes.set({ type: 'code' }, { at: [0] }));

    assert.deepEqual(
      [editor.read.children()[0].type, parked(a)],
      ['code', '0.0.3']
    );
  });
});

describe('who a placement credits (R6)', () => {
  it('ignores a base placement made in a commit callback of a view update', () => {
    const { a, b, editor } = createViews();

    place(b, point(8));
    a.update((tx, context) => {
      tx.text.insert('X', { at: point(0) });
      context.afterCommit(() => place(editor, point(2)));
    });

    assert.equal(owner(editor), 'B:main');
  });

  it('ignores a placement through a view no root retains', () => {
    const { b, editor } = createViews();

    place(b, point(8));
    place(createEditorView(editor), point(2));

    assert.equal(owner(editor), 'B:main');
  });

  it('credits the view whose command places inside a base update', () => {
    const { a, b, editor } = createViews();

    place(b, point(8));
    editor.update(() => {
      dispatchCommand(a, editorCommands.select, {
        target: { anchor: point(2), focus: point(2), kind: 'text' },
      });
    });

    assert.equal(owner(editor), 'A:main');
  });

  it('credits the last view to place in one update', () => {
    const { a, b, editor } = createViews();

    a.update((tx) => {
      tx.selection.set(point(1));
      dispatchCommand(b, editorCommands.select, {
        target: { anchor: point(2), focus: point(2), kind: 'text' },
      });
    });

    assert.equal(owner(editor), 'B:main');
  });

  it('credits a read-only view that places through the base editor', () => {
    const { a, editor } = createViews();
    const reader = retained('R', createEditorView(editor, { readOnly: true }));

    place(a, point(1));
    setSelectionAsView(reader, point(6));

    assert.deepEqual([owner(editor), parked(a)], ['R:main', '0.0.1']);
  });
});

describe('block selections (R7)', () => {
  it('parks a backward block selection with both of its ends', () => {
    const { a, b } = createViews();
    const backward = SelectionApi.nodes([[0], [1]], {
      anchorPath: [1],
      focusPath: [0],
      mode: 'block',
    });

    a.update((tx) => tx.selection.set(backward));
    place(b, point(3));
    b.update((tx) => tx.nodes.insert(paragraph('before'), { at: [0] }));

    assert.deepEqual(
      resolveParkedCaret(a),
      SelectionApi.nodes([[1], [2]], {
        anchorPath: [2],
        focusPath: [1],
        mode: 'block',
      })
    );
  });
});

describe('remote edits and history (R11)', () => {
  const caretsThrough = (
    first: string,
    offset: number,
    change: DocumentChange
  ) => {
    const { a, b, editor } = createPair([
      paragraph(first),
      paragraph('second'),
    ]);

    place(a, point(offset));
    place(b, point(offset));
    editor.update((tx) => tx.changes.apply(change));

    return { bookmark: parked(a), live: live(editor) };
  };

  const replacedFirstParagraph = (first: string, inserted: string) =>
    DocumentChange.between(
      { children: [paragraph(first), paragraph('second')] },
      { children: [paragraph('second'), paragraph(inserted)] }
    );

  it('leaves the caret and a bookmark at the deletion site when another editor moves and edits their paragraph in one change', () => {
    assert.deepEqual(
      caretsThrough('abcdefghij', 3, movedAndEditedChange('abcdefghij', 'X')),
      { bookmark: '0.0.0', live: '0.0.0' }
    );
  });

  it('leaves the caret and a bookmark at the deletion site when the inserted paragraph only shares a first letter', () => {
    assert.deepEqual(
      caretsThrough('hello', 1, replacedFirstParagraph('hello', 'hi')),
      {
        bookmark: '0.0.0',
        live: '0.0.0',
      }
    );
  });

  it('leaves the caret and a bookmark at the deletion site when the inserted paragraph only shares a prefix', () => {
    assert.deepEqual(
      caretsThrough('apples', 1, replacedFirstParagraph('apples', 'approval')),
      { bookmark: '0.0.0', live: '0.0.0' }
    );
  });
});

describe('bookmarks through undo and redo', () => {
  const moveAndEditFirst = (view: AnyEditor) =>
    view.update((tx) => {
      tx.nodes.move({ at: [0], to: [1] });
      tx.text.insert('X', { at: point(0, [1, 0]) });
    });

  const skippedInsertAbove = (editor: AnyEditor, text: string) =>
    editor.update({ tags: ['history-skip'] }, (tx) =>
      tx.nodes.insert(paragraph(text), { at: [0] })
    );

  it('returns a bookmark into the paragraph another view deleted when that view undoes', () => {
    const { a, b } = createViews([history()]);

    place(a, point(3, [1, 0]));
    place(b, point(1));
    b.update((tx) => tx.nodes.remove({ at: [1] }));
    b.api.history.undo();

    assert.equal(parked(a), '1.0.3');
  });

  it('returns a bookmark into the deleted paragraph through a history-skipped insertion before the undo', () => {
    const { a, b, editor } = createViews([history()]);

    place(a, point(3, [1, 0]));
    place(b, point(1));
    b.update((tx) => tx.nodes.remove({ at: [1] }));
    skippedInsertAbove(editor, 'skipped');
    b.api.history.undo();

    assert.equal(parked(a), '2.0.3');
  });

  it('returns a bookmark another view moved and edited to its spot before the batch and back on redo', () => {
    const { a, b } = createViews([history()]);
    const observed: unknown[] = [];

    place(a, point(3));
    place(b, point(2, [1, 0]));
    moveAndEditFirst(b);
    observed.push(parked(a));
    b.api.history.undo();
    observed.push(parked(a));
    b.api.history.redo();
    observed.push(parked(a));

    assert.deepEqual(observed, ['1.0.4', '0.0.3', '1.0.4']);
  });

  it("returns a bookmark at the holder's spot with the holder's caret on undo and redo", () => {
    const { a, b, editor } = createViews([history()]);
    const observed: unknown[] = [];

    place(a, point(3));
    place(b, point(3));
    moveAndEditFirst(b);
    observed.push(live(editor), parked(a));
    b.api.history.undo();
    observed.push(live(editor), parked(a));
    b.api.history.redo();
    observed.push(live(editor), parked(a));

    assert.deepEqual(observed, [
      '1.0.4',
      '1.0.4',
      '0.0.3',
      '0.0.3',
      '1.0.4',
      '1.0.4',
    ]);
  });

  it('rebases the restored bookmarks through history-skipped changes before undo and before redo', () => {
    const { a, b, editor } = createViews([history()]);
    const observed: unknown[] = [];

    place(a, point(3));
    place(b, point(2, [1, 0]));
    moveAndEditFirst(b);
    skippedInsertAbove(editor, 'first skipped');
    b.api.history.undo();
    observed.push(parked(a));
    skippedInsertAbove(editor, 'second skipped');
    b.api.history.redo();
    observed.push(parked(a));

    assert.deepEqual(observed, ['1.0.3', '3.0.4']);
  });

  it('keeps a caret the parked view placed after the batch where it is on undo', () => {
    const { a, b } = createViews([history()]);

    place(a, point(3));
    place(b, point(2, [1, 0]));
    moveAndEditFirst(b);
    place(a, point(5));
    place(b, point(1, [1, 0]));
    b.api.history.undo();

    assert.equal(parked(a), '1.0.5');
  });

  it('maps the bookmark of a view mounted after the undo through the redo', () => {
    const { a, b, editor } = createViews([history()]);

    place(a, point(3));
    place(b, point(2, [1, 0]));
    moveAndEditFirst(b);
    b.api.history.undo();

    const c = retained('C', createEditorView(editor));

    place(c, point(6));
    place(b, point(1, [1, 0]));
    b.api.history.redo();

    assert.equal(parked(c), '0.0.0');
  });

  it('keeps a caret a view mounted and placed between two merged commits where it is on undo', () => {
    const { b, editor } = createViews([history()]);

    place(b, point(1));
    b.update((tx) => tx.text.insert('X'));

    const a = retained('A', createEditorView(editor));

    place(a, point(3, [1, 0]));
    place(b, point(2));
    b.update({ tags: ['history-merge'] }, (tx) => tx.text.insert('Y'));
    b.api.history.undo();

    assert.equal(parked(a), '1.0.3');
  });

  it('returns a bookmark both merged commits moved to its spot before the first on undo', () => {
    const { a, b } = createViews([history()]);

    place(a, point(3));
    place(b, point(1));
    b.update((tx) => tx.text.insert('X'));
    b.update({ tags: ['history-merge'] }, (tx) => tx.text.insert('Y'));
    b.api.history.undo();

    assert.equal(parked(a), '0.0.3');
  });

  it('maps a caret placed between two merged commits that both moved it through the undo', () => {
    const { a, b } = createViews([history()]);

    place(a, point(3));
    place(b, point(1));
    b.update((tx) => tx.text.insert('X'));
    place(a, point(8));
    place(b, point(2));
    b.update({ tags: ['history-merge'] }, (tx) => tx.text.insert('Y'));
    b.api.history.undo();

    assert.equal(parked(a), '0.0.7');
  });

  it('returns a bookmark both merged commits moved to its spot before the first when another view placed between them', () => {
    const { a, b } = createViews([history()]);

    place(a, point(3, [1, 0]));
    place(b, point(1));
    b.update((tx) => tx.nodes.remove({ at: [1] }));
    place(b, point(2));
    b.update({ tags: ['history-merge'] }, (tx) => tx.text.insert('Y'));
    b.api.history.undo();

    assert.equal(parked(a), '1.0.3');
  });
});

describe('selection writes inside another view update', () => {
  for (const [caller, options, plugins] of [
    ['a main view', {}, []],
    ['a read-only main view', { readOnly: true }, []],
    [
      'an authored main view',
      { authored: { intent: 'propose' } },
      authored('edit', NotedBlocks),
    ],
  ] as const) {
    it(`places through ${caller} in main inside a note view update`, () => {
      const editor = createEditor({
        initialValue: {
          children: [paragraph('abcdefghij')],
          roots: { note: [paragraph('note text')] },
        },
        plugins: plugins as never,
      });
      const aNote = retained('A', createEditorView(editor, { root: 'note' }));
      const b = retained(
        'B',
        createEditorView(editor, options as EditorViewOptions)
      );

      place(aNote, point(1));
      aNote.update(() => setSelectionAsView(b, point(2)));
      const selection = editor.read.selection();

      assert.deepEqual(
        [owner(editor), selection && (selection.anchor.root ?? 'main')],
        ['B:main', 'main']
      );
    });
  }
});

describe('repair writes', () => {
  it('keeps the owner when a view wraps or sets the block holding the live caret', () => {
    const editor = createEditor({
      initialValue: [paragraph('abcdefghij'), paragraph('second')],
    });
    const a = retained('A', createEditorView(editor));
    const b = retained('B', createEditorView(editor));

    place(b, point(8));
    a.update((tx) =>
      tx.nodes.wrap({ type: 'quote', children: [] }, { at: [0] })
    );
    a.update((tx) => tx.nodes.set({ checked: true } as never, { at: [0] }));

    assert.equal(owner(editor), 'B:main');
  });

  it('keeps the owner and places nothing when a view splits text across the live selection', () => {
    const editor = createEditor({
      initialValue: [paragraph('abcdefghij'), paragraph('second')],
    });
    const a = retained('A', createEditorView(editor));
    const b = retained('B', createEditorView(editor));

    b.update((tx) => {
      tx.selection.set({ anchor: point(2), focus: point(6) });
    });
    const generation = getPlacementGeneration(editor);
    a.update((tx) =>
      tx.nodes.set({ bold: true } as never, {
        match: (node) => 'text' in node,
        split: true,
      })
    );

    assert.deepEqual(
      [owner(editor), getPlacementGeneration(editor)],
      ['B:main', generation]
    );
  });
});

describe('base placement into another root (R31)', () => {
  it('parks the owner and leaves no owner', () => {
    const { a, b, editor } = createViews();
    const aHeader = withMountedPresentation(
      createEditorView(editor, { root: 'header' }),
      a
    );
    const bNote = withMountedPresentation(
      createEditorView(editor, { root: 'note' }),
      b
    );
    const observed: unknown[] = [];

    place(aHeader, point(3));
    editor.update((tx) => {
      tx.selection.set({ ...point(8), root: 'note' });
    });
    observed.push(owner(editor), parked(aHeader));
    place(bNote, point(2));
    observed.push(owner(editor), parked(aHeader));

    assert.deepEqual(observed, [null, '0.0.3', 'B:note', '0.0.3']);
  });

  it('drops the parked carets of the root it selects while no view owns the caret there', () => {
    const { a, b, editor } = createViews();

    place(a, point(1));
    place(b, point(8));
    place(editor, point(4));
    const keptWhileOwned = parked(a);
    editor.update((tx) => tx.selection.set(null));
    place(editor, point(6));

    assert.deepEqual(
      [keptWhileOwned, owner(editor), parked(a), parked(b)],
      ['0.0.1', null, null, null]
    );
  });
});
