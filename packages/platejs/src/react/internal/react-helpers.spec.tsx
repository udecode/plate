import { renderHook } from '@testing-library/react';
import React from 'react';

import { composeRefs, useComposedRef } from './react-helpers';

describe('useComposedRef', () => {
  it('handle regular refs', () => {
    const ref1 = React.createRef<HTMLDivElement>();
    const ref2 = React.createRef<HTMLDivElement>();

    const { result } = renderHook(() => useComposedRef(ref1, ref2));

    const element = document.createElement('div');
    result.current(element);

    expect(ref1.current).toBe(element);
    expect(ref2.current).toBe(element);
  });

  it('handle callback refs', () => {
    const captured1: Array<HTMLDivElement | null> = [];
    const captured2: Array<HTMLDivElement | null> = [];

    const callbackRef1 = (node: HTMLDivElement | null) => {
      captured1.push(node);
    };

    const callbackRef2 = (node: HTMLDivElement | null) => {
      captured2.push(node);
    };

    const { result } = renderHook(() =>
      useComposedRef(callbackRef1, callbackRef2)
    );

    const element = document.createElement('div');
    result.current(element);

    expect(captured1).toContain(element);
    expect(captured2).toContain(element);
  });

  it('handle mixed ref types', () => {
    const ref = React.createRef<HTMLDivElement>();
    const captured: Array<HTMLDivElement | null> = [];

    const callbackRef = (node: HTMLDivElement | null) => {
      captured.push(node);
    };

    const { result } = renderHook(() => useComposedRef(ref, callbackRef));

    const element = document.createElement('div');
    result.current(element);

    expect(ref.current).toBe(element);
    expect(captured).toContain(element);
  });

  it('handle undefined refs', () => {
    const ref = React.createRef<HTMLDivElement>();

    const { result } = renderHook(() => useComposedRef(ref, undefined, null));

    const element = document.createElement('div');
    expect(() => result.current(element)).not.toThrow();
    expect(ref.current).toBe(element);
  });

  it('does not return a function when no cleanup functions are returned', () => {
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

  it('compose cleanup functions from callback refs', () => {
    const cleanup1 = mock();
    const cleanup2 = mock();

    const callbackRef1 = mock((node: HTMLDivElement | null) => {
      if (node) {
        return cleanup1;
      }

      return undefined;
    });

    const callbackRef2 = mock((node: HTMLDivElement | null) => {
      if (node) {
        return cleanup2;
      }

      return undefined;
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

  it('handle mixed refs with some returning cleanup functions', () => {
    const cleanup = mock();

    const callbackRefWithCleanup = mock((node: HTMLDivElement | null) => {
      if (node) {
        return cleanup;
      }

      return undefined;
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
