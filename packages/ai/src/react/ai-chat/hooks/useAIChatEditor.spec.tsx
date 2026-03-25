import { renderHook } from '@testing-library/react';

const useEditorPluginMock = mock();
const getEditorPluginMock = mock();
const usePluginOptionMock = mock();

mock.module('@platejs/markdown', () => ({
  MarkdownPlugin: { key: 'markdown' },
  deserializeMd: mock(),
}));

mock.module('platejs/react', () => ({
  getEditorPlugin: getEditorPluginMock,
  useEditorPlugin: useEditorPluginMock,
  usePluginOption: usePluginOptionMock,
}));

mock.module('../AIChatPlugin', () => ({
  AIChatPlugin: { key: 'aiChat' },
}));

const loadModule = async () =>
  import(`./useAIChatEditor?test=${Math.random().toString(36).slice(2)}`);

describe('useAIChatEditor', () => {
  beforeEach(() => {
    useEditorPluginMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('deserializes markdown with memoization, writes editor children, and registers the ai editor', async () => {
    const setOption = mock();
    const deserialize = mock(() => [{ type: 'p', children: [{ text: 'hi' }] }]);

    useEditorPluginMock.mockReturnValue({ setOption });

    const editor = {
      children: [],
      getApi: () => ({
        markdown: {
          deserialize,
        },
      }),
    } as any;

    const { useAIChatEditor } = await loadModule();
    const { result } = renderHook(() =>
      useAIChatEditor(editor, '# hi', { parser: 'parser' as any })
    );

    expect(deserialize).toHaveBeenCalledWith('# hi', {
      memoize: true,
      parser: 'parser',
    });
    expect(editor.children).toEqual(result.current);
    expect(setOption).toHaveBeenCalledWith('aiEditor', editor);
  });
});
