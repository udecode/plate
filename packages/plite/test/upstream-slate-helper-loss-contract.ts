import assert from 'node:assert/strict';

import {
  createEditor,
  type Descendant,
  type Editor,
  type Element,
  type Node,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  type Text,
} from '../src';
import { extendTestSchema } from './support/schema';

type PropMode = 'all' | 'block' | 'text';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const text = (value: string, props: Record<string, unknown> = {}): Text => ({
  ...props,
  text: value,
});

const createSeededEditor = (
  children: Descendant[],
  selection: Range | null = null
) => {
  const editor = createEditor({
    initialSelection: selection,
    initialValue: children,
  });

  extendTestSchema(editor, [
    { type: 'paragraph' },
    { type: 'blockquote' },
    { type: 'list' },
    { type: 'list-item' },
    { inline: true, type: 'link' },
    { type: 'image', void: 'block' },
    { type: 'mention', void: 'markable-inline' },
  ]);

  return editor;
};

const typeIs =
  (type: string) =>
  (node: Node): node is Element =>
    NodeApi.isElement(node) && node.type === type;

const getCurrentIsAt = (
  editor: Editor,
  {
    at,
    block,
    blocks,
    end,
    start,
    text: inText,
    word,
  }: {
    at?: Point | Range | null;
    block?: boolean;
    blocks?: boolean;
    end?: boolean;
    start?: boolean;
    text?: boolean;
    word?: boolean;
  } = {}
) =>
  editor.read((state) => {
    const target = at ?? state.selection.get();

    if (!target) return false;

    if (PointApi.isPoint(target)) {
      if (word && end) {
        const after = state.points.after(target);

        if (!after) return true;

        return /^(?:\s|$)/.test(
          state.text.string({ anchor: target, focus: after })
        );
      }

      if (start || end) {
        const blockEntry = state.nodes.block({ at: target });

        if (!blockEntry) return false;

        return start
          ? state.points.isStart(target, blockEntry[1])
          : state.points.isEnd(target, blockEntry[1]);
      }

      return false;
    }

    if (!RangeApi.isRange(target)) return false;

    const [startPoint, endPoint] = RangeApi.edges(target);

    if (inText) {
      return PathApi.equals(startPoint.path, endPoint.path);
    }

    const startBlock = state.nodes.block({ at: startPoint });
    const endBlock = state.nodes.block({ at: endPoint });

    if (blocks) {
      if (!startBlock && !endBlock) return false;
      if (!startBlock || !endBlock) return true;

      return !PathApi.equals(startBlock[1], endBlock[1]);
    }
    if (!startBlock || !endBlock) return false;

    if (block) {
      return PathApi.equals(startBlock[1], endBlock[1]);
    }
    if (start) {
      return (
        state.points.isStart(startPoint, startBlock[1]) ||
        (RangeApi.isExpanded(target) &&
          state.points.isStart(endPoint, startBlock[1]))
      );
    }
    if (end) {
      return state.points.isEnd(endPoint, endBlock[1]);
    }

    return false;
  });

const getCurrentSelected = (
  editor: Editor,
  target: Path | Range,
  options: { contains?: boolean } = {}
) =>
  editor.read((state) => {
    const selection = state.selection.get();

    if (!selection) return false;

    const range = RangeApi.isRange(target) ? target : state.ranges.get(target);

    return options.contains
      ? RangeApi.surrounds(selection, range)
      : Boolean(RangeApi.intersection(selection, range));
  });

const getCurrentRange = (
  editor: Editor,
  at: 'before' | 'start' | Point | Range,
  to?: Point | Range | null
) =>
  editor.read((state) => {
    if (at === 'before' && to) {
      const focus = PointApi.isPoint(to) ? to : RangeApi.start(to);
      const anchor = state.points.before(focus) ?? focus;

      return state.ranges.get(anchor, focus);
    }

    if (at === 'start' && to) {
      const focus = PointApi.isPoint(to) ? to : RangeApi.start(to);
      const block = state.nodes.block({ at: focus });

      if (!block) return;

      return state.ranges.get(state.points.start(block[1]), focus);
    }

    return state.ranges.get(at);
  });

const getCurrentIsEmptyAfter = (editor: Editor, at: Point | Range | null) =>
  editor.read((state) => {
    if (!at) return true;

    const point = PointApi.isPoint(at) ? at : RangeApi.start(at);
    const block = state.nodes.block({ at: point });

    if (!block) return false;
    if (!state.points.isEnd(point, PathApi.parent(point.path))) return false;

    const siblingEntries = state.nodes.toArray({
      at: block[1],
      match: (_node, path) =>
        path.length === point.path.length && PathApi.isAfter(path, point.path),
    });

    if (siblingEntries.length === 0) {
      return state.points.isEnd(point, block[1]);
    }

    return siblingEntries.every(([node]) =>
      NodeApi.isText(node) ? node.text === '' : NodeApi.string(node) === ''
    );
  });

const getSharedProp = ({
  defaultValue,
  getProp,
  key,
  mode = 'block',
  nodes,
}: {
  defaultValue?: string;
  getProp?: (node: Node) => string | undefined;
  key?: string;
  mode?: PropMode;
  nodes: Node[];
}) => {
  if (nodes.length === 0) return defaultValue;

  const readProp =
    getProp ??
    ((node: Node) =>
      key && key in node
        ? String((node as Record<string, unknown>)[key])
        : undefined);
  let value: string | undefined;

  for (const node of nodes) {
    if (mode === 'block' || mode === 'all') {
      const nodeValue = readProp(node);

      if (nodeValue !== undefined) {
        if (value === undefined) {
          value = nodeValue;
        } else if (value !== nodeValue) {
          return;
        }
      } else if (mode === 'block') {
        return defaultValue;
      }

      if (mode === 'block') continue;
    }

    if (mode === 'text' || mode === 'all') {
      for (const [childText] of NodeApi.texts(node)) {
        const nodeValue = readProp(childText);

        if (nodeValue !== undefined) {
          if (value === undefined) {
            value = nodeValue;
          } else if (value !== nodeValue) {
            return;
          }
        } else if (mode === 'text') {
          return defaultValue;
        }
      }
    }
  }

  return value;
};

describe('old Slate helper behavior through current Plite APIs', () => {
  it('keeps finder-style queries safe while strict get-style queries still fail loudly', () => {
    const editor = createSeededEditor([paragraph('one')]);

    const result = editor.read((state) => ({
      above: state.nodes.above({ at: [9, 9, 9], match: typeIs('paragraph') }),
      block: state.nodes.block({ at: [9, 9, 9] }),
      entries: state.nodes.toArray({ at: [9, 9, 9] }),
      find: state.nodes.find({ at: [9, 9, 9], match: typeIs('paragraph') }),
      fragment: state.fragment.get({
        at: {
          anchor: { path: [9, 0], offset: 0 },
          focus: { path: [9, 0], offset: 0 },
        },
      }),
      some: state.nodes.some({ at: [9, 9, 9], match: typeIs('paragraph') }),
      string: state.text.string([9, 9, 9]),
    }));

    assert.deepEqual(result, {
      above: undefined,
      block: undefined,
      entries: [],
      find: undefined,
      fragment: [],
      some: false,
      string: '',
    });
    assert.equal(
      editor.read((state) => state.nodes.get([9, 9, 9])),
      undefined
    );
    assert.throws(() =>
      editor.read((state) => state.nodes.get([9, 9, 9], { required: true }))
    );
  });

  it('keeps old fragment unwrap behavior as state.fragment.get({ unwrap })', () => {
    const editor = createSeededEditor([
      {
        type: 'blockquote',
        children: [paragraph('one'), paragraph('two')],
      },
    ]);

    const fragment = editor.read((state) =>
      state.fragment.get({
        at: state.ranges.get([0]),
        unwrap: ['blockquote'],
      })
    );

    assert.deepEqual(fragment, [paragraph('one'), paragraph('two')]);
  });

  it('covers old block/above/edgeBlocks helpers with state.nodes.block and state.ranges.edges', () => {
    const editor = createSeededEditor([
      {
        type: 'paragraph',
        children: [
          {
            type: 'blockquote',
            children: [{ text: 'one' }],
          },
        ],
      },
      paragraph('two'),
    ]);

    const result = editor.read((state) => {
      const highest = state.nodes.block({
        at: [0, 0, 0],
        mode: 'highest',
      });
      const lowest = state.nodes.block({
        at: [0, 0, 0],
        mode: 'lowest',
      });
      const selection: Range = {
        anchor: { path: [0, 0, 0], offset: 1 },
        focus: { path: [1, 0], offset: 2 },
      };
      const [start, end] = state.ranges.edges(selection);
      const startBlock = state.nodes.block({ at: start });
      const endBlock = state.nodes.block({ at: end });

      return {
        endBlockPath: endBlock?.[1],
        highestPath: highest?.[1],
        lowestPath: lowest?.[1],
        range: state.ranges.get(startBlock![1], endBlock![1]),
        startBlockPath: startBlock?.[1],
      };
    });

    assert.deepEqual(result.highestPath, [0]);
    assert.deepEqual(result.lowestPath, [0, 0]);
    assert.deepEqual(result.startBlockPath, [0, 0]);
    assert.deepEqual(result.endBlockPath, [1]);
    assert.deepEqual(result.range, {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 3 },
    });
  });

  it('covers old node/options, descendant, blocks, and some helpers with nodes.find/toArray/some', () => {
    const editor = createSeededEditor([
      {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [paragraph('one')],
          },
        ],
      },
    ]);

    const result = editor.read((state) => ({
      firstListPath: state.nodes.find({ at: [], match: typeIs('list') })?.[1],
      firstParagraphAtListItem: state.nodes.find({
        at: [0, 0],
        match: typeIs('paragraph'),
      })?.[1],
      missingAt: state.nodes.find({
        at: [9],
        match: typeIs('paragraph'),
      }),
      missingMatch: state.nodes.find({ match: typeIs('missing') }),
      paragraphPaths: state.nodes
        .toArray({ at: [], match: typeIs('paragraph') })
        .map(([, path]) => path),
      someParagraph: state.nodes.some({ at: [], match: typeIs('paragraph') }),
    }));

    assert.deepEqual(result, {
      firstListPath: [0],
      firstParagraphAtListItem: [0, 0, 0],
      missingAt: undefined,
      missingMatch: undefined,
      paragraphPaths: [[0, 0, 0]],
      someParagraph: true,
    });
  });

  it('covers old inline ancestor matching through state.nodes.above without Plate aliases', () => {
    const editor = createSeededEditor([
      {
        type: 'paragraph',
        children: [
          { text: 'one' },
          {
            type: 'link',
            children: [{ text: 'two' }],
          },
          { text: 'three' },
        ],
      },
    ]);

    const result = editor.read((state) =>
      state.nodes.above({
        at: [0, 1, 0],
        match: (node) => NodeApi.isElement(node) && state.schema.isInline(node),
      })
    );

    assert.deepEqual(result?.[1], [0, 1]);
  });

  it('recovers old next traversal start modes on current state.nodes.next', () => {
    const editor = createSeededEditor([
      { id: '1', type: 'paragraph', children: [{ text: 'Block One' }] },
      {
        id: '2',
        type: 'blockquote',
        children: [
          { id: '2-1', type: 'paragraph', children: [{ text: 'Child One' }] },
          { id: '2-2', type: 'paragraph', children: [{ text: 'Child Two' }] },
        ],
      },
      { id: '3', type: 'paragraph', children: [{ text: 'Block Three' }] },
    ] as Element[]);

    const result = editor.read((state) => ({
      after: (state.nodes.next({ at: [0] })?.[0] as Element | undefined)?.id,
      child: (
        state.nodes.next({ at: [1], from: 'child' })?.[0] as Element | undefined
      )?.id,
      nestedChild: (
        state.nodes.next({ at: [1, 0], from: 'child' })?.[0] as Text | undefined
      )?.text,
      textPath: state.nodes.next<Text>({
        at: [0],
        match: NodeApi.isText,
      })?.[1],
    }));

    assert.deepEqual(result, {
      after: '2',
      child: '2-1',
      nestedChild: 'Child One',
      textPath: [1, 0, 0],
    });
  });

  it('recovers old previous traversal start modes and sibling lookup on current state.nodes.previous', () => {
    const editor = createSeededEditor([
      { id: '1', type: 'paragraph', children: [{ text: 'Block One' }] },
      {
        id: '2',
        type: 'blockquote',
        children: [
          { id: '2-1', type: 'paragraph', children: [{ text: 'Child One' }] },
          { id: '2-2', type: 'paragraph', children: [{ text: 'Child Two' }] },
        ],
      },
      { id: '3', type: 'paragraph', children: [{ text: 'Block Three' }] },
    ] as Element[]);

    const result = editor.read((state) => ({
      before: (
        state.nodes.previous({
          at: [2],
        })?.[0] as Element | undefined
      )?.id,
      parent: (
        state.nodes.previous({
          at: [1, 0],
          from: 'parent',
          match: NodeApi.isElement,
        })?.[0] as Element | undefined
      )?.id,
      parentPrevious: (
        state.nodes.previous({
          at: [1, 1],
          from: 'parent',
          match: NodeApi.isElement,
        })?.[0] as Element | undefined
      )?.id,
      sibling: (
        state.nodes.previous({
          at: [1, 1],
          sibling: true,
        })?.[0] as Element | undefined
      )?.id,
      firstSibling: state.nodes.previous({ at: [0], sibling: true }),
      textPath: state.nodes.previous<Text>({
        at: [1],
        match: NodeApi.isText,
      })?.[1],
    }));

    assert.deepEqual(result, {
      before: '2',
      parent: '2',
      parentPrevious: '2-1',
      sibling: '2-1',
      firstSibling: undefined,
      textPath: [0, 0],
    });
  });

  it('recovers old last({ level }) and missing-node behavior on current state.nodes.last', () => {
    const editor = createSeededEditor([
      {
        type: 'blockquote',
        children: [paragraph('test')],
      },
      {
        type: 'blockquote',
        children: [paragraph('test2')],
      },
    ]);

    const result = editor.read((state) => ({
      level0: state.nodes.last([], { level: 0 })?.[1],
      level1: state.nodes.last([], { level: 1 })?.[1],
      level2: state.nodes.last([], { level: 2 })?.[1],
      missing: state.nodes.last([9]),
    }));

    assert.deepEqual(result, {
      level0: [1],
      level1: [1, 0],
      level2: [1, 0, 0],
      missing: undefined,
    });
  });

  it('recovers old unhangRange character and opt-out behavior through state.ranges.unhang', () => {
    const editor = createSeededEditor([
      {
        type: 'paragraph',
        children: [{ text: 'ab' }, { text: 'cd' }],
      },
    ]);
    const samePath: Range = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    const hangingToNextLeafStart: Range = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 1], offset: 0 },
    };
    const hangingFromPreviousLeaf: Range = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 1], offset: 1 },
    };

    const result = editor.read((state) => ({
      samePath: state.ranges.unhang(samePath, { character: true }),
      endForward: state.ranges.unhang(hangingToNextLeafStart, {
        character: true,
      }),
      startBackward: state.ranges.unhang(hangingFromPreviousLeaf, {
        character: true,
      }),
      optOut: state.ranges.unhang(hangingToNextLeafStart, { unhang: false }),
    }));

    assert.deepEqual(result.samePath, samePath);
    assert.deepEqual(result.endForward, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    });
    assert.deepEqual(result.startBackward, {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 1 },
    });
    assert.deepEqual(result.optOut, hangingToNextLeafStart);
  });

  it('proves old range("before" | "start") semantics with current point/range primitives', () => {
    const selection: Range = {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };
    const editor = createSeededEditor([paragraph('test')], selection);

    assert.deepEqual(getCurrentRange(editor, 'before', selection), {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 4 },
    });
    assert.deepEqual(getCurrentRange(editor, 'start', selection), {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    });
  });

  it('proves old isEmpty after/block semantics with current node and point primitives', () => {
    const editor = createSeededEditor(
      [
        {
          type: 'paragraph',
          children: [
            { text: 'first' },
            { type: 'link', children: [{ text: 'test' }] },
            { text: '' },
          ],
        },
        paragraph(''),
      ] as Element[],
      {
        anchor: { path: [0, 1, 0], offset: 4 },
        focus: { path: [0, 1, 0], offset: 4 },
      }
    );

    assert.equal(getCurrentIsEmptyAfter(editor, editor.selection), true);
    assert.equal(
      getCurrentIsEmptyAfter(editor, {
        anchor: { path: [0, 1, 0], offset: 2 },
        focus: { path: [0, 1, 0], offset: 2 },
      }),
      false
    );
    assert.equal(
      editor.read((state) => {
        const block = state.nodes.block({ at: [1, 0] });

        return Boolean(block && state.nodes.isEmpty(block[0]));
      }),
      true
    );
  });

  it('covers old isAt range and point semantics with current range/point/node primitives', () => {
    const sameTextRange: Range = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    };
    const crossBlockRange: Range = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    };
    const editor = createSeededEditor(
      [paragraph('word another'), paragraph('two')],
      sameTextRange
    );

    assert.equal(getCurrentIsAt(editor, { text: true }), true);
    assert.equal(
      getCurrentIsAt(editor, { at: crossBlockRange, blocks: true }),
      true
    );
    assert.equal(
      getCurrentIsAt(editor, { at: crossBlockRange, block: true }),
      false
    );
    assert.equal(
      getCurrentIsAt(editor, {
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 4 },
        },
        start: true,
      }),
      true
    );
    assert.equal(
      getCurrentIsAt(editor, {
        at: { path: [0, 0], offset: 4 },
        end: true,
        word: true,
      }),
      true
    );
    assert.equal(
      getCurrentIsAt(editor, {
        at: { path: [0, 0], offset: 2 },
        end: true,
        word: true,
      }),
      false
    );
    assert.equal(
      getCurrentIsAt(editor, { at: { path: [0, 0], offset: 2 } }),
      false
    );
  });

  it('covers old isSelected path/range containment semantics with current RangeApi plus state.ranges', () => {
    const editor = createSeededEditor([paragraph('test'), paragraph('two')], {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    });

    assert.equal(getCurrentSelected(editor, [0]), true);
    assert.equal(getCurrentSelected(editor, [1]), false);
    assert.equal(
      getCurrentSelected(
        editor,
        {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 3 },
        },
        { contains: true }
      ),
      true
    );
    assert.equal(
      getCurrentSelected(
        editor,
        {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [1, 0], offset: 1 },
        },
        { contains: true }
      ),
      false
    );
  });

  it('covers old prop shared-value semantics with current NodeApi traversal', () => {
    const nodes: Node[] = [
      {
        type: 'paragraph',
        align: 'center',
        children: [text('one', { color: 'red' })],
      } as Node,
      {
        type: 'paragraph',
        align: 'center',
        children: [text('two', { color: 'red' })],
      } as Node,
    ];

    assert.equal(
      getSharedProp({ key: 'missing', defaultValue: 'left', nodes }),
      'left'
    );
    assert.equal(getSharedProp({ key: 'align', nodes }), 'center');
    assert.equal(getSharedProp({ key: 'color', mode: 'text', nodes }), 'red');
    assert.equal(getSharedProp({ key: 'color', mode: 'all', nodes }), 'red');

    const mixedNodes = [
      nodes[0],
      {
        type: 'paragraph',
        align: 'right',
        children: [text('three', { color: 'blue' })],
      } as Node,
    ];

    assert.equal(getSharedProp({ key: 'align', nodes: mixedNodes }), undefined);
    assert.equal(
      getSharedProp({
        getProp: (node) =>
          NodeApi.isText(node) ? String(node.color) : undefined,
        mode: 'text',
        nodes: mixedNodes,
      }),
      undefined
    );
  });

  it('covers old marks and removeMark behavior through current state.marks and tx.marks', () => {
    const editor = createSeededEditor(
      [
        {
          type: 'paragraph',
          children: [
            { bold: true, text: 'one' },
            { bold: true, italic: true, text: 'two' },
          ],
        } as Element,
      ],
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 1], offset: 3 },
      }
    );

    assert.deepEqual(
      editor.read((state) => state.marks.get()),
      { bold: true }
    );

    editor.update((tx) => {
      tx.marks.remove('bold');
    });

    assert.deepEqual(
      editor.read((state) => state.value.root()),
      [
        {
          type: 'paragraph',
          children: [{ text: 'one' }, { italic: true, text: 'two' }],
        },
      ]
    );
  });
});
