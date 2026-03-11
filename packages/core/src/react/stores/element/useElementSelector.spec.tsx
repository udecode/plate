import React from 'react';

import { act, renderHook } from '@testing-library/react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createPlateEditor } from '../../editor';
import { ElementProvider } from './useElementStore';
import { useElementSelector } from './useElementSelector';

describe('useElementSelector', () => {
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
