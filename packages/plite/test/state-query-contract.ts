import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  type Element,
} from '@platejs/plite';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('state query contract', () => {
  it('reports whether the current selection is collapsed', () => {
    const editor = createEditor({
      initialSelection: {
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

  it('finds a node path by object identity', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });
    const first = editor.read(
      (state) => state.nodes.get([0], { required: true })[0]
    );
    const firstText = editor.read(
      (state) => state.nodes.get([0, 0], { required: true })[0]
    );

    assert.deepEqual(
      editor.read((state) => state.nodes.pathOf(first)),
      [0]
    );
    assert.deepEqual(
      editor.read((state) => state.nodes.pathOf(firstText)),
      [0, 0]
    );
    assert.equal(
      editor.read((state) =>
        state.nodes.pathOf({ type: 'paragraph', children: [{ text: 'one' }] })
      ),
      undefined
    );
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
    const headerNode = headerEditor.read(
      (state) => state.nodes.get([0], { required: true })[0]
    );

    assert.deepEqual(
      headerEditor.read((state) => state.nodes.pathOf(headerNode)),
      [0]
    );
    assert.equal(
      runtime.read((state) => state.nodes.pathOf(headerNode)),
      undefined
    );
  });

  it('keeps app node reads safe by default and strict with required true', () => {
    const editor = createEditor({
      initialValue: [paragraph('one')],
    });

    assert.deepEqual(
      editor.read((state) => state.nodes.get([0])),
      [paragraph('one'), [0]]
    );
    assert.deepEqual(
      editor.read((state) => state.nodes.get([0], { required: true })),
      [paragraph('one'), [0]]
    );
    assert.deepEqual(
      editor.read((state) => state.nodes.path([0])),
      [0]
    );
    assert.deepEqual(
      editor.read((state) => state.nodes.path([0], { required: true })),
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
      editor.read((state) => state.nodes.get([9], { required: true }))
    );
    assert.throws(() =>
      editor.read((state) => state.nodes.path([9], { required: true }))
    );
    assert.throws(() =>
      editor.read((state) => state.nodes.first([9], { required: true }))
    );
    assert.throws(() =>
      editor.read((state) => state.nodes.leaf([9], { required: true }))
    );
    assert.throws(() =>
      editor.read((state) => state.nodes.parent([9], { required: true }))
    );
    assert.throws(() =>
      editor.read((state) => state.nodes.parent([], { required: true }))
    );
    assert.throws(() =>
      editor.read((state) => state.points.get([9], { required: true }))
    );
    assert.throws(() =>
      editor.read((state) => state.points.start([9], { required: true }))
    );
    assert.throws(() =>
      editor.read((state) => state.points.end([9], { required: true }))
    );
    assert.throws(() =>
      editor.read((state) => state.ranges.get([9], { required: true }))
    );
    assert.throws(() =>
      editor.read((state) => state.ranges.edges([9], { required: true }))
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
