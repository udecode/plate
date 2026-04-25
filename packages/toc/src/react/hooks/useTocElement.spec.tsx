import { act, renderHook } from '@testing-library/react';

import {
  heightToTopMock,
  registerSharedTocHookMocks,
  resetSharedTocHookMocks,
  useContentControllerMock,
  useEditorPluginMock,
  useEditorSelectorMock,
  useScrollRefMock,
} from './__tests__/tocHookMocks';

describe('useTocElement', () => {
  beforeEach(() => {
    registerSharedTocHookMocks();
    resetSharedTocHookMocks();
    heightToTopMock.mockReturnValue(50);
    mock.module('../TocPlugin', () => ({
      TocPlugin: { key: 'toc' },
    }));
    mock.module('./useContentController', () => ({
      useContentController: useContentControllerMock,
    }));
  });

  afterAll(() => {
    mock.restore();
  });

  it('builds toc element state around the shared content controller', async () => {
    const { useTocElement, useTocElementState } = await import(
      `./useTocElement?test=${Math.random().toString(36).slice(2)}`
    );
    const onContentScroll = mock();
    const toDOMNode = mock(() => document.createElement('h2'));

    useEditorPluginMock.mockReturnValue({
      editor: {
        api: { toDOMNode },
      },
      getOptions: () => ({
        isScroll: true,
        topOffset: 5,
      }),
    });
    useEditorSelectorMock.mockReturnValue([{ id: 'h1', path: [0] }]);
    useScrollRefMock.mockReturnValue({
      current: document.createElement('div'),
    });
    useContentControllerMock.mockReturnValue({
      activeContentId: 'h1',
      onContentScroll,
    });

    const stateHook = renderHook(() => useTocElementState());
    const hook = renderHook(() => useTocElement(stateHook.result.current));

    act(() => {
      hook.result.current.props.onClick(
        { preventDefault: mock() } as any,
        { id: 'h1', path: [0] } as any,
        'instant'
      );
    });

    expect(stateHook.result.current.headingList).toEqual([
      { id: 'h1', path: [0] },
    ]);
    expect(stateHook.result.current.activeContentId).toBe('h1');
    expect(onContentScroll).toHaveBeenCalledWith({
      behavior: 'instant',
      el: expect.any(HTMLElement),
      id: 'h1',
      path: [0],
    });
  });
});
