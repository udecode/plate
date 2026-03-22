import * as Y from 'yjs';

import { mockFn } from '../__tests__/mockFn';

type HocuspocusHarnessOptions = {
  connectError?: Error;
  constructorThrows?: number;
  disconnectError?: Error;
  websocketError?: Error;
};

const createHocuspocusHarness = async ({
  connectError,
  constructorThrows = 0,
  disconnectError,
  websocketError,
}: HocuspocusHarnessOptions = {}) => {
  const providerCalls: any[] = [];
  const providerInstances: any[] = [];
  const websocketCalls: any[] = [];
  let latestProviderOptions: any;

  class FakeHocuspocusProviderWebsocket {
    constructor(options: any) {
      websocketCalls.push(options);

      if (websocketError) {
        throw websocketError;
      }
    }
  }

  class FakeHocuspocusProvider {
    awareness: any;
    connect = mock(() => {
      if (connectError) {
        throw connectError;
      }
    });
    disconnect = mock(() => {
      if (disconnectError) {
        throw disconnectError;
      }
    });
    document: any;

    constructor(options: any) {
      providerCalls.push(options);
      latestProviderOptions = options;

      if (constructorThrows > 0) {
        constructorThrows -= 1;
        throw new Error('provider ctor failed');
      }

      this.awareness = options.awareness ?? { provider: 'awareness' };
      this.document = options.document ?? { guid: 'generated-doc' };
      providerInstances.push(this);
    }
  }

  mock.module('@hocuspocus/provider', () => ({
    HocuspocusProvider: FakeHocuspocusProvider,
    HocuspocusProviderWebsocket: FakeHocuspocusProviderWebsocket,
  }));

  const module = await import('./hocuspocus-provider');

  return {
    HocuspocusProviderWrapper: module.HocuspocusProviderWrapper,
    getLatestProviderOptions: () => latestProviderOptions,
    providerCalls,
    providerInstances,
    websocketCalls,
  };
};

describe('HocuspocusProviderWrapper', () => {
  afterEach(() => {
    mock.restore();
  });

  it('passes document and awareness through and wires a websocket when requested', async () => {
    const { HocuspocusProviderWrapper, providerCalls, websocketCalls } =
      await createHocuspocusHarness();
    const awareness = { id: 'awareness-1' } as any;
    const doc = new Y.Doc({ guid: 'doc-1' });
    const wrapper = new HocuspocusProviderWrapper({
      awareness,
      doc,
      options: { name: 'provider' } as any,
      wsOptions: { url: 'ws://localhost:1234' } as any,
    });

    expect(websocketCalls).toEqual([{ url: 'ws://localhost:1234' }]);
    expect(providerCalls).toHaveLength(1);
    expect(providerCalls[0].awareness).toBe(awareness);
    expect(providerCalls[0].document).toBe(doc);
    expect(providerCalls[0].websocketProvider).toBeDefined();
    expect(wrapper.awareness).toBe(awareness);
    expect(wrapper.document).toBe(doc);
  });

  it('surfaces websocket construction errors and still creates the provider', async () => {
    const onError = mockFn((_: Error) => {});
    const { HocuspocusProviderWrapper, providerCalls } =
      await createHocuspocusHarness({
        websocketError: new Error('bad websocket'),
      });

    new HocuspocusProviderWrapper({
      onError,
      options: { name: 'provider' } as any,
      wsOptions: { url: 'ws://bad-host' } as any,
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect((onError.mock.calls[0] as any[])[0].message).toBe('bad websocket');
    expect(providerCalls).toHaveLength(1);
    expect(providerCalls[0].websocketProvider).toBeUndefined();
  });

  it('tracks connect, sync, and disconnect transitions without duplicate sync notifications', async () => {
    const onConnect = mockFn(() => {});
    const onDisconnect = mockFn(() => {});
    const onSyncChange = mockFn((_: boolean) => {});
    const optionsOnConnect = mockFn(() => {});
    const optionsOnDisconnect = mockFn(() => {});
    const optionsOnSynced = mockFn((_: { state: boolean }) => {});
    const { HocuspocusProviderWrapper, getLatestProviderOptions } =
      await createHocuspocusHarness();
    const wrapper = new HocuspocusProviderWrapper({
      onConnect,
      onDisconnect,
      onSyncChange,
      options: {
        name: 'provider',
        onConnect: optionsOnConnect,
        onDisconnect: optionsOnDisconnect,
        onSynced: optionsOnSynced,
      } as any,
    });
    const providerOptions = getLatestProviderOptions();

    providerOptions.onConnect();
    providerOptions.onSynced({ state: true });
    providerOptions.onSynced({ state: true });

    expect(wrapper.isConnected).toBe(true);
    expect(wrapper.isSynced).toBe(true);
    expect(onConnect).toHaveBeenCalledTimes(1);
    expect(optionsOnConnect).toHaveBeenCalledTimes(1);
    expect(onSyncChange).toHaveBeenCalledTimes(1);
    expect(onSyncChange).toHaveBeenCalledWith(true);
    expect(optionsOnSynced).toHaveBeenCalledTimes(2);

    providerOptions.onDisconnect({} as any);

    expect(wrapper.isConnected).toBe(false);
    expect(wrapper.isSynced).toBe(false);
    expect(onDisconnect).toHaveBeenCalledTimes(1);
    expect(optionsOnDisconnect).toHaveBeenCalledTimes(1);
    expect(onSyncChange).toHaveBeenCalledTimes(2);
    expect(onSyncChange).toHaveBeenLastCalledWith(false);
  });

  it('creates a non-connecting fallback provider when the constructor throws', async () => {
    const onError = mockFn((_: Error) => {});
    const { HocuspocusProviderWrapper, providerCalls } =
      await createHocuspocusHarness({
        constructorThrows: 1,
      });

    new HocuspocusProviderWrapper({
      onError,
      options: { name: 'provider' } as any,
    });

    expect(providerCalls).toHaveLength(2);
    expect(providerCalls[1].connect).toBe(false);
    expect(onError).toHaveBeenCalledTimes(1);
    expect((onError.mock.calls[0] as any[])[0].message).toBe(
      'provider ctor failed'
    );
  });

  it('keeps connect, disconnect, and destroy safe around provider failures', async () => {
    const { HocuspocusProviderWrapper, providerInstances } =
      await createHocuspocusHarness({
        connectError: new Error('connect failed'),
      });
    const wrapper = new HocuspocusProviderWrapper({
      options: { name: 'provider' } as any,
    });

    expect(() => wrapper.connect()).not.toThrow();
    expect(wrapper.isConnected).toBe(false);

    wrapper.disconnect();
    wrapper.destroy();

    expect(providerInstances[0].disconnect).not.toHaveBeenCalled();
  });
});
