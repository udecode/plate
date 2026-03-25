import { act, renderHook } from '@testing-library/react';

const usePluginOptionMock = mock();
const useLastAssistantMessageMock = mock();
const getEditorPluginMock = mock();
const useEditorPluginMock = mock();

mock.module('platejs/react', () => ({
  getEditorPlugin: getEditorPluginMock,
  useEditorPlugin: useEditorPluginMock,
  usePluginOption: usePluginOptionMock,
}));

mock.module('../utils/getLastAssistantMessage', () => ({
  useLastAssistantMessage: useLastAssistantMessageMock,
}));

const loadModule = async () =>
  import(`./useChatChunk?test=${Math.random().toString(36).slice(2)}`);

describe('useChatChunk', () => {
  beforeEach(() => {
    usePluginOptionMock.mockReset();
    useLastAssistantMessageMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('emits new text chunks and calls finish when streaming stops', async () => {
    const onChunk = mock();
    const onFinish = mock();
    const statuses = [
      { status: 'streaming' },
      { status: 'streaming' },
      { status: 'ready' },
    ];
    const messages = [
      { parts: [{ type: 'text', text: 'he' }] },
      { parts: [{ type: 'text', text: 'hello' }] },
      { parts: [{ type: 'text', text: 'hello' }] },
    ];
    let index = 0;

    usePluginOptionMock.mockImplementation(() => statuses[index]);
    useLastAssistantMessageMock.mockImplementation(() => messages[index]);

    const { useChatChunk } = await loadModule();
    const hook = renderHook(() => useChatChunk({ onChunk, onFinish }));

    await act(async () => {
      index = 1;
      hook.rerender();
    });

    await act(async () => {
      index = 2;
      hook.rerender();
    });

    expect(onChunk).toHaveBeenNthCalledWith(1, {
      chunk: 'he',
      isFirst: true,
      nodes: [{ text: 'he' }],
      text: 'he',
    });
    expect(onChunk).toHaveBeenNthCalledWith(2, {
      chunk: 'llo',
      isFirst: false,
      nodes: [{ text: 'llo' }],
      text: 'hello',
    });
    expect(onFinish).toHaveBeenCalledWith({ content: 'hello' });
  });
});
