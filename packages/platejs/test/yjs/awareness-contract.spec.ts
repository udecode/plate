import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Descendant, Range } from '../../src/core';
import type { YjsCursorDataSchema } from '../../src/yjs/core';
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

const createAwarePeer = (cursorData?: YjsCursorDataSchema): AwarePeer => {
  const awareness = new FakeAwareness(2);
  const peer = createYjsPeer({
    awareness,
    children: initialValue(),
    clientId: 'b',
    cursorData,
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

describe('platejs/yjs awareness contract', () => {
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

  it('projects remote awareness selections to Plite ranges', () => {
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

  it('validates cursor data at the extension boundary', () => {
    const cursorData: YjsCursorDataSchema<{ readonly name: string }> = {
      validate: (value): value is { readonly name: string } =>
        typeof value === 'object' &&
        value !== null &&
        'name' in value &&
        typeof value.name === 'string',
    };
    const { awareness, peer } = createAwarePeer(cursorData);
    const range = selection([1, 0], 3);

    runYjsUpdate(peer, (yjs) => {
      yjs.sendSelection(range);
      awareness.setRemoteState(101, {
        data: { color: 'tomato' },
        selection: awareness.getLocalState()?.selection,
      });
    });

    assert.deepEqual(getYjsRemoteCursors(peer), [
      { clientId: 101, selection: range },
    ]);
    assert.throws(
      () => runYjsUpdate(peer, (yjs) => yjs.sendCursorData({ color: 'red' })),
      /cursor data does not match its configured schema/
    );

    peer.cleanup();
  });

  it('auto-publishes local selection-only commits', () => {
    const { awareness, peer } = createAwarePeer();
    const range = selection([0, 0], 1);

    clearYjsTrace(peer);
    peer.editor.update.selection.set(range);
    awareness.setRemoteState(101, {
      selection: awareness.getLocalState()?.selection,
    });

    assert.deepEqual(getYjsTrace(peer), []);
    assert.deepEqual(getYjsRemoteCursors(peer)[0]?.selection, range);
  });

  it('publishes root-qualified awareness for a named root', () => {
    const { awareness, peer } = createAwarePeer();
    const headerRange: Range = {
      anchor: { path: [0, 0], offset: 1, root: 'header' },
      focus: { path: [0, 0], offset: 1, root: 'header' },
    };

    peer.editor.update.selection.set(selection([0, 0], 1));
    peer.editor.update.roots.create('header', [paragraph('header')]);
    peer.editor.update.selection.set(headerRange);

    assert.equal(
      (awareness.getLocalState()?.selection as { root?: unknown } | undefined)
        ?.root,
      'header'
    );
    awareness.setRemoteState(101, {
      selection: awareness.getLocalState()?.selection,
    });
    assert.deepEqual(getYjsRemoteCursors(peer)[0]?.selection, headerRange);
  });

  it('rejects selections that span different roots', () => {
    const { awareness, peer } = createAwarePeer();

    peer.editor.update.roots.create('header', [paragraph('header')]);
    runYjsUpdate(peer, (yjs) => {
      yjs.sendSelection({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1, root: 'header' },
      });
    });

    assert.equal(awareness.getLocalState()?.selection, null);
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

    peer.editor.update.nodes.move({ at: [0], to: [2] });

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
