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
