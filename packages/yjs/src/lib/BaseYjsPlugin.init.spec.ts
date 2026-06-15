import { YjsEditor, yTextToSlateElement } from '@slate-yjs/core';
import { createSlateEditor } from 'platejs';
import * as Y from 'yjs';

import { createMockProvider } from './__tests__/createMockProvider';
import { mockFn } from './__tests__/mockFn';
import { BaseYjsPlugin } from './BaseYjsPlugin';
import * as providersModule from './providers';
import * as deterministicStateModule from '../utils/slateToDeterministicYjsState';

const createEditor = (options: Record<string, unknown> = {}) => {
  const editor = createSlateEditor({
    plugins: [
      BaseYjsPlugin.configure({
        options: {
          providers: [createMockProvider()],
          ...options,
        },
      }),
    ],
  });

  spyOn(editor.tf, 'init').mockImplementation(() => {});
  spyOn(editor.api, 'onChange').mockImplementation(() => {});
  spyOn(YjsEditor, 'connect').mockImplementation(() => {});
  spyOn(YjsEditor, 'disconnect').mockImplementation(() => {});

  return editor;
};

const getSharedChildren = (
  ydoc: Y.Doc,
  sharedType?: Y.XmlText | null
): unknown[] => {
  const content =
    sharedType ?? (ydoc.get('content', Y.XmlText) as Y.XmlText | null);

  if (!content) {
    return [];
  }

  return yTextToSlateElement(content).children;
};

const registerTestProviderType = (factory: (props: any) => any) => {
  const type = `test-provider-${Math.random().toString(36).slice(2)}`;

  const TestProvider = function (this: unknown, props: any) {
    return factory(props);
  };

  providersModule.registerProviderType(type, TestProvider as any);

  return type;
};

describe('BaseYjsPlugin init', () => {
  afterEach(() => {
    mock.restore();
  });

  it('throws when providers are empty', async () => {
    const editor = createEditor({ providers: [] });

    await expect(editor.api.yjs.init()).rejects.toThrow(
      'No providers specified. Please provide provider configurations or instances in the `providers` array.'
    );
  });

  it('turns provider configs into instances, preserves existing providers, and skips connect when autoConnect is false', async () => {
    const createdProvider = createMockProvider({ type: 'webrtc' });
    const existingProvider = createMockProvider({ type: 'custom' });
    const constructorProps: any[] = [];
    const providerType = registerTestProviderType((props) => {
      constructorProps.push(props);

      return createdProvider;
    });
    const editor = createEditor({
      providers: [
        { options: { roomName: 'room-1' }, type: providerType },
        existingProvider,
      ],
    });

    await editor.api.yjs.init({
      autoConnect: false,
      value: [{ type: 'p', children: [{ text: 'hello' }] }] as any,
    });

    expect(constructorProps).toHaveLength(1);
    expect(constructorProps[0]).toMatchObject({
      options: { roomName: 'room-1' },
    });
    expect(createdProvider.connect).not.toHaveBeenCalled();
    expect(existingProvider.connect).not.toHaveBeenCalled();

    editor.api.yjs.connect();

    expect(createdProvider.connect).toHaveBeenCalledTimes(1);
    expect(existingProvider.connect).toHaveBeenCalledTimes(1);
  });

  it('skips provider configs with null options and keeps valid provider instances', async () => {
    const existingProvider = createMockProvider({ type: 'custom' });
    const constructorProps: any[] = [];
    const providerType = registerTestProviderType((props) => {
      constructorProps.push(props);

      return createMockProvider({ type: 'webrtc' });
    });
    const editor = createEditor({
      providers: [{ options: null, type: providerType }, existingProvider],
    });

    await editor.api.yjs.init({
      autoConnect: false,
      value: [{ type: 'p', children: [{ text: 'hello' }] }] as any,
    });

    expect(constructorProps).toHaveLength(0);
    expect(existingProvider.connect).not.toHaveBeenCalled();

    editor.api.yjs.connect();

    expect(existingProvider.connect).toHaveBeenCalledTimes(1);
  });

  it('deserializes string values before seeding shared content', async () => {
    const editor = createEditor({
      providers: [createMockProvider({ type: 'custom' })],
    });
    const deserializedValue = [
      { type: 'p', children: [{ text: 'from html' }] },
    ];
    const deserializeSpy = spyOn(
      editor.api.html,
      'deserialize'
    ).mockReturnValue(deserializedValue as any);

    await editor.api.yjs.init({
      autoConnect: false,
      value: '<p>from html</p>',
    });

    expect(deserializeSpy).toHaveBeenCalledWith({
      element: '<p>from html</p>',
    });
    expect(
      getSharedChildren(editor.getPlugin(BaseYjsPlugin).options.ydoc)
    ).toEqual(deserializedValue);
  });

  it('awaits async values and falls back to create.value for empty values', async () => {
    const editor = createEditor({
      providers: [createMockProvider({ type: 'custom' })],
    });
    const asyncValue = mock(async () => [
      { type: 'p', children: [{ text: 'async value' }] },
    ]);

    await editor.api.yjs.init({
      autoConnect: false,
      value: asyncValue as any,
    });

    expect(asyncValue).toHaveBeenCalledTimes(1);
    expect(
      getSharedChildren(editor.getPlugin(BaseYjsPlugin).options.ydoc)
    ).toEqual([{ type: 'p', children: [{ text: 'async value' }] }]);

    const fallbackEditor = createEditor({
      providers: [createMockProvider({ type: 'custom' })],
    });
    const createValueSpy = spyOn(
      fallbackEditor.api.create,
      'value'
    ).mockReturnValue([{ type: 'p', children: [{ text: 'fallback' }] }] as any);

    await fallbackEditor.api.yjs.init({
      autoConnect: false,
      value: [] as any,
    });

    expect(createValueSpy).toHaveBeenCalledTimes(1);
    expect(
      getSharedChildren(fallbackEditor.getPlugin(BaseYjsPlugin).options.ydoc)
    ).toEqual([{ type: 'p', children: [{ text: 'fallback' }] }]);
  });

  it('uses applyDelta for custom shared types and skips seeding when shared content already exists', async () => {
    const ydoc = new Y.Doc({ guid: 'doc-1' });
    const customSharedType = new Y.XmlText();
    const applyDeltaSpy = spyOn(customSharedType, 'applyDelta');
    ydoc.getMap('editors').set('main', customSharedType);
    const applyUpdateSpy = spyOn(Y, 'applyUpdate');
    const editor = createEditor({
      providers: [createMockProvider({ type: 'custom' })],
      sharedType: customSharedType,
      ydoc,
    });

    await editor.api.yjs.init({
      autoConnect: false,
      value: [{ type: 'p', children: [{ text: 'nested' }] }] as any,
    });

    expect(applyDeltaSpy).toHaveBeenCalledTimes(1);
    expect(applyUpdateSpy).not.toHaveBeenCalled();
    expect(getSharedChildren(ydoc, customSharedType)).toEqual([
      { type: 'p', children: [{ text: 'nested' }] },
    ]);

    const seededDoc = new Y.Doc({ guid: 'seeded-doc' });
    Y.applyUpdate(
      seededDoc,
      await deterministicStateModule.slateToDeterministicYjsState(
        'seeded-doc',
        [{ type: 'p', children: [{ text: 'server content' }] }] as any
      )
    );
    const seededEditor = createEditor({
      providers: [createMockProvider({ type: 'custom' })],
      ydoc: seededDoc,
    });
    const deterministicSpy = spyOn(
      deterministicStateModule,
      'slateToDeterministicYjsState'
    );

    await seededEditor.api.yjs.init({
      autoConnect: false,
      value: [{ type: 'p', children: [{ text: 'local value' }] }] as any,
    });

    expect(deterministicSpy).not.toHaveBeenCalled();
    expect(getSharedChildren(seededDoc)).toEqual([
      { type: 'p', children: [{ text: 'server content' }] },
    ]);
  });

  it('waits for sync before final editor wiring and uses the deterministic update path', async () => {
    const calls: string[] = [];
    const createdProvider = createMockProvider({ type: 'webrtc' });
    const constructorProps: any[] = [];
    const providerType = registerTestProviderType(
      ({ onSyncChange, ...props }) => {
        constructorProps.push(props);
        createdProvider.connect.mockImplementation(() => {
          calls.push('provider.connect');
          createdProvider.setConnected(true);
          onSyncChange?.(true);
        });

        return createdProvider;
      }
    );
    const deterministicUpdate =
      await deterministicStateModule.slateToDeterministicYjsState('sync-doc', [
        { type: 'p', children: [{ text: 'hello' }] },
      ] as any);
    const deterministicSpy = spyOn(
      deterministicStateModule,
      'slateToDeterministicYjsState'
    ).mockImplementation(async () => deterministicUpdate);
    const applyUpdateSpy = spyOn(Y, 'applyUpdate');
    const editor = createEditor({
      providers: [{ options: { roomName: 'room-1' }, type: providerType }],
    });
    const connectSpy = spyOn(YjsEditor, 'connect').mockImplementation(() => {
      calls.push('YjsEditor.connect');
    });
    const tfInitSpy = spyOn(editor.tf, 'init').mockImplementation(() => {
      calls.push('editor.tf.init');
    });
    const onChangeSpy = spyOn(editor.api, 'onChange').mockImplementation(() => {
      calls.push('editor.api.onChange');
    });
    const onReady = mockFn(
      (_: { editor: unknown; isAsync: boolean; value: unknown }) => {
        calls.push('onReady');
      }
    );

    await editor.api.yjs.init({
      autoConnect: true,
      onReady,
      value: [{ type: 'p', children: [{ text: 'hello' }] }] as any,
    });

    expect(constructorProps).toHaveLength(1);
    expect(createdProvider.connect).toHaveBeenCalledTimes(1);
    expect(deterministicSpy).toHaveBeenCalledTimes(1);
    expect(applyUpdateSpy).toHaveBeenCalledWith(
      editor.getPlugin(BaseYjsPlugin).options.ydoc,
      deterministicUpdate
    );
    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(tfInitSpy).toHaveBeenCalledWith({
      autoSelect: undefined,
      selection: undefined,
      shouldNormalizeEditor: false,
      value: null,
    });
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledWith({
      editor,
      isAsync: true,
      value: editor.children,
    });
    expect(calls).toEqual([
      'provider.connect',
      'YjsEditor.connect',
      'editor.tf.init',
      'editor.api.onChange',
      'onReady',
    ]);
  });

  it('keeps pre-instantiated IndexedDB providers as provider instances', async () => {
    const ydoc = new Y.Doc({ guid: 'doc-1' });
    const provider = new providersModule.IndexeddbProviderWrapper({
      doc: ydoc,
      options: { docName: 'document-1' },
    });
    const connectSpy = spyOn(provider, 'connect').mockImplementation(() => {});
    const editor = createEditor({
      providers: [provider],
      ydoc,
    });

    await editor.api.yjs.init({
      autoConnect: false,
      value: [{ type: 'p', children: [{ text: 'hello' }] }] as any,
    });

    expect(connectSpy).not.toHaveBeenCalled();
    expect(provider.provider).toBeNull();

    editor.api.yjs.connect();

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it('cleans up providers with pending connection attempts', async () => {
    const disconnectProvider = createMockProvider({ type: 'indexeddb' });
    let disconnectPending = false;
    Object.defineProperty(disconnectProvider, 'isConnectionPending', {
      get: () => disconnectPending,
    });
    disconnectProvider.connect.mockImplementation(() => {
      disconnectPending = true;
    });
    disconnectProvider.disconnect.mockImplementation(() => {
      disconnectPending = false;
    });
    const disconnectEditor = createEditor({
      providers: [disconnectProvider],
    });

    await disconnectEditor.api.yjs.init({
      autoConnect: false,
      value: [{ type: 'p', children: [{ text: 'hello' }] }] as any,
    });

    disconnectEditor.api.yjs.connect('indexeddb');
    disconnectEditor.api.yjs.disconnect('indexeddb');

    expect(disconnectProvider.disconnect).toHaveBeenCalledTimes(1);

    const destroyProvider = createMockProvider({ type: 'indexeddb' });
    Object.defineProperty(destroyProvider, 'isConnectionPending', {
      get: () => true,
    });
    const destroyEditor = createEditor({
      providers: [destroyProvider],
    });

    await destroyEditor.api.yjs.init({
      autoConnect: false,
      value: [{ type: 'p', children: [{ text: 'hello' }] }] as any,
    });

    destroyEditor.api.yjs.destroy();

    expect(destroyProvider.destroy).toHaveBeenCalledTimes(1);
  });

  it('does not let empty local persistence sync satisfy the initial network sync gate', async () => {
    const localProvider = createMockProvider({ type: 'indexeddb' });
    localProvider.isLocalPersistence = true;
    const remoteProvider = createMockProvider({ type: 'webrtc' });
    const localType = registerTestProviderType(({ onSyncChange }) => {
      localProvider.connect.mockImplementation(() => {
        localProvider.setConnected(true);
        localProvider.setSynced(true);
        onSyncChange?.(true);
      });

      return localProvider;
    });
    const remoteType = registerTestProviderType(() => {
      remoteProvider.connect.mockImplementation(() => {
        remoteProvider.setConnected(true);
      });

      return remoteProvider;
    });
    const realSetTimeout = globalThis.setTimeout;
    let timeoutCallback: () => void = () => {
      throw new Error('timeout callback was not captured');
    };
    spyOn(globalThis, 'setTimeout').mockImplementation(((
      callback: TimerHandler
    ) => {
      timeoutCallback = callback as () => void;

      return 1 as any;
    }) as any);
    const editor = createEditor({
      providers: [
        { options: { docName: 'document-1' }, type: localType },
        { options: { roomName: 'document-1' }, type: remoteType },
      ],
    });

    const initPromise = editor.api.yjs.init({
      autoConnect: true,
      value: [{ type: 'p', children: [{ text: 'local value' }] }] as any,
    });
    let settled = false;
    void initPromise.then(() => {
      settled = true;
    });

    await new Promise<void>((resolve) => realSetTimeout(resolve, 0));

    expect(localProvider.connect).toHaveBeenCalledTimes(1);
    expect(remoteProvider.connect).toHaveBeenCalledTimes(1);
    expect(settled).toBe(false);
    expect(YjsEditor.connect).not.toHaveBeenCalled();

    timeoutCallback();
    await initPromise;

    expect(YjsEditor.connect).toHaveBeenCalledTimes(1);
    expect(
      getSharedChildren(editor.getPlugin(BaseYjsPlugin).options.ydoc)
    ).toEqual([{ type: 'p', children: [{ text: 'local value' }] }]);
  });

  it('does not seed fallback content while local persistence is still pending', async () => {
    const localProvider = createMockProvider({ type: 'indexeddb' });
    localProvider.isLocalPersistence = true;
    Object.defineProperty(localProvider, 'isSyncPending', {
      get: () => true,
    });
    const remoteProvider = createMockProvider({ type: 'webrtc' });
    const localType = registerTestProviderType(() => {
      localProvider.connect.mockImplementation(() => {
        localProvider.setConnected(true);
      });

      return localProvider;
    });
    const remoteType = registerTestProviderType(() => {
      remoteProvider.connect.mockImplementation(() => {
        remoteProvider.setConnected(true);
      });

      return remoteProvider;
    });
    let timeoutCallback: () => void = () => {
      throw new Error('timeout callback was not captured');
    };
    spyOn(globalThis, 'setTimeout').mockImplementation(((
      callback: TimerHandler
    ) => {
      timeoutCallback = callback as () => void;

      return 1 as any;
    }) as any);
    const editor = createEditor({
      providers: [
        { options: { docName: 'document-1' }, type: localType },
        { options: { roomName: 'document-1' }, type: remoteType },
      ],
    });
    const deterministicSpy = spyOn(
      deterministicStateModule,
      'slateToDeterministicYjsState'
    );

    const initPromise = editor.api.yjs.init({
      autoConnect: true,
      value: [{ type: 'p', children: [{ text: 'fallback value' }] }] as any,
    });

    timeoutCallback();
    await initPromise;

    expect(deterministicSpy).not.toHaveBeenCalled();
    expect(YjsEditor.connect).toHaveBeenCalledTimes(1);
  });

  it('uses local persistence sync immediately when it hydrates shared content', async () => {
    const localProvider = createMockProvider({ type: 'indexeddb' });
    localProvider.isLocalPersistence = true;
    const remoteProvider = createMockProvider({ type: 'webrtc' });
    const localType = registerTestProviderType(({ doc, onSyncChange }) => {
      localProvider.connect.mockImplementation(() => {
        const sharedRoot = doc.get('content', Y.XmlText) as Y.XmlText;

        sharedRoot.insert(0, 'restored');
        localProvider.setConnected(true);
        localProvider.setSynced(true);
        onSyncChange?.(true);
      });

      return localProvider;
    });
    const remoteType = registerTestProviderType(() => {
      remoteProvider.connect.mockImplementation(() => {
        remoteProvider.setConnected(true);
      });

      return remoteProvider;
    });
    const realSetTimeout = globalThis.setTimeout;
    spyOn(globalThis, 'setTimeout').mockImplementation((() => 1) as any);
    const editor = createEditor({
      providers: [
        { options: { docName: 'document-1' }, type: localType },
        { options: { roomName: 'document-1' }, type: remoteType },
      ],
    });
    const deterministicSpy = spyOn(
      deterministicStateModule,
      'slateToDeterministicYjsState'
    );

    const initPromise = editor.api.yjs.init({
      autoConnect: true,
      value: [{ type: 'p', children: [{ text: 'local value' }] }] as any,
    });
    let settled = false;
    void initPromise.then(() => {
      settled = true;
    });

    await new Promise<void>((resolve) => realSetTimeout(resolve, 0));
    await initPromise;

    expect(settled).toBe(true);
    expect(deterministicSpy).not.toHaveBeenCalled();
    expect(YjsEditor.connect).toHaveBeenCalledTimes(1);
  });

  it('preserves empty content restored from local persistence', async () => {
    const localProvider = createMockProvider({ type: 'indexeddb' });
    localProvider.isLocalPersistence = true;
    const remoteProvider = createMockProvider({ type: 'webrtc' });
    const localType = registerTestProviderType(({ doc, onSyncChange }) => {
      localProvider.connect.mockImplementation(() => {
        const sharedRoot = doc.get('content', Y.XmlText) as Y.XmlText;

        sharedRoot.insert(0, 'deleted offline');
        sharedRoot.delete(0, 'deleted offline'.length);
        localProvider.setConnected(true);
        localProvider.setSynced(true);
        onSyncChange?.(true);
      });

      return localProvider;
    });
    const remoteType = registerTestProviderType(() => {
      remoteProvider.connect.mockImplementation(() => {
        remoteProvider.setConnected(true);
      });

      return remoteProvider;
    });
    const realSetTimeout = globalThis.setTimeout;
    spyOn(globalThis, 'setTimeout').mockImplementation((() => 1) as any);
    const editor = createEditor({
      providers: [
        { options: { docName: 'document-1' }, type: localType },
        { options: { roomName: 'document-1' }, type: remoteType },
      ],
    });
    const deterministicSpy = spyOn(
      deterministicStateModule,
      'slateToDeterministicYjsState'
    );

    const initPromise = editor.api.yjs.init({
      autoConnect: true,
      value: [{ type: 'p', children: [{ text: 'fallback value' }] }] as any,
    });
    let settled = false;
    void initPromise.then(() => {
      settled = true;
    });

    await new Promise<void>((resolve) => realSetTimeout(resolve, 0));
    await initPromise;

    expect(settled).toBe(true);
    expect(deterministicSpy).not.toHaveBeenCalled();
    expect(
      getSharedChildren(editor.getPlugin(BaseYjsPlugin).options.ydoc)
    ).toEqual([{ text: '' }]);
    expect(YjsEditor.connect).toHaveBeenCalledTimes(1);
  });

  it('preserves empty custom sharedType content restored from local persistence', async () => {
    const ydoc = new Y.Doc({ guid: 'doc-1' });
    const customSharedType = new Y.XmlText();
    ydoc.getMap('editors').set('main', customSharedType);
    const localProvider = createMockProvider({ type: 'indexeddb' });
    localProvider.isLocalPersistence = true;
    const remoteProvider = createMockProvider({ type: 'webrtc' });
    const localType = registerTestProviderType(({ onSyncChange }) => {
      localProvider.connect.mockImplementation(() => {
        customSharedType.insert(0, 'deleted offline');
        customSharedType.delete(0, 'deleted offline'.length);
        localProvider.setConnected(true);
        localProvider.setSynced(true);
        onSyncChange?.(true);
      });

      return localProvider;
    });
    const remoteType = registerTestProviderType(() => {
      remoteProvider.connect.mockImplementation(() => {
        remoteProvider.setConnected(true);
      });

      return remoteProvider;
    });
    const realSetTimeout = globalThis.setTimeout;
    spyOn(globalThis, 'setTimeout').mockImplementation((() => 1) as any);
    const editor = createEditor({
      providers: [
        { options: { docName: 'document-1' }, type: localType },
        { options: { roomName: 'document-1' }, type: remoteType },
      ],
      sharedType: customSharedType,
      ydoc,
    });
    const deterministicSpy = spyOn(
      deterministicStateModule,
      'slateToDeterministicYjsState'
    );

    const initPromise = editor.api.yjs.init({
      autoConnect: true,
      value: [{ type: 'p', children: [{ text: 'fallback value' }] }] as any,
    });
    let settled = false;
    void initPromise.then(() => {
      settled = true;
    });

    await new Promise<void>((resolve) => realSetTimeout(resolve, 0));
    await initPromise;

    expect(settled).toBe(true);
    expect(deterministicSpy).not.toHaveBeenCalled();
    expect(getSharedChildren(ydoc, customSharedType)).toEqual([{ text: '' }]);
    expect(YjsEditor.connect).toHaveBeenCalledTimes(1);
  });

  it('forwards auto-connect provider errors through onError and still finishes init', async () => {
    const provider = createMockProvider({ type: 'webrtc' });
    const onError = mockFn((_: { error: Error; type: string }) => {});
    const setTimeoutSpy = spyOn(globalThis, 'setTimeout').mockImplementation(((
      callback: TimerHandler
    ) => {
      queueMicrotask(() => {
        (callback as () => void)();
      });

      return 1 as any;
    }) as any);
    provider.connect.mockImplementation(() => {
      throw new Error('connect failed');
    });
    const editor = createEditor({
      onError,
      providers: [provider],
    });

    await editor.api.yjs.init({
      autoConnect: true,
      value: [{ type: 'p', children: [{ text: 'hello' }] }] as any,
    });

    expect(provider.connect).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith({
      error: expect.any(Error),
      type: 'webrtc',
    });
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(YjsEditor.connect).toHaveBeenCalledTimes(1);
  });

  it('times out cleanly when sync never arrives', async () => {
    const createdProvider = createMockProvider({ type: 'webrtc' });
    const constructorProps: any[] = [];
    const providerType = registerTestProviderType((props) => {
      constructorProps.push(props);

      return createdProvider;
    });
    const setTimeoutSpy = spyOn(globalThis, 'setTimeout').mockImplementation(((
      callback: TimerHandler
    ) => {
      queueMicrotask(() => {
        (callback as () => void)();
      });

      return 1 as any;
    }) as any);
    const editor = createEditor({
      providers: [{ options: { roomName: 'room-1' }, type: providerType }],
    });

    await expect(
      editor.api.yjs.init({
        autoConnect: true,
        value: [{ type: 'p', children: [{ text: 'hello' }] }] as any,
      })
    ).resolves.toBeUndefined();

    expect(constructorProps).toHaveLength(1);
    expect(createdProvider.connect).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(YjsEditor.connect).toHaveBeenCalledTimes(1);
  });
});
