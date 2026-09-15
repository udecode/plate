import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { History, history } from '../../src/history';
import {
  createEditor,
  defineEditorSchema,
  definePluginSlot,
  ElementApi,
  type EditorStateSchemaApi,
  property,
  schema,
  type Descendant,
} from '../../src/index';
import { createYjsNode } from '../../src/yjs/core/document';
import { yjs } from '../../src/yjs/core/plugin';
import {
  createYjsSchemaEnvelope,
  getYjsSchemaMetadataName,
  readYjsSchemaEnvelope,
} from '../../src/yjs/core/schema-metadata';
import type { YjsInitialReadiness } from '../../src/yjs/core/types';

const rootName = 'schema-identity-contract';

class TestInitialReadiness implements YjsInitialReadiness {
  readonly doc: Y.Doc;
  private readonly listeners = new Set<() => void>();
  private ready: boolean;

  constructor(doc: Y.Doc, ready = false) {
    this.doc = doc;
    this.ready = ready;
  }

  readonly getSnapshot = () => this.ready;

  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    let active = true;

    return () => {
      if (!active) return;

      active = false;
      this.listeners.delete(listener);
    };
  };

  setReady(ready: boolean): void {
    if (this.ready === ready) return;

    this.ready = ready;
    for (const listener of this.listeners) listener();
  }
}

const paragraph = (text: string): Descendant => ({
  children: [{ text }],
  type: 'paragraph',
});

const card = (text: string): Descendant => ({
  children: [{ text }],
  type: 'card',
});

const articleSchema = (version: number, preserveContext = false) =>
  defineEditorSchema('schema:article', {
    elements: {
      paragraph: {
        content: schema.content.text({ min: 1 }),
        slice: { preserveContext },
      },
    },
    id: 'article',
    root: schema.content.type('paragraph'),
    unknown: 'reject',
    version,
  });

const requiredCardSchema = defineEditorSchema('schema:required-card', {
  elements: {
    card: { content: schema.content.text({ min: 1 }) },
  },
  id: 'required-card',
  root: schema.content.type('card', { min: 2 }),
  unknown: 'reject',
  version: 1,
});

type PolicyProbe = Readonly<{ revision: number }>;
type PolicySchemaMode = 'add' | 'base' | 'remove' | 'replace';

const policySchema = ({
  calls,
  label,
  mode = 'base',
  version = 1,
}: {
  calls: string[];
  label: string;
  mode?: PolicySchemaMode;
  version?: number;
}) =>
  defineEditorSchema('schema:article-policy-schema', {
    elements: {
      paragraph: {
        content: schema.content.text({ min: 1 }),
        properties: {
          ...(mode === 'add' ? { extra: property.boolean() } : {}),
          ...(mode === 'remove'
            ? {}
            : {
                payload: property.json({
                  validate: (value): value is PolicyProbe => {
                    calls.push(label);

                    return (
                      typeof value === 'object' &&
                      value !== null &&
                      'revision' in value &&
                      typeof value.revision === 'number' &&
                      Number.isInteger(value.revision) &&
                      value.revision >= 0
                    );
                  },
                  validationVersion: 1,
                }),
              }),
        },
        readOnly: mode === 'replace',
      },
    },
    id: 'article-policy-schema',
    root: schema.content.type('paragraph'),
    unknown: 'reject',
    version,
  });

const policyParagraph = (text: string, revision: number): Descendant => ({
  children: [{ text }],
  payload: { revision },
  type: 'paragraph',
});

const seedUpdate = (
  editorSchema: ReturnType<typeof articleSchema> | null,
  text = 'remote'
): Uint8Array => {
  const doc = new Y.Doc();

  createEditor({
    plugins: [
      ...(editorSchema ? [editorSchema] : []),
      yjs({ doc, initialReady: true, rootName, seed: true }),
    ],
    initialValue: [paragraph(text)],
  });

  return Y.encodeStateAsUpdate(doc);
};

describe('plitejs/yjs schema identity contract', () => {
  it('derives an empty Yjs root from the compiled schema minimum', () => {
    const doc = new Y.Doc();
    const editor = createEditor({
      plugins: [
        requiredCardSchema,
        yjs({ doc, initialReady: true, rootName, seed: true }),
      ],
      initialValue: [card('one'), card('two')],
    });
    const root = doc.get(rootName, Y.XmlElement);

    doc.transact(() => root.delete(0, root.length));

    assert.equal(root.length, 0);
    assert.deepEqual(editor.read.children(), [card(''), card('')]);
  });

  it('claims a derived schema envelope with the initial document', () => {
    const doc = new Y.Doc();

    const editor = createEditor({
      plugins: [yjs({ doc, initialReady: true, rootName, seed: true })],
      initialValue: [paragraph('open')],
    });

    assert.deepEqual(
      doc.getMap(getYjsSchemaMetadataName(rootName)).get('current'),
      createYjsSchemaEnvelope(editor.read.schema.identity())
    );
    assert.equal(doc.get(rootName, Y.XmlElement).length, 1);
  });

  it('rejects nonempty documents that never claimed schema metadata', () => {
    const doc = new Y.Doc();
    const root = doc.get(rootName, Y.XmlElement);

    root.insert(0, [createYjsNode(paragraph('unclaimed'))]);

    assert.throws(
      () =>
        createEditor({
          plugins: [yjs({ doc, initialReady: true, rootName })],
          initialValue: [paragraph('local')],
        }),
      /nonempty Yjs document without schema metadata/
    );
  });

  it('rejects malformed schema metadata before exposing Yjs state', () => {
    const doc = new Y.Doc();

    doc
      .getMap(getYjsSchemaMetadataName(rootName))
      .set('current', { format: 1, identity: null });

    assert.throws(
      () =>
        createEditor({
          plugins: [yjs({ doc, initialReady: true, rootName })],
          initialValue: [paragraph('local')],
        }),
      /Invalid Yjs schema metadata envelope/
    );
  });

  it('rejects claimed schema metadata without an identity', () => {
    const metadata = {
      get: () => ({ format: 2, identity: null }),
    } as unknown as Y.Map<unknown>;

    assert.throws(
      () => readYjsSchemaEnvelope(metadata),
      /Invalid Yjs schema metadata envelope/
    );
  });

  it('rejects hidden, accessor, and exotic schema metadata shapes', () => {
    const extraKey = Symbol('extra');
    const derivedIdentity = { fingerprint: 'schema', kind: 'derived' };
    const envelopeWithSymbol = {
      format: 2,
      identity: null,
      [extraKey]: true,
    };
    const identityWithSymbol = {
      ...derivedIdentity,
      [extraKey]: true,
    };
    const accessorEnvelope = Object.defineProperty(
      { identity: null },
      'format',
      {
        enumerable: true,
        get: () => 2,
      }
    );
    const exoticEnvelope = Object.assign(Object.create({ inherited: true }), {
      format: 2,
      identity: null,
    });
    const exoticIdentity = Object.assign(Object.create({ inherited: true }), {
      ...derivedIdentity,
    });

    for (const value of [
      envelopeWithSymbol,
      { format: 2, identity: identityWithSymbol },
      accessorEnvelope,
      exoticEnvelope,
      { format: 2, identity: exoticIdentity },
    ]) {
      const metadata = {
        get: () => value,
      } as unknown as Y.Map<unknown>;

      assert.throws(
        () => readYjsSchemaEnvelope(metadata),
        /Invalid Yjs schema metadata envelope/
      );
    }
  });

  it('rejects schema metadata with a zero schema version', () => {
    const doc = new Y.Doc();

    doc.getMap(getYjsSchemaMetadataName(rootName)).set('current', {
      format: 2,
      identity: {
        fingerprint: 'schema-v0',
        id: 'article',
        kind: 'named',
        version: 0,
      },
    });

    assert.throws(
      () =>
        createEditor({
          plugins: [yjs({ doc, initialReady: true, rootName })],
          initialValue: [paragraph('local')],
        }),
      /Invalid Yjs schema metadata envelope/
    );
  });

  it('waits for application readiness before importing a claimed room', () => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, seedUpdate(articleSchema(1)));

    const initialReady = new TestInitialReadiness(doc);
    const binding = yjs({ doc, initialReady, rootName });
    const editor = createEditor({
      plugins: [articleSchema(1), binding],
      initialValue: [paragraph('local')],
    });

    assert.deepEqual(editor.read.children(), [paragraph('local')]);
    assert.deepEqual(editor.plugin(binding).api.admissionStatus(), {
      reason: 'load',
      state: 'waiting',
    });

    initialReady.setReady(true);

    assert.deepEqual(editor.read.children(), [paragraph('remote')]);
    assert.equal(editor.plugin(binding).api.admissionStatus().state, 'ready');
  });

  it('claims an empty room and seeds content atomically after readiness', () => {
    const doc = new Y.Doc();
    const initialReady = new TestInitialReadiness(doc);
    const editor = createEditor({
      plugins: [
        articleSchema(1),
        yjs({ doc, initialReady, rootName, seed: true }),
      ],
      initialValue: [paragraph('seed')],
    });
    const root = doc.get(rootName, Y.XmlElement);
    const metadata = doc.getMap(getYjsSchemaMetadataName(rootName));
    const transactions: Array<Readonly<{ content: boolean; schema: boolean }>> =
      [];

    doc.on('afterTransaction', (transaction) => {
      const changed: ReadonlyMap<unknown, unknown> = transaction.changed;
      transactions.push({
        content: changed.has(root),
        schema: changed.has(metadata),
      });
    });

    assert.equal(root.length, 0);
    assert.equal(metadata.get('current'), undefined);

    initialReady.setReady(true);

    assert.equal(root.length, 1);
    assert.deepEqual(metadata.get('current'), {
      format: 2,
      identity: editor.read.schema.identity(),
    });
    assert.equal(
      transactions.some(
        ({ content, schema: innerSchema }) => content && innerSchema
      ),
      true
    );
  });

  it('blocks a room schema mismatch before content import', () => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, seedUpdate(articleSchema(1)));

    const initialReady = new TestInitialReadiness(doc);
    const binding = yjs({ doc, initialReady, rootName });
    const editor = createEditor({
      plugins: [articleSchema(2), binding],
      initialValue: [paragraph('local')],
    });

    initialReady.setReady(true);

    const status = editor.plugin(binding).api.admissionStatus();

    assert.equal(status.state, 'error');
    if (status.state === 'error') {
      assert.match(String(status.cause), /local version 2, room version 1/);
    }
    assert.deepEqual(editor.read.children(), [paragraph('local')]);

    assert.throws(
      () => editor.update.text.insert('!', { at: { path: [0, 0], offset: 5 } }),
      /binding has an admission error/
    );

    assert.deepEqual(editor.read.children(), [paragraph('local')]);
  });

  it('keeps derived editors out of differently named schema rooms', () => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, seedUpdate(articleSchema(1)));

    const initialReady = new TestInitialReadiness(doc);
    const binding = yjs({ doc, initialReady, rootName });
    const editor = createEditor({
      plugins: [binding],
      initialValue: [paragraph('local')],
    });

    initialReady.setReady(true);

    const status = editor.plugin(binding).api.admissionStatus();

    assert.equal(status.state, 'error');
    if (status.state === 'error') {
      assert.match(
        String(status.cause),
        /local derived schema .* cannot join room schema "article"/
      );
    }
    assert.deepEqual(editor.read.children(), [paragraph('local')]);
  });

  it('diagnoses changed semantics without a schema version bump', () => {
    const doc = new Y.Doc();

    Y.applyUpdate(doc, seedUpdate(articleSchema(1)));

    const initialReady = new TestInitialReadiness(doc);
    const binding = yjs({ doc, initialReady, rootName });

    const editor = createEditor({
      plugins: [articleSchema(1, true), binding],
      initialValue: [paragraph('local')],
    });

    initialReady.setReady(true);

    const status = editor.plugin(binding).api.admissionStatus();

    assert.equal(status.state, 'error');
    if (status.state === 'error') {
      assert.match(
        String(status.cause),
        /semantics changed without a version bump/
      );
    }
  });

  it('observes schema metadata before flushing remote content', () => {
    const doc = new Y.Doc();
    const binding = yjs({ doc, initialReady: true, rootName, seed: true });
    const editor = createEditor({
      plugins: [articleSchema(1), binding],
      initialValue: [paragraph('local')],
    });
    const nextIdentity = createEditor({
      plugins: [articleSchema(2)],
      initialValue: [paragraph('unused')],
    }).read.schema.identity();
    const root = doc.get(rootName, Y.XmlElement);
    const metadata = doc.getMap(getYjsSchemaMetadataName(rootName));

    assert.ok(nextIdentity);
    doc.transact(() => {
      metadata.set('current', createYjsSchemaEnvelope(nextIdentity));
      root.delete(0, root.length);
      root.insert(0, [createYjsNode(paragraph('blocked'))]);
    });

    const status = editor.plugin(binding).api.admissionStatus();

    assert.equal(status.state, 'error');
    if (status.state === 'error') {
      assert.match(String(status.cause), /local version 1, room version 2/);
    }
    assert.deepEqual(editor.read.children(), [paragraph('local')]);
  });

  it('rejects local schema reconfiguration against a claimed room', () => {
    const slot = definePluginSlot('article-schema');
    const doc = new Y.Doc();
    const editor = createEditor({
      plugins: [
        slot.of(articleSchema(1)),
        yjs({ doc, initialReady: true, rootName, seed: true }),
      ],
      initialValue: [paragraph('local')],
    });
    const identity = editor.read.schema.identity();

    assert.throws(
      () => editor.update.plugins.reconfigure(slot, articleSchema(2)),
      /local version 2, room version 1/
    );
    assert.equal(editor.read.schema.identity(), identity);
  });

  it('keeps randomized History, Yjs, live policies, and configuration atomic', () => {
    const calls: string[] = [];
    const slot = definePluginSlot('randomized-policy-schema');
    const doc = new Y.Doc();
    const editor = createEditor({
      plugins: [
        slot.of(policySchema({ calls, label: 'policy-0' })),
        history(),
        yjs({ doc, initialReady: true, rootName, seed: true }),
      ] as const,
      initialValue: [policyParagraph('local', 0)],
    });
    const metadata = doc.getMap(getYjsSchemaMetadataName(rootName));
    const root = doc.get(rootName, Y.XmlElement);
    const actionKinds = [
      'edit',
      'equivalent',
      'add',
      'remove',
      'replace',
      'rollback',
    ] as const;
    let seed = 0x51_c4_3a_7d;
    const nextAction = () => {
      seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;

      return actionKinds[seed % actionKinds.length];
    };
    const actions = [...actionKinds, ...Array.from({ length: 58 }, nextAction)];
    let activePolicy = 'policy-0';
    let commitCount = 0;
    let expectedPayloadRevision = 0;
    let expectedText = 'local';
    let policyRevision = 0;

    editor.subscribeCommit(() => {
      commitCount += 1;
    });

    const assertActivePolicy = () => {
      const before = calls.length;
      const activeSchema: EditorStateSchemaApi = editor.read.schema;

      activeSchema.assertFragment([
        policyParagraph(expectedText, expectedPayloadRevision),
      ]);

      const validationCalls = calls.slice(before);

      assert.ok(validationCalls.length > 0);
      assert.equal(
        validationCalls.every((label) => label === activePolicy),
        true
      );
    };
    const snapshot = () => ({
      commits: commitCount,
      history: History.toJSON(editor),
      identity: editor.read.schema.identity(),
      metadata: structuredClone(metadata.get('current')),
      room: root.toJSON(),
      value: structuredClone(editor.read.value()),
    });
    const assertSnapshot = (before: ReturnType<typeof snapshot>) => {
      assert.deepEqual(snapshot(), before);
      assertActivePolicy();
    };

    for (const [index, action] of actions.entries()) {
      if (action === 'edit') {
        const text = String.fromCharCode(97 + (index % 26));

        editor.update((tx) => {
          tx.history.newBatch();
          tx.text.insert(text, {
            at: { offset: expectedText.length, path: [0, 0] },
          });
        });
        expectedText += text;
      } else if (action === 'equivalent') {
        const historyBefore = editor.read.history();
        const identityBefore = editor.read.schema.identity();

        policyRevision += 1;
        activePolicy = `policy-${policyRevision}`;
        expectedPayloadRevision += 1;
        editor.update((tx) => {
          tx.history.newBatch();
          tx.plugins.reconfigure(
            slot,
            policySchema({ calls, label: activePolicy })
          );
          tx.nodes.set(
            { payload: { revision: expectedPayloadRevision } },
            { at: [0] }
          );
        });

        assert.deepEqual(editor.read.schema.identity(), identityBefore);
        assert.ok(
          editor.read.history().undos.length >= historyBefore.undos.length
        );
        assertActivePolicy();
      } else {
        const before = snapshot();

        assert.throws(
          () =>
            editor.update((tx) => {
              tx.history.newBatch();
              tx.text.insert('x', {
                at: { offset: expectedText.length, path: [0, 0] },
              });

              if (action === 'rollback') {
                throw new Error('generated configuration rollback');
              }

              tx.plugins.reconfigure(
                slot,
                policySchema({
                  calls,
                  label: `rejected-${action}-${index}`,
                  mode: action,
                }),
                action === 'remove'
                  ? {
                      migrate: ({ document, next }) =>
                        next.fitDocument({
                          ...document,
                          children: document.children.map((node) =>
                            ElementApi.isElement(node)
                              ? { children: node.children, type: 'paragraph' }
                              : node
                          ),
                        }),
                    }
                  : undefined
              );
            }),
          action === 'rollback'
            ? /generated configuration rollback/
            : /semantics changed without a version bump/
        );
        assertSnapshot(before);
      }

      assert.equal(editor.read.text.string([]), expectedText);
      assert.deepEqual(editor.read.children()[0]?.payload, {
        revision: expectedPayloadRevision,
      });
      assert.deepEqual(metadata.get('current'), {
        format: 2,
        identity: editor.read.schema.identity(),
      });
      assert.equal(root.length, 1);
    }

    const serialized = JSON.stringify({
      history: History.toJSON(editor),
      room: root.toJSON(),
    });

    assert.doesNotMatch(
      serialized,
      /(?:policy-\d|rejected-(?:add|remove|replace))/
    );

    const localCalls: string[] = [];
    const localSlot = definePluginSlot('randomized-policy-local-schema');
    const local = createEditor({
      plugins: [
        localSlot.of(policySchema({ calls: localCalls, label: 'local-1' })),
        history(),
      ] as const,
      initialValue: [policyParagraph('local', 0)],
    });

    local.update((tx) => {
      tx.history.newBatch();
      tx.text.insert('!', { at: { offset: 5, path: [0, 0] } });
    });
    assert.equal(local.read.history().undos.length, 1);

    local.update.plugins.reconfigure(
      localSlot,
      policySchema({
        calls: localCalls,
        label: 'local-2',
        mode: 'replace',
        version: 2,
      })
    );

    assert.deepEqual(local.read.history().undos, []);
    assert.deepEqual(local.read.history().redos, []);
    assert.deepEqual(local.read.history().schema, local.read.schema.identity());
  });
});
