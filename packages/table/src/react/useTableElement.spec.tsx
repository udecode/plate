/** @jsx jsxt */

import assert from 'node:assert/strict';
import React from 'react';

import { act, renderHook, waitFor } from '@testing-library/react';
import { Plate } from '@platejs/core/react';
import { ElementProvider } from '@platejs/core/react/internal';
import { jsxt, type TestEditor } from '@platejs/test-utils';
import { PLUGINS } from '@platejs/utils';

import { BaseTablePlugin, type TableElement } from '../lib/BaseTablePlugin';
import { createTestTableEditor } from '../lib/__tests__/getTestTablePlugins';
import { TablePlugin } from './TablePlugin';
import { useTableColSizes, useTableSelectionDom } from './useTableElement';
import { TableProvider } from './useTableStore';

jsxt;

describe('useTableElement family', () => {
  it('keeps column sizes while a block insertion shifts the table path', () => {
    const table: TableElement = {
      children: [
        {
          children: [
            {
              children: [{ children: [{ text: '' }], type: 'paragraph' }],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
      ],
      colSizes: [120],
      type: 'table',
    };
    const editor = createTestTableEditor({
      initialValue: [
        { children: [{ text: 'before' }], type: 'paragraph' },
        table,
      ],
      plugins: [TablePlugin],
    });
    const installedTable = editor.read.nodes.get([1], {
      type: BaseTablePlugin,
    })![0];
    const PlateWithChildren = Plate as React.ComponentType<
      Omit<React.ComponentProps<typeof Plate>, 'children'>
    >;
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        PlateWithChildren,
        { editor, suppressInstanceWarning: true },
        React.createElement(
          TableProvider,
          null,
          React.createElement(
            ElementProvider,
            {
              element: installedTable,
              entry: [installedTable, [1]],
              path: [1],
              scope: PLUGINS.table,
            },
            children
          )
        )
      );
    const { result } = renderHook(() => useTableColSizes(), { wrapper });

    expect(result.current).toEqual([120]);

    expect(() => {
      act(() => {
        editor.update.nodes.insert(
          { children: [{ text: 'inserted' }], type: 'paragraph' },
          { at: [1] }
        );
      });
    }).not.toThrow();
    expect(result.current).toEqual([120]);
  });

  it('updates only cells entering or leaving the selected set', async () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="c1">
              <hp>
                <anchor />
                one
              </hp>
            </htd>
            <htd id="c2">
              <hp>
                two
                <focus />
              </hp>
            </htd>
            <htd id="c3">
              <hp>three</hp>
            </htd>
            <htd id="c4">
              <hp>four</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const editor = createTestTableEditor({
      plugins: [TablePlugin],
      selection: input.selection,
      initialValue: input.children,
    });
    const table = document.createElement('table');
    const cellKeys = {
      c1: editor.key([0, 0, 0])!,
      c2: editor.key([0, 0, 1])!,
      c3: editor.key([0, 0, 2])!,
      c4: editor.key([0, 0, 3])!,
    };

    table.innerHTML = `
      <tbody>
        <tr>
          <td data-table-cell-key="${cellKeys.c1}"></td>
          <td data-table-cell-key="${cellKeys.c2}"></td>
          <td data-table-cell-key="${cellKeys.c3}"></td>
          <td data-table-cell-key="${cellKeys.c4}"></td>
        </tr>
      </tbody>
    `;
    document.body.append(table);

    const cells = Object.fromEntries(
      Object.entries(cellKeys).map(([name, id]) => {
        const cell = table.querySelector<HTMLElement>(
          `[data-table-cell-key="${id}"]`
        );

        assert(cell);

        return [name, cell];
      })
    ) as Record<'c1' | 'c2' | 'c3' | 'c4', HTMLElement>;
    const querySelectorAll = spyOn(table, 'querySelectorAll');
    const tableRef = { current: table };
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Plate, {
        children,
        editor,
        suppressInstanceWarning: true,
      });
    const { unmount } = renderHook(() => useTableSelectionDom(tableRef), {
      wrapper,
    });

    expect(cells.c1.getAttribute('data-table-cell-selected')).toBe('true');
    expect(cells.c2.getAttribute('data-table-cell-selected')).toBe('true');
    expect(cells.c3.hasAttribute('data-table-cell-selected')).toBe(false);
    expect(cells.c4.hasAttribute('data-table-cell-selected')).toBe(false);
    expect(cells.c1.style.caretColor).toBe('transparent');
    expect(cells.c2.style.caretColor).toBe('');
    expect(querySelectorAll).toHaveBeenCalledTimes(1);

    const c1Remove = spyOn(cells.c1, 'removeAttribute');
    const c2Remove = spyOn(cells.c2, 'removeAttribute');
    const c2Set = spyOn(cells.c2, 'setAttribute');
    const c3Set = spyOn(cells.c3, 'setAttribute');
    const c4Remove = spyOn(cells.c4, 'removeAttribute');
    const c4Set = spyOn(cells.c4, 'setAttribute');
    const anchor = editor.read.points.start([0, 0, 1]);
    const focus = editor.read.points.end([0, 0, 2]);

    assert(anchor);
    assert(focus);

    const selection = editor
      .plugin(TablePlugin)
      .read.createCellSelection({ anchor, focus });

    assert(selection);

    act(() => {
      editor.update.selection.set(selection);
    });

    await waitFor(() => {
      expect(cells.c1.hasAttribute('data-table-cell-selected')).toBe(false);
      expect(cells.c2.getAttribute('data-table-cell-selected')).toBe('true');
      expect(cells.c3.getAttribute('data-table-cell-selected')).toBe('true');
    });

    expect(c1Remove).toHaveBeenCalledWith('data-table-cell-selected');
    expect(c2Remove).not.toHaveBeenCalled();
    expect(c2Set).not.toHaveBeenCalledWith('data-table-cell-selected', 'true');
    expect(c3Set).toHaveBeenCalledWith('data-table-cell-selected', 'true');
    expect(c4Remove).not.toHaveBeenCalled();
    expect(c4Set).not.toHaveBeenCalled();
    expect(querySelectorAll).toHaveBeenCalledTimes(1);

    const backwardSelection = editor
      .plugin(TablePlugin)
      .read.createCellSelection({ anchor: focus, focus: anchor });

    assert(backwardSelection);

    act(() => {
      editor.update.selection.set(backwardSelection);
    });

    await waitFor(() => {
      expect(cells.c2.getAttribute('data-table-cell-selected')).toBe('true');
      expect(cells.c3.getAttribute('data-table-cell-selected')).toBe('true');
      expect(cells.c2.style.caretColor).toBe('');
      expect(cells.c3.style.caretColor).toBe('transparent');
    });

    unmount();
    expect(cells.c3.style.caretColor).toBe('');
    table.remove();
  });
});
