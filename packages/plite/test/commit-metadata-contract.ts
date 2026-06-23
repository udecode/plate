import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/plite/internal';

import {
  createEditor,
  type Descendant,
  defineStateField,
  type EditorUpdateOptions,
  type EditorUpdateTag,
} from '../src';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('commit metadata contract', () => {
  it('captures update tags and selection before/after on text commits', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const before = Editor.getSnapshot(editor);
    const blockRuntimeId = before.index.pathToId['0'];
    const textRuntimeId = before.index.pathToId['0.0'];

    assert(blockRuntimeId);
    assert(textRuntimeId);

    editor.update(
      (tx) => {
        tx.text.insert('!');
      },
      { tag: ['history-push', 'paste'] }
    );

    const commit = Editor.getLastCommit(editor);

    assert(commit);
    assert.deepEqual(commit.classes, ['text']);
    assert.deepEqual(commit.tags, ['history-push', 'paste']);
    assert.deepEqual(commit.selectionBefore, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.deepEqual(commit.selectionAfter, {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });
    assert.equal(commit.selectionChanged, true);
    assert.equal(commit.textChanged, true);
    assert.equal(commit.snapshotChanged, true);
    assert.deepEqual(commit.dirtyTextRuntimeIds, [textRuntimeId]);
    assert.deepEqual(commit.dirtyElementRuntimeIds, [blockRuntimeId]);
    assert.deepEqual(commit.dirtyTopLevelRuntimeIds, [blockRuntimeId]);
    assert.deepEqual(commit.dirtyTopLevelRanges, [[0, 0]]);
    assert.deepEqual(commit.textDirtyRuntimeIds, [textRuntimeId]);
    assert.deepEqual(commit.structuralDirtyRuntimeIds, []);
    assert.deepEqual(commit.markDirtyRuntimeIds, []);
    assert.deepEqual(commit.affectedTextRuntimeIds, [textRuntimeId]);
    assert.deepEqual(commit.affectedNodeRuntimeIds, [
      blockRuntimeId,
      textRuntimeId,
    ]);
    assert.deepEqual(commit.affectedProjectionRuntimeIds, [
      blockRuntimeId,
      textRuntimeId,
    ]);
    assert.deepEqual(
      commit.affectedSelectionRuntimeIds,
      commit.selectionImpactRuntimeIds
    );
    assert.equal(commit.rootRuntimeIdsChanged, false);
    assert.equal(commit.topLevelOrderChanged, false);
    assert.equal(commit.fullDocumentChanged, false);
  });

  it('types canonical update tags while preserving custom tags', () => {
    const editor = createEditor();
    const tags = [
      'history-push',
      'paste',
      'skip-dom-selection',
      'app-specific-import',
    ] satisfies EditorUpdateTag[];
    const options = { tag: tags } satisfies EditorUpdateOptions;

    Editor.replace(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update((tx) => {
      tx.text.insert('!');
    }, options);

    assert.deepEqual(Editor.getLastCommit(editor)?.tags, tags);
  });

  it('captures typed update metadata on commits', () => {
    const editor = createEditor();
    const options = {
      metadata: {
        collab: { origin: 'remote', saveToHistory: false },
        history: { mode: 'skip' },
        origin: { kind: 'yjs', clientId: 'reader-1' },
        selection: { dom: 'preserve', focus: false, scroll: false },
      },
      tag: ['collaboration', 'remote-import'],
    } satisfies EditorUpdateOptions;

    Editor.replace(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update((tx) => {
      tx.text.insert('!');
    }, options);

    const commit = Editor.getLastCommit(editor);

    assert(commit);
    assert.deepEqual(commit.tags, ['collaboration', 'remote-import']);
    assert.deepEqual(commit.metadata, options.metadata);
    assert.equal(Object.isFrozen(commit.metadata), true);
    assert.equal(Object.isFrozen(commit.metadata.collab), true);
    assert.equal(Object.isFrozen(commit.metadata.history), true);
    assert.equal(Object.isFrozen(commit.metadata.selection), true);
  });

  it('keeps local provenance state available without serializing it', () => {
    const localProvenance = defineStateField<{
      runtimeIds: string[];
      source: string;
    } | null>({
      key: 'local.provenance.last-change',
      history: 'skip',
      initial: () => null,
      persist: false,
    });
    const editor = createEditor({
      extensions: [localProvenance],
      initialValue: [paragraph('one')],
    });

    Editor.replace(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const blockRuntimeId = Editor.getRuntimeId(editor, [0]);

    assert(blockRuntimeId);

    editor.update(
      (tx) => {
        tx.setField(localProvenance, {
          runtimeIds: [blockRuntimeId],
          source: 'paste-html',
        });
        tx.text.insert('!');
      },
      {
        metadata: {
          origin: { kind: 'clipboard', source: 'paste-html' },
        },
        tag: ['paste', 'provenance-local'],
      }
    );

    const commit = Editor.getLastCommit(editor);

    assert(commit);
    assert.deepEqual(commit.tags, ['paste', 'provenance-local']);
    assert.deepEqual(commit.metadata.origin, {
      kind: 'clipboard',
      source: 'paste-html',
    });
    assert.deepEqual(
      editor.read((state) => state.getField(localProvenance)),
      {
        runtimeIds: [blockRuntimeId],
        source: 'paste-html',
      }
    );
    assert.deepEqual(
      editor.read((state) => state.value.get()),
      { children: [paragraph('one!')] }
    );
    assert.equal(
      JSON.stringify(editor.read((state) => state.value.get())).includes(
        blockRuntimeId
      ),
      false
    );
  });

  it('groups multiple primitive writes inside one update into one commit', () => {
    const editor = createEditor();
    const commits: NonNullable<ReturnType<typeof Editor.getLastCommit>>[] = [];

    Editor.replace(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const unsubscribe = Editor.subscribe(editor, (_snapshot, commit) => {
      if (commit) {
        commits.push(commit);
      }
    });

    editor.update((tx) => {
      tx.text.insert('!');
      tx.text.insert('?');
    });

    unsubscribe();

    const commit = Editor.getLastCommit(editor);

    assert(commit);
    assert.equal(commits.length, 1);
    assert.equal(commits[0], commit);
    assert.deepEqual(
      commit.operations.map((operation) => operation.type),
      ['insert_text', 'insert_text']
    );
    assert.deepEqual(commit.classes, ['text']);
    assert.deepEqual(commit.selectionBefore, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.deepEqual(commit.selectionAfter, {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
    assert.equal(commit.selectionChanged, true);
    assert.equal(commit.textChanged, true);
    assert.deepEqual(commit.dirty.paths, [[], [0], [0, 0]]);
    assert.deepEqual(commit.dirty.topLevelRange, [0, 0]);
    assert.deepEqual(commit.dirty.runtimeIds, commit.touchedRuntimeIds);
    assert.deepEqual(commit.dirtyTextRuntimeIds, commit.touchedRuntimeIds);
    assert.deepEqual(commit.dirtyTopLevelRanges, [[0, 0]]);
    assert.equal(commit.rootRuntimeIdsChanged, false);
    assert.equal(commit.topLevelOrderChanged, false);
    assert.equal(commit.fullDocumentChanged, false);
  });

  it('marks full-document replacement as broad runtime dirtiness', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [paragraph('one')],
      selection: null,
    });

    const commit = Editor.getLastCommit(editor);
    const snapshot = Editor.getSnapshot(editor);
    const nextRuntimeIds = [
      snapshot.index.pathToId['0'],
      snapshot.index.pathToId['0.0'],
    ];

    assert(commit);
    assert.deepEqual(commit.classes, ['replace']);
    assert.equal(commit.dirty.wholeDocument, true);
    assert.equal(commit.dirty.topLevelRange, null);
    assert.equal(commit.dirtyTextRuntimeIds, null);
    assert.equal(commit.dirtyElementRuntimeIds, null);
    assert.equal(commit.dirtyTopLevelRuntimeIds, null);
    assert.equal(commit.dirtyTopLevelRanges, null);
    assert.equal(commit.textDirtyRuntimeIds, null);
    assert.equal(commit.structuralDirtyRuntimeIds, null);
    assert.deepEqual(commit.markDirtyRuntimeIds, []);
    assert.deepEqual(commit.affectedTextRuntimeIds, nextRuntimeIds);
    assert.deepEqual(commit.affectedNodeRuntimeIds, nextRuntimeIds);
    assert.deepEqual(commit.affectedProjectionRuntimeIds, nextRuntimeIds);
    assert.equal(commit.affectedSelectionRuntimeIds, null);
    assert.equal(commit.rootRuntimeIdsChanged, true);
    assert.equal(commit.topLevelOrderChanged, true);
    assert.equal(commit.fullDocumentChanged, true);
  });

  it('keeps top-level split impact scoped to shifted top-level runtime ids', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        paragraph('one'),
        {
          type: 'table',
          children: Array.from({ length: 10 }, (_value, index) => ({
            type: 'table-row',
            children: [{ text: `row ${index}` }],
          })),
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const before = Editor.getSnapshot(editor);
    const tableRuntimeId = before.index.pathToId['1'];
    const tableRowRuntimeId = before.index.pathToId['1.0'];
    const unsubscribe = Editor.subscribe(editor, () => {});

    assert(tableRuntimeId);
    assert(tableRowRuntimeId);

    Editor.insertBreak(editor);
    unsubscribe();

    const commit = Editor.getLastCommit(editor);

    assert(commit);
    assert.equal(commit.topLevelOrderChanged, true);
    assert.equal(commit.rootRuntimeIdsChanged, true);
    assert(commit.nodeImpactRuntimeIds?.includes(tableRuntimeId));
    assert(!commit.nodeImpactRuntimeIds?.includes(tableRowRuntimeId));
  });
});
