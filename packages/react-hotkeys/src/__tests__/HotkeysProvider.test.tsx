import React from 'react';
import type { ReactNode } from 'react';

import { act, render, renderHook } from '@testing-library/react';

import type { HotkeysContextType } from '../internal/HotkeysProvider';

import { HotkeysProvider, useHotkeys, useHotkeysContext } from '..';

it('should render children', () => {
  const { getByText } = render(
    <HotkeysProvider>
      <div>Hello</div>
    </HotkeysProvider>
  );

  expect(getByText('Hello')).toBeInTheDocument();
});

it('should default to wildcard scope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  });

  expect(result.current.activeScopes).toEqual(['*']);
});

it('should return active scopes and scope modifying functions', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  });

  expect(result.current.activeScopes).toEqual(['*']);
  expect(result.current.enableScope).toBeInstanceOf(Function);
  expect(result.current.disableScope).toBeInstanceOf(Function);
  expect(result.current.toggleScope).toBeInstanceOf(Function);
});

it('should activate scope by calling enableScope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  });

  act(() => {
    result.current.enableScope('foo');
  });

  expect(result.current.activeScopes).toEqual(['foo']);
});

it('should return multiple scopes if different scopes are activated', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  });

  act(() => {
    result.current.enableScope('foo');
  });

  expect(result.current.activeScopes).toEqual(['foo']);

  act(() => {
    result.current.enableScope('bar');
  });

  expect(result.current.activeScopes).toEqual(['foo', 'bar']);
});

it('should deactivate scope by calling disableScope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  });

  act(() => {
    result.current.enableScope('foo');
  });

  act(() => {
    result.current.enableScope('bar');
  });

  expect(result.current.activeScopes).toEqual(['foo', 'bar']);

  act(() => {
    result.current.disableScope('foo');
  });

  expect(result.current.activeScopes).toEqual(['bar']);
});

it('should toggle scope by calling toggleScope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  });

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

it('should be able to disable wildcard like any other scope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  });

  act(() => {
    result.current.disableScope('*');
  });

  expect(result.current.activeScopes).toEqual([]);
});

it('should return initially set scopes', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider initiallyActiveScopes={['foo', 'bar']}>
      {children}
    </HotkeysProvider>
  );
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper,
  });

  expect(result.current.activeScopes).toEqual(['foo', 'bar']);
});

it('should return all bound hotkeys', () => {
  const useIntegratedHotkeys = () => {
    useHotkeys('a', () => null, { scopes: ['foo'] });

    return useHotkeysContext();
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider initiallyActiveScopes={['foo']}>
      {children}
    </HotkeysProvider>
  );
  const { result } = renderHook(useIntegratedHotkeys, {
    wrapper,
  });

  expect(result.current.hotkeys).toHaveLength(1);
});

it('should update bound hotkeys when useHotkeys changes its scopes', () => {
  const useIntegratedHotkeys = (scopes: string[]) => {
    useHotkeys('a', () => null, { scopes });

    return useHotkeysContext();
  };

  const wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <HotkeysProvider initiallyActiveScopes={['foo']}>
        {children}
      </HotkeysProvider>
    );
  };

  const { rerender, result } = renderHook<
    HotkeysContextType,
    { scopes: string[] }
  >(({ scopes }) => useIntegratedHotkeys(scopes), {
    initialProps: {
      scopes: ['foo'],
    },
    // @ts-ignore
    wrapper,
  });

  expect(result.current.hotkeys).toHaveLength(1);

  rerender({ scopes: ['bar'] });

  expect(result.current.hotkeys).toHaveLength(0);
});

it('should return bound hotkeys when defined as a string array', () => {
  const useIntegratedHotkeys = () => {
    useHotkeys(['a+c', 'b'], () => null, { scopes: ['foo'] });

    return useHotkeysContext();
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider initiallyActiveScopes={['foo']}>
      {children}
    </HotkeysProvider>
  );
  const { result } = renderHook(useIntegratedHotkeys, {
    wrapper,
  });
  expect(result.current.hotkeys[0].keys).toEqual(['a', 'c']);
  expect(result.current.hotkeys[1].keys).toEqual(['b']);
});

it('should return descriptions for bound hotkeys', () => {
  const useIntegratedHotkeys = () => {
    useHotkeys('a', () => null, { description: 'bar', scopes: ['foo'] });

    return useHotkeysContext();
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <HotkeysProvider initiallyActiveScopes={['foo']}>
      {children}
    </HotkeysProvider>
  );
  const { result } = renderHook(useIntegratedHotkeys, {
    wrapper,
  });

  expect(result.current.hotkeys[0].description).toEqual('bar');
});

it('should have no active scopes after deactivating all current scopes', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  });
  act(() => {
    result.current.enableScope('foo');
  });
  act(() => {
    result.current.enableScope('bar');
  });
  expect(result.current.activeScopes).toEqual(['foo', 'bar']);
  act(() => {
    result.current.disableScope('foo');
  });
  act(() => {
    result.current.disableScope('bar');
  });

  expect(result.current.activeScopes).toEqual([]);
});
