import { afterEach, expect, it } from 'bun:test';

import { act, cleanup, render } from '@testing-library/react';
import { createEditor, Plate, PlateContent } from 'platejs/react';
import * as React from 'react';

import { BasicBlocksKit } from './basic-blocks';
import { DndKit } from './dnd';
import { TableKit } from './table';

afterEach(cleanup);

const table = (label: string) => ({
  type: 'table',
  columnWidths: [100, 100],
  children: Array.from({ length: 3 }, (_, row) => ({
    type: 'tableRow',
    children: Array.from({ length: 2 }, (_cell, col) => ({
      type: 'tableCell',
      children: [
        { type: 'paragraph', children: [{ text: `${label}-${row}-${col}` }] },
      ],
    })),
  })),
});

const mount = () => {
  const editor = createEditor({
    plugins: [...BasicBlocksKit, ...DndKit, ...TableKit],
    initialValue: [table('first'), table('second')],
  });
  const view = render(
    <Plate editor={editor}>
      <PlateContent />
    </Plate>
  );
  const highlightedCells = () =>
    [...view.container.querySelectorAll('td[data-plite-node="element"]')]
      .filter((cell) =>
        cell.querySelector(':scope > [data-slot="node-selection-highlight"]')
      )
      .map((cell) => cell.textContent);

  return { editor, highlightedCells, view };
};

it('paints a selected row and a selected table without leaking into neighboring rows or tables', async () => {
  const { editor, highlightedCells } = mount();

  await act(() => editor.update.selection.setNodes([[0, 1]]));
  expect(highlightedCells()).toEqual(['first-1-0', 'first-1-1']);

  await act(() => editor.update.selection.setNodes([[1]]));
  expect(highlightedCells()).toEqual([
    'second-0-0',
    'second-0-1',
    'second-1-0',
    'second-1-1',
    'second-2-0',
    'second-2-1',
  ]);

  await act(() => editor.update.selection.setNodes([]));
  expect(highlightedCells()).toEqual([]);
});

it('leaves a cell-range highlight with the table selection owner', async () => {
  const { editor, highlightedCells, view } = mount();

  await act(() =>
    editor.update.selection.setNodes([
      [0, 0, 0],
      [0, 0, 1],
    ])
  );
  expect(highlightedCells()).toEqual([]);
  expect(
    view.container.querySelectorAll('[data-table-cell-selected="true"]').length
  ).toBe(2);

  await act(() =>
    editor.update.selection.set({
      anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0, 0], offset: 0 },
    })
  );
  expect(highlightedCells()).toEqual([]);
  expect(
    view.container.querySelectorAll('[data-table-cell-selected="true"]').length
  ).toBe(0);
});
