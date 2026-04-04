import { act, renderHook } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const useBaseChatMock = mock();
const createAIChatTextStreamTransportMock = mock();
const withAIChatTextStreamMock = mock();
const useEditorRefMock = mock();
const usePluginOptionMock = mock();
let nextId = 0;

mock.module('@ai-sdk/react', () => ({
  useChat: useBaseChatMock,
}));

mock.module('@platejs/ai', () => ({
  withAIBatch: (_editor: unknown, fn: () => void) => fn(),
}));

mock.module('@platejs/ai/react', () => ({
  AIChatPlugin: { key: 'ai-chat' },
  aiCommentToRange: () => null,
  applyTableCellSuggestion: () => {},
  createAIChatTextStreamTransport: createAIChatTextStreamTransportMock,
  withAIChatTextStream: withAIChatTextStreamMock,
}));

mock.module('@platejs/comment', () => ({
  getCommentKey: () => 'comment',
  getTransientCommentKey: () => 'transient-comment',
}));

mock.module('@platejs/markdown', () => ({
  deserializeMd: () => [],
}));

mock.module('@platejs/selection/react', () => ({
  BlockSelectionPlugin: { key: 'block-selection' },
}));

mock.module('platejs', () => ({
  KEYS: {
    comment: 'comment',
    table: 'table',
  },
  NodeApi: {
    string: () => '',
  },
  TextApi: {
    isText: () => true,
  },
  nanoid: () => `test-id-${++nextId}`,
}));

mock.module('platejs/react', () => ({
  useEditorRef: useEditorRefMock,
  usePluginOption: usePluginOptionMock,
}));

mock.module('@/registry/components/editor/plugins/ai-kit', () => ({
  aiChatPlugin: { key: 'ai-chat' },
}));

mock.module('./plugins/discussion-kit', () => ({
  discussionPlugin: { key: 'discussion' },
}));

const createEditor = (instance: string) => ({
  getApi: () => ({
    blockSelection: {
      deselect: () => {},
    },
  }),
  getOption: () => null,
  getOptions: () => ({
    chatOptions: {
      body: { instance },
    },
  }),
  setOption: () => {},
  tf: {
    setNodes: () => {},
    setSelection: () => {},
    withMerging: (fn: () => void) => fn(),
  },
});

const loadModule = async () =>
  import(`./use-chat?test=${Math.random().toString(36).slice(2)}`);

describe('useChat', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    nextId = 0;
    createAIChatTextStreamTransportMock.mockReset();
    useBaseChatMock.mockReset();
    useEditorRefMock.mockReset();
    usePluginOptionMock.mockReset();
    withAIChatTextStreamMock.mockReset();

    createAIChatTextStreamTransportMock.mockImplementation((options) => ({
      ...options,
    }));
    useBaseChatMock.mockImplementation((options) => ({
      error: undefined,
      id: options.id,
      messages: [],
      status: 'ready',
    }));
    withAIChatTextStreamMock.mockImplementation((chat, transport) => ({
      ...chat,
      __plateTextStreamChannelId: `channel:${transport.chatId}`,
    }));
    globalThis.fetch = mock(
      async (_input, init) =>
        new Response(String(init?.body ?? ''), {
          status: 200,
        })
    ) as unknown as typeof fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
    mock.restore();
  });

  it('keeps default transport fetchers instance-scoped per hook', async () => {
    useEditorRefMock
      .mockImplementationOnce(() => createEditor('editor-a'))
      .mockImplementationOnce(() => createEditor('editor-b'));
    usePluginOptionMock
      .mockImplementationOnce(() => ({ body: { instance: 'editor-a' } }))
      .mockImplementationOnce(() => ({ body: { instance: 'editor-b' } }));

    const { useChat } = await loadModule();
    const hookA = renderHook(() => useChat());
    const hookB = renderHook(() => useChat());

    await act(async () => {});

    const transportA = createAIChatTextStreamTransportMock.mock.calls[0]?.[0];
    const transportB = createAIChatTextStreamTransportMock.mock.calls[1]?.[0];

    expect(transportA?.chatId).toBe('editor:test-id-1');
    expect(transportB?.chatId).toBe('editor:test-id-2');
    expect(useBaseChatMock.mock.calls[0]?.[0]?.id).toBe('editor:test-id-1');
    expect(useBaseChatMock.mock.calls[1]?.[0]?.id).toBe('editor:test-id-2');

    await act(async () => {
      await transportA.fetch('https://example.com/api', {
        body: JSON.stringify({ messages: [] }),
      });
      await transportB.fetch('https://example.com/api', {
        body: JSON.stringify({ messages: [] }),
      });
    });

    const firstBody = JSON.parse(
      String((globalThis.fetch as any).mock.calls[0]?.[1]?.body)
    );
    const secondBody = JSON.parse(
      String((globalThis.fetch as any).mock.calls[1]?.[1]?.body)
    );

    expect(firstBody.instance).toBe('editor-a');
    expect(secondBody.instance).toBe('editor-b');

    hookB.unmount();

    await act(async () => {
      await transportA.fetch('https://example.com/api', {
        body: JSON.stringify({ messages: [] }),
      });
    });

    const thirdBody = JSON.parse(
      String((globalThis.fetch as any).mock.calls[2]?.[1]?.body)
    );

    expect(thirdBody.instance).toBe('editor-a');

    hookA.unmount();
  });
});
