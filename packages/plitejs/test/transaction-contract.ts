import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineExtension,
  DocumentChange,
  editorCommands,
  type Editor,
  type EditorCommand,
  type EditorCommandAroundHandler,
  type Element,
  type Range,
  SelectionApi,
  type Value,
} from 'plitejs';

import { runEditorTransaction as runInternalEditorTransaction } from '../src/core/public-state';
import {
  addMark as editorAddMark,
  deleteBackward as editorDeleteBackward,
  deleteForward as editorDeleteForward,
  deleteFragment as editorDeleteFragment,
  getChildren as editorGetChildren,
  getExtensionRegistry as editorGetExtensionRegistry,
  getLastCommit as editorGetLastCommit,
  getPathByNodeKey as editorGetPathByNodeKey,
  getNodeKey as editorGetNodeKey,
  getSnapshot as editorGetSnapshot,
  dispatchCommand,
  insertBreak as editorInsertBreak,
  insertSoftBreak as editorInsertSoftBreak,
  insertText as editorInsertText,
  move as editorMove,
  removeMark as editorRemoveMark,
  replace as editorReplace,
  string as editorString,
  subscribe as editorSubscribe,
} from '../src/internal';
import {
  createTestDocumentChange,
  getTestDocumentRootChange,
} from './support/document-change';

const runEditorTransaction = (
  editor: Parameters<typeof runInternalEditorTransaction>[0],
  fn: Parameters<typeof runInternalEditorTransaction>[1],
  options: Parameters<typeof runInternalEditorTransaction>[2] = {}
) =>
  runInternalEditorTransaction(editor, fn, {
    authority: 'explicit',
    ...options,
  });

let commandExtensionOrder = 0;

const installCommandExtension = <Input>(
  editor: Editor,
  command: EditorCommand<Input>,
  handler: EditorCommandAroundHandler<Input>
) =>
  editor.install(
    defineExtension(`test-command-${(commandExtensionOrder += 1) - 1}`, {
      commands: ({ around }) => [around(command, handler)],
    })
  );

const paragraph = (text: string, props: Record<string, unknown> = {}) => ({
  type: 'paragraph',
  ...props,
  children: [{ text }],
});

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const getMarks = (editor: ReturnType<typeof createEditor>) =>
  editor.read((state) => state.marks());

const replaceChildren = (
  editor: ReturnType<typeof createEditor>,
  children: Element[]
) => {
  editorReplace(editor, {
    children: clone(children),
    selection: null,
  });
};

const selectEditor = (
  editor: ReturnType<typeof createEditor>,
  selection: Range
) => {
  editor.update((tx) => {
    tx.selection.set(SelectionApi.text(selection));
  });
};

const getVisibleState = (editor: ReturnType<typeof createEditor>) => {
  const snapshot = editorGetSnapshot(editor);

  return {
    children: snapshot.children,
    runtimeEntries: snapshot.index.entries(),
    selection: snapshot.selection,
  };
};

describe('plite transaction contract', () => {
  it('reads one document root without materializing the serializable value', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('main')]);
    editor.update((tx) => {
      tx.roots.create('header', [paragraph('header')]);
    });

    const root = editor.read((state) => state.root('header'));
    const value = editor.read((state) => state.value());

    assert.deepEqual(root, [paragraph('header')]);
    assert.deepEqual(
      editor.read((state) => state.children()),
      [paragraph('main')]
    );
    assert.deepEqual(value.children, [paragraph('main')]);
    assert.deepEqual(value.roots?.header, [paragraph('header')]);
    assert.equal(root, value.roots?.header);
  });

  it('internal transaction keeps direct replacement draft-visible and publishes once on exit', () => {
    const editor = createEditor();
    const publishedStates: Array<ReturnType<typeof getVisibleState>> = [];

    replaceChildren(editor, [paragraph('one'), paragraph('two')]);

    const unsubscribe = editorSubscribe(editor, () => {
      publishedStates.push(getVisibleState(editor));
    });

    publishedStates.length = 0;

    editor.update((tx) => {
      tx.value.replace({
        children: [paragraph('replacement')],
        selection: null,
      });

      assert.equal(publishedStates.length, 0);
      assert.equal(editorString(editor, [0]), 'replacement');
      assert.equal(
        editor.read((state) => state.text.string([0])),
        'one'
      );

      tx.nodes.set({ id: 'p0' }, { at: [0] });

      assert.equal(publishedStates.length, 0);
      assert.deepEqual(editorGetChildren(editor), [
        {
          type: 'paragraph',
          id: 'p0',
          children: [{ text: 'replacement' }],
        },
      ]);
    });

    unsubscribe();

    assert.equal(publishedStates.length, 1);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        id: 'p0',
        children: [{ text: 'replacement' }],
      },
    ]);
  });

  it('keeps node-key multi-node replacement atomic until commit and discardable', () => {
    const editor = createEditor();
    const publishedStates: Array<ReturnType<typeof getVisibleState>> = [];
    const normalizedPaths: string[] = [];

    replaceChildren(editor, [
      paragraph('before'),
      paragraph('target'),
      paragraph('after'),
    ]);

    const targetNodeKey = editorGetNodeKey(editor, [1]);
    assert.ok(targetNodeKey);

    const unextend = editor.install(
      defineExtension('atomic-replace-correction-spy', {
        corrections: [
          {
            event: 'content',
            correct({ entry }) {
              normalizedPaths.push(entry[1].join('.'));
            },
          },
        ],
      })
    );
    const unsubscribe = editorSubscribe(editor, () => {
      publishedStates.push(getVisibleState(editor));
    });

    publishedStates.length = 0;
    normalizedPaths.length = 0;

    editor.update((transaction) => {
      const targetPath = editorGetPathByNodeKey(editor, targetNodeKey);

      assert.deepEqual(targetPath, [1]);
      assert.ok(targetPath);

      transaction.nodes.remove({ at: targetPath });

      assert.equal(publishedStates.length, 0);
      assert.deepEqual(normalizedPaths, []);
      assert.equal(editorGetPathByNodeKey(editor, targetNodeKey), null);

      transaction.nodes.insert(
        [paragraph('replacement-a'), paragraph('replacement-b')],
        { at: targetPath }
      );

      assert.equal(editorString(editor, [1]), 'replacement-a');
      assert.equal(editorString(editor, [2]), 'replacement-b');
      assert.equal(publishedStates.length, 0);
      assert.deepEqual(normalizedPaths, []);
    });

    const commit = editorGetLastCommit(editor);

    unsubscribe();
    unextend();

    assert.equal(publishedStates.length, 1);
    assert.ok(normalizedPaths.length > 0);
    assert.ok(commit);
    assert.equal(commit.changed.has('structure'), true);
    assert.deepEqual(commit.changed.topLevelRanges(), [[1, 2]]);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('before'),
      paragraph('replacement-a'),
      paragraph('replacement-b'),
      paragraph('after'),
    ]);

    const discardEditor = createEditor();
    const discardPublishedStates: Array<ReturnType<typeof getVisibleState>> =
      [];

    replaceChildren(discardEditor, [
      paragraph('before'),
      paragraph('target'),
      paragraph('after'),
    ]);

    const discardTargetNodeKey = editorGetNodeKey(discardEditor, [1]);
    assert.ok(discardTargetNodeKey);

    const discardBefore = getVisibleState(discardEditor);
    const unsubscribeDiscard = editorSubscribe(discardEditor, () => {
      discardPublishedStates.push(getVisibleState(discardEditor));
    });

    discardPublishedStates.length = 0;

    assert.throws(() => {
      discardEditor.update((transaction) => {
        const targetPath = editorGetPathByNodeKey(
          discardEditor,
          discardTargetNodeKey
        );

        assert.deepEqual(targetPath, [1]);
        assert.ok(targetPath);

        transaction.nodes.replace(
          [paragraph('replacement-a'), paragraph('replacement-b')],
          { at: targetPath }
        );

        throw new Error('reject preview');
      });
    }, /reject preview/);

    unsubscribeDiscard();

    assert.equal(discardPublishedStates.length, 0);
    assert.deepEqual(getVisibleState(discardEditor), discardBefore);
    assert.deepEqual(
      editorGetPathByNodeKey(discardEditor, discardTargetNodeKey),
      [1]
    );
  });

  it('internal transaction exposes live draft state through the transaction argument', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one'), paragraph('two')]);

    editor.update((tx) => {
      assert.deepEqual(tx.children(), [paragraph('one'), paragraph('two')]);
      assert.equal(tx.selection(), null);

      tx.text.insert('!', { at: { path: [0, 0], offset: 3 } });

      assert.equal(tx.children()[0]?.children[0]?.text, 'one!');

      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      });

      assert.deepEqual(tx.selection(), {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      });
    });

    assert.equal(
      editorGetSnapshot(editor).children[0].children[0].text,
      'one!'
    );
  });

  it('selection.set preserves text-selection metadata', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    editor.update((tx) => {
      tx.selection.set({
        affinity: 'backward',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
        kind: 'text',
        marks: { bold: true },
      });
    });

    assert.deepEqual(editorGetSnapshot(editor).selection, {
      affinity: 'backward',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
      kind: 'text',
      marks: { bold: true },
    });
  });

  it('exposes high-level writes through the transaction-owned mutation groups', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one')]);

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 3 },
      });

      assert.equal(editorGetChildren(editor)[0]?.children[0]?.text, 'one!');
    });

    assert.equal(
      editorGetSnapshot(editor).children[0].children[0].text,
      'one!'
    );
  });

  it('publishes explicit last commit metadata without requiring snapshot subscribers', () => {
    const editor = createEditor();

    assert.equal(editorGetLastCommit(editor), null);

    replaceChildren(editor, [paragraph('one')]);

    const replaceCommit = editorGetLastCommit(editor);

    assert.ok(replaceCommit);
    assert.equal(replaceCommit.changed.has('replace'), true);
    assert.equal(replaceCommit.version, 1);

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 3 },
      });
    });

    const commit = editorGetLastCommit(editor);

    assert.ok(commit);
    assert.equal(commit.previousVersion, 1);
    assert.equal(commit.version, 2);
    assert.equal(commit.changed.has('text'), true);
    assert.equal(commit.selectionChanged, false);
    assert.equal(commit.changed.has('structure'), false);
    assert.equal(commit.changed.has('snapshot'), true);
    assert.deepEqual(commit.changed.topLevelRanges(), [[0, 0]]);
    assert.equal(commit.changes.empty, false);
  });

  it('passes explicit commit metadata through subscribers', () => {
    const editor = createEditor();
    const commits: Array<NonNullable<ReturnType<typeof editorGetLastCommit>>> =
      [];

    replaceChildren(editor, [paragraph('one')]);

    const unsubscribe = editorSubscribe(editor, (_snapshot, commit) => {
      if (commit) {
        commits.push(commit);
      }
    });

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 3 },
      });
    });

    unsubscribe();

    assert.equal(commits.length, 1);
    assert.equal(commits[0]?.changed.has('text'), true);
    assert.equal(commits[0], editorGetLastCommit(editor));
    assert.deepEqual(commits[0]?.changed.topLevelRanges(), [[0, 0]]);
  });

  it('notifies extensions about canonical transaction changes', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one')]);

    const seenChanges: DocumentChange[] = [];
    const unextend = editor.install(
      defineExtension('transaction-change-spy', {
        on: {
          transactionChange({ change }) {
            seenChanges.push(change);
          },
        },
      })
    );

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 3 },
      });
    });

    assert.equal(seenChanges.length, 1);
    assert.equal(
      editorGetSnapshot(editor).children[0].children[0].text,
      'one!'
    );

    editor.update((tx) => {
      tx.text.insert('?', { at: { path: [0, 0], offset: 4 } });
    });

    unextend();

    assert.equal(seenChanges.length, 2);
    assert.equal(
      editorGetSnapshot(editor).children[0].children[0].text,
      'one!?'
    );
  });

  it('derives changed paths lazily for an unclassified canonical change', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one')]);

    const observations: Array<{
      paths: ReadonlyArray<import('plitejs').Path>;
      properties: boolean;
      ranges: ReadonlyArray<{
        after: readonly [number, number] | null;
        before: readonly [number, number] | null;
      }>;
      structure: boolean;
      text: boolean;
    }> = [];
    const unextend = editor.install(
      defineExtension('lazy-transaction-change-spy', {
        on: {
          transactionChange({ changed }) {
            observations.push({
              paths: changed.paths(),
              properties: changed.has('properties'),
              ranges: changed.topLevelRanges(),
              structure: changed.has('structure'),
              text: changed.has('text'),
            });
          },
        },
      })
    );
    const classified = DocumentChange.between(
      { children: [paragraph('one')] },
      { children: [paragraph('one!')] }
    );
    const unclassified = createTestDocumentChange({
      primary: getTestDocumentRootChange(classified),
    });

    assert.equal(unclassified.primaryClassification, null);

    editor.update((tx) => {
      tx.changes.apply(unclassified);
    });

    const commit = editorGetLastCommit(editor);

    unextend();

    assert.deepEqual(observations, [
      {
        paths: [[0], [0, 0]],
        properties: false,
        ranges: [{ after: [0, 0], before: [0, 0] }],
        structure: false,
        text: true,
      },
    ]);
    assert.deepEqual(commit?.changed.paths(), [[0], [0, 0]]);
    assert.equal(Object.isFrozen(observations[0]?.paths), true);
    assert.equal(Object.isFrozen(observations[0]?.paths[0]), true);
  });

  it('keeps transaction changed paths bounded in a 20k-block document', () => {
    const editor = createEditor({
      initialValue: Array.from({ length: 20_000 }, (_, index) =>
        paragraph(`row-${index}`)
      ),
    });
    const paths: Array<import('plitejs').Path> = [];
    const ranges: Array<{
      after: readonly [number, number] | null;
      before: readonly [number, number] | null;
    }> = [];
    const unextend = editor.install(
      defineExtension('bounded-transaction-change-paths', {
        on: {
          transactionChange({ changed }) {
            paths.push(...changed.paths());
            ranges.push(...changed.topLevelRanges());
          },
        },
      })
    );

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [10_000, 0], offset: 3 },
      });
    });

    unextend();

    assert.deepEqual(paths, [[10_000], [10_000, 0]]);
    assert.deepEqual(ranges, [
      { after: [10_000, 10_000], before: [10_000, 10_000] },
    ]);
  });

  it('transaction mutation groups publish once', () => {
    const editor = createEditor();
    const publishedStates: Array<ReturnType<typeof getVisibleState>> = [];

    replaceChildren(editor, [paragraph('one')]);

    const unsubscribe = editorSubscribe(editor, () => {
      publishedStates.push(getVisibleState(editor));
    });

    publishedStates.length = 0;

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 3 },
      });

      assert.equal(publishedStates.length, 0);
      assert.equal(editorGetChildren(editor)[0]?.children[0]?.text, 'one!');
    });

    unsubscribe();

    assert.equal(publishedStates.length, 1);
    assert.equal(
      editorGetSnapshot(editor).children[0].children[0].text,
      'one!'
    );
  });

  it('internal transaction exposes tx.setMarks as the transaction-owned marks boundary', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });

    runEditorTransaction(editor, (transaction) => {
      transaction.setMarks({ bold: true });

      assert.deepEqual(transaction.marks, { bold: true });
      assert.deepEqual(getMarks(editor), {});
    });

    const { selection } = editorGetSnapshot(editor);

    assert.equal(SelectionApi.isText(selection), true);
    assert.deepEqual(SelectionApi.isText(selection) ? selection.marks : null, {
      bold: true,
    });
  });

  it('internal transaction exposes tx.setSelection as the transaction-owned selection boundary', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    runEditorTransaction(editor, (transaction) => {
      transaction.setSelection({
        kind: 'text',
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });

      assert.deepEqual(transaction.selection, {
        kind: 'text',
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    });

    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
  });

  it('discards staged changes when the update callback throws', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one'), paragraph('two')]);

    const before = getVisibleState(editor);
    const beforeCommit = editorGetLastCommit(editor);
    const beforeVersion = editorGetSnapshot(editor).version;

    assert.throws(() => {
      editor.update((tx) => {
        tx.nodes.set({ id: 'temp' }, { at: [0] });
        assert.equal(tx.children()[0]?.id, 'temp');
        assert.equal(
          editor.read((state) => state.text.string([0])),
          'one'
        );
        throw new Error('abort update');
      });
    });

    assert.deepEqual(getVisibleState(editor), before);
    assert.equal(editorGetSnapshot(editor).version, beforeVersion);
    assert.equal(editorGetLastCommit(editor), beforeCommit);
  });

  it('routes insertText through pure command handlers and preserves commit metadata', () => {
    const editor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    });

    const unsubscribe = installCommandExtension(
      editor,
      editorCommands.insertText,
      ({ next, ...context }) => {
        seenCommands.push(context.input);
        return next({
          ...context.input,
          text: '!',
        });
      }
    );

    editor.update((_tx) => {
      editorInsertText(editor, '?');
    });
    const commit = editorGetLastCommit(editor);

    unsubscribe();

    assert.equal(seenCommands.length, 1);
    assert.deepEqual(seenCommands[0], {
      options: {},
      text: '?',
    });
    assert.equal(editorString(editor, [0]), 'one!');
    assert.ok(commit);
    assert.equal(commit.tags.includes('semantic-command'), true);
    assert.equal(commit.changed.has('text'), true);
    assert.equal(commit.changed.has('structure'), false);
    assert.deepEqual(commit.changed.topLevelRanges(), [[0, 0]]);
    assert.deepEqual(commit.selectionBefore, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.deepEqual(
      commit.selectionAfter,
      editorGetSnapshot(editor).selection
    );
  });

  it('preserves command metadata when a command runs inside an open update', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one')]);
    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    });

    editor.update((_tx) => {
      editorInsertText(editor, '!');
    });

    const commit = editorGetLastCommit(editor);

    assert.ok(commit);
    assert.equal(commit.tags.includes('semantic-command'), true);
    assert.equal(commit.changed.has('text'), true);
    assert.deepEqual(commit.changed.topLevelRanges(), [[0, 0]]);
  });

  it('routes insertBreak through pure command handlers and preserves structural commit metadata', () => {
    const editor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    });

    const unsubscribe = installCommandExtension(
      editor,
      editorCommands.insertBreak,
      ({ next, ...context }) => {
        seenCommands.push(context.input);
        return next();
      }
    );

    editor.update((_tx) => {
      editorInsertBreak(editor);
    });
    const commit = editorGetLastCommit(editor);

    unsubscribe();

    assert.deepEqual(seenCommands, [undefined]);
    assert.deepEqual(editorGetSnapshot(editor).children, [
      paragraph('o'),
      paragraph('ne'),
    ]);
    assert.ok(commit);
    assert.equal(commit.tags.includes('semantic-command'), true);
    assert.equal(commit.changed.has('structure'), true);
    assert.deepEqual(commit.changed.topLevelRanges(), [[0, 1]]);
    assert.equal(commit.selectionChanged, true);
    assert.deepEqual(commit.selectionBefore, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    assert.deepEqual(commit.selectionAfter, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });

  it('routes insertSoftBreak through pure command handlers and preserves text commit metadata', () => {
    const editor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    });

    const unsubscribe = installCommandExtension(
      editor,
      editorCommands.insertSoftBreak,
      ({ next, ...context }) => {
        seenCommands.push(context.input);
        return next();
      }
    );

    editor.update((_tx) => {
      editorInsertSoftBreak(editor);
    });
    const commit = editorGetLastCommit(editor);

    unsubscribe();

    assert.deepEqual(seenCommands, [undefined]);
    assert.deepEqual(editorGetSnapshot(editor).children, [paragraph('o\nne')]);
    assert.ok(commit);
    assert.equal(commit.tags.includes('semantic-command'), true);
    assert.equal(commit.changed.has('text'), true);
    assert.deepEqual(commit.changed.topLevelRanges(), [[0, 0]]);
    assert.equal(commit.changed.has('structure'), false);
    assert.equal(commit.selectionChanged, true);
    assert.deepEqual(commit.selectionBefore, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    assert.deepEqual(commit.selectionAfter, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
  });

  it('routes delete commands through pure command handlers and preserves commits', () => {
    const backwardEditor = createEditor();
    const fragmentEditor = createEditor();
    const deleteFragmentCommand = editorCommands.deleteFragment;
    const deleteCommands: unknown[] = [];
    const fragmentCommands: unknown[] = [];

    replaceChildren(backwardEditor, [paragraph('one')]);
    selectEditor(backwardEditor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribeDelete = installCommandExtension(
      backwardEditor,
      editorCommands.delete,
      ({ next, ...context }) => {
        deleteCommands.push(context.input);
        return next();
      }
    );

    backwardEditor.update(() => {
      editorDeleteBackward(backwardEditor);
    });
    const backwardCommit = editorGetLastCommit(backwardEditor);

    unsubscribeDelete();

    assert.deepEqual(deleteCommands, [
      {
        direction: 'backward',
        unit: 'character',
      },
    ]);
    assert.equal(editorString(backwardEditor, [0]), 'on');
    assert.ok(backwardCommit);
    assert.equal(backwardCommit.changed.has('text'), true);
    assert.equal(backwardCommit.changed.has('structure'), false);

    replaceChildren(fragmentEditor, [paragraph('hello')]);
    selectEditor(fragmentEditor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    const unsubscribeFragment = installCommandExtension(
      fragmentEditor,
      deleteFragmentCommand,
      ({ next, ...context }) => {
        fragmentCommands.push(context.input);
        return next();
      }
    );

    fragmentEditor.update(() => {
      editorDeleteFragment(fragmentEditor, { direction: 'backward' });
    });
    const fragmentCommit = editorGetLastCommit(fragmentEditor);

    unsubscribeFragment();

    assert.deepEqual(fragmentCommands[0], {
      direction: 'backward',
    });
    assert.equal(editorString(fragmentEditor, [0]), 'ho');
    assert.ok(fragmentCommit);
    assert.equal(fragmentCommit.changed.has('text'), true);
    assert.equal(fragmentCommit.changed.has('structure'), false);
  });

  it('honors delete command direction overrides from pure handlers', () => {
    const deleteCommand = editorCommands.delete;
    const backwardEditor = createEditor();
    const forwardEditor = createEditor();

    replaceChildren(backwardEditor, [paragraph('abc')]);
    selectEditor(backwardEditor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    const unsubscribeBackward = installCommandExtension(
      backwardEditor,
      deleteCommand,
      ({ next, ...context }) => next({ ...context.input, direction: 'forward' })
    );

    backwardEditor.update(() => {
      editorDeleteBackward(backwardEditor);
    });
    unsubscribeBackward();

    assert.equal(editorString(backwardEditor, [0]), 'ac');

    replaceChildren(forwardEditor, [paragraph('abc')]);
    selectEditor(forwardEditor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    const unsubscribeForward = installCommandExtension(
      forwardEditor,
      deleteCommand,
      ({ next, ...context }) =>
        next({ ...context.input, direction: 'backward' })
    );

    forwardEditor.update(() => {
      editorDeleteForward(forwardEditor);
    });
    unsubscribeForward();

    assert.equal(editorString(forwardEditor, [0]), 'bc');
  });

  it('writes selection directly and preserves selection-only commit metadata', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one')]);

    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const commit = editorGetLastCommit(editor);

    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.ok(commit);
    assert.equal(commit.tags.includes('semantic-command'), false);
    assert.equal(commit.changed.has('selection'), true);
    assert.equal(commit.changed.has('document'), false);
    assert.equal(commit.selectionChanged, true);
    assert.equal(commit.changes.empty, true);
    assert.deepEqual(commit.changed.nodeKeys('node'), []);
  });

  it('keeps rootless selection caller-shaped while committing the view root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    headerEditor.update((tx) => {
      tx.selection.set(selection);
    });

    const commit = editorGetLastCommit(runtime);

    assert.equal(commit?.changes.empty, true);
    assert.equal(commit?.selectionAfterRoot, 'header');
    assert.deepEqual(commit?.selectionAfter, selection);
  });

  it('routes movement through pure command handlers and preserves selection-only commit metadata', () => {
    const editor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    const unsubscribe = installCommandExtension(
      editor,
      editorCommands.move,
      ({ next, ...context }) => {
        seenCommands.push(context.input);
        return next({
          ...context.input,
          options: {
            distance: 2,
          },
        });
      }
    );

    editor.update(() => {
      editorMove(editor);
    });
    const commit = editorGetLastCommit(editor);

    unsubscribe();

    assert.deepEqual(seenCommands, [
      {
        options: {},
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
    assert.ok(commit);
    assert.equal(commit.tags.includes('semantic-command'), true);
    assert.equal(commit.changed.has('selection'), true);
    assert.equal(commit.changes.empty, true);
    assert.deepEqual(commit.changed.nodeKeys('node'), []);
  });

  it('moves word selection across initial sibling text leaves', () => {
    const editor = createEditor();

    replaceChildren(editor, [
      {
        type: 'paragraph',
        children: [
          { bold: true, text: 'he' },
          { text: 'llo' },
          { text: ' world' },
        ],
      },
    ]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    editor.update((tx) => {
      tx.selection.move({ unit: 'word' });
    });

    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: { path: [0, 1], offset: 3 },
      focus: { path: [0, 1], offset: 3 },
    });
  });

  it('moves word selection across formatted middle sibling text leaves', () => {
    const forward = createEditor();

    replaceChildren(forward, [
      {
        type: 'paragraph',
        children: [
          { text: 'foo ' },
          { bold: true, text: 'bar' },
          { text: ' baz' },
        ],
      },
    ]);
    selectEditor(forward, {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });

    forward.update((tx) => {
      tx.selection.move({ unit: 'word' });
    });

    assert.deepEqual(editorGetSnapshot(forward).selection, {
      kind: 'text',
      anchor: { path: [0, 1], offset: 3 },
      focus: { path: [0, 1], offset: 3 },
    });

    const backward = createEditor();

    replaceChildren(backward, [
      {
        type: 'paragraph',
        children: [
          { text: 'foo ' },
          { bold: true, text: 'bar' },
          { text: ' baz' },
        ],
      },
    ]);
    selectEditor(backward, {
      anchor: { path: [0, 2], offset: 1 },
      focus: { path: [0, 2], offset: 1 },
    });

    backward.update((tx) => {
      tx.selection.move({ reverse: true, unit: 'word' });
    });

    assert.deepEqual(editorGetSnapshot(backward).selection, {
      kind: 'text',
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 0 },
    });
  });

  it('moves word selection through padded formatted leaves in both directions', () => {
    const editor = createEditor();

    replaceChildren(editor, [
      {
        type: 'paragraph',
        children: [
          { text: '  123 ' },
          { bold: true, text: 'ab' },
          { text: 'c 456  ' },
          { bold: true, text: 'de' },
          { text: 'f  ' },
        ],
      },
    ]);
    selectEditor(editor, {
      anchor: { path: [0, 4], offset: 3 },
      focus: { path: [0, 4], offset: 3 },
    });

    for (const point of [
      { path: [0, 3], offset: 0 },
      { path: [0, 2], offset: 2 },
      { path: [0, 1], offset: 0 },
      { path: [0, 0], offset: 2 },
      { path: [0, 0], offset: 0 },
    ]) {
      editor.update((tx) => {
        tx.selection.move({ reverse: true, unit: 'word' });
      });

      assert.deepEqual(editorGetSnapshot(editor).selection, {
        kind: 'text',
        anchor: point,
        focus: point,
      });
    }

    for (const point of [
      { path: [0, 0], offset: 5 },
      { path: [0, 2], offset: 1 },
      { path: [0, 2], offset: 5 },
      { path: [0, 4], offset: 1 },
      { path: [0, 4], offset: 3 },
    ]) {
      editor.update((tx) => {
        tx.selection.move({ unit: 'word' });
      });

      assert.deepEqual(editorGetSnapshot(editor).selection, {
        kind: 'text',
        anchor: point,
        focus: point,
      });
    }
  });

  it('routes mark commands through pure command handlers and preserves mark commit metadata', () => {
    const editor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribeAdd = installCommandExtension(
      editor,
      editorCommands.addMark,
      ({ next, ...context }) => {
        seenCommands.push(context.input);
        return next({
          ...context.input,
          key: 'italic',
        });
      }
    );

    editor.update((_tx) => {
      editorAddMark(editor, 'bold', true);
    });
    const addCommit = editorGetLastCommit(editor);

    unsubscribeAdd();

    assert.deepEqual(seenCommands[0], {
      key: 'bold',
      value: true,
    });
    assert.deepEqual(getMarks(editor), { italic: true });
    assert.ok(addCommit);
    assert.equal(addCommit.changed.has('marks'), true);
    assert.equal(SelectionApi.isText(addCommit.selectionBefore), true);
    assert.equal(SelectionApi.isText(addCommit.selectionAfter), true);
    assert.deepEqual(
      SelectionApi.isText(addCommit.selectionAfter)
        ? addCommit.selectionAfter.marks
        : null,
      { italic: true }
    );
    assert.equal(addCommit.changes.empty, true);

    const unsubscribeRemove = installCommandExtension(
      editor,
      editorCommands.removeMark,
      ({ next, ...context }) => {
        seenCommands.push(context.input);
        return next({
          ...context.input,
          key: 'italic',
        });
      }
    );

    editor.update((_tx) => {
      editorRemoveMark(editor, 'bold');
    });
    const removeCommit = editorGetLastCommit(editor);

    unsubscribeRemove();

    assert.deepEqual(seenCommands[1], {
      key: 'bold',
    });
    assert.deepEqual(getMarks(editor), {});
    assert.ok(removeCommit);
    assert.equal(removeCommit.changed.has('marks'), true);
    assert.deepEqual(
      SelectionApi.isText(removeCommit.selectionBefore)
        ? removeCommit.selectionBefore.marks
        : null,
      { italic: true }
    );
    assert.deepEqual(
      SelectionApi.isText(removeCommit.selectionAfter)
        ? removeCommit.selectionAfter.marks
        : null,
      {}
    );
    assert.equal(removeCommit.changes.empty, true);
  });

  it('stores command handlers in the extension registry command slot', () => {
    const editor = createEditor();
    const initialRegistry = editorGetExtensionRegistry(editor);
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribe = installCommandExtension(
      editor,
      editorCommands.insertText,
      ({ next, ...context }) => {
        seenCommands.push(context.input);
        return next();
      }
    );

    const registry = editorGetExtensionRegistry(editor);

    assert.notEqual(registry, initialRegistry);
    assert.equal(
      registry.commands.byDescriptor.get(editorCommands.insertText)?.entries
        .length,
      1
    );

    editor.update((_tx) => {
      editorInsertText(editor, '!');
    });
    unsubscribe();

    assert.deepEqual(seenCommands, [
      {
        options: {},
        text: '!',
      },
    ]);
    assert.equal(
      editorGetExtensionRegistry(editor).commands.byDescriptor.has(
        editorCommands.insertText
      ),
      false
    );
  });

  it('registers typed internal command definitions in deterministic install order', () => {
    const editor = createEditor();
    const insertTextCommand = editorCommands.insertText;
    const seenCommands: string[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribeEarly = installCommandExtension(
      editor,
      insertTextCommand,
      ({ next, ...context }) => {
        const text: string = context.input.text;

        seenCommands.push(`early:${text}`);
        return next();
      }
    );
    const unsubscribeLate = installCommandExtension(
      editor,
      insertTextCommand,
      ({ next, ...context }) => {
        seenCommands.push(`late:${context.input.text}`);
        return next();
      }
    );
    const unsubscribeHigh = installCommandExtension(
      editor,
      insertTextCommand,
      ({ next, ...context }) => {
        seenCommands.push(`high:${context.input.text}`);
        return next();
      }
    );

    editor.update(() => {
      editorInsertText(editor, '!');
    });

    unsubscribeEarly();
    unsubscribeLate();
    unsubscribeHigh();

    assert.deepEqual(seenCommands, ['early:!', 'late:!', 'high:!']);
    assert.equal(
      editorGetExtensionRegistry(editor).commands.byDescriptor.has(
        insertTextCommand
      ),
      false
    );
  });

  it('lets boolean false decline a command without stopping propagation', () => {
    const editor = createEditor();
    const seenCommands: string[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribeDecline = installCommandExtension(
      editor,
      editorCommands.insertText,
      (context) => {
        seenCommands.push(`decline:${context.input.text}`);
        return false;
      }
    );
    const unsubscribeOverride = installCommandExtension(
      editor,
      editorCommands.insertText,
      ({ next, ...context }) => {
        seenCommands.push(`override:${context.input.text}`);
        return next({
          ...context.input,
          text: '?',
        });
      }
    );

    editor.update(() => {
      editorInsertText(editor, '!');
    });

    unsubscribeDecline();
    unsubscribeOverride();

    assert.deepEqual(seenCommands, ['decline:!', 'override:!']);
    assert.equal(editorString(editor, [0]), 'one?');
  });

  it('publishes extension-owned registry slots atomically', () => {
    const editor = createEditor();
    const capability = { type: 'link' };
    const correction = {
      correct() {},
      event: 'content' as const,
    };
    const commitListener = () => {};

    const cleanup = editor.install(
      defineExtension('registry-slots', {
        api: () => ({ inline: capability }),
        corrections: [correction],
        on: {
          commit: commitListener,
        },
      })
    );
    const registry = editorGetExtensionRegistry(editor);

    assert.equal(
      (
        editor.api as {
          'registry-slots'?: { inline: typeof capability };
        }
      )['registry-slots']?.inline,
      capability
    );
    assert.equal(
      registry.corrections.get('registry-slots:corrections.0'),
      correction
    );
    assert.equal(registry.commitListeners.size, 1);

    cleanup();

    const clearedRegistry = editorGetExtensionRegistry(editor);

    assert.equal('registry-slots' in editor.api, false);
    assert.equal(
      clearedRegistry.corrections.has('registry-slots:corrections.0'),
      false
    );
    assert.equal(clearedRegistry.commitListeners.size, 0);
  });

  it('cleans extension registration output and aborts its lifecycle signal', () => {
    const editor = createEditor();
    let cleanupCalls = 0;
    let signal: AbortSignal | null = null;
    const commits: Array<NonNullable<ReturnType<typeof editorGetLastCommit>>> =
      [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unextend = editor.install(
      defineExtension('lifecycle-extension', {
        activate: (context) => {
          ({ signal } = context);
          context.onCleanup(() => {
            cleanupCalls += 1;
          });
        },
        on: {
          commit({ commit }) {
            commits.push(commit);
          },
        },
      })
    );

    const registeredSignal = signal as unknown as AbortSignal;

    assert.equal(registeredSignal.aborted, false);
    commits.length = 0;
    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 3 },
      });
    });

    assert.equal(commits.length, 1);

    unextend();
    editor.update((tx) => {
      tx.text.insert('?', {
        at: { path: [0, 0], offset: 4 },
      });
    });

    assert.equal(cleanupCalls, 1);
    assert.equal(registeredSignal.aborted, true);
    assert.equal(commits.length, 1);
  });

  it('exposes extension state and transaction groups with cleanup', () => {
    const editor = createEditor();

    replaceChildren(editor, [paragraph('one')]);

    const unextend = editor.install(
      defineExtension('group-extension', {
        read: ({ state }) =>
          Object.freeze({
            text: () => state.text.string([0]),
          }),
        update: ({ tx }) =>
          Object.freeze({
            append: (text: string) =>
              tx.text.insert(text, { at: { path: [0, 0], offset: 3 } }),
          }),
      })
    );

    assert.equal(
      editor.read((state) => state.text.string([0])),
      'one'
    );

    editor.update((tx) => {
      (
        tx as typeof tx & {
          'group-extension': { append: (text: string) => void };
        }
      )['group-extension'].append('!');
    });

    assert.equal(
      editor.read((state) => state.text.string([0])),
      'one!'
    );

    const registry = editorGetExtensionRegistry(editor);
    assert.equal(registry.stateGroups.has('group-extension'), true);
    assert.equal(registry.txGroups.has('group-extension'), true);

    unextend();

    const clearedRegistry = editorGetExtensionRegistry(editor);
    assert.notEqual(clearedRegistry, registry);
    assert.equal(clearedRegistry.stateGroups.has('group-extension'), false);
    assert.equal(clearedRegistry.txGroups.has('group-extension'), false);
  });

  it('routes slice replacement through pure command handlers and preserves commit metadata', () => {
    const editor = createEditor();
    const seenCommands: unknown[] = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribe = installCommandExtension(
      editor,
      editorCommands.replaceSlice,
      ({ next, ...context }) => {
        seenCommands.push(context.input);
        return next({
          ...context.input,
          slice: ContentSlice.closed([{ text: '!' }]),
        });
      }
    );

    dispatchCommand(editor, editorCommands.replaceSlice, {
      slice: ContentSlice.closed([{ text: '?' }]),
    });
    const commit = editorGetLastCommit(editor);

    unsubscribe();

    assert.deepEqual(seenCommands, [
      {
        slice: {
          content: [{ text: '?' }],
          openEnd: 0,
          openStart: 0,
        },
      },
    ]);
    assert.equal(editorString(editor, [0]), 'one!');
    assert.ok(commit);
    assert.equal(commit.changed.has('text'), true);
    assert.equal(commit.changed.has('structure'), false);
    assert.equal(commit.selectionChanged, true);
  });

  it('snapshots structural slice commands before middleware observes them', () => {
    const editor = createEditor();
    const content = [paragraph('?')];
    const rawSlice = { content, openEnd: 0, openStart: 0 };
    let receivedSlice: unknown;

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribe = installCommandExtension(
      editor,
      editorCommands.replaceSlice,
      ({ next, ...context }) => {
        receivedSlice = context.input.slice;

        assert.notEqual(context.input.slice, rawSlice);
        assert.equal(Object.isFrozen(context.input.slice), true);
        assert.equal(Object.isFrozen(context.input.slice.content), true);
        assert.equal(Object.isFrozen(context.input.slice.content[0]), true);

        return next();
      }
    );

    dispatchCommand(editor, editorCommands.replaceSlice, {
      slice: rawSlice,
    });
    content[0].children[0] = { text: 'mutated' };
    unsubscribe();

    assert.deepEqual(receivedSlice, {
      content: [paragraph('?')],
      openEnd: 0,
      openStart: 0,
    });
  });

  it('dispatches direct slice and fragment replacements once while callbacks stay primitive', () => {
    const editor = createEditor<Value>({
      initialSelection: SelectionApi.text({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      }),
      initialValue: [paragraph('ab')],
    });
    let commands = 0;
    let commits = 0;

    const unsubscribe = installCommandExtension(
      editor,
      editorCommands.replaceSlice,
      ({ next }) => {
        commands += 1;

        return next();
      }
    );

    editor.subscribeCommit(() => (commits += 1) - 1);

    editor.update.slice.replace(ContentSlice.closed([{ text: '1' }]));
    assert.equal(commands, 1);
    assert.equal(commits, 1);

    editor.update.fragment.replace([{ text: '2' }]);
    assert.equal(commands, 2);
    assert.equal(commits, 2);

    editor.update((tx) => {
      tx.slice.replace(ContentSlice.closed([{ text: '3' }]));
      tx.fragment.replace([{ text: '4' }]);
    });

    assert.equal(commands, 2);
    assert.equal(commits, 3);
    assert.equal(editorString(editor, []), 'a1234b');

    unsubscribe();
  });

  it('delivers command-backed commits to extension commit listeners and preserves subscribe behavior', () => {
    const editor = createEditor();
    const extensionCommits: Array<
      NonNullable<ReturnType<typeof editorGetLastCommit>>
    > = [];
    const subscribedCommits: Array<
      NonNullable<ReturnType<typeof editorGetLastCommit>>
    > = [];

    replaceChildren(editor, [paragraph('one')]);
    selectEditor(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unextendCommitListener = editor.install(
      defineExtension('command-commit-listener', {
        on: {
          commit({ commit }) {
            extensionCommits.push(commit);
          },
        },
      })
    );
    extensionCommits.length = 0;
    const unsubscribeSubscriber = editorSubscribe(
      editor,
      (_snapshot, commit) => {
        if (commit) {
          subscribedCommits.push(commit);
        }
      }
    );

    editor.update((_tx) => {
      editorInsertText(editor, '!');
    });

    assert.equal(extensionCommits.length, 1);
    assert.equal(subscribedCommits.length, 1);
    assert.equal(extensionCommits[0], subscribedCommits[0]);
    assert.equal(extensionCommits[0]?.tags.includes('semantic-command'), true);

    unsubscribeSubscriber();
    unextendCommitListener();
    const extensionCommitCount = extensionCommits.length;

    editor.update((_tx) => {
      editorInsertText(editor, '?');
    });

    assert.equal(extensionCommits.length, extensionCommitCount);
    assert.equal(subscribedCommits.length, 1);
    assert.equal(editorString(editor, [0]), 'one!?');
  });
});
