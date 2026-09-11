import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, createEditorView } from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const at = (offset: number, block = 0) => ({ path: [block, 0], offset });

describe('authored local history', () => {
  for (const pending of [false, true]) {
    it(`replays ${pending ? 'pending' : 'accepted'} property undo and redo without losing writer ownership`, () => {
      const source = createEditor({
        extensions: [history(), authored({ authorId: 'alice' })],
        initialValue: [paragraph('Text')],
      });
      const view = pending
        ? createEditorView(source, {
            authored: { intent: 'propose', projection: 'proposed' },
          })
        : source;
      view.update.nodes.set({ bold: true }, { at: [0, 0] });
      view.update.history.undo();
      assert.deepEqual(view.read.children(), [paragraph('Text')]);
      view.update.history.redo();
      assert.deepEqual(view.read.children(), [
        { type: 'paragraph', children: [{ text: 'Text', bold: true }] },
      ]);
      const reopened = createEditor({
        extensions: [authored({ authorId: 'alice' })],
        initialValue: JSON.parse(JSON.stringify(source.read.value())),
      });
      const restored = pending
        ? createEditorView(reopened, {
            authored: { intent: 'propose', projection: 'proposed' },
          })
        : reopened;
      assert.deepEqual(restored.read.children(), view.read.children());
    });
  }

  it('restores each prior status when an accept batch includes an accepted member', () => {
    const editor = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('A'), paragraph('B')],
    });
    let a = '';
    let b = '';
    editor.update((tx) => {
      a = tx.authored.propose();
      tx.text.insert(' one', { at: at(1) });
    });
    editor.update.authored.decide({
      action: 'accept',
      selection: editor.read.authored.select({ ids: [a] }),
    });
    editor.update((tx) => {
      b = tx.authored.propose();
      tx.text.insert(' two', { at: at(1, 1) });
    });
    editor.update.authored.decide({
      action: 'accept',
      selection: editor.read.authored.select({ ids: [a, b] }),
    });
    editor.update.history.undo();
    assert.equal(editor.read.authored.change(a)?.status, 'accepted');
    assert.equal(editor.read.authored.change(b)?.status, 'pending');
    assert.deepEqual(editor.read.children(), [
      paragraph('A one'),
      paragraph('B'),
    ]);
    editor.update.history.redo();
    assert.deepEqual(editor.read.children(), [
      paragraph('A one'),
      paragraph('B two'),
    ]);
  });

  it('preserves a dependent pending edit when undoing its parents acceptance', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [history(), authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    let a = '';
    let b = '';
    editor.update((tx) => {
      a = tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    authorId = 'bob';
    editor.update((tx) => {
      tx.history.skip();
      b = tx.authored.propose();
      tx.text.insert('B', { at: at(6) });
    });
    authorId = 'alice';
    editor.update.authored.decide({
      action: 'accept',
      selection: editor.read.authored.select({ ids: [a] }),
    });
    editor.update.history.undo();
    assert.deepEqual(editor.read.children(), [paragraph('Base')]);
    assert.equal(editor.read.authored.change(a)?.status, 'pending');
    assert.equal(editor.read.authored.change(b)?.status, 'pending');
    editor.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [paragraph('Base dBraft')]);
    });
  });

  it('blocks acceptance undo after a dependent contribution is accepted', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [history(), authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    let a = '';
    let b = '';
    editor.update((tx) => {
      a = tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    authorId = 'bob';
    editor.update((tx) => {
      tx.history.skip();
      b = tx.authored.propose();
      tx.text.insert('B', { at: at(6) });
    });
    authorId = 'alice';
    editor.update.authored.decide({
      action: 'accept',
      selection: editor.read.authored.select({ ids: [a] }),
    });
    authorId = 'bob';
    editor.update((tx) => {
      tx.history.skip();
      tx.authored.decide({
        action: 'accept',
        selection: tx.authored.select({ ids: [b] }),
      });
    });
    authorId = 'alice';
    const before = editor.read.value();
    const batches = editor.read.history.undos().length;
    assert.throws(() => editor.update.history.undo(), /conflict/i);
    assert.deepEqual(editor.read.value(), before);
    assert.equal(editor.read.history.undos().length, batches);
  });

  for (const action of ['accept', 'reject'] as const) {
    it(`undoes and redoes ${action} with retained reviewer operations`, () => {
      const editor = createEditor({
        extensions: [history(), authored({ authorId: 'alice' })],
        initialValue: [paragraph('Base')],
      });
      let id = '';
      editor.update((tx) => {
        id = tx.authored.propose();
        tx.text.insert(' draft', { at: at(4) });
      });
      assert.equal(
        editor.update.authored.decide({
          action,
          selection: editor.read.authored.select({ ids: [id] }),
        }).status,
        'applied'
      );
      assert.equal(
        editor.read.authored.change(id)?.status,
        action === 'accept' ? 'accepted' : 'rejected'
      );
      editor.update.history.undo();
      assert.equal(editor.read.authored.change(id)?.status, 'pending');
      assert.deepEqual(editor.read.children(), [paragraph('Base')]);
      editor.update((tx) => {
        tx.authored.propose({ changeId: id });
        assert.deepEqual(tx.children(), [paragraph('Base draft')]);
      });
      const restored = createEditor({
        extensions: [authored({ authorId: 'alice' })],
        initialValue: JSON.parse(JSON.stringify(editor.read.value())),
      });
      assert.equal(restored.read.authored.change(id)?.status, 'pending');
      restored.update((tx) => {
        tx.authored.propose({ changeId: id });
        assert.deepEqual(tx.children(), [paragraph('Base draft')]);
      });
      editor.update.history.redo();
      assert.equal(
        editor.read.authored.change(id)?.status,
        action === 'accept' ? 'accepted' : 'rejected'
      );
      assert.deepEqual(editor.read.children(), [
        paragraph(action === 'accept' ? 'Base draft' : 'Base'),
      ]);
      assert.equal(editor.read.authored.change(id)?.revision, 4);
    });
  }

  it('undoes one amendment and redoes it under the same pending identity', () => {
    const editor = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    let id = '';
    editor.update((tx) => {
      id = tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      tx.text.insert('!', { at: at(10) });
    });
    assert.equal(editor.read.history.undos().length, 2);
    editor.update.history.undo();
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      assert.deepEqual(tx.children(), [paragraph('Base draft')]);
    });
    assert.equal(editor.read.authored.change(id)?.status, 'pending');
    assert.equal(editor.read.authored.changes().items.length, 1);
    editor.update.history.redo();
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      assert.deepEqual(tx.children(), [paragraph('Base draft!')]);
    });
    assert.deepEqual(editor.read.children(), [paragraph('Base')]);
    const restored = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    assert.equal(
      restored.update.authored.decide({
        action: 'accept',
        selection: restored.read.authored.select({ ids: [id] }),
      }).status,
      'applied'
    );
    assert.deepEqual(restored.read.children(), [paragraph('Base draft!')]);
  });

  it('undoes accepted text while preserving a later independent author', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [
        authored({ authorId: () => authorId, retainHistory: true }),
        history(),
      ],
      initialValue: [paragraph('A'), paragraph('B')],
    });
    editor.update.text.insert(' alice', { at: at(1) });
    authorId = 'bob';
    editor.update((tx) => {
      tx.history.skip();
      tx.text.insert(' bob', { at: at(1, 1) });
    });
    authorId = 'alice';
    editor.update.history.undo();
    assert.deepEqual(editor.read.children(), [
      paragraph('A'),
      paragraph('B bob'),
    ]);
    editor.update.history.redo();
    assert.deepEqual(editor.read.children(), [
      paragraph('A alice'),
      paragraph('B bob'),
    ]);
    assert.equal(
      editor.read.authored.changes({ authorId: 'bob' }).items.length,
      1
    );
  });

  it('rolls back a failed undo without consuming its history batch', () => {
    const editor = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    const before = editor.read.value();
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.history.undo();
          throw new Error('abort undo');
        }),
      /abort undo/
    );
    assert.deepEqual(editor.read.value(), before);
    assert.equal(editor.read.history.undos().length, 1);
    assert.equal(editor.read.history.redos().length, 0);
  });

  it('keeps merged amendments reversible and rejection atomic after undo', () => {
    const editor = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    let id = '';
    editor.update((tx) => {
      id = tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    editor.update((tx) => {
      tx.history.merge();
      tx.authored.propose({ changeId: id });
      tx.text.insert('!', { at: at(10) });
    });
    assert.equal(editor.read.history.undos().length, 1);
    editor.update.history.undo();
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      assert.deepEqual(tx.children(), [paragraph('Base')]);
    });
    editor.update.history.redo();
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      assert.deepEqual(tx.children(), [paragraph('Base draft!')]);
    });
    assert.equal(
      editor.update.authored.decide({
        action: 'reject',
        selection: editor.read.authored.select({ ids: [id] }),
      }).status,
      'applied'
    );
    editor.update((tx) => {
      tx.authored.propose();
      assert.deepEqual(tx.children(), [paragraph('Base')]);
    });
  });

  it('refuses to erase a dependent foreign proposal during undo', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [history(), authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    authorId = 'bob';
    editor.update((tx) => {
      tx.history.skip();
      tx.authored.propose();
      tx.text.insert('B', { at: at(6) });
    });
    authorId = 'alice';
    const before = editor.read.value();
    assert.throws(() => editor.update.history.undo(), /conflict/i);
    assert.deepEqual(editor.read.value(), before);
    assert.equal(editor.read.history.undos().length, 1);
    assert.equal(editor.read.history.redos().length, 0);
  });

  it('replays successive unmerged undo and redo without creating review decisions', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' }), history()],
      initialValue: [paragraph('Base')],
    });
    let id = '';
    editor.update((tx) => {
      id = tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      tx.text.insert('!', { at: at(10) });
    });
    editor.update.history.undo();
    editor.update.history.undo();
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      assert.deepEqual(tx.children(), [paragraph('Base')]);
    });
    editor.update.history.redo();
    editor.update.history.redo();
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      assert.deepEqual(tx.children(), [paragraph('Base draft!')]);
    });
    assert.equal(editor.read.authored.change(id)?.status, 'pending');
    assert.equal(editor.read.authored.change(id)?.revision, 6);
  });
});
