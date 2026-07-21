import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  type Element,
  type Text,
} from '@platejs/plite';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('state query contract', () => {
  it('reads the current selection when text.string omits its target', () => {
    const editor = createEditor({
      initialSelection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      },
      initialValue: [paragraph('one'), paragraph('two')],
    });

    assert.equal(editor.read.text.string(), 'ne');
    assert.equal(
      editor.read((state) => state.text.string()),
      'ne'
    );
    assert.equal(editor.read.text.string([]), 'onetwo');

    editor.update((tx) => {
      assert.equal(tx.text.string(), 'ne');
      tx.selection.clear();
      assert.equal(tx.text.string(), '');
    });

    assert.equal(editor.read.text.string(), '');
    assert.equal(editor.read.text.string([]), 'onetwo');
  });

  it('reports whether the current selection is collapsed', () => {
    const editor = createEditor({
      initialSelection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
      initialValue: [paragraph('one')],
    });

    assert.equal(
      editor.read((state) => state.selection.isCollapsed()),
      true
    );
    assert.equal(editor.read.selection.isCollapsed(), true);
    assert.equal(editor.read.selection.isExpanded(), false);
    assert.equal(editor.read.selection.isWithinBlock(), true);
    assert.equal(editor.read.selection.isAcrossBlocks(), false);

    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      });
    });

    assert.equal(
      editor.read((state) => state.selection.isCollapsed()),
      false
    );
    assert.equal(editor.read.selection.isExpanded(), true);
    assert.equal(editor.read.selection.isWithinBlock(), true);
    assert.equal(editor.read.selection.isAcrossBlocks(), false);

    editor.update((tx) => {
      tx.nodes.insert(paragraph('two'), { at: [1] });
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 3 },
      });
    });

    assert.equal(editor.read.selection.isCollapsed(), false);
    assert.equal(editor.read.selection.isExpanded(), true);
    assert.equal(editor.read.selection.isWithinBlock(), false);
    assert.equal(editor.read.selection.isAcrossBlocks(), true);

    editor.update((tx) => {
      tx.selection.clear();
    });

    assert.equal(
      editor.read((state) => state.selection.isCollapsed()),
      false
    );
    assert.equal(editor.read.selection.isExpanded(), false);
    assert.equal(editor.read.selection.isWithinBlock(), false);
    assert.equal(editor.read.selection.isAcrossBlocks(), false);
  });

  it('exposes explicit selection and point predicates', () => {
    const editor = createEditor({
      initialSelection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
      initialValue: [paragraph('one two'), paragraph('three')],
    });

    assert.equal(editor.read.selection.isWithinText(), true);
    assert.equal(editor.read.selection.isAtBlockStart(), true);
    assert.equal(editor.read.selection.isAtBlockEnd(), false);
    assert.equal(
      editor.read.selection.isAtBlockStart({
        at: { path: [1, 0], offset: 0 },
      }),
      true
    );
    assert.equal(
      editor.read.selection.intersects({
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 5 },
      }),
      true
    );
    assert.equal(
      editor.read.selection.contains({
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 2 },
      }),
      true
    );
    assert.equal(
      editor.read.selection.contains({
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 5 },
      }),
      false
    );
    assert.equal(
      editor.read.points.isWordEnd({ path: [0, 0], offset: 3 }),
      true
    );
    assert.equal(
      editor.read.points.isWordEnd({ path: [0, 0], offset: 2 }),
      false
    );

    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 7 },
        focus: { path: [0, 0], offset: 7 },
      });

      assert.equal(tx.selection.isAtBlockEnd(), true);
      assert.equal(tx.selection.isWithinText(), true);
      assert.equal(tx.points.isWordEnd({ path: [0, 0], offset: 7 }), true);
    });

    editor.update.selection.set({
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 5 },
    });

    assert.equal(editor.read.selection.isWithinText(), false);
    assert.equal(editor.read.selection.isAcrossBlocks(), true);
    assert.equal(editor.read.selection.isAtBlockEnd(), true);
  });

  it('treats the boundary before a nested block as the current block end', () => {
    const editor = createEditor({
      initialSelection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [{ children: [{ text: 'next' }], type: 'paragraph' }],
              type: 'nested',
            },
          ],
          type: 'paragraph',
        },
      ],
    });

    assert.equal(editor.read.selection.isAtBlockEnd(), true);
  });

  it('finds a node path by object identity', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });
    const firstEntry = editor.read((state) => state.nodes.get<Element>([0]));
    const firstTextEntry = editor.read((state) =>
      state.nodes.get<Text>([0, 0])
    );
    assert(firstEntry);
    assert(firstTextEntry);
    const [first] = firstEntry;
    const [firstText] = firstTextEntry;

    assert.deepEqual(
      editor.read((state) => state.nodes.path(first)),
      [0]
    );
    assert.deepEqual(
      editor.read((state) => state.nodes.path(firstText)),
      [0, 0]
    );
    assert.equal(
      editor.read((state) =>
        state.nodes.path({ type: 'paragraph', children: [{ text: 'one' }] })
      ),
      undefined
    );
  });

  it('uses element and text targets across lifecycle reads', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });
    const elementEntry = editor.read.nodes.get<Element>([0]);
    const textEntry = editor.read.nodes.get<Text>([0, 0]);
    assert(elementEntry);
    assert(textEntry);
    const [element] = elementEntry;
    const [text] = textEntry;

    assert.deepEqual(editor.read.nodes.get(element), [element, [0]]);
    assert.deepEqual(editor.read.nodes.get(text), [text, [0, 0]]);
    assert.deepEqual(editor.read.nodes.children(element), [text]);
    assert.deepEqual(editor.read.points.start(element), {
      path: [0, 0],
      offset: 0,
    });
    assert.deepEqual(editor.read.points.end(text), {
      path: [0, 0],
      offset: 3,
    });
    assert.deepEqual(editor.read.ranges.edges(element), [
      { path: [0, 0], offset: 0 },
      { path: [0, 0], offset: 3 },
    ]);
    assert.equal(editor.read.text.string(element), 'one');
    assert.deepEqual(
      editor.read.nodes.toArray<Element>({
        at: element,
        match: { type: 'paragraph' },
      }),
      [[element, [0]]]
    );
  });

  it('invalidates removed node targets without scanning the tree', () => {
    const editor = createEditor({ initialValue: [paragraph('one')] });
    const entry = editor.read.nodes.get<Element>([0]);
    assert(entry);
    const [element] = entry;

    editor.update.nodes.remove({ at: element });

    assert.equal(editor.read.nodes.path(element), undefined);
    assert.equal(editor.read.nodes.get(element), undefined);
    assert.equal(editor.read.text.string(element), '');
  });

  it('scopes node path lookup to root-bound views', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('header')],
        },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const headerEntry = headerEditor.read((state) =>
      state.nodes.get<Element>([0])
    );
    assert(headerEntry);
    const [headerNode] = headerEntry;

    assert.deepEqual(
      headerEditor.read((state) => state.nodes.path(headerNode)),
      [0]
    );
    assert.equal(
      runtime.read((state) => state.nodes.path(headerNode)),
      undefined
    );
  });

  it('scopes selection predicates to root-bound views', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('header text')],
        },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update.selection.set({
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 6 },
    });

    assert.equal(headerEditor.read.selection.isWithinText(), true);
    assert.equal(headerEditor.read.selection.isAtBlockStart(), true);
    assert.equal(
      headerEditor.read.selection.intersects({
        kind: 'text',
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 8 },
      }),
      true
    );
    assert.equal(
      headerEditor.read.points.isWordEnd({ path: [0, 0], offset: 6 }),
      true
    );
  });

  it('matches nodes by scalar, one-of, empty, and predicate policies', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('one'),
        { type: 'quote', children: [{ text: 'two' }] },
        { type: 'image', url: '/image.png', children: [{ text: '' }] },
      ],
    });

    assert.deepEqual(
      editor.read.nodes
        .toArray<Element>({ at: [], match: { type: 'quote' } })
        .map(([node]) => node.type),
      ['quote']
    );
    assert.deepEqual(
      editor.read.nodes
        .toArray<Element>({ at: [], match: { type: ['paragraph', 'image'] } })
        .map(([node]) => node.type),
      ['paragraph', 'image']
    );
    assert.equal(
      editor.read.nodes.find<Element>({ at: [], match: { type: [] } }),
      undefined
    );
    assert.deepEqual(
      editor.read.nodes.find<Element>({
        at: [],
        match: (node): node is Element & { url: string } =>
          'url' in node && typeof node.url === 'string',
      }),
      [{ type: 'image', url: '/image.png', children: [{ text: '' }] }, [2]]
    );
  });

  it('keeps lifecycle reads optional while rejecting malformed locations', () => {
    const editor = createEditor({
      initialValue: [paragraph('one')],
    });

    assert.deepEqual(
      editor.read((state) => state.nodes.get([0])),
      [paragraph('one'), [0]]
    );
    assert.deepEqual(
      editor.read((state) => state.nodes.path([0])),
      [0]
    );

    assert.equal(
      editor.read((state) => state.nodes.get([9])),
      undefined
    );
    assert.equal(
      editor.read((state) => state.nodes.path([9])),
      undefined
    );
    assert.equal(
      editor.read((state) => state.nodes.above({ at: [9, 9] })),
      undefined
    );
    assert.deepEqual(
      editor.read((state) => state.nodes.children([9])),
      []
    );
    assert.equal(
      editor.read((state) => state.nodes.first([9])),
      undefined
    );
    assert.equal(
      editor.read((state) => state.nodes.leaf([9])),
      undefined
    );
    assert.deepEqual(
      editor.read((state) => Array.from(state.nodes.levels({ at: [9] }))),
      []
    );
    assert.equal(
      editor.read((state) => state.nodes.next({ at: [9] })),
      undefined
    );
    assert.equal(
      editor.read((state) => state.nodes.parent([9])),
      undefined
    );
    assert.equal(
      editor.read((state) => state.nodes.parent([])),
      undefined
    );
    assert.equal(
      editor.read((state) => state.nodes.previous({ at: [9] })),
      undefined
    );
    assert.equal(
      editor.read((state) => state.points.get([9])),
      undefined
    );
    assert.equal(
      editor.read((state) => state.points.start([9])),
      undefined
    );
    assert.equal(
      editor.read((state) => state.points.end([9])),
      undefined
    );
    assert.equal(
      editor.read((state) => state.points.before([9])),
      undefined
    );
    assert.equal(
      editor.read((state) => state.points.after([9])),
      undefined
    );
    assert.equal(
      editor.read((state) =>
        state.points.isStart({ path: [0, 0], offset: 0 }, [9])
      ),
      false
    );
    assert.deepEqual(
      editor.read((state) =>
        Array.from(
          state.points.positions({
            at: {
              kind: 'text',
              anchor: { path: [9, 0], offset: 0 },
              focus: { path: [9, 0], offset: 0 },
            },
          })
        )
      ),
      []
    );
    assert.equal(
      editor.read((state) => state.ranges.get([9])),
      undefined
    );
    assert.equal(
      editor.read((state) => state.ranges.edges([9])),
      undefined
    );
    assert.deepEqual(
      editor.read((state) =>
        state.fragment({
          at: {
            anchor: { path: [9, 0], offset: 0 },
            focus: { path: [9, 0], offset: 0 },
          },
        })
      ),
      []
    );

    assert.throws(() =>
      editor.read((state) => state.nodes.get(['bad'] as any))
    );
    assert.throws(() =>
      editor.read((state) => state.nodes.path(['bad'] as any))
    );
    assert.throws(() =>
      editor.read((state) => state.nodes.above({ at: ['bad'] as any }))
    );
    assert.throws(() =>
      editor.read((state) => state.nodes.children(['bad'] as any))
    );
    assert.throws(() =>
      editor.read((state) => state.points.start(['bad'] as any))
    );
    assert.throws(() =>
      editor.read((state) => state.ranges.get(['bad'] as any))
    );
  });

  it('does not hide query callback failures behind safe collection results', () => {
    const editor = createEditor({
      initialValue: [paragraph('one')],
    });

    assert.throws(
      () =>
        editor.read((state) =>
          state.nodes.find({
            at: [],
            match: () => {
              throw new Error('match boom');
            },
          })
        ),
      /match boom/
    );

    assert.throws(
      () =>
        editor.read((state) =>
          state.nodes.some({
            at: [],
            match: () => {
              throw new Error('some boom');
            },
          })
        ),
      /some boom/
    );

    assert.throws(
      () =>
        editor.read((state) =>
          state.nodes.toArray({ at: [] }, () => {
            throw new Error('map boom');
          })
        ),
      /map boom/
    );
  });
});
