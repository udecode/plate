import { describe, expect, it, mock, spyOn } from 'bun:test';

import { act, render, renderHook } from '@testing-library/react';
import React, { Component, startTransition, Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { createStore } from 'zustand/vanilla';

import { useZustandSelector } from './useZustandSelector';

describe('useZustandSelector', () => {
  it('delivers a thrown selector error to React and can remount after recovery', () => {
    const store = createStore(() => ({ value: 1 }));
    const expected = new Error('selector failed');
    const caught = mock<(error: Error) => void>(() => {});
    const consoleError = spyOn(console, 'error').mockImplementation(() => {});

    class Boundary extends Component<
      React.PropsWithChildren,
      { failed: boolean }
    > {
      state = { failed: false };

      static getDerivedStateFromError() {
        return { failed: true };
      }

      componentDidCatch(error: Error) {
        caught(error);
      }

      render() {
        return this.state.failed ? 'failed' : this.props.children;
      }
    }

    function Probe() {
      const value = useZustandSelector(store, (state) => {
        if (state.value === 2) throw expected;

        return state.value;
      });

      return <output>{value}</output>;
    }

    const view = render(
      <Boundary>
        <Probe />
      </Boundary>
    );

    try {
      act(() => store.setState({ value: 2 }));
      expect(view.container.textContent).toBe('failed');
      expect(caught).toHaveBeenCalledWith(expected);
      act(() => store.setState({ value: 3 }));
      view.rerender(
        <Boundary key="recovered">
          <Probe />
        </Boundary>
      );
      expect(view.container.textContent).toBe('3');
    } finally {
      view.unmount();
      consoleError.mockRestore();
    }
  });

  it('keeps abandoned values out of the committed selector cache', async () => {
    const store = createStore(() => ({ value: 1 }));
    const committed = () => store.getState().value;
    const abandoned = () => 999;
    const preserve = () => true;
    const suspended = new Promise<never>(() => {});

    function Probe({ suspend }: { suspend: boolean }) {
      const value = useZustandSelector(
        store,
        suspend ? abandoned : committed,
        suspend ? Object.is : preserve
      );

      if (suspend) throw suspended;

      return <output>{value}</output>;
    }

    const tree = (suspend: boolean) => (
      <Suspense fallback="loading">
        <Probe suspend={suspend} />
      </Suspense>
    );
    const view = render(tree(false));

    await act(async () => {
      startTransition(() => view.rerender(tree(true)));
    });
    act(() => store.setState({ value: 2 }));
    view.rerender(tree(false));

    expect(view.container.textContent).toBe('1');
  });

  it('replaces the store without carrying over values through equality', () => {
    const first = createStore(() => ({ value: 1 }));
    const second = createStore(() => ({ value: 2 }));
    const preserve = () => true;
    const { result, rerender } = renderHook(
      ({ store }) =>
        useZustandSelector(store, (state) => state.value, preserve),
      { initialProps: { store: first } }
    );

    expect(result.current).toBe(1);
    rerender({ store: second });
    expect(result.current).toBe(2);
    act(() => first.setState({ value: 3 }));
    expect(result.current).toBe(2);
  });

  it('does not select or compare absent stores and can restore one', () => {
    const store = createStore(() => ({ value: 1 }));
    const select = mock(() => store.getState().value);
    const compare = mock(() => true);
    const { result, rerender, unmount } = renderHook(
      ({ present }) =>
        useZustandSelector(present ? store : null, select, compare),
      { initialProps: { present: false } }
    );

    expect(result.current).toBeNull();
    expect(select).not.toHaveBeenCalled();
    expect(compare).not.toHaveBeenCalled();
    rerender({ present: true });
    expect(result.current).toBe(1);
    rerender({ present: false });
    act(() => store.setState({ value: 2 }));
    expect(result.current).toBeNull();
    rerender({ present: true });
    expect(result.current).toBe(2);
    unmount();
    const selected = select.mock.calls.length;
    act(() => store.setState({ value: 3 }));
    expect(select.mock.calls.length).toBe(selected);
  });

  it('reads current server snapshots without activating a subscription', () => {
    const store = createStore(() => ({ value: 1 }));
    const subscribe = mock(store.subscribe);

    store.subscribe = subscribe;
    store.setState({ value: 2 });

    function Probe() {
      return (
        <output>{useZustandSelector(store, (state) => state.value)}</output>
      );
    }

    expect(renderToString(<Probe />)).toBe('<output>2</output>');
    expect(subscribe).not.toHaveBeenCalled();
  });

  it('preserves selected identity across an equal replacement selector', () => {
    const store = createStore(() => ({ value: 1, other: 0 }));
    const { result, rerender } = renderHook(
      ({ tick }) =>
        useZustandSelector(
          store,
          (state) => ({ value: state.value, tick }),
          (left, right) => left.value === right.value
        ),
      { initialProps: { tick: 0 } }
    );
    const first = result.current;

    rerender({ tick: 1 });
    expect(result.current).toBe(first);
    act(() => store.setState({ other: 1 }));
    expect(result.current).toBe(first);
    act(() => store.setState({ value: 2 }));
    expect(result.current).toEqual({ value: 2, tick: 1 });
  });
});
