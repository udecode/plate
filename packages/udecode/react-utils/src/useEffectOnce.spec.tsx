import { renderHook } from '@testing-library/react';

import { useEffectOnce } from './useEffectOnce';

describe('useEffectOnce', () => {
  it('runs the effect on first mount', () => {
    let callCount = 0;
    const effect = () => {
      callCount += 1;
    };

    renderHook(({ value }) => useEffectOnce(effect, [value]), {
      initialProps: { value: 1 },
    });

    expect(callCount).toBe(1);
  });

  it('does not rerun the effect when deps stay the same', () => {
    let callCount = 0;
    const effect = () => {
      callCount += 1;
    };
    const { rerender } = renderHook(
      ({ value }) => useEffectOnce(effect, [value]),
      {
        initialProps: { value: 1 },
      }
    );

    rerender({ value: 1 });

    expect(callCount).toBe(1);
  });

  it('reruns the effect when deps change', () => {
    let callCount = 0;
    const effect = () => {
      callCount += 1;
    };
    const { rerender } = renderHook(
      ({ value }) => useEffectOnce(effect, [value]),
      {
        initialProps: { value: 1 },
      }
    );

    rerender({ value: 2 });

    expect(callCount).toBe(2);
  });
});
