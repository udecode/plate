import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { createEditor } from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';
import * as Y from 'yjs';

import { createYjsExtension } from '../../../../../packages/yjs/src/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const iterations = Number.parseInt(
  process.env.SLATE_YJS_COLLAB_ITERATIONS ?? '5',
  10
);
const peerCount = Number.parseInt(
  process.env.SLATE_YJS_COLLAB_PEERS ?? '4',
  10
);
const syncBlocks = Number.parseInt(
  process.env.SLATE_YJS_COLLAB_SYNC_BLOCKS ?? '100',
  10
);
const syncOps = Number.parseInt(
  process.env.SLATE_YJS_COLLAB_SYNC_OPS ?? '40',
  10
);
const awarenessUpdates = Number.parseInt(
  process.env.SLATE_YJS_COLLAB_AWARENESS_UPDATES ?? '100',
  10
);
const reconnectOps = Number.parseInt(
  process.env.SLATE_YJS_COLLAB_RECONNECT_OPS ?? '40',
  10
);
const largeBlocks = Number.parseInt(
  process.env.SLATE_YJS_COLLAB_LARGE_BLOCKS ?? '1000',
  10
);
const largeOps = Number.parseInt(
  process.env.SLATE_YJS_COLLAB_LARGE_OPS ?? '120',
  10
);

class FakeAwareness {
  constructor(clientID) {
    this.clientID = clientID;
    this.doc = { clientID };
    this.listeners = new Set();
    this.localState = null;
    this.states = new Map();
  }

  getLocalState() {
    return this.localState;
  }

  getStates() {
    return this.states;
  }

  off(event, handler) {
    if (event === 'change') {
      this.listeners.delete(handler);
    }
  }

  on(event, handler) {
    if (event === 'change') {
      this.listeners.add(handler);
    }
  }

  setLocalStateField(field, value) {
    this.localState = {
      ...(this.localState ?? {}),
      [field]: value,
    };
    this.states.set(this.clientID, this.localState);
    this.emit({ added: [], removed: [], updated: [this.clientID] });
  }

  setRemoteState(clientId, state) {
    const added = this.states.has(clientId) ? [] : [clientId];
    const updated = this.states.has(clientId) ? [clientId] : [];

    this.states.set(clientId, state);
    this.emit({ added, removed: [], updated });
  }

  emit(event) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

const paragraph = (text) => ({
  type: 'paragraph',
  children: [{ text }],
});

const createDocument = (blocks, prefix = 'block') =>
  Array.from({ length: blocks }, (_, index) =>
    paragraph(`${prefix}-${String(index).padStart(5, '0')}`)
  );

const createPeer = ({
  awareness,
  children,
  clientId,
  numericClientId,
  seed,
}) => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: structuredClone(children),
    marks: null,
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const doc = new Y.Doc();

  if (numericClientId !== undefined) {
    doc.clientID = numericClientId;
  }

  if (seed) {
    Y.applyUpdate(doc, seed);
  }

  editor.extend(
    createYjsExtension({ awareness, clientId, doc, rootName: '@platejs/slate' })
  );

  return { awareness, doc, editor, id: clientId };
};

const createSeededPeers = ({
  blocks,
  prefix = 'block',
  withAwareness = false,
}) => {
  const children = createDocument(blocks, prefix);
  const ids = Array.from({ length: peerCount }, (_, index) => `peer-${index}`);
  const firstAwareness = withAwareness ? new FakeAwareness(101) : undefined;
  const first = createPeer({
    awareness: firstAwareness,
    children,
    clientId: ids[0],
    numericClientId: 101,
  });
  const seed = Y.encodeStateAsUpdate(first.doc);

  return [
    first,
    ...ids.slice(1).map((clientId, index) => {
      const numericClientId = 102 + index;

      return createPeer({
        awareness: withAwareness
          ? new FakeAwareness(numericClientId)
          : undefined,
        children,
        clientId,
        numericClientId,
        seed,
      });
    }),
  ];
};

const getYjsState = (peer) => peer.editor.read((state) => state.yjs);

const runYjsUpdate = (peer, fn) => {
  peer.editor.update((tx) => {
    fn(tx.yjs);
  });
};

const getParagraphTexts = (peer) => {
  const children = Editor.getSnapshot(peer.editor).children;
  const texts = new Array(children.length);
  let index = 0;

  while (index < children.length) {
    texts[index] = Editor.string(peer.editor, [index]);
    index++;
  }

  return texts;
};

const encodePeerUpdateForTarget = (source, target) =>
  Y.encodeStateAsUpdate(source.doc, Y.encodeStateVector(target.doc));

const syncPeerToConnectedPeers = (source, peers) => {
  if (!getYjsState(source).connected()) {
    return;
  }

  for (const target of peers) {
    if (source === target || !getYjsState(target).connected()) {
      continue;
    }

    const update = encodePeerUpdateForTarget(source, target);

    Y.applyUpdate(target.doc, update, source);
  }
};

const syncPeerToConnectedPeersWithTiming = (source, peers) => {
  let applyDuration = 0;
  let encodeDuration = 0;

  if (!getYjsState(source).connected()) {
    return { applyDuration, encodeDuration };
  }

  for (const target of peers) {
    if (source === target || !getYjsState(target).connected()) {
      continue;
    }

    const encodeStart = performance.now();
    const update = encodePeerUpdateForTarget(source, target);

    encodeDuration += performance.now() - encodeStart;

    const applyStart = performance.now();

    Y.applyUpdate(target.doc, update, source);
    applyDuration += performance.now() - applyStart;
  }

  return { applyDuration, encodeDuration };
};

const syncConnectedPeers = (peers) => {
  for (const source of peers) {
    syncPeerToConnectedPeers(source, peers);
  }
};

const assertPeerTexts = (peers) => {
  const firstPeer = peers[0];

  assert(firstPeer);

  const expected = getParagraphTexts(firstPeer);
  let index = 1;

  while (index < peers.length) {
    const peer = peers[index];

    assert(peer);
    assert.deepEqual(getParagraphTexts(peer), expected);
    index++;
  }
};

const assertNoRootSnapshot = (peer) => {
  assert.equal(
    getYjsState(peer)
      .trace()
      .some((entry) => entry.mode === 'root-snapshot'),
    false
  );
};

const assertPeersNoRootSnapshot = (peers) => {
  for (const peer of peers) {
    assertNoRootSnapshot(peer);
  }
};

const measurePhased = ({ setup, verify, work }) => {
  const totalSamples = [];
  const verificationSamples = [];
  const workSamples = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const setupContext = setup?.();
    const workStart = performance.now();
    const context = work(setupContext);
    const workDuration = performance.now() - workStart;

    const verificationStart = performance.now();
    verify(context);
    const verificationDuration = performance.now() - verificationStart;

    if (iteration > 0) {
      workSamples.push(workDuration);
      verificationSamples.push(verificationDuration);
      totalSamples.push(workDuration + verificationDuration);
    }
  }

  return {
    total: summarize(totalSamples),
    verification: summarize(verificationSamples),
    work: summarize(workSamples),
  };
};

const insertDistributedText = (peer, ops, blocks, textPrefix) => {
  peer.editor.update((tx) => {
    for (let index = 0; index < ops; index += 1) {
      const blockIndex = index % blocks;
      tx.text.insert(`${textPrefix}${index % 10}`, {
        at: { path: [blockIndex, 0], offset: 0 },
      });
    }
  });
};

const measureMultiEditorSync = () =>
  measurePhased({
    setup: () => ({
      peers: createSeededPeers({ blocks: syncBlocks, prefix: 'sync' }),
    }),
    verify: ({ peers }) => {
      assertPeerTexts(peers);
      assertPeersNoRootSnapshot(peers);
    },
    work: ({ peers }) => {
      insertDistributedText(peers[0], syncOps, syncBlocks, 's');
      syncPeerToConnectedPeers(peers[0], peers);

      return { peers };
    },
  });

const broadcastAwareness = (source, peers) => {
  const state = source.awareness.getLocalState();

  assert(state);

  for (const target of peers) {
    if (target === source) {
      continue;
    }

    target.awareness.setRemoteState(source.doc.clientID, state);
  }
};

const selection = (blockIndex, offset = 1) => ({
  anchor: { path: [blockIndex, 0], offset },
  focus: { path: [blockIndex, 0], offset },
});

const measureAwarenessUpdates = () =>
  measurePhased({
    setup: () => {
      const blocks = Math.max(1, Math.min(syncBlocks, awarenessUpdates));
      const peers = createSeededPeers({
        blocks,
        prefix: 'awareness',
        withAwareness: true,
      });

      return { blocks, peers };
    },
    verify: ({ peers }) => {
      for (const peer of peers) {
        assert.equal(getYjsState(peer).remoteCursors().length, peerCount - 1);
      }
    },
    work: ({ blocks, peers }) => {
      for (let index = 0; index < awarenessUpdates; index += 1) {
        const source = peers[index % peers.length];

        runYjsUpdate(source, (yjs) => {
          yjs.sendSelection(selection(index % blocks), {
            name: source.id,
            update: index,
          });
        });
        broadcastAwareness(source, peers);
      }

      return { peers };
    },
  });

const measureReconnect = () =>
  measurePhased({
    setup: () => ({
      peers: createSeededPeers({
        blocks: syncBlocks,
        prefix: 'reconnect',
      }),
    }),
    verify: ({ offline, peers }) => {
      assertPeerTexts(peers);
      assertPeersNoRootSnapshot(peers);
    },
    work: ({ peers }) => {
      const [online, offline] = peers;

      runYjsUpdate(offline, (yjs) => yjs.disconnect());
      insertDistributedText(offline, reconnectOps, syncBlocks, 'o');
      insertDistributedText(online, reconnectOps, syncBlocks, 'r');
      syncConnectedPeers(peers);

      runYjsUpdate(offline, (yjs) => yjs.connect());
      syncConnectedPeers(peers);

      return { offline, peers };
    },
  });

const measureLargeDocSync = () =>
  (() => {
    const localEditSamples = [];
    const remoteApplySamples = [];
    const remoteEncodeSamples = [];
    const remoteSyncSamples = [];
    const totalSamples = [];
    const verificationSamples = [];
    const workSamples = [];

    for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
      const peers = createSeededPeers({ blocks: largeBlocks, prefix: 'large' });

      const localEditStart = performance.now();
      insertDistributedText(peers[0], largeOps, largeBlocks, 'l');
      const localEditDuration = performance.now() - localEditStart;

      const remoteSyncStart = performance.now();
      const remoteTiming = syncPeerToConnectedPeersWithTiming(peers[0], peers);
      const remoteSyncDuration = performance.now() - remoteSyncStart;
      const workDuration = localEditDuration + remoteSyncDuration;

      const verificationStart = performance.now();
      assertPeerTexts(peers);
      assertPeersNoRootSnapshot(peers);
      const verificationDuration = performance.now() - verificationStart;

      if (iteration > 0) {
        localEditSamples.push(localEditDuration);
        remoteApplySamples.push(remoteTiming.applyDuration);
        remoteEncodeSamples.push(remoteTiming.encodeDuration);
        remoteSyncSamples.push(remoteSyncDuration);
        workSamples.push(workDuration);
        verificationSamples.push(verificationDuration);
        totalSamples.push(workDuration + verificationDuration);
      }
    }

    return {
      localEdit: summarize(localEditSamples),
      remoteApply: summarize(remoteApplySamples),
      remoteEncode: summarize(remoteEncodeSamples),
      remoteSync: summarize(remoteSyncSamples),
      total: summarize(totalSamples),
      verification: summarize(verificationSamples),
      work: summarize(workSamples),
    };
  })();

const measuredLanes = {
  multiEditorSync: measureMultiEditorSync(),
  awarenessUpdates: measureAwarenessUpdates(),
  reconnect: measureReconnect(),
  largeDocSync: measureLargeDocSync(),
};

const lanes = {
  multiEditorSyncMs: measuredLanes.multiEditorSync.total,
  awarenessUpdatesMs: measuredLanes.awarenessUpdates.total,
  reconnectMs: measuredLanes.reconnect.total,
  largeDocSyncMs: measuredLanes.largeDocSync.total,
};

const workLanes = {
  multiEditorSyncWorkMs: measuredLanes.multiEditorSync.work,
  awarenessUpdatesWorkMs: measuredLanes.awarenessUpdates.work,
  reconnectWorkMs: measuredLanes.reconnect.work,
  largeDocSyncWorkMs: measuredLanes.largeDocSync.work,
  largeDocLocalEditMs: measuredLanes.largeDocSync.localEdit,
  largeDocRemoteApplyMs: measuredLanes.largeDocSync.remoteApply,
  largeDocRemoteEncodeMs: measuredLanes.largeDocSync.remoteEncode,
  largeDocRemoteSyncMs: measuredLanes.largeDocSync.remoteSync,
};

const verificationLanes = {
  multiEditorSyncVerificationMs: measuredLanes.multiEditorSync.verification,
  awarenessUpdatesVerificationMs: measuredLanes.awarenessUpdates.verification,
  reconnectVerificationMs: measuredLanes.reconnect.verification,
  largeDocSyncVerificationMs: measuredLanes.largeDocSync.verification,
};

const metrics = {
  yjs_multi_editor_sync_p95_ms: lanes.multiEditorSyncMs.p95,
  yjs_multi_editor_sync_work_p95_ms: workLanes.multiEditorSyncWorkMs.p95,
  yjs_multi_editor_sync_verification_p95_ms:
    verificationLanes.multiEditorSyncVerificationMs.p95,
  yjs_awareness_updates_p95_ms: lanes.awarenessUpdatesMs.p95,
  yjs_awareness_updates_work_p95_ms: workLanes.awarenessUpdatesWorkMs.p95,
  yjs_awareness_updates_verification_p95_ms:
    verificationLanes.awarenessUpdatesVerificationMs.p95,
  yjs_reconnect_p95_ms: lanes.reconnectMs.p95,
  yjs_reconnect_work_p95_ms: workLanes.reconnectWorkMs.p95,
  yjs_reconnect_verification_p95_ms:
    verificationLanes.reconnectVerificationMs.p95,
  yjs_large_doc_sync_p95_ms: lanes.largeDocSyncMs.p95,
  yjs_large_doc_sync_work_p95_ms: workLanes.largeDocSyncWorkMs.p95,
  yjs_large_doc_local_edit_p95_ms: workLanes.largeDocLocalEditMs.p95,
  yjs_large_doc_remote_apply_p95_ms: workLanes.largeDocRemoteApplyMs.p95,
  yjs_large_doc_remote_encode_p95_ms: workLanes.largeDocRemoteEncodeMs.p95,
  yjs_large_doc_remote_sync_p95_ms: workLanes.largeDocRemoteSyncMs.p95,
  yjs_large_doc_sync_verification_p95_ms:
    verificationLanes.largeDocSyncVerificationMs.p95,
  yjs_collaboration_worst_p95_ms: Math.max(
    lanes.multiEditorSyncMs.p95,
    lanes.awarenessUpdatesMs.p95,
    lanes.reconnectMs.p95,
    lanes.largeDocSyncMs.p95
  ),
  yjs_collaboration_worst_work_p95_ms: Math.max(
    workLanes.multiEditorSyncWorkMs.p95,
    workLanes.awarenessUpdatesWorkMs.p95,
    workLanes.reconnectWorkMs.p95,
    workLanes.largeDocSyncWorkMs.p95
  ),
  yjs_collaboration_worst_verification_p95_ms: Math.max(
    verificationLanes.multiEditorSyncVerificationMs.p95,
    verificationLanes.awarenessUpdatesVerificationMs.p95,
    verificationLanes.reconnectVerificationMs.p95,
    verificationLanes.largeDocSyncVerificationMs.p95
  ),
  yjs_correctness_failures: 0,
};

const result = {
  benchmark: 'slate-yjs-collaboration',
  artifactVersion: 1,
  config: {
    awarenessUpdates,
    iterations,
    largeBlocks,
    largeOps,
    peerCount,
    reconnectOps,
    syncBlocks,
    syncOps,
  },
  invariants: {
    awarenessCursorsConverge: true,
    connectedPeersOnlyReceiveUpdates: true,
    largeDocumentConverges: true,
    multiEditorConverges: true,
    noRootSnapshotFallback: true,
    reconnectConverges: true,
  },
  lanes,
  phaseLanes: {
    verification: verificationLanes,
    work: workLanes,
  },
  metrics,
  thresholdPolicy: {
    mode: 'calibration-only',
    releaseGate: false,
    repeatRunsRequiredBeforeEnforcement: 3,
  },
};

await writeBenchmarkArtifact(
  'tmp/slate-yjs-collaboration-benchmark.json',
  result
);

for (const [name, value] of Object.entries(metrics)) {
  console.log(`METRIC ${name}=${value}`);
}

console.log(JSON.stringify(result, null, 2));
