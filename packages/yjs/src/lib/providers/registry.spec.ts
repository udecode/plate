import {
  createProvider,
  getProviderClass,
  registerProviderType,
} from './registry';

describe('provider registry', () => {
  it('resolves the built-in provider classes', () => {
    expect(getProviderClass('hocuspocus')?.name).toBe(
      'HocuspocusProviderWrapper'
    );
    expect(getProviderClass('webrtc')?.name).toBe('WebRTCProviderWrapper');
  });

  it('creates an instance of a registered provider', () => {
    class CustomProvider {
      awareness = { provider: 'custom' } as any;
      connect = () => {};
      destroy = () => {};
      disconnect = () => {};
      document = { guid: 'doc-1' } as any;
      isConnected = false;
      isSynced = false;
      readonly props: any;
      type = 'custom';

      constructor(props: any) {
        this.props = props;
      }
    }

    registerProviderType('custom', CustomProvider as any);

    const provider = createProvider({
      awareness: { id: 'awareness' } as any,
      doc: { guid: 'doc-1' } as any,
      onConnect: () => {},
      onDisconnect: () => {},
      onError: () => {},
      onSyncChange: () => {},
      options: { roomName: 'room-1' },
      type: 'custom',
    }) as unknown as InstanceType<typeof CustomProvider>;

    expect(provider).toBeInstanceOf(CustomProvider);
    expect(provider.props.options).toEqual({ roomName: 'room-1' });
    expect(provider.props.doc).toEqual({ guid: 'doc-1' });
  });

  it('throws for unknown providers', () => {
    expect(() =>
      createProvider({
        options: {},
        type: 'missing',
      } as any)
    ).toThrow('Provider type "missing" not found in registry');
  });

  it('lets later registrations override an existing provider type', () => {
    class OverrideProvider {
      awareness = {} as any;
      connect = () => {};
      destroy = () => {};
      disconnect = () => {};
      document = {} as any;
      isConnected = false;
      isSynced = false;
      type = 'webrtc';
    }

    registerProviderType('webrtc', OverrideProvider as any);

    expect(getProviderClass('webrtc')).toBe(OverrideProvider);
  });
});
