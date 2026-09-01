import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { renderHook } from '@testing-library/react';
import * as React from 'react';

const disconnect = mock();
const observe = mock();
const setReference = mock();
const update = mock();
const useFloatingMock = mock();
const floatingElement = document.createElement('div');
let floatingOptions: Record<string, unknown> = {};
let isPositioned = true;

class ResizeObserverMock {
  disconnect = disconnect;
  observe = observe;
}

Object.defineProperty(window, 'ResizeObserver', {
  configurable: true,
  value: ResizeObserverMock,
});

mock.module('@floating-ui/react', () => ({
  useFloating: (options: Record<string, unknown>) => {
    floatingOptions = options;
    useFloatingMock(options);

    return {
      elements: { floating: floatingElement },
      floatingStyles: { left: 12, position: 'fixed', top: 24 },
      isPositioned,
      middlewareData: {},
      refs: { setReference },
      update,
    };
  },
}));

mock.module('platejs/react', () => ({
  useIsomorphicLayoutEffect: React.useLayoutEffect,
}));

const geometry = {
  boundingRect: {
    bottom: 80,
    height: 20,
    left: 40,
    right: 100,
    top: 60,
    width: 60,
    x: 40,
    y: 60,
  },
  focusRect: null,
  rects: [],
};

describe('useWidgetFloating', () => {
  beforeEach(() => {
    disconnect.mockClear();
    observe.mockClear();
    setReference.mockClear();
    update.mockClear();
    useFloatingMock.mockClear();
    isPositioned = true;
  });

  afterAll(() => {
    mock.restore();
  });

  it('adapts immutable geometry without installing reference auto-update', async () => {
    const { useWidgetFloating } = await import(
      `./use-widget-floating?test=${Math.random().toString(36).slice(2)}`
    );
    const initialProps: { currentGeometry: typeof geometry | null } = {
      currentGeometry: geometry,
    };
    const view = renderHook(
      ({ currentGeometry }: { currentGeometry: typeof geometry | null }) =>
        useWidgetFloating(currentGeometry, { open: true, placement: 'top' }),
      { initialProps }
    );
    const reference = setReference.mock.calls[0]?.[0];

    expect(floatingOptions).toEqual({ open: true, placement: 'top' });
    expect(floatingOptions).not.toHaveProperty('whileElementsMounted');
    expect(reference.getBoundingClientRect()).toBe(geometry.boundingRect);
    expect(update).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledWith(floatingElement);
    expect(view.result.current.style).toMatchObject({
      left: 12,
      position: 'fixed',
      top: 24,
    });

    view.rerender({ currentGeometry: null });

    expect(setReference).toHaveBeenLastCalledWith(null);
    expect(view.result.current.style.display).toBe('none');
    view.unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('stays hidden until Floating UI resolves the first position', async () => {
    isPositioned = false;

    const { useWidgetFloating } = await import(
      `./use-widget-floating?test=${Math.random().toString(36).slice(2)}`
    );
    const view = renderHook(() => useWidgetFloating(geometry, { open: true }));

    expect(view.result.current.style.display).toBeUndefined();
    expect(view.result.current.style.visibility).toBe('hidden');

    isPositioned = true;
    view.rerender();

    expect(view.result.current.style.visibility).toBeUndefined();
    view.unmount();
  });
});
