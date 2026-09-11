import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, createEditorView } from 'plitejs';
import { authored } from 'plitejs/authored';
import { history, History } from 'plitejs/history';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number) => ({ path: [0, 0], offset });
const proposal = { intent: 'propose', projection: 'proposed' } as const;
const savedProposal = () => {
  const editor = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('Base')],
  });
  const view = createEditorView(editor, { authored: proposal });
  view.update.text.insert(' draft', { at: point(4) });
  return {
    value: JSON.parse(JSON.stringify(editor.read.value())),
    id: editor.read.authored.changes().items[0].id,
  };
};

describe('authored document ingress', () => {
  it('loads saved proposals into an existing reader without authoring the load', () => {
    const saved = savedProposal();
    const editor = createEditor({
      extensions: [
        history(),
        authored({
          authorId: () => {
            throw new Error('Loading cannot request a writer');
          },
        }),
      ],
      initialValue: [paragraph('Other')],
    });
    const view = createEditorView(editor, { authored: proposal });
    let commits = 0;
    editor.subscribeCommit(() => {
      commits += 1;
    });
    editor.update.value.replace(saved.value);
    assert.equal(commits, 1);
    assert.deepEqual(editor.read.children(), [paragraph('Base')]);
    assert.deepEqual(view.read.children(), [paragraph('Base draft')]);
    assert.deepEqual(
      editor.read.authored.changes().items.map((change) => change.id),
      [saved.id]
    );
    assert.equal(editor.read.authored.change(saved.id)?.authorId, 'alice');
    assert.equal(editor.read.history.undos().length, 0);
  });

  it('loads plain content as a fresh document and detaches the replaced documents anchors', () => {
    let authorId: string | null = 'alice';
    const editor = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('Old')],
    });
    const view = createEditorView(editor, { authored: proposal });
    const anchor = view.anchor(
      { anchor: point(0), focus: point(3) },
      { deletion: 'drop' }
    );
    view.update.text.insert(' draft', { at: point(3) });
    authorId = null;
    editor.update.value.replace({ children: [paragraph('New')] });
    assert.deepEqual(editor.read.children(), [paragraph('New')]);
    assert.deepEqual(view.read.children(), [paragraph('New')]);
    assert.equal(editor.read.authored.changes().items.length, 0);
    assert.equal(anchor.resolve(), null);
    authorId = 'bob';
    view.update.text.insert(' draft', { at: point(3) });
    assert.deepEqual(view.read.children(), [paragraph('New draft')]);
    assert.equal(editor.read.authored.changes().items[0].authorId, 'bob');
    anchor.release();
  });

  it('rolls back an imported document whose retained operations contradict its content', () => {
    const saved = savedProposal();
    saved.value.children[0].children[0].text = 'Corrupt accepted content';
    const editor = createEditor({
      extensions: [authored({ authorId: 'bob' })],
      initialValue: [paragraph('Keep')],
    });
    const view = createEditorView(editor, { authored: proposal });
    const before = editor.read.value();
    let commits = 0;
    editor.subscribeCommit(() => {
      commits += 1;
    });
    assert.throws(() => editor.update.value.replace(saved.value));
    assert.deepEqual(editor.read.value(), before);
    assert.deepEqual(view.read.children(), [paragraph('Keep')]);
    assert.equal(commits, 0);
  });

  for (const editFirst of [false, true]) {
    it(`rejects ordinary writes ${editFirst ? 'before' : 'after'} document replacement atomically`, () => {
      const editor = createEditor({
        extensions: [authored({ authorId: 'alice' })],
        initialValue: [paragraph('Keep')],
      });
      const before = editor.read.value();
      assert.throws(
        () =>
          editor.update((tx) => {
            if (editFirst) tx.text.insert('X', { at: point(2) });
            tx.value.replace({ children: [paragraph('New')] });
            if (!editFirst) tx.text.insert('X', { at: point(2) });
          }),
        /replace|replacement|load/i
      );
      assert.deepEqual(editor.read.value(), before);
    });
  }

  it('loads a runtime in proposal mode with an accepted-coordinate input selection', () => {
    const saved = savedProposal();
    const editor = createEditor({
      extensions: [authored({ authorId: 'bob' })],
      initialValue: [paragraph('Other')],
    });
    editor.api.authored.setView(proposal);
    editor.update.value.replace({ ...saved.value, selection: 'end' });
    assert.deepEqual(editor.read.value().children, [paragraph('Base')]);
    assert.deepEqual(editor.read.children(), [paragraph('Base draft')]);
    assert.deepEqual(editor.read.selection(), {
      anchor: point(10),
      focus: point(10),
    });
    assert.equal(editor.read.authored.changes().items.length, 1);
  });

  it('rejects full-document metadata at a root-bound view', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'bob' })],
      initialValue: [paragraph('Keep')],
    });
    const view = createEditorView(editor, { authored: proposal });
    const before = editor.read.value();
    assert.throws(
      () => view.update.value.replace(savedProposal().value),
      /complete editor/
    );
    assert.deepEqual(editor.read.value(), before);
  });

  it('clears local undo and redo actions from the replaced document', () => {
    const editor = createEditor({
      extensions: [history(), authored({ authorId: 'bob' })],
      initialValue: [paragraph('Old')],
    });
    const view = createEditorView(editor, { authored: proposal });
    view.update.text.insert(' first', { at: point(3) });
    view.update.text.insert(' second', { at: point(9) });
    view.update.history.undo();
    assert.equal(editor.read.history.undos().length, 1);
    assert.equal(editor.read.history.redos().length, 1);
    editor.update.value.replace(savedProposal().value);
    assert.equal(editor.read.history.undos().length, 0);
    assert.equal(editor.read.history.redos().length, 0);
    view.update.history.undo();
    view.update.history.redo();
    assert.deepEqual(view.read.children(), [paragraph('Base draft')]);
  });

  it('restores saved local history in the same atomic document load', () => {
    const source = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    const proposed = createEditorView(source, { authored: proposal });
    proposed.update.text.insert(' draft', { at: point(4) });
    const saved = JSON.parse(JSON.stringify(source.read.value()));
    const savedHistory = JSON.parse(JSON.stringify(History.toJSON(proposed)));
    const editor = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Other')],
    });
    const view = createEditorView(editor, { authored: proposal });
    editor.update((tx) => {
      tx.value.replace(saved);
      const [change] = tx.authored.changes().items;
      assert.equal(change.authorId, 'alice');
      tx.history.restore(History.fromJSON(editor, savedHistory));
    });
    assert.equal(editor.read.history.undos().length, 1);
    view.update.history.undo();
    assert.deepEqual(view.read.children(), [paragraph('Base')]);
    view.update.history.redo();
    assert.deepEqual(view.read.children(), [paragraph('Base draft')]);
  });

  it('rejects an authored decision after loading before publishing either state', () => {
    const editor = createEditor({
      extensions: [authored({ authorId: 'bob' })],
      initialValue: [paragraph('Keep')],
    });
    const before = editor.read.value();
    const saved = savedProposal();
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.value.replace(saved.value);
          tx.authored.decide({
            action: 'accept',
            selection: tx.authored.select({ ids: [saved.id] }),
          });
        }),
      /replacement/
    );
    assert.deepEqual(editor.read.value(), before);
  });

  it('captures root-bound replacement as one proposal and preserves other roots', () => {
    const editor = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
      initialValue: {
        children: [paragraph('Body')],
        roots: { note: [paragraph('Note')] },
      },
    });
    const view = createEditorView(editor, { root: 'note', authored: proposal });
    view.update.value.replace({
      children: [paragraph('Replacement')],
      selection: 'end',
    });
    assert.deepEqual(editor.read.children(), [paragraph('Body')]);
    assert.deepEqual(editor.read.value().roots?.note, [paragraph('Note')]);
    assert.deepEqual(view.read.children(), [paragraph('Replacement')]);
    const [change] = editor.read.authored.changes().items;
    assert.equal(change.authorId, 'alice');
    assert.equal(change.status, 'pending');
    assert.deepEqual(view.read.selection(), {
      anchor: { ...point(11), root: 'note' },
      focus: { ...point(11), root: 'note' },
    });
    view.update.history.undo();
    assert.deepEqual(view.read.children(), [paragraph('Note')]);
    view.update.history.redo();
    assert.deepEqual(view.read.children(), [paragraph('Replacement')]);
  });
});
