import type React from 'react';

import { act, renderHook } from '@testing-library/react';

import { useRefreshOnResize } from './useRefreshOnResize';

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

  let cancelAnimationFrameSpy: AnyTestMock;
  let requestAnimationFrameSpy: AnyTestMock;
  let resizeObserverSpy: AnyTestMock;
  let lastObserver: ResizeObserverMock | null;

  beforeEach(() => {
    lastObserver = null;
    requestAnimationFrameSpy = spyOn(
      globalThis,
      'requestAnimationFrame'
    ).mockImplementation((() => 11) as typeof requestAnimationFrame);
    cancelAnimationFrameSpy = spyOn(
      globalThis,
      'cancelAnimationFrame'
    ).mockImplementation((() => {}) as typeof cancelAnimationFrame);
    resizeObserverSpy = spyOn(
      globalThis as any,
      'ResizeObserver'
    ).mockImplementation(((callback: ResizeObserverCallback) => {
      lastObserver = new ResizeObserverMock(callback);
      return lastObserver as any;
    }) as any);
  });

  afterEach(() => {
    cancelAnimationFrameSpy.mockRestore();
    requestAnimationFrameSpy.mockRestore();
    resizeObserverSpy.mockRestore();
  });

  it('clears the cache and requests rerender when refresh is called', () => {
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
    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
    expect(resizeObserverSpy).not.toHaveBeenCalled();
  });

  it('observes the container and refreshes on resize when enabled', () => {
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
    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);

    unmount();

    expect(lastObserver!.disconnected).toBe(true);
  });
});
