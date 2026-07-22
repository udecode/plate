import { renderHook } from '@testing-library/react';
import type { BaseEditor } from '@platejs/core';
import * as plateReact from '@platejs/core/react';
import type { TTableCellElement } from '@platejs/utils';

const useCellIndicesMock = mock();
const useTableColSizesMock = mock();

mock.module('../../hooks/useCellIndices', () => ({
  useCellIndices: useCellIndicesMock,
}));

mock.module('../TableElement', () => ({
  useTableColSizes: useTableColSizesMock,
}));

mock.module('../../TablePlugin', () => ({
  TablePlugin: { key: 'table' },
}));

describe('useTableCellSize', () => {
  afterEach(() => {
    mock.restore();
  });

  it('uses an explicit cell when no element provider is mounted', async () => {
    const element: TTableCellElement = {
      children: [{ text: '' }],
      id: 'cell-1',
      type: 'td',
    };
    const getCellSize = mock(() => ({ minHeight: 24, width: 120 }));

    spyOn(plateReact, 'useEditorPlugin').mockReturnValue({
      editor: {
        api: { table: { getCellSize } },
      } as unknown as BaseEditor,
    } as ReturnType<typeof plateReact.useEditorPlugin>);
    spyOn(plateReact, 'useOptionalElement').mockReturnValue(null);
    spyOn(plateReact, 'useElementSelector').mockReturnValue(undefined);
    useCellIndicesMock.mockReturnValue({ col: 0, row: 0 });
    useTableColSizesMock.mockReturnValue([120]);

    const { useTableCellSize } = await import(
      `./useTableCellSize?test=${Math.random().toString(36).slice(2)}`
    );
    const { result } = renderHook(() => useTableCellSize({ element }));

    expect(useCellIndicesMock).toHaveBeenCalledWith(element);
    expect(getCellSize).toHaveBeenCalledWith({
      cellIndices: { col: 0, row: 0 },
      colSizes: [120],
      element,
      rowSize: undefined,
    });
    expect(result.current).toEqual({ minHeight: 24, width: 120 });
  });
});
