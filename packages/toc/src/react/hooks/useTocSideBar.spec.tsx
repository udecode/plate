import { act, renderHook } from '@testing-library/react';

import type { useTocSideBarState } from './useTocSideBar';

import {
  checkInMock,
  registerSharedTocHookMocks,
  resetSharedTocHookMocks,
  useContentControllerMock,
  useEditorRefMock,
  useEditorSelectorMock,
  useEditorScrollElementMock,
  useTocControllerMock,
} from './__tests__/tocHookMocks';

type AssertFalse<T extends false> = T;
type IsAny<T> = 0 extends 1 & T ? true : false;
type TocSideBarState = ReturnType<typeof useTocSideBarState>;

type _tocSideBarStateNotAny = AssertFalse<IsAny<TocSideBarState>>;
type _headingListNotAny = AssertFalse<IsAny<TocSideBarState['headingList']>>;
type _onContentScrollNotAny = AssertFalse<
  IsAny<TocSideBarState['onContentScroll']>
>;

describe('useTocSideBar', () => {
  beforeEach(() => {
    registerSharedTocHookMocks();
    resetSharedTocHookMocks();
    mock.module('.', () => ({
      useContentController: useContentControllerMock,
      useTocController: useTocControllerMock,
    }));
  });

  afterAll(() => {
    mock.restore();
  });

  it('builds sidebar state and scroll click handlers around the content controller', async () => {
    const { useTocSideBar, useTocSideBarState } = await import(
      `./useTocSideBar?test=${Math.random().toString(36).slice(2)}`
    );
    const onContentScroll = mock();
    const toDOMNode = mock(() => document.createElement('h2'));

    useEditorRefMock.mockReturnValue({
      api: { dom: { resolveDOMNode: toDOMNode } },
      read: { nodes: { get: () => [{ id: 'h1' }, [0]] } },
    });
    useEditorSelectorMock.mockReturnValue([{ id: 'h1', path: [0] }]);
    useEditorScrollElementMock.mockReturnValue(document.createElement('div'));
    useContentControllerMock.mockReturnValue({
      activeContentId: 'h1',
      onContentScroll,
    });
    useTocControllerMock.mockReturnValue(undefined);
    checkInMock.mockReturnValue(false);

    const stateHook = renderHook(() =>
      useTocSideBarState({ open: true, rootMargin: '0px', topOffset: 0 })
    );
    const hook = renderHook(() => useTocSideBar(stateHook.result.current));

    act(() => {
      hook.result.current.navProps.onMouseEnter();
      hook.result.current.onContentClick(
        { preventDefault: mock() } as Parameters<
          typeof hook.result.current.onContentClick
        >[0],
        {
          depth: 1,
          id: 'h1',
          path: [0],
          title: 'Heading',
          type: 'h1',
        }
      );
    });

    expect(stateHook.result.current.headingList).toEqual([
      { id: 'h1', path: [0] },
    ]);
    expect(stateHook.result.current.mouseInToc).toBe(true);
    expect(onContentScroll).toHaveBeenCalledWith({
      behavior: undefined,
      el: expect.any(HTMLElement),
      id: 'h1',
      path: [0],
    });
  });
});
