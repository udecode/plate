import { renderHook, waitFor } from '@testing-library/react';

import { useMemoizedSelector } from './useMemoizedSelector';

describe('useMemoizedSelector', () => {
  it('keeps the previous value when equalityFn says nothing changed', () => {
    const { result, rerender } = renderHook(
      ({ count }) =>
        useMemoizedSelector(
          () => ({ even: count % 2 === 0 }),
          [count],
          (a, b) => a.even === b.even
        ),
      {
        initialProps: { count: 2 },
      }
    );

    const previousValue = result.current;

    rerender({ count: 4 });

    expect(result.current).toBe(previousValue);
  });

  it('updates when equalityFn detects a change', async () => {
    const { result, rerender } = renderHook(
      ({ count }) =>
        useMemoizedSelector(
          () => ({ even: count % 2 === 0 }),
          [count],
          (a, b) => a.even === b.even
        ),
      {
        initialProps: { count: 2 },
      }
    );

    rerender({ count: 3 });

    await waitFor(() => {
      expect(result.current).toEqual({ even: false });
    });
  });
});
