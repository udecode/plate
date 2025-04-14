import type { Awareness } from 'y-protocols/awareness';

import { WebrtcProvider as YWebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

import type {
  ProviderEventHandlers,
  UnifiedProvider,
  WebRTCProviderOptions,
  YjsProviderType,
} from './types';

export class WebRTCProviderWrapper implements UnifiedProvider {
  // Track connection and sync state
  private _isConnected = false;
  private _isSynced = false;
  private doc: Y.Doc;

  private handlers?: ProviderEventHandlers;
  // Create a fallback awareness instance for when provider is null
  private provider: YWebrtcProvider | null = null;

  connect = () => {
    if (this.provider) {
      try {
        this.provider.connect();
      } catch (error) {
        console.warn('[yjs] Error connecting WebRTC provider:', error);
      }
    }
  };

  destroy = () => {
    if (this.provider) {
      try {
        this.provider.destroy();
      } catch (error) {
        console.warn('[yjs] Error destroying WebRTC provider:', error);
      }
    }
  };

  disconnect = () => {
    if (this.provider) {
      try {
        this.provider.disconnect();
        const wasConnected = this._isConnected;
        const wasSynced = this._isSynced;

        this._isConnected = false;
        this._isSynced = false;

        // If we were synced, notify about sync state change
        if (wasSynced) {
          this.handlers?.onSyncChange?.(false);
        }
      } catch (error) {
        console.warn('[yjs] Error disconnecting WebRTC provider:', error);
      }
    }
  };

  type: YjsProviderType = 'webrtc';

  constructor(
    options: WebRTCProviderOptions,
    handlers?: ProviderEventHandlers,
    existingDoc?: Y.Doc,
    sharedAwareness?: Awareness
  ) {
    this.handlers = handlers;
    this.doc = existingDoc || new Y.Doc();
    try {
      this.provider = new YWebrtcProvider(options.roomName, this.doc, {
        awareness: sharedAwareness,
        filterBcConns: options.filterBcConns,
        maxConns: options.maxConns,
        password: options.password,
        peerOpts: options.peerOpts,
        signaling: options.signaling,
      });

      // Set connection status
      this.provider.on('status', (status: { connected: boolean }) => {
        const wasConnected = this._isConnected;
        const wasSynced = this._isSynced;

        this._isConnected = status.connected;

        // WebRTC treats connected as synced for most purposes
        // But we track them separately to be consistent with other providers
        if (status.connected) {
          this._isSynced = true;

          // Notify about connection
          if (!wasConnected) {
            handlers?.onConnect?.();
          }

          // Notify about sync state change
          if (!wasSynced) {
            handlers?.onSyncChange?.(true);
          }
        } else {
          // Handle disconnection and sync state change
          if (wasConnected) {
            handlers?.onDisconnect?.();
          }

          // If we were synced, notify about sync state change
          if (wasSynced) {
            this._isSynced = false;
            handlers?.onSyncChange?.(false);
          }
        }
      });

      this.provider.on('synced', ({ synced }: { synced: boolean }) => {
        const wasSynced = this._isSynced;
        this._isSynced = synced;

        // Notify about sync state change only when it changes
        if (synced !== wasSynced) {
          handlers?.onSyncChange?.(synced);
        }
      });
    } catch (error) {
      console.warn('[yjs] Error creating WebRTC provider:', error);
      handlers?.onError?.(
        error instanceof Error ? error : new Error(String(error))
      );
      // Don't throw, just log the error - the provider will be null
    }
  }

  get awareness(): Awareness {
    return this.provider!.awareness;
  }

  get document() {
    return this.doc;
  }

  get isConnected() {
    return this._isConnected;
  }

  get isSynced() {
    return this._isSynced;
  }
}
