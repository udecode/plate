import React from 'react';

import { renderHook } from '@testing-library/react';

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

    expect(captured1).toBe(element);
    expect(captured2).toBe(element);
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
    expect(captured).toBe(element);
  });

  it('should handle undefined refs', () => {
    const ref = React.createRef<HTMLDivElement>();

    const { result } = renderHook(() => useComposedRef(ref, undefined, null));

    const element = document.createElement('div');
    expect(() => result.current(element)).not.toThrow();
    expect(ref.current).toBe(element);
  });

  it('should not return a function that returns a function (React 18 rule)', () => {
    // This is the test that should fail with the current implementation
    const ref = React.createRef<HTMLDivElement>();
    const callbackRef = jest.fn((node: HTMLDivElement | null) => {
      // Callback refs should not return anything
    });

    const composedRef = composeRefs(ref, callbackRef);
    const element = document.createElement('div');

    const result = composedRef(element);

    // React expects callback refs to not return a function
    // If this returns a function, React will throw the warning:
    // "Unexpected return value from a callback ref"
    expect(typeof result).not.toBe('function');
  });

  it('should handle callback refs that return functions (edge case)', () => {
    // This simulates a broken callback ref that returns a function
    const brokenCallbackRef = jest.fn(() => {
      // This is incorrect - callback refs should not return functions
      return () => console.log('cleanup');
    });

    const normalRef = React.createRef<HTMLDivElement>();

    const composedRef = composeRefs(normalRef, brokenCallbackRef);
    const element = document.createElement('div');

    const result = composedRef(element);

    // The composed ref should not return a function even if one of the refs does
    expect(typeof result).not.toBe('function');
    expect(normalRef.current).toBe(element);
  });
});
