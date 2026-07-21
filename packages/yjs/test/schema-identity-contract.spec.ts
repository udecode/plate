import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createEditor,
  defineEditorSchema,
  defineExtensionSlot,
  element,
  schema,
  type Descendant,
} from '@platejs/plite';
import * as Y from 'yjs';

import { createYjsNode } from '../src/core/document';
import { createYjsExtension } from '../src/core/extension';
import {
  createYjsSchemaEnvelope,
  getYjsSchemaMetadataName,
} from '../src/core/schema-metadata';
import { FakeProvider } from './support/provider';

const rootName = 'schema-identity-contract';

const paragraph = (text: string): Descendant => ({
  children: [{ text }],
  type: 'paragraph',
});

const card = (text: string): Descendant => ({
  children: [{ text }],
  type: 'card',
});

const articleSchema = (version: number, preserveContext = false) =>
  defineEditorSchema({
    elements: {
      paragraph: element({
        content: schema.content.text({ min: 1 }),
        slice: { preserveContext },
      }),
    },
    id: 'article',
    root: schema.root({ content: schema.content.type('paragraph') }),
    version,
  });

const requiredCardSchema = defineEditorSchema({
  elements: {
    card: element({ content: schema.content.text({ min: 1 }) }),
  },
  id: 'required-card',
  root: schema.root({ content: schema.content.type('card', { min: 2 }) }),
  version: 1,
});

const seedUpdate = (
  editorSchema: ReturnType<typeof articleSchema> | null,
  text = 'remote'
): Uint8Array => {
  const doc = new Y.Doc();

  createEditor({
    extensions: [
      ...(editorSchema ? [editorSchema] : []),
      createYjsExtension({ doc, rootName }),
    ],
    initialValue: [paragraph(text)],
  });

  return Y.encodeStateAsUpdate(doc);
};

describe('@platejs/yjs schema identity contract', () => {
  it('derives an empty Yjs root from the compiled schema minimum', () => {
    const doc = new Y.Doc();
    const editor = createEditor({
      extensions: [requiredCardSchema, createYjsExtension({ doc, rootName })],
      initialValue: [card('one'), card('two')],
    });
    const root = doc.get(rootName, Y.XmlElement);

    doc.transact(() => root.delete(0, root.length));

    assert.equal(root.length, 0);
    assert.deepEqual(editor.read.children(), [card(''), card('')]);
  });

  it('claims an explicit no-schema envelope with the initial document', () => {
    const doc = new Y.Doc();

    createEditor({
      extensions: [createYjsExtension({ doc, rootName })],
      initialValue: [paragraph('open')],
    });

    assert.deepEqual(
      doc.getMap(getYjsSchemaMetadataName(rootName)).get('current'),
      createYjsSchemaEnvelope(null)
    );
    assert.equal(doc.get(rootName, Y.XmlElement).length, 1);
  });

  it('rejects nonempty documents that never claimed schema metadata', () => {
    const doc = new Y.Doc();
    const root = doc.get(rootName, Y.XmlElement);
    const errors: unknown[] = [];

    root.insert(0, [createYjsNode(paragraph('unclaimed'))]);

    const editor = createEditor({
      extensions: [createYjsExtension({ doc, rootName })],
      initialValue: [paragraph('local')],
      lifecycleErrorSink: ({ cause }) => errors.push(cause),
    });

    assert.match(
      String(errors[0]),
      /nonempty Yjs document without schema metadata/
    );
    assert.throws(
      () => editor.read.yjs.root(),
      /nonempty Yjs document without schema metadata/
    );
  });

  it('rejects malformed schema metadata before exposing Yjs state', () => {
    const doc = new Y.Doc();
    const errors: unknown[] = [];

    doc
      .getMap(getYjsSchemaMetadataName(rootName))
      .set('current', { format: 2, identity: null });

    const editor = createEditor({
      extensions: [createYjsExtension({ doc, rootName })],
      initialValue: [paragraph('local')],
      lifecycleErrorSink: ({ cause }) => errors.push(cause),
    });

    assert.match(String(errors[0]), /Invalid Yjs schema metadata envelope/);
    assert.throws(
      () => editor.read.yjs.root(),
      /Invalid Yjs schema metadata envelope/
    );
  });

  it('rejects schema metadata with a zero schema version', () => {
    const doc = new Y.Doc();
    const errors: unknown[] = [];

    doc.getMap(getYjsSchemaMetadataName(rootName)).set('current', {
      format: 1,
      identity: { fingerprint: 'schema-v0', id: 'article', version: 0 },
    });

    const editor = createEditor({
      extensions: [createYjsExtension({ doc, rootName })],
      initialValue: [paragraph('local')],
      lifecycleErrorSink: ({ cause }) => errors.push(cause),
    });

    assert.match(String(errors[0]), /Invalid Yjs schema metadata envelope/);
    assert.throws(
      () => editor.read.yjs.root(),
      /Invalid Yjs schema metadata envelope/
    );
  });

  it('waits for provider sync before importing a claimed room', () => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, seedUpdate(articleSchema(1)));

    const provider = new FakeProvider({ doc, synced: false });
    const editor = createEditor({
      extensions: [
        articleSchema(1),
        createYjsExtension({ provider, rootName }),
      ],
      initialValue: [paragraph('local')],
    });

    assert.deepEqual(editor.read.children(), [paragraph('local')]);

    provider.emitSync(true);

    assert.deepEqual(editor.read.children(), [paragraph('remote')]);
  });

  it('claims an empty provider room and seeds content atomically after sync', () => {
    const doc = new Y.Doc();
    const provider = new FakeProvider({ doc, synced: false });
    const editor = createEditor({
      extensions: [
        articleSchema(1),
        createYjsExtension({ provider, rootName }),
      ],
      initialValue: [paragraph('seed')],
    });
    const root = doc.get(rootName, Y.XmlElement);
    const metadata = doc.getMap(getYjsSchemaMetadataName(rootName));
    const transactions: Readonly<{ content: boolean; schema: boolean }>[] = [];

    doc.on('afterTransaction', (transaction) => {
      transactions.push({
        content: transaction.changed.has(root),
        schema: transaction.changed.has(metadata),
      });
    });

    assert.equal(root.length, 0);
    assert.equal(metadata.get('current'), undefined);

    provider.emitSync(true);

    assert.equal(root.length, 1);
    assert.deepEqual(metadata.get('current'), {
      format: 1,
      identity: editor.read.schema.identity(),
    });
    assert.equal(
      transactions.some(({ content, schema }) => content && schema),
      true
    );
  });

  it('blocks a provider schema mismatch before content import', () => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, seedUpdate(articleSchema(1)));

    const provider = new FakeProvider({ doc, synced: false });
    const editor = createEditor({
      extensions: [
        articleSchema(2),
        createYjsExtension({ provider, rootName }),
      ],
      initialValue: [paragraph('local')],
    });

    assert.throws(
      () => provider.emitSync(true),
      /local version 2, room version 1/
    );
    assert.deepEqual(editor.read.children(), [paragraph('local')]);

    editor.update.text.insert('!', { at: { path: [0, 0], offset: 5 } });

    assert.deepEqual(editor.read.children(), [paragraph('local')]);
  });

  it('keeps open editors out of schema-claimed rooms', () => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, seedUpdate(articleSchema(1)));

    const provider = new FakeProvider({ doc, synced: false });
    const editor = createEditor({
      extensions: [createYjsExtension({ provider, rootName })],
      initialValue: [paragraph('local')],
    });

    assert.throws(
      () => provider.emitSync(true),
      /local open schema cannot join room schema "article"/
    );
    assert.deepEqual(editor.read.children(), [paragraph('local')]);
  });

  it('diagnoses changed semantics without a schema version bump', () => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, seedUpdate(articleSchema(1)));

    const provider = new FakeProvider({ doc, synced: false });

    createEditor({
      extensions: [
        articleSchema(1, true),
        createYjsExtension({ provider, rootName }),
      ],
      initialValue: [paragraph('local')],
    });

    assert.throws(
      () => provider.emitSync(true),
      /semantics changed without a version bump/
    );
  });

  it('observes schema metadata before flushing remote content', () => {
    const doc = new Y.Doc();
    const editor = createEditor({
      extensions: [articleSchema(1), createYjsExtension({ doc, rootName })],
      initialValue: [paragraph('local')],
    });
    const nextIdentity = createEditor({
      extensions: [articleSchema(2)],
      initialValue: [paragraph('unused')],
    }).read.schema.identity();
    const root = doc.get(rootName, Y.XmlElement);
    const metadata = doc.getMap(getYjsSchemaMetadataName(rootName));

    assert(nextIdentity);
    assert.throws(
      () =>
        doc.transact(() => {
          metadata.set('current', createYjsSchemaEnvelope(nextIdentity));
          root.delete(0, root.length);
          root.insert(0, [createYjsNode(paragraph('blocked'))]);
        }),
      /local version 1, room version 2/
    );
    assert.deepEqual(editor.read.children(), [paragraph('local')]);
  });

  it('rejects local schema reconfiguration against a claimed room', () => {
    const slot = defineExtensionSlot('article-schema');
    const editor = createEditor({
      extensions: [slot.of(articleSchema(1)), createYjsExtension({ rootName })],
      initialValue: [paragraph('local')],
    });
    const identity = editor.read.schema.identity();

    assert.throws(
      () => editor.update.extensions.reconfigure(slot, articleSchema(2)),
      /local version 2, room version 1/
    );
    assert.equal(editor.read.schema.identity(), identity);
  });
});
