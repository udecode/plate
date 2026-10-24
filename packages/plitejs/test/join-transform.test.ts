import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  type Descendant,
  type EditorUpdateTransaction,
  type Element,
  schema,
  SelectionApi,
} from '../src';
import { DocumentChange } from '../src/core/change/document-change';
import { DocumentIndex } from '../src/core/change/document-index';
import {
  insertNodeChange,
  insertTextChange,
  mergeNodeChange,
  removeNodeChange,
  removeTextChange,
  RootChange,
} from '../src/core/change/root-change';
import { PreparedTokenSlice } from '../src/core/change/tokens';
import { canonicalizeInlineChildren } from '../src/core/content-completion';
import { editorCommands } from '../src/core/editor-commands';
import { getEditorSchema } from '../src/core/editor-runtime';
import { readCoreWork } from '../src/core/work';
import { history } from '../src/history';
import { getDefined } from '../src/internal/get-defined';
import { createTestDocumentChange } from './support/document-change';
import { defineTestSchema } from './support/schema';

const JoinSchema = defineTestSchema('join-transform', {
  heading: {
    content: schema.content.any([
      schema.content.text(),
      schema.content.group('inline'),
    ]),
  },
  link: { inline: true },
  quote: { content: schema.content.types(['heading', 'paragraph']) },
  section: {
    content: schema.content.prefix(
      [{ element: 'heading' }],
      schema.content.types(['heading', 'paragraph'])
    ),
  },
});

const MixedSchema = defineTestSchema('join-transform-mixed', {
  heading: {},
  section: {
    content: schema.content.prefix(
      [{ element: 'heading' }],
      schema.content.text()
    ),
  },
});

// Frozen like the nodes an editor holds, which a change may insert as they are.
const t = (text: string, props: Record<string, unknown> = {}) =>
  Object.freeze({ text, ...props });
const element =
  (type: string) =>
  (...children: Descendant[]): Element =>
    Object.freeze({ children: Object.freeze(children), type });
const h = element('heading');
const mixed = element('section');
const p = element('paragraph');
const q = element('quote');
const link = element('link');
const section = element('section');
const bold = { bold: true };

type Build = (document: DocumentIndex) => RootChange;

const rootChange = (children: readonly Element[], build: Build) =>
  createTestDocumentChange({
    primary: build(DocumentIndex.fromValue(children)),
  });

// Each change is its own commit, so an editor that refuses a noncanonical
// change refuses a noncanonical rebase.
const throughEditor = (
  plugin: typeof JoinSchema,
  children: readonly Element[],
  ...changes: DocumentChange[]
) => {
  const editor = createEditor({
    initialValue: structuredClone(children),
    plugins: [plugin],
  });

  for (const change of changes) {
    editor.update((tx) => {
      tx.changes.apply(change);
    });
  }

  return editor.read.children();
};

const assertConverges = (
  children: readonly Element[],
  a: DocumentChange,
  b: DocumentChange,
  expected: readonly Element[],
  plugin = JoinSchema
) => {
  for (const [first, second, order] of [
    [a, b, 'a then b'],
    [b, a, 'b then a'],
  ] as const) {
    const transformed = DocumentChange.transform(first, second, { children });

    assert.deepEqual(
      throughEditor(plugin, children, first, transformed.b),
      expected,
      `${order}: the first change, then the second rebased over it`
    );
    assert.deepEqual(
      throughEditor(plugin, children, second, transformed.a),
      expected,
      `${order}: the second change, then the first rebased over it`
    );
  }
};

const assertBuilt = (
  children: readonly Element[],
  a: Build,
  b: Build,
  expected: readonly Element[],
  plugin = JoinSchema
) =>
  assertConverges(
    children,
    rootChange(children, a),
    rootChange(children, b),
    expected,
    plugin
  );

type Point = readonly [path: readonly number[], offset: number];

const positionOf = (document: DocumentIndex, [path, offset]: Point) =>
  document.nodeRange(path).from + 1 + offset;

const deletion =
  (from: Point, to: Point): Build =>
  (document) =>
    RootChange.create(document, {
      from: positionOf(document, from),
      to: positionOf(document, to),
    });

const join =
  (...ranges: Array<Readonly<{ from: number; to: number }>>): Build =>
  (document) =>
    RootChange.create(document, ranges);

const setProperties =
  (from: number, properties: Record<string, unknown>): Build =>
  (document) =>
    RootChange.create(document, { from, properties });

type Edit = (tx: EditorUpdateTransaction) => void;

const committed = (
  children: readonly Element[],
  selection: Parameters<typeof SelectionApi.text>[0] | null,
  edit: Edit
) => {
  const editor = createEditor({
    initialSelection: selection && SelectionApi.text(selection),
    initialValue: structuredClone(children),
    plugins: [JoinSchema],
  });

  editor.update(edit);

  return getDefined(editor.read.lastCommit()).changes;
};

const assertUndoOverJoin = (
  children: readonly Element[],
  removal: Readonly<{ from: number; to: number }>,
  joined: Readonly<{ from: number; to: number }>,
  expected: readonly Element[]
) => {
  const document = DocumentIndex.fromValue(children);
  const deleted = RootChange.create(document, removal);
  const after = deleted.apply(document);

  assertConverges(
    after.value as Element[],
    createTestDocumentChange({ primary: RootChange.create(after, joined) }),
    createTestDocumentChange({ primary: deleted.invert(document) }),
    expected
  );
};

describe('a join through the document change transform', () => {
  it('keeps bold restored on the first text of a join off the second text', () => {
    assertBuilt(
      [h(t('ab')), p(t('cd'))],
      join({ from: 4, to: 8 }),
      setProperties(1, { set: bold }),
      [h(t('ab', bold), t('cd'))]
    );
  });

  it('keeps bold restored on the second text of a join off the first text', () => {
    assertBuilt(
      [h(t('ab')), p(t('cd'))],
      join({ from: 4, to: 8 }),
      setProperties(7, { set: bold }),
      [h(t('ab'), t('cd', bold))]
    );
  });

  it('keeps the second text bold when the first text of a join loses its bold', () => {
    assertBuilt(
      [h(t('ab', bold)), p(t('cd', bold))],
      join({ from: 4, to: 8 }),
      setProperties(1, { unset: ['bold'] }),
      [h(t('ab'), t('cd', bold))]
    );
  });

  it('keeps typing in the first line of a join through an empty middle line', () => {
    assertBuilt(
      [h(t('a')), p(t('')), p(t('ef'))],
      join({ from: 3, to: 11 }),
      (document) => insertTextChange(document, [0, 0], 1, 'b'),
      [h(t('abef'))]
    );
  });

  it('keeps typing in the middle line of two joins in one change', () => {
    assertBuilt(
      [h(t('ab')), p(t('c')), p(t('ef'))],
      join({ from: 4, to: 8 }, { from: 9, to: 13 }),
      (document) => insertTextChange(document, [1, 0], 1, 'd'),
      [h(t('abcdef'))]
    );
  });

  it('keeps a bold text inserted at the end of a line that absorbs an empty line', () => {
    assertBuilt(
      [h(t('a')), p(t(''))],
      join({ from: 3, to: 7 }),
      (document) => insertNodeChange(document, [0, 1], t('b', bold)),
      [h(t('a'), t('b', bold))]
    );
  });

  it('puts a line inserted between the joined lines after the joined line', () => {
    assertBuilt(
      [h(t('ab')), p(t('cd'))],
      join({ from: 4, to: 8 }),
      (document) => insertNodeChange(document, [1], p(t('X'))),
      [h(t('abcd')), p(t('X'))]
    );
  });

  it('keeps a styled text inserted at the start of the second line where the lines meet', () => {
    assertBuilt(
      [h(t('ab')), p(t('cd'))],
      join({ from: 4, to: 8 }),
      (document) => insertNodeChange(document, [1, 0], t('x', bold)),
      [h(t('ab'), t('x', bold), t('cd'))]
    );
  });

  it('keeps a styled text inserted at the end of the first line where the lines meet', () => {
    assertBuilt(
      [h(t('ab')), p(t('cd'))],
      join({ from: 4, to: 8 }),
      (document) => insertNodeChange(document, [0, 1], t('x', bold)),
      [h(t('ab'), t('x', bold), t('cd'))]
    );
  });

  it('joins once when both sides join the same lines', () => {
    assertBuilt(
      [h(t('ab')), p(t('cd'))],
      join({ from: 4, to: 8 }),
      join({ from: 4, to: 8 }),
      [h(t('abcd'))]
    );
  });

  it('keeps a deletion in the first line of a join', () => {
    assertBuilt(
      [h(t('ab')), p(t('cd'))],
      join({ from: 4, to: 8 }),
      (document) => removeTextChange(document, [0, 0], 1, 'b'),
      [h(t('acd'))]
    );
  });

  it('keeps typing in the second line of a join inside a quote', () => {
    assertBuilt(
      [q(p(t('ab')), p(t('cd')))],
      join({ from: 5, to: 9 }),
      (document) => insertTextChange(document, [0, 1, 0], 1, 'X'),
      [q(p(t('abcXd')))]
    );
  });

  it('keeps a mark set on the second text of a join that keeps the texts apart', () => {
    assertBuilt(
      [h(t('ab', bold)), p(t('cd'))],
      join({ from: 5, to: 7 }),
      setProperties(7, { set: { italic: true } }),
      [h(t('ab', bold), t('cd', { italic: true }))]
    );
  });

  it('puts a line break restored between the joined lines after the joined line', () => {
    const restored = DocumentIndex.fromValue([
      p(t('ab')),
      p(t('')),
      p(t('cd')),
    ]);

    for (const removal of [
      { from: 5, to: 9 },
      { from: 4, to: 8 },
    ]) {
      assertBuilt(
        [p(t('ab')), p(t('cd'))],
        join({ from: 4, to: 8 }),
        () => RootChange.create(restored, removal).invert(restored),
        [p(t('abcd')), p(t(''))]
      );
    }
  });

  it('glues text restored into an emptied line onto the line above, as before', () => {
    assertBuilt(
      [p(t('ab')), p(t(''))],
      join({ from: 4, to: 8 }),
      (document) => insertTextChange(document, [1, 0], 0, 'cd'),
      [p(t('abcd'))]
    );
  });

  it('drops the empty text the other side leaves where the lines meet', () => {
    const children = [h(t('ab')), p(t('cd', bold))];

    assertConverges(
      children,
      rootChange(children, join({ from: 5, to: 7 })),
      committed(
        children,
        {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 2, path: [1, 0] },
        },
        (tx) => tx.text.delete()
      ),
      [h(t('ab'))]
    );
  });

  it('keeps text typed over a selection across two lines out of a mark set on the second line', () => {
    const children = [p(t('ab')), p(t('cd'))];

    assertConverges(
      children,
      committed(
        children,
        {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [1, 0] },
        },
        (tx) => tx.text.insert('X')
      ),
      rootChange(children, setProperties(7, { set: bold })),
      [p(t('aX'), t('d', bold))]
    );
  });

  it('keeps a mark the joining commit sets across the junction', () => {
    const children = [h(t('ab')), p(t('cXd'))];

    assertConverges(
      children,
      committed(
        children,
        {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
        },
        (tx) => {
          tx.nodes.merge({ at: [1] });
          tx.selection.set({
            anchor: { offset: 1, path: [0, 0] },
            focus: { offset: 1, path: [0, 1] },
          });
          tx.marks.add('bold', true);
        }
      ),
      rootChange(children, (document) =>
        removeTextChange(document, [1, 0], 1, 'X')
      ),
      [h(t('a'), t('bc', bold), t('d'))]
    );
  });

  it('restores a bold letter at the end of the first line of a join', () => {
    assertBuilt(
      [p(t('a')), p(t('cd'))],
      join({ from: 3, to: 7 }),
      (document) => insertNodeChange(document, [0, 1], t('b', bold)),
      [p(t('a'), t('b', bold), t('cd'))]
    );
  });

  it('keeps the spacer after a link at the end of the first line of a join', () => {
    assertBuilt(
      [p(t('ab'), link(t('x')), t('')), p(t('cd'))],
      join({ from: 11, to: 15 }),
      join({ from: 15, to: 17 }),
      [p(t('ab'), link(t('x')), t(''))]
    );
  });

  it('keeps the spacer before a link at the start of the second line of a join', () => {
    assertBuilt(
      [p(t('ab')), p(t(''), link(t('x')), t('cd'))],
      join({ from: 4, to: 8 }),
      join({ from: 2, to: 4 }),
      [p(t(''), link(t('x')), t('cd'))]
    );
  });

  it('keeps the joined texts apart when a mark is undone where the lines meet', () => {
    const children = [p(t('a'), t('b', bold)), p(t('c', bold), t('d'))];

    assertBuilt(
      children,
      join({ from: 6, to: 10 }),
      (document) => {
        const unbold = RootChange.create(document, {
          from: 4,
          properties: { unset: ['bold'] },
        });

        return unbold.compose(mergeNodeChange(unbold.apply(document), [0, 1]));
      },
      [p(t('ab'), t('c', bold), t('d'))]
    );
  });

  it('keeps the other line when the other side removes a line of a join', () => {
    for (const [removed, expected] of [
      [1, [p(t('ab')), p(t('ef'))]],
      [0, [p(t('cd')), p(t('ef'))]],
    ] as const) {
      assertBuilt(
        [p(t('ab')), p(t('cd')), p(t('ef'))],
        join({ from: 4, to: 8 }),
        (document) => removeNodeChange(document, [removed]),
        expected
      );
    }
  });

  it('keeps a plain empty line when the other side removes the first line and the join deletes every letter of the second', () => {
    assertBuilt(
      [h(t('a'), t('b', bold)), p(t('c'), t('d', bold))],
      deletion([[0, 1], 1], [[1, 1], 1]),
      (document) => removeNodeChange(document, [0]),
      [p(t(''))]
    );
  });

  it('keeps the joined line one text when the other side italicizes a letter the replacement deletes after the junction', () => {
    const children = [h(t('ab')), p(t('cd'))];

    assertConverges(
      children,
      rootChange(children, (document) =>
        RootChange.create(document, {
          from: positionOf(document, [[0, 0], 1]),
          insert: PreparedTokenSlice.text('X'),
          to: positionOf(document, [[1, 0], 2]),
        })
      ),
      committed(
        children,
        {
          anchor: { offset: 1, path: [1, 0] },
          focus: { offset: 2, path: [1, 0] },
        },
        (tx) => tx.marks.add('italic', true)
      ),
      [h(t('aX'))]
    );
  });

  it('rebases a join by position when the other side moves its second line', () => {
    const children = [p(t('ab')), p(t('cd')), p(t('ef'))];
    const document = DocumentIndex.fromValue(children);
    const joined = rootChange(children, join({ from: 4, to: 8 }));
    const moved = rootChange(children, () =>
      RootChange.create(document, [
        { from: 0, insert: document.slice(6, 12), to: 0 },
        { from: 6, to: 12 },
      ])
    );

    for (const [first, second, expected] of [
      [joined, moved, [p(t('cd')), p(t('ab')), p(t('ef'))]],
      [moved, joined, [p(t('abcd')), p(t('ef'))]],
    ] as const) {
      const transformed = DocumentChange.transform(first, second, { children });

      assert.deepEqual(
        throughEditor(JoinSchema, children, first, transformed.b),
        expected
      );
      assert.deepEqual(
        throughEditor(JoinSchema, children, second, transformed.a),
        expected
      );
    }
  });

  it('joins three lines when two joins share the middle line', () => {
    assertBuilt(
      [p(t('ab')), p(t('cd')), p(t('ef'))],
      join({ from: 4, to: 8 }),
      join({ from: 10, to: 14 }),
      [p(t('abcdef'))]
    );
  });

  it('keeps both quotes’ lines apart when the other side joins the quotes', () => {
    assertBuilt(
      [q(p(t('ab'))), q(p(t('cd')))],
      join({ from: 7, to: 9 }),
      (document) => insertTextChange(document, [0, 0, 0], 1, 'X'),
      [q(p(t('aXb')), p(t('cd')))]
    );
  });

  it('keeps a section’s leading heading when the other side joins two sections', () => {
    assertBuilt(
      [section(h(t('x')), p(t('ab'))), section(h(t('y')), p(t('cd')))],
      join({ from: 12, to: 14 }),
      (document) => insertTextChange(document, [0, 1, 0], 1, 'X'),
      [section(h(t('x')), p(t('aXb')), h(t('y')), p(t('cd')))]
    );
  });

  it('keeps text an undo restores before a restored line break in the joined line', () => {
    assertUndoOverJoin(
      [p(t('abX')), p(t('')), p(t('cd'))],
      { from: 4, to: 9 },
      { from: 4, to: 8 },
      [p(t('abXcd')), p(t(''))]
    );
    assertUndoOverJoin(
      [h(t('abX')), p(t('Y')), p(t('cd'))],
      { from: 4, to: 10 },
      { from: 4, to: 8 },
      [h(t('abXcd')), p(t('Y'))]
    );
  });

  it('keeps text an undo restores before a restored line break in a joined line inside a quote', () => {
    assertUndoOverJoin(
      [q(p(t('abX')), p(t('')), p(t('cd')))],
      { from: 5, to: 10 },
      { from: 5, to: 9 },
      [q(p(t('abXcd')), p(t('')))]
    );
    assertUndoOverJoin(
      [q(h(t('abX')), p(t('Y')), p(t('cd')))],
      { from: 5, to: 11 },
      { from: 5, to: 9 },
      [q(h(t('abXcd')), p(t('Y')))]
    );
  });

  it('reads a join that also removes a bold text or a link at either line’s edge', () => {
    for (const [children, end, expected] of [
      [[p(t('ab'), t('x', bold)), p(t('cd'))], [[1, 0], 0], [p(t('abcYd'))]],
      [
        [p(t('ab'), link(t('x')), t('')), p(t('cd'))],
        [[1, 0], 0],
        [p(t('abcYd'))],
      ],
      [[p(t('ab')), p(t('x', bold), t('cd'))], [[1, 1], 0], [p(t('abcYd'))]],
      [
        [p(t('ab')), p(t(''), link(t('x')), t('cd'))],
        [[1, 2], 0],
        [p(t('abcYd'))],
      ],
    ] as const) {
      const [path] = end;

      assertBuilt(
        children,
        deletion([[0, 0], 2], end),
        (document) => insertTextChange(document, path, 1, 'Y'),
        expected
      );
    }
  });

  it('keeps the heading of a section whose text joins the next line', () => {
    assertBuilt(
      [mixed(h(t('T')), t('ab')), p(t('cd'))],
      deletion([[0, 1], 2], [[1, 0], 0]),
      (document) => insertTextChange(document, [1, 0], 1, 'X'),
      [mixed(h(t('T')), t('abcXd'))],
      MixedSchema
    );
  });

  it('puts a heading restored between the joined lines after the joined line', () => {
    for (const removal of [
      { from: 4, to: 10 },
      { from: 8, to: 14 },
    ]) {
      assertUndoOverJoin(
        [p(t('ab')), h(t('XY')), p(t('cd'))],
        removal,
        { from: 4, to: 8 },
        [p(t('abcd')), h(t('XY'))]
      );
    }
  });

  // A join that keeps two texts apart commits only when their properties
  // differ, so the boundary form starts from a bold first line.
  it('keeps text restored at the second line’s start with that line’s text', () => {
    for (const [first, joined, expected] of [
      [t('ab'), { from: 4, to: 8 }, [p(t('abZcd')), h(t('XY'))]],
      [
        t('ab', bold),
        { from: 5, to: 7 },
        [p(t('ab', bold), t('Zcd')), h(t('XY'))],
      ],
    ] as const) {
      assertUndoOverJoin(
        [p(first), h(t('XY')), p(t('Zcd'))],
        { from: 8, to: 15 },
        joined,
        expected
      );
    }
  });

  it('keeps a link restored at the end of the first line in the joined line', () => {
    assertUndoOverJoin(
      [h(t('ab'), link(t('L')), t('')), p(t('Y')), p(t('cd'))],
      { from: 4, to: 16 },
      { from: 4, to: 8 },
      [h(t('ab'), link(t('L')), t('cd')), p(t('Y'))]
    );
  });

  it('keeps a bold text restored at the end of the first line in the joined line', () => {
    assertUndoOverJoin(
      [h(t('ab'), t('X', bold)), p(t('Y')), p(t('cd'))],
      { from: 4, to: 12 },
      { from: 4, to: 8 },
      [h(t('ab'), t('X', bold), t('cd')), p(t('Y'))]
    );
  });

  it('puts two equal restored lines after the joined line in their order', () => {
    assertUndoOverJoin(
      [h(t('abX')), p(t('Y')), p(t('Y')), p(t('cd'))],
      { from: 4, to: 15 },
      { from: 4, to: 8 },
      [h(t('abXcd')), p(t('Y')), p(t('Y'))]
    );
  });

  it('keeps typing in a middle line the join deletes, as the positional rebase does', () => {
    assertBuilt(
      [h(t('ab')), p(t('c')), p(t('ef'))],
      join({ from: 3, to: 14 }),
      (document) => insertTextChange(document, [1, 0], 1, 'X'),
      [h(t('aXf'))]
    );
  });

  it('drops the bold empty text left beside a link where the lines meet', () => {
    const children = [h(t(''), link(t('a')), t('X')), p(t('Y'))];

    assertBuilt(
      children,
      deletion([[0, 2], 0], [[1, 0], 0]),
      setProperties(8, { set: bold }),
      [h(t(''), link(t('a')), t('Y'))]
    );
  });

  it('drops the bold text an undo empties beside a link where the lines meet', () => {
    const children = [h(t('ab'), link(t('L')), t('XW', bold)), p(t('cd'))];

    assertConverges(
      children,
      committed(
        children,
        {
          anchor: { offset: 1, path: [0, 2] },
          focus: { offset: 0, path: [1, 0] },
        },
        (tx) => tx.text.delete()
      ),
      rootChange(children, (document) =>
        removeTextChange(document, [0, 2], 0, 'X')
      ),
      [h(t('ab'), link(t('L')), t('cd'))]
    );
  });

  it('merges the texts that meet once the join drops the italic text a deletion empties', () => {
    const children = [h(t('ab')), p(t('cd'))];

    assertConverges(
      children,
      committed(
        children,
        {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 0, path: [1, 0] },
        },
        (tx) => tx.text.delete()
      ),
      committed(
        children,
        {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        (tx) => tx.marks.add('italic', true)
      ),
      [h(t('acd'))]
    );
  });

  it('joins a second line into an empty first line', () => {
    for (const joined of [
      { from: 1, to: 5 },
      { from: 2, to: 6 },
    ]) {
      for (const [other, expected] of [
        [
          (document: DocumentIndex) =>
            insertTextChange(document, [0, 0], 0, 'ab'),
          [h(t('abcd'))],
        ],
        [
          (document: DocumentIndex) =>
            insertTextChange(document, [1, 0], 2, 'Z'),
          [h(t('cdZ'))],
        ],
      ] as const) {
        assertBuilt([h(t('')), p(t('cd'))], join(joined), other, expected);
      }
    }
  });
});

describe('the work of rebasing over a join', () => {
  const blocks = (size: number, ...inserted: Element[]) =>
    DocumentIndex.fromValue([
      p(t('line 0')),
      ...inserted,
      ...Array.from({ length: size - 1 }, (_, index) =>
        p(t(`line ${index + 1}`))
      ),
    ]);
  const lineJoin = (document: DocumentIndex) => {
    const first = document.nodeRange([0]);

    return RootChange.create(document, {
      from: first.to - 2,
      to: first.to + 2,
    });
  };
  const workOf = (run: () => void) => {
    const before = readCoreWork();

    run();

    const after = readCoreWork();

    return Object.fromEntries(
      Object.entries(after).map(([kind, count]) => [
        kind,
        count - before[kind as keyof typeof before],
      ])
    );
  };

  it('does the same work at 1,000 and 10,000 blocks for a join at the first block and an edit at the last', () => {
    const [small, large] = [1000, 10_000].map((size) => {
      const document = blocks(size);
      const joined = lineJoin(document);
      const typed = insertTextChange(document, [size - 1, 0], 0, 'X');
      let rebased = RootChange.empty(0);
      const work = workOf(() => {
        rebased = RootChange.transformInDocument(joined, typed, document).b;
        RootChange.transformInDocument(typed, joined, document);
      });
      const children = rebased.apply(joined.apply(document)).value;

      return { edges: [children[0], children.at(-1)], work };
    });

    assert.deepEqual(small.edges, [p(t('line 0line 1')), p(t('Xline 999'))]);
    assert.deepEqual(large.edges, [p(t('line 0line 1')), p(t('Xline 9999'))]);
    assert.equal(small.work.wholeReadNodes, 0);
    assert.deepEqual(large.work, small.work);
  });

  it('reads the other change once for many replacements typed over line breaks', () => {
    const walked = (count: number) => {
      const document = DocumentIndex.fromValue(
        Array.from({ length: 2 * count }, (_, index) =>
          p(t(index % 2 ? 'b' : 'a'))
        )
      );
      const pairs = Array.from({ length: count }, (_, index) => index);
      const typed = RootChange.create(
        document,
        pairs.map((index) => ({
          from: document.positionAt({ path: [2 * index, 0], offset: 1 }),
          insert: PreparedTokenSlice.text('X'),
          to: document.positionAt({ path: [2 * index + 1, 0], offset: 0 }),
        }))
      );
      const other = RootChange.create(
        document,
        pairs.map((index) => ({
          from: document.positionAt({ path: [2 * index, 0], offset: 0 }),
          insert: PreparedTokenSlice.text('Z'),
        }))
      );
      const work = workOf(() => {
        const { a, b } = RootChange.transformInDocument(typed, other, document);

        assert.deepEqual(
          b.apply(typed.apply(document)).value,
          pairs.map(() => p(t('ZaXb')))
        );
        assert.deepEqual(
          a.apply(other.apply(document)).value,
          pairs.map(() => p(t('ZaXb')))
        );
      });

      return work.sectionsWalked;
    };
    const short = walked(40);
    const long = walked(160);

    assert.ok(
      long <= 5 * short,
      `${long} sections walked for 160 replacements, ${short} for 40`
    );
  });

  it('does the same work at 1,000 and 10,000 blocks for an older edit inside a line the join moved', () => {
    const [small, large] = [1000, 10_000].map((size) => {
      const document = blocks(size);
      const restore = insertNodeChange(document, [1], p(t('Y')));
      const rest = RootChange.transformInDocument(
        lineJoin(document),
        restore,
        document
      ).a;
      const restored = blocks(size, p(t('Y')));
      const older = insertTextChange(restored, [1, 0], 0, 'X');
      let rebased = RootChange.empty(0);
      const work = workOf(() => {
        rebased = RootChange.transformInDocument(rest, older, restored).b;
        RootChange.transformInDocument(older, rest, restored);
      });

      return {
        lines: rebased.apply(rest.apply(restored)).value.slice(0, 3),
        work,
      };
    });
    // RootChange.apply allocates by the index tree's leaf layout for a change
    // that edits several places, as a moved line's join does: 14 nodes over
    // 1,001 blocks and 12 over 10,001.
    const placeFree = ({
      allocatedNodes: _allocated,
      copiedSlots: _copied,
      ...work
    }: Record<string, number>) => work;

    assert.deepEqual(small.lines, [
      p(t('line 0line 1')),
      p(t('XY')),
      p(t('line 2')),
    ]);
    assert.deepEqual(large.lines, small.lines);
    assert.equal(small.work.wholeReadNodes, 0);
    assert.deepEqual(placeFree(large.work), placeFree(small.work));
  });
});

describe('a settled junction', () => {
  it('stays as the editor’s empty-text policy leaves it', () => {
    const editor = createEditor({ plugins: [JoinSchema] });
    const editorSchema = getEditorSchema(editor);
    const canonical = (line: Element) =>
      canonicalizeInlineChildren(line.children, {
        dropsFromEmptyText: editorSchema.emptyTextDrops({
          ancestors: [],
          parent: line,
          root: 'main',
        }),
        editor,
        schema: { isInline: (node) => editorSchema.isInline(node as Element) },
      });

    for (const line of [
      h(t('ab', bold), t('cd')),
      h(t('ab'), t('x', bold), t('cd')),
      p(t('ab'), link(t('x')), t('')),
      p(t(''), link(t('x')), t('cd')),
      p(t('ab'), t('c', bold), t('d')),
      h(t(''), link(t('a')), t('Y')),
      h(t('ab'), link(t('L')), t('cd')),
      h(t('ab'), t('X', bold), t('cd')),
    ]) {
      assert.deepEqual(canonical(line), line.children);
    }
    assert.deepEqual(canonical(h(t(''), link(t('a')), t('', bold), t('Y'))), [
      t(''),
      link(t('a')),
      t('Y'),
    ]);
  });
});

const caretAt = (path: number[], offset: number) => ({
  anchor: { offset, path },
  focus: { offset, path },
});

const undosOverJoin = (
  children: readonly Element[],
  edits: readonly Edit[],
  undos: number
) => {
  const editor = createEditor({
    initialValue: structuredClone(children),
    plugins: [JoinSchema, history()],
  });

  for (const edit of edits) editor.update({ history: 'new-batch' }, edit);

  const peer = createEditor({
    initialValue: structuredClone(editor.read.children()),
    plugins: [JoinSchema],
  });

  peer.update((tx) => tx.nodes.merge({ at: [1] }));
  editor.update({ history: 'skip', tags: ['collaboration'] }, (tx) => {
    tx.changes.apply(getDefined(peer.read.lastCommit()).changes);
  });

  return Array.from({ length: undos }, () => ({
    status: editor.api.history.undo().status,
    tree: editor.read.children(),
  }));
};

const applied = (...trees: Element[][]) =>
  trees.map((tree) => ({ status: 'applied', tree }));

describe('undo over a peer’s join', () => {
  it('undoes typing inside a removed line the join moved after the joined line', () => {
    assert.deepEqual(
      undosOverJoin(
        [h(t('ab')), p(t('Y')), p(t('cd'))],
        [
          (tx) => tx.text.insert('X', { at: { offset: 0, path: [1, 0] } }),
          (tx) => tx.nodes.remove({ at: [1] }),
        ],
        2
      ),
      applied([h(t('abcd')), p(t('XY'))], [h(t('abcd')), p(t('Y'))])
    );
  });

  it('undoes typing that a deletion across lines took, kept in the joined line', () => {
    assert.deepEqual(
      undosOverJoin(
        [h(t('ab')), p(t('Y')), p(t('cd'))],
        [
          (tx) => tx.text.insert('X', { at: { offset: 2, path: [0, 0] } }),
          (tx) =>
            tx.text.delete({
              at: {
                anchor: { offset: 2, path: [0, 0] },
                focus: { offset: 1, path: [1, 0] },
              },
            }),
        ],
        2
      ),
      applied([h(t('abXcd')), p(t('Y'))], [h(t('abcd')), p(t('Y'))])
    );
  });

  it('undoes typing in the second of two equal restored lines', () => {
    assert.deepEqual(
      undosOverJoin(
        [h(t('abX')), p(t('Y')), p(t('')), p(t('cd'))],
        [
          (tx) => tx.text.insert('Y', { at: { offset: 0, path: [2, 0] } }),
          (tx) =>
            tx.text.delete({
              at: {
                anchor: { offset: 2, path: [0, 0] },
                focus: { offset: 1, path: [2, 0] },
              },
            }),
        ],
        2
      ),
      applied(
        [h(t('abXcd')), p(t('Y')), p(t('Y'))],
        [h(t('abXcd')), p(t('Y')), p(t(''))]
      )
    );
  });

  it('restores a blank line and then its text after a Backspace in it', () => {
    assert.deepEqual(
      undosOverJoin(
        [p(t('ab')), p(t('Q')), p(t('cd'))],
        [
          (tx) =>
            tx.text.delete({
              at: {
                anchor: { offset: 0, path: [1, 0] },
                focus: { offset: 1, path: [1, 0] },
              },
            }),
          (tx) => {
            tx.selection.set(caretAt([1, 0], 0));
            tx.command(editorCommands.delete, {
              direction: 'backward',
              unit: 'character',
            });
          },
        ],
        2
      ),
      applied([p(t('abcd')), p(t(''))], [p(t('abcd')), p(t('Q'))])
    );
  });

  it('restores a line typed into a blank line and then the blank line', () => {
    assert.deepEqual(
      undosOverJoin(
        [h(t('abX')), p(t('')), p(t('cd'))],
        [
          (tx) => tx.text.insert('Y', { at: { offset: 0, path: [1, 0] } }),
          (tx) =>
            tx.text.delete({
              at: {
                anchor: { offset: 2, path: [0, 0] },
                focus: { offset: 1, path: [1, 0] },
              },
            }),
        ],
        2
      ),
      applied([h(t('abXcd')), p(t('Y'))], [h(t('abXcd')), p(t(''))])
    );
  });

  it('restores a blank line after a Delete at its end', () => {
    assert.deepEqual(
      undosOverJoin(
        [p(t('ab')), p(t('')), p(t('cd'))],
        [
          (tx) => {
            tx.selection.set(caretAt([1, 0], 0));
            tx.command(editorCommands.delete, {
              direction: 'forward',
              unit: 'character',
            });
          },
        ],
        1
      ),
      applied([p(t('abcd')), p(t(''))])
    );
  });
});

// A diff of two whole documents deletes the letters beside a join with the
// boundary and inserts them again.
describe('a join diffed from two documents', () => {
  const diffedTo =
    (after: readonly Element[]): Build =>
    (document) =>
      RootChange.between(document, DocumentIndex.fromValue(after));
  const edits =
    (...ranges: Array<[Point, Point, string]>): Build =>
    (document) =>
      RootChange.create(
        document,
        ranges.map(([from, to, text]) => ({
          from: positionOf(document, from),
          insert: PreparedTokenSlice.text(text),
          to: positionOf(document, to),
        }))
      );

  it('keeps the letters it inserts again after text typed into the first line', () => {
    assertBuilt(
      [p(t('dced')), p(t('c'))],
      diffedTo([p(t('dQcedc'))]),
      edits([[[0, 0], 4], [[0, 0], 4], 'XY'], [[[1, 0], 0], [[1, 0], 1], '']),
      [p(t('dQcedXY'))]
    );
  });

  it('keeps the letter it inserts again at the start of the second line', () => {
    assertBuilt(
      [p(t('e')), p(t('be'))],
      diffedTo([p(t('ebQe'))]),
      edits([[[0, 0], 1], [[0, 0], 1], 'XW'], [[[1, 0], 1], [[1, 0], 2], '']),
      [p(t('eXWbQ'))]
    );
  });

  it('keeps the letter it inserts again and deletes the one after it', () => {
    assertBuilt(
      [h(t('ce')), p(t('ac'))],
      diffedTo([h(t('cea'))]),
      edits([[[0, 0], 2], [[0, 0], 2], 'XZ']),
      [h(t('ceXZa'))]
    );
  });
});

describe('a join an author types over', () => {
  it('keeps the letter typed over the boundary when the other side removes the equal letter after it', () => {
    const children = [p(t('ab')), p(t('cd'))];

    assertConverges(
      children,
      committed(
        children,
        {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [1, 0] },
        },
        (tx) => tx.text.insert('c')
      ),
      rootChange(children, (document) =>
        removeTextChange(document, [1, 0], 0, 'c')
      ),
      [p(t('acd'))]
    );
  });

  it("puts the other side's letter inside the selection after the typed text, as on one line", () => {
    const children = [p(t('ab')), p(t('cd'))];

    assertConverges(
      children,
      committed(
        children,
        {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [1, 0] },
        },
        (tx) => tx.text.insert('bX')
      ),
      rootChange(children, (document) =>
        insertTextChange(document, [0, 0], 2, 'Y')
      ),
      [p(t('abXYd'))]
    );
  });

  it("puts the other side's letter after the text typed over a range that ends inside the second line", () => {
    const children = [p(t('ab', { italic: true })), p(t('cd'))];

    assertConverges(
      children,
      committed(children, null, (tx) =>
        tx.text.insert('c', {
          at: {
            anchor: { offset: 1, path: [0, 0] },
            focus: { offset: 1, path: [1, 0] },
          },
        })
      ),
      rootChange(children, (document) =>
        insertTextChange(document, [1, 0], 1, 'Y')
      ),
      [p(t('a', { italic: true }), t('cYd'))]
    );
  });
});

describe('a deletion the transform does not read as a join', () => {
  it('rebases a join that also inserts an element by position', () => {
    const children = [p(t('ab')), p(t('cd'))];

    assertBuilt(
      children,
      (document) =>
        RootChange.create(document, {
          from: 5,
          insert: PreparedTokenSlice.fromNodes([link(t('x'))]),
          to: 7,
        }),
      (document) => insertTextChange(document, [1, 0], 1, 'Y'),
      [p(t('ab'), link(t('x')), t('cYd'))]
    );
  });

  it('rebases a join across the edges of two quotes by position', () => {
    assertBuilt(
      [q(p(t('ab'))), q(p(t('cd')))],
      join({ from: 5, to: 11 }),
      (document) => insertTextChange(document, [1, 0, 0], 1, 'Y'),
      [q(p(t('abcYd')))]
    );
  });

  it('removes an emptied line it would join when the other side removes the line above, as base does', () => {
    assertBuilt(
      [p(t('ab')), p(t('')), p(t('ef'))],
      join({ from: 4, to: 8 }),
      (document) => removeNodeChange(document, [0]),
      [p(t('ef'))]
    );
  });

  it('joins an empty first line holding the caret’s typing into the second line', () => {
    assertBuilt(
      [p(t('')), p(t('cd'))],
      join({ from: 2, to: 6 }),
      (document) => insertTextChange(document, [0, 0], 0, 'X'),
      [p(t('Xcd'))]
    );
  });
});
