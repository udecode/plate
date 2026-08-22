import type { Element, NodeEntry } from '@platejs/plite';
import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createPlateEditor } from '../../editor';
import { useElementSelector } from './useElementSelector';
import { ElementProvider } from './useElementStore';

describe('useElementSelector', () => {
  it('prefers the nearest matching scoped provider and otherwise falls back to the nearest provider', () => {
    const editor = createPlateEditor();

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const nameEntry = React.useMemo(
        () =>
          [
            {
              children: [{ text: 'name' }],
              label: 'outer',
              type: 'name',
            },
            [0],
          ] as any,
        []
      );
      const ageEntry = React.useMemo(
        () =>
          [
            {
              children: [{ text: 'age' }],
              label: 'inner',
              type: 'age',
            },
            [0, 0],
          ] as any,
        []
      );

      return (
        <Plate editor={editor}>
          <ElementProvider
            element={nameEntry[0]}
            entry={nameEntry}
            path={nameEntry[1]}
            scope="name"
          >
            <ElementProvider
              element={ageEntry[0]}
              entry={ageEntry}
              path={ageEntry[1]}
              scope="age"
            >
              {children}
            </ElementProvider>
          </ElementProvider>
        </Plate>
      );
    };

    const exactScope = renderHook(
      () =>
        useElementSelector(([element]) => element.type, {
          scope: 'name',
        }),
      { wrapper: Wrapper }
    );

    expect(exactScope.result.current).toBe('name');

    const fallbackScope = renderHook(
      () =>
        useElementSelector(([element]) => element.type, {
          scope: 'missing',
        }),
      { wrapper: Wrapper }
    );

    expect(fallbackScope.result.current).toBe('age');
  });

  it('skips rerenders when equalityFn treats the derived value as unchanged', () => {
    const editor = createPlateEditor();
    const renderValues: number[] = [];
    let setEntry: React.Dispatch<React.SetStateAction<NodeEntry<Element>>>;

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const [entry, updateEntry] = React.useState<NodeEntry<Element>>([
        {
          children: [{ text: 'one' }],
          tone: 'red',
          type: 'paragraph',
        },
        [0],
      ]);

      setEntry = updateEntry;

      return (
        <Plate editor={editor}>
          <ElementProvider
            element={entry[0]}
            entry={entry}
            path={entry[1]}
            scope="element"
          >
            {children}
          </ElementProvider>
        </Plate>
      );
    };

    const { result } = renderHook(
      () => {
        const value = useElementSelector(
          ([element]) => element.children.length,
          { equalityFn: (a, b) => a === b, scope: 'element' }
        );

        renderValues.push(value);

        return value;
      },
      { wrapper: Wrapper }
    );

    expect(result.current).toBe(1);
    const initialRenderCount = renderValues.length;

    act(() => {
      setEntry?.(([element, path]) => [{ ...element, tone: 'blue' }, path]);
    });

    expect(result.current).toBe(1);
    expect(renderValues).toHaveLength(initialRenderCount);

    act(() => {
      setEntry?.(([element, path]) => [
        {
          ...element,
          children: [...element.children, { text: 'two' }],
        },
        path,
      ]);
    });

    expect(result.current).toBe(2);
    expect(renderValues).toHaveLength(initialRenderCount + 1);
  });

  it('uses the latest inline selector closure', () => {
    const editor = createPlateEditor();
    const entry = [
      {
        children: [{ text: 'one' }],
        type: 'paragraph',
      },
      [0],
    ] as any;
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>
        <ElementProvider
          element={entry[0]}
          entry={entry}
          path={entry[1]}
          scope="element"
        >
          {children}
        </ElementProvider>
      </Plate>
    );

    const { rerender, result } = renderHook(
      ({ suffix }) =>
        useElementSelector(([element]) => `${element.type}-${suffix}`, {
          scope: 'element',
        }),
      { initialProps: { suffix: 'one' }, wrapper: Wrapper }
    );

    expect(result.current).toBe('paragraph-one');

    rerender({ suffix: 'two' });

    expect(result.current).toBe('paragraph-two');
  });
});
