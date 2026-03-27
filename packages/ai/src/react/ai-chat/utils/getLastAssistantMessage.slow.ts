import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const usePluginOptionMock = mock();
const getEditorPluginMock = mock();
const useEditorPluginMock = mock();

mock.module('../AIChatPlugin', () => ({
  AIChatPlugin: { key: 'aiChat' },
}));

mock.module('platejs/react', async () => {
  const actual = await import(
    new URL('../../../../../plate/dist/react/index.js', import.meta.url).href
  );
  const getEditorPlugin = actual.getEditorPlugin as any;
  const useEditorPlugin = actual.useEditorPlugin as any;
  const usePluginOption = actual.usePluginOption as any;

  return {
    ...actual,
    getEditorPlugin: (...args: any[]) =>
      (getEditorPluginMock as any)(...args) ?? getEditorPlugin(...args),
    useEditorPlugin: (...args: any[]) =>
      (useEditorPluginMock as any)(...args) ?? useEditorPlugin(...args),
    usePluginOption: (...args: any[]) =>
      (usePluginOptionMock as any)(...args) ?? usePluginOption(...args),
  };
});

describe('getLastAssistantMessage', () => {
  beforeEach(() => {
    getEditorPluginMock.mockReset();
    useEditorPluginMock.mockReset();
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

    usePluginOptionMock.mockReturnValueOnce(false).mockReturnValueOnce({
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
