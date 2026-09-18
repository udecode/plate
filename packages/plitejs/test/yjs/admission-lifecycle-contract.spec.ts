import assert from 'node:assert/strict';

import * as Y from 'yjs';

import { history } from '../../src/history';
import {
  createEditor,
  defineEditorSchema,
  defineEffect,
  definePlugin,
  definePluginSlot,
  defineStateField,
  type Descendant,
  schema,
  valueCodecs,
} from '../../src/index';
import type { AnyEditor, PluginReference } from '../../src/interfaces/editor';
import { yjs, type YjsAdmissionStatus } from '../../src/yjs';
import {
  getYjsSchemaMetadataName,
  writeYjsSchemaEnvelope,
} from '../../src/yjs/core/schema-metadata';

type ErasedYjsApi = Readonly<{
  admissionStatus: () => YjsAdmissionStatus;
  clearSelection: () => void;
  remoteCursors: () => readonly unknown[];
  retireSharedEffectPeer: (clientId: number) => void;
  retryImport: () => void;
  setCursorData: (data: Readonly<Record<string, unknown>> | null) => void;
  subscribeAdmissionStatus: (listener: () => void) => () => void;
  syncSelection: () => void;
}>;

const ParagraphSchema = defineEditorSchema(
  'schema:yjs-admission-lifecycle-paragraph',
  {
    elements: {
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
    id: 'yjs-admission-lifecycle-paragraph',
    root: schema.content.type('paragraph', { min: 1 }),
    unknown: 'reject',
    version: 1,
  }
);

const RequiredCardSchema = defineEditorSchema(
  'schema:yjs-admission-lifecycle-required-card',
  {
    elements: {
      card: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
    id: 'yjs-admission-lifecycle-required-card',
    root: schema.content.type('card', { min: 2 }),
    unknown: 'reject',
    version: 1,
  }
);

const localRevision = defineStateField<number>({
  initial: 0,
  key: 'yjs-admission-lifecycle.local-revision',
});

const blockedSharedEffect = defineEffect<string>({
  codec: valueCodecs.string,
  collab: 'shared',
  collabReplay: 'live',
  history: 'skip',
  key: 'yjs-admission-lifecycle.blocked-shared-effect',
});

const LocalStatePlugin = definePlugin('yjs-admission-lifecycle-local-state', {
  effectTypes: [blockedSharedEffect],
  stateFields: [localRevision],
});

const paragraph = (text: string): Descendant => ({
  children: [{ text }],
  type: 'paragraph',
});

const card = (text: string): Descendant => ({
  children: [{ text }],
  type: 'card',
});

class TestInitialReadiness {
  readonly doc: Y.Doc;

  private readonly listeners = new Set<() => void>();
  private ready: boolean;

  constructor(doc: Y.Doc, ready: boolean) {
    this.doc = doc;
    this.ready = ready;
  }

  get listenerCount(): number {
    return this.listeners.size;
  }

  getSnapshot = (): boolean => this.ready;

  setReady(ready: boolean): void {
    if (this.ready === ready) return;

    this.ready = ready;
    for (const listener of this.listeners) listener();
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    let active = true;

    return () => {
      if (!active) return;

      active = false;
      this.listeners.delete(listener);
    };
  };
}

type AwarenessChange = Readonly<{
  added: readonly number[];
  removed: readonly number[];
  updated: readonly number[];
}>;

class TestAwareness {
  readonly clientID: number;
  readonly doc: Y.Doc;

  readonly writes: Array<Readonly<{ field: string; value: unknown }>> = [];

  rejectWritesWith: unknown = null;

  private readonly listeners = new Set<(event: AwarenessChange) => void>();
  private localState: Readonly<Record<string, unknown>> | null = null;
  private readonly states = new Map<
    number,
    Readonly<Record<string, unknown>>
  >();

  constructor(doc: Y.Doc) {
    this.clientID = doc.clientID;
    this.doc = doc;
  }

  get listenerCount(): number {
    return this.listeners.size;
  }

  getLocalState(): Readonly<Record<string, unknown>> | null {
    return this.localState;
  }

  getStates(): ReadonlyMap<number, Readonly<Record<string, unknown>>> {
    return this.states;
  }

  off(_event: 'change', listener: (event: AwarenessChange) => void): void {
    this.listeners.delete(listener);
  }

  on(_event: 'change', listener: (event: AwarenessChange) => void): void {
    this.listeners.add(listener);
  }

  setLocalStateField(field: string, value: unknown): void {
    if (this.rejectWritesWith !== null) {
      throw this.rejectWritesWith;
    }

    this.writes.push({ field, value });
    this.localState = { ...this.localState, [field]: value };
    this.states.set(this.clientID, this.localState);

    const event = { added: [], removed: [], updated: [this.clientID] };

    for (const listener of this.listeners) listener(event);
  }
}

const getAdmissionApi = (
  editor: AnyEditor,
  binding: PluginReference
): ErasedYjsApi => editor.plugin(binding).api;

const sync = (source: Y.Doc, target: Y.Doc): void => {
  Y.applyUpdate(
    target,
    Y.encodeStateAsUpdate(source, Y.encodeStateVector(target)),
    source
  );
};

const stateVector = (doc: Y.Doc): readonly number[] => [
  ...Y.encodeStateVector(doc),
];

const claimRequiredCardSchema = (doc: Y.Doc, rootName: string): void => {
  const schemaEditor = createEditor({
    initialValue: [card(''), card('')],
    plugins: [RequiredCardSchema] as const,
  });

  doc.transact(() => {
    writeYjsSchemaEnvelope(
      doc.getMap(getYjsSchemaMetadataName(rootName)),
      schemaEditor.read.schema.identity()
    );
  });
};

const topLevelTexts = (editor: AnyEditor): readonly string[] =>
  editor.read
    .children()
    .map((_node, index) => editor.read.text.string([index]));

describe('plitejs/yjs admission lifecycle contract', () => {
  it('publishes ready only after the initial awareness selection succeeds', () => {
    const doc = new Y.Doc();
    const readiness = new TestInitialReadiness(doc, false);
    const awareness = new TestAwareness(doc);
    const binding = yjs({
      awareness,
      doc,
      initialReady: readiness,
      rootName: 'admission-awareness-publication',
      seed: true,
    });
    const editor = createEditor({
      initialValue: [paragraph('base')],
      plugins: [ParagraphSchema] as const,
    });
    const cleanup = editor.install(binding);
    const api = getAdmissionApi(editor, binding);
    const statusEvents: YjsAdmissionStatus[] = [];
    const unsubscribeStatus = api.subscribeAdmissionStatus(() => {
      statusEvents.push(api.admissionStatus());
    });
    const awarenessError = new Error('awareness writer rejected selection');

    awareness.rejectWritesWith = awarenessError;
    readiness.setReady(true);

    assert.deepEqual(statusEvents, [{ cause: awarenessError, state: 'error' }]);

    awareness.rejectWritesWith = null;
    api.retryImport();

    assert.equal(api.admissionStatus().state, 'ready');
    assert.deepEqual(
      statusEvents.map((status) => status.state),
      ['error', 'ready']
    );

    unsubscribeStatus();
    cleanup();
  });

  it('rejects waiting document and shared-effect edits before document, history, or Yjs publication', () => {
    const rootName = 'admission-waiting-publication';
    const doc = new Y.Doc();
    const readiness = new TestInitialReadiness(doc, false);
    const binding = yjs({ doc, initialReady: readiness, rootName });
    const editor = createEditor({
      initialValue: [paragraph('placeholder')],
      plugins: [ParagraphSchema, history(), LocalStatePlugin] as const,
    });
    const vectorBeforeInstall = stateVector(doc);
    const cleanup = editor.install(binding);
    const api = getAdmissionApi(editor, binding);
    const statusEvents: YjsAdmissionStatus[] = [];
    const unsubscribeStatus = api.subscribeAdmissionStatus(() => {
      statusEvents.push(api.admissionStatus());
    });
    const commits: number[] = [];
    const unsubscribeCommits = editor.subscribeCommit((commit) => {
      commits.push(commit.version);
    });

    assert.deepEqual(api.admissionStatus(), {
      reason: 'load',
      state: 'waiting',
    });
    assert.equal(api.admissionStatus(), api.admissionStatus());
    assert.deepEqual(stateVector(doc), vectorBeforeInstall);

    assert.throws(() => {
      editor.update.text.insert('!', { at: { offset: 11, path: [0, 0] } });
    });
    assert.throws(() => {
      editor.update((tx) => {
        tx.effects.emit(blockedSharedEffect, 'blocked');
      });
    });

    assert.deepEqual(editor.read.children(), [paragraph('placeholder')]);
    assert.deepEqual(commits, []);
    assert.equal(editor.read.history().undos.length, 0);
    assert.deepEqual(stateVector(doc), vectorBeforeInstall);

    editor.update((tx) => {
      tx.setField(localRevision, 1);
    });
    assert.equal(editor.read.getField(localRevision), 1);
    assert.equal(commits.length, 1);
    assert.deepEqual(stateVector(doc), vectorBeforeInstall);

    readiness.setReady(true);
    assert.deepEqual(api.admissionStatus(), {
      reason: 'seed',
      state: 'waiting',
    });
    readiness.setReady(true);
    assert.equal(statusEvents.length, 1);

    const seedDoc = new Y.Doc();
    const seedBinding = yjs({
      doc: seedDoc,
      initialReady: true,
      rootName,
      seed: true,
    });
    const seedEditor = createEditor({
      initialValue: [paragraph('canonical')],
      plugins: [ParagraphSchema] as const,
    });
    const cleanupSeed = seedEditor.install(seedBinding);

    assert.equal(
      getAdmissionApi(seedEditor, seedBinding).admissionStatus().state,
      'ready'
    );

    sync(seedDoc, doc);

    assert.equal(api.admissionStatus().state, 'ready');
    assert.equal(api.admissionStatus(), api.admissionStatus());
    assert.deepEqual(
      statusEvents.map((status) => status.state),
      ['waiting', 'ready']
    );
    assert.deepEqual(editor.read.children(), [paragraph('canonical')]);

    unsubscribeStatus();
    unsubscribeStatus();
    unsubscribeCommits();
    cleanupSeed();
    cleanup();
    assert.equal(readiness.listenerCount, 0);
  });

  it('retains a failed shared effect, withholds acknowledgement, and applies it exactly once after retry', () => {
    const rootName = 'admission-shared-effect-retry';
    const decodeError = new Error('rejected admission effect');
    let rejectDecode = false;
    const delivered = defineEffect<string>({
      codec: valueCodecs.string,
      collab: 'shared',
      collabReplay: 'live',
      collabTransport: {
        decode(value) {
          if (rejectDecode) throw decodeError;

          return typeof value === 'string' ? value : undefined;
        },
        encode: (value) => value,
      },
      history: 'skip',
      key: 'yjs-admission-lifecycle.delivered',
    });
    const received = defineStateField<readonly string[]>({
      initial: () => [],
      key: 'yjs-admission-lifecycle.received',
      reduce: (value, effect) =>
        effect.type === delivered ? [...value, effect.value] : value,
    });
    const EffectPlugin = definePlugin('yjs-admission-lifecycle-effects', {
      effectTypes: [delivered],
      stateFields: [received, localRevision],
    });
    const sourceDoc = new Y.Doc();
    const targetDoc = new Y.Doc();

    sourceDoc.clientID = 101;
    targetDoc.clientID = 202;

    const sourceBinding = yjs({
      doc: sourceDoc,
      initialReady: true,
      rootName,
      seed: true,
      sharedEffectCompaction: {
        authorityId: `${rootName}:authority`,
        threshold: 1,
      },
    });
    const source = createEditor({
      initialValue: [paragraph('base')],
      plugins: [ParagraphSchema, EffectPlugin] as const,
    });
    const cleanupSource = source.install(sourceBinding);

    sync(sourceDoc, targetDoc);

    const targetBinding = yjs({
      doc: targetDoc,
      initialReady: true,
      rootName,
    });
    const target = createEditor({
      initialValue: [paragraph('placeholder')],
      plugins: [ParagraphSchema, history(), EffectPlugin] as const,
    });
    const cleanupTarget = target.install(targetBinding);
    const targetApi = getAdmissionApi(target, targetBinding);

    assert.equal(targetApi.admissionStatus().state, 'ready');
    assert.deepEqual(target.read.children(), [paragraph('base')]);

    sync(targetDoc, sourceDoc);

    const targetCommits: number[] = [];
    const unsubscribeTarget = target.subscribeCommit((commit) => {
      targetCommits.push(commit.version);
    });

    source.update((tx) => {
      tx.effects.emit(delivered, 'once');
    });
    rejectDecode = true;

    try {
      sync(sourceDoc, targetDoc);
    } catch {
      // The binding status and retained input remain the contract boundary.
    }

    const failed = targetApi.admissionStatus();

    assert.equal(failed.state, 'error');
    if (failed.state !== 'error') assert.fail('Expected admission error.');
    assert.equal(failed.cause, decodeError);
    assert.equal(targetApi.admissionStatus(), failed);
    assert.deepEqual(target.read.getField(received), []);
    assert.deepEqual(targetCommits, []);

    sync(targetDoc, sourceDoc);
    assert.equal(
      sourceDoc.getArray(`${rootName}:shared-effect-events`).length,
      1
    );

    const vectorAfterFailure = stateVector(targetDoc);
    const commitCountAfterFailure = targetCommits.length;

    assert.throws(() => {
      target.update.text.insert('!', { at: { offset: 4, path: [0, 0] } });
    });
    assert.throws(() => {
      target.update((tx) => {
        tx.effects.emit(delivered, 'local');
      });
    });
    assert.equal(targetCommits.length, commitCountAfterFailure);
    assert.equal(target.read.history().undos.length, 0);
    assert.deepEqual(target.read.children(), [paragraph('base')]);
    assert.deepEqual(stateVector(targetDoc), vectorAfterFailure);

    let failedRetryNotifications = 0;
    const unsubscribeFailedRetry = targetApi.subscribeAdmissionStatus(() => {
      failedRetryNotifications += 1;
    });

    assert.throws(() => targetApi.retryImport(), /rejected admission effect/);
    assert.equal(targetApi.admissionStatus(), failed);
    assert.equal(failedRetryNotifications, 0);

    target.update((tx) => {
      tx.setField(localRevision, 1);
    });
    assert.equal(target.read.getField(localRevision), 1);

    rejectDecode = false;
    targetApi.retryImport();

    assert.equal(targetApi.admissionStatus().state, 'ready');
    assert.deepEqual(target.read.getField(received), ['once']);

    const commitsAfterRetry = targetCommits.length;

    targetApi.retryImport();
    sync(sourceDoc, targetDoc);

    assert.equal(targetCommits.length, commitsAfterRetry);
    assert.deepEqual(target.read.getField(received), ['once']);

    sync(targetDoc, sourceDoc);
    assert.equal(
      sourceDoc.getArray(`${rootName}:shared-effect-events`).length,
      0
    );

    unsubscribeTarget();
    unsubscribeFailedRetry();
    cleanupTarget();
    cleanupSource();
  });

  it('reuses one admitted controller for the same binding lineage and rejects a second namespace owner before publication', () => {
    const rootName = 'admission-controller-ownership';
    const doc = new Y.Doc();
    const readiness = new TestInitialReadiness(doc, true);
    const binding = yjs({
      doc,
      initialReady: readiness,
      rootName,
      seed: true,
      sharedEffectCompaction: {
        authorityId: `${rootName}:authority`,
        threshold: 1,
      },
    });
    const primary = definePluginSlot('yjs-admission-primary-owner');
    const presentation = definePluginSlot('yjs-admission-presentation-owner');
    const editor = createEditor({
      initialValue: [paragraph('base')],
      plugins: [ParagraphSchema, primary.of(binding)] as const,
    });
    const api = getAdmissionApi(editor, binding);

    assert.equal(api.admissionStatus().state, 'ready');

    readiness.setReady(false);

    const cleanupPresentation = editor.install(presentation.of(binding));

    assert.equal(api.admissionStatus().state, 'ready');
    assert.equal(editor.plugin(binding).installed, true);
    assert.doesNotThrow(() => api.retireSharedEffectPeer(9001));

    cleanupPresentation();
    assert.equal(editor.plugin(binding).installed, true);
    assert.equal(api.admissionStatus().state, 'ready');

    const duplicate = yjs({
      doc,
      initialReady: true,
      rootName,
      sharedEffectCompaction: {
        authorityId: `${rootName}:authority`,
        threshold: 1,
      },
    });
    const vectorBeforeDuplicate = stateVector(doc);
    const commits: number[] = [];
    const unsubscribe = editor.subscribeCommit((commit) => {
      commits.push(commit.version);
    });

    assert.throws(() => editor.install(duplicate));
    assert.deepEqual(commits, []);
    assert.deepEqual(stateVector(doc), vectorBeforeDuplicate);
    assert.equal(editor.plugin(binding).installed, true);
    assert.equal(editor.plugin(duplicate).installed, false);
    assert.equal(api.admissionStatus().state, 'ready');

    unsubscribe();
  });

  it('checks readiness and awareness document identity before listeners or writes and guards unavailable APIs', () => {
    const rootName = 'admission-resource-identity';
    const doc = new Y.Doc();
    const otherDoc = new Y.Doc();
    const wrongReadiness = new TestInitialReadiness(otherDoc, true);
    const readinessBinding = yjs({
      doc,
      initialReady: wrongReadiness,
      rootName,
      seed: true,
    });
    const readinessEditor = createEditor({
      initialValue: [paragraph('base')],
      plugins: [ParagraphSchema] as const,
    });
    const beforeReadinessFailure = stateVector(doc);

    assert.throws(() => readinessEditor.install(readinessBinding), /document/i);
    assert.equal(wrongReadiness.listenerCount, 0);
    assert.deepEqual(stateVector(doc), beforeReadinessFailure);

    const awareness = new TestAwareness(otherDoc);
    const awarenessBinding = yjs({
      awareness,
      doc,
      initialReady: true,
      rootName,
      seed: true,
    });
    const awarenessEditor = createEditor({
      initialValue: [paragraph('base')],
      plugins: [ParagraphSchema] as const,
    });
    const beforeAwarenessFailure = stateVector(doc);

    assert.throws(() => awarenessEditor.install(awarenessBinding), /document/i);
    assert.equal(awareness.listenerCount, 0);
    assert.deepEqual(awareness.writes, []);
    assert.deepEqual(stateVector(doc), beforeAwarenessFailure);

    const documentOnlyDoc = new Y.Doc();
    const documentOnlyBinding = yjs({
      doc: documentOnlyDoc,
      initialReady: true,
      rootName: `${rootName}:document-only`,
      seed: true,
    });
    const documentOnlyEditor = createEditor({
      initialValue: [paragraph('base')],
      plugins: [ParagraphSchema] as const,
    });
    const cleanupDocumentOnly = documentOnlyEditor.install(documentOnlyBinding);
    const documentOnlyApi = getAdmissionApi(
      documentOnlyEditor,
      documentOnlyBinding
    );

    assert.equal(typeof documentOnlyApi.subscribeAdmissionStatus, 'function');
    assert.equal('setCursorData' in documentOnlyApi, false);
    assert.equal('remoteCursors' in documentOnlyApi, false);
    assert.equal('retireSharedEffectPeer' in documentOnlyApi, false);
    assert.throws(() => documentOnlyApi.setCursorData({ name: 'Ada' }));
    assert.throws(() => documentOnlyApi.remoteCursors());
    assert.throws(() => documentOnlyApi.retireSharedEffectPeer(123));

    const presenceDoc = new Y.Doc();
    const presence = new TestAwareness(presenceDoc);
    const presenceBinding = yjs({
      awareness: presence,
      doc: presenceDoc,
      initialReady: true,
      rootName: `${rootName}:presence`,
      seed: true,
    });
    const presenceEditor = createEditor({
      initialValue: [paragraph('base')],
      plugins: [ParagraphSchema] as const,
    });
    const cleanupPresence = presenceEditor.install(presenceBinding);
    const presenceApi = getAdmissionApi(presenceEditor, presenceBinding);

    presenceApi.setCursorData({ color: '#7c3aed', name: 'Ada' });
    presenceEditor.update.selection.set({ offset: 2, path: [0, 0] });
    presenceApi.syncSelection();

    assert.deepEqual(presence.getLocalState()?.data, {
      color: '#7c3aed',
      name: 'Ada',
    });
    assert.notEqual(presence.getLocalState()?.selection, null);

    presenceApi.clearSelection();
    assert.equal(presence.getLocalState()?.selection, null);

    cleanupPresence();
    cleanupDocumentOnly();
  });

  it('rejects direct Yjs API mutations inside updates and detached specs', () => {
    const rootName = 'admission-external-mutation-guard';
    const doc = new Y.Doc();
    const awareness = new TestAwareness(doc);
    const binding = yjs({
      awareness,
      doc,
      initialReady: true,
      rootName,
      seed: true,
      sharedEffectCompaction: {
        authorityId: `${rootName}:authority`,
        threshold: 1,
      },
    });
    const editor = createEditor({
      initialValue: [paragraph('base')],
      plugins: [ParagraphSchema] as const,
    });
    const cleanup = editor.install(binding);
    const api = getAdmissionApi(editor, binding);
    const actions = [
      () => api.setCursorData({ name: 'Ada' }),
      () => api.syncSelection(),
      () => api.clearSelection(),
      () => api.retryImport(),
      () => api.retireSharedEffectPeer(9001),
    ];
    const before = stateVector(doc);
    const awarenessWrites = awareness.writes.length;

    for (const action of actions) {
      assert.throws(
        () => editor.update(() => action()),
        /cannot run inside an editor update or transaction spec/i
      );
      assert.throws(
        () => editor.read((state) => state.transaction(() => action())),
        /cannot run inside an editor update or transaction spec/i
      );
    }

    assert.deepEqual(stateVector(doc), before);
    assert.equal(awareness.writes.length, awarenessWrites);

    cleanup();
    for (const action of actions) {
      assert.throws(() => action(), /(?:no longer active|not active)/i);
    }
  });

  it('derives required minima without shared identity and converges concurrent first edits as block insertions', () => {
    const rootName = 'admission-required-empty-root';
    const claimed = new Y.Doc();

    claimRequiredCardSchema(claimed, rootName);

    const leftDoc = new Y.Doc();
    const rightDoc = new Y.Doc();

    leftDoc.clientID = 301;
    rightDoc.clientID = 302;
    sync(claimed, leftDoc);
    sync(claimed, rightDoc);

    assert.equal(leftDoc.get(rootName, Y.XmlElement).length, 0);
    assert.equal(rightDoc.get(rootName, Y.XmlElement).length, 0);

    const leftBinding = yjs({
      doc: leftDoc,
      initialReady: true,
      rootName,
    });
    const rightBinding = yjs({
      doc: rightDoc,
      initialReady: true,
      rootName,
    });
    const left = createEditor({
      initialValue: [card('left placeholder'), card('left placeholder')],
      plugins: [RequiredCardSchema, history()] as const,
    });
    const right = createEditor({
      initialValue: [card('right placeholder'), card('right placeholder')],
      plugins: [RequiredCardSchema, history()] as const,
    });
    const cleanupLeft = left.install(leftBinding);
    const cleanupRight = right.install(rightBinding);

    assert.equal(
      getAdmissionApi(left, leftBinding).admissionStatus().state,
      'ready'
    );
    assert.equal(
      getAdmissionApi(right, rightBinding).admissionStatus().state,
      'ready'
    );
    assert.deepEqual(left.read.children(), [card(''), card('')]);
    assert.deepEqual(right.read.children(), [card(''), card('')]);
    assert.equal(leftDoc.get(rootName, Y.XmlElement).length, 0);
    assert.equal(rightDoc.get(rootName, Y.XmlElement).length, 0);

    left.update.text.insert('left', { at: { offset: 0, path: [0, 0] } });
    right.update.text.insert('right', { at: { offset: 0, path: [0, 0] } });

    assert.equal(leftDoc.get(rootName, Y.XmlElement).length, 1);
    assert.equal(rightDoc.get(rootName, Y.XmlElement).length, 1);

    sync(leftDoc, rightDoc);
    sync(rightDoc, leftDoc);

    assert.deepEqual([...topLevelTexts(left)].sort(), ['left', 'right']);
    assert.deepEqual([...topLevelTexts(right)].sort(), ['left', 'right']);
    assert.deepEqual(stateVector(leftDoc), stateVector(rightDoc));
    assert.equal(leftDoc.get(rootName, Y.XmlElement).length, 2);
    assert.equal(rightDoc.get(rootName, Y.XmlElement).length, 2);

    cleanupRight();
    cleanupLeft();
  });
});
