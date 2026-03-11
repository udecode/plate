import { renderHook, waitFor } from '@testing-library/react';

import { useStableMemo } from './useStableMemo';

describe('useStableMemo', () => {
  it('uses the initial producer result', () => {
    const { result } = renderHook(() => useStableMemo(() => 'initial', []));

    expect(result.current).toBe('initial');
  });

  it('does not recompute on rerender when deps stay stable', () => {
    const calls: number[] = [];
    const producer = (value: number) => {
      calls.push(value);

      return value * 2;
    };
    const { result, rerender } = renderHook(
      ({ dep, value }) => useStableMemo(() => producer(value), [dep]),
      {
        initialProps: { dep: 'stable', value: 2 },
      }
    );

    const callsAfterMount = calls.length;

    rerender({ dep: 'stable', value: 4 });

    expect(result.current).toBe(4);
    expect(calls.length).toBe(callsAfterMount);
  });

  it('recomputes when deps change', async () => {
    const calls: number[] = [];
    const producer = (value: number) => {
      calls.push(value);

      return value * 2;
    };
    const { result, rerender } = renderHook(
      ({ value }) => useStableMemo(() => producer(value), [value]),
      {
        initialProps: { value: 2 },
      }
    );

    rerender({ value: 3 });

    await waitFor(() => {
      expect(result.current).toBe(6);
    });
    expect(calls).toContain(3);
  });
});
