import assert from 'node:assert/strict';
import { it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  schema,
  NodeApi,
} from '../src';
import { authored } from '../src/authored';
import { readAuthoredOriginal } from '../src/authored/original';
import { readRecord, records } from '../src/authored/record-tree';
import { authoredState, reduceAuthoredOperation } from '../src/authored/state';
import { history } from '../src/history';

const point = (offset: number) => ({ path: [0, 0], offset });
const range = (from: number, to: number) => ({
  anchor: point(from),
  focus: point(to),
});

it('amends proposal originals by content identity after direct edits remove intervening text', async () => {
  const editor = createEditor({
    plugins: [authored({ authorId: 'alice' }), history()],
    initialValue: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
  });
  const view = createEditorView(editor, {
    authored: { intent: 'propose', projection: 'markup' },
  });
  view.update.text.insert('ABCDEF', { at: point(1) });
  const { id } = editor.read.authored.changes({ proposals: true }).items[0];
  const originalText = (source: typeof editor) => {
    const original = source.read.authored.details(id)?.original;
    assert.equal(original?.status, 'available');
    if (original?.status !== 'available') assert.fail();
    return original.items
      .flatMap((part) =>
        part.kind === 'content' ? (part.after?.content.content ?? []) : []
      )
      .map(NodeApi.string)
      .join('');
  };

  view.api.authored.setView({ intent: 'edit', projection: 'markup' });
  view.update.text.delete({ at: range(3, 5) });
  assert.equal(originalText(editor), 'ABCDEF');
  view.api.authored.setView({ intent: 'propose', projection: 'markup' });
  assert.equal(originalText(editor), 'ABCDEF');
  view.update.text.insert('X', { at: point(5) });
  assert.equal(originalText(editor), 'ABEFX');
  await view.api.history.undo();
  assert.equal(originalText(editor), 'ABCDEF');
  await view.api.history.redo();
  assert.equal(originalText(editor), 'ABEFX');
  view.update.text.delete({ at: range(2, 4) });
  assert.equal(originalText(editor), 'AFX');
  assert.equal(view.read.text.string([]), 'aAFXb');

  await view.api.history.undo();
  assert.equal(originalText(editor), 'ABEFX');
  await view.api.history.redo();
  assert.equal(originalText(editor), 'AFX');
  const restored = createEditor({
    plugins: [authored({ authorId: 'alice' }), history()],
    initialValue: JSON.parse(JSON.stringify(editor.read.value())),
  });
  assert.equal(originalText(restored), 'AFX');
  assert.deepEqual(
    restored.read.authored
      .changes({ proposals: true })
      .items.map((change) => change.id),
    [id]
  );
});

it('refreshes remaining link content after direct edits split its carrier', async () => {
  const editor = createEditor({
    plugins: [
      defineEditorSchema('original-link', {
        elements: {
          link: {
            content: schema.content.text({ default: 'text', min: 1 }),
            inline: true,
          },
        },
        id: 'original-link',
        root: schema.content.not(schema.content.text()),
        unknown: 'preserve',
        version: 1,
      }),
      authored({ authorId: 'alice' }),
      history(),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
  });
  const view = createEditorView(editor, {
    authored: { intent: 'propose', projection: 'markup' },
  });
  view.update.nodes.insert(
    { type: 'link', children: [{ text: 'ABCDEF' }] },
    { at: point(1) }
  );
  const { id } = editor.read.authored.changes({ proposals: true }).items[0];
  const original = () => {
    const result = editor.read.authored.details(id)?.original;
    assert.equal(result?.status, 'available');
    if (result?.status !== 'available') assert.fail();
    return result.items
      .flatMap((part) =>
        part.kind === 'content' ? (part.after?.content.content ?? []) : []
      )
      .map(NodeApi.string)
      .join('');
  };
  view.api.authored.setView({ intent: 'edit', projection: 'markup' });
  view.update.text.insert('Z', { at: { path: [0, 1, 0], offset: 3 } });
  assert.equal(view.read.text.string([]), 'aABCZDEFb');
  view.update.nodes.remove({ at: [0, 1] });
  assert.equal(view.read.text.string([]), 'aZDEFb');
  assert.equal(original(), 'ABCDEF');
  view.api.authored.setView({ intent: 'propose', projection: 'markup' });
  const link = [...NodeApi.descendants(view)].find(
    ([node]) => NodeApi.isElement(node) && node.type === 'link'
  );
  assert.ok(link);
  view.update((tx) => {
    tx.history.newBatch();
    tx.text.insert('Q', { at: { path: [...link[1], 0], offset: 3 } });
  });
  assert.equal(original(), 'DEFQ');
  await view.api.history.undo();
  assert.equal(original(), 'ABCDEF');
  await view.api.history.redo();
  assert.equal(original(), 'DEFQ');
});

it('coalesces adjacent original deletions in document order and preserves gaps', () => {
  let authorId = 'bob';
  const editor = createEditor({
    plugins: [authored({ authorId: () => authorId })],
    initialValue: [{ type: 'paragraph', children: [{ text: '09' }] }],
  });
  const view = createEditorView(editor, {
    authored: { intent: 'propose', projection: 'markup' },
  });
  view.update.text.insert('abcdefghijklmnop', { at: point(1) });
  authorId = 'alice';
  view.update.selection.set(point(17));
  for (let index = 0; index < 12; index++) {
    view.update({ tags: 'native-text-input' }, (tx) =>
      tx.text.deleteBackward()
    );
  }
  const { id } = editor.read.authored.changes({ authorId: 'alice' }).items[0];
  const deletedText = () => {
    const original = editor.read.authored.details(id)?.original;
    assert.equal(original?.status, 'available');
    if (original?.status !== 'available') assert.fail();
    return original.items.map((part) => {
      assert.ok(part.kind === 'content' && part.action === 'delete');
      return part.before!.content.content.map(NodeApi.string).join('');
    });
  };
  assert.deepEqual(deletedText(), ['efghijklmnop']);
  view.update((tx) => {
    tx.authored.propose({ changeId: id });
    tx.text.delete({ at: range(1, 2) });
  });
  assert.deepEqual(deletedText().sort(), ['a', 'efghijklmnop']);
});

it('retains overlapping concurrent original deletions at a shared boundary', () => {
  const editor = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
  });
  let id = '';
  editor.update((tx) => {
    id = tx.authored.propose();
    tx.text.delete({ at: range(0, 1) });
  });
  const saved = JSON.parse(JSON.stringify(editor.read.value()));
  const peers = [1, 2].map((length) => {
    const peer = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: saved,
    });
    peer.update((tx) => {
      tx.authored.propose({ changeId: id });
      tx.text.delete({ at: range(0, length) });
    });
    return peer.read.getField(authoredState);
  });
  for (const [first, second] of [peers, [...peers].reverse()]) {
    const operation = [...records(second.operations)]
      .map(([, value]) => value)
      .find((value) => value.clock === second.clock);
    assert.ok(operation);
    const state = reduceAuthoredOperation(first, operation);
    const change = readRecord(state.changes, id);
    assert.ok(change);
    const original = readAuthoredOriginal(change, state);
    assert.equal(original?.status, 'available');
    if (original?.status !== 'available') assert.fail();
    assert.deepEqual(
      original.items
        .map((part) => {
          assert.ok(part.kind === 'content' && part.action === 'delete');
          return part.before!.content.content.map(NodeApi.string).join('');
        })
        .sort(),
      ['ab', 'bc']
    );
  }
});

for (const direction of ['backward', 'forward'] as const) {
  it(`coalesces ${direction} deletions across insertion origins`, () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [{ type: 'paragraph', children: [{ text: 'ac' }] }],
    });
    editor.update.text.insert('b', { at: point(1) });
    const view = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'markup' },
    });
    view.update.selection.set(point(direction === 'backward' ? 3 : 0));
    for (let index = 0; index < 3; index++) {
      view.update({ tags: 'native-text-input' }, (tx) => {
        if (direction === 'backward') tx.text.deleteBackward();
        else tx.text.deleteForward();
      });
    }
    const { id } = editor.read.authored.changes({ proposals: true }).items[0];
    const original = editor.read.authored.details(id)?.original;
    assert.equal(original?.status, 'available');
    if (original?.status !== 'available') assert.fail();
    assert.deepEqual(
      original.items.map((part) => {
        assert.ok(part.kind === 'content');
        return part.before!.content.content.map(NodeApi.string).join('');
      }),
      ['abc']
    );
  });
}

it('keeps deletions separate around a surviving insertion', () => {
  const editor = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
  });
  editor.update.text.insert('X', { at: point(2) });
  let id = '';
  editor.update((tx) => {
    id = tx.authored.propose();
    tx.text.delete({ at: range(1, 2) });
  });
  editor.update((tx) => {
    tx.authored.propose({ changeId: id });
    tx.text.delete({ at: range(2, 3) });
  });
  const original = editor.read.authored.details(id)?.original;
  assert.equal(original?.status, 'available');
  if (original?.status !== 'available') assert.fail();
  assert.deepEqual(
    original.items
      .map((part) => {
        assert.ok(part.kind === 'content');
        return part.before!.content.content.map(NodeApi.string).join('');
      })
      .sort(),
    ['b', 'c']
  );
});

for (const insertedGap of [false, true]) {
  it(`does not join deletions across another pending deletion (${insertedGap ? 'inserted' : 'base'} gap)`, () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [
        { type: 'paragraph', children: [{ text: insertedGap ? 'ac' : 'abc' }] },
      ],
    });
    if (insertedGap) editor.update.text.insert('b', { at: point(1) });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.delete({ at: range(1, 2) });
    });
    let id = '';
    editor.update((tx) => {
      id = tx.authored.propose();
      tx.text.delete({ at: range(0, 1) });
    });
    editor.update((tx) => {
      tx.authored.propose({ changeId: id });
      tx.text.delete({ at: range(0, 1) });
    });
    const original = editor.read.authored.details(id)?.original;
    assert.equal(original?.status, 'available');
    if (original?.status !== 'available') assert.fail();
    assert.deepEqual(
      original.items
        .map((part) => {
          assert.ok(part.kind === 'content');
          return part.before!.content.content.map(NodeApi.string).join('');
        })
        .sort(),
      ['a', 'c']
    );
  });
}
