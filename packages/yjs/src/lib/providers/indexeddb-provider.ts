import type { Awareness } from 'y-protocols/awareness';
import type * as Y from 'yjs';

import { IndexeddbPersistence } from 'y-indexeddb';

import type { IndexeddbProviderConfig, UnifiedProvider } from './types';

export class IndexeddbProviderWrapper implements UnifiedProvider {
  public _synced = false;
  public readonly awareness: Awareness;
  connect = () => {
    return;
  };
  destroy = () => {
    this.provider.destroy();
  };
  disconnect = () => {
    return;
  };
  public readonly document: Y.Doc;
  public readonly provider: IndexeddbPersistence;
  public readonly type = 'indexeddb';
  constructor({ options }: IndexeddbProviderConfig) {
    this.provider = new IndexeddbPersistence(options.docName, options.ydoc);
    this.document = this.provider.ydoc;
    this.provider.once('synced', () => {
      this._synced = true;
    });
    this.awareness = options.awareness;
  }
  get isConnected() {
    return this._synced;
  }
  get isSynced() {
    return this._synced;
  }
}
