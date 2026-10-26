import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { createAuthoredPlugin } from '../../src/authored/authored';
import { releaseEditorViewLifetime } from '../../src/core/editor-view-lifetime';
import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  type Descendant,
  type Range,
  schema,
} from '../../src/index';
import { getDefined } from '../../src/internal/get-defined';
import type { YjsCursorDataSchema } from '../../src/yjs/core';
import { getActiveYjsController } from '../../src/yjs/core/controller-registry';
import {
  clearYjsTrace,
  createYjsPeer,
  createYjsPeerWithEditor,
  disconnectYjsPeer,
  FakeAwareness,
  getYjsAwarenessRevision,
  getYjsRemoteCursorCacheMetrics,
  getYjsRemoteCursorIds,
  getYjsRemoteCursors,
  getYjsTrace,
  type Peer,
  paragraph,
  readEditorYjsState,
  readPeerChildren,
  runYjsUpdate,
  subscribeYjsAwareness,
  subscribeYjsRemoteCursor,
  syncConnectedPeers,
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

describe('plitejs/yjs awareness contract', () => {
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

  it('reuses decoded endpoints for metadata-only awareness updates', () => {
    const { awareness, peer } = createAwarePeer();
    const range = selection([1, 0], 3);

    sendRemoteSelection(peer, awareness, range);

    const selectionBefore = getYjsRemoteCursors(peer)[0]?.selection;
    const idsBefore = getYjsRemoteCursorIds(peer);
    const metricsBefore = getYjsRemoteCursorCacheMetrics(peer);
    const remoteSelection = awareness.getStates().get(101)?.selection;

    awareness.setRemoteState(101, {
      data: { name: 'Grace' },
      selection: remoteSelection,
    });

    const metricsAfter = getYjsRemoteCursorCacheMetrics(peer);
    const cursor = getYjsRemoteCursors(peer)[0];

    assert.equal(cursor?.selection, selectionBefore);
    assert.equal(getYjsRemoteCursorIds(peer), idsBefore);
    assert.deepEqual(cursor?.data, { name: 'Grace' });
    assert.equal(
      metricsAfter.clientDecodeCount,
      metricsBefore.clientDecodeCount + 1
    );
    assert.equal(
      metricsAfter.cursorResolutionPassCount,
      metricsBefore.cursorResolutionPassCount
    );
    assert.equal(
      metricsAfter.endpointConversionCount,
      metricsBefore.endpointConversionCount
    );
  });

  it('notifies only the changed remote cursor subscriber', () => {
    const { awareness, peer } = createAwarePeer();

    sendRemoteSelection(peer, awareness, selection(), 101);
    sendRemoteSelection(peer, awareness, selection([1, 0], 1), 102);

    let firstNotifications = 0;
    let secondNotifications = 0;
    const unsubscribeFirst = subscribeYjsRemoteCursor(peer, 101, () => {
      firstNotifications += 1;
    });
    const unsubscribeSecond = subscribeYjsRemoteCursor(peer, 102, () => {
      secondNotifications += 1;
    });

    awareness.setRemoteState(101, {
      data: { name: 'Grace' },
      selection: awareness.getStates().get(101)?.selection,
    });

    assert.equal(firstNotifications, 1);
    assert.equal(secondNotifications, 0);

    unsubscribeFirst();
    unsubscribeSecond();
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

  it('validates cursor data at the plugin boundary', () => {
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

  it('gives the last selection-changing view ownership and ignores stale cleanup', () => {
    const { awareness, peer } = createAwarePeer();
    const first = createEditorView(peer.editor);
    const second = createEditorView(peer.editor);
    const firstRange = selection([0, 0], 1);
    const secondRange = selection([1, 0], 2);
    const controller = getActiveYjsController(peer.editor);

    assert.ok(controller);

    first.update.selection.set(firstRange);
    controller.presenceApi(first).syncSelection();
    second.update.selection.set(secondRange);
    controller.presenceApi(second).syncSelection();

    const ownedSelection = awareness.getLocalState()?.selection;

    releaseEditorViewLifetime(first);
    assert.equal(awareness.getLocalState()?.selection, ownedSelection);

    releaseEditorViewLifetime(second);
    assert.equal(awareness.getLocalState()?.selection, null);

    peer.cleanup();
  });

  for (const [label, preview] of [
    [
      'an authored preview',
      (editor: Peer['editor']) =>
        createEditorView(editor, { authored: { preview: 'proposed' } }),
    ],
    [
      'an editor set to an authored preview',
      (
        editor: Peer['editor'],
        plugin: ReturnType<typeof createAuthoredPlugin>
      ) => {
        editor.plugin(plugin).api.setView({ preview: 'proposed' });

        return editor;
      },
    ],
  ] as const) {
    it(`publishes the stored selection from ${label} that hides it`, () => {
      const awareness = new FakeAwareness(2);
      const plugin = createAuthoredPlugin({ authorId: 'alice' });
      const peer = createYjsPeerWithEditor(
        createEditor({
          initialValue: [paragraph('')],
          plugins: [plugin],
        }),
        {
          awareness,
          children: [
            {
              children: [
                { text: 'This ' },
                {
                  authored: [
                    {
                      at: 1,
                      author: 'carol',
                      change: 'carol:1',
                      kind: 'delete',
                    },
                  ],
                  text: 'extra ',
                },
                { text: 'sentence can go.' },
              ],
              type: 'paragraph',
            },
          ],
          clientId: 'b',
          numericClientId: 2,
        }
      );
      const controller = getActiveYjsController(peer.editor);

      assert.ok(controller);

      peer.editor.update.selection.set(selection([0, 1], 3));
      controller.presenceApi(peer.editor).syncSelection();
      const stored = awareness.getLocalState()?.selection;

      controller.presenceApi(preview(peer.editor, plugin)).syncSelection();

      assert.deepEqual(awareness.getLocalState()?.selection, stored);

      peer.cleanup();
    });
  }

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

  it('keeps awareness visible until its owner expires the remote state', () => {
    const { awareness, peer } = createAwarePeer();

    sendRemoteSelection(peer, awareness, selection());
    disconnectYjsPeer(peer);

    assert.equal(getYjsRemoteCursors(peer).length, 1);

    awareness.removeRemoteState(101);

    assert.deepEqual(getYjsRemoteCursors(peer), []);
  });

  it('excludes the local awareness client and removes expired remote cursors', () => {
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

    awareness.removeRemoteState(101);

    assert.equal(yjs.remoteCursor(101), null);
  });

  it('increments awareness revision on remote changes', () => {
    const { awareness, peer } = createAwarePeer();
    const before = getYjsAwarenessRevision(peer);

    sendRemoteSelection(peer, awareness, selection());

    assert.equal(getYjsAwarenessRevision(peer) > before, true);
  });

  it('notifies remote-cursor subscribers only for remote changes', () => {
    const { awareness, peer } = createAwarePeer();
    let notifications = 0;
    const unsubscribe = subscribeYjsAwareness(peer, () => {
      notifications += 1;
    });

    sendRemoteSelection(peer, awareness, selection());
    unsubscribe();
    sendRemoteSelection(peer, awareness, selection([1, 0], 1));

    assert.equal(notifications, 1);
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

    const metricsBefore = getYjsRemoteCursorCacheMetrics(peer);

    peer.editor.update.nodes.move({ at: [0], to: [2] });

    const metricsAfter = getYjsRemoteCursorCacheMetrics(peer);

    assert.deepEqual(getYjsRemoteCursors(peer)[0]?.selection, {
      anchor: { path: [2, 0], offset: 2 },
      focus: { path: [2, 0], offset: 2 },
    });
    assert.equal(
      metricsAfter.endpointConversionCount,
      metricsBefore.endpointConversionCount
    );
  });

  it('keeps the binding ready and shares carets in a line that Enter before a link starts', () => {
    const InlineSchema = defineEditorSchema('schema:yjs-awareness-inline', {
      elements: {
        link: { content: schema.content.text(), inline: true },
        paragraph: { content: schema.content.open() },
      },
      root: schema.content.not(schema.content.text()),
      unknown: 'preserve',
    });
    const children: Descendant[] = [
      {
        type: 'paragraph',
        children: [
          { text: 'word' },
          { type: 'link', children: [{ text: 'LINK' }] },
          { text: 'tail' },
        ],
      },
    ];
    const create = (numericClientId: number, seedUpdate?: Uint8Array) => {
      const awareness = new FakeAwareness(numericClientId);
      const peer = createYjsPeerWithEditor(
        createEditor({ initialValue: children, plugins: [InlineSchema] }),
        {
          awareness,
          children,
          clientId: String(numericClientId),
          numericClientId,
          seedUpdate,
        }
      );

      return { awareness, peer };
    };
    const a = create(1);
    const b = create(2, Y.encodeStateAsUpdate(a.peer.doc));
    const caret = (path: number[], offset: number): Range => ({
      anchor: { path, offset },
      focus: { path, offset },
    });

    runYjsUpdate(a.peer, (yjs) => yjs.sendSelection(caret([0, 0], 4)));
    a.peer.editor.update((tx) => {
      tx.selection.set({ kind: 'text', ...caret([0, 0], 4) });
      tx.break.insert();
    });
    syncConnectedPeers([a.peer, b.peer]);
    syncConnectedPeers([b.peer, a.peer]);

    const split: Descendant[] = [
      paragraph('word'),
      {
        type: 'paragraph',
        children: [
          { text: '' },
          { type: 'link', children: [{ text: 'LINK' }] },
          { text: 'tail' },
        ],
      },
    ];

    assert.deepEqual(readPeerChildren(a.peer), split);
    assert.deepEqual(readPeerChildren(b.peer), split);
    assert.equal(a.peer.editor.api.yjs.admissionStatus().state, 'ready');

    for (const point of [
      caret([1, 0], 0),
      caret([1, 1, 0], 1),
      caret([1, 2], 1),
    ]) {
      runYjsUpdate(a.peer, (yjs) => yjs.sendSelection(point));
      b.awareness.setRemoteState(1, getDefined(a.awareness.getLocalState()));
      assert.deepEqual(getYjsRemoteCursors(b.peer)[0]?.selection, point);
    }

    a.peer.editor.update.text.insert('Y', { at: { path: [1, 2], offset: 0 } });
    syncConnectedPeers([a.peer, b.peer]);

    assert.equal(a.peer.editor.api.yjs.admissionStatus().state, 'ready');
    assert.deepEqual(readPeerChildren(b.peer)[1], {
      type: 'paragraph',
      children: [
        { text: '' },
        { type: 'link', children: [{ text: 'LINK' }] },
        { text: 'Ytail' },
      ],
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
