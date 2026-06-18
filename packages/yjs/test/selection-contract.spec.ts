import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant, Range } from '@platejs/slate';

import {
  slatePointToYjsRelativePosition,
  slateRangeToYjsRelativeRange,
  yjsRelativePositionToSlatePoint,
  yjsRelativeRangeToSlateRange,
} from '../src';
import {
  clearYjsTrace,
  createSeededYjsPeers,
  createYjsPeer,
  getYjsRoot,
  getYjsTrace,
  type Peer,
  paragraph,
  syncConnectedPeers,
} from './support/collaboration';

const clientIds = {
  a: 1,
  b: 2,
  c: 3,
} as const;

type ClientId = keyof typeof clientIds;

const initialValue = (): Descendant[] => [
  paragraph('alpha'),
  paragraph('beta'),
  paragraph('gamma'),
];

const createPeer = (clientId: ClientId): Peer =>
  createYjsPeer({
    children: initialValue(),
    clientId,
    numericClientId: clientIds[clientId],
  });

const createPeers = (ids: readonly ClientId[]): Peer[] =>
  createSeededYjsPeers({
    children: initialValue(),
    clientIds: ids,
    numericClientIds: clientIds,
  });

const moveFirstBlockToEnd = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.move({ at: [0], to: [2] });
  });
};

const insertInsideAlpha = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 2 } });
  });
};

const removeFirstBlock = (peer: Peer): void => {
  peer.editor.update((tx) => {
    tx.nodes.remove({ at: [0] });
  });
};

describe('@platejs/yjs selection relative-position contract', () => {
  it('round trips a Slate point through a Yjs relative position', () => {
    const peer = createPeer('b');
    const point = { path: [0, 0], offset: 3 };
    const relative = slatePointToYjsRelativePosition(getYjsRoot(peer), point);

    assert.deepEqual(
      yjsRelativePositionToSlatePoint(getYjsRoot(peer), relative),
      point
    );
  });

  it('clamps Slate point offsets to text bounds before storing relative positions', () => {
    const peer = createPeer('b');
    const beforeStart = slatePointToYjsRelativePosition(getYjsRoot(peer), {
      path: [0, 0],
      offset: -10,
    });
    const afterEnd = slatePointToYjsRelativePosition(getYjsRoot(peer), {
      path: [0, 0],
      offset: 99,
    });

    assert.deepEqual(
      yjsRelativePositionToSlatePoint(getYjsRoot(peer), beforeStart),
      {
        path: [0, 0],
        offset: 0,
      }
    );
    assert.deepEqual(
      yjsRelativePositionToSlatePoint(getYjsRoot(peer), afterEnd),
      {
        path: [0, 0],
        offset: 'alpha'.length,
      }
    );
  });

  it('round trips a Slate range without changing anchor/focus direction', () => {
    const peer = createPeer('b');
    const range: Range = {
      anchor: { path: [1, 0], offset: 4 },
      focus: { path: [0, 0], offset: 1 },
    };
    const relative = slateRangeToYjsRelativeRange(getYjsRoot(peer), range);

    assert.deepEqual(
      yjsRelativeRangeToSlateRange(getYjsRoot(peer), relative),
      range
    );
  });

  it('keeps adjacent text boundary positions distinct', () => {
    const peer = createYjsPeer({
      children: [
        {
          children: [{ text: 'alpha' }, { bold: true, text: 'beta' }],
          type: 'paragraph',
        },
      ],
      clientId: 'b',
      numericClientId: clientIds.b,
    });
    const endOfLeft = { path: [0, 0], offset: 'alpha'.length };
    const startOfRight = { path: [0, 1], offset: 0 };

    assert.deepEqual(
      yjsRelativePositionToSlatePoint(
        getYjsRoot(peer),
        slatePointToYjsRelativePosition(getYjsRoot(peer), endOfLeft)
      ),
      endOfLeft
    );
    assert.deepEqual(
      yjsRelativePositionToSlatePoint(
        getYjsRoot(peer),
        slatePointToYjsRelativePosition(getYjsRoot(peer), startOfRight)
      ),
      startOfRight
    );
  });

  it('rebases a stored point across a concurrent text insert', () => {
    const peers = createPeers(['a', 'b', 'c']);
    const [a, b] = peers;
    const relative = slatePointToYjsRelativePosition(getYjsRoot(b), {
      path: [0, 0],
      offset: 3,
    });

    insertInsideAlpha(a);
    syncConnectedPeers(peers);

    assert.deepEqual(yjsRelativePositionToSlatePoint(getYjsRoot(b), relative), {
      path: [0, 0],
      offset: 4,
    });
  });

  it('resolves a stored point through virtual moved-node identity', () => {
    const peer = createPeer('b');
    const relative = slatePointToYjsRelativePosition(getYjsRoot(peer), {
      path: [0, 0],
      offset: 2,
    });

    moveFirstBlockToEnd(peer);

    assert.deepEqual(
      yjsRelativePositionToSlatePoint(getYjsRoot(peer), relative),
      {
        path: [2, 0],
        offset: 2,
      }
    );
  });

  it('returns null when the relative position target is no longer visible', () => {
    const peer = createPeer('b');
    const relative = slatePointToYjsRelativePosition(getYjsRoot(peer), {
      path: [0, 0],
      offset: 2,
    });

    removeFirstBlock(peer);

    assert.equal(
      yjsRelativePositionToSlatePoint(getYjsRoot(peer), relative),
      null
    );
  });

  it('does not record selection-only conversions in the Yjs operation trace', () => {
    const peer = createPeer('b');

    clearYjsTrace(peer);
    slateRangeToYjsRelativeRange(getYjsRoot(peer), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    });

    assert.deepEqual(getYjsTrace(peer), []);
  });
});
