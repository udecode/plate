/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { act, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import useHotkeys from './useHotkeys';
import { HotkeysProvider, useHotkeysContext } from './HotkeysProvider';

const createWrapper =
  (initiallyActiveScopes?: string[]) =>
  ({ children }: { children: ReactNode }) => (
    <HotkeysProvider initiallyActiveScopes={initiallyActiveScopes}>
      {children}
    </HotkeysProvider>
  );

const renderContext = (initiallyActiveScopes?: string[]) =>
  renderHook(() => useHotkeysContext(), {
    wrapper: createWrapper(initiallyActiveScopes),
  });

const pressA = () => {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyA', key: 'a' })
    );
    document.dispatchEvent(
      new KeyboardEvent('keyup', { code: 'KeyA', key: 'a' })
    );
  });
};

describe('HotkeysProvider', () => {
  afterEach(() => {
    window.dispatchEvent(new Event('blur'));
  });

  it('renders its children', () => {
    const { getByText } = render(
      <HotkeysProvider>
        <div>Hello</div>
      </HotkeysProvider>
    );

    expect(getByText('Hello')).toBeTruthy();
  });

  it('starts with the wildcard scope by default', () => {
    const { result } = renderContext();

    expect(result.current.activeScopes).toEqual(['*']);
  });

  it('exposes scope mutators on the context', () => {
    const { result } = renderContext();

    expect(result.current.enableScope).toBeInstanceOf(Function);
    expect(result.current.disableScope).toBeInstanceOf(Function);
    expect(result.current.toggleScope).toBeInstanceOf(Function);
  });

  it('replaces the wildcard when enabling the first named scope', () => {
    const { result } = renderContext();

    act(() => {
      result.current.enableScope('foo');
    });

    expect(result.current.activeScopes).toEqual(['foo']);
  });

  it('prepends newly enabled scopes', () => {
    const { result } = renderContext();

    act(() => {
      result.current.enableScope('foo');
      result.current.enableScope('bar');
    });

    expect(result.current.activeScopes).toEqual(['bar', 'foo']);
  });

  it('removes disabled scopes', () => {
    const { result } = renderContext();

    act(() => {
      result.current.enableScope('foo');
      result.current.enableScope('bar');
    });

    act(() => {
      result.current.disableScope('foo');
    });

    expect(result.current.activeScopes).toEqual(['bar']);
  });

  it('toggles scopes on and off', () => {
    const { result } = renderContext();

    act(() => {
      result.current.enableScope('foo');
    });

    expect(result.current.activeScopes).toEqual(['foo']);

    act(() => {
      result.current.toggleScope('foo');
    });

    expect(result.current.activeScopes).toEqual([]);

    act(() => {
      result.current.toggleScope('foo');
    });

    expect(result.current.activeScopes).toEqual(['foo']);
  });

  it('allows the wildcard scope to be disabled', () => {
    const { result } = renderContext();

    act(() => {
      result.current.disableScope('*');
    });

    expect(result.current.activeScopes).toEqual([]);
  });

  it('uses the provided initial scopes', () => {
    const { result } = renderContext(['foo', 'bar']);

    expect(result.current.activeScopes).toEqual(['foo', 'bar']);
  });

  it('tracks bound hotkeys registered by useHotkeys', () => {
    const { result } = renderHook(
      () => {
        useHotkeys('a', () => null, { scopes: ['foo'] });

        return useHotkeysContext();
      },
      {
        wrapper: createWrapper(['foo']),
      }
    );

    expect(result.current.hotkeys).toHaveLength(1);
  });

  it('drops bound hotkeys when their scopes stop matching', () => {
    const { rerender, result } = renderHook(
      ({ scopes }) => {
        useHotkeys('a', () => null, { scopes });

        return useHotkeysContext();
      },
      {
        initialProps: {
          scopes: ['foo'],
        },
        wrapper: createWrapper(['foo']),
      }
    );

    expect(result.current.hotkeys).toHaveLength(1);

    rerender({ scopes: ['bar'] });

    expect(result.current.hotkeys).toHaveLength(0);
  });

  it('normalizes array key bindings', () => {
    const { result } = renderHook(
      () => {
        useHotkeys(['a+c', 'b'], () => null, { scopes: ['foo'] });

        return useHotkeysContext();
      },
      {
        wrapper: createWrapper(['foo']),
      }
    );

    expect(result.current.hotkeys[0].keys).toEqual(['a', 'c']);
    expect(result.current.hotkeys[1].keys).toEqual(['b']);
  });

  it('stores hotkey descriptions', () => {
    const { result } = renderHook(
      () => {
        useHotkeys('a', () => null, {
          description: 'bar',
          scopes: ['foo'],
        });

        return useHotkeysContext();
      },
      {
        wrapper: createWrapper(['foo']),
      }
    );

    expect(result.current.hotkeys[0].description).toEqual('bar');
  });

  it('uses the latest callback when dependencies are omitted', () => {
    const first = mock();
    const second = mock();
    const { rerender } = renderHook(
      ({ callback }) => useHotkeys('a', callback),
      {
        initialProps: { callback: first },
      }
    );

    pressA();
    rerender({ callback: second });
    pressA();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('keeps the returned element ref stable across rerenders', () => {
    const { rerender, result } = renderHook(() => useHotkeys('a', () => null));
    const firstRef = result.current;

    rerender();

    expect(result.current).toBe(firstRef);
  });

  it('updates a dependency-bound callback only when its dependencies change', () => {
    const first = mock();
    const second = mock();
    const { rerender } = renderHook(
      ({ callback, dependency }) => useHotkeys('a', callback, {}, [dependency]),
      {
        initialProps: { callback: first, dependency: 0 },
      }
    );

    pressA();
    rerender({ callback: second, dependency: 0 });
    pressA();
    rerender({ callback: second, dependency: 1 });
    pressA();

    expect(first).toHaveBeenCalledTimes(2);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('unregisters a bound hotkey when explicitly disabled', () => {
    const { rerender, result } = renderHook(
      ({ enabled }) => {
        useHotkeys('a', () => null, { enabled, scopes: ['foo'] });

        return useHotkeysContext();
      },
      {
        initialProps: { enabled: true },
        wrapper: createWrapper(['foo']),
      }
    );

    expect(result.current.hotkeys).toHaveLength(1);

    rerender({ enabled: false });

    expect(result.current.hotkeys).toHaveLength(0);
  });
});
