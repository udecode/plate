import React from 'react';

import { act, renderHook } from '@testing-library/react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createPlateEditor } from '../../editor';
import { ElementProvider } from './useElementStore';
import { useElementSelector } from './useElementSelector';

describe('useElementSelector', () => {
  it('prefers the nearest matching scoped provider and otherwise falls back to the nearest provider', () => {
    const editor = createPlateEditor();

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const nameEntry = React.useMemo(
        () =>
          [
            {
              children: [{ text: 'name' }],
              label: 'outer',
              type: 'name',
            },
            [0],
          ] as const,
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
          ] as const,
        []
      );

      return (
        <Plate editor={editor}>
          <ElementProvider
            element={nameEntry[0]}
            entry={nameEntry as any}
            path={nameEntry[1]}
            scope="name"
          >
            <ElementProvider
              element={ageEntry[0]}
              entry={ageEntry as any}
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
        useElementSelector(([element]) => element.type, [], {
          key: 'name',
        }),
      { wrapper }
    );

    expect(exactScope.result.current).toBe('name');

    const fallbackScope = renderHook(
      () =>
        useElementSelector(([element]) => element.type, [], {
          key: 'missing',
        }),
      { wrapper }
    );

    expect(fallbackScope.result.current).toBe('age');
  });

  it('skips rerenders when equalityFn treats the derived value as unchanged', () => {
    const editor = createPlateEditor();
    const renderValues: number[] = [];
    let setEntry: React.Dispatch<React.SetStateAction<any>>;

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const [entry, updateEntry] = React.useState<any>([
        {
          children: [{ text: 'one' }],
          tone: 'red',
          type: 'p',
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
          [],
          { equalityFn: (a, b) => a === b, key: 'element' }
        );

        renderValues.push(value);

        return value;
      },
      { wrapper }
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
});
