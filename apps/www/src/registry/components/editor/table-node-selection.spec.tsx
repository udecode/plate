import { afterEach, expect, it, mock } from 'bun:test';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createEditor, EditorRoot } from 'platejs/react';
import * as React from 'react';

import { Editor } from './editor';

mock.module('@uploadthing/react', () => ({
  generateReactHelpers: () => ({ uploadFiles: mock() }),
}));

const { EditorKit } = await import('./plugins');

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
    plugins: EditorKit,
    initialValue: [table('first'), table('second')],
  });
  const view = render(
    <EditorRoot editor={editor}>
      <Editor />
    </EditorRoot>
  );
  const selectedCells = () =>
    [
      ...view.container.querySelectorAll('td[data-table-cell-selected="true"]'),
    ].map((cell) => cell.textContent);

  return { editor, selectedCells, view };
};

it('paints a selected row and a selected table without leaking into neighboring rows or tables', async () => {
  const { editor, selectedCells } = mount();

  await act(() => editor.update.selection.setNodes([[0, 1]]));
  expect(selectedCells()).toEqual(['first-1-0', 'first-1-1']);

  await act(() => editor.update.selection.setNodes([[1]]));
  expect(selectedCells()).toEqual([
    'second-0-0',
    'second-0-1',
    'second-1-0',
    'second-1-1',
    'second-2-0',
    'second-2-1',
  ]);

  await act(() => editor.update.selection.setNodes([]));
  expect(selectedCells()).toEqual([]);
});

it('leaves a cell-range highlight with the table selection owner', async () => {
  const { editor, selectedCells, view } = mount();

  await act(() =>
    editor.update.selection.setNodes([
      [0, 0, 0],
      [0, 0, 1],
    ])
  );
  expect(selectedCells()).toEqual(['first-0-0', 'first-0-1']);
  expect(
    view.container.querySelectorAll('[data-table-cell-selected="true"]').length
  ).toBe(2);

  await act(() =>
    editor.update.selection.set({
      anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0, 0], offset: 0 },
    })
  );
  expect(selectedCells()).toEqual([]);
  expect(
    view.container.querySelectorAll('[data-table-cell-selected="true"]').length
  ).toBe(0);
});

it('paints a row selected from the mounted editor view', async () => {
  const { selectedCells, view } = mount();
  const rowControls = view.getAllByRole('button', {
    name: 'Select or move row',
  });

  await act(async () => {
    fireEvent.click(rowControls[1]!);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
  });

  expect(selectedCells()).toEqual(['first-1-0', 'first-1-1']);
});
