import { slateNodesToInsertDelta, yTextToSlateElement } from '@slate-yjs/core';
import { createSlateEditor } from 'platejs';
import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

import { createMockProvider } from '../createMockProvider';
import { BaseYjsPlugin } from '../../BaseYjsPlugin';
import { registerProviderType } from '../../providers';

const REMOTE_ORIGIN = Symbol('yjs-test-remote');
const PROVIDER_TYPE = `test-collaboration-${Math.random()
  .toString(36)
  .slice(2)}`;

type CollaborationProviderOptions = {
  connector: CollaborationConnector;
  peerId: string;
};

type FlushOptions = {
  order?: 'fifo' | 'reverse';
};

export class CollaborationConnector {
  private readonly peers = new Map<string, TestCollaborationProvider>();
  private readonly queue: { to: string; update: Uint8Array }[] = [];

  connect(peer: TestCollaborationProvider) {
    this.peers.set(peer.peerId, peer);

    if (peer.isConnected) {
      return;
    }

    peer.attach();
    peer.setConnected(true);
    peer.handleConnect();

    const connectedPeers = [...this.peers.values()].filter(
      (currentPeer) =>
        currentPeer.peerId !== peer.peerId && currentPeer.isConnected
    );

    if (connectedPeers.length === 0) {
      peer.markSynced(true);
      return;
    }

    for (const currentPeer of connectedPeers) {
      this.queueState(currentPeer, peer);
      this.queueState(peer, currentPeer);
    }
  }

  disconnect(peer: TestCollaborationProvider) {
    if (!peer.isConnected) {
      return;
    }

    peer.detach();
    peer.setConnected(false);
    peer.markSynced(false);
    peer.handleDisconnect();
  }

  enqueue(fromPeer: TestCollaborationProvider, update: Uint8Array) {
    for (const peer of this.peers.values()) {
      if (peer.peerId === fromPeer.peerId || !peer.isConnected) {
        continue;
      }

      this.queue.push({ to: peer.peerId, update });
    }
  }

  async flushAll({ order = 'fifo' }: FlushOptions = {}) {
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0);

      if (order === 'reverse') {
        batch.reverse();
      }

      for (const { to, update } of batch) {
        const peer = this.peers.get(to);

        if (!peer || !peer.isConnected) {
          continue;
        }

        Y.applyUpdate(peer.document, update, REMOTE_ORIGIN);
        peer.markSynced(true);
      }

      await settle();
    }
  }

  providerConfig(peerId: string): any {
    return {
      options: {
        connector: this,
        peerId,
      },
      type: PROVIDER_TYPE,
    };
  }

  providerInstance(peerId: string, document?: Y.Doc, awareness?: Awareness) {
    return new TestCollaborationProvider({
      awareness,
      doc: document,
      onConnect: () => {},
      onDisconnect: () => {},
      onError: () => {},
      onSyncChange: () => {},
      options: {
        connector: this,
        peerId,
      },
    });
  }

  private queueState(
    fromPeer: TestCollaborationProvider,
    toPeer: TestCollaborationProvider
  ) {
    this.queue.push({
      to: toPeer.peerId,
      update: Y.encodeStateAsUpdate(fromPeer.document),
    });
  }
}

class TestCollaborationProvider {
  awareness: Awareness;
  document: Y.Doc;
  isConnected = false;
  isSynced = false;
  readonly peerId: string;
  readonly type = PROVIDER_TYPE;
  private readonly connector: CollaborationConnector;
  private readonly onConnect?: () => void;
  private readonly onDisconnect?: () => void;
  private readonly onSyncChange?: (isSynced: boolean) => void;
  private updateHandler?: (update: Uint8Array, origin: unknown) => void;

  constructor({
    awareness,
    doc,
    onConnect,
    onDisconnect,
    onSyncChange,
    options,
  }: {
    awareness?: Awareness;
    doc?: Y.Doc;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
    onSyncChange?: (isSynced: boolean) => void;
    options: CollaborationProviderOptions;
  }) {
    this.document = doc ?? new Y.Doc({ guid: options.peerId });
    this.awareness = awareness ?? new Awareness(this.document as any);
    this.connector = options.connector;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
    this.onSyncChange = onSyncChange;
    this.peerId = options.peerId;
  }

  connect = () => {
    this.connector.connect(this);
  };

  destroy = () => {
    this.connector.disconnect(this);
  };

  disconnect = () => {
    this.connector.disconnect(this);
  };

  attach() {
    if (this.updateHandler) {
      return;
    }

    this.updateHandler = (update, origin) => {
      if (origin === REMOTE_ORIGIN) {
        return;
      }

      this.connector.enqueue(this, update);
    };

    this.document.on('update', this.updateHandler);
  }

  detach() {
    if (!this.updateHandler) {
      return;
    }

    this.document.off('update', this.updateHandler);
    this.updateHandler = undefined;
  }

  handleConnect() {
    this.onConnect?.();
  }

  handleDisconnect() {
    this.onDisconnect?.();
  }

  markSynced(isSynced: boolean) {
    if (this.isSynced === isSynced) {
      return;
    }

    this.isSynced = isSynced;
    this.onSyncChange?.(isSynced);
  }

  setConnected(isConnected: boolean) {
    this.isConnected = isConnected;
  }
}

registerProviderType(PROVIDER_TYPE, TestCollaborationProvider as any);

export const createCollaborationEditor = ({
  connector,
  peerId,
  providers,
  sharedType,
  value,
  ydoc,
}: {
  connector: CollaborationConnector;
  peerId: string;
  providers?: any[];
  sharedType?: Y.XmlText | null;
  value?: any;
  ydoc?: Y.Doc;
}) => {
  const editor = createSlateEditor({
    plugins: [
      BaseYjsPlugin.configure({
        options: {
          providers: providers ?? [connector.providerConfig(peerId)],
          ...(sharedType ? { sharedType } : {}),
          ...(ydoc ? { ydoc } : {}),
        },
      }),
    ],
    value,
  });

  return editor;
};

export const createMixedProviderEditor = ({
  connector,
  peerId,
  value,
}: {
  connector: CollaborationConnector;
  peerId: string;
  value?: any;
}) => {
  const ydoc = new Y.Doc({ guid: `mixed-${peerId}` });
  const awareness = new Awareness(ydoc as any);
  const passiveProvider = createMockProvider({
    awareness,
    document: ydoc,
    type: 'passive',
  });
  const editor = createSlateEditor({
    plugins: [
      BaseYjsPlugin.configure({
        options: {
          awareness,
          providers: [connector.providerConfig(peerId), passiveProvider],
          ydoc,
        },
      }),
    ],
    value,
  });

  return { editor, passiveProvider };
};

export const getDocChildren = ({
  sharedType,
  ydoc,
}: {
  sharedType?: Y.XmlText | null;
  ydoc: Y.Doc;
}) => {
  const content =
    sharedType ?? (ydoc.get('content', Y.XmlText) as Y.XmlText | null);

  if (!content) {
    return [];
  }

  return yTextToSlateElement(content).children;
};

export const initEditor = async ({
  connector,
  editor,
  flushBeforeAwait = false,
  init,
}: {
  connector: CollaborationConnector;
  editor: any;
  flushBeforeAwait?: boolean;
  init: Record<string, unknown>;
}) => {
  const initPromise = editor.api.yjs.init(init);

  if (flushBeforeAwait) {
    await connector.flushAll();
  }

  await initPromise;
  await connector.flushAll();
  await settle();

  return editor;
};

export const replaceSharedContent = async ({
  sharedType,
  value,
  ydoc,
}: {
  sharedType?: Y.XmlText | null;
  value: any;
  ydoc: Y.Doc;
}) => {
  const content =
    sharedType ?? (ydoc.get('content', Y.XmlText) as Y.XmlText | null);

  if (!content) {
    throw new Error('Missing shared content');
  }

  if (content.length > 0) {
    content.delete(0, content.length);
  }

  content.applyDelta(slateNodesToInsertDelta(value));
  await settle();
};

export const appendSharedContent = async ({
  sharedType,
  value,
  ydoc,
}: {
  sharedType?: Y.XmlText | null;
  value: any;
  ydoc: Y.Doc;
}) => {
  const content =
    sharedType ?? (ydoc.get('content', Y.XmlText) as Y.XmlText | null);

  if (!content) {
    throw new Error('Missing shared content');
  }

  content.applyDelta([
    { retain: content.length },
    ...slateNodesToInsertDelta(value),
  ]);
  await settle();
};

export const runWithImmediateTimeout = async (fn: () => Promise<void>) => {
  const setTimeoutSpy = spyOn(globalThis, 'setTimeout').mockImplementation(((
    callback: TimerHandler
  ) => {
    queueMicrotask(() => {
      (callback as () => void)();
    });

    return 1 as any;
  }) as any);

  try {
    await fn();
  } finally {
    setTimeoutSpy.mockRestore();
  }
};

export const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
};
