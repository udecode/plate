import { act, render, renderHook } from '@testing-library/react';
import React from 'react';

import type { Element, NodeEntry } from '../../../core';
import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createEditor } from '../../editor';
import { useElementSelector } from './useElementSelector';
import { ElementProvider } from './useElementStore';
import { usePath } from './usePath';

describe('element payload and position have independent subscriptions', () => {
  it('skips the element query on path movement while usePath reads the new position', () => {
    const editor = createEditor();
    const element: Element = { type: 'paragraph', children: [{ text: 'one' }] };
    let setEntry!: React.Dispatch<React.SetStateAction<NodeEntry<Element>>>;
    let calls = 0;
    const selector = (node: Element) => {
      calls += 1;
      return node.type;
    };
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const [entry, update] = React.useState<NodeEntry<Element>>([
        element,
        [0],
      ]);
      setEntry = update;
      return (
        <Plate editor={editor}>
          <ElementProvider element={entry[0]} entry={entry} path={entry[1]}>
            {children}
          </ElementProvider>
        </Plate>
      );
    };
    const { result } = renderHook(
      () => ({ type: useElementSelector(selector), path: usePath() }),
      { wrapper: Wrapper }
    );
    expect(result.current).toEqual({ type: 'paragraph', path: [0] });
    const initialCalls = calls;
    act(() => setEntry(([node]) => [node, [2, 1]]));
    expect(result.current).toEqual({ type: 'paragraph', path: [2, 1] });
    expect(calls).toBe(initialCalls);
    act(() => setEntry(([node, path]) => [{ ...node, type: 'heading' }, path]));
    expect(result.current).toEqual({ type: 'heading', path: [2, 1] });
    expect(calls).toBe(initialCalls + 1);
  });

  it('passes the prior accepted derived value when the element changes', () => {
    const editor = createEditor();
    let setEntry!: React.Dispatch<React.SetStateAction<NodeEntry<Element>>>;
    const selector = (node: Element, previous?: string) =>
      previous ? `${previous}/${node.type}` : node.type;
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const [entry, update] = React.useState<NodeEntry<Element>>([
        { type: 'first', children: [{ text: '' }] },
        [0],
      ]);
      setEntry = update;
      return (
        <Plate editor={editor}>
          <ElementProvider element={entry[0]} entry={entry} path={entry[1]}>
            {children}
          </ElementProvider>
        </Plate>
      );
    };
    const { result } = renderHook(() => useElementSelector(selector), {
      wrapper: Wrapper,
    });
    expect(result.current).toBe('first');
    act(() => setEntry(([node, path]) => [{ ...node, type: 'second' }, path]));
    expect(result.current).toBe('first/second');
  });

  it('detaches observers and reads current state when mounted again', () => {
    const editor = createEditor();
    let change!: (type: string) => void;
    let show!: (visible: boolean) => void;
    let calls = 0;
    const selector = (node: Element) => {
      calls += 1;
      return node.type;
    };
    const Child = () => (
      <span data-testid="selected">{useElementSelector(selector)}</span>
    );
    const Wrapper = () => {
      const [element, setElement] = React.useState<Element>({
        type: 'first',
        children: [{ text: '' }],
      });
      const [visible, setVisible] = React.useState(true);
      change = (type) => setElement((node) => ({ ...node, type }));
      show = setVisible;
      const path = React.useMemo(() => [0], []);
      const entry = React.useMemo<NodeEntry<Element>>(
        () => [element, path],
        [element, path]
      );
      return (
        <Plate editor={editor}>
          <ElementProvider element={element} entry={entry} path={path}>
            {visible && <Child />}
          </ElementProvider>
        </Plate>
      );
    };
    const view = render(
      <React.StrictMode>
        <Wrapper />
      </React.StrictMode>
    );
    expect(view.getByTestId('selected').textContent).toBe('first');
    act(() => show(false));
    const detachedCalls = calls;
    act(() => change('second'));
    expect(calls).toBe(detachedCalls);
    act(() => show(true));
    expect(view.getByTestId('selected').textContent).toBe('second');
  });

  it('keeps matching provider scopes independent across editors', () => {
    const firstEditor = createEditor();
    const secondEditor = createEditor();
    let updateFirst!: React.Dispatch<React.SetStateAction<Element>>;
    const Child = () => (
      <span data-testid="scope-value">
        {useElementSelector((node) => node.type, { scope: 'shared' })}
      </span>
    );
    const Owner = ({
      editor,
      first,
    }: {
      editor: typeof firstEditor;
      first: boolean;
    }) => {
      const [element, update] = React.useState<Element>({
        type: first ? 'first' : 'second',
        children: [{ text: '' }],
      });
      if (first) updateFirst = update;
      const path = React.useMemo(() => [0], []);
      const entry = React.useMemo<NodeEntry<Element>>(
        () => [element, path],
        [element, path]
      );
      return (
        <Plate editor={editor}>
          <ElementProvider
            element={element}
            entry={entry}
            path={path}
            scope="shared"
          >
            <Child />
          </ElementProvider>
        </Plate>
      );
    };
    const view = render(
      <>
        <Owner editor={firstEditor} first />
        <Owner editor={secondEditor} first={false} />
      </>
    );
    const values = () =>
      view.getAllByTestId('scope-value').map((element) => element.textContent);
    expect(values()).toEqual(['first', 'second']);
    act(() => updateFirst((node) => ({ ...node, type: 'updated' })));
    expect(values()).toEqual(['updated', 'second']);
  });
});
