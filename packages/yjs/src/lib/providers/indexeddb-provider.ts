import type { Awareness } from 'y-protocols/awareness';
import type * as Y from 'yjs';

import { Awareness as YAwareness } from 'y-protocols/awareness';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Yjs from 'yjs';

import type {
  IndexeddbProviderOptions,
  ProviderEventHandlers,
  UnifiedProvider,
  YjsProviderType,
} from './types';

export class IndexeddbProviderWrapper implements UnifiedProvider {
  private _isConnected = false;
  private _isDestroyed = false;
  private _isSynced = false;
  private readonly onConnect?: () => void;
  private readonly onDisconnect?: () => void;
  private readonly onError?: (error: Error) => void;
  private readonly onSyncChange?: (isSynced: boolean) => void;
  private readonly providerOptions: IndexeddbProviderOptions;
  private _provider: IndexeddbPersistence | null = null;

  readonly awareness: Awareness;
  readonly document: Y.Doc;
  readonly isLocalPersistence = true;
  type: YjsProviderType = 'indexeddb';

  constructor({
    awareness,
    doc,
    options,
    onConnect,
    onDisconnect,
    onError,
    onSyncChange,
  }: {
    awareness?: Awareness;
    doc?: Y.Doc;
    options: IndexeddbProviderOptions;
  } & ProviderEventHandlers) {
    this.document = doc ?? new Yjs.Doc();
    // IndexedDB does not transport awareness; this exists for UnifiedProvider.
    this.awareness = awareness ?? new YAwareness(this.document);
    this.providerOptions = options;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
    this.onError = onError;
    this.onSyncChange = onSyncChange;
  }

  connect = () => {
    if (this._isDestroyed) {
      return;
    }

    if (!this._provider) {
      try {
        const provider = new IndexeddbPersistence(
          this.providerOptions.docName,
          this.document
        );

        this._provider = provider;

        void provider._db
          .then(() => {
            if (this._provider === provider && !this._isDestroyed) {
              this.setConnected(true);
            }
          })
          .catch((error) => {
            if (this._provider === provider && !this._isDestroyed) {
              this._provider = null;
              this.destroyProvider(provider, false);
              this.handleError(error);
              this.setSynced(false);
              this.setConnected(false);
            }
          });

        void provider.whenSynced
          .then(() => {
            if (
              this._provider === provider &&
              this._isConnected &&
              !this._isDestroyed
            ) {
              this.setSynced(true);
            }
          })
          .catch((error) => {
            this.handleError(error);
          });
      } catch (error) {
        this.handleError(error);
        this.setConnected(false);
        this.setSynced(false);
        return;
      }
    }

    if (this._provider.synced) {
      this.setConnected(true);
      this.setSynced(true);
    }
  };

  destroy = () => {
    if (this._isDestroyed) {
      return;
    }

    this._isDestroyed = true;
    this.disconnect();
  };

  disconnect = () => {
    const provider = this._provider;

    if (!provider && !this._isConnected && !this._isSynced) {
      return;
    }

    this._provider = null;
    this.setSynced(false);
    this.setConnected(false);

    if (provider) {
      this.destroyProvider(provider);
    }
  };

  get isConnected() {
    return this._isConnected;
  }

  get isConnectionPending() {
    return !!this._provider && !this._isConnected && !this._isDestroyed;
  }

  get isSyncPending() {
    return !!this._provider && !this._isSynced && !this._isDestroyed;
  }

  get isSynced() {
    return this._isSynced;
  }

  get provider() {
    return this._provider;
  }

  private destroyProvider(provider: IndexeddbPersistence, reportErrors = true) {
    try {
      void provider.destroy().catch((error) => {
        if (reportErrors) {
          this.handleError(error);
        }
      });
    } catch (error) {
      if (reportErrors) {
        this.handleError(error);
      }
    }
  }

  private handleError(error: unknown) {
    this.onError?.(error instanceof Error ? error : new Error(String(error)));
  }

  private setConnected(isConnected: boolean) {
    if (this._isConnected === isConnected) {
      return;
    }

    this._isConnected = isConnected;

    if (isConnected) {
      this.onConnect?.();
    } else {
      this.onDisconnect?.();
    }
  }

  private setSynced(isSynced: boolean) {
    if (this._isSynced === isSynced) {
      return;
    }

    this._isSynced = isSynced;
    this.onSyncChange?.(isSynced);
  }
}
