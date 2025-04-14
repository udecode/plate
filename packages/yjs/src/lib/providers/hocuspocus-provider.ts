import type {
  HocuspocusProviderConfiguration,
  onDisconnectParameters,
  onSyncedParameters,
} from '@hocuspocus/provider';
import type { Awareness } from 'y-protocols/awareness';
import type * as Y from 'yjs';

import { HocuspocusProvider } from '@hocuspocus/provider';

import type {
  ProviderEventHandlers,
  UnifiedProvider,
  YjsProviderType,
} from './types';

export class HocuspocusProviderWrapper implements UnifiedProvider {
  // Track connection and sync state
  private _isConnected = false;
  private _isSynced = false;
  private handlers?: ProviderEventHandlers;

  private provider: HocuspocusProvider;

  destroy = () => {
    if (this._isConnected) {
      this.provider.disconnect();
    }
  };

  disconnect = () => {
    if (this._isConnected) {
      this.provider.disconnect();
      this._isConnected = false;

      // If we were synced, notify about sync state change
      if (this._isSynced) {
        this._isSynced = false;
        this.handlers?.onSyncChange?.(false);
      }
    }
  };

  type: YjsProviderType = 'hocuspocus';

  constructor(
    options: HocuspocusProviderConfiguration,
    handlers?: ProviderEventHandlers,
    existingDoc?: Y.Doc,
    sharedAwareness?: Awareness
  ) {
    this.handlers = handlers;

    // If an existing Y.Doc is provided, ensure it's passed to the HocuspocusProvider
    const providerOptions: HocuspocusProviderConfiguration = {
      ...options,
      ...(existingDoc && { document: existingDoc }),
      ...(sharedAwareness && { awareness: sharedAwareness }),
      // Disable broadcast channel here - we'll manually handle connections
      broadcast: options.broadcast || false,
      onAwarenessChange: options.onAwarenessChange || (() => {}),
      onConnect: () => {
        this._isConnected = true;
        handlers?.onConnect?.();
        options.onConnect?.();
      },
      onDisconnect: (data: onDisconnectParameters) => {
        this._isConnected = false;

        // If we were synced, notify about sync state change
        if (this._isSynced) {
          this._isSynced = false;
          handlers?.onSyncChange?.(false);
        }

        handlers?.onDisconnect?.();
        options.onDisconnect?.(data);
      },
      onSynced: (data: onSyncedParameters) => {
        const wasSynced = this._isSynced;
        this._isSynced = true;

        // Call onSyncChange only when sync state changes
        if (!wasSynced) {
          handlers?.onSyncChange?.(true);
        }

        options.onSynced?.(data);
      },
    };

    try {
      this.provider = new HocuspocusProvider(providerOptions);
    } catch (error) {
      console.warn('[yjs] Error creating Hocuspocus provider:', error);
      // Create a minimal provider that won't try to connect
      this.provider = new HocuspocusProvider({
        ...providerOptions,
        connect: false,
      });
      handlers?.onError?.(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  connect() {
    try {
      void this.provider.connect();
    } catch (error) {
      console.warn('[yjs] Error connecting to Hocuspocus provider:', error);
      this._isConnected = false;
    }
  }

  get awareness() {
    return this.provider.awareness!;
  }

  get document() {
    return this.provider.document;
  }

  get isConnected() {
    return this._isConnected;
  }

  get isSynced() {
    return this._isSynced;
  }
}
