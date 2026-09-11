import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, createEditorView, DocumentChange } from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const range = (block: number) => ({
  anchor: { path: [block, 0], offset: 1 },
  focus: { path: [block, 0], offset: 3 },
});
const proposal = { intent: 'propose', projection: 'proposed' } as const;
const initialValue = [
  paragraph('Alpha'),
  paragraph('Beta'),
  paragraph('Gamma'),
];

describe('authored content movement', () => {
  it('carries accepted typing through a pending root move and its rejection', () => {
    const source = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: {
        children: initialValue,
        roots: { note: [paragraph('Note')] },
      },
    });
    const view = createEditorView(source, { authored: proposal });
    view.update((tx) => {
      tx.changes.apply(
        DocumentChange.between(tx.value(), {
          children: [initialValue[1], initialValue[2]],
          roots: { note: [paragraph('Note'), initialValue[0]] },
        })
      );
    });
    source.update.text.insert('X', { at: { path: [0, 0], offset: 2 } });
    assert.deepEqual(view.read.root('note'), [
      paragraph('Note'),
      paragraph('AlXpha'),
    ]);
    source.update.authored.decide({
      action: 'reject',
      selection: source.read.authored.select({ status: 'pending' }),
    });
    assert.deepEqual(view.read.children(), [
      paragraph('AlXpha'),
      initialValue[1],
      initialValue[2],
    ]);
    assert.deepEqual(view.read.root('note'), [paragraph('Note')]);
    const reopened = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: JSON.parse(JSON.stringify(source.read.value())),
    });
    assert.deepEqual(reopened.read.children(), source.read.children());
  });

  it('refuses to reject a placement superseded by an accepted move', () => {
    let authorId = 'alice';
    const source = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue,
    });
    const view = createEditorView(source, { authored: proposal });
    view.update.nodes.move({ at: [0], to: [2] });
    const selection = source.read.authored.select({ status: 'pending' });
    authorId = 'bob';
    source.update.nodes.move({ at: [0], to: [1] });
    const before = view.read.children();
    const result = source.update.authored.decide({
      action: 'reject',
      selection,
    });
    assert.equal(result.status, 'blocked');
    assert.deepEqual(view.read.children(), before);
    assert.deepEqual(source.read.children(), [
      initialValue[1],
      initialValue[0],
      initialValue[2],
    ]);
  });

  for (const action of ['accept', 'reject'] as const) {
    it(`retains a range across a root move, reload and ${action}`, () => {
      const source = createEditor({
        extensions: [history(), authored({ authorId: 'alice' })],
        initialValue: {
          children: initialValue,
          roots: { note: [paragraph('Note')] },
        },
      });
      const view = createEditorView(source, { authored: proposal });
      const anchor = view.anchor(range(0), { deletion: 'drop' });
      view.update.selection.set(range(0));
      view.update((tx) => {
        const before = tx.value();
        tx.changes.apply(
          DocumentChange.between(before, {
            children: [initialValue[1], initialValue[2]],
            roots: { note: [paragraph('Note'), initialValue[0]] },
          })
        );
      });
      const movedRange = {
        anchor: { path: [1, 0], offset: 1, root: 'note' },
        focus: { path: [1, 0], offset: 3, root: 'note' },
      };
      assert.deepEqual(anchor.resolve(), movedRange);
      assert.equal(view.read.selection(), null);
      const bornAfterMove = view.anchor(movedRange, { deletion: 'drop' });
      const reopened = createEditor({
        extensions: [authored({ authorId: 'alice' })],
        initialValue: JSON.parse(JSON.stringify(source.read.value())),
      });
      const reopenedView = createEditorView(reopened, { authored: proposal });
      const restored = reopenedView.anchor.restore(view.anchor.save(anchor));
      const restoredAfterMove = reopenedView.anchor.restore(
        view.anchor.save(bornAfterMove)
      );
      assert.deepEqual(restored.resolve(), movedRange);
      assert.deepEqual(restoredAfterMove.resolve(), movedRange);
      assert.equal(
        reopened.update.authored.decide({
          action,
          selection: reopened.read.authored.select({ status: 'pending' }),
        }).status,
        'applied'
      );
      assert.deepEqual(
        restored.resolve(),
        action === 'accept' ? movedRange : range(0)
      );
      assert.deepEqual(restoredAfterMove.resolve(), restored.resolve());
      view.update.history.undo();
      assert.deepEqual(anchor.resolve(), range(0));
      assert.deepEqual(view.read.selection(), range(0));
      view.update.history.redo();
      assert.deepEqual(anchor.resolve(), movedRange);
      assert.equal(view.read.selection(), null);
      const destination = createEditorView(source, {
        authored: proposal,
        root: 'note',
      });
      destination.update.selection.set(movedRange);
      destination.update.text.insert('Q');
      assert.deepEqual(view.read.root('note'), [
        paragraph('Note'),
        paragraph('AQha'),
      ]);
      anchor.release();
      bornAfterMove.release();
      restored.release();
      restoredAfterMove.release();
    });
  }

  for (const action of ['accept', 'reject'] as const) {
    for (const typingFirst of [false, true]) {
      it(`${action}s a compound move with typing ${typingFirst ? 'before' : 'after'} it through reload`, () => {
        const source = createEditor({
          extensions: [authored({ authorId: 'alice' })],
          initialValue,
        });
        const view = createEditorView(source, { authored: proposal });
        const anchor = view.anchor(range(0), { deletion: 'drop' });
        const saved = view.anchor.save(anchor);
        view.update((tx) => {
          if (typingFirst) {
            tx.text.insert('X', { at: { path: [0, 0], offset: 2 } });
          }
          tx.nodes.move({ at: [0], to: [2] });
          if (!typingFirst) {
            tx.text.insert('X', { at: { path: [2, 0], offset: 2 } });
          }
        });
        const reopened = createEditor({
          extensions: [authored({ authorId: 'alice' })],
          initialValue: JSON.parse(JSON.stringify(source.read.value())),
        });
        const reopenedView = createEditorView(reopened, { authored: proposal });
        const restored = reopenedView.anchor.restore(saved);
        assert.equal(
          reopened.update.authored.decide({
            action,
            selection: reopened.read.authored.select({ status: 'pending' }),
          }).status,
          'applied'
        );
        assert.deepEqual(
          reopenedView.read.children(),
          action === 'accept'
            ? [initialValue[1], initialValue[2], paragraph('AlXpha')]
            : initialValue
        );
        assert.deepEqual(
          restored.resolve(),
          action === 'accept'
            ? {
                anchor: { path: [2, 0], offset: 1 },
                focus: { path: [2, 0], offset: 4 },
              }
            : range(0)
        );
        const final = createEditor({
          extensions: [authored({ authorId: 'alice' })],
          initialValue: JSON.parse(JSON.stringify(reopened.read.value())),
        });
        assert.deepEqual(final.read.children(), reopened.read.children());
        anchor.release();
        restored.release();
      });
    }
  }

  for (const typingFirst of [false, true]) {
    it(`retains identity through a compound move with typing ${typingFirst ? 'before' : 'after'} it`, () => {
      const source = createEditor({
        extensions: [history(), authored({ authorId: 'alice' })],
        initialValue,
      });
      const view = createEditorView(source, { authored: proposal });
      const anchor = view.anchor(range(0), { deletion: 'drop' });
      const node = view.anchor([0], { deletion: 'drop' });
      view.update((tx) => {
        if (typingFirst) {
          tx.text.insert('X', { at: { path: [0, 0], offset: 2 } });
        }
        tx.nodes.move({ at: [0], to: [2] });
        if (!typingFirst) {
          tx.text.insert('X', { at: { path: [2, 0], offset: 2 } });
        }
      });
      assert.deepEqual(anchor.resolve(), {
        anchor: { path: [2, 0], offset: 1 },
        focus: { path: [2, 0], offset: 4 },
      });
      assert.deepEqual(node.resolve(), [2]);
      assert.equal(view.read.authored.changes().items[0].revision, 1);
      const reloaded = createEditor({
        extensions: [authored({ authorId: 'alice' })],
        initialValue: JSON.parse(JSON.stringify(source.read.value())),
      });
      const reopened = createEditorView(reloaded, { authored: proposal });
      const restored = reopened.anchor.restore(view.anchor.save(anchor));
      assert.deepEqual(restored.resolve(), anchor.resolve());
      view.update.history.undo();
      assert.deepEqual(view.read.children(), initialValue);
      assert.deepEqual(anchor.resolve(), range(0));
      view.update.history.redo();
      assert.deepEqual(view.read.children(), [
        initialValue[1],
        initialValue[2],
        paragraph('AlXpha'),
      ]);
      assert.deepEqual(anchor.resolve(), restored.resolve());
      anchor.release();
      node.release();
      restored.release();
    });
  }

  it('preserves an independent accepted edit when rejecting a pending move', () => {
    const source = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue,
    });
    const view = createEditorView(source, { authored: proposal });
    const anchor = view.anchor(range(0), { deletion: 'drop' });
    view.update.nodes.move({ at: [0], to: [2] });
    source.update.text.insert('X', { at: { path: [0, 0], offset: 2 } });
    assert.deepEqual(view.read.children(), [
      initialValue[1],
      initialValue[2],
      paragraph('AlXpha'),
    ]);
    assert.equal(
      source.update.authored.decide({
        action: 'reject',
        selection: source.read.authored.select({ status: 'pending' }),
      }).status,
      'applied'
    );
    assert.deepEqual(view.read.children(), [
      paragraph('AlXpha'),
      initialValue[1],
      initialValue[2],
    ]);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    anchor.release();
  });

  it('moves a pending edit with its accepted containing block', () => {
    const source = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue,
    });
    const view = createEditorView(source, { authored: proposal });
    view.update.text.insert('X', { at: { path: [0, 0], offset: 2 } });
    const anchor = view.anchor(
      {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 3 },
      },
      { deletion: 'drop' }
    );
    source.update.nodes.move({ at: [0], to: [2] });
    assert.deepEqual(source.read.children(), [
      initialValue[1],
      initialValue[2],
      initialValue[0],
    ]);
    assert.deepEqual(view.read.children(), [
      initialValue[1],
      initialValue[2],
      paragraph('AlXpha'),
    ]);
    assert.deepEqual(anchor.resolve(), {
      anchor: { path: [2, 0], offset: 2 },
      focus: { path: [2, 0], offset: 3 },
    });
    source.update.authored.decide({
      action: 'accept',
      selection: source.read.authored.select({ status: 'pending' }),
    });
    assert.deepEqual(source.read.children(), view.read.children());
    anchor.release();
  });

  for (const [from, to] of [
    [0, 2],
    [2, 0],
  ]) {
    it(`retains range identity when moving block ${from} to ${to} and undoing`, () => {
      const source = createEditor({
        extensions: [history(), authored({ authorId: 'alice' })],
        initialValue,
      });
      const view = createEditorView(source, { authored: proposal });
      const anchor = view.anchor(range(from), { deletion: 'drop' });
      const accepted = source.anchor(range(from), { deletion: 'drop' });
      view.update.nodes.move({ at: [from], to: [to] });
      assert.deepEqual(anchor.resolve(), range(to));
      assert.deepEqual(accepted.resolve(), range(from));
      view.update.history.undo();
      assert.deepEqual(anchor.resolve(), range(from));
      view.update.history.redo();
      assert.deepEqual(anchor.resolve(), range(to));
      anchor.release();
      accepted.release();
    });
  }

  for (const action of ['accept', 'reject'] as const) {
    it(`preserves moved range identity through reload and ${action}`, () => {
      const source = createEditor({
        extensions: [authored({ authorId: 'alice' })],
        initialValue,
      });
      const view = createEditorView(source, { authored: proposal });
      const anchor = view.anchor(range(0), { deletion: 'drop' });
      view.update.nodes.move({ at: [0], to: [2] });
      const saved = JSON.parse(JSON.stringify(view.anchor.save(anchor)));
      const reloaded = createEditor({
        extensions: [authored({ authorId: 'alice' })],
        initialValue: JSON.parse(JSON.stringify(source.read.value())),
      });
      const reopened = createEditorView(reloaded, { authored: proposal });
      const restored = reopened.anchor.restore(saved);
      assert.deepEqual(restored.resolve(), range(2));
      assert.equal(
        reloaded.update.authored.decide({
          action,
          selection: reloaded.read.authored.select({ status: 'pending' }),
        }).status,
        'applied'
      );
      assert.deepEqual(restored.resolve(), range(action === 'accept' ? 2 : 0));
      assert.deepEqual(
        reloaded.read.children(),
        action === 'accept'
          ? [initialValue[1], initialValue[2], initialValue[0]]
          : initialValue
      );
      anchor.release();
      restored.release();
    });
  }

  it('records the pending placement as a dependency of another authors edit', () => {
    let authorId = 'alice';
    const source = createEditor({
      extensions: [authored({ authorId: () => authorId })],
      initialValue,
    });
    const view = createEditorView(source, { authored: proposal });
    view.update.nodes.move({ at: [0], to: [2] });
    const move = source.read.authored.changes().items[0];
    authorId = 'bob';
    view.update.text.insert('X', { at: { path: [2, 0], offset: 2 } });
    const edit = source.read.authored.changes({ authorId: 'bob' }).items[0];
    assert.deepEqual(edit.dependencies, [move.id]);
    assert.equal(
      source.update.authored.decide({
        action: 'reject',
        selection: source.read.authored.select({ ids: [move.id] }),
      }).status,
      'blocked'
    );
  });
});
