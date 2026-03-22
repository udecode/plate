import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

import type { UnifiedProvider } from '../providers/types';
import { mockFn } from './mockFn';

export type MockProvider = Omit<
  UnifiedProvider,
  'connect' | 'destroy' | 'disconnect'
> & {
  connect: ReturnType<typeof mockFn<() => void>>;
  destroy: ReturnType<typeof mockFn<() => void>>;
  disconnect: ReturnType<typeof mockFn<() => void>>;
  setConnected: (value: boolean) => void;
  setSynced: (value: boolean) => void;
};

export const createMockProvider = ({
  awareness,
  connected = false,
  document,
  onConnect,
  onDestroy,
  onDisconnect,
  synced = false,
  type = 'webrtc',
}: {
  awareness?: Awareness;
  connected?: boolean;
  document?: Y.Doc;
  onConnect?: () => void;
  onDestroy?: () => void;
  onDisconnect?: () => void;
  synced?: boolean;
  type?: string;
} = {}): MockProvider => {
  let isConnected = connected;
  let isSynced = synced;
  const ydoc = document ?? new Y.Doc({ guid: `mock-${type}` });

  return {
    awareness: awareness ?? new Awareness(ydoc as any),
    connect: mockFn(() => {
      isConnected = true;
      onConnect?.();
    }),
    destroy: mockFn(() => {
      isConnected = false;
      onDestroy?.();
    }),
    disconnect: mockFn(() => {
      isConnected = false;
      isSynced = false;
      onDisconnect?.();
    }),
    document: ydoc,
    get isConnected() {
      return isConnected;
    },
    get isSynced() {
      return isSynced;
    },
    setConnected(value) {
      isConnected = value;
    },
    setSynced(value) {
      isSynced = value;
    },
    type,
  };
};
