import { describe, expect, it, mock } from 'bun:test';

import { act, render } from '@testing-library/react';
import React from 'react';

import { TestPlate as Plate } from '../../react/__tests__/TestPlate';
import { createEditor } from '../../react/editor';
import { ElementProvider } from '../../react/stores/element/useElementStore';
import { DndStorePlugin } from './internal/DndStorePlugin';
import { useDropLine } from './useDndNode';

describe('useDropLine', () => {
  it('renders only the old and new drop lines and filters by orientation', () => {
    const editor = createEditor({
      plugins: [DndStorePlugin],
      initialValue: Array.from({ length: 100 }, () => ({
        type: 'paragraph',
        children: [{ text: 'Block' }],
      })),
    });
    const elements = editor.read.children();
    const counts = elements.map(() => 0);
    const { store } = editor.plugin(DndStorePlugin);
    const onRender = mock((index: number) => {
      counts[index] += 1;
    });

    function DropLine({ index }: { index: number }) {
      const { dropLine } = useDropLine();

      onRender(index);

      return <span data-testid={`line-${index}`}>{dropLine}</span>;
    }

    const view = render(
      <Plate editor={editor}>
        {elements.map((element, index) => (
          <ElementProvider
            key={editor.key(element)}
            element={element}
            entry={[element, [index]]}
            path={[index]}
          >
            <DropLine index={index} />
          </ElementProvider>
        ))}
      </Plate>
    );

    act(() =>
      store.set({
        dropTarget: { key: editor.key(elements[0]), line: 'top' },
      })
    );
    counts.fill(0);
    act(() =>
      store.set({
        dropTarget: { key: editor.key(elements[1]), line: 'bottom' },
      })
    );
    expect(counts).toEqual([1, 1, ...new Array(98).fill(0)]);
    expect(view.getByTestId('line-0').textContent).toBe('');
    expect(view.getByTestId('line-1').textContent).toBe('bottom');

    counts.fill(0);
    act(() => store.set({ _isOver: true }));
    act(() =>
      store.set({
        dropTarget: { key: editor.key(elements[1]), line: 'bottom' },
      })
    );
    expect(counts.every((count) => count === 0)).toBe(true);

    act(() =>
      store.set({
        dropTarget: { key: editor.key(elements[1]), line: 'left' },
      })
    );
    expect(view.getByTestId('line-1').textContent).toBe('');
    counts.fill(0);
    act(() =>
      store.set({
        dropTarget: { key: editor.key(elements[2]), line: 'right' },
      })
    );
    expect(counts.every((count) => count === 0)).toBe(true);
    view.unmount();
  });
});
