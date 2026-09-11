import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor } from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const at = (offset: number, block = 0) => ({ path: [block, 0], offset });

describe('retained authored revert', () => {
  it('creates a new contribution while preserving another authors independent work', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [
        history(),
        authored({ authorId: () => authorId, retainHistory: true }),
      ],
      initialValue: [paragraph('A'), paragraph('B')],
    });
    editor.update.text.insert(' alice', { at: at(1) });
    const selected = editor.read.authored.select({
      authorId: 'alice',
      status: 'accepted',
    });
    const original = editor.read.authored.change(selected.changes[0].id);
    authorId = 'bob';
    editor.update.text.insert(' bob', { at: at(1, 1) });
    authorId = 'carol';
    const result = editor.update.authored.revert({ selection: selected });
    assert.equal(result.status, 'applied');
    if (result.status !== 'applied') {
      throw new Error('Expected applied revert.');
    }
    assert.equal(result.ids.length, 1);
    assert.equal(editor.read.authored.change(result.ids[0])?.authorId, 'carol');
    assert.equal(
      editor.read.authored.change(result.ids[0])?.status,
      'accepted'
    );
    assert.equal(
      editor.read.authored.change(selected.changes[0].id)?.revision,
      original?.revision
    );
    assert.deepEqual(editor.read.children(), [
      paragraph('A'),
      paragraph('B bob'),
    ]);
    editor.update.history.undo();
    assert.deepEqual(editor.read.children(), [
      paragraph('A alice'),
      paragraph('B bob'),
    ]);
  });

  it('can propose a retained revert and accept it after reload', () => {
    const extension = authored({ authorId: 'alice', retainHistory: true });
    const editor = createEditor({
      extensions: [extension],
      initialValue: [paragraph('Base')],
    });
    editor.update.text.insert(' accepted', { at: at(4) });
    const selection = editor.read.authored.select({ status: 'accepted' });
    let id = '';
    editor.update((tx) => {
      id = tx.authored.propose();
      assert.deepEqual(tx.authored.revert({ selection }), {
        status: 'applied',
        ids: [id],
      });
      assert.deepEqual(tx.children(), [paragraph('Base')]);
    });
    assert.deepEqual(editor.read.children(), [paragraph('Base accepted')]);
    const restored = createEditor({
      extensions: [extension],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    assert.equal(
      restored.update.authored.decide({
        action: 'accept',
        selection: restored.read.authored.select({ ids: [id] }),
      }).status,
      'applied'
    );
    assert.deepEqual(restored.read.children(), [paragraph('Base')]);
  });

  it('reports unavailable history and an explicit empty selection without writing', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    editor.update.text.insert(' accepted', { at: at(4) });
    const selection = editor.read.authored.select({ status: 'accepted' });
    const before = editor.read.value();
    assert.deepEqual(editor.update.authored.revert({ selection }), {
      status: 'unavailable',
      reason: 'retention',
      ids: selection.changes.map((change) => change.id),
    });
    assert.deepEqual(
      editor.update.authored.revert({
        selection: editor.read.authored.select({ ids: [] }),
      }),
      { status: 'unchanged', ids: [] }
    );
    assert.deepEqual(editor.read.value(), before);
  });

  it('blocks a revert whose accepted dependant is outside the selected batch', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId, retainHistory: true })],
      initialValue: [paragraph('Base')],
    });
    editor.update.text.insert(' alice', { at: at(4) });
    const selection = editor.read.authored.select({ authorId: 'alice' });
    authorId = 'bob';
    editor.update.text.insert('B', { at: at(6) });
    const bob = editor.read.authored.changes({ authorId: 'bob' }).items[0].id;
    const before = editor.read.value();
    const result = editor.update.authored.revert({ selection });
    assert.equal(result.status, 'blocked');
    if (result.status === 'blocked') assert.deepEqual(result.dependants, [bob]);
    assert.deepEqual(editor.read.value(), before);
  });

  it('reverts the full dependency batch as one new contribution', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId, retainHistory: true })],
      initialValue: [paragraph('Base')],
    });
    editor.update.text.insert(' alice', { at: at(4) });
    authorId = 'bob';
    editor.update.text.insert('B', { at: at(6) });
    const selection = editor.read.authored.select({ status: 'accepted' });
    authorId = 'carol';
    const result = editor.update.authored.revert({ selection });
    assert.equal(result.status, 'applied');
    assert.deepEqual(editor.read.children(), [paragraph('Base')]);
    assert.equal(
      editor.read.authored.changes({ authorId: 'carol' }).items.length,
      1
    );
    const restored = createEditor({
      extensions: [authored({ authorId: 'carol', retainHistory: true })],
      initialValue: JSON.parse(JSON.stringify(editor.read.value())),
    });
    assert.deepEqual(restored.read.children(), [paragraph('Base')]);
  });

  it('reports a stale selection after a review without reverting a partial batch', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice', retainHistory: true })],
      initialValue: [paragraph('Base')],
    });
    let id = '';
    editor.update((tx) => {
      id = tx.authored.propose();
      tx.text.insert(' draft', { at: at(4) });
    });
    const selection = editor.read.authored.select({ ids: [id] });
    editor.update.authored.decide({ action: 'accept', selection });
    const before = editor.read.value();
    assert.deepEqual(editor.update.authored.revert({ selection }), {
      status: 'stale',
      ids: [id],
    });
    assert.deepEqual(editor.read.value(), before);
  });

  it('restores a retained deletion and preserves independent later content', () => {
    let authorId = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId, retainHistory: true })],
      initialValue: [paragraph('Keep removed'), paragraph('Other')],
    });
    editor.update.text.delete({ at: { anchor: at(4), focus: at(12) } });
    const selection = editor.read.authored.select({ authorId: 'alice' });
    authorId = 'bob';
    editor.update.text.insert(' changed', { at: at(5, 1) });
    authorId = 'carol';
    assert.equal(
      editor.update.authored.revert({ selection }).status,
      'applied'
    );
    assert.deepEqual(editor.read.children(), [
      paragraph('Keep removed'),
      paragraph('Other changed'),
    ]);
  });

  it('rolls back a proposed compensation when the transaction aborts', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'alice', retainHistory: true })],
      initialValue: [paragraph('Base')],
    });
    editor.update.text.insert(' accepted', { at: at(4) });
    const selection = editor.read.authored.select({ status: 'accepted' });
    const before = editor.read.value();
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.authored.propose();
          tx.authored.revert({ selection });
          throw new Error('abort revert');
        }),
      /abort revert/
    );
    assert.deepEqual(editor.read.value(), before);
    assert.equal(
      editor.read.authored.changes({ status: 'pending' }).items.length,
      0
    );
  });
});
