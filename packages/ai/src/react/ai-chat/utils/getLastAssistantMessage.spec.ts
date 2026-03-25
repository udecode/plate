import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const usePluginOptionMock = mock();
const getEditorPluginMock = mock();
const useEditorPluginMock = mock();

mock.module('platejs/react', () => ({
  getEditorPlugin: getEditorPluginMock,
  useEditorPlugin: useEditorPluginMock,
  usePluginOption: usePluginOptionMock,
}));

mock.module('../AIChatPlugin', () => ({
  AIChatPlugin: { key: 'aiChat' },
}));

describe('getLastAssistantMessage', () => {
  beforeEach(() => {
    usePluginOptionMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('returns the last assistant message from editor chat state', async () => {
    const { getLastAssistantMessage } = await import(
      `./getLastAssistantMessage?test=${Math.random().toString(36).slice(2)}`
    );

    expect(
      getLastAssistantMessage({
        getOptions: () => ({
          chat: {
            messages: [
              { role: 'user', text: 'a' },
              { role: 'assistant', text: 'b' },
            ],
          },
        }),
      } as any)
    ).toEqual({ role: 'assistant', text: 'b' });
  });

  it('returns the last assistant message from plugin options unless toolName is comment', async () => {
    const { useLastAssistantMessage } = await import(
      `./getLastAssistantMessage?test=${Math.random().toString(36).slice(2)}`
    );

    usePluginOptionMock.mockReturnValueOnce(undefined).mockReturnValueOnce({
      messages: [
        { role: 'assistant', text: 'a' },
        { role: 'assistant', text: 'b' },
      ],
    });

    expect(useLastAssistantMessage()).toEqual({
      role: 'assistant',
      text: 'b',
    });

    usePluginOptionMock.mockReset();
    usePluginOptionMock.mockReturnValueOnce('comment');
    usePluginOptionMock.mockReturnValueOnce({
      messages: [{ role: 'assistant' }],
    });

    expect(useLastAssistantMessage()).toBeUndefined();
  });
});
