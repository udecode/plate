import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createEditor,
  defineEditorExtension,
  defineEffect,
  defineStateField,
  defineValueCodec,
  valueCodecs,
} from '@platejs/plite';
import * as Y from 'yjs';

import { createYjsExtension } from '../src/core/extension';
import { paragraph, runEditorYjsUpdate } from './support/collaboration';

const ROOT_NAME = 'shared-effect-compaction';

const sync = (source: Y.Doc, target: Y.Doc): void => {
  Y.applyUpdate(
    target,
    Y.encodeStateAsUpdate(source, Y.encodeStateVector(target))
  );
};

describe('@platejs/yjs shared effect compaction', () => {
  it('checkpoints absolute state and expires acknowledged live events', () => {
    const title = defineStateField({
      collab: 'shared',
      initial: () => 'A',
      key: 'compaction.title',
      persist: valueCodecs.string,
    });
    const announce = defineEffect<string>({
      codec: valueCodecs.string,
      collab: 'shared',
      collabReplay: 'live',
      key: 'compaction.announce',
    });
    const effects = defineEditorExtension({
      effects: [announce],
      name: 'compaction-effects',
    });
    const createPeer = (doc: Y.Doc, authority = false) => {
      const received: string[] = [];
      let remoteCommits = 0;
      const recorder = defineEditorExtension({
        name: `compaction-recorder-${String(doc.clientID)}`,
        onCommit({ commit }) {
          if (commit.tags.includes('remote-yjs-import')) remoteCommits += 1;
          for (const effect of commit.effects) {
            if (effect.type === announce) received.push(String(effect.value));
          }
        },
      });
      const editor = createEditor({
        extensions: [title, effects, recorder] as const,
        initialValue: [paragraph('body')],
      });
      const cleanup = editor.extend(
        createYjsExtension({
          doc,
          rootName: ROOT_NAME,
          ...(authority
            ? {
                sharedEffectCompaction: {
                  authorityId: `${ROOT_NAME}:authority`,
                  threshold: 2,
                },
              }
            : {}),
        })
      );

      return {
        cleanup,
        doc,
        editor,
        received,
        remoteCommits: () => remoteCommits,
      };
    };
    const source = createPeer(new Y.Doc(), true);
    const targetDoc = new Y.Doc();

    sync(source.doc, targetDoc);

    const target = createPeer(targetDoc);

    sync(target.doc, source.doc);
    source.editor.update((tx) => {
      tx.setField(title, 'B');
    });
    sync(source.doc, target.doc);

    const partialDoc = new Y.Doc();

    sync(source.doc, partialDoc);

    const partial = createPeer(partialDoc);

    assert.equal(partial.editor.read.getField(title), 'B');
    partial.editor.update((tx) => {
      tx.setField(title, 'D');
    });
    sync(target.doc, source.doc);

    source.editor.update((tx) => {
      tx.setField(title, 'C');
      tx.effects.emit(announce, 'old-live-event');
    });
    sync(source.doc, target.doc);

    assert.equal(target.editor.read.getField(title), 'C');
    assert.deepEqual(target.received, ['old-live-event']);

    sync(target.doc, source.doc);

    const eventLog = source.doc.getArray(`${ROOT_NAME}:shared-effect-events`);
    const checkpoint = source.doc
      .getMap(`${ROOT_NAME}:shared-effect-checkpoint`)
      .get('current');

    assert.equal(eventLog.length, 0);
    assert.ok(checkpoint);

    const compactedUpdate = Y.encodeStateAsUpdate(source.doc);

    Y.applyUpdate(partial.doc, compactedUpdate);

    assert.equal(partial.editor.read.getField(title), 'D');
    assert.deepEqual(partial.received, []);

    const commitsAfterCheckpoint = partial.remoteCommits();

    Y.applyUpdate(partial.doc, compactedUpdate);
    assert.equal(partial.remoteCommits(), commitsAfterCheckpoint);

    const lateDoc = new Y.Doc();

    Y.applyUpdate(lateDoc, compactedUpdate);

    const late = createPeer(lateDoc);

    assert.equal(late.editor.read.getField(title), 'C');
    assert.deepEqual(late.received, []);

    sync(source.doc, target.doc);
    target.cleanup();

    const reconnected = createPeer(target.doc);

    assert.equal(reconnected.editor.read.getField(title), 'C');
    assert.deepEqual(reconnected.received, []);

    sync(partial.doc, source.doc);

    assert.equal(source.editor.read.getField(title), 'D');
    assert.equal(eventLog.length, 1);

    const tailJoinDoc = new Y.Doc();

    sync(source.doc, tailJoinDoc);

    const tailJoin = createPeer(tailJoinDoc);

    assert.equal(tailJoin.editor.read.getField(title), 'D');
    assert.deepEqual(tailJoin.received, []);

    source.cleanup();
    partial.cleanup();
    late.cleanup();
    reconnected.cleanup();
    tailJoin.cleanup();
  });

  it('captures custom latest effects instead of replaying their last event', () => {
    const rootName = 'custom-latest-snapshot';
    const title = defineStateField({
      collab: 'shared',
      initial: () => 'A',
      key: 'custom-latest.title',
      persist: valueCodecs.string,
    });
    const mirror = defineEffect<string>({
      codec: valueCodecs.string,
      collab: 'shared',
      collabReplay: 'latest',
      collabSnapshot: (state) => state.getField(title),
      key: 'custom-latest.mirror',
    });
    const received = defineStateField<string>({
      initial: () => 'none',
      key: 'custom-latest.received',
      reduce: (value, effect) =>
        effect.type === mirror ? effect.value : value,
    });
    const effects = defineEditorExtension({
      effects: [mirror],
      name: 'custom-latest-effects',
    });
    const createPeer = (doc: Y.Doc, authority = false) => {
      const editor = createEditor({
        extensions: [title, received, effects] as const,
        initialValue: [paragraph('body')],
      });
      const cleanup = editor.extend(
        createYjsExtension({
          doc,
          rootName,
          ...(authority
            ? {
                sharedEffectCompaction: {
                  authorityId: `${rootName}:authority`,
                  threshold: 2,
                },
              }
            : {}),
        })
      );

      return { cleanup, doc, editor };
    };
    const source = createPeer(new Y.Doc(), true);
    const witnessDoc = new Y.Doc();

    sync(source.doc, witnessDoc);

    const witness = createPeer(witnessDoc);

    sync(witness.doc, source.doc);
    source.editor.update((tx) => {
      tx.effects.emit(mirror, 'stale-event');
      tx.setField(title, 'B');
    });
    sync(source.doc, witness.doc);
    sync(witness.doc, source.doc);

    assert.equal(
      source.doc.getArray(`${rootName}:shared-effect-events`).length,
      0
    );

    const lateDoc = new Y.Doc();

    sync(source.doc, lateDoc);

    const late = createPeer(lateDoc);

    assert.equal(late.editor.read.getField(title), 'B');
    assert.equal(late.editor.read.getField(received), 'B');

    source.cleanup();
    witness.cleanup();
    late.cleanup();
  });

  it('imports a preloaded latest tail before a late authority checkpoints it', () => {
    const rootName = 'late-authority-snapshot';
    const title = defineStateField({
      collab: 'shared',
      initial: () => 'A',
      key: 'late-authority.title',
      persist: valueCodecs.string,
    });
    const sourceDoc = new Y.Doc();
    const source = createEditor({
      extensions: [title] as const,
      initialValue: [paragraph('body')],
    });
    const cleanupSource = source.extend(
      createYjsExtension({ doc: sourceDoc, rootName })
    );

    source.update((tx) => {
      tx.setField(title, 'B');
    });
    source.update((tx) => {
      tx.setField(title, 'C');
    });

    const authorityDoc = new Y.Doc();

    sync(sourceDoc, authorityDoc);
    assert.equal(
      authorityDoc.getArray(`${rootName}:shared-effect-events`).length,
      2
    );

    const authority = createEditor({
      extensions: [title] as const,
      initialValue: [paragraph('body')],
    });
    const cleanupAuthority = authority.extend(
      createYjsExtension({
        doc: authorityDoc,
        rootName,
        sharedEffectCompaction: {
          authorityId: `${rootName}:authority`,
          threshold: 2,
        },
      })
    );

    assert.equal(authority.read.getField(title), 'C');
    assert.equal(
      authorityDoc.getArray(`${rootName}:shared-effect-events`).length,
      0
    );
    assert.ok(
      authorityDoc.getMap(`${rootName}:shared-effect-checkpoint`).get('current')
    );

    cleanupAuthority();
    cleanupSource();
  });

  it('restores an uncheckpointed latest tail when a controller is recreated', () => {
    const rootName = 'latest-controller-recreation';
    const title = defineStateField({
      collab: 'shared',
      initial: () => 'A',
      key: 'latest-controller-recreation.title',
      persist: valueCodecs.string,
    });
    const doc = new Y.Doc();
    const source = createEditor({
      extensions: [title] as const,
      initialValue: [paragraph('body')],
    });
    const cleanupSource = source.extend(createYjsExtension({ doc, rootName }));

    source.update((tx) => {
      tx.setField(title, 'B');
    });
    cleanupSource();

    const restored = createEditor({
      extensions: [title] as const,
      initialValue: [paragraph('body')],
    });
    const cleanupRestored = restored.extend(
      createYjsExtension({ doc, rootName })
    );

    assert.equal(restored.read.getField(title), 'B');

    cleanupRestored();
  });

  it('claims one authority without leaking a failed activation', () => {
    const doc = new Y.Doc();
    const title = defineStateField({
      collab: 'shared',
      initial: () => 'A',
      key: 'authority.title',
      persist: valueCodecs.string,
    });
    const createAuthority = () => {
      const editor = createEditor({
        extensions: [title] as const,
        initialValue: [paragraph('body')],
      });

      return {
        editor,
        install: () =>
          editor.extend(
            createYjsExtension({
              doc,
              rootName: 'single-authority',
              sharedEffectCompaction: {
                authorityId: 'single-authority',
                threshold: 1,
              },
            })
          ),
      };
    };
    const first = createAuthority();
    const cleanupFirst = first.install();
    const acknowledgements = doc.getMap('single-authority:shared-effect-acks');

    assert.equal(acknowledgements.size, 1);

    const second = createAuthority();

    assert.throws(() => second.install(), /already has a local authority/);
    assert.equal(acknowledgements.size, 1);

    first.editor.update((tx) => {
      tx.setField(title, 'B');
    });
    assert.equal(
      doc.getArray('single-authority:shared-effect-events').length,
      0
    );

    cleanupFirst();
  });

  it('resumes one stable authority across Y.Doc client generations', () => {
    const rootName = 'stable-authority-restart';
    const authorityId = 'collaboration-service';
    const title = defineStateField({
      collab: 'shared',
      initial: () => 'A',
      key: 'stable-authority-restart.title',
      persist: valueCodecs.string,
    });
    const announce = defineEffect<string>({
      codec: valueCodecs.string,
      collab: 'shared',
      collabReplay: 'live',
      key: 'stable-authority-restart.announce',
    });
    const effects = defineEditorExtension({
      effects: [announce],
      name: 'stable-authority-restart-effects',
    });
    const createAuthority = (doc: Y.Doc, threshold: number) => {
      const received: string[] = [];
      const recorder = defineEditorExtension({
        name: `stable-authority-restart-recorder-${String(doc.clientID)}`,
        onCommit({ commit }) {
          for (const effect of commit.effects) {
            if (effect.type === announce) received.push(effect.value);
          }
        },
      });
      const editor = createEditor({
        extensions: [title, effects, recorder] as const,
        initialValue: [paragraph('body')],
      });
      const cleanup = editor.extend(
        createYjsExtension({
          doc,
          rootName,
          sharedEffectCompaction: { authorityId, threshold },
        })
      );

      return { cleanup, doc, editor, received };
    };
    const first = createAuthority(new Y.Doc(), 100);

    first.editor.update((tx) => {
      tx.effects.emit(announce, 'once');
      tx.setField(title, 'B');
    });

    assert.deepEqual(first.received, ['once']);
    assert.equal(
      first.doc.getArray(`${rootName}:shared-effect-events`).length,
      2
    );

    const restartedDoc = new Y.Doc();

    sync(first.doc, restartedDoc);

    const restarted = createAuthority(restartedDoc, 1);

    assert.notEqual(restarted.doc.clientID, first.doc.clientID);
    assert.equal(restarted.editor.read.getField(title), 'B');
    assert.deepEqual(restarted.received, []);
    assert.equal(
      restarted.doc.getArray(`${rootName}:shared-effect-events`).length,
      0
    );
    assert.deepEqual(
      restarted.doc
        .getMap(`${rootName}:shared-effect-checkpoint`)
        .get('authority'),
      {
        authorityId,
        format: 1,
        peerId: String(restarted.doc.clientID),
      }
    );

    const wrongDoc = new Y.Doc();

    sync(restarted.doc, wrongDoc);

    const wrongEditor = createEditor({
      extensions: [title, effects] as const,
      initialValue: [paragraph('body')],
    });

    assert.throws(
      () =>
        wrongEditor.extend(
          createYjsExtension({
            doc: wrongDoc,
            rootName,
            sharedEffectCompaction: {
              authorityId: 'different-service',
              threshold: 1,
            },
          })
        ),
      /already has authority "collaboration-service"/
    );

    sync(first.doc, restarted.doc);
    sync(restarted.doc, first.doc);

    assert.deepEqual(
      restarted.doc
        .getMap(`${rootName}:shared-effect-checkpoint`)
        .get('authority'),
      {
        authorityId,
        format: 1,
        peerId: String(restarted.doc.clientID),
      }
    );
    assert.throws(
      () =>
        runEditorYjsUpdate(first.editor, (yjs) => {
          yjs.retireSharedEffectPeer(restarted.doc.clientID);
        }),
      /only the active.*authority may retire/i
    );
    first.cleanup();

    restarted.editor.update((tx) => {
      tx.effects.emit(announce, 'after-restart');
    });
    assert.deepEqual(restarted.received, ['after-restart']);

    restarted.cleanup();
  });

  it('scopes the local authority guard to one shared root', () => {
    const doc = new Y.Doc();
    const createAuthority = (rootName: string) => {
      const editor = createEditor({ initialValue: [paragraph('body')] });
      const cleanup = editor.extend(
        createYjsExtension({
          doc,
          rootName,
          sharedEffectCompaction: { authorityId: rootName, threshold: 1 },
        })
      );

      return cleanup;
    };
    const cleanupFirst = createAuthority('authority-root-a');
    const cleanupSecond = createAuthority('authority-root-b');

    cleanupFirst();
    cleanupSecond();
  });

  it('targets live effects only to active peers and preserves retry on reconnect', () => {
    const rootName = 'live-recipient-lifecycle';
    const announce = defineEffect<string>({
      codec: valueCodecs.string,
      collab: 'shared',
      collabReplay: 'live',
      key: 'live-recipient-lifecycle.announce',
    });
    const effects = defineEditorExtension({
      effects: [announce],
      name: 'live-recipient-lifecycle-effects',
    });
    const sourceDoc = new Y.Doc();
    const source = createEditor({
      extensions: [effects] as const,
      initialValue: [paragraph('body')],
    });
    const cleanupSource = source.extend(
      createYjsExtension({ doc: sourceDoc, rootName })
    );

    source.update((tx) => {
      tx.effects.emit(announce, 'before-join');
    });

    const postActivationDoc = new Y.Doc();
    const postActivationReceived: string[] = [];
    const postActivation = createEditor({
      extensions: [
        effects,
        defineEditorExtension({
          name: 'live-recipient-post-activation-recorder',
          onCommit({ commit }) {
            for (const effect of commit.effects) {
              if (effect.type === announce) {
                postActivationReceived.push(effect.value);
              }
            }
          },
        }),
      ] as const,
      initialValue: [paragraph('body')],
    });
    const cleanupPostActivation = postActivation.extend(
      createYjsExtension({ doc: postActivationDoc, rootName })
    );

    sync(sourceDoc, postActivationDoc);
    assert.deepEqual(postActivationReceived, []);
    cleanupPostActivation();

    const targetDoc = new Y.Doc();

    sync(sourceDoc, targetDoc);

    const received: string[] = [];
    const target = createEditor({ initialValue: [paragraph('body')] });
    const cleanupRecorder = target.extend(
      defineEditorExtension({
        name: 'live-recipient-lifecycle-recorder',
        onCommit({ commit }) {
          for (const effect of commit.effects) {
            if (effect.type.key === announce.key) {
              received.push(String(effect.value));
            }
          }
        },
      })
    );
    const cleanupTarget = target.extend(
      createYjsExtension({ doc: targetDoc, rootName })
    );

    assert.deepEqual(received, []);

    sync(targetDoc, sourceDoc);
    source.update((tx) => {
      tx.effects.emit(announce, 'while-active');
    });
    sync(sourceDoc, targetDoc);

    assert.deepEqual(received, []);

    cleanupTarget();
    assert.equal(
      (
        targetDoc
          .getMap(`${rootName}:shared-effect-acks`)
          .get(String(targetDoc.clientID)) as { active: boolean }
      ).active,
      false
    );
    sync(targetDoc, sourceDoc);
    source.update((tx) => {
      tx.effects.emit(announce, 'while-offline');
    });
    sync(sourceDoc, targetDoc);

    const cleanupReconnect = target.extend(
      createYjsExtension({ doc: targetDoc, rootName })
    );

    assert.deepEqual(received, []);

    const cleanupEffects = target.extend(effects);

    assert.deepEqual(received, ['while-active']);

    cleanupEffects();
    cleanupReconnect();
    cleanupRecorder();
    cleanupSource();
  });

  it('lets the authority retire one crashed peer generation without replaying its live tail', () => {
    const rootName = 'retired-live-recipient';
    const announce = defineEffect<string>({
      codec: valueCodecs.string,
      collab: 'shared',
      collabReplay: 'live',
      key: 'retired-live-recipient.announce',
    });
    const effects = defineEditorExtension({
      effects: [announce],
      name: 'retired-live-recipient-effects',
    });
    const createPeer = (doc: Y.Doc, authority = false) => {
      const received: string[] = [];
      const recorder = defineEditorExtension({
        name: `retired-live-recipient-recorder-${String(doc.clientID)}`,
        onCommit({ commit }) {
          for (const effect of commit.effects) {
            if (effect.type === announce) received.push(effect.value);
          }
        },
      });
      const editor = createEditor({
        extensions: [effects, recorder] as const,
        initialValue: [paragraph('body')],
      });
      const cleanup = editor.extend(
        createYjsExtension({
          doc,
          rootName,
          ...(authority
            ? {
                sharedEffectCompaction: {
                  authorityId: `${rootName}:authority`,
                  threshold: 1,
                },
              }
            : {}),
        })
      );

      return { cleanup, doc, editor, received };
    };
    const authority = createPeer(new Y.Doc(), true);
    const crashedDoc = new Y.Doc();

    sync(authority.doc, crashedDoc);

    const crashed = createPeer(crashedDoc);

    sync(crashed.doc, authority.doc);
    assert.throws(
      () =>
        runEditorYjsUpdate(crashed.editor, (yjs) => {
          yjs.retireSharedEffectPeer(authority.doc.clientID);
        }),
      /only the active.*authority may retire/i
    );

    authority.editor.update((tx) => {
      tx.effects.emit(announce, 'missed-before-crash');
    });

    const eventLog = authority.doc.getArray(`${rootName}:shared-effect-events`);

    assert.equal(eventLog.length, 1);

    runEditorYjsUpdate(authority.editor, (yjs) => {
      yjs.retireSharedEffectPeer(crashed.doc.clientID);
    });

    assert.equal(
      authority.doc
        .getMap(`${rootName}:shared-effect-retired-peers`)
        .get(String(crashed.doc.clientID)),
      true
    );
    assert.equal(eventLog.length, 0);

    sync(authority.doc, crashed.doc);
    assert.deepEqual(crashed.received, []);
    crashed.cleanup();

    const restartedDoc = new Y.Doc();

    sync(authority.doc, restartedDoc);

    const restarted = createPeer(restartedDoc);

    assert.deepEqual(restarted.received, []);

    sync(restarted.doc, authority.doc);
    authority.editor.update((tx) => {
      tx.effects.emit(announce, 'after-new-generation');
    });
    sync(authority.doc, restarted.doc);

    assert.deepEqual(restarted.received, ['after-new-generation']);

    sync(restarted.doc, authority.doc);
    assert.equal(eventLog.length, 0);

    restarted.cleanup();
    authority.cleanup();
  });

  it('rejects unsafe remote watermark keys', () => {
    const rootName = 'unsafe-watermarks';
    const doc = new Y.Doc();
    const title = defineStateField({
      collab: 'shared',
      initial: () => 'A',
      key: 'unsafe-watermarks.title',
      persist: valueCodecs.string,
    });
    const through = Object.fromEntries([['__proto__', 1]]);

    doc.getMap(`${rootName}:shared-effect-checkpoint`).set('current', {
      effects: [
        {
          key: title.effect.key,
          value: 'polluted',
          version: 1,
        },
      ],
      format: 1,
      id: JSON.stringify(Object.entries(through)),
      through,
    });

    const editor = createEditor({
      extensions: [title] as const,
      initialValue: [paragraph('body')],
    });
    const cleanup = editor.extend(createYjsExtension({ doc, rootName }));

    assert.equal(editor.read.getField(title), 'A');

    cleanup();
  });

  it('does not checkpoint a non-contiguous source sequence', () => {
    const rootName = 'non-contiguous-effect-sequence';
    const doc = new Y.Doc();
    const source = String(doc.clientID);
    const announce = defineEffect<string>({
      codec: valueCodecs.string,
      collab: 'shared',
      collabReplay: 'live',
      key: 'non-contiguous-effect-sequence.announce',
    });
    const events = doc.getArray(`${rootName}:shared-effect-events`);

    events.push([
      {
        effect: {
          key: announce.key,
          value: 'gap',
          version: 1,
        },
        format: 1,
        id: `${source}:2`,
        recipients: [],
        replay: 'live',
        sequence: 2,
        source,
      },
    ]);

    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          effects: [announce],
          name: 'non-contiguous-effect-sequence-effects',
        }),
      ],
      initialValue: [paragraph('body')],
    });
    const cleanup = editor.extend(
      createYjsExtension({
        doc,
        rootName,
        sharedEffectCompaction: {
          authorityId: `${rootName}:authority`,
          threshold: 1,
        },
      })
    );

    assert.equal(events.length, 1);
    assert.equal(
      doc.getMap(`${rootName}:shared-effect-checkpoint`).get('current'),
      undefined
    );

    cleanup();
  });

  it('clones and freezes pending remote event payloads', () => {
    type Payload = { nested: { value: string } };
    const rootName = 'immutable-pending-event';
    const doc = new Y.Doc();
    const source = String(doc.clientID);
    const input = { nested: { value: 'original' } };
    const events = doc.getArray(`${rootName}:shared-effect-events`);

    events.push([
      {
        effect: {
          key: 'immutable-pending-event.effect',
          value: input,
          version: 1,
        },
        format: 1,
        id: `${source}:1`,
        recipients: [source],
        replay: 'live',
        sequence: 1,
        source,
      },
    ]);

    const received: Payload[] = [];
    const editor = createEditor({ initialValue: [paragraph('body')] });
    const cleanupRecorder = editor.extend(
      defineEditorExtension({
        name: 'immutable-pending-event-recorder',
        onCommit({ commit }) {
          for (const effect of commit.effects) {
            if (effect.type.key === 'immutable-pending-event.effect') {
              received.push(effect.value as Payload);
            }
          }
        },
      })
    );
    const cleanupYjs = editor.extend(createYjsExtension({ doc, rootName }));

    const storedEvent = events.get(0) as {
      effect: { value: Payload };
    };

    storedEvent.effect.value.nested.value = 'tampered';

    const effect = defineEffect<Payload>({
      codec: defineValueCodec({
        decode: (value) => value as Payload,
        encode: (value) => value,
        version: 1,
      }),
      collab: 'shared',
      collabReplay: 'live',
      key: 'immutable-pending-event.effect',
    });
    const cleanupEffect = editor.extend(
      defineEditorExtension({
        effects: [effect],
        name: 'immutable-pending-event-effect',
      })
    );

    assert.deepEqual(received, [{ nested: { value: 'original' } }]);
    assert.equal(Object.isFrozen(received[0]), true);
    assert.equal(Object.isFrozen(received[0]!.nested), true);

    cleanupEffect();
    cleanupYjs();
    cleanupRecorder();
  });

  it('restores a checkpoint atomically before delivering its tail', () => {
    const rootName = 'atomic-checkpoint';
    const title = defineStateField({
      collab: 'shared',
      initial: () => 'A',
      key: 'atomic-checkpoint.title',
      persist: valueCodecs.string,
    });
    const announce = defineEffect<string>({
      codec: valueCodecs.string,
      collab: 'shared',
      collabReplay: 'live',
      key: 'atomic-checkpoint.announce',
    });
    const effects = defineEditorExtension({
      effects: [announce],
      name: 'atomic-checkpoint-effects',
    });
    const createFullPeer = (doc: Y.Doc, authority = false) => {
      const editor = createEditor({
        extensions: [title, effects] as const,
        initialValue: [paragraph('body')],
      });
      const cleanup = editor.extend(
        createYjsExtension({
          doc,
          rootName,
          ...(authority
            ? {
                sharedEffectCompaction: {
                  authorityId: `${rootName}:authority`,
                  threshold: 1,
                },
              }
            : {}),
        })
      );

      return { cleanup, doc, editor };
    };
    const source = createFullPeer(new Y.Doc(), true);
    const witnessDoc = new Y.Doc();

    sync(source.doc, witnessDoc);

    const witness = createFullPeer(witnessDoc);

    sync(witness.doc, source.doc);
    source.editor.update((tx) => {
      tx.setField(title, 'B');
    });
    sync(source.doc, witness.doc);
    sync(witness.doc, source.doc);

    const lateDoc = new Y.Doc();

    sync(source.doc, lateDoc);

    const received: string[] = [];
    const late = createEditor({
      extensions: [effects] as const,
      initialValue: [paragraph('body')],
    });
    const cleanupRecorder = late.extend(
      defineEditorExtension({
        name: 'atomic-checkpoint-recorder',
        onCommit({ commit }) {
          if (!commit.tags.includes('remote-yjs-import')) return;

          for (const effect of commit.effects) {
            if (effect.type === announce) received.push(effect.value);
          }
        },
      })
    );
    const cleanupLate = late.extend(
      createYjsExtension({ doc: lateDoc, rootName })
    );

    sync(lateDoc, source.doc);
    source.editor.update((tx) => {
      tx.effects.emit(announce, 'tail');
    });
    sync(source.doc, lateDoc);

    assert.deepEqual(received, []);

    const storedCheckpoint = lateDoc
      .getMap(`${rootName}:shared-effect-checkpoint`)
      .get('current') as {
      effects: Array<{ value: { value: string } }>;
    };

    storedCheckpoint.effects[0]!.value.value = 'tampered';

    const cleanupTitle = late.extend(title);

    assert.equal(late.read.getField(title), 'B');
    assert.deepEqual(received, ['tail']);

    source.cleanup();
    witness.cleanup();
    cleanupLate();
    cleanupRecorder();
    cleanupTitle();
  });
});
