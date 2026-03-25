import type React from 'react';

import { act, renderHook } from '@testing-library/react';

const requestReRenderMock = mock();

mock.module('./useRequestReRender', () => ({
  useRequestReRender: () => requestReRenderMock,
}));

const loadModule = async () =>
  import(`./useRefreshOnResize?test=${Math.random().toString(36).slice(2)}`);

describe('useRefreshOnResize', () => {
  class ResizeObserverMock {
    callback: ResizeObserverCallback;
    disconnected = false;
    observed: Element[] = [];

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    disconnect = () => {
      this.disconnected = true;
    };

    observe = (element: Element) => {
      this.observed.push(element);
    };
  }

  let resizeObserverSpy: ReturnType<typeof spyOn>;
  let lastObserver: ResizeObserverMock | null;

  beforeEach(() => {
    lastObserver = null;
    requestReRenderMock.mockReset();
    resizeObserverSpy = spyOn(
      globalThis as any,
      'ResizeObserver'
    ).mockImplementation(((callback: ResizeObserverCallback) => {
      lastObserver = new ResizeObserverMock(callback);
      return lastObserver as any;
    }) as any);
  });

  afterEach(() => {
    resizeObserverSpy.mockRestore();
  });

  afterAll(() => {
    mock.restore();
  });

  it('clears the cache and requests rerender when refresh is called', async () => {
    const { useRefreshOnResize } = await loadModule();
    const selectionRectCache = {
      current: new WeakMap(),
    } as React.MutableRefObject<WeakMap<any, any>>;
    const token = {};
    selectionRectCache.current.set(token, 'stale');
    const containerRef = {
      current: document.createElement('div'),
    } as React.RefObject<HTMLElement | null>;

    const { result } = renderHook(() =>
      useRefreshOnResize({
        containerRef,
        refreshOnResize: false,
        selectionRectCache,
      })
    );

    act(() => {
      result.current.refresh();
    });

    expect(selectionRectCache.current.get(token)).toBeUndefined();
    expect(requestReRenderMock).toHaveBeenCalledWith(false);
    expect(resizeObserverSpy).not.toHaveBeenCalled();
  });

  it('observes the container and refreshes on resize when enabled', async () => {
    const { useRefreshOnResize } = await loadModule();
    const selectionRectCache = {
      current: new WeakMap(),
    } as React.MutableRefObject<WeakMap<any, any>>;
    const container = document.createElement('div');
    const containerRef = {
      current: container,
    } as React.RefObject<HTMLElement | null>;

    const { unmount } = renderHook(() =>
      useRefreshOnResize({
        containerRef,
        refreshOnResize: true,
        selectionRectCache,
      })
    );

    expect(lastObserver).not.toBeNull();
    expect(lastObserver!.observed).toHaveLength(1);
    expect(lastObserver!.observed[0]).toBe(container);

    const token = {};
    selectionRectCache.current.set(token, 'stale');

    act(() => {
      lastObserver!.callback([] as any, lastObserver as any);
    });

    expect(selectionRectCache.current.get(token)).toBeUndefined();
    expect(requestReRenderMock).toHaveBeenCalledWith(false);

    unmount();

    expect(lastObserver!.disconnected).toBe(true);
  });
});
