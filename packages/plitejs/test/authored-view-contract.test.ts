import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineExtension,
  SelectionApi,
  type EditorCommit,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { History, history } from 'plitejs/history';

import { getEditorRuntime } from '../src/core/editor-runtime';
import {
  applyTransactionSpec,
  setEditorComposing,
  subscribeEditorViewState,
} from '../src/core/public-state';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number) => ({ path: [0, 0], offset });
const proposal = { intent: 'propose', projection: 'proposed' } as const;

const setup = () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice', retainHistory: true })],
    initialValue: [paragraph('Base')],
  });
  return {
    source,
    proposed: createEditorView(source, { authored: proposal }),
    accepted: createEditorView(source),
  };
};

describe('native authored views', () => {
  it('exposes the last commit in the same coordinates as its view subscription', () => {
    const { source, proposed, accepted } = setup();
    let published: EditorCommit | null = null;
    proposed.subscribeCommit((commit) => {
      published = commit;
    });
    proposed.update.text.insert(' draft', { at: point(4) });
    assert.equal(getEditorRuntime(proposed).getLastCommit(), published);
    assert.equal(
      getEditorRuntime(accepted).getLastCommit()?.changes.empty,
      true
    );
    assert.equal(source.read.text.string([]), 'Base');
  });

  it('reads existing review geometry from the active native view draft', () => {
    const { source, proposed } = setup();
    proposed.update.text.insert(' draft', { at: point(4) });
    const { id } = proposed.read.authored.changes().items[0];
    proposed.update((tx) => {
      tx.text.insert('X ', { at: point(0) });
      assert.deepEqual(tx.authored.change(id)?.ranges, [
        {
          anchor: point(6),
          focus: point(12),
        },
      ]);
      assert.deepEqual(proposed.read.authored.change(id)?.ranges, [
        {
          anchor: point(4),
          focus: point(10),
        },
      ]);
      assert.deepEqual(source.read.authored.change(id)?.ranges, [
        {
          anchor: point(4),
          focus: point(4),
        },
      ]);
    });
    assert.deepEqual(proposed.read.authored.change(id)?.ranges, [
      {
        anchor: point(6),
        focus: point(12),
      },
    ]);
  });

  it('restores proposal caret history from JSON in a new native view', () => {
    const source = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    const proposed = createEditorView(source, { authored: proposal });
    proposed.update.selection.set(point(4));
    proposed.update.text.insert(' draft');
    const savedHistory = JSON.parse(JSON.stringify(History.toJSON(proposed)));
    const restored = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
      initialValue: JSON.parse(JSON.stringify(source.read.value())),
    });
    const restoredView = createEditorView(restored, { authored: proposal });
    restoredView.update.history.restore(
      History.fromJSON(restoredView, savedHistory)
    );
    restoredView.update.history.undo();
    assert.equal(restoredView.read.text.string([]), 'Base');
    assert.deepEqual(restoredView.read.selection(), {
      anchor: point(4),
      focus: point(4),
    });
    restoredView.update.history.redo();
    assert.equal(restoredView.read.text.string([]), 'Base draft');
    assert.deepEqual(restoredView.read.selection(), {
      anchor: point(10),
      focus: point(10),
    });
    assert.equal(restored.read.text.string([]), 'Base');
  });

  it('rolls back both proposal content and its caret, and expires captured callbacks', () => {
    const { source, proposed } = setup();
    proposed.update.selection.set(point(4));
    const before = JSON.stringify(source.read.value());
    let escapedRead = () => proposal;
    let escapedWrite = () => {};
    assert.throws(
      () =>
        proposed.update((tx) => {
          escapedRead = tx.authored.view;
          escapedWrite = () => tx.text.insert('late');
          tx.text.insert(' draft');
          tx.selection.set(point(7));
          throw new Error('abort view');
        }),
      /abort view/
    );
    assert.equal(JSON.stringify(source.read.value()), before);
    assert.equal(proposed.read.text.string([]), 'Base');
    assert.deepEqual(proposed.read.selection(), {
      anchor: point(4),
      focus: point(4),
    });
    assert.throws(escapedRead, /transaction|active|update/i);
    assert.throws(escapedWrite, /transaction|active|update/i);
  });

  it('rejects readonly and unattributed input before either projection changes', () => {
    let authorId = 'alice';
    const source = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    const locked = createEditorView(source, {
      authored: proposal,
      readOnly: true,
    });
    const proposed = createEditorView(source, { authored: proposal });
    assert.throws(
      () => locked.update.text.insert(' draft', { at: point(4) }),
      /read-only/
    );
    assert.equal(locked.read.text.string([]), 'Base');
    authorId = '';
    proposed.update.selection.set(point(4));
    assert.throws(
      () => proposed.update.text.insert(' draft'),
      /author|identity/i
    );
    assert.equal(source.read.authored.changes().items.length, 0);
    assert.equal(source.read.text.string([]), 'Base');
    assert.equal(proposed.read.text.string([]), 'Base');
  });

  it('retains a named-root caret through decisions and a projection switch', () => {
    const source = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: {
        children: [paragraph('Main')],
        roots: { note: [paragraph('Note')] },
      },
    });
    const proposed = createEditorView(source, {
      authored: proposal,
      root: 'note',
    });
    const at = (offset: number) => ({ ...point(offset), root: 'note' });
    proposed.update.selection.set(at(4));
    proposed.update.text.insert(' draft');
    proposed.update.selection.set(at(7));
    proposed.update.authored.decide({
      action: 'accept',
      selection: proposed.read.authored.select({ authorId: 'alice' }),
    });
    proposed.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    assert.equal(proposed.read.text.string([]), 'Note draft');
    assert.deepEqual(proposed.read.selection(), {
      anchor: at(7),
      focus: at(7),
    });
    assert.equal(source.read.text.string([]), 'Main');
  });

  it('binds extension updates, reads and callbacks to the actual view', () => {
    const contribution = defineExtension('contribution', {
      update: ({ editor, tx, context }) => ({
        write() {
          assert.equal(editor.read.text.string([]), 'Base draft');
          assert.equal(tx.text.string([]), 'Base draft');
          tx.text.insert('!', { at: point(10) });
          context.afterCommit(({ editor: observed, commit }) => {
            assert.equal(observed, editor);
            assert.equal(
              commit.after.children[0].children[0].text,
              'Base draft!'
            );
          });
        },
      }),
    });
    const source = createEditor({
      extensions: [authored({ authorId: 'alice' }), contribution],
      initialValue: [paragraph('Base')],
    });
    const proposed = createEditorView(source, { authored: proposal });
    proposed.update.text.insert(' draft', { at: point(4) });
    proposed.update((tx) => {
      assert.deepEqual(tx.authored.view(), proposal);
      tx.contribution.write();
    });
    assert.equal(source.read.text.string([]), 'Base');
    assert.equal(proposed.read.text.string([]), 'Base draft!');
  });

  it('defers a mode switch until the final composition write has settled', async () => {
    const { source, proposed, accepted } = setup();
    proposed.update.selection.set(point(4));
    setEditorComposing(proposed, true);
    proposed.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    assert.deepEqual(proposed.read.authored.view(), proposal);
    proposed.update.text.insert(' draft');
    setEditorComposing(proposed, false);
    proposed.update.text.insert('!');
    assert.deepEqual(proposed.read.authored.view(), proposal);
    await Promise.resolve();
    assert.equal(proposed.read.authored.view().intent, 'edit');
    assert.equal(source.read.text.string([]), 'Base');
    assert.equal(accepted.read.view.isComposing(), false);
    proposed.api.authored.setView(proposal);
    assert.equal(proposed.read.text.string([]), 'Base draft!');
    assert.deepEqual(proposed.read.selection(), {
      anchor: point(11),
      focus: point(11),
    });
  });
  it('amends an owned insertion through ordinary view input', () => {
    const { source, proposed } = setup();
    proposed.update.text.insert(' draft', { at: point(4) });
    const { id } = proposed.read.authored.changes().items[0];
    proposed.update.text.insert('X', { at: point(7) });
    assert.equal(source.read.authored.changes().items.length, 1);
    assert.equal(source.read.authored.change(id)?.revision, 2);
    assert.equal(proposed.read.text.string([]), 'Base drXaft');
  });

  it('undoes and redoes proposal-view typing with the same identity and caret', () => {
    const source = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    const proposed = createEditorView(source, { authored: proposal });
    proposed.update.selection.set(point(4));
    proposed.update.text.insert(' draft');
    const { id } = proposed.read.authored.changes().items[0];
    proposed.update.history.undo();
    assert.equal(proposed.read.text.string([]), 'Base');
    assert.equal(source.read.authored.change(id)?.status, 'pending');
    assert.deepEqual(proposed.read.selection(), {
      anchor: point(4),
      focus: point(4),
    });
    proposed.update.history.redo();
    assert.equal(proposed.read.text.string([]), 'Base draft');
    assert.deepEqual(proposed.read.selection(), {
      anchor: point(10),
      focus: point(10),
    });
    assert.equal(source.read.text.string([]), 'Base');
  });

  it('constructs a detached native spec in view coordinates and applies it atomically', () => {
    const { source, proposed } = setup();
    proposed.update.text.insert(' draft', { at: point(4) });
    const spec = proposed.read((state) =>
      state.transaction((tx) => {
        assert.equal(tx.text.string([]), 'Base draft');
        tx.text.insert('!', { at: point(10) });
        assert.equal(tx.text.string([]), 'Base draft!');
        assert.equal(source.read.text.string([]), 'Base');
      })
    );
    assert.equal(proposed.read.text.string([]), 'Base draft');
    proposed.update(() => applyTransactionSpec(source, spec));
    assert.equal(proposed.read.text.string([]), 'Base draft!');
    assert.equal(source.read.text.string([]), 'Base');
  });
  it('keeps two carets independent and types in projected coordinates', () => {
    const { source, proposed, accepted } = setup();
    accepted.update.selection.set(point(1));
    proposed.update.selection.set(point(4));
    proposed.update.text.insert(' draft');
    assert.deepEqual(proposed.read.selection(), {
      anchor: point(10),
      focus: point(10),
    });
    assert.deepEqual(accepted.read.selection(), {
      anchor: point(1),
      focus: point(1),
    });
    assert.equal(source.read.selection(), null);
    accepted.update.text.insert('!');
    assert.equal(source.read.text.string([]), 'B!ase');
    assert.equal(proposed.read.text.string([]), 'B!ase draft');
    assert.deepEqual(proposed.read.selection(), {
      anchor: point(11),
      focus: point(11),
    });
    proposed.update.text.insert('?');
    assert.equal(proposed.read.text.string([]), 'B!ase draft?');
    assert.equal(accepted.read.text.string([]), 'B!ase');
  });

  it('publishes selection-only view changes without document or authorship changes', () => {
    const { source, proposed, accepted } = setup();
    const commits: EditorCommit[] = [];
    proposed.subscribeCommit((commit) => commits.push(commit));
    const before = JSON.stringify(source.read.value());
    proposed.update.selection.set(point(2));
    assert.equal(commits.length, 1);
    assert.equal(commits[0].selectionChanged, true);
    assert.equal(commits[0].changed.has('document'), false);
    assert.equal(commits[0].effects.length, 0);
    assert.equal(JSON.stringify(source.read.value()), before);
    assert.equal(accepted.read.selection(), null);
    proposed.update.selection.set(point(2));
    assert.equal(commits.length, 1);
  });

  it('maps a pending caret through a projection switch and restores its original position', () => {
    const { source, proposed } = setup();
    proposed.update.text.insert(' draft', { at: point(4) });
    proposed.update.selection.set(point(7));
    proposed.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    assert.deepEqual(proposed.read.selection(), {
      anchor: point(4),
      focus: point(4),
    });
    assert.equal(source.read.selection(), null);
    proposed.api.authored.setView(proposal);
    assert.deepEqual(proposed.read.selection(), {
      anchor: point(7),
      focus: point(7),
    });
    proposed.update.text.insert('X');
    assert.equal(proposed.read.text.string([]), 'Base drXaft');
  });

  it('preserves backward ranges and collapses selections deleted by another view', () => {
    const { source, proposed } = setup();
    const other = createEditorView(source, { authored: proposal });
    proposed.update.text.insert(' draft', { at: point(4) });
    proposed.update.selection.set(
      SelectionApi.text(
        { anchor: point(8), focus: point(5) },
        { affinity: 'backward' }
      )
    );
    other.update.text.insert('!', { at: point(0) });
    assert.deepEqual(proposed.read.selection(), {
      anchor: point(9),
      focus: point(6),
    });
    proposed.update.selection.set(point(7));
    other.update.text.delete({ at: { anchor: point(6), focus: point(9) } });
    assert.deepEqual(proposed.read.selection(), {
      anchor: point(6),
      focus: point(6),
    });
    proposed.update.text.insert('X');
    assert.equal(proposed.read.text.string([]), '!Base Xft');
  });

  it('notifies projected text subscribers and releases them on unsubscribe', () => {
    const { source, proposed, accepted } = setup();
    let projectedEvents = 0;
    let acceptedEvents = 0;
    const unsubscribe = getEditorRuntime(proposed).subscribeSource(
      'text',
      () => (projectedEvents += 1)
    );
    getEditorRuntime(accepted).subscribeSource(
      'text',
      () => (acceptedEvents += 1)
    );
    proposed.update.text.insert(' draft', { at: point(4) });
    assert.equal(projectedEvents, 1);
    assert.equal(acceptedEvents, 0);
    unsubscribe();
    source.update.text.insert('!', { at: point(0) });
    assert.equal(projectedEvents, 1);
    assert.equal(acceptedEvents, 1);
  });

  it('notifies only the exact view when its mode changes', async () => {
    const { proposed, accepted } = setup();
    await Promise.resolve();
    let proposalEvents = 0;
    let acceptedEvents = 0;
    const unsubscribe = subscribeEditorViewState(
      proposed,
      () => (proposalEvents += 1)
    );
    subscribeEditorViewState(accepted, () => (acceptedEvents += 1));
    proposed.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    await Promise.resolve();
    assert.equal(proposalEvents, 1);
    assert.equal(acceptedEvents, 0);
    proposed.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    await Promise.resolve();
    assert.equal(proposalEvents, 1);
    unsubscribe();
  });
  it('scopes ordinary input and persistence to the calling view', () => {
    const { source, proposed, accepted } = setup();
    proposed.update.text.insert(' draft', { at: point(4) });
    assert.equal(proposed.read.text.string([]), 'Base draft');
    assert.deepEqual(proposed.children, [paragraph('Base draft')]);
    assert.deepEqual(proposed.read.nodes.get([0, 0]), [
      { text: 'Base draft' },
      [0, 0],
    ]);
    assert.equal(accepted.read.text.string([]), 'Base');
    assert.equal(source.read.text.string([]), 'Base');
    assert.deepEqual(proposed.read.value(), source.read.value());
    assert.deepEqual(proposed.read.authored.view(), proposal);
    assert.equal(accepted.read.authored.view().intent, 'edit');
    const change = proposed.read.authored.changes().items[0];
    assert.equal(change.status, 'pending');
    assert.deepEqual(change.ranges, [{ anchor: point(4), focus: point(10) }]);
  });

  it('rebinds extension reads without leaking projection into nested source reads', () => {
    const readText = defineExtension('reading', {
      read: ({ editor, state }) => ({
        text: () => state.text.string([]),
        sameEditor: () => editor,
      }),
    });
    const source = createEditor({
      extensions: [authored({ authorId: 'alice' }), readText],
      initialValue: [paragraph('Base')],
    });
    const proposed = createEditorView(source, { authored: proposal });
    proposed.update.text.insert(' draft', { at: point(4) });
    proposed.read((state) => {
      assert.equal(state.reading.text(), 'Base draft');
      assert.equal(source.read.reading.text(), 'Base');
      assert.equal(state.text.string([]), 'Base draft');
      assert.equal(state.reading.sameEditor(), proposed);
    });
    const entries = proposed.read.nodes.entries({ at: [] });
    assert.equal(source.read.text.string([]), 'Base');
    assert.ok(
      [...entries].some(
        ([node]) => 'text' in node && node.text === 'Base draft'
      )
    );
    assert.equal(source.read.text.string([]), 'Base');
  });

  it('publishes the projected canonical delta with the source publication version', () => {
    const { source, proposed, accepted } = setup();
    const projectedCommits: EditorCommit[] = [];
    const sourceCommits: EditorCommit[] = [];
    proposed.subscribeCommit((commit, snapshot) => {
      projectedCommits.push(commit);
      assert.equal(snapshot, commit.after);
    });
    source.subscribeCommit((commit) => sourceCommits.push(commit));
    accepted.subscribeCommit((commit) =>
      assert.equal(commit.changes.empty, true)
    );
    proposed.update((tx, context) => {
      tx.text.insert(' draft', { at: point(4) });
      context.afterCommit(({ commit }) =>
        assert.equal(commit.changes.empty, false)
      );
    });
    assert.equal(projectedCommits.length, 1);
    const [commit] = projectedCommits;
    assert.equal(commit.version, sourceCommits[0].version);
    assert.equal(commit.changed.has('document'), true);
    assert.deepEqual(
      commit.changes.apply({ children: commit.before.children }).children,
      commit.after.children
    );
    assert.deepEqual(commit.after.children, [paragraph('Base draft')]);
    assert.equal(sourceCommits[0].changes.empty, true);
  });

  it('keeps named-root input and reads in projected coordinates', () => {
    const source = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: {
        children: [paragraph('Body')],
        roots: { notes: [paragraph('Foot')] },
      },
    });
    const proposed = createEditorView(source, {
      root: 'notes',
      authored: proposal,
    });
    proposed.update.text.insert(' draft', { at: point(4) });
    assert.equal(proposed.read.text.string([]), 'Foot draft');
    assert.deepEqual(proposed.children, [paragraph('Foot draft')]);
    assert.deepEqual(proposed.read.root('notes'), [paragraph('Foot draft')]);
    assert.deepEqual(source.read.root('notes'), [paragraph('Foot')]);
    assert.equal(source.read.text.string([]), 'Body');
  });

  it('rolls back content and view publications together', () => {
    const { source, proposed } = setup();
    let commits = 0;
    proposed.subscribeCommit(() => (commits += 1));
    const before = JSON.stringify(source.read.value());
    assert.throws(
      () =>
        proposed.update((tx) => {
          tx.text.insert(' lost', { at: point(4) });
          throw new Error('abort');
        }),
      /abort/
    );
    assert.equal(JSON.stringify(source.read.value()), before);
    assert.equal(proposed.read.text.string([]), 'Base');
    assert.equal(commits, 0);
    proposed.update.text.insert(' kept', { at: point(4) });
    assert.equal(proposed.read.text.string([]), 'Base kept');
  });

  it('amends and decides through the proposal view', () => {
    const { source, proposed } = setup();
    proposed.update.text.insert(' draft', { at: point(4) });
    const { id } = proposed.read.authored.changes().items[0];
    proposed.update((tx) => {
      tx.authored.propose({ changeId: id });
      tx.text.insert('!', { at: point(10) });
    });
    assert.equal(proposed.read.authored.changes().items.length, 1);
    const result = proposed.update.authored.decide({
      action: 'accept',
      selection: proposed.read.authored.select({ ids: [id] }),
    });
    assert.equal(result.status, 'applied');
    assert.equal(source.read.text.string([]), 'Base draft!');
    assert.equal(proposed.read.text.string([]), 'Base draft!');
  });

  it('changes exact-view policy without changing siblings or serialized data', () => {
    const { source, proposed, accepted } = setup();
    const before = JSON.stringify(source.read.value());
    accepted.api.authored.setView(proposal);
    assert.equal(accepted.read.authored.view().intent, 'propose');
    assert.equal(source.read.authored.view().intent, 'edit');
    proposed.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    assert.equal(proposed.read.authored.view().intent, 'edit');
    assert.equal(JSON.stringify(source.read.value()), before);
    assert.throws(
      () =>
        accepted.api.authored.setView({
          intent: 'propose',
          projection: 'accepted',
        }),
      /Authored input/
    );
    assert.equal(accepted.read.authored.view().intent, 'propose');
  });
});
