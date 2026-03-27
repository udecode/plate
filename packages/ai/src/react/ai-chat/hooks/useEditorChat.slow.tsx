import { renderHook } from '@testing-library/react';

const useEditorPluginMock = mock();
const usePluginOptionMock = mock();
const getEditorPluginMock = mock();

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

mock.module('@platejs/selection/react', () => ({
  BlockSelectionPlugin: { key: 'blockSelection' },
}));

const loadModule = async () =>
  import(`./useEditorChat?test=${Math.random().toString(36).slice(2)}`);

describe('useEditorChat', () => {
  beforeEach(() => {
    getEditorPluginMock.mockReset();
    useEditorPluginMock.mockReset();
    usePluginOptionMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('routes open state to block selection callbacks before cursor or text selection', async () => {
    const onOpenBlockSelection = mock();
    const onOpenCursor = mock();
    const onOpenSelection = mock();

    usePluginOptionMock.mockReturnValue(true);
    useEditorPluginMock.mockReturnValue({
      editor: {
        api: {
          isCollapsed: () => true,
          isExpanded: () => false,
        },
        getApi: () => ({
          blockSelection: {
            getNodes: () => [[{ id: 'b1' }, [0]]],
          },
        }),
        getOption: () => true,
      },
    });

    const { useEditorChat } = await loadModule();
    renderHook(() =>
      useEditorChat({
        onOpenBlockSelection,
        onOpenCursor,
        onOpenSelection,
      })
    );

    expect(onOpenBlockSelection).toHaveBeenCalledWith([[{ id: 'b1' }, [0]]]);
    expect(onOpenCursor).not.toHaveBeenCalled();
    expect(onOpenSelection).not.toHaveBeenCalled();
  });
});
