import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  definePlugin,
  definePluginSlot,
  DocumentChange,
  type EditorCommit,
} from 'plitejs';
import { authored, type AuthoredChangePublication } from 'plitejs/authored';
import { history } from 'plitejs/history';

import { encodeAuthoredPositionRoots } from '../src/authored/positions-codec';
import { records } from '../src/authored/record-tree';
import {
  authoredState,
  checksumAuthoredPayload,
  indexAuthoredState,
  materializeAuthoredEdit,
} from '../src/authored/state';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number, block = 0) => ({ path: [block, 0], offset });

describe('native authored changes', () => {
  it('publishes one retained proposal without changing accepted content', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Accepted')],
    });
    const commits: EditorCommit[] = [];
    editor.subscribeCommit((commit) => commits.push(commit));
    let changeId = '';
    editor.update((tx) => {
      changeId = tx.authored.propose();
      tx.text.insert(' proposed', { at: point(8) });
      tx.text.insert('!', { at: point(17) });
      assert.deepEqual(tx.children(), [paragraph('Accepted proposed!')]);
    });
    assert.deepEqual(editor.read.children(), [paragraph('Accepted')]);
    assert.deepEqual(editor.read.value().children, [paragraph('Accepted')]);
    assert.equal(commits.length, 1);
    assert.equal(commits[0].changes.empty, true);
    assert.equal(commits[0].changed.has('document'), false);
    assert.deepEqual(commits[0].dirtyStateKeys, ['authored']);
    assert.equal(editor.read.authored.changes().items.length, 1);
    assert.equal(editor.read.authored.change(changeId)?.authorId, 'alice');
    assert.equal(editor.read.authored.change(changeId)?.status, 'pending');
    assert.equal(editor.read.authored.change(changeId)?.revision, 1);
    assert.equal(Object.isFrozen(editor.read.authored.change(changeId)), true);
    assert.ok(editor.read.value().meta?.authored);
  });

  it('publishes focused immutable presentation invalidation for authored state', () => {
    const plugin = authored({ authorId: 'alice' });
    const editor = createEditor({
      plugins: [plugin],
      initialValue: [paragraph('Accepted'), paragraph('Unrelated')],
    });
    const proposed = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'markup' },
    });
    const key = proposed.key([0, 0]);
    assert.ok(key);
    const publications: AuthoredChangePublication[] = [];
    const stop = proposed
      .plugin(plugin)
      .api.subscribeChanges((publication) => publications.push(publication));
    let changeId = '';

    proposed.update((tx) => {
      changeId = tx.authored.propose();
      tx.text.insert(' proposed', { at: point(8) });
    });

    assert.equal(publications.length, 1);
    assert.deepEqual(publications[0].changeIds, [changeId]);
    assert.equal(publications[0].documentChanged, false);
    assert.deepEqual(publications[0].nodeKeys, [key]);
    assert.equal(Object.isFrozen(publications[0]), true);
    assert.equal(Object.isFrozen(publications[0].changeIds), true);
    assert.equal(Object.isFrozen(publications[0].nodeKeys), true);

    stop();
    proposed.update((tx) => {
      tx.authored.propose();
      tx.text.insert('!', { at: point(17) });
    });
    assert.equal(publications.length, 1);
  });

  it('indexes visible changes by range for presentation', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base'), paragraph('Other')],
    });
    const proposed = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });
    let changeId = '';
    proposed.update((tx) => {
      changeId = tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });

    assert.deepEqual(
      proposed.read.authored
        .changesAt({ anchor: point(0), focus: point(10) })
        .map(({ id }) => id),
      [changeId]
    );
    assert.deepEqual(
      proposed.read.authored.changesAt({
        anchor: point(0, 1),
        focus: point(5, 1),
      }),
      []
    );
    assert.throws(
      () => proposed.read.authored.changesAt({} as never),
      /requires a range/
    );
  });

  it('discovers block-local changes beyond the page limit after unrelated commits', () => {
    const count = 205;
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: Array.from({ length: count + 1 }, () => paragraph('Base')),
    });
    const proposed = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });
    const ids: string[] = [];
    for (let block = 0; block < count; block++) {
      proposed.update((tx) => {
        ids.push(tx.authored.propose());
        tx.text.insert('!', { at: point(4, block) });
      });
    }

    assert.equal(
      proposed.read.authored.changes({ limit: 200 }).items.length,
      200
    );
    assert.deepEqual(
      proposed.read.authored
        .changesAt({ anchor: point(4, count - 1), focus: point(5, count - 1) })
        .map(({ id }) => id),
      [ids[count - 1]]
    );

    editor.update.text.insert('!', { at: point(4, count) });
    assert.deepEqual(
      proposed.read.authored
        .changesAt({ anchor: point(4), focus: point(5) })
        .map(({ id }) => id),
      [ids[0]]
    );
  });

  it('filters block candidates by their exact ranges', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('0123456789')],
    });
    const proposed = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });
    const ids: string[] = [];
    for (const offset of [2, 8]) {
      proposed.update((tx) => {
        ids.push(tx.authored.propose());
        tx.text.insert('!', { at: point(offset) });
      });
    }

    assert.deepEqual(
      proposed.read.authored
        .changesAt({ anchor: point(2), focus: point(3) })
        .map(({ id }) => id),
      [ids[0]]
    );
  });

  it('discovers pending and conflicted changes from their local blocks', () => {
    const plugin = authored({ authorId: 'alice' });
    const original = createEditor({
      plugins: [plugin],
      initialValue: [paragraph('First'), paragraph('Second')],
    });
    const ids = [0, 1].map((block) => {
      let id = '';
      original.update((tx) => {
        id = tx.authored.propose();
        tx.text.insert('!', { at: point(5 + block, block) });
      });
      return id;
    });
    const saved = JSON.parse(JSON.stringify(original.read.value()));
    const author = createEditor({ plugins: [plugin], initialValue: saved });
    const reviewer = createEditor({ plugins: [plugin], initialValue: saved });
    const effects: Array<EditorCommit['effects'][number]> = [];
    author.subscribeCommit((commit) => {
      effects.push(
        ...commit.effects.filter(
          ({ type }) => type.key === 'authored.operation'
        )
      );
    });
    reviewer.subscribeCommit((commit) => {
      effects.push(
        ...commit.effects.filter(
          ({ type }) => type.key === 'authored.operation'
        )
      );
    });
    author.update((tx) => {
      tx.authored.propose({ changeId: ids[0] });
      tx.text.insert('x', { at: point(6) });
    });
    reviewer.update.authored.decide({
      action: 'accept',
      selection: reviewer.read.authored.select({ ids: [ids[0]] }),
    });
    const merged = createEditor({ plugins: [plugin], initialValue: saved });
    merged.update((tx) => {
      for (const effect of effects) tx.effects.emit(effect.type, effect.value);
    });
    const view = createEditorView(merged, {
      authored: { intent: 'propose', projection: 'proposed' },
    });

    assert.equal(merged.read.authored.change(ids[0])?.status, 'conflicted');
    assert.equal(merged.read.authored.change(ids[1])?.status, 'pending');
    assert.deepEqual(
      view.read.authored
        .changesAt({ anchor: point(0), focus: point(7) })
        .map(({ id }) => id),
      [ids[0]]
    );
    assert.deepEqual(
      view.read.authored
        .changesAt({ anchor: point(0, 1), focus: point(8, 1) })
        .map(({ id }) => id),
      [ids[1]]
    );
    assert.deepEqual(
      view.read.authored
        .changesAt({ anchor: point(0), focus: point(8, 1) })
        .map(({ id }) => id),
      [ids[1], ids[0]]
    );
  });

  it('reloads a proposal and amends the same logical contribution', () => {
    const plugin = authored({ authorId: 'alice' });
    const editor = createEditor({
      plugins: [plugin],
      initialValue: [paragraph('Base')],
    });
    let changeId = '';
    editor.update((tx) => {
      changeId = tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    const restored = createEditor({
      plugins: [plugin],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    restored.update((tx) => {
      assert.equal(tx.authored.propose({ changeId }), changeId);
      assert.deepEqual(tx.children(), [paragraph('Base draft')]);
      tx.text.insert('!', { at: point(10) });
    });
    assert.deepEqual(restored.read.children(), [paragraph('Base')]);
    assert.equal(restored.read.authored.changes().items.length, 1);
    assert.equal(restored.read.authored.change(changeId)?.revision, 2);
  });

  it('loads v1 authored state once and saves the current checkpoint', () => {
    const plugin = authored({ authorId: 'alice' });
    const editor = createEditor({
      plugins: [plugin],
      initialValue: [paragraph('Base')],
    });
    let changeId = '';
    editor.update((tx) => {
      changeId = tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    const state = editor.read.getField(authoredState);
    const legacy = JSON.parse(
      JSON.stringify({
        children: editor.read.children(),
        meta: {
          authored: {
            value: {
              acceptedPositions: encodeAuthoredPositionRoots(
                state.acceptedPositions
              ),
              documentId: state.documentId,
              operations: state.operations,
            },
            version: 1,
          },
        },
      })
    );
    const restored = createEditor({
      plugins: [plugin],
      initialValue: legacy,
    });
    const proposed = createEditorView(restored, {
      authored: { intent: 'propose', projection: 'proposed' },
    });

    assert.deepEqual(restored.read.children(), [paragraph('Base')]);
    assert.deepEqual(proposed.read.children(), [paragraph('Base draft')]);
    assert.equal(restored.read.authored.change(changeId)?.status, 'pending');
    const saved = JSON.parse(JSON.stringify(restored.read.value()));
    assert.equal(saved.meta.authored.version, 6);
    assert.ok(Array.isArray(saved.meta.authored.value.changes));
    assert.ok(Array.isArray(saved.meta.authored.value.operations));

    const reopened = createEditor({
      plugins: [plugin],
      initialValue: saved,
    });
    const selection = reopened.read.authored.select({ ids: [changeId] });
    assert.equal(
      reopened.update.authored.decide({ action: 'accept', selection }).status,
      'applied'
    );
    assert.deepEqual(reopened.read.children(), [paragraph('Base draft')]);
  });

  it('loads a v2 authored checkpoint and saves the current checkpoint', () => {
    const plugin = authored({ authorId: 'alice' });
    const editor = createEditor({
      plugins: [plugin],
      initialValue: [paragraph('Base')],
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    const current = JSON.parse(JSON.stringify(editor.read.value()));
    const direct = current.meta.authored.value as {
      changes: unknown[][];
      operations: unknown[][];
    } & Record<string, unknown>;
    const changes = direct.changes.map((change) => ({
      authorId: change[0],
      createdAt: change[1],
      dependencies: change[2],
      heads: change[3],
      id: change[4],
      kind: change[5],
      operations: change[6],
      reviews: change[7],
      revision: change[8],
      status: change[9],
      updatedAt: change[10],
    }));
    const operations = direct.operations.map((operation) =>
      operation[0] === 0
        ? [...operation.slice(0, 14), JSON.parse(operation[15] as string)]
        : operation
    );
    const payload = JSON.stringify({ ...direct, changes, operations });
    current.meta.authored = {
      value: { digest: checksumAuthoredPayload(payload), payload },
      version: 2,
    };

    const restored = createEditor({
      plugins: [plugin],
      initialValue: current,
    });
    assert.deepEqual(
      createEditorView(restored, {
        authored: { intent: 'propose', projection: 'proposed' },
      }).read.children(),
      [paragraph('Base draft')]
    );
    assert.equal(
      JSON.parse(JSON.stringify(restored.read.value())).meta.authored.version,
      6
    );
  });

  it('loads a v3 authored checkpoint and saves the current checkpoint', () => {
    const plugin = authored({ authorId: 'alice' });
    const editor = createEditor({
      plugins: [plugin],
      initialValue: [paragraph('Base')],
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    const legacy = JSON.parse(JSON.stringify(editor.read.value()));
    legacy.meta.authored.version = 3;
    legacy.meta.authored.value.operations =
      legacy.meta.authored.value.operations.map((operation: unknown[]) =>
        operation[0] === 0
          ? [...operation.slice(0, 14), JSON.parse(operation[15] as string)]
          : operation
      );

    const restored = createEditor({
      plugins: [plugin],
      initialValue: legacy,
    });

    assert.deepEqual(
      createEditorView(restored, {
        authored: { intent: 'propose', projection: 'proposed' },
      }).read.children(),
      [paragraph('Base draft')]
    );
    assert.equal(
      JSON.parse(JSON.stringify(restored.read.value())).meta.authored.version,
      6
    );
  });

  it('loads a v5 authored checkpoint and saves persisted content footprints', () => {
    const plugin = authored({ authorId: 'alice' });
    const editor = createEditor({
      plugins: [plugin],
      initialValue: [paragraph('Base')],
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    const legacy = JSON.parse(JSON.stringify(editor.read.value()));
    legacy.meta.authored.version = 5;
    legacy.meta.authored.value.operations =
      legacy.meta.authored.value.operations.map((operation: unknown[]) =>
        operation[0] === 0 ? operation.slice(0, 16) : operation
      );

    const restored = createEditor({
      plugins: [plugin],
      initialValue: legacy,
    });
    const saved = JSON.parse(JSON.stringify(restored.read.value()));

    assert.equal(saved.meta.authored.version, 6);
    const edit = saved.meta.authored.value.operations.find(
      (operation: unknown[]) => operation[0] === 0
    );
    assert.equal(edit.length, 17);
    assert.ok(edit[16].steps.length > 0);
  });

  it('rebuilds live indexes from v6 footprints without hydrating retained bodies', () => {
    const propertyEditor = createEditor({
      plugins: [authored({ authorId: 'alice', retainHistory: true })],
      initialValue: [paragraph('Base')],
    });
    propertyEditor.update((tx) => {
      tx.authored.propose();
      tx.nodes.set({ bold: true }, { at: [0, 0] });
    });

    const deletionEditor = createEditor({
      plugins: [authored({ authorId: 'alice', retainHistory: true })],
      initialValue: [paragraph('Base')],
    });
    createEditorView(deletionEditor, {
      authored: { intent: 'propose', projection: 'proposed' },
    }).update.text.delete({
      at: { anchor: point(0), focus: point(4) },
    });

    const compensationEditor = createEditor({
      plugins: [
        history(),
        authored({ authorId: 'alice', retainHistory: true }),
      ],
      initialValue: [paragraph('Base')],
    });
    compensationEditor.update.text.insert('!', { at: point(4) });
    assert.equal(compensationEditor.api.history.undo().status, 'applied');

    for (const [editor, kind] of [
      [propertyEditor, 'property'],
      [deletionEditor, 'deletion'],
      [compensationEditor, 'compensation'],
    ] as const) {
      const persistedIndex = indexAuthoredState(
        editor.read.getField(authoredState)
      );
      if (kind === 'property') {
        assert.ok(persistedIndex.properties ?? persistedIndex.textProperties);
      } else if (kind === 'deletion') {
        assert.ok(persistedIndex.deletions);
      } else {
        assert.ok(persistedIndex.compensations);
      }
      const saved = JSON.parse(JSON.stringify(editor.read.value()));
      for (const operation of saved.meta.authored.value.operations) {
        if (operation[0] !== 0) continue;
        operation[15] = '{';
        operation[14] = checksumAuthoredPayload(operation[15]);
      }

      const restored = createEditor({
        plugins: [authored({ authorId: 'reader', retainHistory: true })],
        initialValue: saved,
      });
      const restoredState = restored.read.getField(authoredState);
      const restoredIndex = indexAuthoredState(restoredState);
      if (kind === 'property') {
        assert.deepEqual(restoredIndex.properties, persistedIndex.properties);
        assert.deepEqual(
          restoredIndex.textProperties,
          persistedIndex.textProperties
        );
      } else if (kind === 'deletion') {
        const normalize = (index: typeof persistedIndex.deletions) =>
          [...records(index)].flatMap(([position, entries]) =>
            [...records(entries)].map(([order, deletion]) => ({
              ...deletion,
              order,
              position,
              target: { ...deletion.target, retained: null },
            }))
          );
        assert.deepEqual(
          normalize(restoredIndex.deletions),
          normalize(persistedIndex.deletions)
        );
      } else {
        assert.deepEqual(
          restoredIndex.compensations,
          persistedIndex.compensations
        );
      }
      const deferred = [...records(restoredState.operations)]
        .map(([, operation]) => operation)
        .find(
          (operation) => operation.kind === 'edit' && 'content' in operation
        );
      assert.ok(deferred);
      assert.throws(() => materializeAuthoredEdit(deferred));
    }
  });

  it('captures direct canonical writes with one transaction identity', () => {
    let identity = 'alice';
    let identityReads = 0;
    let identityEditor: object | null = null;
    const editor = createEditor({
      plugins: [
        authored({
          authorId: (currentEditor) => {
            identityReads += 1;
            identityEditor = currentEditor;
            return identity;
          },
          retainHistory: true,
        }),
      ],
      initialValue: [paragraph('Before')],
    });
    const change = DocumentChange.between(editor.read.value(), {
      children: [paragraph('After')],
    });
    editor.update((tx) => {
      tx.changes.apply(change);
      identity = 'bob';
      tx.text.insert('!', { at: point(5) });
    });
    assert.equal(identityReads, 1);
    assert.equal(identityEditor, editor);
    assert.deepEqual(editor.read.children(), [paragraph('After!')]);
    assert.equal(editor.read.authored.changes().items[0].authorId, 'alice');
    assert.equal(editor.read.authored.changes().items[0].status, 'accepted');
  });

  it('rolls back missing identity, late intent and aborted proposal state', () => {
    let identity: string | null = 'alice';
    const editor = createEditor({
      plugins: [authored({ authorId: () => identity })],
      initialValue: [paragraph('Base')],
    });
    const before = JSON.stringify(editor.read.value());
    let commits = 0;
    editor.subscribeCommit(() => (commits += 1));
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.authored.propose();
          tx.text.insert(' lost', { at: point(4) });
          throw new Error('abort');
        }),
      /abort/
    );
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.text.insert(' lost', { at: point(4) });
          tx.authored.propose();
        }),
      /before the first document mutation/
    );
    identity = null;
    assert.throws(
      () => editor.update.text.insert('lost', { at: point(4) }),
      /author ID is required/
    );
    assert.throws(
      () => editor.update((tx) => tx.authored.propose()),
      /author ID is required/
    );
    assert.equal(JSON.stringify(editor.read.value()), before);
    assert.equal(commits, 0);
    identity = 'alice';
    editor.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [paragraph('Base')]);
      tx.text.insert(' saved', { at: point(4) });
    });
    assert.equal(editor.read.authored.changes().items.length, 1);
  });

  it('preserves independent accepted edits through proposal reload', () => {
    const plugin = authored({ authorId: 'alice', retainHistory: true });
    const editor = createEditor({
      plugins: [plugin],
      initialValue: [paragraph('A'), paragraph('B')],
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: point(1) });
    });
    editor.update.text.insert(' accepted', { at: point(1, 1) });
    assert.deepEqual(editor.read.children(), [
      paragraph('A'),
      paragraph('B accepted'),
    ]);
    const restored = createEditor({
      plugins: [plugin],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    restored.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [
        paragraph('A draft'),
        paragraph('B accepted'),
      ]);
      tx.text.insert('!', { at: point(6) });
    });
    assert.deepEqual(restored.read.children(), [
      paragraph('A'),
      paragraph('B accepted'),
    ]);
  });

  it('derives text and container dependencies while leaving adjacent edits independent', () => {
    let authorId = 'alice';
    const editor = createEditor({
      plugins: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    let parent = '';
    editor.update((tx) => {
      parent = tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    authorId = 'bob';
    let child = '';
    editor.update((tx) => {
      child = tx.authored.propose();
      tx.text.insert('B', { at: point(7) });
    });
    assert.deepEqual(editor.read.authored.change(child)?.dependencies, [
      parent,
    ]);
    let adjacent = '';
    editor.update((tx) => {
      adjacent = tx.authored.propose();
      tx.text.insert('!', { at: point(11) });
    });
    assert.deepEqual(editor.read.authored.change(adjacent)?.dependencies, []);
    authorId = 'alice';
    let container = '';
    editor.update((tx) => {
      container = tx.authored.propose();
      tx.nodes.insert(paragraph('Parent'), { at: [1] });
    });
    authorId = 'bob';
    let nested = '';
    editor.update((tx) => {
      nested = tx.authored.propose();
      tx.text.insert(' child', { at: point(6, 1) });
    });
    assert.deepEqual(editor.read.authored.change(nested)?.dependencies, [
      container,
    ]);
    const restored = createEditor({
      plugins: [authored({ authorId: 'bob' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    assert.deepEqual(restored.read.authored.change(child)?.dependencies, [
      parent,
    ]);
    assert.deepEqual(restored.read.authored.change(nested)?.dependencies, [
      container,
    ]);
  });

  it('tracks conflicting property writes without depending on unrelated properties', () => {
    let authorId = 'alice';
    const editor = createEditor({
      plugins: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    let format = '';
    editor.update((tx) => {
      format = tx.authored.propose();
      tx.nodes.set({ bold: true }, { at: [0, 0] });
    });
    authorId = 'bob';
    let independent = '';
    editor.update((tx) => {
      independent = tx.authored.propose();
      tx.nodes.set({ italic: true }, { at: [0, 0] });
    });
    assert.deepEqual(
      editor.read.authored.change(independent)?.dependencies,
      []
    );
    let dependent = '';
    editor.update((tx) => {
      dependent = tx.authored.propose();
      tx.nodes.set({ bold: false }, { at: [0, 0] });
    });
    assert.deepEqual(editor.read.authored.change(dependent)?.dependencies, [
      format,
    ]);
  });

  it('blocks incomplete decisions and accepts a parent without accepting its child', () => {
    let authorId = 'alice';
    const editor = createEditor({
      plugins: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    let parent = '';
    editor.update((tx) => {
      parent = tx.authored.propose();
      tx.nodes.insert(paragraph('Parent'), { at: [1] });
    });
    authorId = 'bob';
    let child = '';
    editor.update((tx) => {
      child = tx.authored.propose();
      tx.text.insert(' child', { at: point(6, 1) });
    });
    const snapshot = JSON.stringify(editor.read.value());
    const parentSelection = editor.read.authored.select({ ids: [parent] });
    const childSelection = editor.read.authored.select({ ids: [child] });
    assert.deepEqual(
      editor.update.authored.decide({
        action: 'accept',
        selection: childSelection,
      }),
      {
        status: 'blocked',
        ids: [child],
        dependencies: [parent],
        dependants: [],
        conflicts: [],
      }
    );
    assert.deepEqual(
      editor.update.authored.decide({
        action: 'reject',
        selection: parentSelection,
      }),
      {
        status: 'blocked',
        ids: [parent],
        dependencies: [],
        dependants: [child],
        conflicts: [],
      }
    );
    assert.equal(JSON.stringify(editor.read.value()), snapshot);
    assert.equal(
      editor.read.authored.preview({
        action: 'accept',
        selection: parentSelection,
      }).status,
      'applied'
    );
    assert.equal(JSON.stringify(editor.read.value()), snapshot);
    authorId = 'reviewer';
    assert.equal(
      editor.update.authored.decide({
        action: 'accept',
        selection: parentSelection,
      }).status,
      'applied'
    );
    assert.deepEqual(editor.read.children(), [
      paragraph('Base'),
      paragraph('Parent'),
    ]);
    assert.equal(editor.read.authored.change(parent)?.authorId, 'alice');
    assert.equal(editor.read.authored.change(parent)?.status, 'accepted');
    assert.equal(editor.read.authored.change(child)?.status, 'pending');
    const restored = createEditor({
      plugins: [authored({ authorId: 'reviewer' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    restored.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [
        paragraph('Base'),
        paragraph('Parent child'),
      ]);
    });
    assert.equal(
      restored.update.authored.decide({
        action: 'reject',
        selection: restored.read.authored.select({ ids: [child] }),
      }).status,
      'applied'
    );
    restored.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [paragraph('Base'), paragraph('Parent')]);
    });
  });

  it('rejects a complete dependent batch and preserves an independent accepted edit', () => {
    let authorId = 'alice';
    const editor = createEditor({
      plugins: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('A'), paragraph('B')],
    });
    let parent = '';
    editor.update((tx) => {
      parent = tx.authored.propose();
      tx.text.insert(' draft', { at: point(1) });
    });
    authorId = 'bob';
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' child', { at: point(4) });
    });
    editor.update.text.insert(' accepted', { at: point(1, 1) });
    const selected = editor.read.authored.select({ status: 'pending' });
    assert.equal(selected.changes.length, 2);
    let commits = 0;
    editor.subscribeCommit(() => (commits += 1));
    assert.equal(
      editor.update.authored.decide({ selection: selected, action: 'reject' })
        .status,
      'applied'
    );
    assert.equal(commits, 1);
    assert.deepEqual(editor.read.children(), [
      paragraph('A'),
      paragraph('B accepted'),
    ]);
    editor.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [
        paragraph('A'),
        paragraph('B accepted'),
      ]);
    });
    assert.equal(editor.read.authored.change(parent)?.status, 'rejected');
    const restored = createEditor({
      plugins: [authored({ authorId: 'bob' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    restored.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [
        paragraph('A'),
        paragraph('B accepted'),
      ]);
    });
  });

  it('binds author batches to exact revisions and leaves later changes outside the selection', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    let first = '';
    editor.update((tx) => {
      first = tx.authored.propose();
      tx.text.insert(' first', { at: point(4) });
    });
    const stale = editor.read.authored.select({
      authorId: 'alice',
      status: 'pending',
    });
    editor.update((tx) => {
      tx.authored.propose({ changeId: first });
      tx.text.insert('!', { at: point(10) });
    });
    assert.deepEqual(
      editor.update.authored.decide({ selection: stale, action: 'accept' }),
      { status: 'stale', ids: [first] }
    );
    const frozen = editor.read.authored.select({
      authorId: 'alice',
      status: 'pending',
    });
    let second = '';
    editor.update((tx) => {
      second = tx.authored.propose();
      tx.nodes.insert(paragraph('Second'), { at: [1] });
    });
    assert.equal(
      editor.update.authored.decide({ selection: frozen, action: 'accept' })
        .status,
      'applied'
    );
    assert.deepEqual(editor.read.children(), [paragraph('Base first!')]);
    assert.equal(editor.read.authored.change(second)?.status, 'pending');
    assert.deepEqual(
      editor.update.authored.decide({
        selection: editor.read.authored.select({ ids: [] }),
        action: 'reject',
      }),
      { status: 'unchanged', ids: [] }
    );
  });

  it('rolls back a decided batch when the surrounding transaction fails', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    const before = JSON.stringify(editor.read.value());
    const selection = editor.read.authored.select({ status: 'pending' });
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.authored.decide({ selection, action: 'accept' });
          throw new Error('abort decision');
        }),
      /abort decision/
    );
    assert.equal(JSON.stringify(editor.read.value()), before);
    editor.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [paragraph('Base draft')]);
    });
    editor.update((tx) => {
      tx.authored.decide({ selection, action: 'accept' });
      tx.text.insert(' suffix', { at: point(10) });
    });
    assert.deepEqual(editor.read.children(), [paragraph('Base draft suffix')]);
    assert.equal(
      editor.read.authored.change(selection.changes[0].id)?.status,
      'accepted'
    );
  });

  it('ignores duplicate authored delivery and rejects identity reuse with another payload', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    const commits: EditorCommit[] = [];
    editor.subscribeCommit((commit) => commits.push(commit));
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    const effect = commits[0].effects.find(
      (candidate) => candidate.type.key === 'authored.operation'
    );
    assert.ok(effect);
    const before = JSON.stringify(editor.read.value());
    editor.update((tx) => tx.effects.emit(effect.type, effect.value));
    assert.equal(commits.length, 1);
    assert.equal(JSON.stringify(editor.read.value()), before);
    const changed = JSON.parse(JSON.stringify(effect.value));
    changed.operations[0].authorId = 'bob';
    assert.throws(
      () => editor.update((tx) => tx.effects.emit(effect.type, changed)),
      /identity collision/
    );
    assert.equal(JSON.stringify(editor.read.value()), before);
    assert.equal(commits.length, 1);
  });

  it('resolves display ranges through independent edits and decisions', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    let identity = '';
    editor.update((tx) => {
      identity = tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    assert.deepEqual(editor.read.authored.change(identity)?.ranges, [
      { anchor: point(4), focus: point(4) },
    ]);
    editor.update.text.insert('Before ', { at: point(0) });
    assert.deepEqual(editor.read.authored.change(identity)?.ranges, [
      { anchor: point(11), focus: point(11) },
    ]);
    editor.update.authored.decide({
      action: 'accept',
      selection: editor.read.authored.select({ ids: [identity] }),
    });
    assert.deepEqual(editor.read.authored.change(identity)?.ranges, [
      { anchor: point(11), focus: point(17) },
    ]);
  });

  it('preserves attribution through replacement, rollback and removal', () => {
    const slot = definePluginSlot('author');
    const editor = createEditor({
      plugins: [slot.of(authored({ authorId: 'alice' }))],
      initialValue: [paragraph('Base')],
    });
    editor.update.text.insert('a', { at: point(4) });
    editor.update.plugins.reconfigure(slot, authored({ authorId: 'bob' }));
    editor.update.text.insert('b', { at: point(5) });
    assert.deepEqual(
      editor.read.authored.changes().items.map((change) => change.authorId),
      ['alice', 'bob']
    );
    const before = JSON.stringify(editor.read.value());
    assert.throws(
      () =>
        editor.update.plugins.reconfigure(slot, [
          authored({ authorId: 'charlie' }),
          definePlugin('broken', {
            activate() {
              throw new Error('broken activation');
            },
          }),
        ]),
      /broken activation/
    );
    assert.equal(JSON.stringify(editor.read.value()), before);
    editor.update.text.insert('c', { at: point(6) });
    assert.equal(editor.read.authored.changes().items.at(-1)?.authorId, 'bob');
    editor.update.plugins.reconfigure(slot, []);
    assert.throws(
      () => editor.update.text.insert('lost', { at: point(7) }),
      /authored/i
    );
    assert.deepEqual(editor.read.children(), [paragraph('Baseabc')]);
  });

  it('rejects corrupted checkpoint operations and unknown payload versions', () => {
    const plugin = authored({ authorId: 'alice' });
    const editor = createEditor({
      plugins: [plugin],
      initialValue: [paragraph('Base')],
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: point(4) });
    });
    const saved = JSON.stringify(editor.read.value());
    type SavedCheckpoint = {
      meta: {
        authored: {
          value: Payload;
          version: number;
        };
      };
    };
    type Payload = {
      changes: unknown[][];
      documentId: string;
      extra?: boolean;
      operations: unknown[][];
      projectedPositions: unknown;
    };
    const mutatePayload = (
      value: SavedCheckpoint,
      mutate: (payload: Payload) => void
    ) => {
      mutate(value.meta.authored.value);
    };
    const corruptions: Array<(value: SavedCheckpoint) => void> = [
      (value) => (value.meta.authored.version = 7),
      (value) => mutatePayload(value, (payload) => (payload.documentId = '')),
      (value) =>
        mutatePayload(value, (payload) => {
          payload.operations[0][3] = 0;
        }),
      (value) =>
        mutatePayload(value, (payload) => {
          payload.operations[0][1] = '';
        }),
      (value) =>
        mutatePayload(value, (payload) => {
          payload.operations[0][14] = '0000000000000000';
        }),
      (value) =>
        mutatePayload(value, (payload) => {
          payload.operations[0][16] = null;
        }),
      (value) =>
        mutatePayload(value, (payload) => {
          payload.operations.push(payload.operations[0]);
        }),
      (value) =>
        mutatePayload(value, (payload) => {
          payload.changes[0][9] = 'accepted';
        }),
      (value) => mutatePayload(value, (payload) => (payload.extra = true)),
      (value) =>
        mutatePayload(value, (payload) => {
          payload.projectedPositions = 'invalid';
        }),
    ];
    for (const mutate of corruptions) {
      const value: SavedCheckpoint = JSON.parse(saved);
      mutate(value);
      assert.throws(() =>
        createEditor({ plugins: [plugin], initialValue: value })
      );
    }
    assert.equal(JSON.stringify(editor.read.value()), saved);
  });

  it('rejects a causal vector that drops an ancestor observed by its parent', () => {
    let editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    for (let index = 0; index < 3; index++) {
      if (index) {
        editor = createEditor({
          plugins: [authored({ authorId: 'alice' })],
          initialValue: JSON.parse(JSON.stringify(editor.read.value())),
        });
      }
      editor.update((tx) => {
        tx.authored.propose();
        tx.nodes.insert(paragraph(`Proposal ${index}`), { at: [index + 1] });
      });
    }
    const saved: {
      meta: {
        authored: {
          value: { operations: unknown[][] };
        };
      };
    } = JSON.parse(JSON.stringify(editor.read.value()));
    const payload = saved.meta.authored.value;
    const parent = payload.operations.find((operation) => operation[3] === 2);
    const child = payload.operations.find((operation) => operation[3] === 3);
    assert.ok(parent && child);
    child[10] = [[parent[9], 1]];
    assert.throws(
      () =>
        createEditor({
          plugins: [authored({ authorId: 'alice' })],
          initialValue: saved,
        }),
      /causal|prerequisite|observation/i
    );
  });
});
