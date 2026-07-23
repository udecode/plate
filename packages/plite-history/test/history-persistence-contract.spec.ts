import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  defineEffect,
  defineEditorExtension,
  defineEditorSchema,
  defineExtensionSlot,
  defineStateField,
  defineValueCodec,
  DocumentChange,
  type Element,
  type Range,
  schema,
  SelectionApi,
  valueCodecs,
} from '@platejs/plite';
import { initializeEditorExtensions } from '@platejs/plite/internal';

import { History, history } from '../src';
import { encodeHistoryValue } from '../src/history-codec';

type CellSelection = Range &
  Readonly<{
    cells: readonly Range[];
    kind: 'cell';
  }>;

declare module '@platejs/plite' {
  interface EditorSelectionKindMap {
    cell: CellSelection;
  }
}

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const editorSchema = ({
  id = 'article',
  isolating = false,
  version = 1,
}: {
  id?: string;
  isolating?: boolean;
  version?: number;
} = {}) =>
  defineEditorSchema({
    elements: {
      paragraph: {
        content: schema.content.text(),
        isolating,
      },
    },
    id,
    root: {
      content: schema.content.type('paragraph', { min: 1 }),
    },
    unknown: 'reject',
    version,
  });

const title = defineStateField({
  key: 'document.title',
  collab: 'shared',
  history: 'push',
  initial: () => 'Untitled',
  persist: valueCodecs.string,
});

const range = (start: number, end = start): Range => ({
  anchor: { offset: start, path: [0, 0] },
  focus: { offset: end, path: [0, 0] },
});

const cellSelectionCodec = defineValueCodec<CellSelection>({
  decode(value) {
    if (
      !SelectionApi.isSelection(value) ||
      value.kind !== 'cell' ||
      !Array.isArray((value as CellSelection).cells)
    ) {
      throw new Error('Invalid cell selection.');
    }

    return value as CellSelection;
  },
  encode: (value) => value,
  version: 1,
});

const cellSelectionExtension = defineEditorExtension({
  name: 'cell-selection-persistence',
  selections: [
    {
      codec: cellSelectionCodec,
      kind: 'cell',
      map(selection, context) {
        const mapped = context.mapRange(selection);

        return mapped ? { ...selection, ...mapped } : null;
      },
      validate(selection) {
        return Array.isArray(selection.cells) && selection.cells.length > 0;
      },
    },
  ],
});

const createStateEditor = (
  initialValue: Parameters<typeof createEditor>[0]['initialValue']
) =>
  createEditor({
    extensions: [history(), title, cellSelectionExtension] as const,
    initialValue,
  });

const undo = (editor: ReturnType<typeof createStateEditor>) => {
  editor.update((tx) => tx.history.undo());
};

const redo = (editor: ReturnType<typeof createStateEditor>) => {
  editor.update((tx) => tx.history.redo());
};

describe('versioned history persistence', () => {
  it('embeds the exact schema identity in version 4 JSON', () => {
    const raw = createStateEditor([paragraph('body')]);
    const declared = createEditor({
      extensions: [history(), editorSchema()] as const,
      initialValue: [paragraph('body')],
    });

    assert.deepEqual(History.toJSON(raw), {
      redos: [],
      schema: raw.read.schema.identity(),
      undos: [],
      version: 4,
    });
    assert.deepEqual(
      History.toJSON(declared).schema,
      declared.read.schema.identity()
    );
  });

  it('adopts a final bootstrap schema before the first user commit', () => {
    const editor = createEditor({
      extensions: [history()] as const,
      initialValue: [paragraph('body')],
    });
    const provisionalSchema = editor.read.history().schema;

    initializeEditorExtensions(editor, [history(), editorSchema()]);

    assert.notDeepEqual(editor.read.schema.identity(), provisionalSchema);
    assert.deepEqual(
      editor.read.history().schema,
      editor.read.schema.identity()
    );

    editor.update((tx) => tx.text.insert('!', { at: range(4).anchor }));

    assert.equal(editor.read.history().undos.length, 1);
  });

  it('keeps persisted schema identity exact and free of live fields', () => {
    const editor = createEditor({
      extensions: [history(), editorSchema()] as const,
      initialValue: [paragraph('body')],
    });
    const encoded = History.toJSON(editor);
    const liveValidator = () => true;
    const pollutedIdentity = {
      ...encoded.schema!,
      validator: liveValidator,
    };

    assert.throws(
      () =>
        History.fromJSON(editor, {
          ...encoded,
          schema: pollutedIdentity,
        }),
      /Invalid history JSON/
    );
    assert.equal(
      History.isHistory({
        ...editor.read.history(),
        schema: pollutedIdentity,
      }),
      false
    );
    assert.throws(
      () =>
        encodeHistoryValue(editor, {
          ...editor.read.history(),
          schema: pollutedIdentity,
        } as never),
      /Invalid history schema identity/
    );

    let accessorReads = 0;
    const accessorIdentity = Object.defineProperties(
      {},
      {
        fingerprint: {
          enumerable: true,
          get: () => {
            accessorReads++;

            return encoded.schema!.fingerprint;
          },
        },
        id: { enumerable: true, value: encoded.schema!.id },
        version: { enumerable: true, value: encoded.schema!.version },
      }
    );

    assert.throws(
      () => History.fromJSON(editor, { ...encoded, schema: accessorIdentity }),
      /Invalid history JSON/
    );
    assert.equal(accessorReads, 0);
  });

  it('rejects schema mismatches before decoding any history batch', () => {
    const source = createEditor({
      extensions: [history(), editorSchema()] as const,
      initialValue: [paragraph('body')],
    });

    source.update((tx) => tx.text.insert('!', { at: range(4).anchor }));

    const json = structuredClone(History.toJSON(source));
    const batch = json.undos[0];

    assert(batch);
    (batch.effects as unknown[]).push({ key: 'must-not-decode' });

    const changedWithoutVersion = createEditor({
      extensions: [history(), editorSchema({ isolating: true })] as const,
      initialValue: source.read.value(),
    });

    assert.throws(
      () => History.fromJSON(changedWithoutVersion, json),
      /schema semantics changed without a version bump/i
    );

    const changedVersion = createEditor({
      extensions: [history(), editorSchema({ version: 2 })] as const,
      initialValue: source.read.value(),
    });

    assert.throws(
      () => History.fromJSON(changedVersion, json),
      /history uses schema "article" version 1, but the editor uses schema "article" version 2/i
    );
  });

  it('persists one slice replacement as one canonical undo and redo batch', () => {
    const editor = createStateEditor([paragraph('body')]);

    editor.update((tx) => {
      tx.selection.set(SelectionApi.text(range(4)));
      tx.fragment.replace([{ text: '!' }]);
    });

    const afterInsert = editor.read.history();
    const [undoBatch] = afterInsert.undos;

    assert.equal(afterInsert.undos.length, 1);
    assert.equal(afterInsert.redos.length, 0);
    assert(undoBatch?.change instanceof DocumentChange);

    const encoded = History.toJSON(editor);
    const encodedChange = encoded.undos[0]?.change;

    assert(encodedChange);
    assert.deepEqual(encodedChange, undoBatch.change.toJSON());
    assert.deepEqual(
      DocumentChange.fromJSON(encodedChange).toJSON(),
      encodedChange
    );
    assert.doesNotMatch(JSON.stringify(encodedChange), /"open(?:End|Start)"/);

    undo(editor);
    assert.equal(editor.read.text.string([]), 'body');
    assert.equal(editor.read.history().undos.length, 0);
    assert.equal(editor.read.history().redos.length, 1);

    redo(editor);
    assert.equal(editor.read.text.string([]), 'body!');
    assert.equal(editor.read.history().undos.length, 1);
    assert.equal(editor.read.history().redos.length, 0);
  });

  it('publishes migration once and atomically resets incompatible history', () => {
    const slot = defineExtensionSlot('history-schema');
    const schemaWithBlock = (version: number, type: string) =>
      defineEditorSchema({
        elements: {
          [type]: { content: schema.content.text() },
        },
        id: 'history-schema',
        root: {
          content: schema.content.type(type, { min: 1 }),
        },
        unknown: 'reject',
        version,
      });
    const editor = createEditor({
      extensions: [
        history(),
        slot.of(schemaWithBlock(1, 'paragraph')),
      ] as const,
      initialValue: [paragraph('body')],
    });

    editor.update((tx) => {
      tx.history.newBatch();
      tx.text.insert('1', { at: range(4).anchor });
    });
    editor.update((tx) => {
      tx.history.newBatch();
      tx.text.insert('2', { at: range(5).anchor });
    });
    undo(editor);

    const before = editor.read.history();
    const migrationCommits: number[] = [];

    assert.equal(before.undos.length, 1);
    assert.equal(before.redos.length, 1);

    editor.subscribeCommit((commit) => migrationCommits.push(commit.version));
    editor.update((tx) => {
      tx.extensions.reconfigure(slot, schemaWithBlock(2, 'heading'), {
        migrate: ({ document }) => ({
          ...document,
          children: document.children.map((node) => ({
            ...node,
            type: 'heading',
          })),
        }),
      });
      tx.text.insert('?', { at: range(5).anchor });
    });

    const after = editor.read.history();

    assert.equal(editor.read.text.string([]), 'body1?');
    assert.equal(editor.read.children()[0]?.type, 'heading');
    assert.equal(migrationCommits.length, 1);
    assert.equal(
      editor.read.lastCommit()?.dirtyStateKeys.includes('$configuration'),
      true
    );
    assert.equal(after.revision, before.revision + 1);
    assert.deepEqual(after.undos, []);
    assert.deepEqual(after.redos, []);
    assert.deepEqual(after.schema, editor.read.schema.identity());

    undo(editor);
    assert.equal(editor.read.text.string([]), 'body1?');
    assert.equal(editor.read.children()[0]?.type, 'heading');
  });

  it('does not save a schema commit that reactivates history', () => {
    const slot = defineExtensionSlot('reactivated-history-schema');
    const editor = createEditor({
      extensions: [slot.of([history(), editorSchema()])] as const,
      initialValue: [paragraph('body')],
    });

    editor.update((tx) => tx.text.insert('!', { at: range(4).anchor }));
    assert.equal(editor.read.history().undos.length, 1);

    editor.update((tx) => {
      tx.extensions.reconfigure(slot, [
        history({ maxDepth: 101 }),
        editorSchema({ version: 2 }),
      ]);
      tx.text.insert('?', { at: range(5).anchor });
    });

    assert.deepEqual(
      editor.read.history().schema,
      editor.read.schema.identity()
    );
    assert.equal(editor.read.history().undos.length, 0);

    editor.update((tx) => tx.text.insert('.', { at: range(6).anchor }));

    assert.equal(editor.read.history().undos.length, 1);
  });

  it('does not restore a decoded history after its live schema changes', () => {
    const slot = defineExtensionSlot('delayed-history-schema');
    const editor = createEditor({
      extensions: [history(), slot.of(editorSchema())] as const,
      initialValue: [paragraph('body')],
    });

    editor.update((tx) => tx.text.insert('!', { at: range(4).anchor }));
    const decoded = History.fromJSON(editor, History.toJSON(editor));

    editor.update((tx) => {
      tx.extensions.reconfigure(slot, editorSchema({ isolating: true }));
    });

    assert.throws(
      () => editor.update((tx) => tx.history.restore(decoded)),
      /schema semantics changed without a version bump/i
    );
  });

  it('preserves undoable edits across equivalent schema reconfiguration', () => {
    const slot = defineExtensionSlot('equivalent-history-schema');
    const editor = createEditor({
      extensions: [history(), slot.of(editorSchema())] as const,
      initialValue: [paragraph('body')],
    });

    editor.update((tx) => tx.text.insert('!', { at: range(4).anchor }));
    editor.update((tx) => {
      tx.extensions.reconfigure(slot, editorSchema());
      tx.text.insert('remote-', { at: range(0).anchor });
    });

    assert.equal(editor.read.history().undos.length, 2);

    undo(editor);
    assert.equal(editor.read.text.string([]), 'body!');
    undo(editor);
    assert.equal(editor.read.text.string([]), 'body');
  });

  it('round-trips canonical changes, state effects, and custom selections', () => {
    const selection: CellSelection = {
      ...range(1),
      cells: [range(0, 2)],
      kind: 'cell',
    };
    const source = createEditor({
      extensions: [history(), title, cellSelectionExtension] as const,
      initialSelection: selection,
      initialValue: {
        children: [paragraph('body')],
        meta: { [title.key]: title.serialize('Q2') },
      },
    });

    source.update((tx) => {
      tx.nodes.set({ persisted: true }, { at: [0] });
      tx.setField(title, 'Q3');
    });

    const json = JSON.parse(JSON.stringify(History.toJSON(source)));
    const restored = createStateEditor(source.read.value());

    const decoded = History.fromJSON(restored, json);

    restored.update((tx) => tx.history.restore(decoded));
    assert.equal(History.isHistory(restored.read.history()), true);

    undo(restored);
    assert.equal(restored.read.text.string([]), 'body');
    assert.equal(restored.read.getField(title), 'Q2');
    assert.equal(restored.read.selection()?.kind, 'cell');

    redo(restored);
    assert.deepEqual(restored.read.value().children, [
      { ...paragraph('body'), persisted: true },
    ]);
    assert.equal(restored.read.getField(title), 'Q3');
  });

  it('rebases restored canonical history across a remote change', () => {
    const source = createStateEditor([paragraph('body')]);

    source.update((tx) => tx.text.insert('local', { at: range(4).anchor }));

    const restored = createStateEditor(source.read.value());

    restored.update((tx) =>
      tx.history.restore(History.fromJSON(restored, History.toJSON(source)))
    );
    restored.update({ tags: ['collaboration', 'history-skip'] }, (tx) => {
      tx.text.insert('remote-', { at: range(0).anchor });
    });
    undo(restored);

    assert.equal(restored.read.text.string([]), 'remote-body');
  });

  it('round-trips pending insertion marks through selection history', () => {
    const source = createEditor({
      extensions: [history()] as const,
      initialSelection: SelectionApi.text(range(2)),
      initialValue: [paragraph('body')],
    });

    source.update((tx) => tx.marks.set({ bold: true }));
    source.update((tx) => tx.text.insert('!', { at: range(2).anchor }));

    const json = JSON.parse(JSON.stringify(History.toJSON(source)));
    const restored = createEditor({
      extensions: [history()] as const,
      initialSelection: source.read.selection(),
      initialValue: source.read.value(),
    });

    restored.update((tx) =>
      tx.history.restore(History.fromJSON(restored, json))
    );
    restored.update((tx) => tx.history.undo());
    assert.deepEqual(restored.read.marks(), { bold: true });
    assert.deepEqual(restored.read.selection(), {
      ...SelectionApi.text(range(2)),
      marks: { bold: true },
    });

    restored.update((tx) => tx.history.redo());
    assert.deepEqual(restored.read.marks(), { bold: true });
    assert.deepEqual(restored.read.selection(), {
      ...SelectionApi.text(range(3)),
      marks: { bold: true },
    });
  });

  it('round-trips rootless selections owned by a named root', () => {
    const source = createEditorRuntime({
      extensions: [history()] as const,
      initialValue: {
        children: [paragraph('x')],
        roots: { header: [paragraph('header')] },
      },
    });
    const sourceHeader = createEditorView(source, { root: 'header' });

    sourceHeader.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      });
    });
    sourceHeader.update((tx) => {
      tx.text.insert('!');
    });

    const restored = createEditorRuntime({
      extensions: [history()] as const,
      initialValue: source.read.value(),
    });
    const restoredHeader = createEditorView(restored, { root: 'header' });
    const decoded = History.fromJSON(
      restored.editor,
      History.toJSON(source.editor)
    );

    restored.update((tx) => tx.history.restore(decoded));
    restoredHeader.update((tx) => tx.history.undo());

    assert.equal(restoredHeader.read.text.string([]), 'header');
    assert.deepEqual(restoredHeader.read.selection(), {
      kind: 'text',
      anchor: { offset: 6, path: [0, 0], root: 'header' },
      focus: { offset: 6, path: [0, 0], root: 'header' },
    });
  });

  it('omits the primary root from history JSON and rejects explicit sentinels', () => {
    const source = createEditor({
      extensions: [history()] as const,
      initialSelection: SelectionApi.text(range(2)),
      initialValue: [paragraph('body')],
    });

    source.update((tx) => tx.text.insert('!'));

    const json = structuredClone(History.toJSON(source));
    const batch = json.undos[0];

    assert(batch);
    assert.equal(Object.hasOwn(batch, 'selectionAfterRoot'), false);
    assert.equal(Object.hasOwn(batch, 'selectionBeforeRoot'), false);

    const explicitBatchRoot = structuredClone(json);

    (
      explicitBatchRoot.undos[0] as {
        selectionAfterRoot?: string;
      }
    ).selectionAfterRoot = 'main';
    assert.throws(
      () => History.fromJSON(source, explicitBatchRoot),
      /Invalid history batch JSON/
    );

    const explicitPointRoot = structuredClone(json);
    const selectionAfter = explicitPointRoot.undos[0]!.selectionAfter;

    assert(selectionAfter);
    (
      selectionAfter.value as {
        anchor: { root?: string };
      }
    ).anchor.root = 'main';
    assert.throws(
      () => History.fromJSON(source, explicitPointRoot),
      /Invalid history batch JSON/
    );

    const decoded = History.fromJSON(source, json);

    assert.equal(
      History.isHistory({
        ...decoded,
        undos: [
          {
            ...decoded.undos[0]!,
            selectionAfterRoot: 'main',
          },
        ],
      }),
      false
    );
  });

  it('rejects an invalid intermediate document under a closed schema', () => {
    const source = createEditor({
      extensions: [history()] as const,
      initialValue: [paragraph('body')],
    });

    source.update((tx) => tx.nodes.set({ undeclared: true }, { at: [0] }));
    source.update((tx) => tx.history.undo());

    const closedParagraph = defineEditorSchema({
      elements: {
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      id: 'closed-history-paragraph',
      root: {
        content: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      unknown: 'reject',
      version: 1,
    });
    const restored = createEditor({
      extensions: [history(), closedParagraph] as const,
      initialValue: source.read.value(),
    });

    const encoded = History.toJSON(source);

    assert.throws(
      () =>
        History.fromJSON(restored, {
          ...encoded,
          schema: restored.read.schema.identity(),
        }),
      /unknown element property "undeclared"/i
    );
  });

  it('round-trips registered domain effects', () => {
    const increment = defineEffect<number>({
      codec: valueCodecs.number,
      invert: (value) => -value,
      key: 'counter.increment',
    });
    const counter = defineStateField({
      key: 'counter',
      initial: () => 0,
      persist: valueCodecs.number,
      reduce: (value, effect) =>
        effect.type === increment ? value + effect.value : value,
    });
    const incrementExtension = defineEditorExtension({
      effects: [increment],
      name: 'counter-increment-effect',
    });
    const createCounterEditor = (
      initialValue: Parameters<typeof createEditor>[0]['initialValue']
    ) =>
      createEditor({
        extensions: [history(), counter, incrementExtension] as const,
        initialValue,
      });
    const source = createCounterEditor([paragraph('body')]);

    source.update((tx) => tx.effects.emit(increment, 2));

    const restored = createCounterEditor(source.read.value());

    restored.update((tx) =>
      tx.history.restore(History.fromJSON(restored, History.toJSON(source)))
    );
    restored.update((tx) => tx.history.undo());
    assert.equal(restored.read.getField(counter), 0);
    restored.update((tx) => tx.history.redo());
    assert.equal(restored.read.getField(counter), 2);
  });

  it('rejects old and unversioned history, unknown effects, and stale field data', () => {
    const editor = createStateEditor([paragraph('body')]);

    assert.throws(
      () =>
        History.fromJSON(editor, {
          redos: [],
          schema: null,
          undos: [],
          version: 2,
        }),
      /unsupported history version/i
    );
    assert.throws(
      () =>
        History.fromJSON(editor, {
          redos: [],
          schema: null,
          undos: [],
          version: 3,
        }),
      /unsupported history version/i
    );
    assert.throws(
      () => History.fromJSON(editor, { redos: [], schema: null, undos: [] }),
      /unsupported history version/i
    );
    assert.throws(
      () =>
        createStateEditor({
          children: [paragraph('body')],
          meta: { [title.key]: { value: 'Q2', version: 2 } },
        }),
      /Unsupported state field "document.title" version 2/
    );

    editor.update((tx) => tx.setField(title, 'Q3'));
    const json = structuredClone(History.toJSON(editor));
    const effect = json.undos[0]?.effects[0];

    assert(effect);
    (effect as { key: string }).key = 'missing.effect';
    assert.throws(
      () => History.fromJSON(editor, json),
      /Cannot decode history effect "missing.effect"/
    );
  });

  it('rejects history encoded by a stale installed effect descriptor', () => {
    const incrementV1 = defineEffect<number>({
      codec: valueCodecs.number,
      key: 'counter.stale-increment',
    });
    const incrementV2 = defineEffect<number>({
      codec: defineValueCodec({
        decode(value) {
          if (typeof value !== 'number') {
            throw new Error('Expected a numeric increment.');
          }

          return value;
        },
        encode: (value) => value,
        version: 2,
      }),
      key: incrementV1.key,
    });
    const source = createEditor({
      extensions: [
        history(),
        defineEditorExtension({
          effects: [incrementV1],
          name: 'counter-effect-v1',
        }),
      ],
    });

    source.update((tx) => tx.effects.emit(incrementV1, 1));

    const restored = createEditor({
      extensions: [
        history(),
        defineEditorExtension({
          effects: [incrementV2],
          name: 'counter-effect-v2',
        }),
      ],
    });

    assert.throws(
      () => History.fromJSON(restored, History.toJSON(source)),
      /Unsupported editor effect "counter.stale-increment" version 1; expected 2/
    );
  });
});
