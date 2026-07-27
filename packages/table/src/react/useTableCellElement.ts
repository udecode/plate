import type {
  BorderDirection,
  BorderStylesDefault,
  TableBorderStates,
} from '../lib/types';
import { useTableColSizes } from './useTableElement';
import {
  useOverrideColSize,
  useOverrideMarginLeft,
  useOverrideRowSize,
  useTableValue,
} from './useTableStore';
import { TablePlugin } from './TablePlugin';
import {
  useEditorPlugin,
  useEditorSelector,
  useElement,
  useElementSelector,
  useOptionalElement,
} from '@platejs/core/react';
import type { Element, NodeEntry } from '@platejs/plite';
import {
  type ResizeEvent,
  type ResizeHandle,
  resizeLengthClampStatic,
} from '@platejs/resizable';
import {
  KEYS,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
} from '@platejs/utils';
import React from 'react';

/**
 * Rounds a cell size to the nearest step, or returns the size if the step is
 * not set.
 */
export const roundCellSizeToStep = (size: number, step?: number) =>
  step ? Math.round(size / step) * step : size;

export const useIsCellSelected = (element: Element) => {
  const { editor } = useEditorPlugin(TablePlugin);

  return useEditorSelector<boolean, typeof editor>((editor) =>
    editor
      .plugin(TablePlugin)
      .read.isCellSelected(element.id as string | null | undefined)
  );
};

export function useTableCellBorders({
  element: el,
}: {
  element?: TTableCellElement;
} = {}) {
  const { editor } = useEditorPlugin(TablePlugin);
  const element = useElement<TTableCellElement>() ?? el;
  const cellIndices = useCellIndices();

  return React.useMemo(
    () =>
      editor.plugin(TablePlugin).read.getCellBorders({ cellIndices, element }),
    [editor, element, cellIndices]
  );
}

export const useTableBordersDropdownMenuContentState = () => {
  const { editor } = useEditorPlugin(TablePlugin);
  const borderStates = useEditorSelector<TableBorderStates>((editor) =>
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
  element?: TTableCellElement;
} = {}) {
  const { editor } = useEditorPlugin(TablePlugin);

  const contextElement = useOptionalElement<TTableCellElement>();
  const element = el ?? contextElement;
  const colSizes = useTableColSizes();
  const cellIndices = useCellIndices(element ?? undefined);
  const rowSize = useElementSelector(
    ([node]: NodeEntry<TTableRowElement>) => node.size,
    {
      key: KEYS.tr,
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
  const { editor } = useEditorPlugin(TablePlugin);
  const element = useElement<TTableCellElement>();
  const selectionState = useEditorSelector<number, typeof editor>((editor) => {
    const table = editor.plugin(TablePlugin).read;

    return (
      (table.isCellSelected(element.id) ? 1 : 0) |
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
  const { editor, store } = useEditorPlugin(TablePlugin);
  const element = useElement();
  const { disableMarginLeft, minColumnWidth = 0 } = store.get();

  const initialWidth = useElementSelector(
    ([node]) =>
      colSpan > 1 ? (node as TTableElement).colSizes?.[colIndex] : undefined,
    { key: KEYS.table }
  );
  const marginLeft = useElementSelector(
    ([node]) => (node as TTableElement).marginLeft ?? 0,
    { key: KEYS.table }
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
        .update.setColumnSize({ colIndex, width }, { at: element });

      // Prevent flickering
      setTimeout(() => overrideColSize(colIndex, null), 0);
    },
    [editor, element, overrideColSize]
  );

  const setRowSize = React.useCallback(
    (rowIndex: number, height: number) => {
      editor
        .plugin(TablePlugin)
        .update.setRowSize({ height, rowIndex }, { at: element });

      // Prevent flickering
      setTimeout(() => overrideRowSize(rowIndex, null), 0);
    },
    [editor, element, overrideRowSize]
  );

  const setMarginLeft = React.useCallback(
    (marginLeft: number) => {
      editor
        .plugin(TablePlugin)
        .update.setMarginLeft({ marginLeft }, { at: element });

      // Prevent flickering
      setTimeout(() => overrideMarginLeft(null), 0);
    },
    [editor, element, overrideMarginLeft]
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

export const useCellIndices = (providedElement?: TTableCellElement) => {
  const { editor } = useEditorPlugin(TablePlugin);
  const contextElement = useOptionalElement<TTableCellElement>();
  const element = providedElement ?? contextElement ?? null;
  const cellIndices = useEditorSelector(
    (editor) =>
      element
        ? editor.plugin(TablePlugin).read.getCellIndices(element)
        : undefined,
    {
      equalityFn: (next, previous) =>
        next?.col === previous?.col && next?.row === previous?.row,
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
