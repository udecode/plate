import { renderHook } from '@testing-library/react';
import * as platejsReact from 'platejs/react';
import * as tableLib from '../../lib';

const useEditorPluginMock = mock();
const useEditorSelectorMock = mock();
const useReadOnlyMock = mock();
const getSelectedCellEntriesMock = mock();
const getSelectedCellsBoundingBoxMock = mock();

mock.module('../TablePlugin', () => ({
  TablePlugin: { key: 'table' },
}));

describe('useTableMergeState', () => {
  beforeEach(() => {
    spyOn(platejsReact, 'useEditorPlugin').mockImplementation(
      useEditorPluginMock as any
    );
    spyOn(platejsReact, 'useEditorSelector').mockImplementation(
      useEditorSelectorMock as any
    );
    spyOn(platejsReact, 'useReadOnly').mockImplementation(
      useReadOnlyMock as any
    );
    spyOn(tableLib, 'getSelectedCellEntries').mockImplementation(
      getSelectedCellEntriesMock as any
    );
    spyOn(tableLib, 'getSelectedCellsBoundingBox').mockImplementation(
      getSelectedCellsBoundingBoxMock as any
    );
    useEditorPluginMock.mockReset();
    useEditorSelectorMock.mockReset();
    useReadOnlyMock.mockReset();
    getSelectedCellEntriesMock.mockReset();
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
    useEditorSelectorMock
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce([
        [{ colSpan: 1, rowSpan: 1 }, [0]],
        [{ colSpan: 1, rowSpan: 1 }, [1]],
      ]);
    useEditorPluginMock.mockReturnValue({
      api: {
        table: {
          getColSpan: (cell: any) => cell.colSpan,
          getRowSpan: (cell: any) => cell.rowSpan,
        },
      },
      editor: {},
      getOptions: () => ({ disableMerge: false }),
    });
    getSelectedCellEntriesMock.mockReturnValue([
      [{ colSpan: 1, rowSpan: 1 }, [0]],
      [{ colSpan: 1, rowSpan: 1 }, [1]],
    ]);
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
