import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant, Range } from '@platejs/slate';

import {
  clearYjsTrace,
  connectYjsPeer,
  createYjsPeer,
  disconnectYjsPeer,
  FakeAwareness,
  getYjsAwarenessRevision,
  getYjsRemoteCursors,
  getYjsTrace,
  type Peer,
  paragraph,
  readEditorYjsState,
  runYjsUpdate,
  subscribeYjsAwareness,
} from './support/collaboration';

type AwarePeer = {
  readonly awareness: FakeAwareness;
  readonly peer: Peer;
};

const initialValue = (): Descendant[] => [
  paragraph('alpha'),
  paragraph('beta'),
  paragraph('gamma'),
];

const selection = (
  path: Range['anchor']['path'] = [0, 0],
  offset = 2
): Range => ({
  anchor: { path, offset },
  focus: { path, offset },
});

const createAwarePeer = (): AwarePeer => {
  const awareness = new FakeAwareness(2);
  const peer = createYjsPeer({
    awareness,
    children: initialValue(),
    clientId: 'b',
    numericClientId: 2,
  });

  return { awareness, peer };
};

const sendRemoteSelection = (
  peer: Peer,
  awareness: FakeAwareness,
  range: Range,
  clientId = 101
): void => {
  runYjsUpdate(peer, (yjs) => {
    yjs.sendSelection(range);
    awareness.setRemoteState(clientId, {
      data: { name: 'Ada' },
      selection: awareness.getLocalState()?.selection,
    });
  });
};

describe('@platejs/yjs awareness contract', () => {
  it('publishes local selections as relative positions without changing document trace', () => {
    const { awareness, peer } = createAwarePeer();
    const range = selection([1, 0], 3);

    runYjsUpdate(peer, (yjs) => {
      yjs.clearTrace();
      yjs.sendSelection(range, { name: 'B' });
    });

    assert.deepEqual(awareness.getLocalState()?.data, { name: 'B' });
    assert.deepEqual(getYjsTrace(peer), []);
    assert.deepEqual(getYjsRemoteCursors(peer), []);
  });

  it('projects remote awareness selections to Slate ranges', () => {
    const { awareness, peer } = createAwarePeer();
    const range = selection([1, 0], 3);

    sendRemoteSelection(peer, awareness, range);

    assert.deepEqual(getYjsRemoteCursors(peer), [
      {
        clientId: 101,
        data: { name: 'Ada' },
        selection: range,
      },
    ]);
  });

  it('ignores non-record remote cursor data', () => {
    const { awareness, peer } = createAwarePeer();
    const range = selection([1, 0], 3);

    runYjsUpdate(peer, (yjs) => {
      yjs.sendSelection(range);
      awareness.setRemoteState(101, {
        data: null,
        selection: awareness.getLocalState()?.selection,
      });
      awareness.setRemoteState(102, {
        data: ['Ada'],
        selection: awareness.getLocalState()?.selection,
      });
    });

    assert.deepEqual(getYjsRemoteCursors(peer), [
      { clientId: 101, selection: range },
      { clientId: 102, selection: range },
    ]);
  });

  it('auto-publishes local selection commits without document operations', () => {
    const { awareness, peer } = createAwarePeer();
    const range = selection([0, 0], 1);

    clearYjsTrace(peer);
    peer.editor.update((tx) => {
      tx.selection.set(range);
    });
    awareness.setRemoteState(101, {
      selection: awareness.getLocalState()?.selection,
    });

    assert.deepEqual(getYjsTrace(peer), []);
    assert.deepEqual(getYjsRemoteCursors(peer)[0]?.selection, range);
  });

  it('does not expose remote cursors while disconnected', () => {
    const { awareness, peer } = createAwarePeer();

    sendRemoteSelection(peer, awareness, selection());
    disconnectYjsPeer(peer);

    assert.deepEqual(getYjsRemoteCursors(peer), []);

    connectYjsPeer(peer);

    assert.equal(getYjsRemoteCursors(peer).length, 1);
  });

  it('gates single remote cursor reads by connection and local client id', () => {
    const { awareness, peer } = createAwarePeer();
    const range = selection([1, 0], 3);
    const yjs = readEditorYjsState(peer.editor);

    sendRemoteSelection(peer, awareness, range);

    assert.deepEqual(yjs.remoteCursor(101), {
      clientId: 101,
      data: { name: 'Ada' },
      selection: range,
    });
    assert.equal(yjs.remoteCursor(2), null);

    disconnectYjsPeer(peer);

    assert.equal(yjs.remoteCursor(101), null);
  });

  it('increments awareness revision on remote changes', () => {
    const { awareness, peer } = createAwarePeer();
    const before = getYjsAwarenessRevision(peer);

    sendRemoteSelection(peer, awareness, selection());

    assert.equal(getYjsAwarenessRevision(peer) > before, true);
  });

  it('notifies awareness subscribers on remote changes', () => {
    const { awareness, peer } = createAwarePeer();
    let notifications = 0;
    const unsubscribe = subscribeYjsAwareness(peer, () => {
      notifications += 1;
    });

    sendRemoteSelection(peer, awareness, selection());
    unsubscribe();
    sendRemoteSelection(peer, awareness, selection([1, 0], 1));

    assert.equal(notifications, 2);
  });

  it('does not notify awareness subscribers for unchanged local cursor payloads', () => {
    const { peer } = createAwarePeer();
    const range = selection();
    let notifications = 0;
    const unsubscribe = subscribeYjsAwareness(peer, () => {
      notifications += 1;
    });

    runYjsUpdate(peer, (yjs) => {
      yjs.sendSelection(range, { name: 'Ada' });
    });
    notifications = 0;
    runYjsUpdate(peer, (yjs) => {
      yjs.sendSelection(range, { name: 'Ada' });
    });

    assert.equal(notifications, 0);

    unsubscribe();
  });

  it('does not notify awareness subscribers for equivalent nested cursor payloads', () => {
    const { peer } = createAwarePeer();
    const range = selection();
    let notifications = 0;
    const unsubscribe = subscribeYjsAwareness(peer, () => {
      notifications += 1;
    });

    runYjsUpdate(peer, (yjs) => {
      yjs.sendSelection(range, {
        name: 'Ada',
        palette: ['tomato', 'white'],
        profile: { role: 'reviewer', accent: undefined },
      });
    });
    notifications = 0;
    runYjsUpdate(peer, (yjs) => {
      yjs.sendSelection(range, {
        name: 'Ada',
        palette: ['tomato', 'white'],
        profile: { role: 'reviewer' },
      });
    });

    assert.equal(notifications, 0);

    unsubscribe();
  });

  it('rebases remote selections through virtual moved-node identity', () => {
    const { awareness, peer } = createAwarePeer();

    sendRemoteSelection(peer, awareness, selection([0, 0], 2));

    peer.editor.update((tx) => {
      tx.nodes.move({ at: [0], to: [2] });
    });

    assert.deepEqual(getYjsRemoteCursors(peer)[0]?.selection, {
      anchor: { path: [2, 0], offset: 2 },
      focus: { path: [2, 0], offset: 2 },
    });
  });

  it('clears the local awareness selection without clearing cursor data', () => {
    const { awareness, peer } = createAwarePeer();

    runYjsUpdate(peer, (yjs) => {
      yjs.sendSelection(selection(), { name: 'B' });
      yjs.clearSelection();
    });

    assert.deepEqual(awareness.getLocalState(), {
      data: { name: 'B' },
      selection: null,
    });
  });

  it('clears standalone awareness selection during editor cleanup', () => {
    const { awareness, peer } = createAwarePeer();

    runYjsUpdate(peer, (yjs) => {
      yjs.sendSelection(selection(), { name: 'B' });
    });

    peer.cleanup();

    assert.deepEqual(awareness.getLocalState(), {
      data: { name: 'B' },
      selection: null,
    });
  });
});
