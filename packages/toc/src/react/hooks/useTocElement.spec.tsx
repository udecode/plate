import { act, renderHook } from '@testing-library/react';

import {
  heightToTopMock,
  registerSharedTocHookMocks,
  resetSharedTocHookMocks,
  useEditorPluginMock,
  useEditorSelectorMock,
  useScrollRefMock,
} from './__tests__/tocHookMocks';

let setTimeoutSpy: ReturnType<typeof spyOn>;

describe('useTocElement', () => {
  beforeEach(() => {
    registerSharedTocHookMocks();
    resetSharedTocHookMocks();
    heightToTopMock.mockReturnValue(50);
    mock.module('../TocPlugin', () => ({
      TocPlugin: { key: 'toc' },
    }));
    setTimeoutSpy = spyOn(globalThis, 'setTimeout').mockImplementation(((
      fn: Function
    ) => {
      fn();
      return 1;
    }) as any);
  });

  afterEach(() => {
    setTimeoutSpy.mockRestore();
  });

  afterAll(() => {
    mock.restore();
  });

  it('builds toc element state and forwards heading clicks into scrolling + row selection', async () => {
    const { useTocElement, useTocElementState } = await import(
      `./useTocElement?test=${Math.random().toString(36).slice(2)}`
    );
    const addSelectedRow = mock();
    const scrollTo = mock();
    const toDOMNode = mock(() => document.createElement('h2'));
    const container = {
      current: { scrollTo },
    };

    useEditorPluginMock.mockReturnValue({
      editor: {
        api: { toDOMNode },
        getApi: () => ({
          blockSelection: { addSelectedRow },
        }),
      },
      getOptions: () => ({
        isScroll: true,
        topOffset: 5,
      }),
    });
    useEditorSelectorMock.mockReturnValue([{ id: 'h1', path: [0] }]);
    useScrollRefMock.mockReturnValue(container);

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
    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'instant', top: 45 });
    expect(addSelectedRow).toHaveBeenCalledWith('h1');
  });
});
