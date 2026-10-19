import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { history } from '../../src/history';
import {
  createEditor,
  defineEditorSchema,
  definePlugin,
  type EditorDocumentRecords,
  schema,
} from '../../src/index';
import { yjs } from '../../src/yjs/core/plugin';
import { paragraph } from './support/collaboration';

const BodySchema = defineEditorSchema('schema:yjs-record-body', {
  elements: { paragraph: { content: schema.content.text() } },
  root: schema.content.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
});

const RecordsPlugin = definePlugin('records', {
  schema: { records: { contexts: { history: 'retain' }, verdicts: {} } },
});

const createPeer = (
  doc: Y.Doc,
  seed: boolean,
  records?: EditorDocumentRecords
) => {
  const editor = createEditor({
    initialValue: {
      children: [paragraph('Body')],
      ...(records ? { records } : {}),
    },
    plugins: [BodySchema, RecordsPlugin, history()],
  });
  const binding = yjs({
    doc,
    initialReady: true,
    ...(seed ? { seed: true } : {}),
  });
  const cleanup = editor.install(binding);

  return { binding, cleanup, doc, editor };
};

const joinPeer = (from: { doc: Y.Doc }, records?: EditorDocumentRecords) => {
  const doc = new Y.Doc();

  Y.applyUpdate(doc, Y.encodeStateAsUpdate(from.doc));

  return createPeer(doc, false, records);
};

const sync = (source: { doc: Y.Doc }, target: { doc: Y.Doc }): void => {
  Y.applyUpdate(
    target.doc,
    Y.encodeStateAsUpdate(source.doc, Y.encodeStateVector(target.doc))
  );
};

describe('plitejs/yjs record sets', () => {
  it('applies a remote record and the edit beside it in one commit', () => {
    const a = createPeer(new Y.Doc(), true);
    const b = joinPeer(a);
    const seen: unknown[] = [];
    const unsubscribe = b.editor.subscribeCommit(() => {
      const value = b.editor.read.value();

      seen.push([value.children, value.records]);
    });

    a.editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 4, path: [0, 0] } });
      tx.records.put('contexts', 'c:a', { by: 'a' });
    });
    sync(a, b);

    assert.deepEqual(seen, [
      [[paragraph('Body!')], { contexts: { 'c:a': { by: 'a' } } }],
    ]);

    unsubscribe();
    a.cleanup();
    b.cleanup();
  });

  it('applies a remote record whose id names an object property', () => {
    const a = createPeer(new Y.Doc(), true);
    const b = joinPeer(a);

    a.editor.update((tx) =>
      tx.records.put('contexts', '__proto__', { by: 'a' })
    );
    sync(a, b);

    assert.deepEqual(b.editor.read.value().records, {
      contexts: JSON.parse('{"__proto__":{"by":"a"}}'),
    });

    a.cleanup();
    b.cleanup();
  });

  it('undoes only the undoing peer record and keeps retained sets', () => {
    const a = createPeer(new Y.Doc(), true);
    const b = joinPeer(a);

    a.editor.update((tx) => {
      tx.records.put('contexts', 'c:a', { by: 'a' });
      tx.records.put('verdicts', 'v:a', { by: 'a' });
    });
    b.editor.update((tx) => tx.records.put('verdicts', 'v:b', { by: 'b' }));
    sync(a, b);
    sync(b, a);
    a.editor.api.history.undo();
    sync(a, b);

    const kept = {
      contexts: { 'c:a': { by: 'a' } },
      verdicts: { 'v:b': { by: 'b' } },
    };

    assert.deepEqual(
      [a.editor.read.value().records, b.editor.read.value().records],
      [kept, kept]
    );

    a.cleanup();
    b.cleanup();
  });

  it('keeps the records a replacement leaves out on every peer', () => {
    const a = createPeer(new Y.Doc(), true);
    const b = joinPeer(a);

    a.editor.update((tx) => tx.records.put('contexts', 'c:a', { by: 'a' }));
    sync(a, b);
    b.editor.update((tx) =>
      tx.value.replace({
        children: [paragraph('New')],
        records: { verdicts: { 'v:b': { by: 'b' } } },
      })
    );
    sync(b, a);

    const kept = {
      contexts: { 'c:a': { by: 'a' } },
      verdicts: { 'v:b': { by: 'b' } },
    };

    assert.deepEqual(
      [a.editor.read.value().records, b.editor.read.value().records],
      [kept, kept]
    );

    a.cleanup();
    b.cleanup();
  });

  it('loads the room records over a joining peer records', () => {
    const a = createPeer(new Y.Doc(), true, {
      contexts: { 'c:room': { at: 1 } },
    });
    const b = joinPeer(a, { contexts: { 'c:local': { at: 2 } } });

    assert.deepEqual(b.editor.read.value().records, {
      contexts: { 'c:room': { at: 1 } },
    });

    a.cleanup();
    b.cleanup();
  });

  it('opens a room seeded before its record sets were declared', () => {
    const writer = createEditor({
      initialValue: [paragraph('Saved')],
      plugins: [BodySchema, history()],
    });
    const doc = new Y.Doc();

    writer.install(yjs({ doc, initialReady: true, seed: true }))();

    const reader = joinPeer({ doc });

    assert.deepEqual(
      {
        children: reader.editor.read.children(),
        state: reader.editor.plugin(reader.binding).api.admissionStatus().state,
      },
      { children: [paragraph('Saved')], state: 'ready' }
    );

    reader.cleanup();
  });
});
