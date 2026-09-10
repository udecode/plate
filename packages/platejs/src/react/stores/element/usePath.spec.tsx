import { act, render, renderHook } from '@testing-library/react';
import React from 'react';

import type { Element, NodeEntry } from '../../../core';
import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createEditor } from '../../editor';
import { ElementProvider } from './useElementStore';
import { usePath } from './usePath';

describe('path projection preserves independent position jobs', () => {
  it('skips ancestor-only movement and publishes a changed row index', () => {
    const editor = createEditor();
    const element: Element = { type: 'row', children: [{ text: '' }] };
    let update!: React.Dispatch<React.SetStateAction<NodeEntry<Element>>>;
    let renders = 0;
    const Child = () => {
      const index = usePath((path) => path.at(-1));
      renders += 1;
      return <span data-testid="index">{index}</span>;
    };
    const Wrapper = () => {
      const [entry, setEntry] = React.useState<NodeEntry<Element>>([
        element,
        [0, 2],
      ]);
      update = setEntry;
      const child = React.useMemo(() => <Child />, []);
      return (
        <Plate editor={editor}>
          <ElementProvider element={element} entry={entry} path={entry[1]}>
            {child}
          </ElementProvider>
        </Plate>
      );
    };
    const view = render(<Wrapper />);
    const initialRenders = renders;
    expect(view.getByTestId('index').textContent).toBe('2');
    act(() => update(([node]) => [node, [3, 2]]));
    expect(renders).toBe(initialRenders);
    act(() => update(([node]) => [node, [3, 4]]));
    expect(view.getByTestId('index').textContent).toBe('4');
    expect(renders).toBe(initialRenders + 1);
  });

  it('supports custom derived equality and fresh selector closures', () => {
    const editor = createEditor();
    const element: Element = { type: 'row', children: [{ text: '' }] };
    let update!: React.Dispatch<React.SetStateAction<NodeEntry<Element>>>;
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const [entry, setEntry] = React.useState<NodeEntry<Element>>([
        element,
        [0, 2],
      ]);
      update = setEntry;
      return (
        <Plate editor={editor}>
          <ElementProvider element={element} entry={entry} path={entry[1]}>
            {children}
          </ElementProvider>
        </Plate>
      );
    };
    const view = renderHook(
      ({ extra }) =>
        usePath((path) => ({ index: path.at(-1)! + extra }), {
          equalityFn: (a, b) => a.index === b.index,
        }),
      { wrapper: Wrapper, initialProps: { extra: 0 } }
    );
    const first = view.result.current;
    act(() => update(([node]) => [node, [3, 2]]));
    expect(view.result.current).toBe(first);
    view.rerender({ extra: 5 });
    expect(view.result.current).toEqual({ index: 7 });
  });

  it('copies paths before exposing them to callers or selectors', () => {
    const editor = createEditor();
    const element: Element = { type: 'row', children: [{ text: '' }] };
    const entry: NodeEntry<Element> = [element, [0, 2]];
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>
        <ElementProvider element={element} entry={entry} path={entry[1]}>
          {children}
        </ElementProvider>
      </Plate>
    );
    const whole = renderHook(() => usePath(), { wrapper: Wrapper });
    Reflect.set(whole.result.current, '0', 99);
    const derived = renderHook(
      () =>
        usePath((path) => {
          Reflect.set(path, '0', 77);
          return path.at(-1);
        }),
      { wrapper: Wrapper }
    );
    expect(derived.result.current).toBe(2);
    expect(entry[1]).toEqual([0, 2]);
  });
});
