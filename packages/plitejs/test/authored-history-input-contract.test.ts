import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, createEditorView } from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';

import {
  applyTransactionSpec,
  setEditorComposing,
} from '../src/core/public-state';

const point = (offset: number) => ({ path: [0, 0], offset });
const proposal = { intent: 'propose', projection: 'proposed' } as const;
const setup = () => {
  let authorId = 'alice';
  const source = createEditor({
    extensions: [history(), authored({ authorId: () => authorId })],
    initialValue: [{ type: 'paragraph', children: [{ text: 'Base' }] }],
  });
  const view = createEditorView(source, { authored: proposal });
  view.update.selection.set(point(4));
  return {
    source,
    view,
    setAuthor: (value: string) => {
      authorId = value;
    },
  };
};
const type = (view: ReturnType<typeof setup>['view'], text: string) => {
  for (const character of text) {
    view.update({ tags: 'native-text-input' }, (tx) =>
      tx.text.insert(character)
    );
  }
};

describe('native authored input history', () => {
  it('keeps a composition between separate typing batches', async () => {
    const { view } = setup();
    type(view, ' A');
    setEditorComposing(view, true);
    type(view, '漢字');
    setEditorComposing(view, false);
    await Promise.resolve();
    type(view, ' B');
    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Base A漢字');
    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Base A');
  });

  it('evaluates a native replacement command without exposing the internal primary-root key', () => {
    const { source, view } = setup();
    view.update.selection.set({ anchor: point(1), focus: point(3) });
    const spec = view.read((state) =>
      state.transaction((tx) => tx.text.insert('better'))
    );
    assert.equal(view.read.text.string([]), 'Base');
    view.update({ tags: 'native-text-input' }, () =>
      applyTransactionSpec(source, spec)
    );
    assert.equal(view.read.text.string([]), 'Bbettere');
    assert.equal(source.read.text.string([]), 'Base');
  });

  it('groups adjacent proposal typing and restores both undo and redo carets', () => {
    const { source, view } = setup();
    type(view, ' draft');
    assert.equal(view.read.text.string([]), 'Base draft');
    assert.equal(source.read.text.string([]), 'Base');
    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Base');
    assert.deepEqual(view.read.selection(), {
      anchor: point(4),
      focus: point(4),
    });
    view.update.history.redo();
    assert.equal(view.read.text.string([]), 'Base draft');
    assert.deepEqual(view.read.selection(), {
      anchor: point(10),
      focus: point(10),
    });
    type(view, '!');
    assert.equal(view.read.text.string([]), 'Base draft!');
    assert.equal(source.read.text.string([]), 'Base');
  });

  it('starts a distinct typing batch when the author changes', () => {
    const { setAuthor, source, view } = setup();
    type(view, ' Alice');
    setAuthor('bob');
    type(view, ' Bob');
    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Base Alice');
    setAuthor('alice');
    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Base');
    assert.equal(source.read.text.string([]), 'Base');
  });

  it('keeps native typing batches local to their originating view', () => {
    const { source, view } = setup();
    const other = createEditorView(source, { authored: proposal });
    type(view, ' A');
    other.update({ tags: 'native-text-input' }, (tx) => {
      tx.selection.set(point(6));
      tx.text.insert(' B');
    });
    other.update.history.undo();
    assert.equal(other.read.text.string([]), 'Base A');
    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Base');
  });

  it('undoes a native selection replacement and its following typing together', () => {
    const { source, view } = setup();
    view.update.selection.set({ anchor: point(1), focus: point(3) });
    type(view, 'etter');
    assert.equal(view.read.text.string([]), 'Bettere');
    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Base');
    assert.deepEqual(view.read.selection(), {
      anchor: point(1),
      focus: point(3),
    });
    assert.equal(source.read.text.string([]), 'Base');
  });

  it('groups accepted native typing while retaining its author history', () => {
    const { source, view } = setup();
    view.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    type(view, ' draft');
    assert.equal(source.read.text.string([]), 'Base draft');
    view.update.history.undo();
    assert.equal(source.read.text.string([]), 'Base');
    view.update.history.redo();
    assert.equal(source.read.text.string([]), 'Base draft');
  });

  it('does not merge a native input burst with a programmatic proposal', () => {
    const { view } = setup();
    view.update.text.insert(' prepared');
    type(view, ' draft');
    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Base prepared');
    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Base');
  });

  it('ends the typing group when the exact-view policy changes', () => {
    const { view } = setup();
    type(view, ' A');
    view.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    view.api.authored.setView(proposal);
    type(view, ' B');
    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Base A');
  });

  it('does not let a native merge hint cross an intervening selection action', () => {
    const { view } = setup();
    type(view, ' A');
    view.update.selection.set(point(0));
    view.update.selection.set(point(6));
    view.update({ history: 'merge', tags: 'native-text-input' }, (tx) =>
      tx.text.insert(' B')
    );
    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Base A');
  });
});
