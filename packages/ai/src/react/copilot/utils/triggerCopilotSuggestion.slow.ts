import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const callCompletionApiMock = mock();
const getEditorPluginMock = mock();
const useEditorPluginMock = mock();
const usePluginOptionMock = mock();

mock.module('./callCompletionApi', () => ({
  callCompletionApi: callCompletionApiMock,
}));

mock.module('platejs/react', () => ({
  getEditorPlugin: getEditorPluginMock,
  useEditorPlugin: useEditorPluginMock,
  usePluginOption: usePluginOptionMock,
}));

describe('triggerCopilotSuggestion', () => {
  beforeEach(() => {
    callCompletionApiMock.mockReset();
    getEditorPluginMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('returns false while ai chat or copilot loading is active', async () => {
    const { triggerCopilotSuggestion } = await import(
      `./triggerCopilotSuggestion?test=${Math.random().toString(36).slice(2)}`
    );

    getEditorPluginMock.mockReturnValue({
      getOptions: () => ({
        isLoading: true,
      }),
    });

    await expect(
      triggerCopilotSuggestion({
        getOptions: () => ({
          chat: { isLoading: false },
        }),
      } as any)
    ).resolves.toBe(false);
  });

  it('stops current suggestion work and forwards finished completions into block suggestions', async () => {
    const { triggerCopilotSuggestion } = await import(
      `./triggerCopilotSuggestion?test=${Math.random().toString(36).slice(2)}`
    );
    const setOption = mock();
    const stop = mock();
    const setBlockSuggestion = mock();

    getEditorPluginMock.mockReturnValue({
      api: {
        copilot: { setBlockSuggestion, stop },
      },
      getOptions: () => ({
        completeOptions: { onError: mock() },
        getPrompt: () => 'Prompt',
        isLoading: false,
        triggerQuery: () => true,
      }),
      setOption,
    });

    callCompletionApiMock.mockImplementation(
      async ({ onFinish, setLoading, setCompletion }: any) => {
        setLoading(true);
        setCompletion('');
        onFinish?.('Prompt', 'Completed');
        setLoading(false);
      }
    );

    const editor = {
      getOptions: () => ({
        chat: { isLoading: false },
      }),
    } as any;

    await expect(triggerCopilotSuggestion(editor)).resolves.toBeUndefined();

    expect(stop).toHaveBeenCalled();
    expect(setBlockSuggestion).toHaveBeenCalledWith({ text: 'Completed' });
    expect(callCompletionApiMock).toHaveBeenCalled();
    expect(setOption).toHaveBeenCalledWith('completion', '');
    expect(setOption).toHaveBeenCalledWith('isLoading', true);
    expect(setOption).toHaveBeenCalledWith('isLoading', false);
  });
});
