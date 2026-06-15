import * as Y from 'yjs';

import { mockFn } from '../__tests__/mockFn';

type IndexeddbHarnessOptions = {
  constructorError?: Error;
  destroyError?: Error;
  openError?: Error;
};

let importId = 0;

const createDeferred = <T>() => {
  let reject!: (error: unknown) => void;
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, reject, resolve };
};

const createIndexeddbHarness = async ({
  constructorError,
  destroyError,
  openError,
}: IndexeddbHarnessOptions = {}) => {
  const constructorCalls: any[] = [];
  const instances: any[] = [];

  class FakeIndexeddbPersistence {
    readonly doc: Y.Doc;
    readonly docName: string;
    destroyed = false;
    _db: Promise<IDBDatabase>;
    synced = false;
    whenSynced: Promise<FakeIndexeddbPersistence>;

    constructor(docName: string, doc: Y.Doc) {
      this.docName = docName;
      this.doc = doc;
      constructorCalls.push({ doc, docName });

      if (constructorError) {
        throw constructorError;
      }

      const open = createDeferred<IDBDatabase>();
      this._db = open.promise;
      (this as any).open = open;
      queueMicrotask(() => {
        if (openError) {
          open.reject(openError);
        } else {
          open.resolve({} as IDBDatabase);
        }
      });

      const sync = createDeferred<FakeIndexeddbPersistence>();
      this.whenSynced = sync.promise.then((value) => {
        this.synced = true;
        return value;
      });
      (this as any).sync = sync;
      instances.push(this);
    }

    destroy = mock(async () => {
      if (destroyError) {
        throw destroyError;
      }

      this.destroyed = true;
    });
  }

  mock.module('y-indexeddb', () => ({
    IndexeddbPersistence: FakeIndexeddbPersistence,
  }));

  const module = await import(`./indexeddb-provider?test=${importId++}`);

  return {
    IndexeddbProviderWrapper: module.IndexeddbProviderWrapper,
    constructorCalls,
    instances,
  };
};

describe('IndexeddbProviderWrapper', () => {
  afterEach(() => {
    mock.restore();
  });

  it('persists the plugin-owned document with the configured docName', async () => {
    const { IndexeddbProviderWrapper, constructorCalls, instances } =
      await createIndexeddbHarness();
    const doc = new Y.Doc({ guid: 'doc-1' });
    const awareness = { id: 'awareness-1' } as any;
    const wrapper = new IndexeddbProviderWrapper({
      awareness,
      doc,
      options: { docName: 'document-1' },
    });

    expect(constructorCalls).toHaveLength(0);

    wrapper.connect();

    expect(constructorCalls).toEqual([{ doc, docName: 'document-1' }]);
    expect(wrapper.document).toBe(doc);
    expect(wrapper.awareness).toBe(awareness);
    expect(wrapper.isConnected).toBe(false);
    expect(wrapper.isConnectionPending).toBe(true);
    expect(wrapper.isSyncPending).toBe(true);

    await instances[0]._db;

    expect(wrapper.isConnected).toBe(true);
    expect(wrapper.isConnectionPending).toBe(false);
    expect(wrapper.isSyncPending).toBe(true);
    expect(wrapper.isSynced).toBe(false);
  });

  it('creates a fallback document and awareness when none are provided', async () => {
    const { IndexeddbProviderWrapper, constructorCalls } =
      await createIndexeddbHarness();
    const wrapper = new IndexeddbProviderWrapper({
      options: { docName: 'document-1' },
    });

    wrapper.connect();

    expect(wrapper.document).toBeInstanceOf(Y.Doc);
    expect(wrapper.awareness.doc).toBe(wrapper.document);
    expect(constructorCalls[0].doc).toBe(wrapper.document);
  });

  it('tracks sync, disconnect, and destroy state transitions', async () => {
    const onConnect = mockFn(() => {});
    const onDisconnect = mockFn(() => {});
    const onSyncChange = mockFn((_: boolean) => {});
    const { IndexeddbProviderWrapper, instances } =
      await createIndexeddbHarness();
    const wrapper = new IndexeddbProviderWrapper({
      onConnect,
      onDisconnect,
      onSyncChange,
      options: { docName: 'document-1' },
    });

    wrapper.connect();
    wrapper.connect();

    expect(instances).toHaveLength(1);
    await instances[0]._db;
    expect(onConnect).toHaveBeenCalledTimes(1);

    instances[0].sync.resolve(instances[0]);
    await instances[0].whenSynced;

    expect(wrapper.isSynced).toBe(true);
    expect(wrapper.isSyncPending).toBe(false);
    expect(onSyncChange).toHaveBeenCalledTimes(1);
    expect(onSyncChange).toHaveBeenLastCalledWith(true);

    wrapper.disconnect();

    expect(wrapper.isConnected).toBe(false);
    expect(wrapper.isSynced).toBe(false);
    expect(instances[0].destroy).toHaveBeenCalledTimes(1);
    expect(onDisconnect).toHaveBeenCalledTimes(1);
    expect(onSyncChange).toHaveBeenCalledTimes(2);
    expect(onSyncChange).toHaveBeenLastCalledWith(false);

    wrapper.connect();

    expect(instances).toHaveLength(2);
    await instances[1]._db;

    instances[1].sync.resolve(instances[1]);
    await instances[1].whenSynced;

    wrapper.destroy();
    wrapper.connect();

    expect(wrapper.isConnected).toBe(false);
    expect(wrapper.isSynced).toBe(false);
    expect(instances).toHaveLength(2);
    expect(instances[1].destroy).toHaveBeenCalledTimes(1);
  });

  it('surfaces provider creation and destroy failures through onError', async () => {
    const onCreateError = mockFn((_: Error) => {});
    const { IndexeddbProviderWrapper: FailingWrapper } =
      await createIndexeddbHarness({
        constructorError: new Error('create failed'),
      });
    const failed = new FailingWrapper({
      onError: onCreateError,
      options: { docName: 'document-1' },
    });

    failed.connect();

    expect(failed.isConnected).toBe(false);
    expect(failed.isSynced).toBe(false);
    expect(onCreateError).toHaveBeenCalledTimes(1);
    expect((onCreateError.mock.calls[0] as any[])[0].message).toBe(
      'create failed'
    );

    const onDestroyError = mockFn((_: Error) => {});
    const { IndexeddbProviderWrapper, instances } =
      await createIndexeddbHarness({
        destroyError: new Error('destroy failed'),
      });
    const wrapper = new IndexeddbProviderWrapper({
      onError: onDestroyError,
      options: { docName: 'document-2' },
    });

    wrapper.connect();
    await instances[0]._db;
    wrapper.disconnect();
    await Promise.resolve();

    expect(instances[0].destroy).toHaveBeenCalledTimes(1);
    expect(onDestroyError).toHaveBeenCalledTimes(1);
    expect((onDestroyError.mock.calls[0] as any[])[0].message).toBe(
      'destroy failed'
    );
  });

  it('surfaces IndexedDB open failures through onError', async () => {
    const onError = mockFn((_: Error) => {});
    const { IndexeddbProviderWrapper, instances } =
      await createIndexeddbHarness({
        openError: new Error('open failed'),
      });
    const wrapper = new IndexeddbProviderWrapper({
      onError,
      options: { docName: 'document-1' },
    });

    wrapper.connect();

    await instances[0]._db.catch(() => {});
    await Promise.resolve();

    expect(wrapper.isConnected).toBe(false);
    expect(wrapper.isConnectionPending).toBe(false);
    expect(wrapper.isSyncPending).toBe(false);
    expect(wrapper.isSynced).toBe(false);
    expect(instances[0].destroy).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect((onError.mock.calls[0] as any[])[0].message).toBe('open failed');
  });

  it('cleans up an immediate disconnect before IndexedDB opens', async () => {
    const { IndexeddbProviderWrapper, instances } =
      await createIndexeddbHarness();
    const wrapper = new IndexeddbProviderWrapper({
      options: { docName: 'document-1' },
    });

    wrapper.connect();

    expect(wrapper.isConnectionPending).toBe(true);

    wrapper.disconnect();

    expect(instances[0].destroy).toHaveBeenCalledTimes(1);
    expect(wrapper.isConnected).toBe(false);
    expect(wrapper.isConnectionPending).toBe(false);
    expect(wrapper.isSyncPending).toBe(false);

    await instances[0]._db;

    expect(wrapper.isConnected).toBe(false);
  });
});
