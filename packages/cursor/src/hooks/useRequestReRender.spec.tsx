import { act, renderHook } from '@testing-library/react';

import { useRequestReRender } from './useRequestReRender';

describe('useRequestReRender', () => {
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;

  afterEach(() => {
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  });

  it('coalesces scheduled renders even when the browser returns frame id zero', () => {
    let frameCallback: FrameRequestCallback | undefined;
    let renderCount = 0;

    globalThis.requestAnimationFrame = (callback) => {
      frameCallback = callback;

      return 0;
    };

    const { result } = renderHook(() => {
      renderCount++;

      return useRequestReRender();
    });

    act(() => {
      result.current();
      result.current();
    });

    expect(frameCallback).toBeDefined();
    expect(renderCount).toBe(1);

    act(() => {
      frameCallback?.(0);
    });

    expect(renderCount).toBe(2);
  });

  it('cancels a pending frame before an immediate render', () => {
    const cancelAnimationFrame = mock();
    let renderCount = 0;

    globalThis.cancelAnimationFrame = cancelAnimationFrame;
    globalThis.requestAnimationFrame = () => 7;

    const { result } = renderHook(() => {
      renderCount++;

      return useRequestReRender();
    });

    act(() => {
      result.current();
      result.current(true);
    });

    expect(cancelAnimationFrame).toHaveBeenCalledWith(7);
    expect(renderCount).toBe(2);
  });
});
