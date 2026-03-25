import { act, renderHook } from '@testing-library/react';

import {
  registerSharedTocHookMocks,
  resetSharedTocHookMocks,
  useContentObserverMock,
  useEditorRefMock,
} from './__tests__/tocHookMocks';

describe('useContentController', () => {
  beforeEach(() => {
    registerSharedTocHookMocks();
    resetSharedTocHookMocks();
    mock.module('./useContentObserver', () => ({
      useContentObserver: useContentObserverMock,
    }));
  });

  afterAll(() => {
    mock.restore();
  });

  it('scrolls the active content target and selects its row', async () => {
    const addSelectedRow = mock();
    const scrollTo = mock();
    const editor = {
      getApi: () => ({
        blockSelection: { addSelectedRow },
      }),
    } as any;
    const container = document.createElement('div');
    Object.defineProperties(container, {
      clientHeight: { value: 10 },
      scrollHeight: { value: 50 },
    });
    (container as any).scrollTo = scrollTo;

    useEditorRefMock.mockReturnValue(editor);
    useContentObserverMock.mockReturnValue({ activeId: 'h1' });

    const { useContentController } = await import(
      `./useContentController?test=${Math.random().toString(36).slice(2)}`
    );

    const { result } = renderHook(() =>
      useContentController({
        containerRef: { current: container },
        isObserve: true,
        rootMargin: '0px',
        topOffset: 5,
      } as any)
    );

    act(() => {
      result.current.onContentScroll({
        el: document.createElement('h2'),
        id: 'h1',
      });
    });

    expect(result.current.activeContentId).toBe('h1');
    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'instant', top: 35 });
    expect(addSelectedRow).toHaveBeenCalledWith('h1');
  });
});
