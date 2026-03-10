/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { act, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import useHotkeys from './useHotkeys';
import {
  HotkeysProvider,
  useHotkeysContext,
  type HotkeysContextType,
} from './HotkeysProvider';

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

describe('HotkeysProvider', () => {
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
    const { rerender, result } = renderHook<
      HotkeysContextType,
      { scopes: string[] }
    >(
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
});
