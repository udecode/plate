import { renderHook } from '@testing-library/react';
import { createPlateEditor, Plate } from '@platejs/core/react';
import { ElementProvider } from '@platejs/core/react/internal';
import {
  KEYS,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
} from '@platejs/utils';
import React from 'react';

import { TablePlugin } from './TablePlugin';
import { useTableCellSize } from './useTableCellElement';
import { TableProvider } from './useTableStore';

describe('useTableCellSize', () => {
  it('uses an explicit cell instead of an ancestor element provider', () => {
    const element: TTableCellElement = {
      children: [{ text: '' }],
      id: 'cell-1',
      type: 'td',
    };
    const row: TTableRowElement = {
      children: [element],
      size: 24,
      type: 'tr',
    };
    const table: TTableElement = {
      children: [row],
      colSizes: [120],
      type: 'table',
    };
    const editor = createPlateEditor({
      initialValue: [table],
      nodeId: true,
      plugins: [TablePlugin],
    });
    const installedTable = editor.read.nodes.get<TTableElement>([0])![0];
    const installedRow = editor.read.nodes.get<TTableRowElement>([0, 0])![0];
    const installedElement = editor.read.nodes.get<TTableCellElement>([
      0, 0, 0,
    ])![0];
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor} suppressInstanceWarning>
        <TableProvider>
          <ElementProvider
            element={installedTable}
            entry={[installedTable, [0]]}
            path={[0]}
            scope={KEYS.table}
          >
            <ElementProvider
              element={installedRow}
              entry={[installedRow, [0, 0]]}
              path={[0, 0]}
              scope={KEYS.tr}
            >
              {children}
            </ElementProvider>
          </ElementProvider>
        </TableProvider>
      </Plate>
    );
    const { result } = renderHook(
      () => useTableCellSize({ element: installedElement }),
      { wrapper }
    );

    expect(result.current).toEqual({ minHeight: 24, width: 120 });
  });
});
