import { YjsEditor } from '@slate-yjs/core';
import { createSlateEditor } from 'platejs';
import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

import { createMockProvider } from './__tests__/createMockProvider';
import { mockFn } from './__tests__/mockFn';
import { BaseYjsPlugin } from './BaseYjsPlugin';

const createEditor = ({ providers = [] }: { providers?: any[] } = {}) =>
  createSlateEditor({
    plugins: [
      BaseYjsPlugin.configure({
        options: {
          _providers: providers as any,
          providers: [],
        },
      }),
    ],
  });

describe('BaseYjsPlugin editor API', () => {
  beforeEach(() => {
    spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    mock.restore();
  });

  it('creates ydoc and awareness defaults during plugin extension', () => {
    const editor = createEditor();
    const options = editor.getPlugin(BaseYjsPlugin).options;

    expect(options.ydoc).toBeInstanceOf(Y.Doc);
    expect(options.awareness).toBeInstanceOf(Awareness);
  });

  it('connects all providers and forwards provider errors through onError', () => {
    const goodProvider = createMockProvider({ type: 'webrtc' });
    const badProvider = createMockProvider({ type: 'hocuspocus' });
    const onError = mockFn((_: { error: Error; type: string }) => {});
    badProvider.connect.mockImplementation(() => {
      throw new Error('connect failed');
    });
    const editor = createSlateEditor({
      plugins: [
        BaseYjsPlugin.configure({
          options: {
            _providers: [goodProvider, badProvider] as any,
            onError,
            providers: [],
          },
        }),
      ],
    });

    editor.api.yjs.connect();

    expect(goodProvider.connect).toHaveBeenCalledTimes(1);
    expect(badProvider.connect).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith({
      error: expect.any(Error),
      type: 'hocuspocus',
    });
  });

  it('filters provider types when connecting and disconnecting, and disconnects in reverse order', () => {
    const disconnectOrder: string[] = [];
    const first = createMockProvider({
      connected: true,
      onDisconnect: () => disconnectOrder.push('webrtc'),
      type: 'webrtc',
    });
    const second = createMockProvider({
      connected: true,
      onDisconnect: () => disconnectOrder.push('hocuspocus'),
      type: 'hocuspocus',
    });
    const third = createMockProvider({
      connected: true,
      onDisconnect: () => disconnectOrder.push('custom'),
      type: 'custom',
    });
    const editor = createEditor({
      providers: [first, second, third],
    });

    editor.api.yjs.connect('webrtc');

    expect(first.connect).toHaveBeenCalledTimes(1);
    expect(second.connect).not.toHaveBeenCalled();
    expect(third.connect).not.toHaveBeenCalled();

    editor.api.yjs.disconnect(['webrtc', 'hocuspocus']);

    expect(disconnectOrder).toEqual(['hocuspocus', 'webrtc']);
    expect(first.disconnect).toHaveBeenCalledTimes(1);
    expect(second.disconnect).toHaveBeenCalledTimes(1);
    expect(third.disconnect).not.toHaveBeenCalled();
  });

  it('warns and keeps going when a disconnect throws', () => {
    const first = createMockProvider({
      connected: true,
      type: 'webrtc',
    });
    const second = createMockProvider({
      connected: true,
      type: 'hocuspocus',
    });
    first.disconnect.mockImplementation(() => {
      throw new Error('disconnect failed');
    });
    const editor = createEditor({
      providers: [first, second],
    });

    expect(() => editor.api.yjs.disconnect()).not.toThrow();

    expect(second.disconnect).toHaveBeenCalledTimes(1);
    expect(first.disconnect).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      '[yjs] Error disconnecting provider (webrtc):',
      expect.any(Error)
    );
  });

  it('destroys connected providers in reverse order and always calls YjsEditor.disconnect', () => {
    const destroyOrder: string[] = [];
    const first = createMockProvider({
      connected: true,
      onDestroy: () => destroyOrder.push('webrtc'),
      type: 'webrtc',
    });
    const second = createMockProvider({
      connected: false,
      onDestroy: () => destroyOrder.push('hocuspocus'),
      type: 'hocuspocus',
    });
    const third = createMockProvider({
      connected: true,
      onDestroy: () => destroyOrder.push('custom'),
      type: 'custom',
    });
    third.destroy.mockImplementation(() => {
      destroyOrder.push('custom');
      throw new Error('destroy failed');
    });
    const disconnectSpy = spyOn(YjsEditor, 'disconnect').mockImplementation(
      () => {}
    );
    const editor = createEditor({
      providers: [first, second, third],
    });

    expect(() => editor.api.yjs.destroy()).not.toThrow();

    expect(destroyOrder).toEqual(['custom', 'webrtc']);
    expect(first.destroy).toHaveBeenCalledTimes(1);
    expect(second.destroy).not.toHaveBeenCalled();
    expect(third.destroy).toHaveBeenCalledTimes(1);
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
