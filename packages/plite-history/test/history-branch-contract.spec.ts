import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, type Element } from '@platejs/plite';

import { History, history } from '../src';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('immutable history branches', () => {
  it('publishes frozen revisioned snapshots and clips configurable depth', () => {
    const editor = createEditor({
      extensions: [history({ maxDepth: 2 })],
      initialValue: [paragraph('')],
    });

    for (const text of ['a', 'b', 'c']) {
      editor.update((tx) => {
        tx.history.newBatch();
        tx.text.insert(text, { at: { offset: 0, path: [0, 0] } });
      });
    }

    const value = editor.read.history();

    assert.equal(value.undos.length, 2);
    assert(value.revision > 0);
    assert.equal(Object.isFrozen(value), true);
    assert.equal(Object.isFrozen(value.undos), true);
    assert.equal(Object.isFrozen(value.undos[0]), true);
    assert.throws(() => {
      (value.undos as unknown[]).push({});
    }, TypeError);
  });

  it('matches eagerly resolved history after composed structural mappings', () => {
    const create = () =>
      createEditor({
        extensions: [history()],
        initialValue: [paragraph('ab'), paragraph('cd')],
      });
    const eager = create();
    const lazy = create();

    for (const editor of [eager, lazy]) {
      editor.update((tx) => tx.nodes.set({ role: 'local' }, { at: [1] }));
    }

    const applyRemoteChanges = (editor: typeof eager, resolve: boolean) => {
      editor.update({ history: 'skip' }, (tx) => {
        tx.nodes.insert(paragraph('remote'), { at: [0] });
      });
      if (resolve) editor.read.history();

      editor.update({ history: 'skip' }, (tx) => {
        tx.nodes.move({ at: [2], to: [1] });
      });
      if (resolve) editor.read.history();

      editor.update({ history: 'skip' }, (tx) => {
        tx.text.insert('!', { at: { offset: 3, path: [0, 0] } });
      });
      if (resolve) editor.read.history();
    };

    applyRemoteChanges(eager, true);
    applyRemoteChanges(lazy, false);
    eager.update((tx) => tx.history.undo());
    lazy.update((tx) => tx.history.undo());

    assert.deepEqual(lazy.read.value(), eager.read.value());
    assert.deepEqual(lazy.read.selection(), eager.read.selection());
    assert.deepEqual(History.toJSON(lazy), History.toJSON(eager));
  });

  it('keeps a skipped merge-boundary insert on the surviving left block', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: [paragraph('alpha'), paragraph('beta')],
    });

    editor.update((tx) => tx.nodes.merge({ at: [1] }));
    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('?', { at: { offset: 'alpha'.length, path: [0, 0] } });
    });
    editor.update((tx) => tx.history.undo());

    assert.deepEqual(editor.read.children(), [
      paragraph('alpha?'),
      paragraph('beta'),
    ]);

    editor.update((tx) => tx.history.redo());

    assert.deepEqual(editor.read.children(), [paragraph('alpha?beta')]);
  });

  it('keeps a skipped boundary insert through a broad text replacement', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: [paragraph('alpha')],
    });

    editor.update.nodes.replaceChildren([{ text: 'alphaLin fragment' }], {
      at: [0],
    });
    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert(' Ada', { at: { offset: 5, path: [0, 0] } });
    });
    editor.update((tx) => tx.history.undo());

    assert.deepEqual(editor.read.children(), [paragraph('alpha Ada')]);

    editor.update((tx) => tx.history.redo());

    assert.deepEqual(editor.read.children(), [
      paragraph('alpha AdaLin fragment'),
    ]);
  });

  it('keeps a skipped sibling insert after undo restores and crosses it', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: [paragraph('alpha')],
    });

    editor.update((tx) => {
      tx.history.newBatch();
      tx.nodes.insert(paragraph('local'), { at: [1] });
    });
    editor.update({ history: 'skip' }, (tx) => {
      tx.nodes.insert(paragraph('remote'), { at: [1] });
    });
    editor.update((tx) => {
      tx.history.newBatch();
      tx.nodes.remove({ at: [1] });
    });

    editor.update((tx) => tx.history.undo());
    assert.deepEqual(editor.read.children(), [
      paragraph('alpha'),
      paragraph('remote'),
      paragraph('local'),
    ]);

    editor.update((tx) => tx.history.undo());
    assert.deepEqual(editor.read.children(), [
      paragraph('alpha'),
      paragraph('remote'),
    ]);
  });

  it('does not apply one skipped change twice across consecutive undos', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: [paragraph('alpha')],
    });

    editor.update((tx) => {
      tx.history.newBatch();
      tx.nodes.insert(paragraph('first'), { at: [1] });
    });
    editor.update((tx) => {
      tx.history.newBatch();
      tx.nodes.insert(paragraph('second'), { at: [2] });
    });
    editor.update({ history: 'skip' }, (tx) => {
      tx.nodes.insert(paragraph('remote'), { at: [1] });
    });

    editor.update((tx) => tx.history.undo());
    assert.deepEqual(editor.read.children(), [
      paragraph('alpha'),
      paragraph('remote'),
      paragraph('first'),
    ]);

    editor.update((tx) => tx.history.undo());
    assert.deepEqual(editor.read.children(), [
      paragraph('alpha'),
      paragraph('remote'),
    ]);
  });

  it('throws an unresolvable mapping instead of silently deleting history', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('old')] },
      },
    });

    editor.update((tx) => tx.roots.delete('header'));
    editor.update({ history: 'skip' }, (tx) => {
      tx.roots.create('header', [paragraph('remote')]);
    });

    assert.throws(
      () => editor.update((tx) => tx.history.undo()),
      /Cannot transform concurrent root lifecycle changes/
    );
    assert.throws(
      () => editor.update((tx) => tx.history.undo()),
      /Cannot transform concurrent root lifecycle changes/
    );
  });

  it('decodes without mutation and restores in one observable commit', () => {
    const source = createEditor({
      extensions: [history()],
      initialValue: [paragraph('body')],
    });

    source.update((tx) => tx.text.insert('local'));
    const editor = createEditor({
      extensions: [history()],
      initialValue: source.read.value(),
    });
    const before = editor.read.history();
    const decoded = History.fromJSON(editor, History.toJSON(source));
    let commits = 0;
    let observedRevision = -1;

    editor.subscribe((_snapshot, commit) => {
      if (!commit) return;

      commits++;
      observedRevision = editor.read.history().revision;
      assert(commit.tags.includes('history-restore'));
    });

    assert.equal(editor.read.history(), before);
    assert.equal(Object.isFrozen(decoded), true);
    assert.equal(decoded.undos.length, 1);

    assert.throws(() => {
      editor.update((tx) => {
        tx.history.restore(decoded);
        throw new Error('rollback restore');
      });
    }, /rollback restore/);
    assert.equal(editor.read.history(), before);
    assert.equal(commits, 0);

    editor.update((tx) => tx.history.restore(decoded));

    assert.equal(commits, 1);
    assert.equal(editor.read.history().undos.length, 1);
    assert.equal(observedRevision, editor.read.history().revision);
    assert(observedRevision > before.revision);

    const restored = editor.read.history();
    const invalid = structuredClone(History.toJSON(source));

    (invalid.undos as unknown[]).push({});

    assert.throws(() => History.fromJSON(editor, invalid));
    assert.equal(editor.read.history(), restored);
  });
});
