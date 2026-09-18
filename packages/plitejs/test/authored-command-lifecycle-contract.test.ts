import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  property,
  schema,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number, block = 0) => ({
  path: [block, 0],
  offset,
});
const markup = { intent: 'propose', projection: 'markup' } as const;

const decide = (
  editor: ReturnType<typeof createEditor>,
  id: string,
  action: 'accept' | 'reject'
) =>
  editor.update.authored.decide({
    action,
    selection: editor.read.authored.select({ ids: [id] }),
  });

describe('authored command lifecycles', () => {
  it('accepts an inserted paragraph break, reloads it and keeps follow-up typing editable', () => {
    const plugin = authored({ authorId: 'alice', retainHistory: true });
    const source = createEditor({
      plugins: [plugin],
      initialValue: [paragraph('Base')],
    });
    const view = createEditorView(source, { authored: markup });

    view.update.selection.set(point(2));
    view.update.break.insert();

    assert.deepEqual(source.read.children(), [paragraph('Base')]);
    assert.deepEqual(view.read.children(), [paragraph('Ba'), paragraph('se')]);
    const change = source.read.authored.changes({ status: 'pending' }).items[0];
    assert.deepEqual(
      view.read.authored
        .changesAt({ anchor: point(0), focus: point(2) })
        .map(({ id }) => id),
      [change.id]
    );
    assert.deepEqual(
      view.read.authored
        .changesAt({ anchor: point(0, 1), focus: point(2, 1) })
        .map(({ id }) => id),
      [change.id]
    );
    const details = source.read.authored.details(change.id);
    assert.ok(details?.parts.status === 'available');
    assert.equal(details.change.kind, 'structure');
    assert.deepEqual(
      details.parts.items.filter(({ kind }) => kind === 'boundary'),
      [
        {
          action: 'split',
          at: point(0, 1),
          kind: 'boundary',
          root: 'main',
        },
      ]
    );
    assert.equal(source.read.authored.details('missing'), null);
    assert.equal(decide(source, change.id, 'accept').status, 'applied');
    const accepted = source.read.authored.details(change.id);
    assert.notEqual(accepted, details);
    assert.equal(accepted?.change.status, 'accepted');
    assert.equal(accepted?.reviews[0]?.kind, 'decision');

    const restored = createEditor({
      plugins: [plugin],
      initialValue: JSON.parse(JSON.stringify(source.read.value())),
    });
    const restoredView = createEditorView(restored, { authored: markup });
    assert.deepEqual(restored.read.children(), [
      paragraph('Ba'),
      paragraph('se'),
    ]);
    const restoredDetails = restored.read.authored.details(change.id);
    assert.equal(restoredDetails?.parts.status, 'available');
    assert.equal(restoredDetails?.reviews.length, 1);

    restoredView.update.selection.set(point(0, 1));
    restoredView.update.text.insert('!');
    assert.deepEqual(restored.read.children(), [
      paragraph('Ba'),
      paragraph('se'),
    ]);
    assert.deepEqual(restoredView.read.children(), [
      paragraph('Ba'),
      paragraph('!se'),
    ]);
  });

  it('rejects a collapsed Backspace merge, reloads both blocks and keeps follow-up typing editable', () => {
    const plugin = authored({ authorId: 'alice', retainHistory: true });
    const source = createEditor({
      plugins: [plugin],
      initialValue: [paragraph('First'), paragraph('Second')],
    });
    const view = createEditorView(source, { authored: markup });

    view.update.selection.set(point(0, 1));
    view.update.text.deleteBackward();

    assert.deepEqual(source.read.children(), [
      paragraph('First'),
      paragraph('Second'),
    ]);
    assert.deepEqual(view.read.children(), [paragraph('FirstSecond')]);
    const change = source.read.authored.changes({ status: 'pending' }).items[0];
    assert.deepEqual(
      view.read.authored
        .changesAt({ anchor: point(4), focus: point(6) })
        .map(({ id }) => id),
      [change.id]
    );
    const details = source.read.authored.details(change.id);
    assert.ok(details?.parts.status === 'available');
    assert.deepEqual(
      details.parts.items.filter(({ kind }) => kind === 'boundary'),
      [
        {
          action: 'join',
          at: point(5),
          kind: 'boundary',
          root: 'main',
        },
      ]
    );
    assert.equal(decide(source, change.id, 'reject').status, 'applied');

    const restored = createEditor({
      plugins: [plugin],
      initialValue: JSON.parse(JSON.stringify(source.read.value())),
    });
    const restoredView = createEditorView(restored, { authored: markup });
    assert.deepEqual(restored.read.children(), [
      paragraph('First'),
      paragraph('Second'),
    ]);

    restoredView.update.selection.set(point(0, 1));
    restoredView.update.text.insert('!');
    assert.deepEqual(restoredView.read.children(), [
      paragraph('First'),
      paragraph('!Second'),
    ]);
  });

  it('groups a paragraph join and continued backward deletion', () => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice', retainHistory: true })],
      initialValue: [paragraph('First'), paragraph('Second')],
    });
    const view = createEditorView(source, { authored: markup });

    view.update.selection.set(point(0, 1));
    view.update.text.deleteBackward();
    view.update.text.deleteBackward();

    assert.deepEqual(source.read.children(), [
      paragraph('First'),
      paragraph('Second'),
    ]);
    assert.deepEqual(view.read.children(), [paragraph('FirsSecond')]);
    const changes = source.read.authored.changes({ status: 'pending' }).items;
    assert.equal(changes.length, 1);
    assert.equal(changes[0].revision, 2);
    const details = source.read.authored.details(changes[0].id);
    assert.equal(details?.parts.status, 'available');
    assert.equal(
      details?.parts.status === 'available' &&
        details.parts.items.some(
          (part) => part.kind === 'boundary' && part.action === 'join'
        ),
      true
    );
  });

  it('describes and accepts a string-valued red-to-blue text mark through reload and typing', () => {
    const ToneSchema = defineEditorSchema('authored-valued-mark', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'authored-valued-mark',
      properties: [schema.textProperty('tone', property.string())],
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });
    const plugin = authored({ authorId: 'alice', retainHistory: true });
    const initial = [
      {
        type: 'paragraph',
        children: [{ text: 'Text', tone: 'red' }],
      },
    ];
    const source = createEditor({
      plugins: [ToneSchema, plugin],
      initialValue: initial,
    });
    const view = createEditorView(source, { authored: markup });

    view.update.selection.set({ anchor: point(0), focus: point(4) });
    view.update.marks.add('tone', 'blue');

    assert.deepEqual(source.read.children(), initial);
    assert.deepEqual(view.read.children(), [
      {
        type: 'paragraph',
        children: [{ text: 'Text', tone: 'blue' }],
      },
    ]);
    const change = source.read.authored.changes({ status: 'pending' }).items[0];
    const first = source.read.authored.details(change.id);
    const second = source.read.authored.details(change.id);
    assert.equal(first, second);
    assert.equal(first?.change, change);
    assert.ok(first?.parts.status === 'available');
    assert.deepEqual(
      first.parts.items.filter(({ kind }) => kind === 'properties'),
      [
        {
          after: { tone: 'blue' },
          before: { tone: 'red' },
          kind: 'properties',
          nodeKind: 'text',
          path: [0, 0],
          root: 'main',
        },
      ]
    );
    assert.equal(decide(source, change.id, 'accept').status, 'applied');

    const restored = createEditor({
      plugins: [ToneSchema, plugin],
      initialValue: JSON.parse(JSON.stringify(source.read.value())),
    });
    const restoredView = createEditorView(restored, { authored: markup });
    assert.deepEqual(restored.read.children(), [
      {
        type: 'paragraph',
        children: [{ text: 'Text', tone: 'blue' }],
      },
    ]);

    restoredView.update.selection.set(point(4));
    restoredView.update.text.insert('!');
    assert.deepEqual(restoredView.read.children(), [
      {
        type: 'paragraph',
        children: [{ text: 'Text!', tone: 'blue' }],
      },
    ]);
  });

  it('keeps review provenance when compact history makes content unavailable', () => {
    let authorId = 'alice';
    const source = createEditor({
      plugins: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('Base')],
    });
    const view = createEditorView(source, { authored: markup });
    view.update.text.insert('!', { at: point(4) });
    const change = source.read.authored.changes({ status: 'pending' }).items[0];

    authorId = 'bob';
    assert.equal(decide(source, change.id, 'accept').status, 'applied');
    const details = source.read.authored.details(change.id);
    assert.deepEqual(details?.parts, {
      reason: 'retention',
      status: 'unavailable',
    });
    assert.deepEqual(
      details?.reviews.map((review) => ({
        action: review.action,
        active: review.active,
        authorId: review.authorId,
        changeIds: review.changeIds,
        kind: review.kind,
        undoOf: review.undoOf,
      })),
      [
        {
          action: 'accept',
          active: true,
          authorId: 'bob',
          changeIds: [change.id],
          kind: 'decision',
          undoOf: null,
        },
      ]
    );
  });

  it('keeps rejected inserted content available when history retention is enabled', () => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice', retainHistory: true })],
      initialValue: [paragraph('Base')],
    });
    const view = createEditorView(source, { authored: markup });
    view.update.text.insert('!', { at: point(4) });
    const change = source.read.authored.changes({ status: 'pending' }).items[0];
    assert.equal(decide(source, change.id, 'reject').status, 'applied');

    const details = source.read.authored.details(change.id);
    assert.ok(details?.parts.status === 'available');
    assert.deepEqual(details.parts.items, [
      {
        action: 'insert',
        after: {
          content: {
            content: [paragraph('!')],
            openEnd: 1,
            openStart: 1,
          },
          location: {
            kind: 'range',
            range: { anchor: point(4), focus: point(4) },
          },
          root: 'main',
        },
        before: null,
        kind: 'content',
      },
    ]);
  });

  it('reports one semantic move with its source and destination content', () => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice', retainHistory: true })],
      initialValue: [paragraph('Alpha'), paragraph('Beta'), paragraph('Gamma')],
    });
    const view = createEditorView(source, { authored: markup });
    view.update.nodes.move({ at: [0], to: [2] });
    const change = source.read.authored.changes({ status: 'pending' }).items[0];

    const details = source.read.authored.details(change.id);
    assert.ok(details?.parts.status === 'available');
    assert.equal(details.parts.items.length, 1);
    const part = details.parts.items[0];
    assert.ok(part.kind === 'content' && part.action === 'move');
    assert.deepEqual(part.before?.content.content, [paragraph('Alpha')]);
    assert.deepEqual(part.after?.content.content, [paragraph('Alpha')]);
  });

  it('reports the active native review head after undoing a decision', () => {
    const source = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    const view = createEditorView(source, { authored: markup });
    view.update.text.insert('!', { at: point(4) });
    const change = source.read.authored.changes({ status: 'pending' }).items[0];
    assert.equal(decide(source, change.id, 'accept').status, 'applied');

    source.api.history.undo();

    const details = source.read.authored.details(change.id);
    assert.equal(details?.change.status, 'pending');
    assert.deepEqual(
      details?.reviews.map(({ active, kind, undoOf }) => ({
        active,
        kind,
        undoOf,
      })),
      [
        { active: false, kind: 'decision', undoOf: null },
        {
          active: true,
          kind: 'undo',
          undoOf: details?.reviews[0]?.id,
        },
      ]
    );
  });
});
