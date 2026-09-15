import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  NodeApi,
  SelectionApi,
  type InitialValue,
} from 'plitejs';
import { authored, type AuthoredChangePart } from 'plitejs/authored';
import { history } from 'plitejs/history';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number, block = 0) => ({
  path: [block, 0],
  offset,
});
const range = (from: number, to: number) => ({
  anchor: point(from),
  focus: point(to),
});
const markup = { intent: 'propose', projection: 'markup' } as const;
const setup = (initialValue: InitialValue = [paragraph('ABC')]) => {
  let authorId = 'alice';
  const plugin = authored({ authorId: () => authorId, retainHistory: true });
  const source = createEditor({
    plugins: [history(), plugin],
    initialValue,
  });
  const view = createEditorView(source, { authored: markup });

  return {
    plugin,
    source,
    view,
    setAuthor: (next: string) => {
      authorId = next;
    },
  };
};
const reviewParts = (view: ReturnType<typeof setup>['view']) =>
  view.read.authored.changes().items.flatMap(({ id, status }) => {
    if (status !== 'pending' && status !== 'conflicted') return [];
    const details = view.read.authored.details(id);
    if (details?.parts.status !== 'available') {
      throw new Error('Pending self-edit details must remain available.');
    }

    return details.parts.items;
  });
const contentText = (parts: readonly AuthoredChangePart[]) => {
  const content = parts.filter((part) => part.kind === 'content');
  return {
    before: content
      .flatMap((part) => part.before?.content.content ?? [])
      .map((node) => NodeApi.string(node))
      .join(''),
    after: content
      .flatMap((part) => part.after?.content.content ?? [])
      .map((node) => NodeApi.string(node))
      .join(''),
  };
};

describe('authored self-edit review semantics', () => {
  for (const affinity of ['backward', 'forward'] as const) {
    it(`restores deleted text from a ${affinity} caret`, () => {
      const { view } = setup();
      view.update.text.delete({ at: range(1, 2) });
      view.update.selection.set(SelectionApi.text(range(1, 1), { affinity }));
      view.update.text.insert('B');

      assert.deepEqual(view.read.children(), [paragraph('ABC')]);
      assert.deepEqual(reviewParts(view), []);
      assert.deepEqual(view.read.authored.changesAt(range(0, 3)), []);
    });
  }

  for (const action of ['accept', 'reject'] as const) {
    it(`${action}s only accepted text and a paragraph boundary removed across two own insertions`, () => {
      const initialValue = [paragraph('AB'), paragraph('CD')];
      const { source, view } = setup(initialValue);
      view.update((tx) => {
        tx.authored.propose();
        tx.text.insert('p', { at: point(1) });
      });
      view.update((tx) => {
        tx.authored.propose();
        tx.text.insert('q', { at: point(1, 1) });
      });
      view.update.text.delete({
        at: { anchor: point(1), focus: point(2, 1) },
      });

      assert.deepEqual(view.read.children(), [paragraph('AD')]);
      const parts = reviewParts(view);
      assert.deepEqual(contentText(parts), { before: 'BC', after: '' });
      assert.deepEqual(
        parts.filter((part) => part.kind === 'boundary'),
        [{ action: 'join', at: point(1), kind: 'boundary', root: 'main' }]
      );
      const changes = view.read.authored.changesAt(range(0, 2));
      assert.equal(changes.length, 1);
      assert.equal(
        source.update.authored.decide({
          action,
          selection: source.read.authored.select({ ids: [changes[0].id] }),
        }).status,
        'applied'
      );
      const expected = action === 'accept' ? [paragraph('AD')] : initialValue;
      assert.deepEqual(source.read.children(), expected);
      assert.deepEqual(view.read.children(), expected);
      assert.deepEqual(reviewParts(view), []);
    });
  }

  it('clears two separately inserted paragraphs removed by one node command transaction', () => {
    const initialValue = [paragraph('A'), paragraph('B')];
    const { source, view } = setup(initialValue);
    view.update((tx) => {
      tx.authored.propose();
      tx.nodes.insert(paragraph('P'), { at: [1] });
    });
    view.update((tx) => {
      tx.authored.propose();
      tx.nodes.insert(paragraph('Q'), { at: [2] });
    });
    view.update((tx) => {
      tx.nodes.remove({ at: [2] });
      tx.nodes.remove({ at: [1] });
    });

    assert.deepEqual(view.read.children(), initialValue);
    assert.deepEqual(reviewParts(view), []);
    assert.deepEqual(
      view.read.authored.changesAt({ anchor: point(0), focus: point(1, 1) }),
      []
    );
    assert.equal(
      source.update.authored.decide({
        action: 'accept',
        selection: source.read.authored.select({ status: 'pending' }),
      }).status,
      'applied'
    );
    assert.deepEqual(source.read.children(), initialValue);
    assert.deepEqual(view.read.children(), initialValue);
  });

  for (const action of ['accept', 'reject'] as const) {
    it(`${action}s only the original paragraph join when a selection removes two inserted blocks`, () => {
      const initialValue = [paragraph('A'), paragraph('B')];
      const { source, view } = setup(initialValue);
      view.update((tx) => {
        tx.authored.propose();
        tx.nodes.insert(paragraph('P'), { at: [1] });
      });
      view.update((tx) => {
        tx.authored.propose();
        tx.nodes.insert(paragraph('Q'), { at: [2] });
      });
      view.update.text.delete({
        at: { anchor: point(1), focus: point(0, 3) },
      });

      assert.deepEqual(view.read.children(), [paragraph('AB')]);
      assert.deepEqual(reviewParts(view), [
        { action: 'join', at: point(1), kind: 'boundary', root: 'main' },
      ]);
      const changes = view.read.authored.changesAt(range(0, 2));
      assert.equal(changes.length, 1);
      assert.equal(
        source.update.authored.decide({
          action,
          selection: source.read.authored.select({ ids: [changes[0].id] }),
        }).status,
        'applied'
      );
      const expected = action === 'accept' ? [paragraph('AB')] : initialValue;
      assert.deepEqual(source.read.children(), expected);
      assert.deepEqual(view.read.children(), expected);
      assert.deepEqual(reviewParts(view), []);
    });
  }

  it('cancels separate own insertions across paragraphs inside a blockquote', () => {
    const initialValue = [
      { type: 'blockquote', children: [paragraph('AB'), paragraph('CD')] },
    ];
    const { source, view } = setup(initialValue);
    view.update((tx) => {
      tx.authored.propose();
      tx.text.insert('p', { at: { path: [0, 0, 0], offset: 1 } });
    });
    view.update((tx) => {
      tx.authored.propose();
      tx.text.insert('q', { at: { path: [0, 1, 0], offset: 1 } });
    });
    view.update.text.delete({
      at: {
        anchor: { path: [0, 0, 0], offset: 1 },
        focus: { path: [0, 1, 0], offset: 2 },
      },
    });

    assert.deepEqual(view.read.children(), [
      { type: 'blockquote', children: [paragraph('AD')] },
    ]);
    const parts = reviewParts(view);
    assert.deepEqual(contentText(parts), { before: 'BC', after: '' });
    assert.deepEqual(
      parts.filter((part) => part.kind === 'boundary'),
      [
        {
          action: 'join',
          at: { path: [0, 0, 0], offset: 1 },
          kind: 'boundary',
          root: 'main',
        },
      ]
    );
    const changes = view.read.authored.changesAt({
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 2 },
    });
    assert.equal(changes.length, 1);
    assert.equal(
      source.update.authored.decide({
        action: 'reject',
        selection: source.read.authored.select({ ids: [changes[0].id] }),
      }).status,
      'applied'
    );
    assert.deepEqual(source.read.children(), initialValue);
    assert.deepEqual(view.read.children(), initialValue);
    assert.deepEqual(reviewParts(view), []);
  });

  it('cancels an inserted break and own text while retaining accepted text removed across them', () => {
    const { source, view } = setup([paragraph('ABCD')]);
    view.update.selection.set(point(2));
    view.update.break.insert();
    view.update((tx) => {
      tx.authored.propose();
      tx.text.insert('p', { at: point(1) });
    });
    view.update.text.delete({
      at: { anchor: point(1), focus: point(1, 1) },
    });

    assert.deepEqual(view.read.children(), [paragraph('AD')]);
    const parts = reviewParts(view);
    assert.deepEqual(contentText(parts), { before: 'BC', after: '' });
    assert.deepEqual(
      parts.filter((part) => part.kind === 'boundary'),
      []
    );
    const changes = view.read.authored.changesAt(range(0, 2));
    assert.equal(changes.length, 1);
    assert.equal(
      source.update.authored.decide({
        action: 'reject',
        selection: source.read.authored.select({ ids: [changes[0].id] }),
      }).status,
      'applied'
    );
    assert.deepEqual(source.read.children(), [paragraph('ABCD')]);
    assert.deepEqual(view.read.children(), [paragraph('ABCD')]);
    assert.deepEqual(reviewParts(view), []);
  });

  it('clears moving an own proposed block back to its original position', () => {
    const initialValue = [paragraph('A'), paragraph('B'), paragraph('C')];
    const { view } = setup(initialValue);
    view.update.nodes.move({ at: [0], to: [2] });
    view.update.nodes.move({ at: [2], to: [0] });
    assert.deepEqual(view.read.children(), initialValue);
    assert.deepEqual(reviewParts(view), []);
    assert.deepEqual(
      view.read.authored.changesAt({ anchor: point(0), focus: point(1, 2) }),
      []
    );
  });

  for (const first of ['insert', 'delete'] as const) {
    it(`clears whole block ${first} followed by its inverse`, () => {
      const initialValue = [paragraph('A'), paragraph('B'), paragraph('C')];
      const { view } = setup(initialValue);
      if (first === 'insert') {
        view.update.nodes.insert(paragraph('P'), { at: [1] });
        view.update.nodes.remove({ at: [1] });
      } else {
        view.update.nodes.remove({ at: [1] });
        view.update.nodes.insert(paragraph('B'), { at: [1] });
      }
      assert.deepEqual(view.read.children(), initialValue);
      assert.deepEqual(reviewParts(view), []);
    });
  }
  for (const command of ['backward', 'forward', 'selection'] as const) {
    it(`clears an own insertion deleted by ${command}, including after reload`, () => {
      const { source, view, plugin } = setup();
      view.update.text.insert('p', { at: point(1) });
      if (command === 'backward') {
        view.update.selection.set(point(2));
        view.update.text.deleteBackward();
      } else if (command === 'forward') {
        view.update.selection.set(point(1));
        view.update.text.deleteForward();
      } else view.update.text.delete({ at: range(1, 2) });

      assert.deepEqual(view.read.children(), [paragraph('ABC')]);
      assert.deepEqual(reviewParts(view), []);
      assert.deepEqual(view.read.authored.changesAt(range(0, 3)), []);
      const restored = createEditor({
        plugins: [plugin],
        initialValue: JSON.parse(JSON.stringify(source.read.value())),
      });
      const reopened = createEditorView(restored, { authored: markup });
      assert.deepEqual(reopened.read.children(), [paragraph('ABC')]);
      assert.deepEqual(reviewParts(reopened), []);
      assert.deepEqual(reopened.read.authored.changesAt(range(0, 3)), []);
    });
  }

  it('shows only the surviving text after partially deleting an own insertion', () => {
    const { source, view } = setup();
    view.update.text.insert('xyz', { at: point(1) });
    const { id } = source.read.authored.changes().items[0];
    view.update.text.delete({ at: range(2, 3) });

    assert.deepEqual(view.read.children(), [paragraph('AxzBC')]);
    assert.deepEqual(contentText(reviewParts(view)), {
      before: '',
      after: 'xz',
    });
    assert.deepEqual(
      view.read.authored.changesAt(range(0, 5)).map((change) => change.id),
      [id]
    );
  });

  it('amends an own insertion when replacing its selected text', () => {
    const { source, view } = setup();
    view.update.text.insert('xyz', { at: point(1) });
    const { id } = source.read.authored.changes().items[0];
    view.update.text.insert('q', { at: range(1, 4) });

    assert.deepEqual(view.read.children(), [paragraph('AqBC')]);
    assert.deepEqual(contentText(reviewParts(view)), {
      before: '',
      after: 'q',
    });
    assert.deepEqual(
      view.read.authored.changesAt(range(0, 4)).map((change) => change.id),
      [id]
    );
  });

  for (const replacement of ['B', 'D']) {
    it(`amends an own deletion when retyping ${replacement === 'B' ? 'the original text' : 'different text'}`, () => {
      const { source, view } = setup();
      view.update.text.delete({ at: range(1, 2) });
      const { id } = source.read.authored.changes().items[0];
      view.update.text.insert(replacement, { at: point(1) });

      assert.deepEqual(view.read.children(), [paragraph(`A${replacement}C`)]);
      assert.equal(source.read.authored.changes().items.length, 1);
      if (replacement === 'B') {
        assert.deepEqual(reviewParts(view), []);
        assert.deepEqual(view.read.authored.changesAt(range(0, 3)), []);
      } else {
        assert.deepEqual(contentText(reviewParts(view)), {
          before: 'B',
          after: 'D',
        });
        assert.deepEqual(
          view.read.authored.changesAt(range(0, 3)).map((change) => change.id),
          [id]
        );
      }
    });
  }

  for (const { expectedAfter, expectedBefore, label, replacement } of [
    {
      expectedAfter: '',
      expectedBefore: ' text',
      label: 'matching prefix',
      replacement: 'mark',
    },
    {
      expectedAfter: '',
      expectedBefore: 'mark ',
      label: 'matching suffix',
      replacement: 'text',
    },
    {
      expectedAfter: '',
      expectedBefore: '',
      label: 'full original text',
      replacement: 'mark text',
    },
    {
      expectedAfter: 'mars',
      expectedBefore: 'mark text',
      label: 'different text',
      replacement: 'mars',
    },
  ]) {
    it(`minimizes an own deletion after retyping ${label}`, () => {
      const { source, view } = setup([paragraph('to mark text end')]);
      view.update.text.delete({ at: range(3, 12) });
      const { id } = source.read.authored.changes().items[0];
      view.update.text.insert(replacement, { at: point(3) });

      assert.deepEqual(view.read.children(), [
        paragraph(`to ${replacement} end`),
      ]);
      assert.equal(source.read.authored.changes().items.length, 1);
      assert.deepEqual(contentText(reviewParts(view)), {
        before: expectedBefore,
        after: expectedAfter,
      });
      assert.equal(source.read.authored.change(id)?.revision, 2);
    });
  }

  it('clears a replacement when the author restores the original selection', () => {
    const { view } = setup();
    view.update.text.insert('D', { at: range(1, 2) });
    view.update.text.insert('B', { at: range(1, 2) });

    assert.deepEqual(view.read.children(), [paragraph('ABC')]);
    assert.deepEqual(reviewParts(view), []);
    assert.deepEqual(view.read.authored.changesAt(range(0, 3)), []);
  });

  for (const first of ['split', 'join'] as const) {
    it(`clears an own paragraph ${first} followed by its inverse`, () => {
      const initialValue =
        first === 'split'
          ? [paragraph('AB')]
          : [paragraph('A'), paragraph('B')];
      const { view } = setup(initialValue);
      view.update.selection.set(
        point(first === 'split' ? 1 : 0, first === 'split' ? 0 : 1)
      );
      if (first === 'split') {
        view.update.break.insert();
        view.update.text.deleteBackward();
      } else {
        view.update.text.deleteBackward();
        view.update.break.insert();
      }

      assert.deepEqual(view.read.children(), initialValue);
      assert.deepEqual(reviewParts(view), []);
      assert.deepEqual(
        view.read.authored.changesAt({
          anchor: point(0),
          focus: point(first === 'split' ? 2 : 1, first === 'split' ? 0 : 1),
        }),
        []
      );
    });
  }

  it('keeps a canceled paragraph join hidden when another author later joins those blocks', () => {
    const { source, view, setAuthor } = setup([paragraph('A'), paragraph('B')]);
    view.update.selection.set(point(0, 1));
    view.update.text.deleteBackward();
    const original = source.read.authored.changes().items[0].id;
    view.update.break.insert();
    assert.deepEqual(reviewParts(view), []);
    setAuthor('bob');
    view.update.text.deleteBackward();
    assert.deepEqual(view.read.children(), [paragraph('AB')]);
    assert.deepEqual(view.read.authored.details(original)?.parts, {
      status: 'available',
      items: [],
    });
    assert.deepEqual(reviewParts(view), [
      { kind: 'boundary', action: 'join', root: 'main', at: point(1) },
    ]);
  });

  it('clears an own boolean mark toggle reversed on the same selection', () => {
    const { view } = setup();
    view.update.selection.set(range(0, 3));
    view.update.marks.add('bold', true);
    view.update.marks.remove('bold');

    assert.deepEqual(view.read.children(), [paragraph('ABC')]);
    assert.deepEqual(reviewParts(view), []);
    assert.deepEqual(view.read.authored.changesAt(range(0, 3)), []);
  });

  it('keeps only the original and final value when amending a valued mark', () => {
    const { source, view } = setup([
      { type: 'paragraph', children: [{ text: 'ABC', color: 'red' }] },
    ]);
    view.update.selection.set(range(0, 3));
    view.update.marks.add('color', 'blue');
    const { id } = source.read.authored.changes().items[0];
    view.update.marks.add('color', 'green');

    assert.equal(source.read.authored.changes().items.length, 1);
    assert.deepEqual(reviewParts(view), [
      {
        after: { color: 'green' },
        before: { color: 'red' },
        kind: 'properties',
        nodeKind: 'text',
        path: [0, 0],
        root: 'main',
      },
    ]);
    assert.deepEqual(
      view.read.authored.changesAt(range(0, 3)).map((change) => change.id),
      [id]
    );
    view.update.marks.add('color', 'red');
    assert.deepEqual(reviewParts(view), []);
    assert.deepEqual(view.read.authored.changesAt(range(0, 3)), []);
  });

  it('retains only the accepted content removed by a selection spanning an own insertion', () => {
    const { view } = setup();
    view.update.text.insert('p', { at: point(1) });
    view.update.text.delete({ at: range(0, 2) });

    assert.deepEqual(view.read.children(), [paragraph('BC')]);
    assert.deepEqual(contentText(reviewParts(view)), {
      before: 'A',
      after: '',
    });
    assert.equal(view.read.authored.changesAt(range(0, 2)).length, 1);
  });

  it('preserves a separate deletion when another author removes the insertion', () => {
    const { source, view, setAuthor } = setup();
    view.update.text.insert('p', { at: point(1) });
    const parent = source.read.authored.changes().items[0];
    setAuthor('bob');
    view.update.text.delete({ at: range(1, 2) });
    const child = source.read.authored.changes({ authorId: 'bob' }).items[0];

    assert.notEqual(child.id, parent.id);
    assert.equal(source.read.authored.change(parent.id)?.revision, 1);
    assert.ok(child.dependencies.includes(parent.id));
    const details = view.read.authored.details(child.id);
    assert.equal(details?.parts.status, 'available');
    if (details?.parts.status !== 'available') assert.fail();
    assert.deepEqual(contentText(details.parts.items), {
      before: 'p',
      after: '',
    });
    assert.equal(
      source.update.authored.decide({
        action: 'reject',
        selection: source.read.authored.select({ ids: [child.id] }),
      }).status,
      'applied'
    );
    assert.deepEqual(view.read.children(), [paragraph('ApBC')]);
  });

  it('preserves explicit separate proposal identities even when their text cancels', () => {
    const { source, view } = setup();
    let insertion = '';
    let deletion = '';
    view.update((tx) => {
      insertion = tx.authored.propose();
      tx.text.insert('p', { at: point(1) });
    });
    view.update((tx) => {
      deletion = tx.authored.propose();
      tx.text.delete({ at: range(1, 2) });
    });

    assert.notEqual(deletion, insertion);
    assert.equal(source.read.authored.change(insertion)?.revision, 1);
    assert.equal(source.read.authored.change(deletion)?.revision, 1);
    assert.equal(
      source.update.authored.decide({
        action: 'reject',
        selection: source.read.authored.select({ ids: [deletion] }),
      }).status,
      'applied'
    );
    assert.deepEqual(view.read.children(), [paragraph('ApBC')]);
  });

  it('reopens and clears a canceled insertion through undo and redo', () => {
    const { source, view } = setup();
    view.update.text.insert('p', { at: point(1) });
    const { id } = source.read.authored.changes().items[0];
    view.update((tx) => {
      tx.history.newBatch();
      tx.text.delete({ at: range(1, 2) });
    });
    assert.deepEqual(reviewParts(view), []);

    view.update.history.undo();
    assert.deepEqual(view.read.children(), [paragraph('ApBC')]);
    assert.deepEqual(contentText(reviewParts(view)), {
      before: '',
      after: 'p',
    });
    assert.deepEqual(
      view.read.authored.changesAt(range(0, 4)).map((change) => change.id),
      [id]
    );
    view.update.history.redo();
    assert.deepEqual(view.read.children(), [paragraph('ABC')]);
    assert.deepEqual(reviewParts(view), []);
    assert.deepEqual(view.read.authored.changesAt(range(0, 3)), []);
  });

  it('restores an own deletion a character at a time across reload', () => {
    const { source, view, plugin } = setup([paragraph('ABCD')]);
    view.update.text.delete({ at: range(1, 3) });
    const { id } = source.read.authored.changes().items[0];
    view.update.text.insert('B', { at: point(1) });

    assert.deepEqual(view.read.children(), [paragraph('ABD')]);
    assert.deepEqual(contentText(reviewParts(view)), {
      before: 'C',
      after: '',
    });
    assert.deepEqual(
      view.read.authored.changesAt(range(0, 3)).map((change) => change.id),
      [id]
    );
    const restored = createEditor({
      plugins: [plugin],
      initialValue: JSON.parse(JSON.stringify(source.read.value())),
    });
    const reopened = createEditorView(restored, { authored: markup });
    assert.deepEqual(contentText(reviewParts(reopened)), {
      before: 'C',
      after: '',
    });
    reopened.update.text.insert('C', { at: point(2) });

    assert.deepEqual(reopened.read.children(), [paragraph('ABCD')]);
    assert.deepEqual(reviewParts(reopened), []);
    assert.deepEqual(reopened.read.authored.changesAt(range(0, 4)), []);
    assert.ok(restored.read.authored.change(id));
  });

  it('amends and clears a block property independently of text formatting', () => {
    const initialValue = [{ ...paragraph('ABC'), align: 'left' }];
    const { source, view } = setup(initialValue);
    view.update.nodes.set({ align: 'center' }, { at: [0] });
    const { id } = source.read.authored.changes().items[0];
    view.update.nodes.set({ align: 'right' }, { at: [0] });

    assert.deepEqual(reviewParts(view), [
      {
        after: { align: 'right' },
        before: { align: 'left' },
        kind: 'properties',
        nodeKind: 'element',
        path: [0],
        root: 'main',
      },
    ]);
    assert.deepEqual(
      view.read.authored.changesAt(range(0, 3)).map((change) => change.id),
      [id]
    );
    view.update.nodes.set({ align: 'left' }, { at: [0] });

    assert.deepEqual(view.read.children(), initialValue);
    assert.deepEqual(reviewParts(view), []);
    assert.deepEqual(view.read.authored.changesAt(range(0, 3)), []);
  });

  it('clears formatting applied to an own insertion when that insertion is removed', () => {
    const { view } = setup();
    view.update.text.insert('p', { at: point(1) });
    view.update.selection.set(range(1, 2));
    view.update.marks.add('bold', true);
    view.update.text.delete();

    assert.deepEqual(view.read.children(), [paragraph('ABC')]);
    assert.deepEqual(reviewParts(view), []);
    assert.deepEqual(view.read.authored.changesAt(range(0, 3)), []);
  });

  it('shrinks a proposed mark when part of its selection is restored', () => {
    const { view } = setup([paragraph('ABCD')]);
    view.update.selection.set(range(1, 3));
    view.update.marks.add('bold', true);
    view.update.selection.set({
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 1 },
    });
    view.update.marks.remove('bold');

    assert.deepEqual(view.read.children(), [
      {
        type: 'paragraph',
        children: [{ text: 'AB' }, { text: 'C', bold: true }, { text: 'D' }],
      },
    ]);
    assert.deepEqual(reviewParts(view), [
      {
        after: { bold: true },
        before: {},
        kind: 'properties',
        nodeKind: 'text',
        path: [0, 1],
        root: 'main',
      },
    ]);
    view.update.selection.set({
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 1 },
    });
    view.update.marks.remove('bold');

    assert.deepEqual(view.read.children(), [paragraph('ABCD')]);
    assert.deepEqual(reviewParts(view), []);
    assert.deepEqual(view.read.authored.changesAt(range(0, 4)), []);
  });

  it('cancels two own insertions while retaining the accepted text deleted between them', () => {
    const { source, view } = setup();
    let first = '';
    let second = '';
    view.update((tx) => {
      first = tx.authored.propose();
      tx.text.insert('p', { at: point(1) });
    });
    view.update((tx) => {
      second = tx.authored.propose();
      tx.text.insert('q', { at: point(3) });
    });
    view.update.text.delete({ at: range(1, 4) });

    assert.notEqual(first, second);
    assert.ok(source.read.authored.change(first));
    assert.ok(source.read.authored.change(second));
    assert.deepEqual(view.read.children(), [paragraph('AC')]);
    assert.deepEqual(contentText(reviewParts(view)), {
      before: 'B',
      after: '',
    });
    assert.equal(view.read.authored.changesAt(range(0, 2)).length, 1);
  });

  for (const replacement of ['', 'Z']) {
    it(`preserves multi-proposal ${replacement ? 'replacement' : 'deletion'} through history and reload`, () => {
      const { source, view, plugin } = setup();
      view.update((tx) => {
        tx.authored.propose();
        tx.text.insert('p', { at: point(1) });
      });
      view.update((tx) => {
        tx.authored.propose();
        tx.text.insert('q', { at: point(3) });
      });
      view.update((tx) => {
        tx.history.newBatch();
        if (replacement) tx.text.insert(replacement, { at: range(1, 4) });
        else tx.text.delete({ at: range(1, 4) });
      });
      assert.deepEqual(contentText(reviewParts(view)), {
        before: 'B',
        after: replacement,
      });
      view.update.history.undo();
      assert.deepEqual(view.read.children(), [paragraph('ApBqC')]);
      assert.deepEqual(
        reviewParts(view)
          .map((part) => contentText([part]))
          .sort((left, right) => left.after.localeCompare(right.after)),
        [
          { before: '', after: 'p' },
          { before: '', after: 'q' },
        ]
      );
      view.update.history.redo();
      assert.deepEqual(contentText(reviewParts(view)), {
        before: 'B',
        after: replacement,
      });
      const restored = createEditor({
        plugins: [plugin],
        initialValue: JSON.parse(JSON.stringify(source.read.value())),
      });
      const reopened = createEditorView(restored, { authored: markup });
      assert.deepEqual(contentText(reviewParts(reopened)), {
        before: 'B',
        after: replacement,
      });
      assert.equal(
        restored.update.authored.decide({
          action: 'reject',
          selection: restored.read.authored.select({ status: 'pending' }),
        }).status,
        'applied'
      );
      assert.deepEqual(reopened.read.children(), [paragraph('ABC')]);
    });
  }

  it("keeps another author's adjacent insertion separate", () => {
    const { source, view, setAuthor } = setup();
    view.update.text.insert('p', { at: point(1) });
    const parent = source.read.authored.changes().items[0];
    setAuthor('bob');
    view.update.text.insert('q', { at: point(2) });
    const child = source.read.authored.changes({ authorId: 'bob' }).items[0];

    assert.notEqual(child.id, parent.id);
    assert.equal(source.read.authored.change(parent.id)?.revision, 1);
    const details = view.read.authored.details(child.id);
    assert.equal(details?.parts.status, 'available');
    if (details?.parts.status !== 'available') assert.fail();
    assert.deepEqual(contentText(details.parts.items), {
      before: '',
      after: 'q',
    });
    const parentDetails = view.read.authored.details(parent.id);
    assert.equal(parentDetails?.parts.status, 'available');
    if (parentDetails?.parts.status !== 'available') assert.fail();
    assert.deepEqual(contentText(parentDetails.parts.items), {
      before: '',
      after: 'p',
    });
  });

  it("keeps another author's insertion unchanged when canceling text typed inside it", () => {
    const { source, view, setAuthor } = setup();
    setAuthor('charlie');
    view.update.text.insert('overlapping', { at: point(1) });
    const charlie = source.read.authored.changes({ authorId: 'charlie' })
      .items[0];
    const originalChange = source.read.authored.change(charlie.id);
    const originalDetails = view.read.authored.details(charlie.id);

    setAuthor('alice');
    view.update.selection.set(point(5));
    for (const character of 'xyz') view.update.text.insert(character);
    view.update.text.deleteBackward();
    view.update.text.deleteBackward();
    view.update.text.deleteBackward();

    assert.deepEqual(view.read.children(), [paragraph('AoverlappingBC')]);
    assert.deepEqual(source.read.authored.change(charlie.id), originalChange);
    assert.deepEqual(view.read.authored.details(charlie.id), originalDetails);
    assert.deepEqual(
      view.read.authored.changesAt(range(1, 12)).map(({ authorId, id }) => ({
        authorId,
        id,
      })),
      [{ authorId: 'charlie', id: charlie.id }]
    );
  });

  it('keeps a matching deletion prefix typed by another author separate', () => {
    const { source, view, setAuthor } = setup([paragraph('to mark text end')]);
    view.update.text.delete({ at: range(3, 12) });
    const deletion = source.read.authored.changes().items[0];
    setAuthor('bob');
    view.update.text.insert('mark', { at: point(3) });
    const insertion = source.read.authored.changes({ authorId: 'bob' })
      .items[0];

    assert.notEqual(insertion.id, deletion.id);
    assert.equal(source.read.authored.change(deletion.id)?.revision, 1);
    assert.deepEqual(view.read.children(), [paragraph('to mark end')]);
    const insertionDetails = view.read.authored.details(insertion.id);
    assert.equal(insertionDetails?.parts.status, 'available');
    if (insertionDetails?.parts.status !== 'available') assert.fail();
    assert.deepEqual(contentText(insertionDetails.parts.items), {
      before: '',
      after: 'mark',
    });
    const deletionDetails = view.read.authored.details(deletion.id);
    assert.equal(deletionDetails?.parts.status, 'available');
    if (deletionDetails?.parts.status !== 'available') assert.fail();
    assert.deepEqual(contentText(deletionDetails.parts.items), {
      before: 'mark text',
      after: '',
    });

    assert.equal(
      source.update.authored.decide({
        action: 'reject',
        selection: source.read.authored.select({ ids: [insertion.id] }),
      }).status,
      'applied'
    );
    assert.deepEqual(view.read.children(), [paragraph('to  end')]);
    assert.equal(source.read.authored.change(deletion.id)?.status, 'pending');
    assert.equal(
      source.update.authored.decide({
        action: 'reject',
        selection: source.read.authored.select({ ids: [deletion.id] }),
      }).status,
      'applied'
    );
    assert.deepEqual(view.read.children(), [paragraph('to mark text end')]);
  });

  for (const action of ['accept', 'reject'] as const) {
    it(`treats ${action} of a cancelled deletion as a document no-op after reload`, () => {
      const { source, view, plugin } = setup();
      view.update.text.delete({ at: range(1, 2) });
      const { id } = source.read.authored.changes().items[0];
      view.update.text.insert('B', { at: point(1) });
      const restored = createEditor({
        plugins: [plugin],
        initialValue: JSON.parse(JSON.stringify(source.read.value())),
      });
      const reopened = createEditorView(restored, { authored: markup });
      const decision = restored.update.authored.decide({
        action,
        selection: restored.read.authored.select({ ids: [id] }),
      });

      assert.equal(decision.status, 'applied');
      assert.deepEqual(restored.read.children(), [paragraph('ABC')]);
      assert.deepEqual(reopened.read.children(), [paragraph('ABC')]);
      assert.deepEqual(reviewParts(reopened), []);
      assert.deepEqual(reopened.read.authored.changesAt(range(0, 3)), []);
      reopened.update.text.delete({ at: range(1, 2) });
      assert.deepEqual(reopened.read.children(), [paragraph('AC')]);
      assert.deepEqual(contentText(reviewParts(reopened)), {
        before: 'B',
        after: '',
      });
    });
  }
});
