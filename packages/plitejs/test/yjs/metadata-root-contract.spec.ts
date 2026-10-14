import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { history } from '../../src/history';
import {
  createEditor,
  defineEditorSchema,
  definePlugin,
  property,
  schema,
} from '../../src/index';
import { yjs } from '../../src/yjs/core/plugin';
import { paragraph, readEditorYjsState } from './support/collaboration';

const BodySchema = defineEditorSchema('schema:yjs-metadata-body', {
  elements: { paragraph: { content: schema.content.text() } },
  root: schema.content.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
});

const RecordsPlugin = definePlugin('records', {
  schema: {
    elements: {
      record: {
        content: schema.content.text({ default: 'text', min: 1 }),
        properties: { ctx: property.string() },
      },
    },
    roots: { $records: schema.content.type('record') },
  },
});

const record = (ctx: string) => ({
  children: [{ text: '' }],
  ctx,
  type: 'record',
});

const createPeer = (doc: Y.Doc, seed: boolean) => {
  const editor = createEditor({
    initialValue: [paragraph('Body')],
    plugins: [BodySchema, RecordsPlugin, history()],
  });
  const cleanup = editor.install(
    yjs({ doc, initialReady: true, ...(seed ? { seed: true } : {}) })
  );

  return { cleanup, doc, editor };
};

const sync = (source: { doc: Y.Doc }, target: { doc: Y.Doc }): void => {
  Y.applyUpdate(
    target.doc,
    Y.encodeStateAsUpdate(source.doc, Y.encodeStateVector(target.doc))
  );
};

const contexts = (editor: ReturnType<typeof createPeer>['editor']) =>
  (editor.read.value().roots?.$records ?? [])
    .map((node) => (node as ReturnType<typeof record>).ctx)
    .sort();

describe('plitejs/yjs metadata roots', () => {
  it('keeps both records when two peers create a metadata root at once', () => {
    const a = createPeer(new Y.Doc(), true);
    const bDoc = new Y.Doc();

    sync(a, { doc: bDoc });

    const b = createPeer(bDoc, false);

    a.editor.update((tx) => {
      tx.roots.create('$records', [record('c:a')]);
    });
    b.editor.update((tx) => {
      tx.roots.create('$records', [record('c:b')]);
    });
    sync(a, b);
    sync(b, a);

    assert.deepEqual(
      [contexts(a.editor), contexts(b.editor)],
      [
        ['c:a', 'c:b'],
        ['c:a', 'c:b'],
      ]
    );

    a.cleanup();
    b.cleanup();
  });

  it('opens a room written before its metadata roots existed', () => {
    const writer = createEditor({
      initialValue: [paragraph('Saved')],
      plugins: [BodySchema, history()],
    });
    const doc = new Y.Doc();

    writer.install(yjs({ doc, initialReady: true, seed: true }))();

    const reader = createPeer(new Y.Doc(), false);

    reader.cleanup();
    Y.applyUpdate(reader.doc, Y.encodeStateAsUpdate(doc));

    const binding = yjs({ doc: reader.doc, initialReady: true });
    const cleanup = reader.editor.install(binding);

    assert.deepEqual(
      {
        children: reader.editor.read.children(),
        state: reader.editor.plugin(binding).api.admissionStatus().state,
      },
      { children: [paragraph('Saved')], state: 'ready' }
    );

    cleanup();
  });

  it('lowers a commit that changes two roots one root at a time', () => {
    const peer = createPeer(new Y.Doc(), true);

    peer.editor.update((tx) => {
      tx.roots.create('$records', [record('c:a')]);
    });
    const seen = readEditorYjsState(peer.editor).trace().length;

    peer.editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 4, path: [0, 0] } });
      tx.roots.replace('$records', [record('c:a'), record('c:b')]);
    });

    assert.deepEqual(
      readEditorYjsState(peer.editor)
        .trace()
        .slice(seen)
        .map((entry) => 'changedRanges' in entry),
      [true, true]
    );

    peer.cleanup();
  });
});
