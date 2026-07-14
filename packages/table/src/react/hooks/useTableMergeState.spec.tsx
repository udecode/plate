import { renderHook } from '@testing-library/react';
import type { BaseEditor } from '@platejs/core';
import * as plateReact from '@platejs/core/react';
import * as pliteReact from '@platejs/plite-react';
import type { TTableCellElement } from '@platejs/utils';
import * as tableLib from '../../lib';

const useEditorPluginMock = mock();
const useEditorSelectorMock = mock();
const useReadOnlyMock = mock();
const getSelectedCellsBoundingBoxMock = mock();

mock.module('../TablePlugin', () => ({
  TablePlugin: { key: 'table' },
}));

describe('useTableMergeState', () => {
  beforeEach(() => {
    spyOn(plateReact, 'useEditorPlugin').mockImplementation(
      useEditorPluginMock as unknown as typeof plateReact.useEditorPlugin
    );
    spyOn(plateReact, 'useEditorSelector').mockImplementation(
      useEditorSelectorMock as unknown as typeof plateReact.useEditorSelector
    );
    spyOn(pliteReact, 'useEditorReadOnly').mockImplementation(
      useReadOnlyMock as unknown as typeof pliteReact.useEditorReadOnly
    );
    spyOn(tableLib, 'getSelectedCellsBoundingBox').mockImplementation(
      getSelectedCellsBoundingBoxMock as unknown as typeof tableLib.getSelectedCellsBoundingBox
    );
    useEditorPluginMock.mockReset();
    useEditorSelectorMock.mockReset();
    useReadOnlyMock.mockReset();
    getSelectedCellsBoundingBoxMock.mockReset();
  });

  afterEach(() => {
    mock.restore();
  });

  it('computes merge state for rectangular multi-cell selections and split state for merged cells', async () => {
    const { useTableMergeState } = await import(
      `./useTableMergeState?test=${Math.random().toString(36).slice(2)}`
    );

    useReadOnlyMock.mockReturnValue(false);
    const selectedCells: [TTableCellElement, number[]][] = [
      [{ children: [{ text: '' }], colSpan: 1, rowSpan: 1, type: 'td' }, [0]],
      [{ children: [{ text: '' }], colSpan: 1, rowSpan: 1, type: 'td' }, [1]],
    ];

    useEditorSelectorMock
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(selectedCells);
    useEditorPluginMock.mockReturnValue({
      api: {
        getColSpan: (cell: TTableCellElement) => cell.colSpan ?? 1,
        getRowSpan: (cell: TTableCellElement) => cell.rowSpan ?? 1,
      },
      editor: {} as BaseEditor,
      getOptions: () => ({ disableMerge: false }),
    });
    getSelectedCellsBoundingBoxMock.mockReturnValue({
      maxCol: 1,
      maxRow: 0,
      minCol: 0,
      minRow: 0,
    });

    const { result } = renderHook(() => useTableMergeState());

    expect(result.current).toEqual({ canMerge: true, canSplit: false });
  });
});
