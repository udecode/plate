import { act, renderHook } from '@testing-library/react';

import type { useTocSideBarState } from './useToc';

import * as actualPlatejsReact from '../../../core/src/react';

type AssertFalse<T extends false> = T;
type IsAny<T> = 0 extends 1 & T ? true : false;
type TocSideBarState = ReturnType<typeof useTocSideBarState>;

type _tocSideBarStateNotAny = AssertFalse<IsAny<TocSideBarState>>;
type _headingListNotAny = AssertFalse<IsAny<TocSideBarState['headingList']>>;
type _onContentScrollNotAny = AssertFalse<
  IsAny<TocSideBarState['onContentScroll']>
>;

const useEditorMock = mock();
const useEditorPluginMock = mock();
const useEditorScrollElementMock = mock();
const useEditorSelectorMock = mock();
const observeMock = mock();
const disconnectMock = mock();
const OriginalIntersectionObserver = globalThis.IntersectionObserver;

let observers: Array<{
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
}> = [];

class IntersectionObserverMock {
  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    observers.push({ callback, options });
  }

  disconnect = disconnectMock;
  observe = observeMock;
}

mock.module('@platejs/core/react', () => ({
  ...actualPlatejsReact,
  useEditor: useEditorMock,
  useEditorPlugin: useEditorPluginMock,
  useEditorScrollElement: useEditorScrollElementMock,
  useEditorSelector: useEditorSelectorMock,
}));

const createEditor = (element = document.createElement('h2')) => ({
  api: {
    dom: {
      resolveDOMNode: mock(() => element),
    },
  },
  read: {
    nodes: {
      get: mock(() => [{ id: 'h1' }, [0]]),
    },
  },
  update: {
    navigation: {
      flashTarget: mock(),
    },
  },
});

const createScrollableContainer = () => {
  const container = document.createElement('div');

  Object.defineProperties(container, {
    clientHeight: { value: 10 },
    scrollHeight: { value: 50 },
  });
  container.getBoundingClientRect = () => DOMRect.fromRect({ y: 0 });
  container.scrollTo = mock();

  return container;
};

describe('useToc hook family', () => {
  beforeEach(() => {
    observers = [];
    observeMock.mockReset();
    disconnectMock.mockReset();
    useEditorMock.mockReset();
    useEditorPluginMock.mockReset();
    useEditorScrollElementMock.mockReset();
    useEditorSelectorMock.mockReset();
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: IntersectionObserverMock,
    });
  });

  afterAll(() => {
    mock.restore();
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: OriginalIntersectionObserver,
    });
  });

  it('observes headings and promotes the first visible id', async () => {
    const heading = document.createElement('h2');
    heading.id = 'h1';
    const editor = createEditor(heading);

    useEditorMock.mockReturnValue(editor);
    useEditorSelectorMock.mockReturnValue([{ id: 'h1', path: [0] }]);

    const { useContentObserver } = await import(
      `./useToc?content-observer=${Math.random().toString(36).slice(2)}`
    );
    const { result } = renderHook(() =>
      useContentObserver({
        editorContent: document.createElement('div'),
        isObserve: true,
        isScroll: true,
        rootMargin: '0px',
        status: 0,
      })
    );

    expect(observeMock).toHaveBeenCalledWith(heading);

    act(() => {
      observers[0]?.callback(
        [
          {
            boundingClientRect: DOMRect.fromRect({}),
            intersectionRatio: 1,
            intersectionRect: DOMRect.fromRect({}),
            isIntersecting: true,
            rootBounds: DOMRect.fromRect({}),
            target: heading,
            time: 0,
          } as IntersectionObserverEntry,
        ],
        new IntersectionObserver(() => {})
      );
    });

    expect(result.current.activeId).toBe('h1');
  });

  it('scrolls content and flashes its editor target', async () => {
    const editor = createEditor();
    const container = createScrollableContainer();
    const heading = document.createElement('h2');
    heading.getBoundingClientRect = () => DOMRect.fromRect({ y: 40 });

    useEditorMock.mockReturnValue(editor);
    useEditorSelectorMock.mockReturnValue([]);

    const { useContentController } = await import(
      `./useToc?content-controller=${Math.random().toString(36).slice(2)}`
    );
    const { result } = renderHook(() =>
      useContentController({
        container,
        isObserve: true,
        rootMargin: '0px',
        topOffset: 5,
      })
    );

    act(() => {
      result.current.onContentScroll({
        el: heading,
        id: 'h1',
        path: [0],
      });
    });

    expect(result.current.activeContentId).toBe('h1');
    expect(container.scrollTo).toHaveBeenCalledWith({
      behavior: 'instant',
      top: 35,
    });
    expect(editor.update.navigation.flashTarget).toHaveBeenCalledWith({
      target: {
        path: [0],
        type: 'node',
      },
    });
  });

  it('tracks visibility and offset for the active toc item', async () => {
    const activeItem = document.createElement('div');
    const root = document.createElement('nav');

    activeItem.id = 'toc_item_active';
    root.append(activeItem);
    root.getBoundingClientRect = () => DOMRect.fromRect({ height: 100 });

    const { useTocObserver } = await import(
      `./useToc?toc-observer=${Math.random().toString(36).slice(2)}`
    );
    const { result } = renderHook(() =>
      useTocObserver({
        activeId: 'a',
        isObserve: true,
        tocRef: { current: root },
      })
    );

    act(() => {
      observers[0]?.callback(
        [
          {
            boundingClientRect: DOMRect.fromRect({ height: 140, y: -20 }),
            intersectionRatio: 0,
            rootBounds: DOMRect.fromRect({ height: 100 }),
          } as IntersectionObserverEntry,
        ],
        new IntersectionObserver(() => {})
      );
    });

    expect(observeMock).toHaveBeenCalledWith(activeItem);
    expect(result.current).toEqual({ offset: -70, visible: false });
  });

  it('scrolls the toc wrapper toward an active item outside its viewport', async () => {
    const activeItem = document.createElement('div');
    const root = document.createElement('nav');
    const wrapper = document.createElement('div');

    activeItem.id = 'toc_item_active';
    wrapper.id = 'toc_wrap';
    wrapper.scrollTop = 20;
    wrapper.scrollTo = mock();
    root.append(activeItem, wrapper);
    root.getBoundingClientRect = () => DOMRect.fromRect({ height: 100 });

    const { useTocController } = await import(
      `./useToc?toc-controller=${Math.random().toString(36).slice(2)}`
    );

    renderHook(() =>
      useTocController({
        activeId: 'a',
        isObserve: true,
        tocRef: { current: root },
      })
    );

    act(() => {
      observers[0]?.callback(
        [
          {
            boundingClientRect: DOMRect.fromRect({ height: 140, y: -20 }),
            intersectionRatio: 0,
            rootBounds: DOMRect.fromRect({ height: 100 }),
          } as IntersectionObserverEntry,
        ],
        new IntersectionObserver(() => {})
      );
    });

    expect(wrapper.scrollTo).toHaveBeenCalledWith({
      behavior: 'instant',
      top: -50,
    });
  });

  it('builds toc element state and click behavior from the shared family', async () => {
    const heading = document.createElement('h2');
    heading.getBoundingClientRect = () => DOMRect.fromRect({ y: 40 });
    const editor = createEditor(heading);
    const container = createScrollableContainer();

    useEditorMock.mockReturnValue(editor);
    useEditorPluginMock.mockReturnValue({
      editor,
      store: {
        get: () => ({ isScroll: false, topOffset: 5 }),
      },
    });
    useEditorSelectorMock.mockReturnValue([
      {
        depth: 1,
        id: 'h1',
        path: [0],
        title: 'Heading',
        type: 'h1',
      },
    ]);
    useEditorScrollElementMock.mockReturnValue(container);

    const { useTocElement, useTocElementState } = await import(
      `./useToc?toc-element=${Math.random().toString(36).slice(2)}`
    );
    const state = renderHook(() => useTocElementState());
    const element = renderHook(() => useTocElement(state.result.current));

    act(() => {
      element.result.current.props.onClick(
        { preventDefault: mock() } as Parameters<
          typeof element.result.current.props.onClick
        >[0],
        state.result.current.headingList[0],
        'instant'
      );
    });

    expect(state.result.current.headingList).toHaveLength(1);
    expect(editor.update.navigation.flashTarget).toHaveBeenCalledWith({
      target: {
        path: [0],
        type: 'node',
      },
    });
    expect(container.scrollTo).not.toHaveBeenCalled();
  });

  it('builds sidebar state and click handlers from the shared family', async () => {
    const heading = document.createElement('h2');
    heading.getBoundingClientRect = () => DOMRect.fromRect({ y: 40 });
    const editor = createEditor(heading);
    const container = createScrollableContainer();

    useEditorMock.mockReturnValue(editor);
    useEditorSelectorMock.mockReturnValue([
      {
        depth: 1,
        id: 'h1',
        path: [0],
        title: 'Heading',
        type: 'h1',
      },
    ]);
    useEditorScrollElementMock.mockReturnValue(container);

    const { useTocSideBar, useTocSideBarState } = await import(
      `./useToc?toc-sidebar=${Math.random().toString(36).slice(2)}`
    );
    const state = renderHook(() =>
      useTocSideBarState({ open: true, rootMargin: '0px', topOffset: 5 })
    );
    const sidebar = renderHook(() => useTocSideBar(state.result.current));

    act(() => {
      sidebar.result.current.navProps.onMouseEnter();
      sidebar.result.current.onContentClick(
        { preventDefault: mock() } as Parameters<
          typeof sidebar.result.current.onContentClick
        >[0],
        state.result.current.headingList[0]
      );
    });

    expect(state.result.current.mouseInToc).toBe(true);
    expect(editor.update.navigation.flashTarget).toHaveBeenCalledWith({
      target: {
        path: [0],
        type: 'node',
      },
    });
  });
});
