import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEffect,
  definePlugin,
  type Element,
} from 'plitejs';

import { History, history } from '../../src/history';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
};

describe('immutable history branches', () => {
  it('moves a session batch only after replay and queues the next undo', async () => {
    type Transition = Readonly<{ previous: string; value: string }>;
    const gate = deferred<void>();
    let external = 'comment';
    const sessionEffect = defineEffect<Transition>({
      history: 'session',
      historyReplay: async (_editor, transition) => {
        await gate.promise;
        external = transition.value;

        return { status: 'applied', value: transition };
      },
      invert: ({ previous, value }) => ({ previous: value, value: previous }),
      key: 'history.session-queue',
    });
    const editor = createEditor({
      plugins: [
        history(),
        definePlugin('history-session-queue', {
          effectTypes: [sessionEffect],
        }),
      ],
      initialValue: [paragraph('')],
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('A', { at: { offset: 0, path: [0, 0] } });
    });
    editor.update((tx) => {
      tx.effects.emit(sessionEffect, { previous: '', value: 'comment' });
    });
    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('C', { at: { offset: 0, path: [0, 0] } });
    });

    assert.deepEqual(await editor.api.history.undo(), { status: 'applied' });
    const sessionUndo = editor.api.history.undo();
    const documentUndo = editor.api.history.undo();

    assert.equal(editor.read.text.string([]), 'A');
    assert.equal(external, 'comment');
    assert.equal(editor.read.history().undos.length, 2);
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.text.insert('X');
        }),
      /cannot publish while a session history effect is replaying/i
    );

    gate.resolve();
    assert.deepEqual(await sessionUndo, { status: 'applied' });
    assert.deepEqual(await documentUndo, { status: 'applied' });
    assert.equal(external, '');
    assert.equal(editor.read.text.string([]), '');
    assert.equal(editor.read.history().undos.length, 0);
  });

  it('keeps a blocked session batch at the branch head', async () => {
    let attempts = 0;
    const sessionEffect = defineEffect<string>({
      history: 'session',
      historyReplay: () => {
        attempts += 1;

        return { reason: 'external-diverged', status: 'blocked' };
      },
      key: 'history.session-blocked',
    });
    const editor = createEditor({
      plugins: [
        history(),
        definePlugin('history-session-blocked', {
          effectTypes: [sessionEffect],
        }),
      ],
      initialValue: [paragraph('')],
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('A', { at: { offset: 0, path: [0, 0] } });
    });
    editor.update((tx) => tx.effects.emit(sessionEffect, 'comment'));

    for (let attempt = 1; attempt <= 2; attempt++) {
      assert.deepEqual(await editor.api.history.undo(), {
        reason: 'external-diverged',
        status: 'blocked',
      });
      assert.equal(attempts, attempt);
      assert.equal(editor.read.text.string([]), 'A');
      assert.equal(editor.read.history().undos.length, 2);
      assert.equal(editor.read.history().redos.length, 0);
    }
  });

  it('publishes frozen revisioned snapshots and clips configurable depth', () => {
    const editor = createEditor({
      plugins: [history({ maxDepth: 2 })],
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
    assert.ok(value.revision > 0);
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
        plugins: [history()],
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
    eager.api.history.undo();
    lazy.api.history.undo();

    assert.deepEqual(lazy.read.value(), eager.read.value());
    assert.deepEqual(lazy.read.selection(), eager.read.selection());
    assert.deepEqual(History.toJSON(lazy), History.toJSON(eager));
  });

  it('keeps a skipped merge-boundary insert on the surviving left block', () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: [paragraph('alpha'), paragraph('beta')],
    });

    editor.update((tx) => tx.nodes.merge({ at: [1] }));
    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('?', { at: { offset: 'alpha'.length, path: [0, 0] } });
    });
    editor.api.history.undo();

    assert.deepEqual(editor.read.children(), [
      paragraph('alpha?'),
      paragraph('beta'),
    ]);

    editor.api.history.redo();

    assert.deepEqual(editor.read.children(), [paragraph('alpha?beta')]);
  });

  it('keeps a skipped boundary insert through a broad text replacement', () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: [paragraph('alpha')],
    });

    editor.update.nodes.replaceChildren([{ text: 'alphaLin fragment' }], {
      at: [0],
    });
    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert(' Ada', { at: { offset: 5, path: [0, 0] } });
    });
    editor.api.history.undo();

    assert.deepEqual(editor.read.children(), [paragraph('alpha Ada')]);

    editor.api.history.redo();

    assert.deepEqual(editor.read.children(), [
      paragraph('alpha AdaLin fragment'),
    ]);
  });

  it('keeps a skipped sibling insert after undo restores and crosses it', () => {
    const editor = createEditor({
      plugins: [history()],
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

    editor.api.history.undo();
    assert.deepEqual(editor.read.children(), [
      paragraph('alpha'),
      paragraph('remote'),
      paragraph('local'),
    ]);

    editor.api.history.undo();
    assert.deepEqual(editor.read.children(), [
      paragraph('alpha'),
      paragraph('remote'),
    ]);
  });

  it('does not apply one skipped change twice across consecutive undos', () => {
    const editor = createEditor({
      plugins: [history()],
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

    editor.api.history.undo();
    assert.deepEqual(editor.read.children(), [
      paragraph('alpha'),
      paragraph('remote'),
      paragraph('first'),
    ]);

    editor.api.history.undo();
    assert.deepEqual(editor.read.children(), [
      paragraph('alpha'),
      paragraph('remote'),
    ]);
  });

  it('throws an unresolvable mapping instead of silently deleting history', () => {
    const editor = createEditor({
      plugins: [history()],
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
      () => editor.api.history.undo(),
      /Cannot transform concurrent root lifecycle changes/
    );
    assert.throws(
      () => editor.api.history.undo(),
      /Cannot transform concurrent root lifecycle changes/
    );
  });

  it('decodes without mutation and restores in one observable commit', () => {
    const source = createEditor({
      plugins: [history()],
      initialValue: [paragraph('body')],
    });

    source.update((tx) => tx.text.insert('local'));
    const editor = createEditor({
      plugins: [history()],
      initialValue: source.read.value(),
    });
    const before = editor.read.history();
    const decoded = History.fromJSON(editor, History.toJSON(source));
    let commits = 0;
    let observedRevision = -1;

    editor.subscribe((_snapshot, commit) => {
      if (!commit) return;

      commits += 1;
      observedRevision = editor.read.history().revision;
      assert.ok(commit.tags.includes('history-restore'));
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
    assert.ok(observedRevision > before.revision);

    const restored = editor.read.history();
    const invalid = structuredClone(History.toJSON(source));

    (invalid.undos as unknown[]).push({});

    assert.throws(() => History.fromJSON(editor, invalid));
    assert.equal(editor.read.history(), restored);
  });
});
