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
  private readonly doc: Y.Doc;

  private readonly onSyncChange?: (isSynced: boolean) => void;
  // Create a fallback awareness instance for when provider is null
  private readonly provider: YWebrtcProvider | null = null;

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
        const wasSynced = this._isSynced;

        this._isConnected = false;
        this._isSynced = false;

        // If we were synced, notify about sync state change
        if (wasSynced) {
          this.onSyncChange?.(false);
        }
      } catch (error) {
        console.warn('[yjs] Error disconnecting WebRTC provider:', error);
      }
    }
  };

  type: YjsProviderType = 'webrtc';

  // Autoconnects when created
  constructor({
    awareness,
    doc,
    options,
    onConnect,
    onDisconnect,
    onError,
    onSyncChange,
  }: {
    options: WebRTCProviderOptions;
    awareness?: Awareness;
    doc?: Y.Doc;
  } & ProviderEventHandlers) {
    this.onSyncChange = onSyncChange;

    this.doc = doc || new Y.Doc();
    try {
      this.provider = new YWebrtcProvider(options.roomName, this.doc, {
        awareness,
        filterBcConns: options.filterBcConns,
        maxConns: options.maxConns,
        password: options.password,
        peerOpts: options.peerOpts,
        signaling: options.signaling,
      });

      // Set connection status
      this.provider.on('status', (status: { connected: boolean }) => {
        const wasConnected = this._isConnected;
        this._isConnected = status.connected;

        if (status.connected) {
          // Notify about connection only if it wasn't connected before
          if (!wasConnected) {
            onConnect?.();
          }
          // Treat first connection as sync for P2P, trigger sync change if not already synced
          if (!this._isSynced) {
            this._isSynced = true;
            onSyncChange?.(true);
          }
          // Handle disconnection only if it was connected before
        } else if (wasConnected) {
          onDisconnect?.();

          // Explicitly set synced to false on disconnect if it was true
          // This ensures onSyncChange(false) is called reliably
          if (this._isSynced) {
            this._isSynced = false;
            onSyncChange?.(false);
          }
        }
      });
    } catch (error) {
      console.warn('[yjs] Error creating WebRTC provider:', error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
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
