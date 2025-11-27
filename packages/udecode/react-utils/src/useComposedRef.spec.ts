import { renderHook } from '@testing-library/react';
import React from 'react';

import { composeRefs, useComposedRef } from './useComposedRef';

describe('useComposedRef', () => {
  it('should handle regular refs', () => {
    const ref1 = React.createRef<HTMLDivElement>();
    const ref2 = React.createRef<HTMLDivElement>();

    const { result } = renderHook(() => useComposedRef(ref1, ref2));

    const element = document.createElement('div');
    result.current(element);

    expect(ref1.current).toBe(element);
    expect(ref2.current).toBe(element);
  });

  it('should handle callback refs', () => {
    let captured1: HTMLDivElement | null = null;
    let captured2: HTMLDivElement | null = null;

    const callbackRef1 = (node: HTMLDivElement | null) => {
      captured1 = node;
    };

    const callbackRef2 = (node: HTMLDivElement | null) => {
      captured2 = node;
    };

    const { result } = renderHook(() =>
      useComposedRef(callbackRef1, callbackRef2)
    );

    const element = document.createElement('div');
    result.current(element);

    expect(captured1 as any).toBe(element);
    expect(captured2 as any).toBe(element);
  });

  it('should handle mixed ref types', () => {
    const ref = React.createRef<HTMLDivElement>();
    let captured: HTMLDivElement | null = null;

    const callbackRef = (node: HTMLDivElement | null) => {
      captured = node;
    };

    const { result } = renderHook(() => useComposedRef(ref, callbackRef));

    const element = document.createElement('div');
    result.current(element);

    expect(ref.current).toBe(element);
    expect(captured as any).toBe(element);
  });

  it('should handle undefined refs', () => {
    const ref = React.createRef<HTMLDivElement>();

    const { result } = renderHook(() => useComposedRef(ref, undefined, null));

    const element = document.createElement('div');
    expect(() => result.current(element)).not.toThrow();
    expect(ref.current).toBe(element);
  });

  it('should not return a function when no cleanup functions are returned', () => {
    const ref = React.createRef<HTMLDivElement>();
    const callbackRef = mock((_node: HTMLDivElement | null) => {
      // Callback ref without cleanup
    });

    const composedRef = composeRefs(ref, callbackRef);
    const element = document.createElement('div');

    const result = composedRef(element);

    // When no refs return cleanup functions, composed ref should return undefined
    expect(result).toBeUndefined();
  });

  it('should compose cleanup functions from callback refs', () => {
    const cleanup1 = mock();
    const cleanup2 = mock();

    const callbackRef1 = mock((node: HTMLDivElement | null) => {
      if (node) {
        return cleanup1;
      }
    });

    const callbackRef2 = mock((node: HTMLDivElement | null) => {
      if (node) {
        return cleanup2;
      }
    });

    const normalRef = React.createRef<HTMLDivElement>();

    const composedRef = composeRefs(normalRef, callbackRef1, callbackRef2);
    const element = document.createElement('div');

    const result = composedRef(element);

    // The composed ref should return a cleanup function
    expect(typeof result).toBe('function');
    expect(normalRef.current).toBe(element);

    // When cleanup is called, both cleanup functions should be called
    result!();
    expect(cleanup1).toHaveBeenCalled();
    expect(cleanup2).toHaveBeenCalled();
  });

  it('should handle mixed refs with some returning cleanup functions', () => {
    const cleanup = mock();

    const callbackRefWithCleanup = mock((node: HTMLDivElement | null) => {
      if (node) {
        return cleanup;
      }
    });

    const callbackRefWithoutCleanup = mock((_node: HTMLDivElement | null) => {
      // No cleanup returned
    });

    const normalRef = React.createRef<HTMLDivElement>();

    const composedRef = composeRefs(
      normalRef,
      callbackRefWithCleanup,
      callbackRefWithoutCleanup
    );
    const element = document.createElement('div');

    const result = composedRef(element);

    // Should still return a cleanup function since one ref has cleanup
    expect(typeof result).toBe('function');
    expect(normalRef.current).toBe(element);

    // When cleanup is called, only the cleanup function should be called
    result!();
    expect(cleanup).toHaveBeenCalled();
  });
});
