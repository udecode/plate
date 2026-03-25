import { renderHook, act } from '@testing-library/react';

import { useRequestReRender } from './useRequestReRender';

describe('useRequestReRender', () => {
  let rafSpy: ReturnType<typeof spyOn>;
  let cancelSpy: ReturnType<typeof spyOn>;
  let queued: FrameRequestCallback | null;

  beforeEach(() => {
    queued = null;
    rafSpy = spyOn(globalThis, 'requestAnimationFrame').mockImplementation(((
      cb: FrameRequestCallback
    ) => {
      queued = cb;
      return 11;
    }) as any);
    cancelSpy = spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(
      (() => {}) as any
    );
  });

  afterEach(() => {
    mock.restore();
  });

  it('coalesces async rerenders until the queued frame runs', () => {
    const { result } = renderHook(() => useRequestReRender());

    act(() => {
      result.current();
      result.current();
    });

    expect(rafSpy).toHaveBeenCalledTimes(1);
    expect(queued).not.toBeNull();

    act(() => {
      queued?.(0);
    });

    act(() => {
      result.current();
    });

    expect(rafSpy).toHaveBeenCalledTimes(2);
  });

  it('cancels pending async work when forcing a sync rerender', () => {
    const { result } = renderHook(() => useRequestReRender());

    act(() => {
      result.current();
      result.current(true);
    });

    expect(cancelSpy).toHaveBeenCalledWith(11);
    expect(rafSpy).toHaveBeenCalledTimes(1);
  });
});
