import type { BorderDirection, BorderStylesDefault } from '../lib/types';
import { useTableColSizes } from './useTableElement';
import {
  useOverrideColSize,
  useOverrideMarginLeft,
  useOverrideRowSize,
  useTableValue,
} from './useTableStore';
import { TableCellPlugin, TablePlugin } from './TablePlugin';
import {
  useEditor,
  useEditorPlugin,
  useEditorSelector,
  useElement,
  useElementSelector,
  useOptionalElement,
  usePath,
} from '@platejs/core/react';
import type { Element } from '@platejs/plite';
import {
  type ResizeEvent,
  type ResizeHandle,
  resizeLengthClampStatic,
} from '@platejs/resizable';
import { PLUGINS } from '@platejs/utils';
import type { TableCellElement, TableElement } from '../lib/BaseTablePlugin';
import React from 'react';

import { shouldUpdateCellIndices } from './internal/shouldUpdateCellIndices';

/**
 * Rounds a cell size to the nearest step, or returns the size if the step is
 * not set.
 */
export const roundCellSizeToStep = (size: number, step?: number) =>
  step ? Math.round(size / step) * step : size;

export const useIsCellSelected = (element: Element) =>
  useEditorSelector((editor) =>
    editor.plugin(TablePlugin).read.isCellSelected(editor.key(element))
  );

export function useTableCellBorders({
  element: el,
}: {
  element?: TableCellElement;
} = {}) {
  const editor = useEditor();
  const contextElement = useOptionalElement(TableCellPlugin);
  const element = el ?? contextElement;
  const cellIndices = useCellIndices(element ?? undefined);

  return React.useMemo(() => {
    if (!element) {
      throw new Error(
        'useTableCellBorders() requires a table-cell element provider or an explicit element.'
      );
    }

    return editor
      .plugin(TablePlugin)
      .read.getCellBorders({ cellIndices, element });
  }, [editor, element, cellIndices]);
}

export const useTableBordersDropdownMenuContentState = () => {
  const editor = useEditor();
  const borderStates = useEditorSelector((editor) =>
    editor.plugin(TablePlugin).read.getSelectedCellsBorders()
  );

  return {
    getOnSelectTableBorder:
      (border: BorderDirection | 'none' | 'outer') => () => {
        editor.plugin(TablePlugin).update.toggleBorders({ border });
      },
    hasBottomBorder: borderStates.bottom,
    hasLeftBorder: borderStates.left,
    hasNoBorders: borderStates.none,
    hasOuterBorders: borderStates.outer,
    hasRightBorder: borderStates.right,
    hasTopBorder: borderStates.top,
  };
};

export function useTableCellSize({
  element: el,
}: {
  element?: TableCellElement;
} = {}) {
  const editor = useEditor();

  const contextElement = useOptionalElement(TableCellPlugin);
  const element = el ?? contextElement;
  const colSizes = useTableColSizes();
  const cellIndices = useCellIndices(element ?? undefined);
  const rowSize = useElementSelector(
    ([node]) => (typeof node.size === 'number' ? node.size : undefined),
    {
      name: PLUGINS.tableRow,
    }
  );

  return React.useMemo(() => {
    if (!element) {
      throw new Error(
        'useTableCellSize() requires a table-cell element provider or an explicit element.'
      );
    }

    return editor.plugin(TablePlugin).read.getCellSize({
      cellIndices,
      colSizes,
      element,
      rowSize,
    });
  }, [cellIndices, colSizes, editor, element, rowSize]);
}

export type TableCellElementState = {
  borders: BorderStylesDefault;
  colIndex: number;
  colSpan: number;
  isSelectingCell: boolean;
  minHeight: number | undefined;
  rowIndex: number;
  selected: boolean;
  width: number | string;
};

export const useTableCellElement = (): TableCellElementState => {
  const editor = useEditor();
  const element = useElement(TableCellPlugin);
  const selectionState = useEditorSelector((editor) => {
    const table = editor.plugin(TablePlugin).read;

    return (
      (table.isCellSelected(editor.key(element)) ? 1 : 0) |
      (table.isSelectingCell() ? 2 : 0)
    );
  });
  const isCellSelected = (selectionState & 1) !== 0;
  const isSelectingCell = (selectionState & 2) !== 0;

  const rowSizeOverrides = useTableValue('rowSizeOverrides');
  const { minHeight, width } = useTableCellSize({ element });
  const borders = useTableCellBorders({ element });

  /**
   * Row size: if rowSpan > 1, we might look up the rowSize for the bottom row
   * or you can do something simpler if row-spanning is unusual in your app.
   */
  const { col, row } = useCellIndices();
  const table = editor.plugin(TablePlugin).api;
  const colSpan = table.getColSpan(element);
  const rowSpan = table.getRowSpan(element);
  const endingRowIndex = row + rowSpan - 1;
  const endingColIndex = col + colSpan - 1;

  return {
    borders,
    colIndex: endingColIndex,
    colSpan,
    isSelectingCell,
    minHeight: rowSizeOverrides.get?.(endingRowIndex) ?? minHeight,
    rowIndex: endingRowIndex,
    selected: isCellSelected,
    width,
  };
};

export type TableCellElementResizableOptions = {
  /** Resize by step instead of by pixel. */
  step?: number;
  /** Overrides for X and Y axes. */
  stepX?: number;
  stepY?: number;
} & Pick<TableCellElementState, 'colIndex' | 'colSpan' | 'rowIndex'>;

export const useTableCellElementResizable = ({
  colIndex,
  colSpan,
  rowIndex,
  step,
  stepX = step,
  stepY = step,
}: TableCellElementResizableOptions): {
  bottomProps: React.ComponentPropsWithoutRef<typeof ResizeHandle>;
  hiddenLeft: boolean;
  leftProps: React.ComponentPropsWithoutRef<typeof ResizeHandle>;
  rightProps: React.ComponentPropsWithoutRef<typeof ResizeHandle>;
} => {
  const editor = useEditor();
  const { store } = useEditorPlugin(TablePlugin);
  const tablePath = usePath(TablePlugin);
  const { disableMarginLeft, minColumnWidth = 0 } = store.get();

  const initialWidth = useElementSelector(
    ([node]) =>
      colSpan > 1 ? (node as TableElement).colSizes?.[colIndex] : undefined,
    { name: PLUGINS.table }
  );
  const marginLeft = useElementSelector(
    ([node]) => (node as TableElement).marginLeft ?? 0,
    { name: PLUGINS.table }
  );

  const colSizesWithoutOverrides = useTableColSizes({ disableOverrides: true });
  const colSizesWithoutOverridesRef = React.useRef(colSizesWithoutOverrides);
  React.useEffect(() => {
    colSizesWithoutOverridesRef.current = colSizesWithoutOverrides;
  }, [colSizesWithoutOverrides]);

  const overrideColSize = useOverrideColSize();
  const overrideRowSize = useOverrideRowSize();
  const overrideMarginLeft = useOverrideMarginLeft();

  const setColSize = React.useCallback(
    (colIndex: number, width: number) => {
      editor
        .plugin(TablePlugin)
        .update.setColumnSize({ colIndex, width }, { at: tablePath });

      // Prevent flickering
      setTimeout(() => overrideColSize(colIndex, null), 0);
    },
    [editor, overrideColSize, tablePath]
  );

  const setRowSize = React.useCallback(
    (rowIndex: number, height: number) => {
      editor
        .plugin(TablePlugin)
        .update.setRowSize({ height, rowIndex }, { at: tablePath });

      // Prevent flickering
      setTimeout(() => overrideRowSize(rowIndex, null), 0);
    },
    [editor, overrideRowSize, tablePath]
  );

  const setMarginLeft = React.useCallback(
    (marginLeft: number) => {
      editor.plugin(TablePlugin).update.set({ marginLeft }, { at: tablePath });

      // Prevent flickering
      setTimeout(() => overrideMarginLeft(null), 0);
    },
    [editor, overrideMarginLeft, tablePath]
  );

  const handleResizeRight = React.useCallback(
    ({ delta, finished, initialSize: currentInitial }: ResizeEvent) => {
      const nextInitial = colSizesWithoutOverridesRef.current[colIndex + 1];

      const complement = (width: number) =>
        currentInitial + nextInitial - width;

      const currentNew = roundCellSizeToStep(
        resizeLengthClampStatic(currentInitial + delta, {
          max: nextInitial ? complement(minColumnWidth) : undefined,
          min: minColumnWidth,
        }),
        stepX
      );

      const nextNew = nextInitial ? complement(currentNew) : undefined;

      const fn = finished ? setColSize : overrideColSize;
      fn(colIndex, currentNew);

      if (nextNew) fn(colIndex + 1, nextNew);
    },
    [colIndex, minColumnWidth, overrideColSize, setColSize, stepX]
  );

  const handleResizeBottom = React.useCallback(
    (event: ResizeEvent) => {
      const newHeight = roundCellSizeToStep(
        event.initialSize + event.delta,
        stepY
      );

      if (event.finished) {
        setRowSize(rowIndex, newHeight);
      } else {
        overrideRowSize(rowIndex, newHeight);
      }
    },
    [overrideRowSize, rowIndex, setRowSize, stepY]
  );

  const handleResizeLeft = React.useCallback(
    (event: ResizeEvent) => {
      const initial = colSizesWithoutOverridesRef.current[colIndex];

      const complement = (width: number) => initial + marginLeft - width;

      const newMargin = roundCellSizeToStep(
        resizeLengthClampStatic(marginLeft + event.delta, {
          max: complement(minColumnWidth),
          min: 0,
        }),
        stepX
      );

      const newWidth = complement(newMargin);

      if (event.finished) {
        setMarginLeft(newMargin);
        setColSize(colIndex, newWidth);
      } else {
        overrideMarginLeft(newMargin);
        overrideColSize(colIndex, newWidth);
      }
    },
    [
      colIndex,
      marginLeft,
      minColumnWidth,
      overrideColSize,
      overrideMarginLeft,
      setColSize,
      setMarginLeft,
      stepX,
    ]
  );

  const hasLeftHandle = colIndex === 0 && !disableMarginLeft;

  return {
    bottomProps: React.useMemo(
      () => ({
        options: {
          direction: 'bottom',
          onResize: handleResizeBottom,
        },
      }),
      [handleResizeBottom]
    ),
    hiddenLeft: !hasLeftHandle,
    leftProps: React.useMemo(
      () => ({
        options: {
          direction: 'left',
          onResize: handleResizeLeft,
        },
      }),
      [handleResizeLeft]
    ),
    rightProps: React.useMemo(
      () => ({
        options: {
          direction: 'right',
          initialSize: initialWidth,
          onResize: handleResizeRight,
        },
      }),
      [initialWidth, handleResizeRight]
    ),
  };
};

export const useCellIndices = (providedElement?: TableCellElement) => {
  const editor = useEditor();
  const contextElement = useOptionalElement(TableCellPlugin);
  const element = providedElement ?? contextElement ?? null;
  const cellIndices = useEditorSelector(
    (editor) =>
      element
        ? editor.plugin(TablePlugin).read.getCellIndices(element)
        : undefined,
    {
      equalityFn: (next, previous) =>
        next?.col === previous?.col && next?.row === previous?.row,
      shouldUpdate: shouldUpdateCellIndices,
    }
  );

  return React.useMemo(() => {
    if (!element) {
      throw new Error(
        'useCellIndices() requires a table-cell element provider or an explicit element.'
      );
    }

    return cellIndices ?? { col: 0, row: 0 };
  }, [cellIndices, editor, element]);
};
