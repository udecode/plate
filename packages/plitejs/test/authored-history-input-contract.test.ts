import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  schema,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';

import {
  applyTransactionSpec,
  setEditorComposing,
} from '../src/core/public-state';

const point = (offset: number) => ({ path: [0, 0], offset });
const proposal = { intent: 'propose', projection: 'proposed' } as const;
const markup = { intent: 'propose', projection: 'markup' } as const;
const setup = () => {
  let authorId = 'alice';
  const source = createEditor({
    plugins: [history(), authored({ authorId: () => authorId })],
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
  it('captures an expanded composition with automatic history grouping disabled', async () => {
    const source = createEditor({
      plugins: [history({ newBatchDelay: 0 }), authored({ authorId: 'alice' })],
      initialValue: [
        { type: 'paragraph', children: [{ text: 'AB' }] },
        { type: 'paragraph', children: [{ text: 'CD' }] },
      ],
    });
    const view = createEditorView(source, { authored: proposal });
    const selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    };
    view.update.selection.set(selection);
    setEditorComposing(view, true);
    view.update({ tags: 'native-text-input' }, (tx) => tx.text.delete());
    const { id } = view.read.authored.changes().items[0];
    view.update(
      { tags: ['dom-text-input', 'composition', 'history-merge'] },
      (tx) => tx.text.insert('に')
    );
    setEditorComposing(view, false);
    await Promise.resolve();
    assert.deepEqual(
      view.read.authored.changes().items.map((change) => change.id),
      [id]
    );
    assert.equal(view.read.text.string([]), 'AにD');
    assert.equal(source.read.text.string([]), 'ABCD');
    view.update.history.undo();
    assert.deepEqual(view.read.children(), source.read.children());
    assert.deepEqual(view.read.selection(), selection);
    view.update.history.redo();
    assert.equal(view.read.text.string([]), 'AにD');
    assert.equal(view.read.authored.change(id)?.status, 'pending');
    type(view, '!');
    assert.equal(view.read.text.string([]), 'Aに!D');
    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'AにD');
  });

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

  it('keeps composition proposal identity local to its view and author', async () => {
    const { source, view, setAuthor } = setup();
    const sibling = createEditorView(source, { authored: proposal });
    sibling.update.selection.set(point(0));
    setEditorComposing(view, true);
    type(view, 'A');
    const first = view.read.authored.changes().items[0].id;
    type(sibling, 'S');
    setAuthor('bob');
    type(view, 'B');
    const bob = view.read.authored.changes({ authorId: 'bob' }).items[0].id;
    setAuthor('alice');
    type(view, 'C');
    setEditorComposing(view, false);
    await Promise.resolve();
    const changes = view.read.authored.changes().items;
    assert.equal(changes.length, 4);
    assert.equal(view.read.authored.change(first)?.revision, 1);
    assert.equal(view.read.authored.change(bob)?.revision, 1);
    assert.equal(view.read.text.string([]), 'SBaseABC');
    assert.equal(source.read.text.string([]), 'Base');
  });

  it('does not reuse an aborted composition capture or a decided proposal', async () => {
    const { source, view } = setup();
    setEditorComposing(view, true);
    assert.throws(
      () =>
        view.update((tx) => {
          tx.text.insert('lost');
          throw new Error('abort composition');
        }),
      /abort composition/
    );
    assert.equal(view.read.authored.changes().items.length, 0);
    type(view, 'A');
    const first = view.read.authored.changes().items[0].id;
    source.update.authored.decide({
      action: 'accept',
      selection: source.read.authored.select({ ids: [first] }),
    });
    type(view, 'B');
    setEditorComposing(view, false);
    await Promise.resolve();
    assert.equal(view.read.authored.change(first)?.status, 'accepted');
    assert.equal(
      view.read.authored.changes({ status: 'pending' }).items.length,
      1
    );
    assert.equal(view.read.text.string([]), 'BaseAB');
    assert.equal(source.read.text.string([]), 'BaseA');
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
    assert.equal(
      view.read.authored.changes({ status: 'pending' }).items.length,
      1
    );
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

  it('groups contiguous backward deletions into one suggestion', () => {
    const { source, view } = setup();
    view.update({ tags: 'native-text-input' }, (tx) =>
      tx.text.delete({ reverse: true, unit: 'character' })
    );
    view.update({ tags: ['native-text-input', 'history-merge'] }, (tx) =>
      tx.text.delete({ reverse: true, unit: 'character' })
    );

    assert.equal(view.read.text.string([]), 'Ba');
    assert.equal(source.read.text.string([]), 'Base');
    const changes = view.read.authored.changes({ status: 'pending' }).items;
    assert.equal(changes.length, 1);
    assert.equal(changes[0].revision, 2);

    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Base');
    assert.deepEqual(view.read.selection(), {
      anchor: point(4),
      focus: point(4),
    });
    view.update.history.redo();
    assert.equal(view.read.text.string([]), 'Ba');
    assert.equal(view.read.authored.changes().items[0].id, changes[0].id);
    assert.equal(
      source.update.authored.decide({
        action: 'accept',
        selection: source.read.authored.select({ ids: [changes[0].id] }),
      }).status,
      'applied'
    );
    assert.equal(source.read.text.string([]), 'Ba');
    assert.equal(
      view.read.authored.changes({ status: 'pending' }).items.length,
      0
    );
  });

  it('groups contiguous backward deletions in the markup projection', () => {
    const source = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [{ type: 'paragraph', children: [{ text: 'Base' }] }],
    });
    const view = createEditorView(source, { authored: markup });
    view.update.selection.set(point(4));

    view.update({ tags: 'native-text-input' }, (tx) =>
      tx.text.delete({ reverse: true, unit: 'character' })
    );
    view.update({ tags: ['native-text-input', 'history-merge'] }, (tx) =>
      tx.text.delete({ reverse: true, unit: 'character' })
    );

    assert.equal(source.read.text.string([]), 'Base');
    assert.equal(view.read.text.string([]), 'Ba');
    const changes = view.read.authored.changes({ status: 'pending' }).items;
    assert.equal(changes.length, 1);
    assert.equal(changes[0].revision, 2);
  });

  it('groups contiguous deletions after unrelated retained changes', () => {
    let authorId = 'bob';
    const source = createEditor({
      plugins: [history(), authored({ authorId: () => authorId })],
      initialValue: [
        { type: 'paragraph', children: [{ text: 'Base' }] },
        { type: 'paragraph', children: [{ text: 'Other' }] },
      ],
    });
    const view = createEditorView(source, { authored: markup });
    view.update.text.delete({
      at: {
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 2 },
      },
    });
    authorId = 'alice';
    view.update.selection.set(point(4));

    view.update.text.deleteBackward();
    view.update.text.deleteBackward();

    const alice = view.read.authored.changes({
      authorId: 'alice',
      status: 'pending',
    }).items;
    assert.equal(alice.length, 1);
    assert.equal(alice[0].revision, 2);
  });

  it('groups contiguous deletions after an inline boundary', () => {
    const inline = defineEditorSchema('authored-history-inline', {
      elements: {
        link: {
          content: schema.content.text({ min: 1 }),
          inline: true,
        },
      },
      id: 'authored-history-inline',
      root: schema.content.not(schema.content.text()),
      unknown: 'preserve',
      version: 1,
    });
    const source = createEditor({
      plugins: [inline, history(), authored({ authorId: 'alice' })],
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { type: 'link', children: [{ text: 'Docs' }] },
            { text: ' to discover more.' },
          ],
        },
      ],
    });
    const view = createEditorView(source, { authored: markup });
    view.update.selection.set({ path: [0, 1], offset: 18 });

    view.update.text.deleteBackward();
    view.update.text.deleteBackward();

    const changes = view.read.authored.changes({ status: 'pending' }).items;
    assert.equal(changes.length, 1);
    assert.equal(changes[0].revision, 2);
  });

  it('groups contiguous forward deletions into one suggestion', () => {
    const { source, view } = setup();
    view.update.selection.set(point(0));
    view.update({ tags: 'native-text-input' }, (tx) =>
      tx.text.delete({ unit: 'character' })
    );
    view.update({ tags: ['native-text-input', 'history-merge'] }, (tx) =>
      tx.text.delete({ unit: 'character' })
    );

    assert.equal(view.read.text.string([]), 'se');
    assert.equal(source.read.text.string([]), 'Base');
    const changes = view.read.authored.changes({ status: 'pending' }).items;
    assert.equal(changes.length, 1);
    assert.equal(changes[0].revision, 2);
  });

  it('groups adjacent range deletions from either edge', () => {
    for (const side of ['left', 'right'] as const) {
      const source = createEditor({
        plugins: [history(), authored({ authorId: 'alice' })],
        initialValue: [{ type: 'paragraph', children: [{ text: 'ABCDEFG' }] }],
      });
      const view = createEditorView(source, { authored: proposal });

      view.update.text.delete({
        at: { anchor: point(2), focus: point(4) },
      });
      view.update.text.delete({
        at:
          side === 'left'
            ? { anchor: point(1), focus: point(2) }
            : { anchor: point(2), focus: point(4) },
      });

      const changes = view.read.authored.changes({ status: 'pending' }).items;
      assert.equal(changes.length, 1, side);
      assert.equal(changes[0].revision, 2, side);
      assert.equal(source.read.text.string([]), 'ABCDEFG', side);
      assert.equal(
        view.read.text.string([]),
        side === 'left' ? 'AEFG' : 'ABG',
        side
      );
    }
  });

  it('keeps spatial suggestion grouping independent from history batches', () => {
    const { view } = setup();
    view.update({ tags: 'native-text-input' }, (tx) =>
      tx.text.delete({ reverse: true, unit: 'character' })
    );
    view.update.selection.set(point(0));
    view.update.selection.set(point(3));
    view.update({ tags: ['native-text-input', 'history-push'] }, (tx) =>
      tx.text.delete({ reverse: true, unit: 'character' })
    );

    const changes = view.read.authored.changes({ status: 'pending' }).items;
    assert.equal(changes.length, 1);
    assert.equal(changes[0].revision, 2);
    assert.equal(view.read.text.string([]), 'Ba');

    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Bas');
    assert.deepEqual(
      view.read.authored
        .changes({ status: 'pending' })
        .items.map(({ id }) => id),
      [changes[0].id]
    );
    view.update.history.undo();
    assert.equal(view.read.text.string([]), 'Base');
  });

  it('splits deletion suggestions across a content gap or author change', () => {
    const gap = setup();
    gap.view.update.text.delete({ at: { anchor: point(3), focus: point(4) } });
    gap.view.update.text.delete({ at: { anchor: point(1), focus: point(2) } });
    assert.equal(
      gap.view.read.authored.changes({ status: 'pending' }).items.length,
      2
    );

    const authors = setup();
    authors.view.update.text.delete({
      at: { anchor: point(3), focus: point(4) },
    });
    authors.setAuthor('bob');
    authors.view.update.text.delete({
      at: { anchor: point(2), focus: point(3) },
    });
    assert.equal(
      authors.view.read.authored.changes({ status: 'pending' }).items.length,
      2
    );
  });

  it('extends one adjacent deletion when removing the gap between two suggestions', () => {
    const source = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [{ type: 'paragraph', children: [{ text: 'ABCDE' }] }],
    });
    const view = createEditorView(source, { authored: proposal });

    view.update.text.delete({ at: { anchor: point(3), focus: point(4) } });
    view.update.text.delete({ at: { anchor: point(1), focus: point(2) } });
    view.update.text.delete({ at: { anchor: point(1), focus: point(2) } });

    assert.equal(source.read.text.string([]), 'ABCDE');
    assert.equal(view.read.text.string([]), 'AE');
    const changes = view.read.authored.changes({ status: 'pending' }).items;
    assert.equal(changes.length, 2);
    assert.deepEqual(
      changes
        .map(({ revision }) => revision)
        .sort((left, right) => left - right),
      [1, 2]
    );
  });

  it('groups a collapsed deletion and replacement text', () => {
    const { view } = setup();
    view.update({ tags: 'native-text-input' }, (tx) =>
      tx.text.delete({ reverse: true, unit: 'character' })
    );
    type(view, 'X');

    const changes = view.read.authored.changes({ status: 'pending' }).items;
    assert.equal(changes.length, 1);
    assert.equal(changes[0].revision, 2);
    assert.equal(view.read.text.string([]), 'BasX');
    const details = view.read.authored.details(changes[0].id);
    assert.equal(details?.parts.status, 'available');
    assert.equal(
      details?.parts.status === 'available' &&
        details.parts.items.some(
          (part) => part.kind === 'content' && part.action === 'replace'
        ),
      true
    );
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
