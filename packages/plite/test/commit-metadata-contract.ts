import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getLastCommit as editorGetLastCommit,
  getRuntimeId as editorGetRuntimeId,
  getSnapshot as editorGetSnapshot,
  insertBreak as editorInsertBreak,
  replace as editorReplace,
  subscribe as editorSubscribe,
} from '@platejs/plite/internal';

import {
  createEditor,
  DocumentChange,
  type Element,
  defineEditorExtension,
  defineEffect,
  defineStateField,
  defineUpdateAnnotation,
  type EditorUpdatePolicy,
  type EditorUpdateTag,
  type SnapshotIndex,
} from '@platejs/plite';

import { createEditorCommit } from '../src/core/commit';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('commit metadata contract', () => {
  it('captures update tags and selection before/after on text commits', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const before = editorGetSnapshot(editor);
    const blockRuntimeId = before.index.idAt([0]);
    const textRuntimeId = before.index.idAt([0, 0]);

    assert(blockRuntimeId);
    assert(textRuntimeId);

    editor.update({ tags: ['history-push', 'paste'] }, (tx) => {
      tx.text.insert('!');
    });

    const commit = editorGetLastCommit(editor);

    assert(commit);
    assert.deepEqual(commit.tags, ['history-push', 'paste']);
    assert.deepEqual(commit.selectionBefore, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.deepEqual(commit.selectionAfter, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });
    assert.equal(Object.isFrozen(commit.selectionBefore), true);
    assert.equal(Object.isFrozen(commit.selectionBefore?.anchor), true);
    assert.equal(Object.isFrozen(commit.selectionBefore?.anchor.path), true);
    assert.equal(Object.isFrozen(commit.selectionAfter), true);
    assert.equal(Object.isFrozen(commit.selectionAfter?.focus), true);
    assert.equal(Object.isFrozen(commit.selectionAfter?.focus.path), true);
    assert.throws(() => {
      if (commit.selectionBefore) {
        commit.selectionBefore.anchor.path[0] = 9;
      }
    });
    assert.throws(() => {
      if (commit.selectionAfter) {
        commit.selectionAfter.focus.offset = 9;
      }
    });
    assert.equal(commit.selectionChanged, true);
    assert.equal(commit.changed.has('document'), true);
    assert.equal(commit.changed.has('text'), true);
    assert.equal(commit.changed.has('snapshot'), true);
    assert.equal(commit.changed.has('structure'), false);
    assert.equal(commit.changed.has('properties'), false);
    assert.equal(commit.changed.has('root-order'), false);
    assert.equal(commit.changed.has('replace'), false);
    assert.deepEqual(commit.changed.runtimeIds('text'), [textRuntimeId]);
    assert.deepEqual(commit.changed.topLevelRanges(), [[0, 0]]);
    assert.deepEqual(commit.changed.runtimeIds('node'), [
      blockRuntimeId,
      textRuntimeId,
    ]);
    assert.deepEqual(commit.changed.runtimeIds('projection'), [
      blockRuntimeId,
      textRuntimeId,
    ]);
    assert.deepEqual(commit.changed.runtimeIds('selection'), [
      textRuntimeId,
      blockRuntimeId,
    ]);
  });

  it('types canonical update tags while preserving custom tags', () => {
    const editor = createEditor();
    const tags = [
      'history-push',
      'paste',
      'skip-dom-selection',
      'app-specific-import',
    ] satisfies EditorUpdateTag[];
    const policy = { tags } satisfies EditorUpdatePolicy;

    editorReplace(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update(policy, (tx) => {
      tx.text.insert('!');
    });

    assert.deepEqual(editorGetLastCommit(editor)?.tags, tags);
  });

  it('keeps local provenance state available without serializing it', () => {
    const localProvenance = defineStateField<{
      runtimeIds: string[];
      source: string;
    } | null>({
      key: 'local.provenance.last-change',
      history: 'skip',
      initial: () => null,
    });
    const editor = createEditor({
      extensions: [localProvenance] as const,
      initialValue: [paragraph('one')],
    });

    editorReplace(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const blockRuntimeId = editorGetRuntimeId(editor, [0]);

    assert(blockRuntimeId);

    editor.update({ tags: ['paste', 'provenance-local'] }, (tx) => {
      tx.setField(localProvenance, {
        runtimeIds: [blockRuntimeId],
        source: 'paste-html',
      });
      tx.text.insert('!');
    });

    const commit = editorGetLastCommit(editor);

    assert(commit);
    assert.deepEqual(commit.tags, ['paste', 'provenance-local']);
    assert.deepEqual(
      editor.read((state) => state.getField(localProvenance)),
      {
        runtimeIds: [blockRuntimeId],
        source: 'paste-html',
      }
    );
    assert.deepEqual(
      editor.read((state) => state.value()),
      { children: [paragraph('one!')] }
    );
    assert.equal(
      JSON.stringify(editor.read((state) => state.value())).includes(
        blockRuntimeId
      ),
      false
    );
  });

  it('groups multiple primitive writes inside one update into one commit', () => {
    const editor = createEditor();
    const commits: NonNullable<ReturnType<typeof editorGetLastCommit>>[] = [];

    editorReplace(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const unsubscribe = editorSubscribe(editor, (_snapshot, commit) => {
      if (commit) {
        commits.push(commit);
      }
    });

    editor.update((tx) => {
      tx.text.insert('!');
      tx.text.insert('?');
    });

    unsubscribe();

    const commit = editorGetLastCommit(editor);

    assert(commit);
    assert.equal(commits.length, 1);
    assert.equal(commits[0], commit);
    assert.equal(commit.changes.empty, false);
    assert.deepEqual(commit.selectionBefore, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.deepEqual(commit.selectionAfter, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
    assert.equal(commit.selectionChanged, true);
    assert.equal(commit.changed.has('text'), true);
    assert.deepEqual(commit.changed.topLevelRanges(), [[0, 0]]);
    assert.equal(commit.changed.runtimeIds('text').length, 1);
    assert.equal(commit.changed.has('root-order'), false);
    assert.equal(commit.changed.has('replace'), false);
  });

  it('does not mark effect-only commits as state or snapshot changes', () => {
    const effect = defineEffect<string>({ key: 'metadata.effect-only' });
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          effects: [effect],
          name: 'metadata-effect-only',
        }),
      ] as const,
    });

    editor.update((tx) => tx.effects.emit(effect, 'saved'));

    const commit = editorGetLastCommit(editor);

    assert(commit);
    assert.deepEqual(commit.effects, [{ type: effect, value: 'saved' }]);
    assert.equal(commit.changed.has('state'), false);
    assert.equal(commit.changed.has('snapshot'), false);
  });

  it('does not mark annotation-only commits as state or snapshot changes', () => {
    const origin = defineUpdateAnnotation<string>({ key: 'metadata.origin' });
    const editor = createEditor();

    editor.update((tx) => tx.annotations.set(origin, 'keyboard'));

    const commit = editorGetLastCommit(editor);

    assert(commit);
    assert.deepEqual(commit.annotations, { [origin.key]: 'keyboard' });
    assert.equal(commit.changed.has('state'), false);
    assert.equal(commit.changed.has('snapshot'), false);
  });

  it('marks full-document replacement as broad runtime dirtiness', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('one')],
      selection: null,
    });

    const commit = editorGetLastCommit(editor);
    const snapshot = editorGetSnapshot(editor);
    const nextRuntimeIds = [
      snapshot.index.idAt([0]),
      snapshot.index.idAt([0, 0]),
    ];

    assert(commit);
    assert.equal(commit.changed.has('document'), true);
    assert.equal(commit.changed.has('replace'), true);
    assert.equal(commit.changed.has('structure'), true);
    assert.equal(commit.changed.has('root-order'), true);
    assert.deepEqual(commit.changed.runtimeIds('text'), [nextRuntimeIds[1]]);
    assert.deepEqual(commit.changed.runtimeIds('node'), nextRuntimeIds);
    assert.deepEqual(commit.changed.runtimeIds('projection'), nextRuntimeIds);
    assert.deepEqual(commit.changed.runtimeIds('selection'), []);
    assert.deepEqual(commit.changed.topLevelRanges(), [[0, 0]]);
  });

  it('resolves a pure deletion to its surviving top-level boundary', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('before'),
        paragraph('removed'),
        paragraph('after'),
      ],
    });

    editor.update((tx) => tx.nodes.remove({ at: [1] }));

    const ranges = editorGetLastCommit(editor)?.changed.topLevelRanges();

    assert.deepEqual(ranges, [[1, 1]]);
    assert.equal(editorGetLastCommit(editor)?.changed.topLevelRanges(), ranges);
    assert.equal(Object.isFrozen(ranges), true);
    assert.equal(Object.isFrozen(ranges?.[0]), true);
  });

  it('reads top-level ranges without materializing runtime indexes', () => {
    const editor = createEditor();
    const before = paragraph('before');
    const beforeChildren = [before];
    const afterChildren = [before, paragraph('inserted')];
    const beforeValue = { children: beforeChildren };
    const afterValue = { children: afterChildren };
    const changes = DocumentChange.between(beforeValue, afterValue);
    const forbiddenIndex = {
      entries: () => {
        throw new Error('top-level range query materialized runtime entries');
      },
      idAt: () => {
        throw new Error('top-level range query resolved a runtime path');
      },
      pathOf: () => {
        throw new Error('top-level range query resolved a runtime id');
      },
    } satisfies SnapshotIndex;
    const commit = createEditorCommit(
      {
        after: {
          children: afterChildren,
          index: forbiddenIndex,
          selection: null,
          version: 1,
        },
        afterValue,
        annotations: {},
        before: {
          children: beforeChildren,
          index: forbiddenIndex,
          selection: null,
          version: 0,
        },
        beforeValue,
        changes,
        dirtyStateKeys: [],
        editor,
        effects: [],
        selectionAfter: null,
        selectionAfterRoot: 'main',
        selectionBefore: null,
        selectionBeforeRoot: 'main',
        selectionChanged: false,
        tags: [],
      },
      { previousVersion: 0, version: 1 }
    );

    assert.deepEqual(commit.changed.topLevelRanges(), [[1, 1]]);
  });

  it('keeps top-level split path impact scoped to shifted top-level runtime ids', () => {
    const editor = createEditor();

    editorReplace(editor, {
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
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const before = editorGetSnapshot(editor);
    const tableRuntimeId = before.index.idAt([1]);
    const tableRowRuntimeId = before.index.idAt([1, 0]);
    const unsubscribe = editorSubscribe(editor, () => {});

    assert(tableRuntimeId);
    assert(tableRowRuntimeId);

    editorInsertBreak(editor);
    unsubscribe();

    const commit = editorGetLastCommit(editor);

    assert(commit);
    assert.equal(commit.changed.has('root-order'), true);
    assert(!commit.changed.runtimeIds('node').includes(tableRuntimeId));
    assert(commit.changed.runtimeIds('path').includes(tableRuntimeId));
    assert(!commit.changed.runtimeIds('node').includes(tableRowRuntimeId));
  });
});
