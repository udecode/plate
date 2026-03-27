import { renderHook } from '@testing-library/react';

const useEditorPluginMock = mock();
const getEditorPluginMock = mock();
const usePluginOptionMock = mock();

mock.module('@platejs/markdown', () => ({
  MarkdownPlugin: { key: 'markdown' },
  deserializeMd: mock(),
}));

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

const loadModule = async () =>
  import(`./useAIChatEditor?test=${Math.random().toString(36).slice(2)}`);

describe('useAIChatEditor', () => {
  beforeEach(() => {
    getEditorPluginMock.mockReset();
    useEditorPluginMock.mockReset();
    usePluginOptionMock.mockReset();
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
