import { renderHook } from '@testing-library/react';

import { useStableFn } from './useStableFn';

describe('useStableFn', () => {
  it('keeps the callback identity stable when deps do not change', () => {
    const { result, rerender } = renderHook(
      ({ dep, value }) => useStableFn(() => value, [dep]),
      {
        initialProps: { dep: 1, value: 'one' },
      }
    );

    const initialCallback = result.current;

    rerender({ dep: 1, value: 'two' });

    expect(result.current).toBe(initialCallback);
  });

  it('calls the latest function body', () => {
    const { result, rerender } = renderHook(
      ({ dep, value }) => useStableFn(() => value, [dep]),
      {
        initialProps: { dep: 1, value: 'one' },
      }
    );

    rerender({ dep: 1, value: 'two' });

    expect(result.current()).toBe('two');
  });

  it('changes the callback identity only when deps change', () => {
    const { result, rerender } = renderHook(
      ({ dep, value }) => useStableFn(() => value, [dep]),
      {
        initialProps: { dep: 1, value: 'one' },
      }
    );

    const initialCallback = result.current;

    rerender({ dep: 2, value: 'two' });

    expect(result.current).not.toBe(initialCallback);
  });
});
