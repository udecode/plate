import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  type NodeSelection,
  property,
  type Range,
  schema,
  SelectionApi,
  target,
} from '@platejs/plite';
import {
  decodeEditorSelection,
  encodeEditorSelection,
  getEditorLiveSelection,
  getSelectionDOMRange,
  getSnapshot,
} from '@platejs/plite/internal';

const range = (
  anchorPath: number[],
  anchorOffset: number,
  focusPath: number[],
  focusOffset: number
): Range => ({
  anchor: { offset: anchorOffset, path: anchorPath },
  focus: { offset: focusOffset, path: focusPath },
});

const initialValue = [
  { children: [{ text: 'a' }], type: 'paragraph' },
  { children: [{ text: 'b' }], type: 'paragraph' },
];

const selectionMarksSchema = defineEditorSchema(
  'schema:selection-marks-schema',
  {
    elements: {
      code: {
        content: schema.content.text({ default: 'text', min: 1 }),
      } as const,
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
      } as const,
    },
    id: 'selection-marks-schema',
    properties: [
      schema.textProperty('bold', property.boolean(), {
        target: target.type('paragraph'),
      }),
    ],
    root: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
    roots: {
      header: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
    unknown: 'reject',
    version: 1,
  }
);

describe('selection protocol', () => {
  it('validates insertion marks at every selection ingress and named root', () => {
    const point = { offset: 0, path: [0, 0] };

    assert.throws(
      () =>
        createEditor({
          extensions: [selectionMarksSchema],
          initialSelection: SelectionApi.text(
            { anchor: point, focus: point },
            { marks: { mystery: true } }
          ),
          initialValue: {
            children: [{ children: [{ text: 'main' }], type: 'paragraph' }],
            roots: {
              header: [{ children: [{ text: 'header' }], type: 'paragraph' }],
            },
          },
        }),
      /unknown text property "mystery"/i
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [selectionMarksSchema],
          initialSelection: SelectionApi.text(
            { anchor: point, focus: point },
            { marks: { bold: 'yes' } }
          ),
          initialValue: {
            children: [{ children: [{ text: 'main' }], type: 'paragraph' }],
            roots: {
              header: [{ children: [{ text: 'header' }], type: 'paragraph' }],
            },
          },
        }),
      /text property "bold".*boolean/i
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [selectionMarksSchema],
          initialSelection: SelectionApi.text(
            {
              anchor: { ...point, root: 'header' },
              focus: { ...point, root: 'header' },
            },
            { marks: { bold: true } }
          ),
          initialValue: {
            children: [{ children: [{ text: 'main' }], type: 'paragraph' }],
            roots: {
              header: [{ children: [{ text: 'header' }], type: 'code' }],
            },
          },
        }),
      /text property "bold" cannot target editor element "code"/i
    );
  });

  it('keeps node selections out of the DOM range protocol', () => {
    const selection = SelectionApi.nodes([[1]]);
    const editor = createEditor({
      initialSelection: selection,
      initialValue,
    });

    assert.deepEqual(editor.read.selection(), range([1, 0], 0, [1, 0], 1));
    assert.equal(
      getSelectionDOMRange(editor, getEditorLiveSelection(editor)),
      null
    );
  });

  it('keeps exact empty-node membership separate from range expansion', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0]]),
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    assert.deepEqual(editor.read.selection(), range([0, 0], 0, [0, 0], 0));
    assert.equal(editor.read.selection.isCollapsed(), true);
    assert.equal(editor.read.selection.isExpanded(), false);
    assert.equal(editor.read.selection.nodes().length, 1);
  });

  it('canonicalizes and persists one or many node paths with one runtime shape', () => {
    const aggregate = range([0, 0], 0, [1, 0], 1);
    const selection = SelectionApi.nodes([[1], [0, 0], [0], [1]], {
      anchorPath: [1],
      focusPath: [0],
    });
    const editor = createEditor({
      initialSelection: selection,
      initialValue,
    });

    assert.deepEqual(selection.paths, [[0], [1]]);
    assert.deepEqual(selection.anchorPath, [1]);
    assert.deepEqual(selection.focusPath, [0]);
    assert.equal('path' in selection, false);
    assert.equal('anchor' in selection, false);
    assert.equal('focus' in selection, false);
    assert.deepEqual(SelectionApi.nodes([[1]]), {
      anchorPath: [1],
      focusPath: [1],
      kind: 'node',
      paths: [[1]],
    });
    assert.deepEqual(editor.read.selection(), range([1, 0], 1, [0, 0], 0));
    assert.equal(SelectionApi.root(selection), undefined);
    assert.equal(
      SelectionApi.root(SelectionApi.nodes([[1]], { root: 'header' })),
      'header'
    );
    assert.throws(
      () => SelectionApi.nodes([[1]], { root: 'main' as never }),
      /Omit root/
    );
    assert.throws(
      () =>
        SelectionApi.nodes([[0], [1]], {
          anchorPath: [2],
          focusPath: [1],
        }),
      /anchorPath must be an exact selected path/
    );
    assert.deepEqual(encodeEditorSelection(editor, selection), {
      kind: 'node',
      value: selection,
      version: 4,
    });
    assert.deepEqual(
      decodeEditorSelection(editor, {
        kind: 'node',
        value: { ...aggregate, kind: 'node', path: [1] },
        version: 1,
      }),
      SelectionApi.nodes([[1]])
    );
    assert.deepEqual(
      decodeEditorSelection(editor, {
        kind: 'node',
        value: { ...aggregate, kind: 'node', paths: [[1], [0]] },
        version: 2,
      }),
      SelectionApi.nodes([[0], [1]])
    );
    assert.deepEqual(
      decodeEditorSelection(editor, {
        kind: 'node',
        value: { kind: 'node', paths: [[1], [0]] },
        version: 3,
      }),
      SelectionApi.nodes([[0], [1]])
    );
    assert.throws(
      () =>
        decodeEditorSelection(editor, {
          kind: 'node',
          value: { ...aggregate, kind: 'node', paths: [[1], [0]] },
          version: 4,
        }),
      /Invalid node editor selection/
    );
  });

  it('projects, slices, and maps every selected node path', () => {
    const selection = SelectionApi.nodes([[0], [1]]);
    const editor = createEditor({
      initialSelection: selection,
      initialValue,
    });

    assert.deepEqual(editor.read.selection.ranges(), [
      range([0, 0], 0, [0, 0], 1),
      range([1, 0], 0, [1, 0], 1),
    ]);
    assert.deepEqual(
      editor.read.selection.nodes().map(([, path]) => path),
      [[0], [1]]
    );
    assert.equal(editor.read.selection.contains([0]), true);
    assert.equal(editor.read.selection.intersects([1]), true);
    assert.equal(editor.read.selection.isCollapsed(), false);
    assert.equal(editor.read.selection.isExpanded(), true);
    assert.equal(editor.read.selection.isWithinBlock(), false);
    assert.equal(editor.read.selection.isAcrossBlocks(), true);
    assert.equal(editor.read.selection.isAtBlockStart(), true);
    assert.equal(editor.read.selection.isAtBlockEnd(), true);
    assert.deepEqual(editor.read.slice.get(), {
      content: initialValue,
      openEnd: 0,
      openStart: 0,
    });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));

    const mapped = getEditorLiveSelection(editor);

    assert.equal(mapped?.kind, 'node');
    assert.deepEqual(
      mapped && SelectionApi.isNode(mapped) ? mapped.paths : [],
      [[0]]
    );
    assert.deepEqual(
      mapped && SelectionApi.isNode(mapped)
        ? [mapped.anchorPath, mapped.focusPath]
        : [],
      [[0], [0]]
    );
  });

  it('preserves backward node-selection direction when either edge is deleted', () => {
    const create = () =>
      createEditor({
        initialSelection: SelectionApi.nodes([[0], [1], [2]], {
          anchorPath: [2],
          focusPath: [0],
        }),
        initialValue: [
          initialValue[0],
          { children: [{ text: 'middle' }], type: 'paragraph' },
          initialValue[1],
        ],
      });
    const withoutFocus = create();
    const withoutAnchor = create();

    withoutFocus.update((tx) => tx.nodes.remove({ at: [0] }));
    withoutAnchor.update((tx) => tx.nodes.remove({ at: [2] }));

    assert.deepEqual(
      getEditorLiveSelection(withoutFocus),
      SelectionApi.nodes([[0], [1]], {
        anchorPath: [1],
        focusPath: [0],
      })
    );
    assert.deepEqual(
      getEditorLiveSelection(withoutAnchor),
      SelectionApi.nodes([[0], [1]], {
        anchorPath: [1],
        focusPath: [0],
      })
    );
  });

  it('uses exact node projections instead of the aggregate range for membership', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0], [2]]),
      initialValue: [
        initialValue[0],
        { children: [{ text: 'middle' }], type: 'paragraph' },
        initialValue[1],
      ],
    });

    assert.deepEqual(
      editor.read.selection.nodes().map(([, path]) => path),
      [[0], [2]]
    );
    assert.equal(editor.read.selection.contains([1]), false);
    assert.equal(editor.read.selection.intersects([1]), false);
    assert.equal(editor.read.selection.intersects([2]), true);
  });

  it('reads a node selection from its named root as one closed exact-owner slice', () => {
    const selection = SelectionApi.nodes([[0]], { root: 'header' });
    const header = {
      children: [{ text: 'header' }],
      type: 'paragraph' as const,
    };
    const editor = createEditor({
      extensions: [selectionMarksSchema],
      initialSelection: selection,
      initialValue: {
        children: [
          { children: [{ text: 'main' }], type: 'paragraph' as const },
        ],
        roots: { header: [header] },
      },
    });

    assert.deepEqual(editor.read.slice.get({ at: selection }), {
      content: [header],
      openEnd: 0,
      openStart: 0,
    });
  });

  it('publishes node selections as detached deeply immutable JSON trees', () => {
    const sharedPath = [0];
    const selection = {
      anchorPath: sharedPath,
      focusPath: [1],
      kind: 'node',
      paths: [sharedPath, [1]],
    } satisfies NodeSelection;
    const editor = createEditor({
      initialSelection: selection,
      initialValue,
    });
    const specEditor = createEditor({
      initialValue,
    });
    const spec = specEditor.read((state) =>
      state.transaction((tx) => tx.selection.set(selection))
    );

    sharedPath[0] = 9;

    const snapshotSelection = getSnapshot(editor).selection;
    const specSelection = spec.selection?.value;

    assert.ok(SelectionApi.isNode(snapshotSelection));
    assert.ok(SelectionApi.isNode(specSelection));
    assert.deepEqual(snapshotSelection.paths, [[0], [1]]);
    assert.deepEqual(snapshotSelection.anchorPath, [0]);
    assert.notEqual(snapshotSelection.anchorPath, snapshotSelection.paths[0]);
    assert.equal(Object.isFrozen(snapshotSelection), true);
    assert.equal(Object.isFrozen(snapshotSelection.paths), true);
    assert.equal(Object.isFrozen(snapshotSelection.paths[0]), true);
    assert.equal(Object.isFrozen(snapshotSelection.anchorPath), true);
    assert.equal(Object.isFrozen(specSelection), true);
    assert.equal(Object.isFrozen(specSelection.focusPath), true);
    assert.equal(Reflect.set(specSelection.focusPath, 0, 9), false);
  });

  it('replaces a node selection when setting a plain range', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0], [1]]),
      initialValue,
    });
    const next = range([1, 0], 1, [1, 0], 1);

    editor.update((tx) => tx.selection.set(next));

    assert.deepEqual(editor.read.selection(), next);
  });

  it('maps directional node selection when replaceChildren reuses selected nodes', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0], [1]], {
        anchorPath: [1],
        focusPath: [0],
      }),
      initialValue,
    });
    const children = editor.read.children();

    editor.update.nodes.replaceChildren(
      [{ children: [{ text: 'prefix' }], type: 'paragraph' }, ...children],
      { at: [] }
    );

    assert.deepEqual(editor.read.selection(), range([2, 0], 1, [1, 0], 0));
    assert.deepEqual(
      getEditorLiveSelection(editor),
      SelectionApi.nodes([[1], [2]], {
        anchorPath: [2],
        focusPath: [1],
      })
    );
  });

  it('validates built-in selections against the current document', () => {
    const editor = createEditor({ initialValue });

    assert.equal(editor.read.selection.isValid(null), true);
    assert.equal(
      editor.read.selection.isValid(
        SelectionApi.text(range([0, 0], 0, [1, 0], 1))
      ),
      true
    );
    assert.equal(
      editor.read.selection.isValid(SelectionApi.nodes([[0], [1]])),
      true
    );
    assert.equal(
      editor.read.selection.isValid({
        kind: 'node',
        paths: [[0], [1]],
      }),
      false
    );
    assert.equal(
      editor.read.selection.isValid({
        ...SelectionApi.nodes([[0], [1]]),
        focusPath: [9],
      }),
      false
    );
    assert.equal(editor.read.selection.isValid({ kind: 'cell' }), false);
  });

  it('strictly validates built-in selection shapes and versions', () => {
    const editor = createEditor({ initialValue });
    const point = { offset: 0, path: [0, 0] };

    assert.throws(() => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: point,
          focus: point,
          goalColumn: 4,
          kind: 'text',
        } as never);
      });
    }, /Invalid text editor selection/);
    assert.throws(() => {
      editor.update((tx) => {
        tx.selection.set({
          ...range([0, 0], 0, [0, 0], 1),
          kind: 'text',
          marks: { bold: true },
        } as never);
      });
    }, /Invalid text editor selection/);
    assert.throws(() => {
      editor.update((tx) => {
        tx.selection.set({
          kind: 'node',
          paths: [[0]],
        } as never);
      });
    }, /Invalid node editor selection/);
    assert.throws(() => {
      editor.update((tx) => {
        tx.selection.set({
          ...SelectionApi.nodes([[0]]),
          marks: { bold: true },
        } as never);
      });
    }, /Only collapsed text selections can carry insertion marks/);

    const encoded = encodeEditorSelection(editor, SelectionApi.nodes([[0]]));

    assert.ok(encoded);
    assert.throws(
      () =>
        decodeEditorSelection(editor, {
          ...encoded,
          version: encoded.version + 1,
        }),
      /Unsupported editor selection "node" version/
    );
  });

  it('rejects stale paths, offsets, and roots at every selection boundary', () => {
    const editor = createEditor({ initialValue });

    for (const invalid of [
      range([9, 0], 0, [9, 0], 0),
      range([0, 0], 2, [0, 0], 2),
      {
        anchor: { offset: 0, path: [0, 0], root: 'missing' },
        focus: { offset: 0, path: [0, 0], root: 'missing' },
      },
    ]) {
      assert.throws(
        () => editor.update((tx) => tx.selection.set(invalid)),
        /points outside document root/
      );
    }
  });

  it('lets an explicit transform association override visual affinity', () => {
    const create = (affinity: 'backward' | 'forward', expanded = false) =>
      createEditor({
        initialSelection: SelectionApi.text(
          range([0, 0], expanded ? 0 : 1, [0, 0], 1),
          { affinity }
        ),
        initialValue: [{ children: [{ text: 'ab' }], type: 'paragraph' }],
      });

    const backward = create('backward');
    const forward = create('forward');
    const expandedForward = create('forward', true);

    for (const editor of [backward, forward, expandedForward]) {
      editor.update((tx) =>
        tx.text.insert('x', { at: { offset: 1, path: [0, 0] } })
      );
    }

    const backwardSelection = backward.read.selection();
    const forwardSelection = forward.read.selection();
    const expandedSelection = expandedForward.read.selection();

    assert.ok(backwardSelection);
    assert.ok(forwardSelection);
    assert.ok(expandedSelection);
    assert.equal(backwardSelection.focus.offset, 2);
    assert.equal(backwardSelection.anchor.offset, 2);
    assert.equal(forwardSelection.focus.offset, 2);
    assert.equal(forwardSelection.anchor.offset, 2);
    assert.equal(expandedSelection.anchor.offset, 0);
    assert.equal(expandedSelection.focus.offset, 2);
  });

  it('stores pending insertion marks only on collapsed text selections', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.text(range([0, 0], 1, [0, 0], 1)),
      initialValue,
    });

    editor.update((tx) => tx.marks.set({ bold: true }));
    assert.deepEqual(editor.read.marks(), { bold: true });
    assert.deepEqual(editor.read.selection(), range([0, 0], 1, [0, 0], 1));
    assert.deepEqual(getEditorLiveSelection(editor), {
      ...SelectionApi.text(range([0, 0], 1, [0, 0], 1)),
      marks: { bold: true },
    });
    assert.equal('marks' in getSnapshot(editor), false);

    editor.update((tx) =>
      tx.selection.set(SelectionApi.text(range([0, 0], 0, [0, 0], 0)))
    );
    assert.deepEqual(editor.read.selection(), range([0, 0], 0, [0, 0], 0));

    editor.update((tx) =>
      tx.selection.set(SelectionApi.text(range([0, 0], 0, [0, 0], 1)))
    );
    assert.throws(
      () => editor.update((tx) => tx.marks.set({ italic: true })),
      /Pending insertion marks require a collapsed text selection/
    );
  });
});
