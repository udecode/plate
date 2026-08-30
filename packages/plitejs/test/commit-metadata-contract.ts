import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  DocumentChange,
  defineExtension,
  defineEffect,
  defineStateField,
  defineUpdateAnnotation,
  type Editor,
  type Element,
  type EditorUpdatePolicy,
  type EditorUpdateTag,
  type SnapshotInput,
  type SnapshotIndex,
  type Value,
} from 'plitejs';

import { createEditorCommit } from '../src/core/commit';
import {
  getLastCommit as editorGetLastCommit,
  getNodeKey as editorGetNodeKey,
  getSnapshot as editorGetSnapshot,
  insertBreak as editorInsertBreak,
  replace as editorReplace,
  subscribe as editorSubscribe,
} from '../src/internal';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const replaceSnapshot = editorReplace as unknown as <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
  input: SnapshotInput
) => void;

describe('commit metadata contract', () => {
  it('captures update tags and selection before/after on text commits', () => {
    const editor = createEditor();

    replaceSnapshot(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const before = editorGetSnapshot(editor);
    const blockNodeKey = before.index.keyAt([0]);
    const textNodeKey = before.index.keyAt([0, 0]);

    assert.ok(blockNodeKey);
    assert.ok(textNodeKey);

    editor.update({ tags: ['history-push', 'paste'] }, (tx) => {
      tx.text.insert('!');
    });

    const commit = editorGetLastCommit(editor);

    assert.ok(commit);
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
    assert.equal(
      commit.selectionBefore
        ? Reflect.set(commit.selectionBefore.anchor.path, 0, 9)
        : true,
      false
    );
    assert.equal(
      commit.selectionAfter
        ? Reflect.set(commit.selectionAfter.focus, 'offset', 9)
        : true,
      false
    );
    assert.equal(commit.selectionChanged, true);
    assert.equal(commit.changed.has('document'), true);
    assert.equal(commit.changed.has('text'), true);
    assert.equal(commit.changed.has('snapshot'), true);
    assert.equal(commit.changed.has('structure'), false);
    assert.equal(commit.changed.has('properties'), false);
    assert.equal(commit.changed.has('root-order'), false);
    assert.equal(commit.changed.has('replace'), false);
    assert.deepEqual(commit.changed.nodeKeys('text'), [textNodeKey]);
    assert.deepEqual(commit.changed.topLevelRanges(), [[0, 0]]);
    assert.deepEqual(commit.changed.nodeKeys('node'), [
      blockNodeKey,
      textNodeKey,
    ]);
    assert.deepEqual(commit.changed.nodeKeys('projection'), [
      blockNodeKey,
      textNodeKey,
    ]);
    assert.deepEqual(commit.changed.nodeKeys('selection'), [
      textNodeKey,
      blockNodeKey,
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

    replaceSnapshot(editor, {
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
      nodeKeys: string[];
      source: string;
    } | null>({
      key: 'local.provenance.last-change',
      history: 'skip',
      initial: () => null,
    });
    const editor = createEditor({
      extensions: [
        defineExtension('local-provenance', {
          stateFields: [localProvenance],
        }),
      ] as const,
      initialValue: [paragraph('one')],
    });

    replaceSnapshot(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const blockNodeKey = editorGetNodeKey(editor, [0]);

    assert.ok(blockNodeKey);

    editor.update({ tags: ['paste', 'provenance-local'] }, (tx) => {
      tx.setField(localProvenance, {
        nodeKeys: [blockNodeKey],
        source: 'paste-html',
      });
      tx.text.insert('!');
    });

    const commit = editorGetLastCommit(editor);

    assert.ok(commit);
    assert.deepEqual(commit.tags, ['paste', 'provenance-local']);
    assert.deepEqual(
      editor.read((state) => state.getField(localProvenance)),
      {
        nodeKeys: [blockNodeKey],
        source: 'paste-html',
      }
    );
    assert.deepEqual(
      editor.read((state) => state.value()),
      { children: [paragraph('one!')] }
    );
    assert.equal(
      JSON.stringify(editor.read((state) => state.value())).includes(
        blockNodeKey
      ),
      false
    );
  });

  it('groups multiple primitive writes inside one update into one commit', () => {
    const editor = createEditor();
    const commits: Array<NonNullable<ReturnType<typeof editorGetLastCommit>>> =
      [];

    replaceSnapshot(editor, {
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

    assert.ok(commit);
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
    assert.equal(commit.changed.nodeKeys('text').length, 1);
    assert.equal(commit.changed.has('root-order'), false);
    assert.equal(commit.changed.has('replace'), false);
  });

  it('does not mark effect-only commits as state or snapshot changes', () => {
    const effect = defineEffect<string>({ key: 'metadata.effect-only' });
    const editor = createEditor({
      extensions: [
        defineExtension('metadata-effect-only', {
          effectTypes: [effect],
        }),
      ] as const,
    });

    editor.update((tx) => tx.effects.emit(effect, 'saved'));

    const commit = editorGetLastCommit(editor);

    assert.ok(commit);
    assert.deepEqual(commit.effects, [{ type: effect, value: 'saved' }]);
    assert.equal(commit.changed.has('state'), false);
    assert.equal(commit.changed.has('snapshot'), false);
  });

  it('does not mark annotation-only commits as state or snapshot changes', () => {
    const origin = defineUpdateAnnotation<string>({ key: 'metadata.origin' });
    const editor = createEditor();

    editor.update((tx) => tx.annotations.set(origin, 'keyboard'));

    const commit = editorGetLastCommit(editor);

    assert.ok(commit);
    assert.deepEqual(commit.annotations, { [origin.key]: 'keyboard' });
    assert.equal(commit.changed.has('state'), false);
    assert.equal(commit.changed.has('snapshot'), false);
  });

  it('marks full-document replacement as broad runtime dirtiness', () => {
    const editor = createEditor();

    replaceSnapshot(editor, {
      children: [paragraph('one')],
      selection: null,
    });

    const commit = editorGetLastCommit(editor);
    const snapshot = editorGetSnapshot(editor);
    const nextNodeKeys = [
      snapshot.index.keyAt([0]),
      snapshot.index.keyAt([0, 0]),
    ];

    assert.ok(commit);
    assert.equal(commit.changed.has('document'), true);
    assert.equal(commit.changed.has('replace'), true);
    assert.equal(commit.changed.has('structure'), true);
    assert.equal(commit.changed.has('root-order'), true);
    assert.deepEqual(commit.changed.nodeKeys('text'), [nextNodeKeys[1]]);
    assert.deepEqual(commit.changed.nodeKeys('node'), nextNodeKeys);
    assert.deepEqual(commit.changed.nodeKeys('projection'), nextNodeKeys);
    assert.deepEqual(commit.changed.nodeKeys('selection'), []);
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
      keyAt: () => {
        throw new Error('top-level range query resolved a runtime path');
      },
      pathOf: () => {
        throw new Error('top-level range query resolved a node key');
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

  it('keeps top-level split path impact scoped to shifted top-level node keys', () => {
    const editor = createEditor();

    replaceSnapshot(editor, {
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
    const tableNodeKey = before.index.keyAt([1]);
    const tableRowNodeKey = before.index.keyAt([1, 0]);
    const unsubscribe = editorSubscribe(editor, () => {});

    assert.ok(tableNodeKey);
    assert.ok(tableRowNodeKey);

    editorInsertBreak(editor);
    unsubscribe();

    const commit = editorGetLastCommit(editor);

    assert.ok(commit);
    assert.equal(commit.changed.has('root-order'), true);
    assert.ok(!commit.changed.nodeKeys('node').includes(tableNodeKey));
    assert.ok(commit.changed.nodeKeys('path').includes(tableNodeKey));
    assert.ok(!commit.changed.nodeKeys('node').includes(tableRowNodeKey));
  });
});
