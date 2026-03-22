import * as Y from 'yjs';

import { mockFn } from '../__tests__/mockFn';

type WebrtcHarnessOptions = {
  connectError?: Error;
  constructorError?: Error;
  destroyError?: Error;
  disconnectError?: Error;
};

const createWebrtcHarness = async ({
  connectError,
  constructorError,
  destroyError,
  disconnectError,
}: WebrtcHarnessOptions = {}) => {
  const constructorCalls: any[] = [];
  const instances: any[] = [];

  class FakeWebrtcProvider {
    awareness: any;
    connect = mock(() => {
      if (connectError) {
        throw connectError;
      }
    });
    destroy = mock(() => {
      if (destroyError) {
        throw destroyError;
      }
    });
    disconnect = mock(() => {
      if (disconnectError) {
        throw disconnectError;
      }
    });
    private readonly events = new Map<string, (payload: any) => void>();

    constructor(roomName: string, doc: Y.Doc, options: any) {
      constructorCalls.push({ doc, options, roomName });

      if (constructorError) {
        throw constructorError;
      }

      this.awareness = options.awareness ?? { provider: 'awareness' };
      instances.push(this);
    }

    emitStatus(connected: boolean) {
      this.events.get('status')?.({ connected });
    }

    on(event: string, handler: (payload: any) => void) {
      this.events.set(event, handler);
    }
  }

  mock.module('y-webrtc', () => ({
    WebrtcProvider: FakeWebrtcProvider,
  }));

  const module = await import('./webrtc-provider');

  return {
    WebRTCProviderWrapper: module.WebRTCProviderWrapper,
    constructorCalls,
    instances,
  };
};

describe('WebRTCProviderWrapper', () => {
  beforeEach(() => {
    spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    mock.restore();
  });

  it('passes the provided document through to y-webrtc', async () => {
    const { WebRTCProviderWrapper, constructorCalls } =
      await createWebrtcHarness();
    const doc = new Y.Doc({ guid: 'doc-1' });
    const awareness = { id: 'awareness-1' } as any;
    const wrapper = new WebRTCProviderWrapper({
      awareness,
      doc,
      options: { roomName: 'room-1' },
    });

    expect(constructorCalls).toHaveLength(1);
    expect(constructorCalls[0]).toMatchObject({
      doc,
      options: { awareness },
      roomName: 'room-1',
    });
    expect(wrapper.document).toBe(doc);
    expect(wrapper.awareness).toBe(awareness);
  });

  it('creates a document when one is not provided', async () => {
    const { WebRTCProviderWrapper } = await createWebrtcHarness();
    const wrapper = new WebRTCProviderWrapper({
      options: { roomName: 'room-1' },
    });

    expect(wrapper.document).toBeInstanceOf(Y.Doc);
  });

  it('tracks status changes and only emits real transitions', async () => {
    const onConnect = mockFn(() => {});
    const onDisconnect = mockFn(() => {});
    const onSyncChange = mockFn((_: boolean) => {});
    const { WebRTCProviderWrapper, instances } = await createWebrtcHarness();
    const wrapper = new WebRTCProviderWrapper({
      onConnect,
      onDisconnect,
      onSyncChange,
      options: { roomName: 'room-1' },
    });
    const instance = instances[0];

    instance.emitStatus(true);
    instance.emitStatus(true);

    expect(wrapper.isConnected).toBe(true);
    expect(wrapper.isSynced).toBe(true);
    expect(onConnect).toHaveBeenCalledTimes(1);
    expect(onSyncChange).toHaveBeenCalledTimes(1);
    expect(onSyncChange).toHaveBeenCalledWith(true);

    instance.emitStatus(false);
    instance.emitStatus(false);

    expect(wrapper.isConnected).toBe(false);
    expect(wrapper.isSynced).toBe(false);
    expect(onDisconnect).toHaveBeenCalledTimes(1);
    expect(onSyncChange).toHaveBeenCalledTimes(2);
    expect(onSyncChange).toHaveBeenLastCalledWith(false);
  });

  it('clears sync state on disconnect and destroy without throwing', async () => {
    const onSyncChange = mockFn((_: boolean) => {});
    const { WebRTCProviderWrapper, instances } = await createWebrtcHarness({
      destroyError: new Error('destroy failed'),
    });
    const wrapper = new WebRTCProviderWrapper({
      onSyncChange,
      options: { roomName: 'room-1' },
    });
    const instance = instances[0];

    instance.emitStatus(true);

    expect(() => wrapper.disconnect()).not.toThrow();
    expect(wrapper.isConnected).toBe(false);
    expect(wrapper.isSynced).toBe(false);
    expect(onSyncChange).toHaveBeenLastCalledWith(false);

    expect(() => wrapper.destroy()).not.toThrow();
    expect(instance.disconnect).toHaveBeenCalledTimes(1);
    expect(instance.destroy).toHaveBeenCalledTimes(1);
  });

  it('surfaces constructor failures and swallows provider method failures', async () => {
    const onError = mockFn((_: Error) => {});
    const { WebRTCProviderWrapper: FailingWrapper } = await createWebrtcHarness(
      {
        constructorError: new Error('ctor failed'),
      }
    );
    const failed = new FailingWrapper({
      onError,
      options: { roomName: 'room-1' },
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect((onError.mock.calls[0] as any[])[0].message).toBe('ctor failed');
    expect(() => failed.connect()).not.toThrow();
    expect(() => failed.disconnect()).not.toThrow();
    expect(() => failed.destroy()).not.toThrow();

    const { WebRTCProviderWrapper, instances } = await createWebrtcHarness({
      connectError: new Error('connect failed'),
      destroyError: new Error('destroy failed'),
      disconnectError: new Error('disconnect failed'),
    });
    const wrapper = new WebRTCProviderWrapper({
      options: { roomName: 'room-2' },
    });
    const instance = instances[0];

    expect(() => wrapper.connect()).not.toThrow();
    expect(() => wrapper.disconnect()).not.toThrow();
    expect(() => wrapper.destroy()).not.toThrow();
    expect(instance.connect).toHaveBeenCalledTimes(1);
    expect(instance.disconnect).toHaveBeenCalledTimes(1);
    expect(instance.destroy).toHaveBeenCalledTimes(1);
  });
});
