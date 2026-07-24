import type {
  BorderDirection,
  BorderStylesDefault,
  SetBorderSizeOptions,
  TableBorderStates,
} from '../lib/types';
import { BaseTablePlugin } from '../lib/BaseTablePlugin';
import { useTableColSizes } from './useTableElement';
import {
  useOverrideColSize,
  useOverrideMarginLeft,
  useOverrideRowSize,
  useTableValue,
} from './useTableStore';
import { TablePlugin } from './TablePlugin';
import type { BaseEditor } from '@platejs/core';
import {
  useEditorPlugin,
  useEditorSelector,
  useElement,
  useElementSelector,
  useOptionalElement,
  usePluginOption,
} from '@platejs/core/react';
import type { Element, NodeEntry, Path, Value } from '@platejs/plite';
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
      .api.isCellSelected(element.id as string | null | undefined)
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
      editor.plugin(TablePlugin).api.getCellBorders({ cellIndices, element }),
    [editor, element, cellIndices]
  );
}

/** Helper: sets one cell's specific border(s) to `size`. */
function setCellBorderSize(
  updates: SetBorderSizeOptions[],
  at: Path | null,
  directions: BorderDirection[] | 'all',
  size: number
) {
  if (!at) return;
  if (directions === 'all') {
    updates.push({ at, border: 'all', size });
  } else {
    for (const dir of directions) {
      updates.push({ at, border: dir, size });
    }
  }
}

/**
 * Toggle logic for `'none'`, `'outer'`, `'top'|'bottom'|'left'|'right'`.
 * `'none'` toggles no borders ↔ all borders, `'outer'` toggles the bounding
 * rectangle's outer edges on/off, `'top'|'bottom'|'left'|'right'` toggles only
 * that side of the bounding rect.
 */
export function setSelectedCellsBorder<V extends Value>(
  editor: BaseEditor<V, any>,
  {
    border,
    cells,
  }: {
    border: BorderDirection | 'none' | 'outer';
    cells: TTableCellElement[];
  }
) {
  if (cells.length === 0) return;
  const table = editor.plugin(BaseTablePlugin);
  const targets = cells.map((cell) => {
    const path = editor.read.nodes.path(cell) ?? null;
    const { col, row } = table.api.getCellIndices(cell);

    return {
      cSpan: table.api.getColSpan(cell),
      col,
      leftCellPath: path
        ? (table.api.getLeftCell({ at: path })?.[1] ?? null)
        : null,
      path,
      rSpan: table.api.getRowSpan(cell),
      row,
      topCellPath: path
        ? (table.api.getTopCell({ at: path })?.[1] ?? null)
        : null,
    };
  });
  const updates: SetBorderSizeOptions[] = [];
  const applyUpdates = () => table.update.setBorderSizes(updates);

  // 1) none => toggle all edges vs none
  if (border === 'none') {
    const { none: allNone } = table.api.getSelectedCellsBorders(cells);
    const newSize = allNone ? 1 : 0;

    for (const target of targets) {
      if (!target.path) continue;

      const edges: BorderDirection[] = [];

      // For first row or first column cells, we set their top/left borders
      if (target.row === 0) edges.push('top');
      if (target.col === 0) edges.push('left');

      // Always set bottom and right borders
      edges.push('bottom', 'right');

      // For non-first row/column cells, set borders on adjacent cells
      if (target.row > 0) {
        setCellBorderSize(updates, target.topCellPath, ['bottom'], newSize);
      }
      if (target.col > 0) {
        setCellBorderSize(updates, target.leftCellPath, ['right'], newSize);
      }
      if (edges.length > 0) {
        setCellBorderSize(updates, target.path, edges, newSize);
      }
    }

    return applyUpdates();
  }
  // 2) outer => bounding rectangle edges only
  if (border === 'outer') {
    const { outer: allOut } = table.api.getSelectedCellsBorders(cells);
    const newSize = allOut ? 0 : 1;

    const { maxCol, maxRow, minCol, minRow } =
      table.api.getSelectedCellsBoundingBox(cells);

    for (const target of targets) {
      if (!target.path) continue;

      for (let rr = target.row; rr < target.row + target.rSpan; rr++) {
        for (let cc = target.col; cc < target.col + target.cSpan; cc++) {
          const edges: BorderDirection[] = [];

          if (rr === minRow) edges.push('top');
          if (rr === maxRow) edges.push('bottom');
          if (cc === minCol) edges.push('left');
          if (cc === maxCol) edges.push('right');
          if (edges.length > 0) {
            setCellBorderSize(updates, target.path, edges, newSize);
          }
        }
      }
    }

    return applyUpdates();
  }

  // 3) single side => bounding rectangle but only that side
  const allSet = table.api.isSelectedCellBorder(cells, border);
  const newSize = allSet ? 0 : 1;

  // bounding box
  const { maxCol, maxRow, minCol, minRow } =
    table.api.getSelectedCellsBoundingBox(cells);

  for (const target of targets) {
    if (!target.path) continue;

    const edges: BorderDirection[] = [];

    if (border === 'top' && target.row === minRow) {
      const isFirstRow = target.row === 0;

      if (isFirstRow) {
        edges.push('top');
      } else {
        setCellBorderSize(updates, target.topCellPath, ['bottom'], newSize);
      }
    }
    if (border === 'bottom' && target.row + target.rSpan - 1 === maxRow) {
      edges.push('bottom');
    }
    if (border === 'left' && target.col === minCol) {
      const isFirstCell = target.col === 0;

      if (isFirstCell) {
        edges.push('left');
      } else {
        setCellBorderSize(updates, target.leftCellPath, ['right'], newSize);
      }
    }
    if (border === 'right' && target.col + target.cSpan - 1 === maxCol) {
      edges.push('right');
    }
    if (edges.length > 0) {
      setCellBorderSize(updates, target.path, edges, newSize);
    }
  }

  applyUpdates();
}

export const useTableBordersDropdownMenuContentState = () => {
  const { editor } = useEditorPlugin(TablePlugin);
  const borderStates = useEditorSelector<TableBorderStates>((editor) =>
    editor.plugin(TablePlugin).api.getSelectedCellsBorders()
  );

  return {
    getOnSelectTableBorder:
      (border: BorderDirection | 'none' | 'outer') => () => {
        const table = editor.plugin(BaseTablePlugin).api;
        let cells = table.getSelectedCells();

        if (!cells || cells.length === 0) {
          const cell = editor.read.nodes.block({
            match: { type: table.getCellTypes() },
          });

          if (!cell) return;

          cells = [cell[0]];
        }

        setSelectedCellsBorder(editor, {
          border,
          cells: cells as TTableCellElement[],
        });
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

    return editor.plugin(TablePlugin).api.getCellSize({
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
    const table = editor.plugin(TablePlugin).api;

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
  const { editor, getOptions } = useEditorPlugin(TablePlugin);
  const element = useElement();
  const { disableMarginLeft, minColumnWidth = 0 } = getOptions();

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
  const cellIndices = usePluginOption(
    TablePlugin,
    'cellIndices',
    element?.id ?? ''
  );

  return React.useMemo(() => {
    if (!element) {
      throw new Error(
        'useCellIndices() requires a table-cell element provider or an explicit element.'
      );
    }

    if (!cellIndices) {
      return editor.plugin(TablePlugin).api.getCellIndices(element);
    }

    return cellIndices ?? { col: 0, row: 0 };
  }, [cellIndices, editor, element]);
};
