import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  decodeEditorSelection,
  encodeEditorSelection,
  getChildren as editorGetChildren,
  getSnapshot,
} from '@platejs/plite/internal';

import {
  createEditor,
  defineExtension,
  defineEditorSchema,
  defineValueCodec,
  type Editor,
  type EditorSelectionSpec,
  type EditorStateView,
  type EditorUpdateTransaction,
  property,
  type Range,
  schema,
  SelectionApi,
  target,
  type Value,
} from '@platejs/plite';

type CellSelection = Range &
  Readonly<{
    cells: readonly Range[];
    kind: 'cell';
  }>;

type ShallowCellSelection = Range & Readonly<{ kind: 'cell' }>;

type ShallowCellSelectionExtensions = readonly [
  Readonly<{
    name: 'shallow-cell-selection';
    selectionKinds: ShallowCellSelection;
  }>,
];

const range = (
  anchorPath: number[],
  anchorOffset: number,
  focusPath: number[],
  focusOffset: number
): Range => ({
  anchor: { offset: anchorOffset, path: anchorPath },
  focus: { offset: focusOffset, path: focusPath },
});

const cellSelection = (): CellSelection => ({
  ...range([0, 0], 0, [1, 0], 1),
  cells: [range([0, 0], 0, [0, 0], 1), range([1, 0], 0, [1, 0], 1)],
  kind: 'cell',
});

const isCellSelection = (selection: unknown): selection is CellSelection =>
  SelectionApi.isSelection(selection) &&
  selection.kind === 'cell' &&
  Object.keys(selection).every((key) =>
    ['anchor', 'cells', 'focus', 'kind'].includes(key)
  ) &&
  Array.isArray((selection as CellSelection).cells) &&
  (selection as CellSelection).cells.length > 0 &&
  (selection as CellSelection).cells.every(
    (cell) =>
      typeof cell === 'object' &&
      cell !== null &&
      SelectionApi.isSelection({ ...cell, kind: 'text' })
  );

const cellSelectionCodec = defineValueCodec<CellSelection>({
  decode(value) {
    if (!isCellSelection(value)) {
      throw new Error('Invalid cell selection.');
    }

    return value;
  },
  encode: (selection) => selection,
  version: 1,
});

const cellSelectionKinds = [
  {
    codec: cellSelectionCodec,
    primaryRange(selection) {
      return selection.cells[1] ?? null;
    },
    kind: 'cell',
    map(selection, context) {
      const primary = context.mapRange(selection, {
        association: 'outward',
      });
      const cells = selection.cells.flatMap((cell) => {
        const mapped = context.mapRange(cell, { association: 'outward' });

        return mapped ? [mapped] : [];
      });

      return primary && cells.length > 0
        ? { ...selection, ...primary, cells }
        : null;
    },
    ranges(selection) {
      return selection.cells;
    },
    replacementRange(selection) {
      return selection.cells[0] ?? null;
    },
    validate: isCellSelection,
  },
] satisfies readonly EditorSelectionSpec<CellSelection>[];

const cellSelectionExtension = defineExtension('cell-selection', {
  selectionKinds: cellSelectionKinds,
});

const conflictingCellSelectionExtension = defineExtension(
  'other-cell-selection',
  {
    selectionKinds: cellSelectionKinds,
  }
);

const dependentCellSelectionExtension = defineExtension('cell-consumer', {
  dependencies: [cellSelectionExtension],
});

type CellSelectionExtensions = readonly [typeof cellSelectionExtension];

const initialValue = [
  { children: [{ text: 'a' }], type: 'paragraph' },
  { children: [{ text: 'b' }], type: 'paragraph' },
];

const assertCellSelectionRequiresExtension = () => {
  const editor = createEditor({ initialValue });

  editor.update((tx) => {
    // @ts-expect-error The cell selection kind is not installed.
    tx.selection.set(cellSelection());
  });
  // @ts-expect-error Initial selections come from the installed extension tuple.
  createEditor({ initialSelection: cellSelection(), initialValue });

  editor.update(
    // @ts-expect-error A callback annotation cannot manufacture an uninstalled capability.
    (tx: EditorUpdateTransaction<Value, CellSelectionExtensions>) => {
      tx.selection.set(cellSelection());
    }
  );

  // @ts-expect-error A read callback cannot manufacture a richer transaction builder.
  editor.read((state: EditorStateView<Value, CellSelectionExtensions>) =>
    state.transaction((tx) => tx.selection.set(cellSelection()))
  );

  // @ts-expect-error Direct update selection exposes mutations, not state queries.
  editor.update.selection();
};

void assertCellSelectionRequiresExtension;

const assertSameKindSelectionPayloadIsInvariant = (
  editor: Editor<Value, CellSelectionExtensions>
) => {
  // @ts-expect-error Matching `kind` is insufficient when the payload shape differs.
  const shallowEditor: Editor<Value, ShallowCellSelectionExtensions> = editor;

  void shallowEditor;
};

void assertSameKindSelectionPayloadIsInvariant;

const assertBareEditorCapabilities = (editor: Editor) => {
  // @ts-expect-error Bare Editor annotations expose only core capabilities.
  editor.update.selection.set(cellSelection());
};

void assertBareEditorCapabilities;

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

describe('extensible selection protocol', () => {
  it('infers custom selections only from installed extension closure', () => {
    const editor = createEditor({
      extensions: [dependentCellSelectionExtension],
      initialSelection: cellSelection(),
      initialValue,
    });
    const selection = editor.read.selection();

    if (selection?.kind === 'cell') {
      const cells: readonly Range[] = selection.cells;

      assert.equal(cells.length, 2);
    }

    editor.update((tx) => tx.selection.set(cellSelection()));
  });

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

  it('projects and canonically maps an installed custom selection', () => {
    const editor = createEditor({
      extensions: [cellSelectionExtension],
      initialSelection: cellSelection(),
      initialValue,
    });

    assert.deepEqual(editor.read.selection.ranges(), cellSelection().cells);
    assert.deepEqual(
      editor.read.selection.replacementRange(),
      cellSelection().cells[0]
    );
    assert.deepEqual(
      editor.read.selection.primaryRange(),
      cellSelection().cells[1]
    );

    editor.update((tx) => {
      tx.text.insert('x', { at: { offset: 0, path: [0, 0] } });
    });

    const selection = editor.read.selection();

    assert.equal(selection?.kind, 'cell');
    assert.deepEqual(editor.read.selection.ranges(), [
      range([0, 0], 0, [0, 0], 2),
      range([1, 0], 0, [1, 0], 1),
    ]);
  });

  it('keeps node selections out of the DOM range protocol', () => {
    const point = { offset: 0, path: [1, 0] };
    const selection = SelectionApi.node([1], {
      anchor: point,
      focus: point,
    });
    const editor = createEditor({
      initialSelection: selection,
      initialValue,
    });

    assert.deepEqual(editor.read.selection(), selection);
    assert.equal(editor.read.selection.primaryRange(), null);
  });

  it('preserves an explicit null custom DOM range projection', () => {
    const selection = {
      ...cellSelection(),
      cells: [cellSelection().cells[0]!],
    };
    const editor = createEditor({
      extensions: [cellSelectionExtension],
      initialSelection: selection,
      initialValue,
    });

    assert.deepEqual(editor.read.selection(), selection);
    assert.equal(editor.read.selection.primaryRange(), null);
  });

  it('reads a node selection from its named root as one closed exact-owner slice', () => {
    const point = { offset: 0, path: [0, 0], root: 'header' };
    const selection = SelectionApi.node([0], {
      anchor: point,
      focus: point,
    });
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

  it('sets custom selections without collapsing them into text ranges', () => {
    const editor = createEditor({
      extensions: [cellSelectionExtension],
      initialValue,
    });
    const selection = cellSelection();

    editor.update((tx) => tx.selection.set(selection));

    assert.deepEqual(editor.read.selection(), selection);
  });

  it('publishes custom selections as detached deeply immutable JSON trees', () => {
    const sharedPath = [0, 0];
    const selection = {
      ...cellSelection(),
      cells: [
        {
          anchor: { offset: 0, path: sharedPath },
          focus: { offset: 1, path: sharedPath },
        },
        range([1, 0], 0, [1, 0], 1),
      ],
    } satisfies CellSelection;
    const editor = createEditor({
      extensions: [cellSelectionExtension],
      initialSelection: selection,
      initialValue,
    });
    const specEditor = createEditor({
      extensions: [cellSelectionExtension],
      initialValue,
    });
    const spec = specEditor.read((state) =>
      state.transaction((tx) => tx.selection.set(selection))
    );

    sharedPath[0] = 9;

    const snapshotSelection = getSnapshot(editor).selection as CellSelection;
    const specSelection = spec.selection?.value as CellSelection;

    assert.deepEqual(snapshotSelection.cells[0]?.anchor.path, [0, 0]);
    assert.notEqual(
      snapshotSelection.cells[0]?.anchor.path,
      snapshotSelection.cells[0]?.focus.path
    );
    assert.equal(Object.isFrozen(snapshotSelection), true);
    assert.equal(Object.isFrozen(snapshotSelection.cells), true);
    assert.equal(Object.isFrozen(snapshotSelection.cells[0]), true);
    assert.equal(
      Object.isFrozen(snapshotSelection.cells[0]?.anchor.path),
      true
    );
    assert.equal(Object.isFrozen(specSelection), true);
    assert.equal(Object.isFrozen(specSelection.cells[0]?.focus.path), true);
    assert.equal(Reflect.set(specSelection.cells[0]!.focus.path, 0, 9), false);
  });

  it('replaces a custom selection when setting a plain range', () => {
    const editor = createEditor({
      extensions: [cellSelectionExtension],
      initialSelection: cellSelection(),
      initialValue,
    });
    const next = range([1, 0], 1, [1, 0], 1);

    editor.update((tx) => tx.selection.set(next));

    assert.deepEqual(editor.read.selection(), SelectionApi.text(next));
  });

  it('maps every custom range when replaceChildren reuses selected nodes', () => {
    const editor = createEditor({
      extensions: [cellSelectionExtension],
      initialSelection: cellSelection(),
      initialValue,
    });
    const children = editorGetChildren(editor);

    editor.update.nodes.replaceChildren(
      [{ children: [{ text: 'prefix' }], type: 'paragraph' }, ...children],
      { at: [] }
    );

    assert.deepEqual(editor.read.selection(), {
      ...range([1, 0], 0, [2, 0], 1),
      cells: [range([1, 0], 0, [1, 0], 1), range([2, 0], 0, [2, 0], 1)],
      kind: 'cell',
    });
  });

  it('rejects unsupported and conflicting selection kinds', () => {
    const editor = createEditor({ initialValue });

    assert.throws(
      () => editor.update((tx) => tx.selection.set(cellSelection() as never)),
      /Unsupported editor selection kind "cell"/
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [
            cellSelectionExtension,
            conflictingCellSelectionExtension,
          ],
          initialValue,
        }),
      /conflicts with/
    );
  });

  it('strictly validates built-in and custom selection shapes and versions', () => {
    const editor = createEditor({
      extensions: [cellSelectionExtension],
      initialValue,
    });
    const point = { offset: 0, path: [0, 0] };

    assert.throws(
      () =>
        editor.update((tx) =>
          tx.selection.set({
            anchor: point,
            focus: point,
            goalColumn: 4,
            kind: 'text',
          } as never)
        ),
      /Invalid text editor selection/
    );
    assert.throws(
      () =>
        editor.update((tx) =>
          tx.selection.set({
            ...range([0, 0], 0, [0, 0], 1),
            kind: 'text',
            marks: { bold: true },
          } as never)
        ),
      /Invalid text editor selection/
    );
    assert.throws(
      () =>
        editor.update((tx) =>
          tx.selection.set({ ...cellSelection(), cells: [] } as never)
        ),
      /Invalid editor selection "cell" value/
    );
    for (const selection of [
      { ...cellSelection(), marks: { bold: true } },
      {
        ...SelectionApi.node([0], range([0, 0], 0, [0, 0], 0)),
        marks: { bold: true },
      },
    ]) {
      assert.throws(
        () => editor.update((tx) => tx.selection.set(selection as never)),
        /Only collapsed text selections can carry insertion marks/
      );
    }

    const encoded = encodeEditorSelection(editor, cellSelection());

    assert(encoded);
    assert.throws(
      () =>
        decodeEditorSelection(editor, {
          ...encoded,
          version: encoded.version + 1,
        }),
      /Unsupported editor selection "cell" version/
    );
  });

  it('rejects stale paths, offsets, and roots at every selection boundary', () => {
    const editor = createEditor({
      extensions: [cellSelectionExtension],
      initialValue,
    });

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

    assert.equal(backward.read.selection()?.focus.offset, 2);
    assert.equal(backward.read.selection()?.anchor.offset, 2);
    assert.equal(forward.read.selection()?.focus.offset, 2);
    assert.equal(forward.read.selection()?.anchor.offset, 2);
    assert.equal(expandedForward.read.selection()?.anchor.offset, 0);
    assert.equal(expandedForward.read.selection()?.focus.offset, 2);
  });

  it('stores pending insertion marks only on collapsed text selections', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.text(range([0, 0], 1, [0, 0], 1)),
      initialValue,
    });

    editor.update((tx) => tx.marks.set({ bold: true }));
    assert.deepEqual(editor.read.marks(), { bold: true });
    assert.deepEqual(editor.read.selection(), {
      ...SelectionApi.text(range([0, 0], 1, [0, 0], 1)),
      marks: { bold: true },
    });
    assert.equal('marks' in getSnapshot(editor), false);

    editor.update((tx) =>
      tx.selection.set(SelectionApi.text(range([0, 0], 0, [0, 0], 0)))
    );
    assert.deepEqual(
      editor.read.selection(),
      SelectionApi.text(range([0, 0], 0, [0, 0], 0))
    );

    editor.update((tx) =>
      tx.selection.set(SelectionApi.text(range([0, 0], 0, [0, 0], 1)))
    );
    assert.throws(
      () => editor.update((tx) => tx.marks.set({ italic: true })),
      /Pending insertion marks require a collapsed text selection/
    );
  });
});
