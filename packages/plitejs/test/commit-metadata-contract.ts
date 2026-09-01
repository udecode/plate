import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  DocumentChange,
  defineExtension,
  defineEffect,
  defineStateField,
  defineUpdateAnnotation,
  RangeApi,
  type Editor,
  type Element,
  type EditorUpdatePolicy,
  type EditorUpdateTag,
  type SnapshotInput,
  type SnapshotIndex,
  type Value,
} from 'plitejs';

import { createEditorCommit } from '../src/core/commit';
import { getSnapshotIndexMappingStats } from '../src/core/snapshot-index';
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
  it('reports created and deleted root identities as presence changes', () => {
    const editor = createEditor({ initialValue: [paragraph('body')] });
    editor.update((tx) => tx.roots.create('header', [paragraph('header')]));
    const header = createEditorView(editor, { root: 'header' });
    const snapshot = editorGetSnapshot(header);
    const keys = snapshot.index.entries().map(([key]) => key);
    const created = editorGetLastCommit(editor)!;
    assert.deepEqual(
      new Set(created.changed.nodeKeys('presence', 'header')),
      new Set(keys)
    );
    assert.deepEqual(
      new Set(created.changed.nodeKeysAll('presence')),
      new Set(keys)
    );
    editor.update((tx) => tx.roots.delete('header'));
    const deleted = editorGetLastCommit(editor)!;
    assert.deepEqual(
      new Set(deleted.changed.nodeKeys('presence', 'header')),
      new Set(keys)
    );
    assert.deepEqual(
      new Set(deleted.changed.nodeKeysAll('presence')),
      new Set(keys)
    );
  });

  it('queries appended-node paths without enumerating untouched subtrees', () => {
    const editor = createEditor({
      initialValue: Array.from({ length: 1000 }, () => paragraph('text')),
    });
    const before = editorGetSnapshot(editor);
    editor.update.nodes.insert(paragraph('appended'), { at: [1000] });
    const actual = editorGetLastCommit(editor)!;
    const expected = [
      actual.after.index.keyAt([1000]),
      actual.after.index.keyAt([1000, 0]),
    ];
    let enumerated = 0;
    let keyReads = 0;
    let knownAbsentLookups = 0;
    const boundedIndex = (index: SnapshotIndex): SnapshotIndex => ({
      entries: () => {
        const entries = index.entries();
        enumerated += entries.length;
        return entries;
      },
      keyAt: (path) => {
        keyReads += 1;
        return index.keyAt(path);
      },
      pathOf: (key) => {
        if (index === before.index && expected.includes(key)) {
          knownAbsentLookups += 1;
        }
        return index.pathOf(key);
      },
    });
    const commit = createEditorCommit(
      {
        after: { ...actual.after, index: boundedIndex(actual.after.index) },
        afterValue: { children: actual.after.children },
        annotations: {},
        before: { ...before, index: boundedIndex(before.index) },
        beforeValue: { children: before.children },
        changes: actual.changes,
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
    assert.deepEqual(
      new Set(commit.changed.nodeKeysAll('path')),
      new Set(expected)
    );
    assert.equal(commit.changed.hasAny('root-order'), true);
    assert.equal(commit.changed.hasAny('structure'), true);
    assert.equal(enumerated, 0);
    assert.equal(knownAbsentLookups, 0);
    assert.ok(
      keyReads <= 64,
      `Read ${keyReads} paths for one appended paragraph`
    );
  });

  it('replaces one subtree without materializing unrelated runtime identities', () => {
    const editor = createEditor({
      initialValue: Array.from({ length: 1000 }, () => paragraph('text')),
    });
    const original = editorGetSnapshot(editor);
    const surviving = original.index.keyAt([1]);
    const replaced = original.index.keyAt([999]);
    assert.ok(surviving && replaced);
    editor.update.nodes.remove({ at: [0] });
    const before = editorGetSnapshot(editor);
    const lazy = getSnapshotIndexMappingStats(before.index);
    assert.ok(lazy.segments > 0);
    editor.update.nodes.replace(paragraph('replacement'), { at: [998] });
    assert.deepEqual(getSnapshotIndexMappingStats(before.index), lazy);
    const after = editorGetSnapshot(editor);
    assert.equal(after.index.keyAt([0]), surviving);
    assert.notEqual(after.index.keyAt([998]), replaced);
    assert.equal(after.index.pathOf(replaced), null);
    assert.deepEqual(before.index.pathOf(replaced), [998]);
    editor.update.text.insert('x', { at: { path: [998, 0], offset: 0 } });
    assert.equal(editorGetSnapshot(editor).index.pathOf(replaced), null);
  });

  it('matches selection-key membership for nested, backward, collapsed, and named-root transitions', () => {
    const editor = createEditor({
      initialValue: {
        children: [
          paragraph('one'),
          { type: 'quote', children: [paragraph('two'), paragraph('three')] },
          paragraph('four'),
        ],
        roots: { header: [paragraph('header'), paragraph('tail')] },
      },
    });
    const main = editorGetSnapshot(editor);
    const header = createEditorView(editor, { root: 'header' });
    const headerSnapshot = editorGetSnapshot(header);
    const points = [
      [0, 0],
      [1, 0, 0],
      [1, 1, 0],
      [2, 0],
    ];
    const expected = new Set<string>();
    let previous = new Set<string>();
    for (const [anchorIndex, focusIndex] of [
      [0, 3],
      [2, 1],
      [1, 1],
      [3, 0],
    ]) {
      const selection = {
        anchor: { path: points[anchorIndex], offset: 1 },
        focus: { path: points[focusIndex], offset: 1 },
      };
      editor.update.selection.set(selection);
      expected.clear();
      for (const [id, path] of main.index.entries()) {
        if (RangeApi.includes(selection, path)) expected.add(id);
      }
      const commit = editorGetLastCommit(editor)!;
      assert.deepEqual(
        new Set(commit.changed.nodeKeysAll('selection')),
        new Set([...previous, ...expected])
      );
      previous = new Set(expected);
    }
    const selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    };
    header.update.selection.set(selection);
    const commit = editorGetLastCommit(editor)!;
    const selectedHeader = headerSnapshot.index
      .entries()
      .filter(([, path]) => RangeApi.includes(selection, path))
      .map(([key]) => key);
    assert.deepEqual(
      new Set(commit.changed.nodeKeys('selection', 'header')),
      new Set(selectedHeader)
    );
    assert.deepEqual(new Set(commit.changed.nodeKeys('selection')), previous);
    assert.deepEqual(
      new Set(commit.changed.nodeKeysAll('selection')),
      new Set([...previous, ...selectedHeader])
    );
  });

  it('queries expanded selection keys without enumerating unrelated nodes', () => {
    const editor = createEditor({
      initialValue: Array.from({ length: 1000 }, () => paragraph('text')),
    });
    const before = editorGetSnapshot(editor);
    const selection = {
      anchor: { path: [998, 0], offset: 1 },
      focus: { path: [999, 0], offset: 2 },
    };
    editor.update.selection.set(selection);
    const actual = editorGetLastCommit(editor);
    assert.ok(actual);
    const expected = before.index
      .entries()
      .filter(([, path]) => RangeApi.includes(selection, path))
      .map(([key]) => key);
    let enumerated = 0;
    let keyReads = 0;
    const boundedIndex = (index: SnapshotIndex): SnapshotIndex => ({
      entries: () => {
        const entries = index.entries();
        enumerated += entries.length;
        return entries;
      },
      keyAt: (path) => {
        keyReads += 1;
        return index.keyAt(path);
      },
      pathOf: (key) => index.pathOf(key),
    });
    const commit = createEditorCommit(
      {
        after: { ...actual.after, index: boundedIndex(actual.after.index) },
        afterValue: { children: actual.after.children },
        annotations: {},
        before: { ...before, index: boundedIndex(before.index) },
        beforeValue: { children: before.children },
        changes: actual.changes,
        dirtyStateKeys: [],
        editor,
        effects: [],
        selectionAfter: actual.selectionAfter,
        selectionAfterRoot: 'main',
        selectionBefore: null,
        selectionBeforeRoot: 'main',
        selectionChanged: true,
        tags: [],
      },
      { previousVersion: 0, version: 1 }
    );

    assert.deepEqual(
      new Set(commit.changed.nodeKeysAll('selection')),
      new Set(expected)
    );
    for (const kind of ['node', 'path', 'text', 'presence'] as const) {
      assert.deepEqual(commit.changed.nodeKeysAll(kind), []);
    }
    assert.equal(commit.changed.hasAny('root-order'), false);
    assert.equal(enumerated, 0);
    assert.ok(keyReads <= 8, `Read ${keyReads} paths for a two-leaf selection`);
    const ids = commit.changed.nodeKeysAll('selection');
    editor.update.selection.set({
      anchor: selection.focus,
      focus: selection.anchor,
    });
    assert.deepEqual(
      new Set(editorGetLastCommit(editor)!.changed.nodeKeysAll('selection')),
      new Set(expected)
    );
    editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } });
    assert.equal(commit.changed.nodeKeysAll('selection'), ids);
  });

  it('resolves a known removed identity without materializing the current document', () => {
    const editor = createEditor({
      initialValue: Array.from({ length: 1000 }, () => paragraph('text')),
    });
    const before = editorGetSnapshot(editor);
    const removed = before.index.keyAt([0]);
    const last = before.index.keyAt([999]);
    assert.ok(removed && last);
    editor.update.nodes.remove({ at: [0] });
    const after = editorGetSnapshot(editor);
    const lazy = getSnapshotIndexMappingStats(after.index);
    assert.ok(lazy.segments > 0);
    assert.equal(after.index.pathOf(removed), null);
    assert.deepEqual(getSnapshotIndexMappingStats(after.index), lazy);
    assert.deepEqual(after.index.pathOf(last), [998]);
    editor.update.text.insert('x', { at: { path: [998, 0], offset: 0 } });
    assert.equal(editorGetSnapshot(editor).index.pathOf(removed), null);
    assert.deepEqual(before.index.pathOf(removed), [0]);
  });

  it('queries node presence without enumerating shifted paths or materializing indexes', () => {
    const editor = createEditor({
      initialValue: Array.from({ length: 1000 }, (_, index) =>
        paragraph(`text-${index}`)
      ),
    });
    const before = editorGetSnapshot(editor);
    const removed = [before.index.keyAt([0]), before.index.keyAt([0, 0])];
    const surviving = before.index.keyAt([999]);
    assert.ok(surviving);
    editor.update.nodes.remove({ at: [0] });
    const actual = editorGetLastCommit(editor);
    assert.ok(actual);
    let keyReads = 0;
    const boundedIndex = (index: SnapshotIndex): SnapshotIndex => ({
      entries: () => {
        throw new Error('Presence queries must not enumerate unrelated paths');
      },
      keyAt: (path) => {
        keyReads += 1;
        return index.keyAt(path);
      },
      pathOf: () => {
        throw new Error(
          'Presence queries must not search unrelated identities'
        );
      },
    });
    const commit = createEditorCommit(
      {
        after: { ...actual.after, index: boundedIndex(actual.after.index) },
        afterValue: { children: actual.after.children },
        annotations: {},
        before: { ...before, index: boundedIndex(before.index) },
        beforeValue: { children: before.children },
        changes: actual.changes,
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

    assert.deepEqual(
      new Set(commit.changed.nodeKeysAll('presence')),
      new Set(removed)
    );
    assert.equal(commit.changed.hasNodeKey(surviving, 'presence'), false);
    assert.ok(
      keyReads <= 8,
      `Read ${keyReads} runtime paths for one removed node`
    );
    assert.equal(
      commit.changed.nodeKeysAll('presence'),
      commit.changed.nodeKeysAll('presence')
    );
  });

  it('presence, paths, and root order match immutable snapshots through structural follow-up edits', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('first'),
        paragraph('second'),
        paragraph('third'),
      ],
    });
    const assertPresence = (edit: () => void) => {
      const beforeEntries = editorGetSnapshot(editor).index.entries();
      const beforePaths = new Map(beforeEntries);
      const before = new Set(beforePaths.keys());
      edit();
      const commit = editorGetLastCommit(editor);
      assert.ok(commit);
      const afterEntries = commit.after.index.entries();
      const after = new Set(afterEntries.map(([id]) => id));
      const changed = new Set(
        [...before, ...after].filter((id) => before.has(id) !== after.has(id))
      );
      assert.deepEqual(
        new Set(commit.changed.nodeKeysAll('presence')),
        changed
      );
      const changedPaths = afterEntries
        .filter(
          ([key, path]) =>
            JSON.stringify(beforePaths.get(key)) !== JSON.stringify(path)
        )
        .map(([key]) => key);
      assert.deepEqual(
        new Set(commit.changed.nodeKeysAll('path')),
        new Set(changedPaths)
      );
      const beforeOrder = beforeEntries
        .filter(([, path]) => path.length === 1)
        .map(([key]) => key);
      const afterOrder = afterEntries
        .filter(([, path]) => path.length === 1)
        .map(([key]) => key);
      assert.equal(
        commit.changed.hasAny('root-order'),
        JSON.stringify(beforeOrder) !== JSON.stringify(afterOrder)
      );
    };

    assertPresence(() =>
      editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } })
    );
    assertPresence(() => editor.update.nodes.move({ at: [2], to: [0] }));
    assertPresence(() =>
      editor.update.nodes.insert(paragraph('inserted'), { at: [1] })
    );
    assertPresence(() => editor.update.nodes.remove({ at: [0] }));
    assertPresence(() =>
      editor.update.nodes.split({
        at: { path: [1, 0], offset: 2 },
        match: (node) => 'children' in node,
      })
    );
    assertPresence(() => editor.update.nodes.merge({ at: [2] }));
    assertPresence(() =>
      editor.update.nodes.replace(paragraph('subtree'), { at: [0] })
    );
    assertPresence(() =>
      editor.update.value.replace({ children: [paragraph('replacement')] })
    );
  });

  it('scopes presence to the changed named root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header'), paragraph('keep')] },
      },
    });
    const header = createEditorView(editor, { root: 'header' });
    const removed = [
      editorGetNodeKey(header, [0]),
      editorGetNodeKey(header, [0, 0]),
    ];
    header.update.nodes.remove({ at: [0] });
    const commit = editorGetLastCommit(editor);
    assert.ok(commit);
    assert.deepEqual(commit.changed.nodeKeys('presence'), []);
    assert.deepEqual(
      new Set(commit.changed.nodeKeys('presence', 'header')),
      new Set(removed)
    );
    assert.deepEqual(
      new Set(commit.changed.nodeKeysAll('presence')),
      new Set(removed)
    );
  });

  it('reuses aggregate key snapshots and isolates membership by commit and kind', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });
    const before = editorGetSnapshot(editor);
    const first = before.index.keyAt([0, 0]);
    const second = before.index.keyAt([1, 0]);
    assert.ok(first && second);

    editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } });
    const original = editorGetLastCommit(editor);
    assert.ok(original);
    const ids = original.changed.nodeKeysAll('text');
    assert.deepEqual(ids, [first]);
    assert.equal(original.changed.nodeKeysAll('text'), ids);
    assert.equal(Object.isFrozen(ids), true);
    assert.equal(original.changed.hasNodeKey(first, 'text'), true);
    assert.equal(original.changed.hasNodeKey(second, 'text'), false);
    assert.equal(original.changed.hasNodeKey(first, 'path'), false);

    editor.update.text.insert('y', { at: { path: [1, 0], offset: 0 } });
    const next = editorGetLastCommit(editor);
    assert.ok(next);
    assert.equal(next.changed.hasNodeKey(first, 'text'), false);
    assert.equal(next.changed.hasNodeKey(second, 'text'), true);
    assert.equal(original.changed.nodeKeysAll('text'), ids);
    assert.equal(original.changed.hasNodeKey(second, 'text'), false);
  });

  it('retains surviving sibling identities when a removed node has overlapping text', () => {
    const editor = createEditor({
      initialValue: [paragraph('text'), paragraph('text'), paragraph('text')],
    });
    const original = editorGetSnapshot(editor);
    const keys = [0, 1, 2].map((index) => original.index.keyAt([index]));

    editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } });
    const before = editorGetSnapshot(editor);
    editor.update.nodes.remove({ at: [0] });
    const commit = editor.read.lastCommit();

    assert.ok(commit);
    assert.equal(commit.after.index.keyAt([0]), keys[1]);
    assert.equal(commit.after.index.keyAt([1]), keys[2]);
    assert.deepEqual(
      before.index.entries().filter(([, path]) => path.length === 1),
      keys.map((key, index) => [key, [index]])
    );
    assert.ok(commit.changed.nodeKeys('projection').includes(keys[0]!));
    assert.equal(commit.after.index.pathOf(keys[0]!), null);
  });

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
