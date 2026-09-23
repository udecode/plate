import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  type Anchor,
  type EditorDocumentRange,
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
    plugins: [history(), authored({ authorId: 'alice' })],
    initialValue: [paragraph('Base text')],
  });
  return { source, proposed: createEditorView(source, { authored: proposal }) };
};
const assertFrozen = (value: unknown) => {
  if (value && typeof value === 'object') {
    assert.equal(Object.isFrozen(value), true);
    Object.values(value).forEach(assertFrozen);
  }
};

describe('native document range persistence', () => {
  it('projects one retained range into either view and follows capture-view mode changes', () => {
    const { source, proposed } = setup();
    const anchor = source.anchor(range(5, 9), { deletion: 'drop' });
    const saved = source.anchor.save(anchor);
    proposed.update.text.insert('draft ', { at: point(0) });
    assert.deepEqual(anchor.resolve(), range(5, 9));
    assert.deepEqual(anchor.resolve(source), range(5, 9));
    assert.deepEqual(anchor.resolve(proposed), range(11, 15));
    assert.deepEqual(source.anchor.save(anchor), saved);
    source.api.authored.setView(proposal);
    assert.deepEqual(anchor.resolve(), range(11, 15));
    proposed.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    assert.deepEqual(anchor.resolve(proposed), range(5, 9));
    assert.deepEqual(source.anchor.save(anchor), saved);
    anchor.release();
    assert.equal(anchor.resolve(source), null);
    assert.equal(anchor.resolve(proposed), null);
    assert.equal(hasActiveAnchors(source), false);
  });

  it('keeps dropped proposal-only identity terminal across views and undo', () => {
    const { source, proposed } = setup();
    proposed.update.text.insert(' draft', { at: point(9) });
    const anchor = proposed.anchor(range(10, 15), { deletion: 'drop' });
    const restored = source.anchor.restore(proposed.anchor.save(anchor));
    for (const handle of [anchor, restored]) {
      assert.equal(handle.resolve(source), null);
      assert.deepEqual(handle.resolve(proposed), range(10, 15));
    }
    assert.deepEqual(anchor.resolve(), range(10, 15));
    assert.equal(restored.resolve(), null);
    proposed.api.history.undo();
    assert.equal(anchor.resolve(proposed), null);
    assert.equal(restored.resolve(proposed), null);
    proposed.api.history.redo();
    assert.equal(anchor.resolve(proposed), null);
    assert.equal(restored.resolve(proposed), null);
    source.update.authored.decide({
      action: 'accept',
      selection: source.read.authored.select({ status: 'pending' }),
    });
    assert.equal(anchor.resolve(source), null);
    anchor.release();
    restored.release();
  });

  it('projects path and point identity without changing the capture view', () => {
    const { source, proposed } = setup();
    const path = source.anchor([0], { deletion: 'drop' });
    const caret = source.anchor(point(5), { deletion: 'nearest' });
    proposed.update.nodes.insert(paragraph('Pending'), { at: [0] });
    assert.deepEqual(path.resolve(), [0]);
    assert.deepEqual(path.resolve(proposed), [1]);
    assert.deepEqual(caret.resolve(), point(5));
    assert.deepEqual(caret.resolve(proposed), { path: [1, 0], offset: 5 });
    const pending = proposed.anchor([0], { deletion: 'drop' });
    assert.equal(pending.resolve(source), null);
    assert.deepEqual(pending.resolve(proposed), [0]);
    path.release();
    caret.release();
    pending.release();
    assert.equal(path.resolve(proposed), null);
    assert.equal(caret.resolve(proposed), null);
    assert.equal(hasActiveAnchors(source), false);
  });

  it('projects current draft identity and makes aborted handles unavailable in both views', () => {
    const { source, proposed } = setup();
    let anchor: Anchor<Range> | undefined;
    let path: Anchor<number[]> | undefined;
    assert.throws(
      () =>
        source.update((tx) => {
          tx.authored.propose();
          tx.text.insert(' draft', { at: point(9) });
          anchor = source.anchor(range(10, 15), { deletion: 'drop' });
          tx.text.insert('X', { at: point(12) });
          assert.deepEqual(anchor.resolve(), range(10, 16));
          assert.equal(anchor.resolve(source), null);
          assert.deepEqual(anchor.resolve(proposed), range(10, 16));
          tx.nodes.insert(paragraph('Pending'), { at: [1] });
          path = source.anchor([1], { deletion: 'drop' });
          tx.nodes.insert(paragraph('Before'), { at: [0] });
          assert.deepEqual(path.resolve(), [2]);
          assert.equal(path.resolve(source), null);
          assert.deepEqual(path.resolve(proposed), [2]);
          throw new Error('abort two-view anchors');
        }),
      /abort two-view anchors/
    );
    assert.ok(anchor);
    assert.ok(path);
    for (const handle of [anchor, path]) {
      assert.equal(handle.resolve(), null);
      assert.equal(handle.resolve(source), null);
      assert.equal(handle.resolve(proposed), null);
      handle.release();
    }
    assert.equal(hasActiveAnchors(source), false);
  });

  it('rejects another model or root even when saved document identity matches', () => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: {
        children: [paragraph('Main')],
        roots: { note: [paragraph('Note text')] },
      },
    });
    const note = createEditorView(source, { root: 'note', authored: proposal });
    const other = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: source.read.value(),
    });
    const main = source.anchor(range(0, 4), { deletion: 'drop' });
    const named = note.anchor(range(5, 9), { deletion: 'drop' });
    assert.deepEqual(named.resolve(note), range(5, 9, 'note'));
    assert.throws(() => main.resolve(other), /same editor and root/);
    assert.throws(() => main.resolve(note), /same editor and root/);
    assert.throws(() => named.resolve(source), /same editor and root/);
    main.release();
    named.release();
  });

  for (const pending of [false, true]) {
    it(`restores nearest content identity through ${pending ? 'proposed' : 'accepted'} undo and reload`, () => {
      const { source, proposed } = setup();
      const view = pending ? proposed : source;
      const anchor = view.anchor(range(1, 3), { deletion: 'nearest' });
      const saved = view.anchor.save(anchor);
      view.update.text.delete({ at: range(1, 3) });
      assert.deepEqual(anchor.resolve(), range(1, 1));
      view.api.history.undo();
      assert.deepEqual(anchor.resolve(), range(1, 3));
      const reopened = createEditor({
        plugins: [authored({ authorId: 'alice' })],
        initialValue: JSON.parse(JSON.stringify(source.read.value())),
      });
      const restored = (
        pending ? createEditorView(reopened, { authored: proposal }) : reopened
      ).anchor.restore(saved);
      assert.deepEqual(restored.resolve(), range(1, 3));
      view.api.history.redo();
      assert.deepEqual(anchor.resolve(), range(1, 1));
      view.api.history.undo();
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

  it('maps an unchanged range through multiple disjoint text edits in one update', () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: [paragraph('{"a":1}')],
    });
    const anchor = editor.anchor(range(2, 3), {
      association: 'inward',
      deletion: 'nearest',
    });

    editor.update((tx) => {
      tx.text.insert('\n', { at: point(6) });
      tx.text.insert(' ', { at: point(5) });
      tx.text.insert('\n  ', { at: point(1) });
    });

    assert.deepEqual(anchor.resolve(), range(5, 6));
    assert.equal(editor.read.history().undos.length, 1);
    editor.api.history.undo();
    assert.deepEqual(anchor.resolve(), range(2, 3));
    editor.api.history.redo();
    assert.deepEqual(anchor.resolve(), range(5, 6));
    anchor.release();
  });

  it('maps an ordinary range to an atomic replacement through undo and redo', () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: [paragraph('Base text')],
    });
    const anchor = editor.anchor(range(1, 4), {
      association: 'inward',
      deletion: 'nearest',
    });
    editor.update((tx) => {
      tx.text.delete({ at: range(1, 4) });
      tx.text.insert('XYZW', { at: point(1) });
    });
    assert.deepEqual(anchor.resolve(), range(1, 5));
    editor.api.history.undo();
    assert.deepEqual(anchor.resolve(), range(1, 4));
    editor.api.history.redo();
    assert.deepEqual(anchor.resolve(), range(1, 5));
    anchor.release();
  });

  it('keeps separate ordinary deletion and typing operations detached', () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: [paragraph('Base text')],
    });
    const anchor = editor.anchor(range(1, 4), {
      association: 'inward',
      deletion: 'nearest',
    });
    editor.update.text.delete({ at: range(1, 4) });
    editor.update.text.insert('XYZW', { at: point(1) });
    assert.deepEqual(anchor.resolve()?.anchor, anchor.resolve()?.focus);
    anchor.release();
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

  for (const withAuthored of [false, true]) {
    it(`keeps ${withAuthored ? 'authored' : 'ordinary'} saved ranges immutable and independent of restored JSON`, () => {
      const plugins = () =>
        withAuthored ? [authored({ authorId: 'alice' })] : [];
      const editor = createEditor({
        plugins: plugins(),
        initialValue: [paragraph('Base text')],
      });
      const anchor = editor.anchor(range(5, 9), {
        association: 'outward',
        deletion: 'nearest',
      });
      const saved = editor.anchor.save(anchor);
      const serialized = JSON.stringify(saved);
      const json = JSON.parse(serialized);
      assertFrozen(saved);
      assert.deepEqual(json.value.range, withAuthored ? null : range(5, 9));
      const reopened = createEditor({
        plugins: plugins(),
        initialValue: JSON.parse(JSON.stringify(editor.read.value())),
      });
      const restored = reopened.anchor.restore(json);
      json.value.root = 'other';
      if (withAuthored) {
        json.value.authored.content[0].offset = 99;
      } else {
        json.value.range.anchor.path[0] = 99;
      }
      assert.deepEqual(restored.resolve(), range(5, 9));
      assert.equal(restored.association, 'outward');
      assert.equal(restored.deletion, 'nearest');
      assertFrozen(reopened.anchor.save(restored));
      editor.update.text.insert('A ', { at: point(0) });
      assert.deepEqual(anchor.resolve(), range(7, 11));
      assert.equal(JSON.stringify(saved), serialized);
      anchor.release();
      restored.release();
    });
  }

  it('keeps a saved draft immutable when a later save captures further edits', () => {
    const { source, proposed } = setup();
    let anchor: Anchor<Range> | undefined;
    let saved: EditorDocumentRange | undefined;
    let serialized = '';
    proposed.update((tx) => {
      tx.text.insert(' draft', { at: point(9) });
      anchor = proposed.anchor(range(10, 15), { deletion: 'drop' });
      saved = proposed.anchor.save(anchor);
      serialized = JSON.stringify(saved);
      assertFrozen(saved);
      tx.text.insert('X', { at: point(12) });
      assertFrozen(proposed.anchor.save(anchor));
      assert.equal(JSON.stringify(saved), serialized);
    });
    assert.ok(anchor);
    assert.ok(saved);
    const reopened = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: JSON.parse(JSON.stringify(source.read.value())),
    });
    const restored = createEditorView(reopened, {
      authored: proposal,
    }).anchor.restore(JSON.parse(serialized));
    assert.deepEqual(restored.resolve(), range(10, 16));
    assert.equal(JSON.stringify(saved), serialized);
    anchor.release();
    restored.release();
  });

  it('rejects unavailable authored history even when a resolved fallback is supplied', () => {
    const { source, proposed } = setup();
    const before = JSON.parse(JSON.stringify(source.read.value()));
    proposed.update.text.insert(' draft', { at: point(9) });
    const anchor = proposed.anchor(range(10, 15), { deletion: 'drop' });
    const saved = proposed.anchor.save(anchor);
    const reopened = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: before,
    });
    for (const fallback of [null, range(0, 4)]) {
      const json = JSON.parse(JSON.stringify(saved));
      json.value.range = fallback;
      assert.throws(
        () => reopened.anchor.restore(json),
        /unavailable authored history/
      );
      assert.equal(hasActiveAnchors(reopened), false);
    }
    anchor.release();
  });

  it('rejects tampered authored identities and nested range data', () => {
    const { proposed } = setup();
    const anchor = proposed.anchor(range(5, 9), { deletion: 'drop' });
    const saved = JSON.parse(JSON.stringify(proposed.anchor.save(anchor)));
    const retained = saved.value.authored;
    for (const invalid of [
      null,
      { ...retained, extra: true },
      { ...retained, documentId: 'another-document' },
      { ...retained, root: 'note' },
      { ...retained, direction: 'sideways' },
      { ...retained, content: [{ ...retained.content[0], length: 0 }] },
      { ...retained, content: [{ ...retained.content[0], offset: -1 }] },
      {
        ...retained,
        content: [{ ...retained.content[0], origin: 'missing-operation' }],
      },
      {
        ...retained,
        anchor: { ...retained.anchor, right: { origin: '', offset: 0 } },
      },
    ]) {
      assert.throws(
        () =>
          proposed.anchor.restore({
            ...saved,
            value: { ...saved.value, authored: invalid },
          }),
        /Invalid|another document|unavailable authored history/
      );
    }
    anchor.release();
  });

  it('retains a pending range through accepted edits, acceptance, JSON reload and both view modes', () => {
    const { source, proposed } = setup();
    proposed.update.text.insert(' draft', { at: point(9) });
    const anchor = proposed.anchor(range(10, 15), { deletion: 'drop' });
    source.update.text.insert('A ', { at: point(0) });
    assert.deepEqual(anchor.resolve(), range(12, 17));
    const saved = proposed.anchor.save(anchor);
    const restored = createEditor({
      plugins: [authored({ authorId: 'alice' })],
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

  it('keeps a dropped proposed range terminal after rejection', () => {
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
    assert.equal(anchor.resolve(), null);
    assert.equal(reopened.resolve(), null);
    anchor.release();
    reopened.release();
  });

  it('follows atomic authored replacements through reload and exact history', () => {
    const { source } = setup();
    const anchor = source.anchor(range(1, 4), {
      association: 'inward',
      deletion: 'nearest',
    });

    source.update((tx) => {
      tx.text.delete({ at: range(1, 4) });
      tx.text.insert('XYZW', { at: point(1) });
    });
    assert.deepEqual(anchor.resolve(), range(1, 5));

    const reopened = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: JSON.parse(JSON.stringify(source.read.value())),
    });
    const restored = reopened.anchor.restore(
      JSON.parse(JSON.stringify(source.anchor.save(anchor)))
    );
    assert.deepEqual(restored.resolve(), range(1, 5));

    source.api.history.undo();
    assert.deepEqual(anchor.resolve(), range(1, 4));
    source.api.history.redo();
    assert.deepEqual(anchor.resolve(), range(1, 5));
    anchor.release();
    restored.release();
  });

  it('does not attach deleted authored content to later boundary typing or a merged history operation', () => {
    const { source } = setup();
    const anchor = source.anchor(range(1, 4), {
      association: 'inward',
      deletion: 'nearest',
    });

    source.update.text.delete({ at: range(1, 4) });
    source.update({ history: 'merge' }, (tx) => {
      tx.text.insert('NEW', { at: point(1) });
    });

    const resolved = anchor.resolve();
    assert.ok(resolved);
    assert.deepEqual(resolved.anchor, resolved.focus);
    source.api.history.undo();
    assert.deepEqual(anchor.resolve(), range(1, 4));
    source.api.history.redo();
    assert.deepEqual(anchor.resolve()?.anchor, anchor.resolve()?.focus);
    anchor.release();
  });

  it('keeps nearest authored identity through a public retained revert and reload', () => {
    let authorId = 'alice';
    const source = createEditor({
      plugins: [
        history(),
        authored({ authorId: () => authorId, retainHistory: true }),
      ],
      initialValue: [paragraph('Base text')],
    });
    const anchor = source.anchor(range(1, 4), {
      association: 'inward',
      deletion: 'nearest',
    });
    source.update.text.delete({ at: range(1, 4) });
    assert.deepEqual(anchor.resolve(), range(1, 1));

    const deletion = source.read.authored.select({ authorId: 'alice' });
    authorId = 'bob';
    assert.equal(
      source.update.authored.revert({ selection: deletion }).status,
      'applied'
    );
    assert.deepEqual(anchor.resolve(), range(1, 4));

    const reopened = createEditor({
      plugins: [authored({ authorId: 'bob', retainHistory: true })],
      initialValue: JSON.parse(JSON.stringify(source.read.value())),
    });
    const restored = reopened.anchor.restore(
      JSON.parse(JSON.stringify(source.anchor.save(anchor)))
    );
    assert.deepEqual(restored.resolve(), range(1, 4));
    anchor.release();
    restored.release();
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
      plugins: [authored({ authorId: 'alice' })],
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
      plugins: [authored({ authorId: 'alice' })],
      initialValue: source.read.children(),
    });
    assert.throws(() => other.anchor.restore(saved), /another document/);
    anchor.release();
    handle.release();
  });

  it('rejects malformed envelopes before accessing payload getters', () => {
    const { proposed } = setup();
    const anchor = proposed.anchor(range(5, 9), { deletion: 'drop' });
    const saved = JSON.parse(JSON.stringify(proposed.anchor.save(anchor)));
    for (const input of [
      null,
      { ...saved, kind: 'point' },
      { ...saved, version: 2 },
      { ...saved, extra: true },
      { ...saved, value: { deletion: 'drop' } },
      { ...saved, value: { ...saved.value, extra: true } },
      { ...saved, value: { ...saved.value, association: 'sideways' } },
      { ...saved, value: { ...saved.value, deletion: 'retain' } },
      { ...saved, value: { ...saved.value, root: '' } },
      { ...saved, value: { ...saved.value, range: { anchor: point(0) } } },
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
    Object.defineProperty(saved.value.authored.content[0], 'origin', {
      enumerable: true,
      get() {
        reads += 1;
        return 'untrusted';
      },
    });
    Object.freeze(saved.value.authored.content[0]);
    Object.freeze(saved);
    assert.throws(() => proposed.anchor.restore(saved), /JSON|range/i);
    assert.equal(reads, 0);
    anchor.release();
  });
});
