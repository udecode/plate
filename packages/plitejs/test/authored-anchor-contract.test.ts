import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  type Anchor,
  type Range,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';

import { hasActiveAnchors } from '../src/core/anchor-state';
import { createEditorViewRuntime } from '../src/editor-runtime-view';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number, root?: string) => ({
  path: [0, 0],
  offset,
  ...(root ? { root } : {}),
});
const range = (start: number, end: number, root?: string): Range => ({
  anchor: point(start, root),
  focus: point(end, root),
});
const proposal = { intent: 'propose', projection: 'proposed' } as const;
const setup = () => {
  const source = createEditor({
    extensions: [history(), authored({ authorId: 'alice' })],
    initialValue: [paragraph('Base text')],
  });
  return { source, proposed: createEditorView(source, { authored: proposal }) };
};

describe('native document range persistence', () => {
  for (const pending of [false, true]) {
    it(`restores deleted content identity through ${pending ? 'proposed' : 'accepted'} undo and reload`, () => {
      const { source, proposed } = setup();
      const view = pending ? proposed : source;
      const anchor = view.anchor(range(1, 3), { deletion: 'drop' });
      const saved = view.anchor.save(anchor);
      view.update.text.delete({ at: range(1, 3) });
      assert.equal(anchor.resolve(), null);
      view.update.history.undo();
      assert.deepEqual(anchor.resolve(), range(1, 3));
      const reopened = createEditor({
        extensions: [authored({ authorId: 'alice' })],
        initialValue: JSON.parse(JSON.stringify(source.read.value())),
      });
      const restored = (
        pending ? createEditorView(reopened, { authored: proposal }) : reopened
      ).anchor.restore(saved);
      assert.deepEqual(restored.resolve(), range(1, 3));
      view.update.history.redo();
      assert.equal(anchor.resolve(), null);
      view.update.history.undo();
      assert.deepEqual(anchor.resolve(), range(1, 3));
      anchor.release();
      restored.release();
    });
  }

  it('anchors paths in proposed nodes and follows same-root movement and rejection', () => {
    const { source, proposed } = setup();
    proposed.update.nodes.insert(paragraph('Pending'), { at: [1] });
    const node = proposed.anchor([1], { deletion: 'drop' });
    const text = proposed.anchor([1, 0], { deletion: 'drop' });
    const root = proposed.anchor([], { deletion: 'drop' });
    assert.deepEqual(node.resolve(), [1]);
    assert.deepEqual(text.resolve(), [1, 0]);
    proposed.update.nodes.move({ at: [1], to: [0] });
    assert.deepEqual(node.resolve(), [0]);
    assert.deepEqual(text.resolve(), [0, 0]);
    source.update.authored.decide({
      action: 'reject',
      selection: source.read.authored.select({ status: 'pending' }),
    });
    assert.equal(node.resolve(), null);
    assert.equal(text.resolve(), null);
    assert.deepEqual(root.resolve(), []);
    node.release();
    text.release();
    root.release();
    assert.equal(hasActiveAnchors(source), false);
  });

  it('settles a draft path after later insertions and invalidates it on rollback', () => {
    const { source, proposed } = setup();
    let node: Anchor<number[]> | undefined;
    proposed.update((tx) => {
      tx.nodes.insert(paragraph('Pending'), { at: [1] });
      node = proposed.anchor([1], { deletion: 'drop' });
      tx.nodes.insert(paragraph('Before'), { at: [0] });
    });
    assert.deepEqual(node?.resolve(), [2]);
    let aborted: Anchor<number[]> | undefined;
    assert.throws(
      () =>
        proposed.update((tx) => {
          tx.nodes.insert(paragraph('Aborted'), { at: [3] });
          aborted = proposed.anchor([3], { deletion: 'drop' });
          throw new Error('abort path');
        }),
      /abort path/
    );
    assert.equal(aborted?.resolve(), null);
    node?.release();
    aborted?.release();
    assert.equal(hasActiveAnchors(source), false);
  });

  it('maps pending point anchors through typing and deletion in the native view', () => {
    const { source, proposed } = setup();
    proposed.update.text.insert(' draft', { at: point(9) });
    const caret = proposed.anchor(point(12), { deletion: 'nearest' });
    const detached = proposed.anchor(point(12), { deletion: 'drop' });
    proposed.update.text.insert('X', { at: point(11) });
    assert.deepEqual(caret.resolve(), point(13));
    proposed.update.text.delete({ at: range(10, 16) });
    assert.deepEqual(caret.resolve(), point(10));
    assert.equal(detached.resolve(), null);
    assert.equal(source.read.text.string([]), 'Base text');
    caret.release();
    detached.release();
    assert.equal(hasActiveAnchors(source), false);
  });

  it('keeps the source range accepted while a proposal range follows its own projection', () => {
    const { source, proposed } = setup();
    const accepted = source.anchor(range(5, 9), { deletion: 'drop' });
    const pending = proposed.anchor(range(5, 9), { deletion: 'drop' });
    proposed.update((tx) => {
      tx.text.insert('draft ', { at: point(0) });
      assert.deepEqual(accepted.resolve(), range(5, 9));
      assert.deepEqual(pending.resolve(), range(11, 15));
    });
    assert.deepEqual(accepted.resolve(), range(5, 9));
    assert.deepEqual(pending.resolve(), range(11, 15));
    accepted.release();
    pending.release();
  });

  it('persists a headless draft range and detaches content erased in the same transaction', () => {
    const { source, proposed } = setup();
    let anchor: Anchor<Range> | undefined;
    source.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: point(9) });
      anchor = source.anchor(range(10, 15), { deletion: 'drop' });
      assert.deepEqual(anchor.resolve(), range(10, 15));
      tx.text.insert('X', { at: point(12) });
    });
    assert.ok(anchor);
    assert.equal(anchor.resolve(), null);
    const restored = proposed.anchor.restore(source.anchor.save(anchor));
    assert.deepEqual(restored.resolve(), range(10, 16));
    let erased: Anchor<Range> | undefined;
    proposed.update((tx) => {
      tx.text.insert('abcdef', { at: point(16) });
      erased = proposed.anchor(range(17, 21), { deletion: 'drop' });
      tx.text.delete({ at: range(16, 22) });
    });
    assert.ok(erased);
    assert.equal(erased.resolve(), null);
    const detached = proposed.anchor.restore(proposed.anchor.save(erased));
    assert.equal(detached.resolve(), null);
    anchor.release();
    restored.release();
    erased.release();
    detached.release();
  });

  it('counts native anchor ownership and survives authored teardown and reinstallation', () => {
    const source = createEditor({ initialValue: [paragraph('Base text')] });
    const remove = source.install(authored({ authorId: 'alice' }));
    const proposed = createEditorViewRuntime(source, { authored: proposal });
    const anchor = proposed.anchor(range(5, 9), { deletion: 'drop' });
    assert.equal(hasActiveAnchors(source), true);
    remove();
    assert.equal(anchor.resolve(), null);
    const uninstall = source.install(authored({ authorId: 'alice' }));
    assert.deepEqual(anchor.resolve(), range(5, 9));
    anchor.release();
    assert.equal(hasActiveAnchors(source), false);
    anchor.release();
    assert.equal(hasActiveAnchors(source), false);
    uninstall();
  });

  it('saves and restores an ordinary range without authored changes installed', () => {
    const editor = createEditor({ initialValue: [paragraph('Base text')] });
    const anchor = editor.anchor(range(5, 9), { deletion: 'drop' });
    editor.update.text.insert('A ', { at: point(0) });
    const json = JSON.parse(JSON.stringify(editor.anchor.save(anchor)));
    anchor.release();
    const restored = createEditor({ initialValue: editor.read.value() });
    const handle = restored.anchor.restore(json);
    assert.deepEqual(handle.resolve(), range(7, 11));
    restored.update.text.insert('B ', { at: point(0) });
    assert.deepEqual(handle.resolve(), range(9, 13));
    handle.release();
    assert.equal(handle.resolve(), null);
  });

  it('keeps detached ordinary ranges explicit and rejects foreign or released handles', () => {
    const editor = createEditor({ initialValue: [paragraph('Base text')] });
    const other = createEditor({ initialValue: [paragraph('Base text')] });
    const anchor = editor.anchor(range(5, 8), { deletion: 'drop' });
    assert.throws(() => other.anchor.save(anchor), /owned/);
    editor.update.text.delete({ at: range(0, 9) });
    const saved = editor.anchor.save(anchor);
    const restored = editor.anchor.restore(saved);
    assert.equal(restored.resolve(), null);
    anchor.release();
    assert.throws(() => editor.anchor.save(anchor), /released/);
    restored.release();
  });

  it('retains a pending range through accepted edits, acceptance, JSON reload and both view modes', () => {
    const { source, proposed } = setup();
    proposed.update.text.insert(' draft', { at: point(9) });
    const anchor = proposed.anchor(range(10, 15), { deletion: 'drop' });
    source.update.text.insert('A ', { at: point(0) });
    assert.deepEqual(anchor.resolve(), range(12, 17));
    const saved = proposed.anchor.save(anchor);
    const restored = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: JSON.parse(JSON.stringify(source.read.value())),
    });
    const restoredView = createEditorView(restored, { authored: proposal });
    const reopened = restoredView.anchor.restore(
      JSON.parse(JSON.stringify(saved))
    );
    assert.deepEqual(reopened.resolve(), range(12, 17));
    restoredView.api.authored.setView({
      intent: 'edit',
      projection: 'accepted',
    });
    assert.equal(reopened.resolve(), null);
    restoredView.api.authored.setView(proposal);
    restored.update.authored.decide({
      action: 'accept',
      selection: restored.read.authored.select({
        authorId: 'alice',
        status: 'pending',
      }),
    });
    assert.deepEqual(reopened.resolve(), range(12, 17));
    restoredView.api.authored.setView({
      intent: 'edit',
      projection: 'accepted',
    });
    assert.deepEqual(reopened.resolve(), range(12, 17));
    anchor.release();
    reopened.release();
  });

  it('detaches a deleted range in the proposed projection and restores it after rejection', () => {
    const { source, proposed } = setup();
    const anchor = proposed.anchor(range(5, 9), { deletion: 'drop' });
    proposed.update.text.delete({ at: range(5, 9) });
    assert.equal(anchor.resolve(), null);
    const saved = proposed.anchor.save(anchor);
    const reopened = proposed.anchor.restore(saved);
    assert.equal(reopened.resolve(), null);
    source.update.authored.decide({
      action: 'reject',
      selection: source.read.authored.select({ authorId: 'alice' }),
    });
    assert.deepEqual(anchor.resolve(), range(5, 9));
    assert.deepEqual(reopened.resolve(), range(5, 9));
    anchor.release();
    reopened.release();
  });

  it('keeps backward range affinity through roundtrip and insertion at both edges', () => {
    const { proposed } = setup();
    const anchor = proposed.anchor(range(9, 5), {
      association: 'inward',
      deletion: 'drop',
    });
    const reopened = proposed.anchor.restore(proposed.anchor.save(anchor));
    proposed.update.text.insert('X', { at: point(5) });
    proposed.update.text.insert('Y', { at: point(10) });
    assert.deepEqual(anchor.resolve(), range(10, 6));
    assert.deepEqual(reopened.resolve(), range(10, 6));
    anchor.release();
    reopened.release();
  });

  it('captures a range created in the current proposal draft and expires an aborted range', () => {
    const { source, proposed } = setup();
    let created: Anchor<Range> | undefined;
    proposed.update((tx) => {
      tx.text.insert(' draft', { at: point(9) });
      created = proposed.anchor(range(10, 15), { deletion: 'drop' });
      assert.deepEqual(created.resolve(), range(10, 15));
      tx.text.insert('X', { at: point(12) });
      assert.deepEqual(created.resolve(), range(10, 16));
    });
    assert.deepEqual(created?.resolve(), range(10, 16));
    assert.equal(source.read.text.string([]), 'Base text');
    let aborted: Anchor<Range> | undefined;
    assert.throws(
      () =>
        proposed.update((tx) => {
          tx.text.insert('tail', { at: point(16) });
          aborted = proposed.anchor(range(16, 20), { deletion: 'drop' });
          throw new Error('abort range');
        }),
      /abort range/
    );
    assert.equal(aborted?.resolve(), null);
    assert.ok(aborted);
    assert.throws(() => proposed.anchor.save(aborted), /aborted/);
    created?.release();
    aborted.release();
  });

  it('restores named-root ranges and rejects a different document or missing capability', () => {
    const source = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: {
        children: [paragraph('Main')],
        roots: { note: [paragraph('Note text')] },
      },
    });
    const view = createEditorView(source, { authored: proposal, root: 'note' });
    const anchor = view.anchor(range(5, 9, 'note'), { deletion: 'drop' });
    const saved = view.anchor.save(anchor);
    const handle = view.anchor.restore(saved);
    assert.deepEqual(handle.resolve(), range(5, 9, 'note'));
    assert.throws(
      () => createEditor().anchor.restore(saved),
      /Install authored/
    );
    const other = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: source.read.children(),
    });
    assert.throws(() => other.anchor.restore(saved), /another document/);
    anchor.release();
    handle.release();
  });

  it('rejects malformed envelopes before accessing payload getters', () => {
    const { proposed } = setup();
    const anchor = proposed.anchor(range(5, 9), { deletion: 'drop' });
    const saved = proposed.anchor.save(anchor);
    for (const input of [
      null,
      { ...saved, version: 2 },
      { ...saved, extra: true },
      { ...saved, value: { deletion: 'drop' } },
    ]) {
      assert.throws(() => proposed.anchor.restore(input), /range/i);
    }
    let reads = 0;
    assert.throws(
      () =>
        proposed.anchor.restore({
          ...saved,
          get value() {
            reads += 1;
            return saved.value;
          },
        }),
      /JSON|range/i
    );
    assert.equal(reads, 0);
    anchor.release();
  });
});
