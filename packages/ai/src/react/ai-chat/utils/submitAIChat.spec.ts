const isSelectingMock = mock();
const getEditorPromptMock = mock();
const getEditorPluginMock = mock();
const useEditorPluginMock = mock();
const usePluginOptionMock = mock();

mock.module('@platejs/selection', () => ({
  isSelecting: isSelectingMock,
}));

mock.module('@platejs/selection/react', () => ({
  BlockSelectionPlugin: { key: 'blockSelection' },
}));

mock.module('../../../lib/utils/getEditorPrompt', () => ({
  getEditorPrompt: getEditorPromptMock,
}));

mock.module('../../ai/AIPlugin', () => ({
  AIPlugin: { key: 'ai' },
}));

mock.module('platejs/react', () => ({
  getEditorPlugin: getEditorPluginMock,
  useEditorPlugin: useEditorPluginMock,
  usePluginOption: usePluginOptionMock,
}));

const loadModule = async () =>
  import(`./submitAIChat?test=${Math.random().toString(36).slice(2)}`);

describe('submitAIChat', () => {
  beforeEach(() => {
    isSelectingMock.mockReset();
    getEditorPromptMock.mockReset();
    getEditorPluginMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('returns early when both prompt and input are empty', async () => {
    const sendMessage = mock();
    getEditorPluginMock.mockReturnValue({
      getOptions: () => ({
        chat: { sendMessage },
        toolName: null,
      }),
      setOption: mock(),
    });

    const { submitAIChat } = await loadModule();

    submitAIChat({} as any, '');

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('undoes insert mode, stores chat context, and sends the computed prompt', async () => {
    const setOption = mock();
    const sendMessage = mock();
    const undo = mock();
    const blocks = [
      [{ id: 'b1', type: 'p' }, [0]],
      [{ id: 'b2', type: 'p' }, [1]],
    ];

    getEditorPluginMock.mockReturnValue({
      getOptions: () => ({
        chat: { sendMessage },
        toolName: 'summarize',
      }),
      setOption,
    });
    isSelectingMock.mockReturnValue(false);
    getEditorPromptMock.mockReturnValue('Prompt');

    const editor = {
      api: {
        blocks: () => [],
        fragment: () => [{ id: 'frag-1', type: 'p' }],
        nodesRange: () => ({ anchor: 'a', focus: 'b' }),
      },
      children: [{ id: 'root', type: 'p' }],
      getApi: () => ({
        blockSelection: {
          getNodes: () => blocks,
        },
      }),
      getOption: () => false,
      getTransforms: () => ({
        ai: { undo },
      }),
      selection: { anchor: { path: [0, 0], offset: 0 } },
    } as any;

    const { submitAIChat } = await loadModule();

    submitAIChat(editor, 'draft', { mode: 'insert' });

    expect(undo).toHaveBeenCalled();
    expect(setOption).toHaveBeenCalledWith('mode', 'insert');
    expect(setOption).toHaveBeenCalledWith('toolName', 'summarize');
    expect(setOption).toHaveBeenCalledWith('chatNodes', [
      { id: 'b1', type: 'p' },
      { id: 'b2', type: 'p' },
    ]);
    expect(setOption).toHaveBeenCalledWith('chatSelection', null);
    expect(sendMessage).toHaveBeenCalledWith(
      { text: 'Prompt' },
      {
        body: {
          ctx: {
            children: [{ id: 'root', type: 'p' }],
            selection: { anchor: 'a', focus: 'b' },
            toolName: 'summarize',
          },
        },
      }
    );
  });
});
