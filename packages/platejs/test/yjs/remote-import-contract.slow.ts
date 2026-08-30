import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import {
  createEditor,
  createEditorView,
  type Descendant,
  DocumentChange,
  defineEffect,
  defineEditorSchema,
  defineExtension,
  defineStateField,
  defineValueCodec,
  type EditorEffect,
  type Editor as BasePlateEditor,
  type Point,
  PointApi,
  property,
  type Range,
  RangeApi,
  schema,
  target,
  valueCodecs,
} from '../../src/core';
import { setYjsAttribute } from '../../src/yjs/core/attributes';
import { lowerDocumentChangeToYjs } from '../../src/yjs/core/change-bridge';
import {
  createYjsNode,
  getYjsNode,
  insertYjsChild,
  readPliteValueFromYjs,
} from '../../src/yjs/core/document';
import { YjsUpdatePolicy } from '../../src/yjs/core/editor-adapter';
import { yjs } from '../../src/yjs/core/extension';
import {
  clearYjsTrace,
  connectYjsPeerAndSync,
  createSeededYjsHistoryPeers,
  createSeededYjsPeers,
  createYjsTestEditor,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  getYjsTrace,
  paragraph,
  readPeerChildren,
  syncConnectedPeers,
} from './support/collaboration';

type RecordedRemoteImportCommit = {
  readonly documentChanged: boolean;
  readonly replaced: boolean;
  readonly tags: readonly string[];
};

const largeValue = (count = 32): Descendant[] =>
  Array.from({ length: count }, (_, index) =>
    paragraph(`block-${String(index).padStart(3, '0')}`)
  );

const section = (...children: Descendant[]): Descendant => ({
  children,
  tone: 'old',
  type: 'section',
});

const recordRemoteImportCommits = (
  editor: BasePlateEditor
): RecordedRemoteImportCommit[] => {
  const commits: RecordedRemoteImportCommit[] = [];

  editor.install(
    defineExtension('remote-import-commit-recorder', {
      on: {
        commit({ commit }): void {
          if (!commit.tags.includes('remote-yjs-import')) {
            return;
          }

          commits.push({
            documentChanged: commit.changed.has('document'),
            replaced: commit.changed.has('replace'),
            tags: [...commit.tags],
          });
        },
      },
    })
  );

  return commits;
};

describe('platejs/yjs remote import contract', () => {
  it('transports shared state effects without document changes', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      collab: 'shared',
      initial: () => 'Q2 Plan',
      persist: valueCodecs.string,
    });
    const documentState = defineExtension('shared-document-state', {
      stateFields: [documentTitle],
    });
    const createPeer = (clientId: string, doc = new Y.Doc()) => {
      const editor = createEditor({
        extensions: [documentState] as const,
        initialValue: [paragraph('body')],
      });
      const cleanup = editor.install(
        yjs({ clientId, doc, rootName: 'shared-state' })
      );

      return { cleanup, doc, editor };
    };
    const source = createPeer('source');
    const targetDoc = new Y.Doc();

    Y.applyUpdate(targetDoc, Y.encodeStateAsUpdate(source.doc));

    const innerTarget = createPeer('target', targetDoc);

    Y.applyUpdate(source.doc, Y.encodeStateAsUpdate(innerTarget.doc));

    source.editor.update((tx) => {
      tx.setField(documentTitle, 'Q3 Plan');
    });
    Y.applyUpdate(innerTarget.doc, Y.encodeStateAsUpdate(source.doc));

    assert.equal(innerTarget.editor.read.getField(documentTitle), 'Q3 Plan');
    source.cleanup();
    innerTarget.cleanup();
  });

  it('transports registered domain effects exactly once', () => {
    const increment = defineEffect<number>({
      codec: valueCodecs.number,
      key: 'counter.increment',
      collab: 'shared',
      collabReplay: 'live',
    });
    const counter = defineStateField({
      key: 'counter',
      initial: () => 0,
      reduce: (value, effect) =>
        effect.type === increment ? value + effect.value : value,
    });
    const incrementExtension = defineExtension('counter-increment-effect', {
      effectTypes: [increment],
      stateFields: [counter],
    });
    const createPeer = (clientId: string, doc = new Y.Doc()) => {
      const editor = createEditor({
        extensions: [incrementExtension] as const,
        initialValue: [paragraph('body')],
      });
      const cleanup = editor.install(
        yjs({
          clientId,
          doc,
          rootName: 'shared-domain-effect',
        })
      );

      return { cleanup, doc, editor };
    };
    const source = createPeer('source');
    const targetDoc = new Y.Doc();

    Y.applyUpdate(targetDoc, Y.encodeStateAsUpdate(source.doc));

    const innerTarget2 = createPeer('target', targetDoc);

    Y.applyUpdate(source.doc, Y.encodeStateAsUpdate(innerTarget2.doc));

    source.editor.update((tx) => {
      tx.effects.emit(increment, 2);
    });
    const update = Y.encodeStateAsUpdate(source.doc);

    Y.applyUpdate(innerTarget2.doc, update);
    Y.applyUpdate(innerTarget2.doc, update);

    assert.equal(innerTarget2.editor.read.getField(counter), 2);
    source.cleanup();
    innerTarget2.cleanup();
  });

  it('transports a shared effect without a state reducer', () => {
    const announce = defineEffect<string>({
      codec: valueCodecs.string,
      key: 'announcement.effect-only',
      collab: 'shared',
      collabReplay: 'live',
    });
    const effects = defineExtension('effect-only-announcement', {
      effectTypes: [announce],
    });
    const createPeer = (doc: Y.Doc, record = false) => {
      const received: string[] = [];
      const editor = createEditor({
        extensions: [effects] as const,
        initialValue: [paragraph('body')],
      });
      const cleanupRecorder = record
        ? editor.install(
            defineExtension('effect-only-recorder', {
              on: {
                commit({ commit }) {
                  if (!commit.tags.includes('remote-yjs-import')) return;

                  for (const effect of commit.effects) {
                    if (effect.type === announce) received.push(effect.value);
                  }
                },
              },
            })
          )
        : () => {};
      const cleanupYjs = editor.install(yjs({ doc, rootName: 'effect-only' }));

      return {
        cleanup() {
          cleanupYjs();
          cleanupRecorder();
        },
        doc,
        editor,
        received,
      };
    };
    const source = createPeer(new Y.Doc());
    const targetDoc = new Y.Doc();

    Y.applyUpdate(targetDoc, Y.encodeStateAsUpdate(source.doc));

    const innerTarget3 = createPeer(targetDoc, true);

    Y.applyUpdate(source.doc, Y.encodeStateAsUpdate(innerTarget3.doc));

    source.editor.update((tx) => {
      tx.effects.emit(announce, 'saved');
    });
    Y.applyUpdate(innerTarget3.doc, Y.encodeStateAsUpdate(source.doc));

    assert.deepEqual(innerTarget3.received, ['saved']);
    source.cleanup();
    innerTarget3.cleanup();
  });

  it('preserves effect type identity and deeply frozen values through Yjs', () => {
    type Payload = { nested: { count: number } };
    const nested = defineEffect<Payload>({
      codec: defineValueCodec<Payload>({
        decode: (value) => value as Payload,
        encode: (value) => value,
        version: 1,
      }),
      collab: 'shared',
      collabReplay: 'live',
      key: 'effect-codec-identity.nested',
    });
    const effects = defineExtension('effect-codec-identity', {
      effectTypes: [nested],
    });
    const sourceDoc = new Y.Doc();
    const source = createEditor({
      extensions: [effects] as const,
      initialValue: [paragraph('body')],
    });
    const cleanupSource = source.install(
      yjs({ doc: sourceDoc, rootName: 'effect-codec-identity' })
    );
    const targetDoc = new Y.Doc();

    Y.applyUpdate(targetDoc, Y.encodeStateAsUpdate(sourceDoc));

    const received: Array<EditorEffect<Payload>> = [];
    const innerTarget4 = createEditor({
      extensions: [effects] as const,
      initialValue: [paragraph('body')],
    });
    const cleanupRecorder = innerTarget4.install(
      defineExtension('effect-codec-identity-recorder', {
        on: {
          commit({ commit }) {
            if (!commit.tags.includes('remote-yjs-import')) return;

            for (const effect of commit.effects) {
              if (effect.type === nested) {
                received.push(effect as EditorEffect<Payload>);
              }
            }
          },
        },
      })
    );
    const cleanupTarget = innerTarget4.install(
      yjs({ doc: targetDoc, rootName: 'effect-codec-identity' })
    );
    const input = { nested: { count: 1 } };

    Y.applyUpdate(sourceDoc, Y.encodeStateAsUpdate(targetDoc));
    source.update((tx) => tx.effects.emit(nested, input));
    input.nested.count = 99;
    Y.applyUpdate(targetDoc, Y.encodeStateAsUpdate(sourceDoc));

    const [effect] = received;

    assert.ok(effect);
    assert.equal(effect.type, nested);
    assert.equal(effect.value.nested.count, 1);
    assert.equal(Object.isFrozen(effect.value), true);
    assert.equal(Object.isFrozen(effect.value.nested), true);
    assert.throws(() => {
      effect.value.nested.count = 2;
    }, TypeError);

    cleanupSource();
    cleanupTarget();
    cleanupRecorder();
  });

  it('converges concurrent shared effects exactly once', () => {
    const increment = defineEffect<number>({
      codec: valueCodecs.number,
      key: 'counter.concurrent-increment',
      collab: 'shared',
      collabReplay: 'live',
    });
    const counter = defineStateField({
      key: 'concurrent-counter',
      initial: () => 0,
      reduce: (value, effect) =>
        effect.type === increment ? value + effect.value : value,
    });
    const incrementExtension = defineExtension(
      'concurrent-counter-increment-effect',
      {
        effectTypes: [increment],
        stateFields: [counter],
      }
    );
    const createPeer = (
      clientId: string,
      numericClientId: number,
      seedUpdate?: Uint8Array
    ) => {
      const doc = new Y.Doc();

      doc.clientID = numericClientId;
      if (seedUpdate) {
        Y.applyUpdate(doc, seedUpdate);
      }

      const editor = createEditor({
        extensions: [incrementExtension] as const,
        initialValue: [paragraph('body')],
      });
      const cleanup = editor.install(
        yjs({
          clientId,
          doc,
          rootName: 'concurrent-shared-domain-effect',
        })
      );

      return { cleanup, doc, editor };
    };
    const first = createPeer('first', 101);
    const second = createPeer('second', 202, Y.encodeStateAsUpdate(first.doc));

    Y.applyUpdate(first.doc, Y.encodeStateAsUpdate(second.doc));
    first.editor.update((tx) => {
      tx.effects.emit(increment, 1);
    });
    second.editor.update((tx) => {
      tx.effects.emit(increment, 2);
    });

    const firstUpdate = Y.encodeStateAsUpdate(
      first.doc,
      Y.encodeStateVector(second.doc)
    );
    const secondUpdate = Y.encodeStateAsUpdate(
      second.doc,
      Y.encodeStateVector(first.doc)
    );

    Y.applyUpdate(first.doc, secondUpdate);
    Y.applyUpdate(second.doc, firstUpdate);

    assert.equal(first.editor.read.getField(counter), 3);
    assert.equal(second.editor.read.getField(counter), 3);
    first.cleanup();
    second.cleanup();
  });

  it('blocks unknown effects per source without blocking other sources', () => {
    const effectA = defineEffect<string>({
      codec: valueCodecs.string,
      key: 'source-a.effect',
      collab: 'shared',
      collabReplay: 'live',
    });
    const effectB = defineEffect<string>({
      codec: valueCodecs.string,
      key: 'source-b.effect',
      collab: 'shared',
      collabReplay: 'live',
    });
    const extensionA = defineExtension('source-a-effects', {
      effectTypes: [effectA],
    });
    const extensionB = defineExtension('source-b-effects', {
      effectTypes: [effectB],
    });
    const createSource = (
      doc: Y.Doc,
      extension: typeof extensionA | typeof extensionB,
      rootName: string
    ) => {
      const editor = createEditor({
        extensions: [extension] as const,
        initialValue: [paragraph('body')],
      });
      const cleanup = editor.install(yjs({ doc, rootName }));

      return { cleanup, doc, editor };
    };
    const rootName = 'per-source-effect-order';
    const sourceA = createSource(new Y.Doc(), extensionA, rootName);
    const seed = Y.encodeStateAsUpdate(sourceA.doc);
    const sourceBDoc = new Y.Doc();
    const targetDoc = new Y.Doc();

    Y.applyUpdate(sourceBDoc, seed);
    Y.applyUpdate(targetDoc, seed);

    const sourceB = createSource(sourceBDoc, extensionB, rootName);
    const received: string[] = [];
    const targetEditor = createEditor({
      extensions: [extensionB] as const,
      initialValue: [paragraph('body')],
    });
    const cleanupRecorder = targetEditor.install(
      defineExtension('per-source-effect-recorder', {
        on: {
          commit({ commit }) {
            if (!commit.tags.includes('remote-yjs-import')) return;

            received.push(
              ...commit.effects.map((effect) => String(effect.value))
            );
          },
        },
      })
    );
    const cleanupTarget = targetEditor.install(
      yjs({ doc: targetDoc, rootName })
    );

    Y.applyUpdate(sourceA.doc, Y.encodeStateAsUpdate(targetDoc));
    Y.applyUpdate(sourceB.doc, Y.encodeStateAsUpdate(targetDoc));
    sourceA.editor.update((tx) => {
      tx.effects.emit(effectA, 'a1');
      tx.effects.emit(effectA, 'a2');
    });
    sourceB.editor.update((tx) => {
      tx.effects.emit(effectB, 'b1');
    });
    Y.applyUpdate(targetDoc, Y.encodeStateAsUpdate(sourceA.doc));
    Y.applyUpdate(targetDoc, Y.encodeStateAsUpdate(sourceB.doc));

    assert.deepEqual(received, ['b1']);

    const cleanupA = targetEditor.install(extensionA);

    assert.deepEqual(received, ['b1', 'a1', 'a2']);

    const cleanupNoop = targetEditor.install(
      defineExtension('per-source-retry-noop', {})
    );

    assert.deepEqual(received, ['b1', 'a1', 'a2']);

    cleanupNoop();
    cleanupA();
    cleanupTarget();
    cleanupRecorder();
    sourceA.cleanup();
    sourceB.cleanup();
  });

  it('imports a document change and its shared effect atomically', () => {
    const increment = defineEffect<number>({
      codec: valueCodecs.number,
      key: 'counter.atomic-increment',
      collab: 'shared',
      collabReplay: 'live',
    });
    const counter = defineStateField({
      key: 'atomic-counter',
      initial: () => 0,
      reduce: (value, effect) =>
        effect.type === increment ? value + effect.value : value,
    });
    const incrementExtension = defineExtension(
      'atomic-counter-increment-effect',
      {
        effectTypes: [increment],
        stateFields: [counter],
      }
    );
    const createPeer = (doc: Y.Doc) => {
      const editor = createEditor({
        extensions: [incrementExtension] as const,
        initialValue: [paragraph('body')],
      });
      const remoteCommits: Array<{
        documentChanged: boolean;
        effectKeys: string[];
      }> = [];
      const cleanupRecorder = editor.install(
        defineExtension('atomic-shared-effect-recorder', {
          on: {
            commit({ commit }): void {
              if (!commit.tags.includes('remote-yjs-import')) return;

              remoteCommits.push({
                documentChanged: commit.changed.has('document'),
                effectKeys: commit.effects.map((effect) => effect.type.key),
              });
            },
          },
        })
      );
      const cleanupYjs = editor.install(
        yjs({
          doc,
          rootName: 'atomic-shared-domain-effect',
        })
      );

      remoteCommits.length = 0;

      return {
        cleanup() {
          cleanupYjs();
          cleanupRecorder();
        },
        doc,
        editor,
        remoteCommits,
      };
    };
    const source = createPeer(new Y.Doc());
    const targetDoc = new Y.Doc();

    Y.applyUpdate(targetDoc, Y.encodeStateAsUpdate(source.doc));

    const innerTarget5 = createPeer(targetDoc);

    Y.applyUpdate(source.doc, Y.encodeStateAsUpdate(innerTarget5.doc));
    source.editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      tx.effects.emit(increment, 2);
    });
    Y.applyUpdate(innerTarget5.doc, Y.encodeStateAsUpdate(source.doc));

    assert.equal(innerTarget5.editor.read.text.string([]), 'body!');
    assert.equal(innerTarget5.editor.read.getField(counter), 2);
    assert.deepEqual(innerTarget5.remoteCommits, [
      {
        documentChanged: true,
        effectKeys: [increment.key],
      },
    ]);
    source.cleanup();
    innerTarget5.cleanup();
  });

  it('retries shared effects after the matching codec is installed', () => {
    const incrementV1 = defineEffect<number>({
      codec: valueCodecs.number,
      key: 'counter.versioned-increment',
      collab: 'shared',
      collabReplay: 'live',
    });
    const incrementV2 = defineEffect<number>({
      codec: defineValueCodec({
        decode(value) {
          if (typeof value !== 'number') {
            throw new Error('Expected a numeric increment.');
          }

          return value;
        },
        encode: (value) => value,
        version: 2,
      }),
      key: incrementV1.key,
      collab: 'shared',
      collabReplay: 'live',
    });
    const createCounter = (key: string, increment: typeof incrementV1) =>
      defineStateField({
        key,
        initial: () => 0,
        reduce: (value, effect) =>
          effect.type === increment ? value + effect.value : value,
      });
    const sourceCounter = createCounter('source-counter', incrementV2);
    const sourceEffectExtension = defineExtension('source-versioned-effect', {
      effectTypes: [incrementV2],
    });
    const sourceDoc = new Y.Doc();
    const sourceEditor = createEditor({
      extensions: [sourceCounter, sourceEffectExtension] as const,
      initialValue: [paragraph('body')],
    });
    const sourceCleanup = sourceEditor.install(
      yjs({
        doc: sourceDoc,
        rootName: 'versioned-shared-effects',
      })
    );
    const targetDoc = new Y.Doc();

    Y.applyUpdate(targetDoc, Y.encodeStateAsUpdate(sourceDoc));

    const oldCounter = createCounter('old-counter', incrementV1);
    const oldEffectExtension = defineExtension('old-versioned-effect', {
      effectTypes: [incrementV1],
    });
    const oldEditor = createEditor({
      extensions: [oldCounter, oldEffectExtension] as const,
      initialValue: [paragraph('body')],
    });
    const oldCleanup = oldEditor.install(
      yjs({
        doc: targetDoc,
        rootName: 'versioned-shared-effects',
      })
    );

    Y.applyUpdate(sourceDoc, Y.encodeStateAsUpdate(targetDoc));
    sourceEditor.update((tx) => {
      tx.effects.emit(incrementV2, 1);
    });
    assert.doesNotThrow(() => {
      Y.applyUpdate(targetDoc, Y.encodeStateAsUpdate(sourceDoc));
    });
    assert.equal(oldEditor.read.getField(oldCounter), 0);
    oldCleanup();

    const upgradedCounter = createCounter('upgraded-counter', incrementV2);
    const upgradedEffectExtension = defineExtension(
      'upgraded-versioned-effect',
      {
        effectTypes: [incrementV2],
      }
    );
    const upgradedEditor = createEditor({
      extensions: [upgradedCounter, upgradedEffectExtension] as const,
      initialValue: [paragraph('body')],
    });
    const upgradedCleanup = upgradedEditor.install(
      yjs({
        doc: targetDoc,
        rootName: 'versioned-shared-effects',
      })
    );

    assert.equal(upgradedEditor.read.getField(upgradedCounter), 1);
    sourceCleanup();
    upgradedCleanup();
  });

  it('maps shared effect positions through concurrent Yjs document changes', () => {
    type RelativeTargets = { point: Point; range: Range };

    const targetsCodec = defineValueCodec<RelativeTargets>({
      decode(value) {
        if (
          typeof value !== 'object' ||
          value === null ||
          !PointApi.isPoint((value as RelativeTargets).point) ||
          !RangeApi.isRange((value as RelativeTargets).range)
        ) {
          throw new Error('Expected Plite point and range targets.');
        }

        return value as RelativeTargets;
      },
      encode: (value) => value,
      version: 1,
    });
    const focus = defineEffect<RelativeTargets>({
      codec: targetsCodec,
      collab: 'shared',
      collabReplay: 'live',
      collabTransport: {
        decode(value, context) {
          if (typeof value !== 'object' || value === null) return undefined;

          const point = context.point((value as Record<string, unknown>).point);
          const range = context.range((value as Record<string, unknown>).range);

          return point && range ? { point, range } : undefined;
        },
        encode: (value, context) => ({
          point: context.point(value.point),
          range: context.range(value.range),
        }),
      },
      history: 'skip',
      key: 'collab.focus-targets',
    });
    const receivedFocus = defineStateField<RelativeTargets | null>({
      key: 'received-focus-targets',
      initial: null,
      reduce: (value, effect) => (effect.type === focus ? effect.value : value),
    });
    const focusExtension = defineExtension('collab-focus-point-effect', {
      effectTypes: [focus],
      stateFields: [receivedFocus],
    });
    const createPeer = (doc: Y.Doc) => {
      const editor = createEditor({
        extensions: [focusExtension] as const,
        initialValue: [paragraph('body')],
      });
      const cleanup = editor.install(
        yjs({ doc, rootName: 'relative-effect-point' })
      );

      return { cleanup, doc, editor };
    };
    const source = createPeer(new Y.Doc());
    const targetDoc = new Y.Doc();

    Y.applyUpdate(targetDoc, Y.encodeStateAsUpdate(source.doc));

    const innerTarget6 = createPeer(targetDoc);

    Y.applyUpdate(source.doc, Y.encodeStateAsUpdate(innerTarget6.doc));
    source.editor.update((tx) => {
      tx.effects.emit(focus, {
        point: { offset: 4, path: [0, 0] },
        range: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
      });
    });
    innerTarget6.editor.update((tx) => {
      tx.text.insert('remote-', { at: { offset: 0, path: [0, 0] } });
    });
    Y.applyUpdate(innerTarget6.doc, Y.encodeStateAsUpdate(source.doc));

    assert.deepEqual(innerTarget6.editor.read.getField(receivedFocus), {
      point: { offset: 11, path: [0, 0] },
      range: {
        anchor: { offset: 8, path: [0, 0] },
        focus: { offset: 11, path: [0, 0] },
      },
    });
    source.cleanup();
    innerTarget6.cleanup();
  });

  it('exports one deeply frozen remote policy', () => {
    assert.equal(Object.isFrozen(YjsUpdatePolicy), true);
    assert.equal(Object.isFrozen(YjsUpdatePolicy.remote), true);
    assert.equal(Object.isFrozen(YjsUpdatePolicy.remote.tags), true);
    assert.deepEqual(YjsUpdatePolicy.remote.tags, [
      'collaboration',
      'remote-yjs-import',
      'history-skip',
      'skip-dom-selection',
      'skip-selection-focus',
      'skip-scroll-into-view',
    ]);
  });

  it('imports remote Yjs updates through one canonical incremental commit', () => {
    const [source, innerTarget7] = createSeededYjsPeers({
      children: largeValue(),
      clientIds: ['source', 'target'],
      numericClientIds: { source: 101, target: 202 },
    });

    assert.ok(source);
    assert.ok(innerTarget7);

    const remoteImportCommits = recordRemoteImportCommits(innerTarget7.editor);

    clearYjsTrace(innerTarget7);
    source.editor.update.text.insert('!', {
      at: { path: [0, 0], offset: 'block-000'.length },
    });
    syncConnectedPeers([source, innerTarget7]);

    assert.equal(getPeerTopLevelTexts(innerTarget7)[0], 'block-000!');
    assert.deepEqual(remoteImportCommits, [
      {
        documentChanged: true,
        replaced: false,
        tags: YjsUpdatePolicy.remote.tags,
      },
    ]);
    assert.deepEqual(getYjsTrace(innerTarget7), [
      {
        changedChildren: 1,
        changedRanges: 1,
        importKind: 'event-change',
        mode: 'remote-reconcile',
        readTopLevelNodes: 1,
      },
    ]);
  });

  it('lowers canonical changes without replacing Yjs siblings', () => {
    const [peer] = createSeededYjsPeers({
      children: [paragraph('one'), paragraph('two')],
      clientIds: ['peer'],
    });

    assert.ok(peer);

    const root = peer.editor.read.yjs.root();
    const sibling = root.toArray()[1];
    const change = DocumentChange.between(
      { children: [paragraph('one'), paragraph('two')] },
      { children: [paragraph('one!'), paragraph('two')] }
    );

    clearYjsTrace(peer);
    peer.editor.update((tx) => {
      tx.changes.apply(change);
    });

    assert.equal(root.toArray()[1], sibling);
    assert.deepEqual(getPeerTopLevelTexts(peer), ['one!', 'two']);
    assert.deepEqual(getYjsTrace(peer), [
      {
        canonicalStrategy: 'compatible',
        changedChildren: 0,
        changedRanges: 1,
        mode: 'canonical-change',
        tokenLengthNodes: 2,
      },
    ]);
  });

  it('lowers canonical property changes without replacing Yjs nodes', () => {
    const before = [
      {
        align: 'left',
        children: [{ bold: false, text: 'one' }],
        type: 'paragraph',
      },
      paragraph('two'),
    ] satisfies Descendant[];
    const after = [
      {
        align: 'center',
        children: [{ bold: true, text: 'one' }],
        type: 'paragraph',
      },
      paragraph('two'),
    ] satisfies Descendant[];
    const [peer] = createSeededYjsPeers({
      children: before,
      clientIds: ['peer'],
    });

    assert.ok(peer);

    const root = peer.editor.read.yjs.root();
    const element = getYjsNode(root, [0]);
    const text = getYjsNode(root, [0, 0]);
    const sibling = getYjsNode(root, [1]);
    const change = DocumentChange.between(
      { children: before },
      { children: after }
    );

    peer.editor.update((tx) => {
      tx.changes.apply(change);
    });

    assert.equal(getYjsNode(root, [0]), element);
    assert.equal(getYjsNode(root, [0, 0]), text);
    assert.equal(getYjsNode(root, [1]), sibling);
    assert.deepEqual(readPliteValueFromYjs(root), after);
  });

  it('converges concurrent schema set properties as per-value Yjs changes', () => {
    const rootName = 'set-valued-property-convergence';
    const SetValuedSchema = defineEditorSchema('schema:set-valued-yjs-schema', {
      elements: {
        paragraph: { content: schema.content.text({ min: 1 }) },
        section: { content: schema.content.type('paragraph') },
      },
      id: 'set-valued-yjs-schema',
      properties: [
        schema.elementProperty('labels', property.set(property.string()), {
          target: target.and(
            target.type('paragraph'),
            target.parent(target.type('section')),
            target.root()
          ),
        }),
        schema.textProperty('commentIds', property.set(property.string()), {
          target: target.and(
            target.type('paragraph'),
            target.parent(target.type('section')),
            target.root()
          ),
        }),
      ],
      root: schema.content.type('section'),
      unknown: 'reject',
      version: 1,
    });
    const createPeer = (doc: Y.Doc) => {
      const localChanges: Array<ReturnType<DocumentChange['toJSON']>> = [];
      const remoteChanges: Array<ReturnType<DocumentChange['toJSON']>> = [];
      const editor = createEditor({
        extensions: [SetValuedSchema],
        initialSelection: {
          kind: 'text',
          anchor: { path: [0, 0, 0], offset: 0 },
          focus: { path: [0, 0, 0], offset: 4 },
        },
        initialValue: [
          {
            children: [
              {
                children: [{ commentIds: ['base', 'drop'], text: 'word' }],
                labels: ['base', 'drop'],
                type: 'paragraph',
              },
            ],
            type: 'section',
          },
        ],
      });
      const cleanupRecorder = editor.install(
        defineExtension('set-valued-yjs-commit-recorder', {
          on: {
            commit({ commit }) {
              if (!commit.changed.has('document')) return;

              (commit.tags.includes('remote-yjs-import')
                ? remoteChanges
                : localChanges
              ).push(commit.changes.toJSON());
            },
          },
        })
      );
      const cleanupYjs = editor.install(yjs({ doc, rootName }));

      localChanges.length = 0;
      remoteChanges.length = 0;

      return {
        cleanup() {
          cleanupYjs();
          cleanupRecorder();
        },
        doc,
        editor,
        localChanges,
        remoteChanges,
      };
    };
    const operations = (change: ReturnType<DocumentChange['toJSON']>) =>
      change.primary?.flatMap(
        (innerSection) => innerSection.properties?.operations ?? []
      ) ?? [];
    const left = createPeer(new Y.Doc());
    const rightDoc = new Y.Doc();

    Y.applyUpdate(rightDoc, Y.encodeStateAsUpdate(left.doc));

    const right = createPeer(rightDoc);

    Y.applyUpdate(left.doc, Y.encodeStateAsUpdate(right.doc));
    left.localChanges.length = 0;
    left.remoteChanges.length = 0;
    right.localChanges.length = 0;
    right.remoteChanges.length = 0;

    left.editor.update((tx) => {
      tx.nodes.set({ labels: ['base', 'drop', 'left'] }, { at: [0, 0] });
      tx.nodes.set({ commentIds: ['base', 'drop', 'left'] }, { at: [0, 0, 0] });
    });
    right.editor.update((tx) => {
      tx.nodes.set({ labels: ['base', 'right'] }, { at: [0, 0] });
      tx.nodes.set({ commentIds: ['base', 'right'] }, { at: [0, 0, 0] });
    });

    assert.deepEqual(operations(left.localChanges.at(-1)!), [
      { key: 'labels', type: 'add', values: ['left'] },
      { key: 'commentIds', type: 'add', values: ['left'] },
    ]);
    assert.deepEqual(operations(right.localChanges.at(-1)!), [
      { key: 'labels', type: 'remove', values: ['drop'] },
      { key: 'labels', type: 'add', values: ['right'] },
      { key: 'commentIds', type: 'remove', values: ['drop'] },
      { key: 'commentIds', type: 'add', values: ['right'] },
    ]);

    const before = {
      children: [
        {
          children: [
            {
              children: [{ commentIds: ['base', 'drop'], text: 'word' }],
              labels: ['base', 'drop'],
              type: 'paragraph',
            },
          ],
          type: 'section',
        },
      ],
    };
    const leftChange = DocumentChange.fromJSON(left.localChanges.at(-1)!);
    const rightChange = DocumentChange.fromJSON(right.localChanges.at(-1)!);
    const leftInverse = leftChange.invert(before);
    const rightInverse = rightChange.invert(before);

    assert.deepEqual(leftInverse.apply(leftChange.apply(before)), before);
    assert.deepEqual(rightInverse.apply(rightChange.apply(before)), before);

    const transformed = DocumentChange.transform(
      leftChange,
      rightChange,
      before
    );
    const viaLeft = transformed.b.apply(leftChange.apply(before));
    const viaRight = transformed.a.apply(rightChange.apply(before));

    const leftUpdate = Y.encodeStateAsUpdate(
      left.doc,
      Y.encodeStateVector(right.doc)
    );
    const rightUpdate = Y.encodeStateAsUpdate(
      right.doc,
      Y.encodeStateVector(left.doc)
    );

    Y.applyUpdate(left.doc, rightUpdate);
    Y.applyUpdate(right.doc, leftUpdate);

    const expected = [
      {
        children: [
          {
            children: [{ commentIds: ['base', 'left', 'right'], text: 'word' }],
            labels: ['base', 'left', 'right'],
            type: 'paragraph',
          },
        ],
        type: 'section',
      },
    ];

    assert.deepEqual(viaLeft, { children: expected });
    assert.deepEqual(viaRight, { children: expected });

    assert.deepEqual(left.editor.read.children(), expected);
    assert.deepEqual(right.editor.read.children(), expected);
    assert.deepEqual(operations(left.remoteChanges.at(-1)!), [
      { key: 'labels', type: 'remove', values: ['drop'] },
      { key: 'labels', type: 'add', values: ['right'] },
      { key: 'commentIds', type: 'remove', values: ['drop'] },
      { key: 'commentIds', type: 'add', values: ['right'] },
    ]);
    assert.deepEqual(operations(right.remoteChanges.at(-1)!), [
      { key: 'labels', type: 'add', values: ['left'] },
      { key: 'commentIds', type: 'add', values: ['left'] },
    ]);

    const leftRemoteCommitCount = left.remoteChanges.length;
    const rightRemoteCommitCount = right.remoteChanges.length;

    Y.applyUpdate(left.doc, rightUpdate);
    Y.applyUpdate(right.doc, leftUpdate);

    assert.equal(left.remoteChanges.length, leftRemoteCommitCount);
    assert.equal(right.remoteChanges.length, rightRemoteCommitCount);
    assert.deepEqual(left.editor.read.children(), expected);
    assert.deepEqual(right.editor.read.children(), expected);
    left.cleanup();
    right.cleanup();
  });

  it('rejects undeclared remote element properties without publishing a partial editor commit', () => {
    const rootName = 'closed-schema-ingress';
    const ClosedSchema = defineEditorSchema('schema:closed-yjs-ingress', {
      elements: {
        cell: {
          content: schema.content.text({ min: 1 }),
          properties: {
            colSpan: property.number(),
            variant: property.string(),
          },
        },
      },
      id: 'closed-yjs-ingress',
      root: schema.content.group('block', { min: 1 }),
      unknown: 'reject',
      version: 1,
    });
    const targetDoc = new Y.Doc();
    const editor = createEditor({
      extensions: [ClosedSchema],
      initialValue: [{ children: [{ text: 'safe' }], type: 'cell' }],
    });
    const commits = recordRemoteImportCommits(editor);
    const cleanup = editor.install(
      yjs({
        clientId: 'closed-schema-target',
        doc: targetDoc,
        rootName,
      })
    );
    const sourceDoc = new Y.Doc();

    Y.applyUpdate(sourceDoc, Y.encodeStateAsUpdate(targetDoc));

    const sourceRoot = sourceDoc.getXmlElement(rootName);
    const sourceElement = getYjsNode(sourceRoot, [0]);

    assert.ok(sourceElement instanceof Y.XmlElement);

    const beforeDeclaredProperties = Y.encodeStateVector(sourceDoc);

    sourceDoc.transact(() => {
      setYjsAttribute(sourceElement, 'variant', 'wide');
      setYjsAttribute(sourceElement, 'colSpan', 2);
    });
    Y.applyUpdate(
      targetDoc,
      Y.encodeStateAsUpdate(sourceDoc, beforeDeclaredProperties)
    );

    assert.deepEqual(editor.read.children(), [
      {
        children: [{ text: 'safe' }],
        colSpan: 2,
        type: 'cell',
        variant: 'wide',
      },
    ]);
    assert.equal(commits.length, 1);

    const beforeUndeclaredProperty = Y.encodeStateVector(sourceDoc);

    sourceDoc.transact(() => {
      setYjsAttribute(sourceElement, 'mystery', true);
    });

    assert.throws(
      () =>
        Y.applyUpdate(
          targetDoc,
          Y.encodeStateAsUpdate(sourceDoc, beforeUndeclaredProperty)
        ),
      /unknown element property "mystery" in closed editor schema/i
    );
    assert.deepEqual(editor.read.children(), [
      {
        children: [{ text: 'safe' }],
        colSpan: 2,
        type: 'cell',
        variant: 'wide',
      },
    ]);
    assert.equal(commits.length, 1);

    cleanup();
  });

  it('fails closed when a canonical change does not match the Yjs base', () => {
    const doc = new Y.Doc();
    const root = doc.getXmlElement('content');
    const remote = paragraph('remote');
    const local = paragraph('local');

    insertYjsChild(root, root, 0, createYjsNode(remote));
    const change = DocumentChange.between(
      { children: [] },
      { children: [local] }
    );

    assert.throws(() =>
      lowerDocumentChangeToYjs({
        base: [],
        change,
        expected: [local],
        knownYjsValue: [],
        root: 'main',
        yRoot: root,
      })
    );
    assert.deepEqual(readPliteValueFromYjs(root), [remote]);
  });

  it('lowers against a canonically equivalent split Yjs text base', () => {
    const doc = new Y.Doc();
    const root = doc.getXmlElement('content');
    const canonicalBase = [paragraph('alpha'), paragraph('')];
    const expected = [paragraph('alpha')];

    insertYjsChild(
      root,
      root,
      0,
      createYjsNode({
        children: [{ text: 'al' }, { text: 'pha' }],
        type: 'paragraph',
      })
    );
    insertYjsChild(root, root, 1, createYjsNode(paragraph('')));

    const change = DocumentChange.between(
      { children: canonicalBase },
      { children: expected }
    );

    assert.doesNotThrow(() =>
      lowerDocumentChangeToYjs({
        base: canonicalBase,
        canonicalize: (children) =>
          children.map((node) =>
            'children' in node && node.type === 'paragraph'
              ? paragraph(
                  node.children
                    .map((child) => ('text' in child ? child.text : ''))
                    .join('')
                )
              : node
          ),
        change,
        expected,
        knownYjsValue: canonicalBase,
        root: 'main',
        yRoot: root,
      })
    );
    assert.deepEqual(readPliteValueFromYjs(root), expected);
  });

  it('keeps remote imports out of installed History and preserves local undo', () => {
    const [source, innerTarget8] = createSeededYjsHistoryPeers({
      children: [paragraph('one')],
      clientIds: ['source', 'target'],
    });

    assert.ok(source);
    assert.ok(innerTarget8);

    source.editor.update.text.insert('!', {
      at: { path: [0, 0], offset: 3 },
    });
    syncConnectedPeers([source, innerTarget8]);

    assert.equal(getPeerTopLevelTexts(innerTarget8)[0], 'one!');
    assert.equal(
      innerTarget8.editor.read((state) => state.history.undos().length),
      0
    );

    innerTarget8.editor.update.text.insert('?', {
      at: { path: [0, 0], offset: 4 },
    });
    assert.equal(
      innerTarget8.editor.read((state) => state.history.undos().length),
      1
    );

    innerTarget8.editor.update((tx) => {
      tx.history.undo();
    });
    assert.equal(getPeerTopLevelTexts(innerTarget8)[0], 'one!');
  });

  it('converges a large remote document after distributed text edits', () => {
    const blockCount = 256;
    const middleIndex = Math.floor(blockCount / 2);
    const [source, innerTarget9] = createSeededYjsPeers({
      children: largeValue(blockCount),
      clientIds: ['source', 'target'],
      numericClientIds: { source: 101, target: 202 },
    });

    assert.ok(source);
    assert.ok(innerTarget9);

    clearYjsTrace(innerTarget9);
    source.editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 'block-000'.length },
      });
      tx.text.insert('?', {
        at: {
          path: [middleIndex, 0],
          offset: `block-${String(middleIndex).padStart(3, '0')}`.length,
        },
      });
      tx.text.insert('.', {
        at: {
          path: [blockCount - 1, 0],
          offset: `block-${String(blockCount - 1).padStart(3, '0')}`.length,
        },
      });
    });
    syncConnectedPeers([source, innerTarget9]);

    const targetTexts = getPeerTopLevelTexts(innerTarget9);

    assert.equal(targetTexts.length, blockCount);
    assert.equal(targetTexts[0], 'block-000!');
    assert.equal(targetTexts[middleIndex], `block-${middleIndex}?`);
    assert.equal(targetTexts[blockCount - 1], `block-${blockCount - 1}.`);
    assert.deepEqual(getPeerTopLevelTexts(source), targetTexts);
    assert.deepEqual(getYjsTrace(innerTarget9), [
      {
        changedChildren: 3,
        changedRanges: 3,
        importKind: 'event-change',
        mode: 'remote-reconcile',
        readTopLevelNodes: 3,
      },
    ]);
  });

  it('compiles text, property, nested, insert, and delete events without a root snapshot', () => {
    const children = [
      section(paragraph('alpha'), paragraph('beta')),
      paragraph('tail'),
      paragraph('remove'),
    ];
    const [source, innerTarget10] = createSeededYjsPeers({
      children,
      clientIds: ['source', 'target'],
    });

    assert.ok(source);
    assert.ok(innerTarget10);

    const root = source.editor.read.yjs.root();
    const sectionNode = getYjsNode(root, [0]);
    const text = getYjsNode(root, [0, 0, 0]);

    assert.ok(sectionNode instanceof Y.XmlElement);
    assert.ok(text instanceof Y.XmlText);

    clearYjsTrace(innerTarget10);
    source.doc.transact(() => {
      text.delete(0, 1);
      text.insert(text.length, '!');
      text.format(0, text.length, { bold: true });
      sectionNode.setAttribute('tone', 'new');
      sectionNode.delete(1, 1);
      sectionNode.insert(1, [createYjsNode(paragraph('replacement'))]);
      root.insert(1, [createYjsNode(paragraph('middle'))]);
      root.delete(3, 1);
    });
    syncConnectedPeers([source, innerTarget10]);

    assert.deepEqual(readPeerChildren(innerTarget10), [
      {
        children: [
          {
            children: [{ bold: true, text: 'lpha!' }],
            type: 'paragraph',
          },
          paragraph('replacement'),
        ],
        tone: 'new',
        type: 'section',
      },
      paragraph('middle'),
      paragraph('tail'),
    ]);
    assert.deepEqual(getYjsTrace(innerTarget10), [
      {
        changedChildren: 3,
        changedRanges: 3,
        importKind: 'event-change',
        mode: 'remote-reconcile',
        readTopLevelNodes: 2,
      },
    ]);
  });

  it('normalizes only the parent touched by an empty-text event', () => {
    const [peer] = createSeededYjsPeers({
      children: largeValue(128),
      clientIds: ['peer'],
    });

    assert.ok(peer);

    const root = peer.editor.read.yjs.root();
    const paragraphNode = getYjsNode(root, [96]);

    assert.ok(paragraphNode instanceof Y.XmlElement);

    clearYjsTrace(peer);
    peer.doc.transact(() => {
      paragraphNode.insert(1, [new Y.XmlText()]);
    });

    assert.equal(paragraphNode.toArray().length, 1);
    assert.equal(getPeerTopLevelTexts(peer)[96], 'block-096');
    assert.deepEqual(getYjsTrace(peer), [
      {
        changedChildren: 0,
        changedRanges: 0,
        importKind: 'event-change',
        mode: 'remote-reconcile',
        readTopLevelNodes: 1,
      },
    ]);
  });

  it('canonicalizes one event-read block through the installed schema', () => {
    const [peer] = createSeededYjsPeers({
      children: [paragraph('body'), paragraph('untouched')],
      clientIds: ['peer'],
    });

    assert.ok(peer);

    const root = peer.editor.read.yjs.root();
    const paragraphNode = getYjsNode(root, [0]);

    assert.ok(paragraphNode instanceof Y.XmlElement);

    clearYjsTrace(peer);
    peer.doc.transact(() => {
      paragraphNode.insert(1, [createYjsNode({ text: '!' })]);
    });

    assert.deepEqual(readPeerChildren(peer), [
      paragraph('body!'),
      paragraph('untouched'),
    ]);
    assert.deepEqual(getYjsTrace(peer), [
      {
        changedChildren: 1,
        changedRanges: 1,
        importKind: 'event-change',
        mode: 'remote-reconcile',
        readTopLevelNodes: 1,
      },
    ]);
  });

  it('traces a full-diff fallback only for an unrepresentable root attribute', () => {
    const [peer] = createSeededYjsPeers({
      children: [paragraph('body')],
      clientIds: ['peer'],
    });

    assert.ok(peer);

    clearYjsTrace(peer);
    peer.editor.read.yjs.root().setAttribute('provider:metadata', 'opaque');

    assert.equal(peer.editor.read.text.string([]), 'body');
    assert.deepEqual(getYjsTrace(peer), [
      {
        changedChildren: 0,
        fallback: 'remote-event-root-attributes',
        importKind: 'full-diff-fallback',
        mode: 'remote-reconcile',
      },
    ]);
  });

  it('keeps sparse event ranges narrow through concurrent reconnect', () => {
    const [source, innerTarget11] = createSeededYjsPeers({
      children: largeValue(256),
      clientIds: ['source', 'target'],
    });

    assert.ok(source);
    assert.ok(innerTarget11);

    disconnectYjsPeer(innerTarget11);
    source.editor.update.text.insert('!', {
      at: { offset: 'block-000'.length, path: [0, 0] },
    });
    innerTarget11.editor.update.text.insert('?', {
      at: { offset: 'block-255'.length, path: [255, 0] },
    });
    clearYjsTrace(innerTarget11);
    connectYjsPeerAndSync(innerTarget11, [source, innerTarget11]);

    assert.deepEqual(
      getPeerTopLevelTexts(innerTarget11),
      getPeerTopLevelTexts(source)
    );
    assert.deepEqual(getYjsTrace(innerTarget11), [
      {
        changedChildren: 1,
        changedRanges: 1,
        importKind: 'event-change',
        mode: 'remote-reconcile',
        readTopLevelNodes: 1,
      },
    ]);
  });

  it('installs its controller before canonicalizing a claimed document', () => {
    const sourceDoc = new Y.Doc();
    const source = createEditor({ initialValue: [paragraph('claimed')] });
    const cleanupSource = source.install(
      yjs({ doc: sourceDoc, rootName: 'activation-cycle' })
    );
    const targetDoc = new Y.Doc();

    Y.applyUpdate(targetDoc, Y.encodeStateAsUpdate(sourceDoc));

    const innerTarget12 = createEditor({ initialValue: [paragraph('local')] });
    const cleanupTarget = innerTarget12.install(
      yjs({ doc: targetDoc, rootName: 'activation-cycle' })
    );

    assert.deepEqual(innerTarget12.read.children(), [paragraph('claimed')]);
    assert.equal(innerTarget12.read.yjs.root().length, 1);
    cleanupSource();
    cleanupTarget();
  });

  it('imports an event-native change into a named editor root only', () => {
    const initialValue = {
      children: [paragraph('body')],
      roots: { header: [paragraph('header')] },
    };
    const createPeer = (doc: Y.Doc, seedUpdate?: Uint8Array) => {
      if (seedUpdate) Y.applyUpdate(doc, seedUpdate);

      const runtime = createYjsTestEditor(initialValue);
      const main = createEditorView(runtime);
      const header = createEditorView(runtime, { root: 'header' });
      const cleanup = header.install(yjs({ doc, rootName: 'named-root' }));

      return { cleanup, doc, header, main };
    };
    const source = createPeer(new Y.Doc());
    const innerTarget13 = createPeer(
      new Y.Doc(),
      Y.encodeStateAsUpdate(source.doc)
    );

    source.header.update.text.insert('!', {
      at: { offset: 'header'.length, path: [0, 0] },
    });
    Y.applyUpdate(innerTarget13.doc, Y.encodeStateAsUpdate(source.doc));

    assert.equal(innerTarget13.header.read.text.string([]), 'header!');
    assert.equal(innerTarget13.main.read.text.string([]), 'body');
    assert.deepEqual(innerTarget13.header.read.yjs.trace().at(-1), {
      changedChildren: 1,
      changedRanges: 1,
      importKind: 'event-change',
      mode: 'remote-reconcile',
      readTopLevelNodes: 1,
      root: 'header',
    });
    source.cleanup();
    innerTarget13.cleanup();
  });
});
