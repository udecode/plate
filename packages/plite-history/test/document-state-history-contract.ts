import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  type Anchor,
  type Descendant,
  defineEditorExtension,
  defineEffect,
  defineStateField,
  defineValueCodec,
  type Range,
  type Editor as EditorType,
  valueCodecs,
} from '@platejs/plite';
import {
  getLastCommit as editorGetLastCommit,
  string as editorString,
} from '@platejs/plite/internal';

import { history } from '../src';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

const optionalStringCodec = defineValueCodec<string | undefined>({
  decode(value) {
    if (value !== null && typeof value !== 'string') {
      throw new Error('Expected a nullable string.');
    }

    return value === null ? undefined : value;
  },
  encode: (value) => value ?? null,
  version: 1,
});

const undo = (editor: EditorType) => {
  editor.update((tx) => {
    tx.history.undo();
  });
};

const redo = (editor: EditorType) => {
  editor.update((tx) => {
    tx.history.redo();
  });
};

describe('document meta history contract', () => {
  it('undoes and redoes reducer effects without state-patch replay', () => {
    const increment = defineEffect<number>({
      invert: (value) => -value,
      key: 'counter.increment',
    });
    const counter = defineStateField({
      key: 'counter',
      initial: () => 0,
      reduce: (value, effect) =>
        effect.type === increment ? value + effect.value : value,
    });
    const incrementExtension = defineEditorExtension({
      effects: [increment],
      name: 'counter-increment-effect',
    });
    const editor = createEditor({
      extensions: [history(), counter, incrementExtension],
    });

    editor.update((tx) => {
      tx.effects.emit(increment, 3);
    });

    assert.equal(editor.read.getField(counter), 3);
    assert.deepEqual(
      editor.read((state) => state.history.undos()[0]?.effects),
      [{ type: increment, value: -3 }]
    );

    undo(editor);
    assert.equal(editor.read.getField(counter), 0);

    redo(editor);
    assert.equal(editor.read.getField(counter), 3);
  });

  it('keeps nested effect values immutable in history and replay commits', () => {
    type Payload = { nested: { count: number } };
    const replace = defineEffect<Payload>({
      invert: (value) => ({ nested: { count: -value.nested.count } }),
      key: 'counter.replace-nested',
    });
    const counter = defineStateField({
      key: 'nested-counter',
      initial: () => 0,
      reduce: (value, effect) =>
        effect.type === replace ? effect.value.nested.count : value,
    });
    const editor = createEditor({
      extensions: [
        history(),
        counter,
        defineEditorExtension({
          effects: [replace],
          name: 'nested-counter-effect',
        }),
      ] as const,
    });
    const input = { nested: { count: 3 } };

    editor.update((tx) => tx.effects.emit(replace, input));
    input.nested.count = 99;

    const stored = editor.read((state) => state.history.undos()[0]?.effects[0]);

    assert(stored);
    assert.equal(stored.value.nested.count, -3);
    assert.equal(Object.isFrozen(stored.value), true);
    assert.equal(Object.isFrozen(stored.value.nested), true);

    undo(editor);

    const replayed = editorGetLastCommit(editor)?.effects[0];

    assert(replayed);
    assert.equal(replayed.value.nested.count, -3);
    assert.equal(Object.isFrozen(replayed.value), true);
    assert.equal(Object.isFrozen(replayed.value.nested), true);
  });

  it('undoes and redoes state-only field commits as history batches', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      collab: 'shared',
      history: 'push',
      initial: () => 'Untitled',
      persist: valueCodecs.string,
    });
    const editor = createEditor({
      extensions: [history(), documentTitle],
      initialValue: {
        children: [paragraph('body')],
        meta: { [documentTitle.key]: documentTitle.serialize('Q2 Plan') },
      },
    });
    const readTitle = () =>
      editor.read((state) => state.getField(documentTitle));

    editor.update((tx) => {
      tx.setField(documentTitle, 'Q3 Plan');
    });

    assert.equal(readTitle(), 'Q3 Plan');
    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
    const [batch] = editor.read((state) => state.history.undos());

    assert.equal(batch.change.empty, true);
    assert.equal(batch.selectionBefore, null);
    assert.equal(batch.selectionAfter, null);
    assert.deepEqual(batch.effects, [
      {
        type: documentTitle.effect,
        value: { previousValue: 'Q3 Plan', value: 'Q2 Plan' },
      },
    ]);

    undo(editor);

    const undoCommit = editorGetLastCommit(editor);
    assert.equal(readTitle(), 'Q2 Plan');
    assert.deepEqual(undoCommit?.effects, [
      {
        type: documentTitle.effect,
        value: { previousValue: 'Q3 Plan', value: 'Q2 Plan' },
      },
    ]);
    assert.equal(undoCommit?.tags.includes('historic'), true);
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );
    assert.equal(
      editor.read((state) => state.history.redos().length),
      1
    );

    redo(editor);

    const redoCommit = editorGetLastCommit(editor);
    assert.equal(readTitle(), 'Q3 Plan');
    assert.deepEqual(redoCommit?.effects, [
      {
        type: documentTitle.effect,
        value: { previousValue: 'Q2 Plan', value: 'Q3 Plan' },
      },
    ]);
    assert.equal(redoCommit?.tags.includes('historic'), true);
    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
    assert.equal(
      editor.read((state) => state.history.redos().length),
      0
    );
  });

  it('merges explicit batches that update document state', () => {
    const streamState = defineStateField({
      key: 'document.stream-state',
      history: 'push',
      initial: () => 'idle',
      persist: valueCodecs.string,
    });
    const editor = createEditor({
      extensions: [history(), streamState],
      initialValue: [paragraph('body')],
    });
    const readStreamState = () =>
      editor.read((state) => state.getField(streamState));

    editor.update((tx) => {
      tx.history.newBatch();
      tx.setField(streamState, 'streaming');
      tx.nodes.insert(paragraph('first'), { at: [1] });
    });
    editor.update((tx) => {
      tx.history.merge();
      tx.setField(streamState, 'done');
      tx.nodes.insert(paragraph('second'), { at: [2] });
    });

    assert.equal(
      editor.read((state) => state.history.undos().length),
      1
    );
    assert.deepEqual(
      editor.read((state) => state.history.undos()[0]?.effects),
      [
        {
          type: streamState.effect,
          value: { previousValue: 'done', value: 'streaming' },
        },
        {
          type: streamState.effect,
          value: { previousValue: 'streaming', value: 'idle' },
        },
      ]
    );

    undo(editor);

    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body')],
        meta: { [streamState.key]: streamState.serialize('idle') },
      }
    );
    assert.equal(readStreamState(), 'idle');

    redo(editor);

    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body'), paragraph('first'), paragraph('second')],
        meta: { [streamState.key]: streamState.serialize('done') },
      }
    );
    assert.equal(readStreamState(), 'done');
  });

  it('does not save history-skip state field commits', () => {
    const localPanel = defineStateField({
      key: 'local.panel',
      history: 'skip',
      initial: () => 'closed',
    });
    const editor = createEditor({
      extensions: [history(), localPanel],
      initialValue: [paragraph('body')],
    });
    const readPanel = () => editor.read((state) => state.getField(localPanel));

    editor.update((tx) => {
      tx.setField(localPanel, 'open');
    });

    assert.equal(readPanel(), 'open');
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );

    undo(editor);

    assert.equal(readPanel(), 'open');
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );
    assert.equal(
      editor.read((state) => state.history.redos().length),
      0
    );
  });

  it('keeps controlled preview state out of history until accepted', () => {
    const previewReplacement = defineStateField<string | null>({
      key: 'local.preview.replacement',
      history: 'skip',
      initial: () => null,
    });
    const editor = createEditor({
      extensions: [history(), previewReplacement],
      initialValue: [paragraph('Original body')],
    });
    const readPreview = () =>
      editor.read((state) => state.getField(previewReplacement));
    const readText = () => editorString(editor, [0]);

    editor.update((tx) => {
      tx.setField(previewReplacement, 'Draft body');
    });

    assert.equal(readPreview(), 'Draft body');
    assert.equal(readText(), 'Original body');
    assert.deepEqual(
      editor.read((state) => state.value()),
      { children: [paragraph('Original body')] }
    );
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );

    editor.update((tx) => {
      tx.setField(previewReplacement, null);
    });

    assert.equal(readPreview(), null);
    assert.equal(readText(), 'Original body');
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );

    editor.update((tx) => {
      tx.setField(previewReplacement, 'Accepted body');
    });
    editor.update({ history: 'new-batch', tags: 'preview-accept' }, (tx) => {
      tx.setField(previewReplacement, null);
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 'Original body'.length },
        },
      });
      tx.text.insert('Accepted body');
    });

    assert.equal(readPreview(), null);
    assert.equal(readText(), 'Accepted body');
    assert.deepEqual(
      editor.read((state) => state.history.undos()[0]?.effects),
      []
    );

    undo(editor);

    assert.equal(readPreview(), null);
    assert.equal(readText(), 'Original body');

    redo(editor);

    assert.equal(readPreview(), null);
    assert.equal(readText(), 'Accepted body');
  });

  it('removes absent state field keys when undoing a field introduction', () => {
    const optionalSubtitle = defineStateField<string | undefined>({
      key: 'document.subtitle',
      history: 'push',
      persist: optionalStringCodec,
    });
    const editor = createEditor({
      extensions: [history(), optionalSubtitle],
      initialValue: [paragraph('body')],
    });

    editor.update((tx) => {
      tx.setField(optionalSubtitle, 'Draft subtitle');
    });

    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body')],
        meta: {
          [optionalSubtitle.key]: optionalSubtitle.serialize('Draft subtitle'),
        },
      }
    );

    undo(editor);

    assert.equal(
      editor.read((state) => state.getField(optionalSubtitle)),
      undefined
    );
    assert.deepEqual(
      editor.read((state) => state.value()),
      { children: [paragraph('body')] }
    );

    redo(editor);

    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body')],
        meta: {
          [optionalSubtitle.key]: optionalSubtitle.serialize('Draft subtitle'),
        },
      }
    );
  });

  it('does not save an effect when a transaction restores an absent field', () => {
    const optionalSubtitle = defineStateField<string | undefined>({
      key: 'document.subtitle',
      history: 'push',
      persist: optionalStringCodec,
    });
    const editor = createEditor({
      extensions: [history(), optionalSubtitle],
      initialValue: [paragraph('body')],
    });

    editor.update((tx) => {
      tx.setField(optionalSubtitle, 'Draft subtitle');
      tx.setField(optionalSubtitle, undefined);
    });

    assert.deepEqual(
      editor.read((state) => state.value()),
      { children: [paragraph('body')] }
    );
    assert.equal(
      editor.read((state) => state.history.undos().length),
      0
    );

    undo(editor);

    assert.deepEqual(
      editor.read((state) => state.value()),
      { children: [paragraph('body')] }
    );
  });

  it('stores and replays compact domain effects in history', () => {
    type LargeCounter = {
      body: string;
      count: number;
    };

    const increment = defineEffect<number>({
      codec: valueCodecs.number,
      collab: 'shared',
      collabReplay: 'live',
      history: 'push',
      invert: (value) => -value,
      key: 'document.large-counter.increment',
    });
    const largeCounter = defineStateField<LargeCounter>({
      key: 'document.large-counter',
      initial: () => ({ body: 'x'.repeat(40_000), count: 0 }),
      persist: defineValueCodec<LargeCounter>({
        decode(value) {
          if (
            typeof value !== 'object' ||
            value === null ||
            typeof (value as LargeCounter).body !== 'string' ||
            typeof (value as LargeCounter).count !== 'number'
          ) {
            throw new Error('Invalid large counter.');
          }

          return value as LargeCounter;
        },
        encode: (value) => value,
        version: 1,
      }),
      reduce: (value, effect) =>
        effect.type === increment
          ? { ...value, count: value.count + effect.value }
          : value,
    });
    const incrementExtension = defineEditorExtension({
      effects: [increment],
      name: 'document-large-counter-increment-effect',
    });
    const editor = createEditor({
      extensions: [history(), largeCounter, incrementExtension],
      initialValue: [paragraph('body')],
    });
    const readCounter = () =>
      editor.read((state) => state.getField(largeCounter));

    editor.update((tx) => {
      tx.effects.emit(increment, 3);
    });

    assert.deepEqual(
      editor.read((state) => state.history.undos()[0]?.effects),
      [{ type: increment, value: -3 }]
    );
    assert.equal(
      JSON.stringify(
        editor.read((state) => state.history.undos()[0]?.effects)
      ).includes('xxxxx'),
      false
    );

    undo(editor);

    assert.deepEqual(readCounter(), {
      body: 'x'.repeat(40_000),
      count: 0,
    });

    redo(editor);

    assert.deepEqual(readCounter(), {
      body: 'x'.repeat(40_000),
      count: 3,
    });
  });

  it('keeps state-only history replay from restoring editor selection', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      collab: 'shared',
      history: 'push',
      initial: () => 'Untitled',
      persist: valueCodecs.string,
    });
    const editor = createEditor({
      extensions: [history(), documentTitle],
      initialValue: {
        children: [paragraph('body')],
        meta: { [documentTitle.key]: documentTitle.serialize('Q2 Plan') },
      },
    });
    const selectionBeforeTitleChange = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    } satisfies Range;
    const currentSelection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    } satisfies Range;

    editor.update((tx) => {
      tx.selection.set(selectionBeforeTitleChange);
    });
    editor.update((tx) => {
      tx.setField(documentTitle, 'Q3 Plan');
    });
    editor.update((tx) => {
      tx.selection.set(currentSelection);
    });

    undo(editor);

    const undoCommit = editorGetLastCommit(editor);
    assert.deepEqual(
      editor.read((state) => state.selection()),
      currentSelection
    );
    assert.deepEqual(undoCommit?.tags, [
      'history-skip',
      'historic',
      'skip-dom-selection',
      'skip-selection-focus',
      'skip-scroll-into-view',
    ]);
  });

  it('undoes and redoes root-scoped edits while rebasing rootless anchors', () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let anchor: Anchor<Range>;

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
      anchor = headerEditor.anchor(
        {
          anchor: { path: [0, 0], offset: 6 },
          focus: { path: [0, 0], offset: 6 },
        },
        { association: 'inward', deletion: 'nearest' }
      );
      tx.text.insert('!');
    });

    assert.deepEqual(anchor!.resolve(), {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    });

    undo(headerEditor);

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection()),
      null
    );
    assert.deepEqual(anchor!.resolve(), {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 6 },
    });

    redo(headerEditor);

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header!')] },
      }
    );
    assert.deepEqual(anchor!.resolve(), {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    });
    anchor!.release();
  });

  it('redoes non-main structural selections in the active root', () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.nodes.insert(paragraph('new'), { at: [1], select: true });
    });

    assert.deepEqual(
      runtime.read((state) => state.selection()),
      {
        kind: 'text',
        anchor: { path: [1, 0], offset: 3, root: 'header' },
        focus: { path: [1, 0], offset: 3, root: 'header' },
      }
    );

    undo(headerEditor);
    redo(headerEditor);

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header'), paragraph('new')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection()),
      {
        kind: 'text',
        anchor: { path: [1, 0], offset: 3, root: 'header' },
        focus: { path: [1, 0], offset: 3, root: 'header' },
      }
    );
  });
});
