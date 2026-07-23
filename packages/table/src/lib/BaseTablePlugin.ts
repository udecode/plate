import type {
  BorderDirection,
  BorderStylesDefault,
  CellIndices,
  CreateCellOptions,
  GetEmptyRowNodeOptions,
  GetEmptyTableNodeOptions,
  SetBorderSizeOptions,
  TableBorderStates,
  TableFindOptions,
  TableStoreSizeOverrides,
} from './types';
import {
  type BaseEditor,
  BaseParagraphPlugin,
  createBasePlugin,
  getEditorPlugin,
  getPluginTypes,
  type HtmlDeserializer,
  type InferConfig,
  type PluginConfig,
} from '@platejs/core';
import {
  type Anchor,
  ContentSlice,
  definePropertyPolicy,
  defineValueCodec,
  type Descendant,
  type Editor,
  type EditorAboveOptions,
  editorCommands,
  type EditorDocumentValue,
  type EditorSelectionSpec,
  type EditorStateView,
  type Element,
  ElementApi,
  type ElementEntry,
  type Location,
  NodeApi,
  type NodeEntry,
  type NodeInsertNodesOptions,
  type Path,
  PathApi,
  PointApi,
  property,
  type Range,
  RangeApi,
  schema,
  SelectionApi,
  TextApi,
  type TransactionSpec,
} from '@platejs/plite';
import {
  KEYS,
  type TTableCellBorder,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
} from '@platejs/utils';
import { bindFirst, type OmitFirst } from '@udecode/utils';
import cloneDeep from 'lodash/cloneDeep.js';

const getEmptyCellNode = (
  editor: BaseEditor,
  { children, header, row }: CreateCellOptions = {}
) => {
  header =
    header ??
    (row
      ? (row as Element).children.every(
          (c) => c.type === editor.getType(KEYS.th)
        )
      : false);

  return {
    children: children ?? [
      { children: [{ text: '' }], type: editor.getType(KEYS.p) },
    ],
    type: header ? editor.getType(KEYS.th) : editor.getType(KEYS.td),
  };
};

const getEmptyRowNode = (
  editor: BaseEditor,
  { colCount = 1, ...cellOptions }: GetEmptyRowNodeOptions = {}
): TTableRowElement => ({
  children: Array.from({ length: colCount })
    .fill(colCount)
    .map(() => getEmptyCellNode(editor, cellOptions)),
  type: editor.getType(KEYS.tr),
});

const getEmptyTableNode = (
  editor: BaseEditor,
  {
    colCount,
    header,
    rowCount = 0,
    ...cellOptions
  }: GetEmptyTableNodeOptions = {}
): TTableElement => {
  const rows = Array.from({ length: rowCount })
    .fill(rowCount)
    .map((_, index) =>
      getEmptyRowNode(editor, {
        colCount,
        ...cellOptions,
        header: header && index === 0,
      })
    );

  return {
    children: rows,
    type: editor.getType(KEYS.table),
  };
};

const indexTableCells = (
  tableNode: TTableElement,
  {
    all,
    cellNode,
  }: {
    all?: boolean;
    cellNode?: TTableCellElement;
  } = {}
) => {
  const cellIndices: Record<string, CellIndices> = {};

  const skipCells: boolean[][] = [];
  let targetIndices: { col: number; row: number } | undefined;

  for (let rowIndex = 0; rowIndex < tableNode.children.length; rowIndex++) {
    const row = tableNode.children[rowIndex] as TTableRowElement;
    let colIndex = 0;

    for (const cellElement of row.children as TTableCellElement[]) {
      while (skipCells[rowIndex]?.[colIndex]) {
        colIndex++;
      }

      const currentIndices = { col: colIndex, row: rowIndex };
      cellIndices[cellElement.id!] = currentIndices;

      if (cellElement.id === cellNode?.id) {
        targetIndices = currentIndices;

        if (!all) break;
      }

      const colSpan = getColSpan(cellElement);
      const rowSpan = getRowSpan(cellElement);

      for (let r = 0; r < rowSpan; r++) {
        skipCells[rowIndex + r] = skipCells[rowIndex + r] || [];

        for (let c = 0; c < colSpan; c++) {
          skipCells[rowIndex + r][colIndex + c] = true;
        }
      }

      colIndex += colSpan;
    }
  }

  return { cellIndices, targetIndices };
};

function computeCellIndices(
  editor: BaseEditor,
  {
    all,
    cellNode,
    tableNode,
  }: {
    all?: boolean;
    cellNode?: TTableCellElement;
    tableNode?: TTableElement;
  }
) {
  const { getOptions, setOption } = getEditorPlugin(editor, BaseTablePlugin);

  if (!tableNode) {
    if (!cellNode) return;

    tableNode = editor.read.nodes.above<TTableElement>({
      at: cellNode,
      match: { type: editor.getType(KEYS.table) },
    })?.[0];

    if (!tableNode) return;
  }

  const { _cellIndices: prevIndices } = getOptions();
  const { cellIndices: nextTableIndices, targetIndices } = indexTableCells(
    tableNode,
    { all, cellNode }
  );

  if (
    Object.entries(nextTableIndices).some(
      ([id, indices]) =>
        prevIndices[id]?.col !== indices.col ||
        prevIndices[id]?.row !== indices.row
    )
  ) {
    setOption('_cellIndices', { ...prevIndices, ...nextTableIndices });
  }

  return targetIndices;
}

const getCellIndices = (
  editor: BaseEditor,
  element: TTableCellElement
): CellIndices => {
  const { getOption } = getEditorPlugin<TableConfig>(editor, {
    key: KEYS.table,
  });

  let indices = getOption('cellIndices', element.id!);

  if (!indices) {
    indices = computeCellIndices(editor, {
      cellNode: element,
    })!;

    if (!indices) {
      editor.api.debug.warn(
        'No cell indices found for element. Make sure all table cells have an id.',
        'TABLE_CELL_INDICES'
      );
    }
  }

  return indices ?? { col: 0, row: 0 };
};

const getCellRowIndexByPath = (cellPath: Path): number => {
  const index = cellPath.at(-2);

  if (index === undefined)
    throw new Error(`can not get rowIndex of path ${cellPath}`);

  return index;
};

/** Get td and th types */
const getCellTypes = (editor: BaseEditor) =>
  getPluginTypes(editor, [KEYS.td, KEYS.th]);

const adjacentTableCellLookup = new WeakMap<
  TTableElement,
  Map<string, NodeEntry<TTableCellElement>>
>();

const getAdjacentTableCell = (
  editor: BaseEditor,
  {
    at,
    deltaCol = 0,
    deltaRow = 0,
  }: {
    at?: Path;
    deltaCol?: number;
    deltaRow?: number;
  } = {}
) => {
  const entries = getTableEntries(editor, { at });

  if (!entries) return;

  const [cell] = entries.cell as NodeEntry<TTableCellElement>;
  const [table, tablePath] = entries.table as NodeEntry<TTableElement>;
  const { col, row } = getCellIndices(editor, cell);

  const nextCol = col + deltaCol;
  const nextRow = row + deltaRow;

  if (nextCol < 0 || nextRow < 0) return;

  let lookup = adjacentTableCellLookup.get(table);

  if (!lookup) {
    const nextLookup = new Map<string, NodeEntry<TTableCellElement>>();

    table.children.forEach((rowNode, rowIndex) => {
      (rowNode as TTableRowElement).children.forEach((cellNode, cellIndex) => {
        const cellEntry = [
          cellNode as TTableCellElement,
          tablePath.concat([rowIndex, cellIndex]),
        ] as NodeEntry<TTableCellElement>;
        const indices = getCellIndices(editor, cellEntry[0]);
        const { col: endCol, row: endRow } = getCellIndicesWithSpans(
          indices,
          cellEntry[0]
        );

        for (let currentRow = indices.row; currentRow <= endRow; currentRow++) {
          for (
            let currentCol = indices.col;
            currentCol <= endCol;
            currentCol++
          ) {
            nextLookup.set(`${currentRow}:${currentCol}`, cellEntry);
          }
        }
      });
    });

    adjacentTableCellLookup.set(table, nextLookup);
    lookup = nextLookup;
  }

  return lookup.get(`${nextRow}:${nextCol}`);
};

const getCellInNextTableRow = (
  editor: Editor,
  currentRowPath: Path
): NodeEntry | undefined => {
  const nextRow = editor.read.nodes.get<Element>(PathApi.next(currentRowPath));

  if (!nextRow) return;

  // TODO: Many tables in rich text editors (Google Docs, Word),
  // add a new row if we're in the last cell. Should we do the same?
  const [nextRowNode, nextRowPath] = nextRow;
  const nextCell = nextRowNode?.children?.[0];
  const nextCellPath = nextRowPath.concat(0);

  if (nextCell && nextCellPath) {
    return editor.read.nodes.get(nextCellPath);
  }
};

const getCellInPreviousTableRow = (
  editor: Editor,
  currentRowPath: Path
): NodeEntry | undefined => {
  if (currentRowPath.at(-1) === 0) return;

  const prevPath = PathApi.previous(currentRowPath);

  const previousRow = editor.read.nodes.get<Element>(prevPath);

  if (!previousRow) return;

  const [previousRowNode, previousRowPath] = previousRow;
  const previousCell =
    previousRowNode?.children?.[previousRowNode.children.length - 1];
  const previousCellPath = previousRowPath.concat(
    previousRowNode.children.length - 1
  );

  if (previousCell && previousCellPath) {
    return editor.read.nodes.get(previousCellPath);
  }
};

/**
 * Returns the colspan attribute of the table cell element.
 *
 * @default 1 if undefined.
 */
const getColSpan = (cellElem: TTableCellElement) =>
  cellElem.colSpan || Number(cellElem.attributes?.colspan) || 1;

// Get cell to the left of the current cell
const getLeftTableCell = (
  editor: BaseEditor,
  {
    at: cellPath,
  }: {
    at?: Path;
  } = {}
) =>
  getAdjacentTableCell(editor, {
    at: cellPath,
    deltaCol: -1,
  });

const getNextTableCell = (
  editor: Editor,
  _currentCell: NodeEntry,
  currentPath: Path,
  currentRow: NodeEntry
): NodeEntry | undefined => {
  const cell = editor.read.nodes.get(PathApi.next(currentPath));

  if (cell) return cell;

  const [, currentRowPath] = currentRow;

  return getCellInNextTableRow(editor, currentRowPath);
};

const getPreviousTableCell = (
  editor: Editor,
  _currentCell: NodeEntry,
  currentPath: Path,
  currentRow: NodeEntry
): NodeEntry | undefined => {
  if (currentPath.at(-1) === 0) {
    const [, currentRowPath] = currentRow;

    return getCellInPreviousTableRow(editor, currentRowPath);
  }

  const prevPath = PathApi.previous(currentPath);

  const cell = editor.read.nodes.get(prevPath);

  if (cell) return cell;
};

/**
 * Returns the rowspan attribute of the table cell element.
 *
 * @default 1 if undefined
 */
const getRowSpan = (cellElem: TTableCellElement) =>
  cellElem.rowSpan || Number(cellElem.attributes?.rowspan) || 1;

type SelectionQueryCache = {
  cellEntries?: ElementEntry[];
  children: ReturnType<BaseEditor['read']['children']>;
  selection: ReturnType<BaseEditor['read']['selection']>;
  selectedCellIds?: string[] | null;
  selectedCells?: Element[] | null;
  selectedTableIds?: string[] | null;
  selectedTables?: Element[] | null;
};

const selectionQueryCache = new WeakMap<BaseEditor, SelectionQueryCache>();

const getSelectionQueryCache = (editor: BaseEditor) => {
  const selection = editor.read.selection();
  const children = editor.read.children();
  const cachedValue = selectionQueryCache.get(editor);
  const selectionUnchanged =
    cachedValue?.selection === null
      ? selection === null
      : !!cachedValue?.selection &&
        !!selection &&
        RangeApi.equals(cachedValue.selection, selection);

  if (cachedValue && cachedValue.children === children && selectionUnchanged) {
    return cachedValue;
  }

  const nextValue: SelectionQueryCache = {
    children,
    selection,
  };

  selectionQueryCache.set(editor, nextValue);

  return nextValue;
};

const getSelectedCellEntries = (editor: BaseEditor): ElementEntry[] => {
  const cache = getSelectionQueryCache(editor);

  if ('cellEntries' in cache) {
    return cache.cellEntries ?? [];
  }

  const cellEntries = getTableGridAbove(editor, { format: 'cell' });
  const nextValue = cellEntries.length > 1 ? cellEntries : [];

  cache.cellEntries = nextValue;

  return nextValue;
};

const getSelectedCells = (editor: BaseEditor): Element[] | null => {
  const cache = getSelectionQueryCache(editor);

  if ('selectedCells' in cache) {
    return cache.selectedCells ?? null;
  }

  const cellEntries = getSelectedCellEntries(editor);

  if (cellEntries.length === 0) {
    cache.selectedCells = null;

    return null;
  }

  const nextValue = cellEntries.map(([cell]) => cell);

  cache.selectedCells = nextValue;

  return nextValue;
};

const getSelectedCellIds = (editor: BaseEditor): string[] | null => {
  const cache = getSelectionQueryCache(editor);

  if ('selectedCellIds' in cache) {
    return cache.selectedCellIds ?? null;
  }

  const selectedCellIds = getSelectedCellEntries(editor)
    .map(([cell]) => cell.id)
    .filter((id): id is string => !!id);

  const nextValue = selectedCellIds.length > 0 ? selectedCellIds : null;

  cache.selectedCellIds = nextValue;

  return nextValue;
};

const getSelectedTableIds = (editor: BaseEditor): string[] | null => {
  const cache = getSelectionQueryCache(editor);

  if ('selectedTableIds' in cache) {
    return cache.selectedTableIds ?? null;
  }

  const selectedTables = getSelectedTables(editor);

  if (!selectedTables) {
    cache.selectedTableIds = null;

    return null;
  }

  const selectedTableIds = selectedTables
    .map((table) => table.id)
    .filter((id): id is string => !!id);

  const nextValue = selectedTableIds.length > 0 ? selectedTableIds : null;

  cache.selectedTableIds = nextValue;

  return nextValue;
};

const getSelectedCell = (editor: BaseEditor, id?: string | null) => {
  if (!id) return null;

  return (
    getSelectedCellEntries(editor).find(([cell]) => cell.id === id)?.[0] ?? null
  );
};

const getSelectedTables = (editor: BaseEditor): Element[] | null => {
  const cache = getSelectionQueryCache(editor);

  if ('selectedTables' in cache) {
    return cache.selectedTables ?? null;
  }

  const selectedCellEntries = getSelectedCellEntries(editor);

  if (selectedCellEntries.length === 0) {
    cache.selectedTables = null;

    return null;
  }

  const nextValue = getTableGridAbove(editor, { format: 'table' }).map(
    ([table]) => table
  );

  cache.selectedTables = nextValue;

  return nextValue;
};

const isCellSelected = (editor: BaseEditor, id?: string | null) =>
  !!getSelectedCell(editor, id);

const isSelectingCell = (editor: BaseEditor) =>
  getSelectedCellEntries(editor).length > 0;

type GetSelectedCellsBordersOptions = {
  select?: {
    none?: boolean;
    outer?: boolean;
    side?: boolean;
  };
};

/**
 * Get all border states for the selected cells at once. Returns an object with
 * boolean flags for each border state:
 *
 * - Top/bottom/left/right: true if border is visible (size > 0)
 * - Outer: true if all outer borders are visible
 * - None: true if all borders are hidden (size === 0)
 */
const getSelectedCellsBorders = (
  editor: BaseEditor,
  selectedCells?: Element[] | null,
  options: GetSelectedCellsBordersOptions = {}
): TableBorderStates => {
  const { select = { none: true, outer: true, side: true } } = options;

  // If no cells are selected, try to get the current cell
  let cells = selectedCells;

  if (!cells || cells.length === 0) {
    const cell = editor.read.nodes.block({
      match: { type: getCellTypes(editor) },
    });

    if (cell) {
      cells = [cell[0]];
    } else {
      return {
        bottom: true,
        left: true,
        none: false,
        outer: true,
        right: true,
        top: true,
      };
    }
  }

  // Convert to TTableCellElement
  const cellElements = cells.map((cell) => cell as TTableCellElement);

  // Get bounding box once
  const { maxCol, maxRow, minCol, minRow } = getSelectedCellsBoundingBox(
    editor,
    cellElements
  );

  // Track border states
  let hasAnyBorder = false;
  let allOuterBordersSet = true;
  const borderStates = {
    bottom: false,
    left: false,
    right: false,
    top: false,
  };

  // Single pass through cells to check all border conditions
  for (const cell of cellElements) {
    const { col, row } = getCellIndices(editor, cell);
    const cellPath = editor.read.nodes.path(cell);
    const cSpan = getColSpan(cell);
    const rSpan = getRowSpan(cell);
    const isFirstRow = row === 0;
    const isFirstCell = col === 0;

    if (!cellPath) continue;
    // Check borders for 'none' state
    if (select.none && !hasAnyBorder) {
      // Check own borders
      if (isFirstRow && (cell.borders?.top?.size ?? 1) > 0) hasAnyBorder = true;
      if (isFirstCell && (cell.borders?.left?.size ?? 1) > 0)
        hasAnyBorder = true;
      if ((cell.borders?.bottom?.size ?? 1) > 0) hasAnyBorder = true;
      if ((cell.borders?.right?.size ?? 1) > 0) hasAnyBorder = true;
      // Check adjacent cells if still no border found
      if (!hasAnyBorder) {
        if (!isFirstRow) {
          const cellAboveEntry = getTopTableCell(editor, { at: cellPath });

          if (
            cellAboveEntry &&
            (cellAboveEntry[0].borders?.bottom?.size ?? 1) > 0
          ) {
            hasAnyBorder = true;
          }
        }
        if (!isFirstCell) {
          const prevCellEntry = getLeftTableCell(editor, { at: cellPath });

          if (
            prevCellEntry &&
            (prevCellEntry[0].borders?.right?.size ?? 1) > 0
          ) {
            hasAnyBorder = true;
          }
        }
      }
    }
    // Only check borders if side or outer is requested
    if (select.side || select.outer) {
      // Check outer borders state
      for (let rr = row; rr < row + rSpan; rr++) {
        for (let cc = col; cc < col + cSpan; cc++) {
          // Top border
          if (rr === minRow) {
            if (isFirstRow) {
              if ((cell.borders?.top?.size ?? 1) < 1) {
                borderStates.top = false;

                if (select.outer) allOuterBordersSet = false;
              } else if (!borderStates.top) {
                borderStates.top = true;
              }
            } else {
              const cellAboveEntry = getTopTableCell(editor, { at: cellPath });

              if (cellAboveEntry) {
                const [cellAbove] = cellAboveEntry;

                if ((cellAbove.borders?.bottom?.size ?? 1) < 1) {
                  borderStates.top = false;

                  if (select.outer) allOuterBordersSet = false;
                } else if (!borderStates.top) {
                  borderStates.top = true;
                }
              }
            }
          }
          // Bottom border
          if (rr === maxRow) {
            if ((cell.borders?.bottom?.size ?? 1) < 1) {
              borderStates.bottom = false;

              if (select.outer) allOuterBordersSet = false;
            } else if (!borderStates.bottom) {
              borderStates.bottom = true;
            }
          }
          // Left border
          if (cc === minCol) {
            if (isFirstCell) {
              if ((cell.borders?.left?.size ?? 1) < 1) {
                borderStates.left = false;

                if (select.outer) allOuterBordersSet = false;
              } else if (!borderStates.left) {
                borderStates.left = true;
              }
            } else {
              const prevCellEntry = getLeftTableCell(editor, { at: cellPath });

              if (prevCellEntry) {
                const [prevCell] = prevCellEntry;

                if ((prevCell.borders?.right?.size ?? 1) < 1) {
                  borderStates.left = false;

                  if (select.outer) allOuterBordersSet = false;
                } else if (!borderStates.left) {
                  borderStates.left = true;
                }
              }
            }
          }
          // Right border
          if (cc === maxCol) {
            if ((cell.borders?.right?.size ?? 1) < 1) {
              borderStates.right = false;

              if (select.outer) allOuterBordersSet = false;
            } else if (!borderStates.right) {
              borderStates.right = true;
            }
          }
        }
      }
    }
  }

  return {
    ...(select.side
      ? borderStates
      : { bottom: true, left: true, right: true, top: true }),
    none: select.none ? !hasAnyBorder : false,
    outer: select.outer ? allOuterBordersSet : true,
  };
};

/**
 * Tells if the entire selection is currently borderless (size=0 on all edges).
 * If **any** edge is > 0, returns false.
 */
function isSelectedCellBordersNone(
  editor: BaseEditor,
  cells: TTableCellElement[]
): boolean {
  return cells.every((cell) => {
    const { borders } = cell;
    const { col, row } = getCellIndices(editor, cell);
    const cellPath = editor.read.nodes.path(cell);

    if (!cellPath) return true;

    // Check own borders
    const isFirstRow = row === 0;
    const isFirstCell = col === 0;

    if (isFirstRow && (borders?.top?.size ?? 1) > 0) return false;
    if (isFirstCell && (borders?.left?.size ?? 1) > 0) return false;
    if ((borders?.bottom?.size ?? 1) > 0) return false;
    if ((borders?.right?.size ?? 1) > 0) return false;
    // Check adjacent cells' borders
    if (!isFirstRow) {
      const cellAboveEntry = getTopTableCell(editor, { at: cellPath });

      if (cellAboveEntry) {
        const [cellAbove] = cellAboveEntry;

        if ((cellAbove.borders?.bottom?.size ?? 1) > 0) return false;
      }
    }
    if (!isFirstCell) {
      const prevCellEntry = getLeftTableCell(editor, { at: cellPath });

      if (prevCellEntry) {
        const [prevCell] = prevCellEntry;

        if ((prevCell.borders?.right?.size ?? 1) > 0) return false;
      }
    }

    return true;
  });
}

/**
 * Tells if the bounding rectangle for the entire selection is fully set for the
 * **outer** edges, i.e. top/left/bottom/right edges have size=1. We ignore
 * internal edges, only bounding rectangle edges.
 */
function isSelectedCellBordersOuter(
  editor: BaseEditor,
  cells: TTableCellElement[]
): boolean {
  const { maxCol, maxRow, minCol, minRow } = getSelectedCellsBoundingBox(
    editor,
    cells
  );

  // For each cell, figure out which edges are relevant on the bounding rect
  // and confirm they are all size=1
  for (const cell of cells) {
    const { col, row } = getCellIndices(editor, cell);
    const cSpan = getColSpan(cell);
    const rSpan = getRowSpan(cell);

    for (let rr = row; rr < row + rSpan; rr++) {
      for (let cc = col; cc < col + cSpan; cc++) {
        // If on top boundary => must have top=1, etc.
        if (rr === minRow && (cell.borders?.top?.size ?? 1) < 1) return false;
        if (rr === maxRow && (cell.borders?.bottom?.size ?? 1) < 1)
          return false;
        if (cc === minCol && (cell.borders?.left?.size ?? 1) < 1) return false;
        if (cc === maxCol && (cell.borders?.right?.size ?? 1) < 1) return false;
      }
    }
  }

  return true;
}

/**
 * Tells if the bounding rectangle for the entire selection is fully set for
 * that single side. Example: border='top' => if every cell that sits along the
 * top boundary has top=1.
 */
function isSelectedCellBorder(
  editor: BaseEditor,
  cells: TTableCellElement[],
  side: BorderDirection
): boolean {
  const { maxCol, maxRow, minCol, minRow } = getSelectedCellsBoundingBox(
    editor,
    cells
  );

  return cells.every((cell) => {
    const { col, row } = getCellIndices(editor, cell);
    const cSpan = getColSpan(cell);
    const rSpan = getRowSpan(cell);
    const cellPath = editor.read.nodes.path(cell);

    if (!cellPath) return true;

    for (let rr = row; rr < row + rSpan; rr++) {
      for (let cc = col; cc < col + cSpan; cc++) {
        if (side === 'top' && rr === minRow) {
          const isFirstRow = row === 0;

          if (isFirstRow) {
            return (cell.borders?.top?.size ?? 1) >= 1;
          }

          const cellAboveEntry = getTopTableCell(editor, { at: cellPath });

          if (!cellAboveEntry) return true;

          const [cellAboveNode] = cellAboveEntry;

          return (cellAboveNode.borders?.bottom?.size ?? 1) >= 1;
        }
        if (side === 'bottom' && rr === maxRow) {
          return (cell.borders?.bottom?.size ?? 1) >= 1;
        }
        if (side === 'left' && cc === minCol) {
          const isFirstCell = col === 0;

          if (isFirstCell) {
            return (cell.borders?.left?.size ?? 1) >= 1;
          }

          const prevCellEntry = getLeftTableCell(editor, { at: cellPath });

          if (!prevCellEntry) return true;

          const [prevCellNode] = prevCellEntry;

          return (prevCellNode.borders?.right?.size ?? 1) >= 1;
        }
        if (side === 'right' && cc === maxCol) {
          return (cell.borders?.right?.size ?? 1) >= 1;
        }
      }
    }

    return true;
  });
}

/** Return bounding box [minRow..maxRow, minCol..maxCol] of all selected cells. */
function getSelectedCellsBoundingBox(
  editor: BaseEditor,
  cells: TTableCellElement[]
): { maxCol: number; maxRow: number; minCol: number; minRow: number } {
  let minRow = Number.POSITIVE_INFINITY;
  let maxRow = Number.NEGATIVE_INFINITY;
  let minCol = Number.POSITIVE_INFINITY;
  let maxCol = Number.NEGATIVE_INFINITY;

  for (const cell of cells) {
    const { col, row } = getCellIndices(editor, cell);
    const cSpan = getColSpan(cell);
    const rSpan = getRowSpan(cell);
    const endRow = row + rSpan - 1;
    const endCol = col + cSpan - 1;

    if (row < minRow) minRow = row;
    if (endRow > maxRow) maxRow = endRow;
    if (col < minCol) minCol = col;
    if (endCol > maxCol) maxCol = endCol;
  }

  return { maxCol, maxRow, minCol, minRow };
}

const getTableCellBorders = (
  editor: BaseEditor,
  {
    cellIndices,
    defaultBorder = {
      size: 1,
    },
    element,
  }: {
    element: TTableCellElement;
    cellIndices?: CellIndices;
    defaultBorder?: TTableCellBorder;
  }
): BorderStylesDefault => {
  const cellPath = editor.read.nodes.path(element);

  if (!cellPath) {
    return {
      bottom: defaultBorder,
      right: defaultBorder,
    };
  }

  const [rowNode, rowPath] =
    editor.read.nodes.parent<TTableRowElement>(cellPath) ?? [];
  if (!rowNode || !rowPath) {
    return {
      bottom: defaultBorder,
      right: defaultBorder,
    };
  }
  const [tableNode] = editor.read.nodes.parent<TTableElement>(rowPath) ?? [];
  const tableType = editor.getType(KEYS.table);

  if (!tableNode || tableNode.type !== tableType) {
    return {
      bottom: defaultBorder,
      right: defaultBorder,
    };
  }

  const { col } = cellIndices ?? getCellIndices(editor, element);
  const isFirstCell = col === 0;
  const isFirstRow = tableNode.children?.[0] === rowNode;

  const getBorder = (dir: BorderDirection) => {
    const border = element.borders?.[dir];

    return {
      color: border?.color ?? defaultBorder.color,
      size: border?.size ?? defaultBorder.size,
      style: border?.style ?? defaultBorder.style,
    };
  };

  return {
    bottom: getBorder('bottom'),
    left: isFirstCell ? getBorder('left') : undefined,
    right: getBorder('right'),
    top: isFirstRow ? getBorder('top') : undefined,
  };
};

/** Get the width of a cell with colSpan support. */
const getTableCellSize = (
  editor: BaseEditor,
  {
    cellIndices,
    colSizes,
    element,
    rowSize,
  }: {
    element: TTableCellElement;
    cellIndices?: CellIndices;
    colSizes?: number[];
    rowSize?: number;
  }
): { minHeight: number; width: number } => {
  const path = editor.read.nodes.path(element);

  if (!path) return { minHeight: rowSize ?? 0, width: 0 };

  if (!rowSize) {
    const [rowElement] = editor.read.nodes.parent<TTableRowElement>(path) ?? [];

    if (!rowElement || rowElement.type !== editor.getType(KEYS.tr)) {
      return { minHeight: 0, width: 0 };
    }

    rowSize = rowElement.size ?? 0;
  }
  if (!colSizes) {
    const [, rowPath] = editor.read.nodes.parent<TTableRowElement>(path) ?? [];

    if (!rowPath) return { minHeight: rowSize, width: 0 };

    const [tableNode] = editor.read.nodes.parent<TTableElement>(rowPath) ?? [];

    if (!tableNode) return { minHeight: rowSize, width: 0 };

    colSizes = getTableOverriddenColSizes(tableNode);
  }

  const colSpan = getColSpan(element);

  const { col } = cellIndices ?? getCellIndices(editor, element);

  const width = (colSizes ?? [])
    .slice(col, col + colSpan)
    .reduce((total, w) => total + (w || 0), 0);

  return { minHeight: rowSize, width };
};

const getTableColumnCount = (tableNode: TTableElement): number => {
  const firstRow = tableNode.children[0] as TTableRowElement | undefined;

  return (
    (firstRow?.children as TTableCellElement[] | undefined)?.reduce(
      (count, cell) =>
        count + Number(cell.colSpan ?? cell.attributes?.colspan ?? 1),
      0
    ) ?? 0
  );
};

/** Get table column index of a cell node. */
const getTableColumnIndex = (editor: Editor, cellNode: Element) => {
  const path = editor.read.nodes.path(cellNode);

  if (!path) return -1;

  const [trNode] = editor.read.nodes.parent(path) ?? [];

  if (!trNode || !ElementApi.isElement(trNode)) return -1;

  let colIndex = -1;

  trNode.children.some((item, index) => {
    if (item === cellNode) {
      colIndex = index;

      return true;
    }

    return false;
  });

  return colIndex;
};

/**
 * If at (default = selection) is in table>tr>td|th, return table, row, and cell
 * node entries.
 */
const getTableEntries = (
  editor: BaseEditor,
  { at = editor.read.selection() }: { at?: Location | null } = {}
) => {
  if (!at) return;

  const cellEntry = editor.read.nodes.find<TTableCellElement>({
    at,
    match: {
      type: getCellTypes(editor),
    },
  });

  if (!cellEntry) return;

  const [, cellPath] = cellEntry;

  const rowEntry = editor.read.nodes.above<TTableRowElement>({
    at: cellPath,
    match: { type: editor.getType(KEYS.tr) },
  });

  if (!rowEntry) return;

  const [, rowPath] = rowEntry;

  const tableEntry = editor.read.nodes.above<TTableElement>({
    at: rowPath,
    match: { type: editor.getType(KEYS.table) },
  });

  if (!tableEntry) return;

  return {
    cell: cellEntry,
    row: rowEntry,
    table: tableEntry,
  };
};

type GetTableGridAboveOptions = EditorAboveOptions<Element> &
  Pick<GetTableGridByRangeOptions, 'format'>;

/** Get sub table above anchor and focus. Format: tables or cells. */
const getTableGridAbove = (
  editor: BaseEditor,
  { format = 'table', ...options }: GetTableGridAboveOptions = {},
  state: Pick<EditorStateView, 'nodes' | 'ranges' | 'selection'> = editor.read
): ElementEntry[] => {
  const at = options.at ?? state.selection();

  if (!at) return [];

  const edges = state.ranges.edges(at);

  if (edges) {
    const [startPoint, endPoint] = edges;
    const start = state.nodes.above<Element>({
      ...options,
      at: startPoint,
      match: { type: getCellTypes(editor) },
    });
    const end = state.nodes.above<Element>({
      ...options,
      at: endPoint,
      match: { type: getCellTypes(editor) },
    });

    if (!start || !end) return [];

    if (!PathApi.equals(start[1], end[1])) {
      return getTableGridByRange(
        editor,
        {
          at: {
            anchor: {
              offset: 0,
              path: start[1],
            },
            focus: {
              offset: 0,
              path: end[1],
            },
          },
          format,
        },
        state
      );
    }
    if (format === 'table') {
      const table = getEmptyTableNode(editor, { rowCount: 1 });
      table.children[0].children = [start[0]];

      return [[table, start[1].slice(0, -2)]];
    }

    return [start];
  }

  return [];
};

type GetTableGridByRangeOptions = {
  at: Range;

  /**
   * Format of the output:
   *
   * - Table element
   * - Array of cells
   */
  format?: 'cell' | 'table';
};

/** Get sub table between 2 cell paths. */
const getTableGridByRange = (
  editor: BaseEditor,
  { at, format = 'table' }: GetTableGridByRangeOptions,
  state: Pick<EditorStateView, 'nodes'> = editor.read
): ElementEntry[] => {
  const { disableMerge } = editor.plugin(BaseTablePlugin).getOptions();
  const startCellPath = at.anchor.path;
  const endCellPath = at.focus.path;
  const tablePath = startCellPath.slice(0, -2);
  const tableNode = state.nodes.get<TTableElement>(tablePath)?.[0];

  if (
    !disableMerge &&
    tableNode?.children.some((row) =>
      (row.children as TTableCellElement[]).some(
        (cell) => getColSpan(cell) > 1 || getRowSpan(cell) > 1
      )
    )
  ) {
    return getTableMergeGridByRange(editor, { at, format }, state);
  }

  const _startRowIndex = startCellPath.at(-2)!;
  const _endRowIndex = endCellPath.at(-2)!;
  const _startColIndex = startCellPath.at(-1)!;
  const _endColIndex = endCellPath.at(-1)!;

  const startRowIndex = Math.min(_startRowIndex, _endRowIndex);
  const endRowIndex = Math.max(_startRowIndex, _endRowIndex);
  const startColIndex = Math.min(_startColIndex, _endColIndex);
  const endColIndex = Math.max(_startColIndex, _endColIndex);

  const relativeRowIndex = endRowIndex - startRowIndex;
  const relativeColIndex = endColIndex - startColIndex;

  const table: TTableElement = getEmptyTableNode(editor, {
    children: [],
    colCount: relativeColIndex + 1,
    rowCount: relativeRowIndex + 1,
  });

  let rowIndex = startRowIndex;
  let colIndex = startColIndex;

  const cellEntries: ElementEntry[] = [];

  while (true) {
    const cellPath = tablePath.concat([rowIndex, colIndex]);

    const cell = state.nodes.get<Element>(cellPath)?.[0];

    if (!cell) break;

    const rows = table.children[rowIndex - startRowIndex].children as Element[];

    rows[colIndex - startColIndex] = cell;

    cellEntries.push([cell, cellPath]);

    if (colIndex + 1 <= endColIndex) {
      colIndex += 1;
    } else if (rowIndex + 1 <= endRowIndex) {
      colIndex = startColIndex;
      rowIndex += 1;
    } else {
      break;
    }
  }

  if (format === 'cell') {
    return cellEntries;
  }

  return [[table, tablePath]];
};

/**
 * Returns node.colSizes if it exists, applying overrides, otherwise returns a
 * 0-filled array.
 */
const getTableOverriddenColSizes = (
  tableNode: TTableElement,
  colSizeOverrides?: TableStoreSizeOverrides
): number[] => {
  const colCount = getTableColumnCount(tableNode);

  const colSizes = (
    tableNode.colSizes
      ? [...tableNode.colSizes]
      : (Array.from({ length: colCount }).fill(0) as number[])
  ).map((size, index) => colSizeOverrides?.get?.(index) ?? size);

  return colSizes;
};

/** Get table row index of a cell node. */
const getTableRowIndex = (editor: Editor, cellNode: Element) => {
  const path = editor.read.nodes.path(cellNode);

  if (!path) return 0;

  const rowPath = PathApi.parent(path);

  return rowPath.at(-1)!;
};

// Get cell to the top of the current cell
const getTopTableCell = (
  editor: BaseEditor,
  {
    at: cellPath,
  }: {
    at?: Path;
  } = {}
) =>
  getAdjacentTableCell(editor, {
    at: cellPath,
    deltaRow: -1,
  });

const isTableBorderHidden = (editor: BaseEditor, border: BorderDirection) => {
  if (border === 'left') {
    const node = getLeftTableCell(editor)?.[0];

    if (node) {
      return node.borders?.right?.size === 0;
    }
  }
  if (border === 'top') {
    const node = getTopTableCell(editor)?.[0];

    if (node) {
      return node.borders?.bottom?.size === 0;
    }
  }

  return (
    editor.read.nodes.find<TTableCellElement>({
      match: { type: getCellTypes(editor) },
    })?.[0].borders?.[border]?.size === 0
  );
};

type TableGridCell = {
  cell: TTableCellElement;
  cellIndex: number;
  col: number;
  colSpan: number;
  row: number;
  rowSpan: number;
};

type TableGrid = {
  cells: (TableGridCell | undefined)[][];
  height: number;
  rows: TableGridCell[][];
  width: number;
};

type CreateCell = (
  row: TTableRowElement,
  rowIndex: number
) => TTableCellElement;

type RepairTableGridOptions = {
  createRow?: () => TTableRowElement;
  extendRowSpans?: boolean;
};

const getSpan = (value: number) =>
  Number.isInteger(value) && value > 0 ? value : 1;

const setSpan = (
  cell: TTableCellElement,
  key: 'colSpan' | 'rowSpan',
  value: number
) => {
  const attribute = key === 'colSpan' ? 'colspan' : 'rowspan';

  if (value === 1) {
    delete cell[key];

    if (cell.attributes?.[attribute] !== undefined) {
      delete cell.attributes[attribute];
    }

    return;
  }

  cell[key] = value;

  if (cell.attributes?.[attribute] !== undefined) {
    cell.attributes[attribute] = String(value);
  }
};

const getTableGrid = (table: TTableElement): TableGrid => {
  const height = table.children.length;
  const cells: (TableGridCell | undefined)[][] = Array.from(
    { length: height },
    () => []
  );
  const rows: TableGridCell[][] = Array.from({ length: height }, () => []);
  let width = 0;

  table.children.forEach((rowNode, row) => {
    const tableRow = rowNode as TTableRowElement;
    let col = 0;

    (tableRow.children as TTableCellElement[]).forEach((cell, cellIndex) => {
      while (cells[row][col]) col++;

      const colSpan = getSpan(getColSpan(cell));
      const rowSpan = Math.min(getSpan(getRowSpan(cell)), height - row);
      const gridCell = { cell, cellIndex, col, colSpan, row, rowSpan };

      rows[row].push(gridCell);

      for (let rowOffset = 0; rowOffset < rowSpan; rowOffset++) {
        for (let colOffset = 0; colOffset < colSpan; colOffset++) {
          cells[row + rowOffset][col + colOffset] ??= gridCell;
        }
      }

      col += colSpan;
      width = Math.max(width, col);
    });
  });

  return { cells, height, rows, width };
};

const repairTableGrid = (
  table: TTableElement,
  createCell: CreateCell,
  { createRow, extendRowSpans = false }: RepairTableGridOptions = {}
): { changed: boolean; grid: TableGrid; table: TTableElement } => {
  const nextTable = cloneDeep(table);
  const height = extendRowSpans
    ? nextTable.children.reduce(
        (maxHeight, rowNode, row) =>
          Math.max(
            maxHeight,
            ...(rowNode.children as TTableCellElement[]).map(
              (cell) => row + getSpan(getRowSpan(cell))
            )
          ),
        nextTable.children.length
      )
    : nextTable.children.length;

  while (nextTable.children.length < height) {
    nextTable.children.push(
      createRow?.() ??
        ({
          children: [],
          type: nextTable.children.at(-1)!.type,
        } as TTableRowElement)
    );
  }

  const occupied: boolean[][] = Array.from({ length: height }, () => []);
  const anchors: { cell: TTableCellElement; col: number }[][] = Array.from(
    { length: height },
    () => []
  );
  let changed = height !== table.children.length;
  let width = 0;

  nextTable.children.forEach((rowNode, row) => {
    const tableRow = rowNode as TTableRowElement;
    let col = 0;

    (tableRow.children as TTableCellElement[]).forEach((cell) => {
      while (occupied[row][col]) col++;

      const originalColSpan = getSpan(getColSpan(cell));
      const originalRowSpan = getSpan(getRowSpan(cell));
      let colSpan = originalColSpan;
      let rowSpan = Math.min(originalRowSpan, height - row);
      let collides = false;

      for (let rowOffset = 0; rowOffset < rowSpan && !collides; rowOffset++) {
        for (let colOffset = 0; colOffset < colSpan; colOffset++) {
          if (occupied[row + rowOffset][col + colOffset]) {
            collides = true;
            break;
          }
        }
      }

      if (collides) {
        colSpan = 1;
        rowSpan = 1;
      }

      if (colSpan !== originalColSpan || rowSpan !== originalRowSpan) {
        setSpan(cell, 'colSpan', colSpan);
        setSpan(cell, 'rowSpan', rowSpan);
        changed = true;
      }

      anchors[row].push({ cell, col });

      for (let rowOffset = 0; rowOffset < rowSpan; rowOffset++) {
        for (let colOffset = 0; colOffset < colSpan; colOffset++) {
          occupied[row + rowOffset][col + colOffset] = true;
        }
      }

      col += colSpan;
      width = Math.max(width, col);
    });
  });

  nextTable.children.forEach((rowNode, row) => {
    const tableRow = rowNode as TTableRowElement;

    for (let col = 0; col < width; col++) {
      if (!occupied[row][col]) {
        const cell = createCell(tableRow, row);

        anchors[row].push({ cell, col });
        occupied[row][col] = true;
        changed = true;
      }
    }

    tableRow.children = anchors[row]
      .sort((a, b) => a.col - b.col)
      .map(({ cell }) => cell);
  });

  return {
    changed,
    grid: getTableGrid(nextTable),
    table: nextTable,
  };
};

const clearSelectedTableCells = (
  editor: BaseEditor,
  state: EditorStateView,
  at: Range,
  options: { collapse?: boolean } = {}
): TransactionSpec | null => {
  const cells = getTableGridAbove(editor, { at, format: 'cell' }, state);

  if (cells.length < 2) return null;

  const anchor = state.points.start(cells[0][1]);
  const focus = state.points.start(cells.at(-1)![1]);

  return state.transaction((tx) => {
    cells.forEach(([, path]) => {
      tx.nodes.replaceChildren(
        [
          {
            children: [{ text: '' }],
            type: editor.getType(KEYS.p),
          },
        ],
        { at: path }
      );
    });

    if (anchor && focus) {
      tx.selection.set(
        options.collapse ? { anchor: focus, focus } : { anchor, focus }
      );
    }
  });
};

const findCellByIndexes = (
  editor: BaseEditor,
  table: TTableElement,
  searchRowIndex: number,
  searchColIndex: number
) => {
  const allCells = table.children.flatMap(
    (current) => current.children
  ) as TTableCellElement[];

  const foundCell = allCells.find((cellNode) => {
    const indices = getCellIndices(editor, cellNode);

    const { col: _startColIndex, row: _startRowIndex } = indices;
    const { col: _endColIndex, row: _endRowIndex } = getCellIndicesWithSpans(
      indices,
      cellNode
    );

    if (
      searchColIndex >= _startColIndex &&
      searchColIndex <= _endColIndex &&
      searchRowIndex >= _startRowIndex &&
      searchRowIndex <= _endRowIndex
    ) {
      return true;
    }

    return false;
  });

  return foundCell;
};

const getCellIndicesWithSpans = (
  { col, row }: { col: number; row: number },
  endCell: TTableCellElement
) => ({
  col: col + getColSpan(endCell) - 1,
  row: row + getRowSpan(endCell) - 1,
});

const getCellPath = (
  editor: BaseEditor,
  tableEntry: NodeEntry<TTableElement>,
  curRowIndex: number,
  curColIndex: number
) => {
  const [tableNode, tablePath] = tableEntry;

  const rowElem = tableNode.children[curRowIndex] as TTableRowElement;
  const foundColIndex = rowElem.children.findIndex((c) => {
    const cE = c as TTableCellElement;
    const { col: colIndex } = getCellIndices(editor, cE);

    return colIndex === curColIndex;
  });

  return tablePath.concat([curRowIndex, foundColIndex]);
};

const getSelectionWidth = <T extends [TTableCellElement, Path]>(cells: T[]) => {
  // default = firstRowIndex

  let max = 0;
  let lastCellRowIndex = getCellRowIndexByPath(cells[0][1]);
  let total = 0;
  cells.forEach(([cell, cellPath]) => {
    const currentCellRowIndex = getCellRowIndexByPath(cellPath);
    const colSpan = cell.colSpan ?? cell.attributes?.colspan;
    const colSpanNumbered = colSpan ? Number(colSpan) : 1;

    //  on the same line
    if (currentCellRowIndex === lastCellRowIndex) {
      total += colSpanNumbered;
    } else {
      max = Math.max(total, max);
      total = colSpanNumbered;
    }

    lastCellRowIndex = currentCellRowIndex;
  });

  return Math.max(total, max);
};

type FormatType = 'all' | 'cell' | 'table';

type GetTableMergeGridByRangeOptions<T extends FormatType> = {
  at: Range;

  /**
   * Format of the output:
   *
   * - Table element
   * - Array of cells
   */
  format?: T;
};

type TableGridEntries = {
  cellEntries: ElementEntry[];
  tableEntries: ElementEntry[];
};

/**
 * Get sub table between 2 cell paths. Ensure that the selection is always a
 * valid table grid.
 */
function getTableMergeGridByRange(
  editor: BaseEditor,
  options: GetTableMergeGridByRangeOptions<'all'>,
  state?: Pick<EditorStateView, 'nodes'>
): TableGridEntries;

function getTableMergeGridByRange(
  editor: BaseEditor,
  options: GetTableMergeGridByRangeOptions<'cell' | 'table'>,
  state?: Pick<EditorStateView, 'nodes'>
): ElementEntry[];

function getTableMergeGridByRange(
  editor: BaseEditor,
  { at, format }: GetTableMergeGridByRangeOptions<FormatType>,
  state: Pick<EditorStateView, 'nodes'> = editor.read
): ElementEntry[] | TableGridEntries {
  const type = editor.getType(KEYS.table);

  const startCellEntry = state.nodes.above<TTableCellElement>({
    at: at.anchor.path,
    match: { type: getCellTypes(editor) },
  });
  const endCellEntry = state.nodes.above<TTableCellElement>({
    at: at.focus.path,
    match: { type: getCellTypes(editor) },
  });

  if (!startCellEntry || !endCellEntry) {
    return format === 'all' ? { cellEntries: [], tableEntries: [] } : [];
  }

  const startCell = startCellEntry[0];
  const endCell = endCellEntry[0];

  const startCellPath = startCellEntry[1];
  const tablePath = startCellPath.slice(0, -2);

  const tableEntry = state.nodes.get<TTableElement>(tablePath);

  if (!tableEntry || tableEntry[0].type !== type) {
    return format === 'all' ? { cellEntries: [], tableEntries: [] } : [];
  }
  const realTable = tableEntry[0];

  const { col: _startColIndex, row: _startRowIndex } = getCellIndicesWithSpans(
    getCellIndices(editor, startCell),
    startCell
  );

  const { col: _endColIndex, row: _endRowIndex } = getCellIndicesWithSpans(
    getCellIndices(editor, endCell),
    endCell
  );

  let startRowIndex = Math.min(_startRowIndex, _endRowIndex);
  let endRowIndex = Math.max(_startRowIndex, _endRowIndex);
  let startColIndex = Math.min(_startColIndex, _endColIndex);
  let endColIndex = Math.max(_startColIndex, _endColIndex);

  const relativeRowIndex = endRowIndex - startRowIndex;
  const relativeColIndex = endColIndex - startColIndex;

  let table: TTableElement = getEmptyTableNode(editor, {
    children: [],
    colCount: relativeColIndex + 1,
    rowCount: relativeRowIndex + 1,
  });

  let cellEntries: ElementEntry[] = [];
  let cellsSet = new WeakSet();

  let rowIndex = startRowIndex;
  let colIndex = startColIndex;

  while (true) {
    const cell = findCellByIndexes(editor, realTable, rowIndex, colIndex);

    if (!cell) {
      break;
    }

    const indicies = getCellIndices(editor, cell);
    const { col: cellColWithSpan, row: cellRowWithSpan } =
      getCellIndicesWithSpans(indicies, cell);
    const { col: cellCol, row: cellRow } = indicies;

    // check if cell is still in range
    const hasOverflowTop = cellRow < startRowIndex;
    const hasOverflowBottom = cellRowWithSpan > endRowIndex;
    const hasOverflowLeft = cellCol < startColIndex;
    const hasOverflowRight = cellColWithSpan > endColIndex;

    if (
      hasOverflowTop ||
      hasOverflowBottom ||
      hasOverflowLeft ||
      hasOverflowRight
    ) {
      // reset the cycle if has overflow
      cellsSet = new WeakSet();
      cellEntries = [];
      startRowIndex = Math.min(startRowIndex, cellRow);
      endRowIndex = Math.max(endRowIndex, cellRowWithSpan);
      startColIndex = Math.min(startColIndex, cellCol);
      endColIndex = Math.max(endColIndex, cellColWithSpan);
      rowIndex = startRowIndex;
      colIndex = startColIndex;
      const newRelativeRowIndex = endRowIndex - startRowIndex;
      const newRelativeColIndex = endColIndex - startColIndex;
      table = getEmptyTableNode(editor, {
        children: [],
        colCount: newRelativeColIndex + 1,
        rowCount: newRelativeRowIndex + 1,
      });

      continue;
    }
    if (!cellsSet.has(cell)) {
      cellsSet.add(cell);

      const rows = table.children[rowIndex - startRowIndex]
        .children as Element[];
      rows[colIndex - startColIndex] = cell;

      const cellPath = state.nodes.path(cell);

      if (!cellPath) continue;

      cellEntries.push([cell, cellPath]);
    }
    if (colIndex + 1 <= endColIndex) {
      colIndex += 1;
    } else if (rowIndex + 1 <= endRowIndex) {
      colIndex = startColIndex;
      rowIndex += 1;
    } else {
      break;
    }
  }

  const formatType = (format as string) || 'table';

  if (formatType === 'cell') {
    return cellEntries;
  }

  // clear redundant cells
  table.children?.forEach((rowEl) => {
    const rowElement = rowEl as TTableRowElement;

    const filteredChildren = rowElement.children?.filter((cellEl) => {
      const cellElement = cellEl as TTableCellElement;

      return cellElement.children.length > 0;
    });

    rowElement.children = filteredChildren;
  });

  if (formatType === 'table') {
    return [[table, tablePath]];
  }

  return {
    cellEntries,
    tableEntries: [[table, tablePath]],
  };
}

const getTableMergedColumnCount = (tableNode: TTableElement) => {
  const firstRow = tableNode.children[0] as TTableRowElement | undefined;

  return (
    (firstRow?.children as TTableCellElement[] | undefined)?.reduce(
      (count, cell) => count + getColSpan(cell),
      0
    ) ?? 0
  );
};

/**
 * Checks if the given table is rectangular, meaning all rows have the same
 * effective number of cells, considering colspan and rowspan.
 */
const isTableRectangular = (table?: TTableElement) => {
  const arr: number[] = [];
  table?.children?.forEach((row, rI) => {
    const rowEl = row as TTableRowElement;

    rowEl.children?.forEach((cell) => {
      const cellElem = cell as TTableCellElement;

      Array.from({
        length: getRowSpan(cellElem) || 1,
      } as ArrayLike<number>).forEach((_, i) => {
        if (!arr[rI + i]) {
          arr[rI + i] = 0;
        }

        arr[rI + i] += getColSpan(cellElem);
      });
    });
  });

  return arr.every((value) => value === arr[0]);
};

const pathTouchesSnapshotTable = (
  snapshot: EditorDocumentValue,
  root: string | null,
  tableType: string,
  path: readonly number[]
) => {
  if (path.length === 0) return true;

  const children =
    root === null ? snapshot.children : (snapshot.roots?.[root] ?? []);
  const document = { children, type: '__table_root__' };

  for (let depth = 1; depth <= path.length; depth++) {
    const node = NodeApi.getIf(document, path.slice(0, depth));

    if (ElementApi.isElement(node) && node.type === tableType) return true;
  }

  return false;
};

const clampTableSelection = (
  tableType: string,
  selection: Range,
  state: Pick<EditorStateView, 'nodes' | 'points' | 'selection'>
) => {
  if (
    !state.selection.isAcrossBlocks({
      at: selection,
      match: { type: tableType },
    })
  ) {
    return selection;
  }

  const anchorTable = state.nodes.block({
    at: selection.anchor,
    match: { type: tableType },
  });
  let focus = selection.focus;

  if (anchorTable) {
    const [, path] = anchorTable;

    if (RangeApi.isBackward(selection)) {
      focus = state.points.start(path) ?? focus;
    } else if (state.points.before(path)) {
      focus = state.points.end(path) ?? focus;
    }
  } else {
    const focusTable = state.nodes.block({
      at: selection.focus,
      match: { type: tableType },
    });

    if (focusTable) {
      const [, path] = focusTable;

      if (RangeApi.isBackward(selection)) {
        const start = state.points.start(path);

        if (start) focus = state.points.before(start) ?? start;
      } else {
        focus = state.points.end(path) ?? focus;
      }
    }
  }

  return focus && !PointApi.equals(focus, selection.focus)
    ? { ...selection, focus }
    : selection;
};

type TableCellSelection = Range &
  Readonly<{
    cells: readonly Range[];
    kind: 'table-cell';
  }>;

declare module '@platejs/plite' {
  interface EditorSelectionKindMap {
    'table-cell': TableCellSelection;
  }
}

const isTableCellSelection = (
  selection: unknown
): selection is TableCellSelection =>
  SelectionApi.isSelection(selection) &&
  selection.kind === 'table-cell' &&
  Object.keys(selection).every((key) =>
    ['anchor', 'cells', 'focus', 'kind'].includes(key)
  ) &&
  Array.isArray((selection as TableCellSelection).cells) &&
  (selection as TableCellSelection).cells.length > 0 &&
  (selection as TableCellSelection).cells.every(RangeApi.isRange);

const createTableCellSelection = (
  editor: BaseEditor,
  at: Location
): TableCellSelection | null => {
  const range = editor.read.ranges.get(at);

  if (!range) return null;

  const cells = getTableGridAbove(editor, { at: range, format: 'cell' })
    .map(([, path]) => editor.read.ranges.get(path))
    .filter((cell): cell is Range => !!cell);

  if (cells.length <= 1) return null;

  return { ...range, cells, kind: 'table-cell' };
};

type TablePluginOptions = {
  /** @private Keeps Track of cell indices by id. */
  _cellIndices: Record<string, { col: number; row: number }>;
  /** @private Caches selection ids without conflating absence with `null`. */
  _selectionOverrides: {
    cellIds?: string[] | null;
    tableIds?: string[] | null;
  };
  /** @private Forces selection-derived selectors to refresh. */
  _selectionVersion: number;
  /** Disable expanding the table when inserting cells. */
  disableExpandOnInsert?: boolean;
  /** Disable first column left resizer. */
  disableMarginLeft?: boolean;
  /** Disable cell merging functionality. */
  disableMerge?: boolean;
  /** Preserve the first column width when the table has one column. */
  enableUnsetSingleColSize?: boolean;
  /** Initial table width used to derive missing column sizes. */
  initialTableWidth?: number;
  /** Minimum column width. */
  minColumnWidth?: number;
};

type InsertTableColumnOptions = {
  /** Exact cell path to insert the column at. Takes precedence over `fromCell`. */
  at?: Path;
  /** Insert before the current column. */
  before?: boolean;
  /** Cell path used to locate the table and column. */
  fromCell?: Path;
  header?: boolean;
  select?: boolean;
};

type InsertTableRowOptions = {
  /** Exact row path, or a table path to append a row. Takes precedence over `fromRow`. */
  at?: Path;
  /** Insert before the current row. */
  before?: boolean;
  /** Row path used to locate the table. */
  fromRow?: Path;
  header?: boolean;
  select?: boolean;
};

type MoveTableSelectionOptions = {
  at?: Location;
  /** Expand the cell selection to an edge. */
  edge?: 'bottom' | 'left' | 'right' | 'top';
  /** Move from a single selected cell when expanding to an edge. */
  fromOneCell?: boolean;
  /** Move upward instead of downward. */
  reverse?: boolean;
};

type SetCellBackgroundOptions = {
  color: string | null;
  selectedCells?: Element[];
};

type TableApi = {
  create: OmitFirst<typeof getEmptyTableNode>;
  createCell: OmitFirst<typeof getEmptyCellNode>;
  createCellSelection: OmitFirst<typeof createTableCellSelection>;
  createRow: OmitFirst<typeof getEmptyRowNode>;
  getAdjacentCell: OmitFirst<typeof getAdjacentTableCell>;
  getCellBorders: OmitFirst<typeof getTableCellBorders>;
  getCellInNextRow: OmitFirst<typeof getCellInNextTableRow>;
  getCellInPreviousRow: OmitFirst<typeof getCellInPreviousTableRow>;
  getCellIndices: OmitFirst<typeof getCellIndices>;
  getCellSize: OmitFirst<typeof getTableCellSize>;
  getCellTypes: () => string[];
  getColumnCount: typeof getTableColumnCount;
  getColumnIndex: OmitFirst<typeof getTableColumnIndex>;
  getEntries: OmitFirst<typeof getTableEntries>;
  getGridAbove: OmitFirst<typeof getTableGridAbove>;
  getGridByRange: OmitFirst<typeof getTableGridByRange>;
  getMergeGridByRange: {
    (
      options: GetTableMergeGridByRangeOptions<'all'>,
      state?: Pick<EditorStateView, 'nodes'>
    ): TableGridEntries;
    (
      options: GetTableMergeGridByRangeOptions<'cell' | 'table'>,
      state?: Pick<EditorStateView, 'nodes'>
    ): ElementEntry[];
  };
  getLeftCell: OmitFirst<typeof getLeftTableCell>;
  getNextCell: OmitFirst<typeof getNextTableCell>;
  getOverriddenColumnSizes: typeof getTableOverriddenColSizes;
  getPreviousCell: OmitFirst<typeof getPreviousTableCell>;
  getRowIndex: OmitFirst<typeof getTableRowIndex>;
  getSelectedCell: OmitFirst<typeof getSelectedCell>;
  getSelectedCellEntries: OmitFirst<typeof getSelectedCellEntries>;
  getSelectedCellIds: OmitFirst<typeof getSelectedCellIds>;
  getSelectedCells: OmitFirst<typeof getSelectedCells>;
  getSelectedCellsBorders: OmitFirst<typeof getSelectedCellsBorders>;
  getSelectedCellsBoundingBox: OmitFirst<typeof getSelectedCellsBoundingBox>;
  getSelectedTableIds: OmitFirst<typeof getSelectedTableIds>;
  getSelectedTables: OmitFirst<typeof getSelectedTables>;
  getSelectionWidth: typeof getSelectionWidth;
  getTopCell: OmitFirst<typeof getTopTableCell>;
  getColSpan: typeof getColSpan;
  getRowSpan: typeof getRowSpan;
  getCellChildren: (cell: TTableCellElement) => Descendant[];
  isBorderHidden: OmitFirst<typeof isTableBorderHidden>;
  isCellSelected: OmitFirst<typeof isCellSelected>;
  isRectangular: typeof isTableRectangular;
  isSelectedCellBorder: OmitFirst<typeof isSelectedCellBorder>;
  isSelectedCellBordersNone: OmitFirst<typeof isSelectedCellBordersNone>;
  isSelectedCellBordersOuter: OmitFirst<typeof isSelectedCellBordersOuter>;
  isSelectingCell: OmitFirst<typeof isSelectingCell>;
  writeSelection: (data: Pick<DataTransfer, 'getData' | 'setData'>) => boolean;
};

type TablePluginContract = PluginConfig<
  'table',
  TablePluginOptions,
  {},
  {
    table: {
      insert: (
        tableOptions?: GetEmptyTableNodeOptions,
        options?: NodeInsertNodesOptions<TTableElement>
      ) => void;
      insertColumn: (options?: InsertTableColumnOptions) => void;
      insertRow: (options?: InsertTableRowOptions) => void;
      merge: () => void;
      moveSelection: (options?: MoveTableSelectionOptions) => true | undefined;
      remove: () => void;
      removeColumn: () => void;
      removeRow: () => void;
      selectAll: () => boolean;
      setBorderSize: (
        size: number,
        options?: Omit<SetBorderSizeOptions, 'size'>
      ) => void;
      setBorderSizes: (options: readonly SetBorderSizeOptions[]) => void;
      setCellBackground: (options: SetCellBackgroundOptions) => void;
      setColumnSize: (
        value: { colIndex: number; width: number },
        options?: TableFindOptions
      ) => void;
      setMarginLeft: (
        value: { marginLeft: number },
        options?: TableFindOptions
      ) => void;
      setRowSize: (
        value: { height: number; rowIndex: number },
        options?: TableFindOptions
      ) => void;
      split: () => void;
      tab: (options?: { reverse?: boolean }) => boolean;
    };
  },
  {
    cellIndices?: (id: string) => CellIndices;
    isCellSelected?: (id?: string | null) => boolean;
    isSelectingCell?: () => boolean;
    selectedCell?: (id?: string | null) => Element | null;
    selectedCellIds?: () => readonly string[] | null;
    selectedCells?: () => Element[] | null;
    selectedTableIds?: () => readonly string[] | null;
    selectedTables?: () => Element[] | null;
  },
  {},
  readonly [],
  readonly [],
  never,
  TableApi
>;

type TableCellAttributes = NonNullable<TTableCellElement['attributes']>;

type TableCellBorders = NonNullable<TTableCellElement['borders']>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isTableCellBorder = (value: unknown): value is TTableCellBorder =>
  isRecord(value) &&
  (!('color' in value) || typeof value.color === 'string') &&
  (!('size' in value) ||
    (typeof value.size === 'number' && Number.isFinite(value.size))) &&
  (!('style' in value) || typeof value.style === 'string');

const tableCellAttributesPolicy = definePropertyPolicy<TableCellAttributes>({
  id: 'plate.table.cell-attributes',
  validate: (value): value is TableCellAttributes =>
    isRecord(value) &&
    (!('colspan' in value) || typeof value.colspan === 'string') &&
    (!('rowspan' in value) || typeof value.rowspan === 'string'),
  version: 1,
});

const tableCellBordersPolicy = definePropertyPolicy<TableCellBorders>({
  id: 'plate.table.cell-borders',
  validate: (value): value is TableCellBorders =>
    isRecord(value) &&
    (!('bottom' in value) || isTableCellBorder(value.bottom)) &&
    (!('left' in value) || isTableCellBorder(value.left)) &&
    (!('right' in value) || isTableCellBorder(value.right)) &&
    (!('top' in value) || isTableCellBorder(value.top)),
  version: 1,
});

const parse: HtmlDeserializer['parse'] = ({ element, type }) => {
  const background = element.style.background || element.style.backgroundColor;

  if (background) {
    return {
      background,
      type,
    };
  }

  return { type };
};

const getCellAttributeProps = (element?: Descendant) => {
  if (!element || !('attributes' in element) || !isRecord(element.attributes)) {
    return {};
  }

  const { colspan, rowspan } = element.attributes;

  return {
    colSpan: typeof colspan === 'string' ? colspan : undefined,
    rowSpan: typeof rowspan === 'string' ? rowspan : undefined,
  };
};

export const BaseTableRowPlugin = createBasePlugin({
  key: KEYS.tr,
  schema: ({ plugins }) => {
    const [cellType, headerCellType] = plugins.elementTypes([
      BaseTableCellPlugin,
      BaseTableCellHeaderPlugin,
    ]);

    return {
      element: {
        content: schema.content.types([cellType, headerCellType], {
          default: { type: cellType },
          // A row fully covered by row spans has no physical cell children.
          min: 0,
        }),
        properties: { size: property.number() },
        topLevel: false,
      },
    };
  },
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: 'TR' }],
      },
    },
  },
});

export const BaseTableCellPlugin = createBasePlugin({
  key: KEYS.td,
  host: { dangerouslyAllowAttributes: ['colspan', 'rowspan'] },
  render: { nodeProps: ({ element }) => getCellAttributeProps(element) },
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: { type: plugins.elementType(BaseParagraphPlugin) },
        min: 1,
      }),
      properties: {
        attributes: property.json({ policy: tableCellAttributesPolicy }),
        background: property.string(),
        borders: property.json({ policy: tableCellBordersPolicy }),
        colSpan: property.number(),
        rowSpan: property.number(),
        size: property.number(),
      },
      topLevel: false,
    },
  }),
  parsers: {
    html: {
      deserializer: {
        attributeNames: ['rowspan', 'colspan'],
        parse,
        rules: [{ validNodeName: 'TD' }],
      },
    },
  },
  rules: {
    merge: { removeEmpty: false },
  },
});

export const BaseTableCellHeaderPlugin = createBasePlugin({
  key: KEYS.th,
  host: { dangerouslyAllowAttributes: ['colspan', 'rowspan'] },
  render: { nodeProps: ({ element }) => getCellAttributeProps(element) },
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: { type: plugins.elementType(BaseParagraphPlugin) },
        min: 1,
      }),
      properties: {
        attributes: property.json({ policy: tableCellAttributesPolicy }),
        background: property.string(),
        borders: property.json({ policy: tableCellBordersPolicy }),
        colSpan: property.number(),
        rowSpan: property.number(),
        size: property.number(),
      },
      topLevel: false,
    },
  }),
  parsers: {
    html: {
      deserializer: {
        attributeNames: ['rowspan', 'colspan'],
        parse,
        rules: [{ validNodeName: 'TH' }],
      },
    },
  },
  rules: {
    merge: { removeEmpty: false },
  },
});

/** Enables support for tables. */
export const BaseTablePlugin = createBasePlugin({
  key: KEYS.table,
  schema: ({ plugins }) => {
    const rowType = plugins.elementType(BaseTableRowPlugin);

    return {
      element: {
        content: schema.content.type(rowType, {
          default: { type: rowType },
          min: 1,
        }),
        properties: {
          colSizes: property.json({
            policy: definePropertyPolicy<
              NonNullable<TTableElement['colSizes']>
            >({
              id: 'plate.table.column-sizes',
              validate: (
                value
              ): value is NonNullable<TTableElement['colSizes']> =>
                Array.isArray(value) &&
                value.every(
                  (size) => typeof size === 'number' && Number.isFinite(size)
                ),
              version: 1,
            }),
          }),
          marginLeft: property.number(),
        },
      },
    };
  },
  transformInitialValue: ({ setOption, type, value }) => {
    const cellIndices: Record<string, CellIndices> = {};

    for (const [table, path] of NodeApi.elements({
      children: value,
      type: 'root',
    })) {
      if (path.length === 0 || table.type !== type) continue;

      Object.assign(
        cellIndices,
        indexTableCells(table as TTableElement).cellIndices
      );
    }

    setOption('_cellIndices', cellIndices);

    return value;
  },
  options: {
    _cellIndices: {},
    _selectionOverrides: {},
    _selectionVersion: 0,
    disableMerge: false,
    minColumnWidth: 48,
  } as TablePluginOptions,
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: 'TABLE' }],
      },
    },
  },
  plugins: [BaseTableRowPlugin, BaseTableCellPlugin, BaseTableCellHeaderPlugin],
})
  .extendSelectors<TablePluginContract['selectors']>(
    ({ editor, getOptions }) => ({
      cellIndices: (id) => getOptions()._cellIndices[id],
      isCellSelected: (id) => {
        const selectedCellIds = getOptions()._selectionOverrides.cellIds;

        if (selectedCellIds !== undefined) {
          return !!id && (selectedCellIds?.includes(id) ?? false);
        }

        return isCellSelected(editor, id);
      },
      isSelectingCell: () => {
        const selectedCellIds = getOptions()._selectionOverrides.cellIds;

        if (selectedCellIds !== undefined) {
          return !!selectedCellIds;
        }

        return isSelectingCell(editor);
      },
      selectedCell: (id) => {
        void getOptions()._selectionVersion;

        return getSelectedCell(editor, id);
      },
      selectedCellIds: () => {
        const selectedCellIds = getOptions()._selectionOverrides.cellIds;

        if (selectedCellIds !== undefined) {
          return selectedCellIds;
        }

        return getSelectedCellIds(editor);
      },
      selectedCells: () => {
        void getOptions()._selectionVersion;

        return getSelectedCells(editor);
      },
      selectedTableIds: () => {
        const selectedTableIds = getOptions()._selectionOverrides.tableIds;

        if (selectedTableIds !== undefined) {
          return selectedTableIds;
        }

        return getSelectedTableIds(editor);
      },
      selectedTables: () => {
        void getOptions()._selectionVersion;

        return getSelectedTables(editor);
      },
    })
  )
  .extendApi<TableApi>(({ editor }) => ({
    create: bindFirst(getEmptyTableNode, editor),
    createCell: bindFirst(getEmptyCellNode, editor),
    createCellSelection: bindFirst(createTableCellSelection, editor),
    createRow: bindFirst(getEmptyRowNode, editor),
    getAdjacentCell: bindFirst(getAdjacentTableCell, editor),
    getCellBorders: bindFirst(getTableCellBorders, editor),
    getCellInNextRow: bindFirst(getCellInNextTableRow, editor),
    getCellInPreviousRow: bindFirst(getCellInPreviousTableRow, editor),
    getCellIndices: bindFirst(getCellIndices, editor),
    getCellSize: bindFirst(getTableCellSize, editor),
    getCellTypes: () => getCellTypes(editor),
    getColumnCount: getTableColumnCount,
    getColumnIndex: bindFirst(getTableColumnIndex, editor),
    getEntries: bindFirst(getTableEntries, editor),
    getGridAbove: bindFirst(getTableGridAbove, editor),
    getGridByRange: bindFirst(getTableGridByRange, editor),
    getMergeGridByRange: bindFirst(
      getTableMergeGridByRange,
      editor
    ) as TableApi['getMergeGridByRange'],
    getLeftCell: bindFirst(getLeftTableCell, editor),
    getNextCell: bindFirst(getNextTableCell, editor),
    getOverriddenColumnSizes: getTableOverriddenColSizes,
    getPreviousCell: bindFirst(getPreviousTableCell, editor),
    getRowIndex: bindFirst(getTableRowIndex, editor),
    getSelectedCell: bindFirst(getSelectedCell, editor),
    getSelectedCellEntries: bindFirst(getSelectedCellEntries, editor),
    getSelectedCellIds: bindFirst(getSelectedCellIds, editor),
    getSelectedCells: bindFirst(getSelectedCells, editor),
    getSelectedCellsBorders: bindFirst(getSelectedCellsBorders, editor),
    getSelectedCellsBoundingBox: bindFirst(getSelectedCellsBoundingBox, editor),
    getSelectedTableIds: bindFirst(getSelectedTableIds, editor),
    getSelectedTables: bindFirst(getSelectedTables, editor),
    getSelectionWidth,
    getTopCell: bindFirst(getTopTableCell, editor),
    getColSpan,
    getRowSpan,
    getCellChildren: (cell) => cell.children,
    isBorderHidden: bindFirst(isTableBorderHidden, editor),
    isCellSelected: bindFirst(isCellSelected, editor),
    isRectangular: isTableRectangular,
    isSelectedCellBorder: bindFirst(isSelectedCellBorder, editor),
    isSelectedCellBordersNone: bindFirst(isSelectedCellBordersNone, editor),
    isSelectedCellBordersOuter: bindFirst(isSelectedCellBordersOuter, editor),
    isSelectingCell: bindFirst(isSelectingCell, editor),
    writeSelection: (data) => {
      const cells = getTableGridAbove(editor, { format: 'cell' });

      if (cells.length <= 1) return false;

      const [tableEntry] = getTableGridAbove(editor, { format: 'table' });

      if (!tableEntry) return false;

      editor.api.clipboard.writeSelection(data);

      const rows = tableEntry[0].children as TTableRowElement[];
      const values = rows.map((row) =>
        (row.children as TTableCellElement[]).map((cell) =>
          NodeApi.string(cell)
        )
      );
      const csv = `${values.map((row) => row.join(',')).join('\n')}\n`;
      const tsv = `${values.map((row) => row.join('\t')).join('\n')}\n`;

      data.setData('text/csv', csv);
      data.setData('text/tsv', tsv);
      data.setData('text/plain', tsv);

      return true;
    },
  }))
  .extendTx<
    Pick<
      TablePluginContract['tx']['table'],
      'insert' | 'insertColumn' | 'insertRow'
    >
  >(({ editor }) => (tx) => {
    const insertTableMergeColumn = ({
      at,
      before,
      fromCell,
      header,
      select: shouldSelect,
    }: {
      /** Exact path of the cell to insert the column at. Will overrule `fromCell`. */
      at?: Path;
      /** Insert the column before the current column instead of after */
      before?: boolean;
      /** Path of the cell to insert the column from. */
      fromCell?: Path;
      header?: boolean;
      select?: boolean;
    } = {}) => {
      const { getOptions, type } = getEditorPlugin(editor, BaseTablePlugin);
      const { initialTableWidth, minColumnWidth } = getOptions();

      if (at && !fromCell) {
        const table = tx.nodes.get<TTableElement>(at)?.[0];

        if (table?.type === editor.getType(KEYS.table)) {
          const firstRow = table.children[0] as TTableRowElement | undefined;

          if (!firstRow?.children.length) return;

          fromCell = at.concat([0, firstRow.children.length - 1]);
          at = undefined;
        }
      }

      const cellEntry = fromCell
        ? tx.nodes.find<TTableCellElement>({
            at: fromCell,
            match: { type: getCellTypes(editor) },
          })
        : tx.nodes.above<TTableCellElement>({
            match: { type: getCellTypes(editor) },
          });

      if (!cellEntry) return;

      const [, cellPath] = cellEntry;
      const cell = cellEntry[0];

      const tableEntry = tx.nodes.above<TTableElement>({
        at: cellPath,
        match: { type },
      });

      if (!tableEntry) return;

      const [tableNode, tablePath] = tableEntry;

      const { col: cellColIndex } = getCellIndices(editor, cell);
      const cellColSpan = getColSpan(cell);

      let nextColIndex: number;
      let checkingColIndex: number;

      if (PathApi.isPath(at)) {
        nextColIndex = cellColIndex;
        checkingColIndex = cellColIndex - 1;
      } else {
        nextColIndex = before ? cellColIndex : cellColIndex + cellColSpan;
        checkingColIndex = before
          ? cellColIndex
          : cellColIndex + cellColSpan - 1;
      }

      const rowNumber = tableNode.children.length;
      const firstCol = nextColIndex <= 0;

      let placementCorrection = before ? 0 : 1;

      if (firstCol) {
        checkingColIndex = 0;
        placementCorrection = 0;
      }

      const affectedCellsSet = new Set();
      Array.from({ length: rowNumber }, (_, i) => i).forEach((rI) => {
        const found = findCellByIndexes(
          editor,
          tableNode,
          rI,
          checkingColIndex
        );

        if (found) {
          affectedCellsSet.add(found);
        }
      });
      const affectedCells = Array.from(affectedCellsSet) as TTableCellElement[];

      affectedCells.forEach((curCell) => {
        const { col: curColIndex, row: curRowIndex } = getCellIndices(
          editor,
          curCell
        );

        const curRowSpan = getRowSpan(curCell);
        const curColSpan = getColSpan(curCell);

        const currentCellPath = getCellPath(
          editor,
          tableEntry,
          curRowIndex,
          curColIndex
        );

        const endCurI = curColIndex + curColSpan - 1;

        if (endCurI >= nextColIndex && !firstCol && !before) {
          const colSpan = curColSpan + 1;
          const newCell = cloneDeep({ ...curCell, colSpan });

          if (newCell.attributes?.colspan) {
            newCell.attributes.colspan = colSpan.toString();
          }

          tx.nodes.set<TTableCellElement>(newCell, { at: currentCellPath });
        } else {
          const curRowPath = currentCellPath.slice(0, -1);
          const curColPath = currentCellPath.at(-1)!;
          const placementPath = [
            ...curRowPath,
            before ? curColPath : curColPath + placementCorrection,
          ];

          const row = tx.nodes.parent(currentCellPath)!;
          const rowElement = row[0] as TTableRowElement;
          const emptyCell = {
            ...getEmptyCellNode(editor, { header, row: rowElement }),
            colSpan: 1,
            rowSpan: curRowSpan,
          };
          tx.nodes.insert(emptyCell, {
            at: placementPath,
            select: shouldSelect,
          });
        }
      });

      const { colSizes } = tableNode;

      if (colSizes) {
        let newColSizes = [
          ...colSizes.slice(0, nextColIndex),
          0,
          ...colSizes.slice(nextColIndex),
        ];

        if (initialTableWidth) {
          newColSizes[nextColIndex] =
            colSizes[nextColIndex] ??
            colSizes[nextColIndex - 1] ??
            initialTableWidth / colSizes.length;

          const oldTotal = colSizes.reduce((a, b) => a + b, 0);
          const newTotal = newColSizes.reduce((a, b) => a + b, 0);
          const maxTotal = Math.max(oldTotal, initialTableWidth);

          if (newTotal > maxTotal) {
            const factor = maxTotal / newTotal;
            newColSizes = newColSizes.map((size) =>
              Math.max(minColumnWidth ?? 0, Math.floor(size * factor))
            );
          }
        }

        tx.nodes.set<TTableElement>(
          {
            colSizes: newColSizes,
          },
          {
            at: tablePath,
          }
        );
      }
    };

    const insertTableMergeRow = ({
      at,
      before,
      fromRow,
      header,
      select: shouldSelect,
    }: {
      /** Exact path of the row to insert the column at. Will overrule `fromRow`. */
      at?: Path;
      /** Insert the row before the current row instead of after */
      before?: boolean;
      fromRow?: Path;
      header?: boolean;
      select?: boolean;
    } = {}) => {
      const { type } = getEditorPlugin(editor, BaseTablePlugin);

      if (at && !fromRow) {
        const table = tx.nodes.get<TTableElement>(at)?.[0];

        if (table?.type === editor.getType(KEYS.table)) {
          if (!table.children.length) return;

          fromRow = at.concat(table.children.length - 1);
          at = undefined;
        }
      }

      const trEntry = tx.nodes.find({
        at: fromRow,
        match: { type: editor.getType(KEYS.tr) },
      });

      if (!trEntry) return;

      const [, trPath] = trEntry;

      const tableEntry = tx.nodes.above<TTableElement>({
        at: trPath,
        match: { type },
      });

      if (!tableEntry) return;

      const tableNode = tableEntry[0] as TTableElement;

      const cellEntry = tx.nodes.find({
        at: fromRow,
        match: { type: getCellTypes(editor) },
      });

      if (!cellEntry) return;

      const [cellNode, cellPath] = cellEntry;
      const cellElement = cellNode as TTableCellElement;
      const cellRowSpan = getRowSpan(cellElement);
      const { row: cellRowIndex } = getCellIndices(editor, cellElement);

      const rowPath = cellPath.at(-2)!;
      const tablePath = cellPath.slice(0, -2)!;

      let nextRowIndex: number;
      let checkingRowIndex: number;
      let nextRowPath: number[];

      if (PathApi.isPath(at)) {
        nextRowIndex = at.at(-1)!;
        checkingRowIndex = cellRowIndex - 1;
        nextRowPath = at;
      } else {
        nextRowIndex = before ? cellRowIndex : cellRowIndex + cellRowSpan;
        checkingRowIndex = before
          ? cellRowIndex - 1
          : cellRowIndex + cellRowSpan - 1;
        nextRowPath = [...tablePath, before ? rowPath : rowPath + cellRowSpan];
      }

      const firstRow = nextRowIndex === 0;

      if (firstRow) {
        checkingRowIndex = 0;
      }

      const colCount = getTableColumnCount(tableNode);
      const affectedCellsSet = new Set();
      Array.from({ length: colCount }, (_, i) => i).forEach((cI) => {
        const found = findCellByIndexes(
          editor,
          tableNode,
          checkingRowIndex,
          cI
        );

        if (found) {
          affectedCellsSet.add(found);
        }
      });
      const affectedCells = Array.from(affectedCellsSet) as TTableCellElement[];

      const newRowChildren: TTableCellElement[] = [];
      affectedCells.forEach((cur) => {
        if (!cur) return;

        const curCell = cur as TTableCellElement;
        const { col: curColIndex, row: curRowIndex } = getCellIndices(
          editor,
          curCell
        );

        const curRowSpan = getRowSpan(curCell);
        const curColSpan = getColSpan(curCell);
        const currentCellPath = getCellPath(
          editor,
          tableEntry,
          curRowIndex,
          curColIndex
        );

        const endCurI = curRowIndex + curRowSpan - 1;

        if (endCurI >= nextRowIndex && !firstRow) {
          const rowSpan = curRowSpan + 1;
          const newCell = cloneDeep({ ...curCell, rowSpan });

          if (newCell.attributes?.rowspan) {
            newCell.attributes.rowspan = rowSpan.toString();
          }

          // make higher
          tx.nodes.set<TTableCellElement>(newCell, { at: currentCellPath });
        } else {
          // add new
          const row = tx.nodes.parent(currentCellPath)!;
          const rowElement = row[0] as TTableRowElement;
          const emptyCell = getEmptyCellNode(editor, {
            header,
            row: rowElement,
          });

          newRowChildren.push({
            ...emptyCell,
            colSpan: curColSpan,
            rowSpan: 1,
          });
        }
      });

      tx.nodes.insert(
        {
          children: newRowChildren,
          type: editor.getType(KEYS.tr),
        },
        {
          at: nextRowPath,
          select: false,
        }
      );

      if (shouldSelect) {
        const cellEntry = tx.nodes.find({
          at: nextRowPath,
          match: { type: getCellTypes(editor) },
        });

        if (cellEntry) {
          const [, nextCellPath] = cellEntry;
          const point = tx.points.start(nextCellPath);

          if (point) tx.selection.set({ anchor: point, focus: point });
        }
      }
    };

    return {
      insert: (
        { colCount = 2, header, rowCount = 2 }: GetEmptyTableNodeOptions = {},
        options: NodeInsertNodesOptions<TTableElement> = {}
      ): void => {
        const type = editor.getType(KEYS.table);
        const newTable = getEmptyTableNode(editor, {
          colCount,
          header,
          rowCount,
        });
        const insertOptions = { ...options, select: false };
        const selectTableStart = (tablePath: number[] | undefined) => {
          if (!options.select) return;

          const point = tablePath ? tx.points.start(tablePath) : undefined;

          if (point) tx.selection.set({ anchor: point, focus: point });
        };

        if (options.at !== undefined) {
          const tablePath = PathApi.isPath(options.at)
            ? options.at
            : tx.nodes.path(options.at);

          tx.nodes.insert(newTable, insertOptions);
          selectTableStart(tablePath);
          return;
        }

        const currentTable = tx.nodes.above<TTableElement>({
          match: { type },
        });

        if (currentTable) {
          const tablePath = PathApi.next(currentTable[1]);

          tx.nodes.insert(newTable, {
            ...insertOptions,
            at: tablePath,
          });
          selectTableStart(tablePath);
          return;
        }

        const currentBlock = tx.nodes.block();
        const tablePath = currentBlock
          ? PathApi.next(currentBlock[1])
          : [tx.children().length];

        tx.blocks.insertAfter(newTable, insertOptions);
        selectTableStart(tablePath);
      },

      insertColumn: (
        options: {
          /** Exact path of the cell to insert the column at. Will overrule `fromCell`. */
          at?: Path;
          /** Insert the column before the current column instead of after */
          before?: boolean;
          /** Path of the cell to insert the column from. */
          fromCell?: Path;
          header?: boolean;
          select?: boolean;
        } = {}
      ): void => {
        const { getOptions, type } = getEditorPlugin(editor, BaseTablePlugin);

        const { disableMerge, initialTableWidth, minColumnWidth } =
          getOptions();

        if (!disableMerge) {
          insertTableMergeColumn(options);

          return;
        }

        const { before, header, select: shouldSelect } = options;
        let { at, fromCell } = options;

        if (at && !fromCell) {
          const table = tx.nodes.get<TTableElement>(at)?.[0];

          if (table?.type === editor.getType(KEYS.table)) {
            const firstRow = table.children[0] as TTableRowElement | undefined;

            if (!firstRow?.children.length) return;

            fromCell = at.concat([0, firstRow.children.length - 1]);
            at = undefined;
          }
        }

        const cellEntry = tx.nodes.find({
          at: fromCell,
          match: { type: getCellTypes(editor) },
        });

        if (!cellEntry) return;

        const [, cellPath] = cellEntry;

        const tableEntry = tx.nodes.above<TTableElement>({
          at: cellPath,
          match: { type },
        });

        if (!tableEntry) return;

        const [tableNode, tablePath] = tableEntry;

        let nextCellPath: Path;
        let nextColIndex: number;

        if (PathApi.isPath(at)) {
          nextCellPath = at;
          nextColIndex = at.at(-1)!;
        } else {
          nextCellPath = before ? cellPath : PathApi.next(cellPath);
          nextColIndex = before ? cellPath.at(-1)! : cellPath.at(-1)! + 1;
        }

        const currentRowIndex = cellPath.at(-2);

        // for each row, insert a new cell
        tableNode.children.forEach((row, rowIndex) => {
          const insertCellPath = [...nextCellPath];

          if (PathApi.isPath(at)) {
            insertCellPath[at.length - 2] = rowIndex;
          } else {
            insertCellPath[cellPath.length - 2] = rowIndex;
          }

          const isHeaderRow =
            header === undefined
              ? (row as Element).children.every(
                  (c) => c.type === editor.getType(KEYS.th)
                )
              : header;

          tx.nodes.insert(
            getEmptyCellNode(editor, {
              header: isHeaderRow,
            }),
            {
              at: insertCellPath,
              select: shouldSelect && rowIndex === currentRowIndex,
            }
          );
        });

        const { colSizes } = tableNode;

        if (colSizes) {
          let newColSizes = [
            ...colSizes.slice(0, nextColIndex),
            0,
            ...colSizes.slice(nextColIndex),
          ];

          if (initialTableWidth) {
            newColSizes[nextColIndex] =
              colSizes[nextColIndex] ??
              colSizes[nextColIndex - 1] ??
              initialTableWidth / colSizes.length;

            const oldTotal = colSizes.reduce((a, b) => a + b, 0);
            const newTotal = newColSizes.reduce((a, b) => a + b, 0);
            const maxTotal = Math.max(oldTotal, initialTableWidth);

            if (newTotal > maxTotal) {
              const factor = maxTotal / newTotal;
              newColSizes = newColSizes.map((size) =>
                Math.max(minColumnWidth ?? 0, Math.floor(size * factor))
              );
            }
          }

          tx.nodes.set<TTableElement>(
            {
              colSizes: newColSizes,
            },
            {
              at: tablePath,
            }
          );
        }
      },

      insertRow: (
        options: {
          /**
           * Exact path of the row to insert the column at. Pass the table path to
           * insert at the end of the table. Will overrule `fromRow`.
           */
          at?: Path;
          /** Insert the row before the current row instead of after */
          before?: boolean;
          fromRow?: Path;
          header?: boolean;
          select?: boolean;
        } = {}
      ): void => {
        const { getOptions, type } = getEditorPlugin(editor, BaseTablePlugin);

        const { disableMerge } = getOptions();

        if (!disableMerge) {
          insertTableMergeRow(options);

          return;
        }

        const { before, header, select: shouldSelect } = options;
        let { at, fromRow } = options;

        if (at && !fromRow) {
          const table = tx.nodes.get<TTableElement>(at)?.[0];

          if (table?.type === editor.getType(KEYS.table)) {
            if (!table.children.length) return;

            fromRow = at.concat(table.children.length - 1);
            at = undefined;
          }
        }

        const trEntry = tx.nodes.find<TTableRowElement>({
          at: fromRow,
          match: { type: editor.getType(KEYS.tr) },
        });

        if (!trEntry) return;

        const [trNode, trPath] = trEntry;

        const tableEntry = tx.nodes.above<TTableElement>({
          at: trPath,
          match: { type },
        });

        if (!tableEntry) return;

        const insertPath = PathApi.isPath(at)
          ? at
          : before
            ? trPath
            : PathApi.next(trPath);

        tx.nodes.insert(
          {
            children: (trNode.children as Element[]).map((_, index) => {
              const hasSingleRow = tableEntry[0].children.length === 1;
              const isHeaderColumn =
                !hasSingleRow &&
                (tableEntry[0].children as Element[]).every(
                  (row) => row.children[index].type === editor.getType(KEYS.th)
                );

              return getEmptyCellNode(editor, {
                header: header ?? isHeaderColumn,
              });
            }),
            type: editor.getType(KEYS.tr),
          },
          { at: insertPath }
        );

        if (shouldSelect) {
          const point = tx.points.start(insertPath);

          if (point) tx.selection.set({ anchor: point, focus: point });
        }
      },
    };
  })
  .extendTx<
    Pick<
      TablePluginContract['tx']['table'],
      'remove' | 'removeColumn' | 'removeRow'
    >
  >(({ editor }) => (tx) => {
    const deleteTableMergeColumn = () => {
      const type = editor.getType(KEYS.table);
      const tableEntry = tx.nodes.above<TTableElement>({
        match: { type },
      });

      if (!tableEntry) return;

      if (tx.selection.isExpanded()) {
        return deleteColumnWhenExpanded(tableEntry);
      }

      const table = tableEntry[0] as TTableElement;

      const selectedCellEntry = tx.nodes.above({
        match: {
          type: getCellTypes(editor),
        },
      });

      if (!selectedCellEntry) return;

      const selectedCell = selectedCellEntry[0] as TTableCellElement;

      const { col: deletingColIndex } = getCellIndices(editor, selectedCell);
      const colsDeleteNumber = getColSpan(selectedCell);

      if (getTableMergedColumnCount(table) <= colsDeleteNumber) {
        tx.nodes.remove({ at: tableEntry[1] });

        return;
      }

      const endingColIndex = deletingColIndex + colsDeleteNumber - 1;

      const rowNumber = table.children.length;
      const affectedCellsSet = new Set();
      // iterating by rows is important here to keep the order of affected cells
      for (const rI of Array.from({ length: rowNumber }, (_, i) => i)) {
        for (const cI of Array.from(
          { length: colsDeleteNumber },
          (_, i) => i
        )) {
          const colIndex = deletingColIndex + cI;
          const found = findCellByIndexes(editor, table, rI, colIndex);

          if (found) {
            affectedCellsSet.add(found);
          }
        }
      }
      const affectedCells = Array.from(affectedCellsSet) as TTableCellElement[];

      const { squizeColSpanCells } = affectedCells.reduce<{
        squizeColSpanCells: TTableCellElement[];
      }>(
        (acc, cur) => {
          if (!cur) return acc;

          const currentCell = cur as TTableCellElement;
          const { col: curColIndex } = getCellIndices(editor, currentCell);
          const curColSpan = getColSpan(currentCell);

          if (curColIndex < deletingColIndex && curColSpan > 1) {
            acc.squizeColSpanCells.push(currentCell);
          } else if (
            curColSpan > 1 &&
            curColIndex + curColSpan - 1 > endingColIndex
          ) {
            acc.squizeColSpanCells.push(currentCell);
          }

          return acc;
        },
        { squizeColSpanCells: [] }
      );

      /** Change colSpans */
      squizeColSpanCells.forEach((cur) => {
        const curCell = cur as TTableCellElement;

        const { col: curColIndex, row: curColRowIndex } = getCellIndices(
          editor,
          curCell
        );
        const curColSpan = getColSpan(curCell);

        const curCellPath = getCellPath(
          editor,
          tableEntry,
          curColRowIndex,
          curColIndex
        );

        const curCellEndingColIndex = Math.min(
          curColIndex + curColSpan - 1,
          endingColIndex
        );
        const colsNumberAffected = curCellEndingColIndex - deletingColIndex + 1;
        const colSpan = curColSpan - colsNumberAffected;
        const newCell = cloneDeep({ ...curCell, colSpan });

        if (newCell.attributes?.colspan) {
          newCell.attributes.colspan = colSpan.toString();
        }

        tx.nodes.set<TTableCellElement>(newCell, { at: curCellPath });
      });

      const trEntry = tx.nodes.above<TTableRowElement>({
        match: { type: editor.getType(KEYS.tr) },
      });

      /** Remove cells */
      if (
        selectedCell &&
        trEntry &&
        tableEntry &&
        // Cannot delete the last cell
        trEntry[0].children.length > 1
      ) {
        const [tableNode, tablePath] = tableEntry;

        // calc paths to delete
        const paths: Path[][] = [];
        affectedCells.forEach((cur) => {
          const curCell = cur as TTableCellElement;
          const { col: curColIndex, row: curRowIndex } = getCellIndices(
            editor,
            curCell
          );

          if (
            !squizeColSpanCells.includes(curCell) &&
            curColIndex >= deletingColIndex &&
            curColIndex <= endingColIndex
          ) {
            const cellPath = getCellPath(
              editor,
              tableEntry,
              curRowIndex,
              curColIndex
            );

            if (!paths[curRowIndex]) {
              paths[curRowIndex] = [];
            }

            paths[curRowIndex].push(cellPath);
          }
        });

        paths.forEach((cellPaths) => {
          const pathToDelete = cellPaths[0];
          cellPaths.forEach(() => {
            tx.nodes.remove({ at: pathToDelete });
          });
        });

        const { colSizes } = tableNode;

        if (colSizes) {
          const newColSizes = [...colSizes];
          newColSizes.splice(deletingColIndex, colsDeleteNumber);

          tx.nodes.set<TTableElement>(
            { colSizes: newColSizes },
            { at: tablePath }
          );
        }
      }
    };

    const deleteColumnWhenExpanded = (tableEntry: NodeEntry<TTableElement>) => {
      const selection = tx.selection();

      if (!selection) return;

      const [start, end] = RangeApi.edges(selection);
      const firstRow = NodeApi.child(tableEntry[0], 0) as TTableRowElement;
      const lastRow = NodeApi.child(
        tableEntry[0],
        tableEntry[0].children.length - 1
      ) as TTableRowElement;

      const firstSelectionRow = tx.nodes.above({
        at: start,
        match: { type: editor.getType(KEYS.tr) },
      });

      const lastSelectionRow = tx.nodes.above({
        at: end,
        match: { type: editor.getType(KEYS.tr) },
      });

      if (!firstSelectionRow || !lastSelectionRow) return;
      if (
        firstRow.id === firstSelectionRow[0].id &&
        lastSelectionRow[0].id === lastRow.id
      ) {
        const cells = getTableGridAbove(editor, {
          format: 'cell',
        }) as NodeEntry<TTableCellElement>[];
        const allCells = tx.nodes.toArray<TTableCellElement>({
          at: tableEntry[1],
          match: { type: getCellTypes(editor) },
        });

        if (cells.length === allCells.length) {
          tx.nodes.remove({ at: tableEntry[1] });
          return;
        }

        deleteSelection(cells);
      }
    };

    const deleteSelection = (cells: NodeEntry<TTableCellElement>[]) => {
      const pathAnchors: Anchor<Path>[] = [];
      const columnIndices = cells.map(([, path]) => path.at(-1)!);
      const firstColumnIndex = Math.min(...columnIndices);
      const lastColumnIndex = Math.max(...columnIndices);
      const targetColumnIndex =
        firstColumnIndex > 0 ? firstColumnIndex - 1 : lastColumnIndex + 1;
      const firstRowPath = cells[0]![1].slice(0, -1);
      const lastRowPath = cells.at(-1)![1].slice(0, -1);
      const anchorPoint = tx.points.end(firstRowPath.concat(targetColumnIndex));
      const focusPoint = tx.points.end(lastRowPath.concat(targetColumnIndex));
      const selectionAnchor =
        anchorPoint && focusPoint
          ? editor.anchor(
              { anchor: anchorPoint, focus: focusPoint },
              { association: 'inward', deletion: 'nearest' }
            )
          : null;

      cells.forEach(([_cell, cellPath]) => {
        pathAnchors.push(
          editor.anchor(cellPath, {
            association: 'forward',
            deletion: 'drop',
          })
        );
      });

      pathAnchors.forEach((pathAnchor) => {
        const path = pathAnchor.release();

        if (path) tx.nodes.remove({ at: path });
      });

      const selection = selectionAnchor?.release();

      if (selection) tx.selection.set(selection);
    };

    const deleteTableMergeRow = () => {
      const type = editor.getType(KEYS.table);

      if (
        tx.nodes.some({
          match: { type },
        })
      ) {
        const currentTableItem = tx.nodes.above<TTableElement>({
          match: { type },
        });

        if (!currentTableItem) return;
        if (tx.selection.isExpanded())
          return deleteRowWhenExpanded(currentTableItem);

        const table = currentTableItem[0] as TTableElement;

        const selectedCellEntry = tx.nodes.above({
          match: { type: getCellTypes(editor) },
        });

        if (!selectedCellEntry) return;

        const selectedCell = selectedCellEntry[0] as TTableCellElement;
        const { row: deletingRowIndex } = getCellIndices(editor, selectedCell);
        const rowsDeleteNumber = getRowSpan(selectedCell);
        const endingRowIndex = deletingRowIndex + rowsDeleteNumber - 1;

        const colNumber = getTableColumnCount(table);
        const affectedCellsSet = new Set();
        // iterating by columns is important here to keep the order of affected cells
        for (const cI of Array.from({ length: colNumber }, (_, i) => i)) {
          for (const rI of Array.from(
            { length: rowsDeleteNumber },
            (_, i) => i
          )) {
            const rowIndex = deletingRowIndex + rI;
            const found = findCellByIndexes(editor, table, rowIndex, cI);
            affectedCellsSet.add(found);
          }
        }
        const affectedCells = Array.from(
          affectedCellsSet
        ) as TTableCellElement[];

        const { moveToNextRowCells, squizeRowSpanCells } =
          affectedCells.reduce<{
            moveToNextRowCells: TTableCellElement[];
            squizeRowSpanCells: TTableCellElement[];
          }>(
            (acc, cur) => {
              if (!cur) return acc;

              const currentCell = cur as TTableCellElement;
              const { row: curRowIndex } = getCellIndices(editor, currentCell);
              const curRowSpan = getRowSpan(currentCell);

              // if (!curRowIndex || !curRowSpan) return acc;

              if (curRowIndex < deletingRowIndex && curRowSpan > 1) {
                acc.squizeRowSpanCells.push(currentCell);
              } else if (
                curRowSpan > 1 &&
                curRowIndex + curRowSpan - 1 > endingRowIndex
              ) {
                acc.moveToNextRowCells.push(currentCell);
              }

              return acc;
            },
            { moveToNextRowCells: [], squizeRowSpanCells: [] }
          );

        const nextRowIndex = deletingRowIndex + rowsDeleteNumber;
        const nextRow = table.children[nextRowIndex] as
          | TTableCellElement
          | undefined;

        if (nextRow === undefined && deletingRowIndex === 0) {
          deleteTable();

          return;
        }
        if (nextRow) {
          for (let index = 0; index < moveToNextRowCells.length; index++) {
            const curRowCell = moveToNextRowCells[index] as TTableCellElement;
            const { col: curRowCellColIndex, row: curRowCellRowIndex } =
              getCellIndices(editor, curRowCell);
            const curRowCellRowSpan = getRowSpan(curRowCell);

            // search for anchor cell where to place current cell
            const startingCellIndex = nextRow.children.findIndex((curC) => {
              const cell = curC as TTableCellElement;
              const { col: curColIndex } = getCellIndices(editor, cell);

              return curColIndex >= curRowCellColIndex;
            });

            if (startingCellIndex === -1) {
              const startingCell = nextRow.children.at(-1) as TTableCellElement;
              const startingCellPath = tx.nodes.path(startingCell);

              if (!startingCellPath) continue;

              const tablePath = startingCellPath.slice(0, -2);
              const colPath = startingCellPath.at(-1)! + index + 1;
              const nextRowStartCellPath = [
                ...tablePath,
                nextRowIndex,
                colPath,
              ];

              const rowsNumberAffected =
                endingRowIndex - curRowCellRowIndex + 1;
              const rowSpan = curRowCellRowSpan - rowsNumberAffected;
              const newCell = cloneDeep({ ...curRowCell, rowSpan });

              if (newCell.attributes?.rowspan) {
                newCell.attributes.rowspan = rowSpan.toString();
              }

              tx.nodes.insert(newCell, {
                at: nextRowStartCellPath,
              });

              continue;
            }

            const startingCell = nextRow.children[
              startingCellIndex
            ] as TTableCellElement;
            const { col: startingColIndex } = getCellIndices(
              editor,
              startingCell
            );

            // consider already inserted cell by adding index each time to the col path
            let incrementBy = index;

            if (startingColIndex < curRowCellColIndex) {
              // place current cell after starting cell, if placing cell col index is grather than col index of starting cell
              incrementBy += 1;
            }

            const startingCellPath = tx.nodes.path(startingCell);

            if (!startingCellPath) continue;

            const tablePath = startingCellPath.slice(0, -2);
            const colPath = startingCellPath.at(-1)!;

            const nextRowStartCellPath = [
              ...tablePath,
              nextRowIndex,
              colPath + incrementBy,
            ];

            const rowsNumberAffected = endingRowIndex - curRowCellRowIndex + 1;
            const rowSpan = curRowCellRowSpan - rowsNumberAffected;
            const newCell = cloneDeep({ ...curRowCell, rowSpan });

            if (newCell.attributes?.rowspan) {
              newCell.attributes.rowspan = rowSpan.toString();
            }

            tx.nodes.insert(newCell, {
              at: nextRowStartCellPath,
            });
          }
        }

        squizeRowSpanCells.forEach((cur) => {
          const curRowCell = cur as TTableCellElement;
          const { row: curRowCellRowIndex } = getCellIndices(
            editor,
            curRowCell
          );
          const curRowCellRowSpan = getRowSpan(curRowCell);

          const curCellPath = tx.nodes.path(curRowCell);

          if (!curCellPath) return;

          const curCellEndingRowIndex = Math.min(
            curRowCellRowIndex + curRowCellRowSpan - 1,
            endingRowIndex
          );
          const rowsNumberAffected =
            curCellEndingRowIndex - deletingRowIndex + 1;
          const rowSpan = curRowCellRowSpan - rowsNumberAffected;
          const newCell = cloneDeep({ ...curRowCell, rowSpan });

          if (newCell.attributes?.rowspan) {
            newCell.attributes.rowspan = rowSpan.toString();
          }

          tx.nodes.set<TTableCellElement>(newCell, { at: curCellPath });
        });

        const rowToDelete = table.children[
          deletingRowIndex
        ] as TTableRowElement;
        const rowPath = tx.nodes.path(rowToDelete);

        if (!rowPath) return;

        Array.from({ length: rowsDeleteNumber }).forEach(() => {
          tx.nodes.remove({ at: rowPath });
        });
      }
    };

    const deleteRowWhenExpanded = ([
      table,
      tablePath,
    ]: NodeEntry<TTableElement>) => {
      const columnCount = getTableMergedColumnCount(table);

      const cells = getTableGridAbove(editor, {
        format: 'cell',
      }) as NodeEntry<TTableCellElement>[];

      const firsRowIndex = getCellRowIndexByPath(cells[0][1]);

      if (firsRowIndex === null) return;

      let acrossColumn = 0;
      let lastRowIndex = -1;
      let rowSpanCarry = 0;
      let acrossRow = 0;

      cells.forEach(([cell, cellPath]) => {
        if (cellPath.at(-2) === firsRowIndex) {
          acrossColumn += cell.colSpan ?? 1;
        }

        const currentRowIndex = getCellRowIndexByPath(cellPath);

        if (lastRowIndex !== currentRowIndex) {
          if (rowSpanCarry !== 0) {
            rowSpanCarry--;

            return;
          }

          const rowSpan = getRowSpan(cell);

          rowSpanCarry = rowSpan && rowSpan > 1 ? rowSpan - 1 : 0;
          acrossRow += rowSpan ?? 1;
        }

        lastRowIndex = currentRowIndex;
      });

      if (acrossColumn === columnCount) {
        const pathAnchors: Anchor<Path>[] = [];
        const targetRowIndex =
          firsRowIndex + acrossRow < table.children.length
            ? firsRowIndex + acrossRow
            : firsRowIndex - 1;
        const targetPoint =
          targetRowIndex >= 0
            ? tx.points.start(tablePath.concat(targetRowIndex, 0))
            : undefined;
        const targetAnchor = targetPoint
          ? editor.anchor(targetPoint, {
              association: 'forward',
              deletion: 'nearest',
            })
          : null;

        for (let i = firsRowIndex; i < firsRowIndex + acrossRow; i++) {
          const removedPath = tablePath.concat(i);
          pathAnchors.push(
            editor.anchor(removedPath, {
              association: 'forward',
              deletion: 'drop',
            })
          );
        }

        pathAnchors.forEach((pathAnchor) => {
          const path = pathAnchor.release();

          if (path) tx.nodes.remove({ at: path });
        });

        const point = targetAnchor?.release();

        if (point) tx.selection.set(point);
      }
    };

    const deleteTable = () => {
      const tableItem = tx.nodes.above({
        match: { type: editor.getType(KEYS.table) },
      });

      if (tableItem) {
        tx.nodes.remove({ at: tableItem[1] });
      }
    };

    return {
      removeColumn: (): void => {
        const { getOptions, type } = getEditorPlugin<TableConfig>(editor, {
          key: KEYS.table,
        });
        const { disableMerge } = getOptions();

        const tableEntry = tx.nodes.above<TTableElement>({
          match: { type },
        });

        if (!tableEntry) return;

        const hasSpans = tableEntry[0].children.some((row) =>
          (row.children as TTableCellElement[]).some(
            (cell) => getColSpan(cell) > 1 || getRowSpan(cell) > 1
          )
        );

        if (!disableMerge || hasSpans) {
          deleteTableMergeColumn();

          return;
        }
        if (tx.selection.isExpanded()) {
          deleteColumnWhenExpanded(tableEntry);

          return;
        }

        const tdEntry = tx.nodes.above({
          match: { type: getCellTypes(editor) },
        });
        const trEntry = tx.nodes.above<TTableRowElement>({
          match: { type: editor.getType(KEYS.tr) },
        });

        if (tdEntry && trEntry && getTableColumnCount(tableEntry[0]) <= 1) {
          tx.nodes.remove({ at: tableEntry[1] });

          return;
        }

        if (
          tdEntry &&
          trEntry &&
          tableEntry &&
          // Cannot delete the last cell
          trEntry[0].children.length > 1
        ) {
          const [tableNode, tablePath] = tableEntry;

          const tdPath = tdEntry[1];
          const colIndex = tdPath.at(-1)!;

          const pathToDelete = tdPath.slice();
          const replacePathPos = pathToDelete.length - 2;

          tableNode.children.forEach((row, rowIdx) => {
            const rowElement = row as TTableRowElement;

            pathToDelete[replacePathPos] = rowIdx;

            // for tables containing rows of different lengths
            // - don't delete if only one cell in row
            // - don't delete if row doesn't have this cell
            if (
              rowElement.children.length === 1 ||
              colIndex > rowElement.children.length - 1
            )
              return;

            tx.nodes.remove({ at: pathToDelete });
          });

          const { colSizes } = tableNode;

          if (colSizes) {
            const newColSizes = [...colSizes];
            newColSizes.splice(colIndex, 1);

            tx.nodes.set<TTableElement>(
              { colSizes: newColSizes },
              { at: tablePath }
            );
          }
        }
      },

      removeRow: (): void => {
        const { getOptions, type } = getEditorPlugin<TableConfig>(editor, {
          key: KEYS.table,
        });
        const { disableMerge } = getOptions();

        if (!disableMerge) {
          deleteTableMergeRow();

          return;
        }
        if (
          tx.nodes.some({
            match: { type },
          })
        ) {
          const currentTableItem = tx.nodes.above<TTableElement>({
            match: { type },
          });

          if (!currentTableItem) return;
          if (tx.selection.isExpanded()) {
            deleteRowWhenExpanded(currentTableItem);

            return;
          }

          const currentRowItem = tx.nodes.above({
            match: { type: editor.getType(KEYS.tr) },
          });

          if (
            currentRowItem &&
            currentTableItem &&
            // Cannot delete the last row
            currentTableItem[0].children.length > 1
          ) {
            tx.nodes.remove({ at: currentRowItem[1] });
          }
        }
      },

      remove: deleteTable,
    };
  })
  .extendTx<
    Omit<
      TablePluginContract['tx']['table'],
      | 'insert'
      | 'insertColumn'
      | 'insertRow'
      | 'remove'
      | 'removeColumn'
      | 'removeRow'
    >
  >(({ editor }) => (tx) => {
    const moveSelectionFromCell = ({
      at,
      edge,
      fromOneCell,
      reverse,
    }: {
      at?: Location;
      /** Expand cell selection to an edge. */
      edge?: 'bottom' | 'left' | 'right' | 'top';
      /** Move selection from one selected cell */
      fromOneCell?: boolean;
      /** False: move selection to cell below true: move selection to cell above */
      reverse?: boolean;
    } = {}) => {
      if (edge) {
        const cellEntries = getTableGridAbove(editor, { at, format: 'cell' });

        const minCell = fromOneCell ? 0 : 1;

        if (cellEntries.length > minCell) {
          const [, firstCellPath] = cellEntries[0];
          const [, lastCellPath] = cellEntries.at(-1)!;

          const anchorPath = [...firstCellPath];
          const focusPath = [...lastCellPath];

          switch (edge) {
            case 'bottom': {
              focusPath[focusPath.length - 2] += 1;

              break;
            }
            case 'left': {
              anchorPath[anchorPath.length - 1] -= 1;

              break;
            }
            case 'right': {
              focusPath[focusPath.length - 1] += 1;

              break;
            }
            case 'top': {
              anchorPath[anchorPath.length - 2] -= 1;

              break;
            }
            // No default
          }

          if (
            NodeApi.has(editor, anchorPath) &&
            NodeApi.has(editor, focusPath)
          ) {
            const anchor = editor.read.points.start(anchorPath);
            const focus = editor.read.points.start(focusPath);

            if (anchor && focus) {
              const range = { anchor, focus };

              tx.selection.set(
                createTableCellSelection(editor, range) ?? range
              );
            }
          }

          return true;
        }

        return;
      }

      const cellEntry = editor.read.nodes.block({
        at,
        match: { type: getCellTypes(editor) },
      });

      if (cellEntry) {
        const [, cellPath] = cellEntry;

        const nextCellPath = [...cellPath];

        const offset = reverse ? -1 : 1;

        nextCellPath[nextCellPath.length - 2] += offset;

        if (NodeApi.has(editor, nextCellPath)) {
          const point = editor.read.points.start(nextCellPath);

          if (point) tx.selection.set(point);
        } else {
          const tablePath = cellPath.slice(0, -2);
          const point = reverse
            ? editor.read.points.before(tablePath)
            : editor.read.points.after(tablePath);

          if (point) tx.selection.set({ anchor: point, focus: point });
        }

        return true;
      }
    };

    const setBorderSizes = (options: readonly SetBorderSizeOptions[]) => {
      const updates = new Map<
        string,
        { borders: TTableCellElement['borders']; path: Path }
      >();
      const addBorder = (
        [node, path]: NodeEntry<TTableCellElement>,
        direction: BorderDirection,
        size: number
      ) => {
        const key = path.join(',');
        const current = updates.get(key);

        updates.set(key, {
          borders: {
            ...(current?.borders ?? node.borders),
            [direction]: { size },
          },
          path,
        });
      };

      options.forEach(({ at, border = 'all', size }) => {
        const cellEntry = editor.read.nodes.find<TTableCellElement>({
          at,
          match: { type: getCellTypes(editor) },
        });

        if (!cellEntry) return;

        const [, cellPath] = cellEntry;
        const cellIndex = cellPath.at(-1);
        const rowIndex = cellPath.at(-2);
        const addDirection = (direction: BorderDirection) => {
          if (direction === 'top') {
            if (rowIndex === 0) return addBorder(cellEntry, 'top', size);

            const cellAbove = getTopTableCell(editor, { at: cellPath });

            if (cellAbove) addBorder(cellAbove, 'bottom', size);
            return;
          }
          if (direction === 'left') {
            if (cellIndex === 0) return addBorder(cellEntry, 'left', size);

            const cellLeft = getLeftTableCell(editor, { at: cellPath });

            if (cellLeft) addBorder(cellLeft, 'right', size);
            return;
          }

          addBorder(cellEntry, direction, size);
        };

        (border === 'all'
          ? (['top', 'bottom', 'left', 'right'] as const)
          : [border]
        ).forEach(addDirection);
      });

      updates.forEach(({ borders, path }) => {
        tx.nodes.set<TTableCellElement>({ borders }, { at: path });
      });
    };

    const setBorderSize = (
      size: number,
      {
        at,
        border = 'all',
      }: {
        at?: Path;
        border?: BorderDirection | 'all';
      } = {}
    ) => setBorderSizes([{ at, border, size }]);

    const setCellBackground = (options: {
      color: string | null;
      selectedCells?: Element[];
    }) => {
      const { color, selectedCells } = options;

      const hasSelectedCells = selectedCells && selectedCells.length > 0;

      if (hasSelectedCells) {
        selectedCells.forEach((cell) => {
          const cellPath = tx.nodes.path(cell);

          if (cellPath) {
            tx.nodes.set<TTableCellElement>(
              { background: color },
              { at: cellPath }
            );
          }
        });

        return;
      }

      const currentCell = tx.nodes.find<TTableCellElement>({
        match: { type: getCellTypes(editor) },
      });

      if (currentCell) {
        tx.nodes.set<TTableCellElement>(
          { background: color },
          { at: currentCell[1] }
        );
      }
    };

    const setTableColSize = (
      { colIndex, width }: { colIndex: number; width: number },
      options: TableFindOptions = {}
    ) => {
      const table = editor.read.nodes.find<TTableElement>({
        match: { type: editor.getType(KEYS.table) },
        ...options,
      });

      if (!table) return;

      const [tableNode, tablePath] = table;

      const colSizes = tableNode.colSizes
        ? [...tableNode.colSizes]
        : Array.from({ length: getTableColumnCount(tableNode) }).fill(0);

      colSizes[colIndex] = width;

      tx.nodes.set<TTableElement>({ colSizes }, { at: tablePath });
    };

    const setTableMarginLeft = (
      { marginLeft }: { marginLeft: number },
      options: TableFindOptions = {}
    ) => {
      const table = editor.read.nodes.find<TTableElement>({
        match: { type: editor.getType(KEYS.table) },
        ...options,
      });

      if (!table) return;

      const [, tablePath] = table;

      tx.nodes.set<TTableElement>({ marginLeft }, { at: tablePath });
    };

    const setTableRowSize = (
      { height, rowIndex }: { height: number; rowIndex: number },
      options: TableFindOptions = {}
    ) => {
      const table = editor.read.nodes.find<TTableElement>({
        match: { type: editor.getType(KEYS.table) },
        ...options,
      });

      if (!table) return;

      const [, tablePath] = table;
      const tableRowPath = [...tablePath, rowIndex];

      tx.nodes.set<TTableRowElement>(
        { size: height },
        {
          at: tableRowPath,
        }
      );
    };

    const selectAllTable = () => {
      const type = editor.getType(KEYS.table);
      const table = editor.read.nodes.above({ match: { type } });

      if (!table) return false;

      const [, tablePath] = table;
      const tableRange = editor.read.ranges.get(tablePath);
      const selection = editor.read.selection();

      if (tableRange && selection && RangeApi.equals(selection, tableRange)) {
        const documentRange = editor.read.ranges.get([]);

        if (documentRange) tx.selection.set(documentRange);

        return true;
      }

      if (tableRange) {
        tx.selection.set(
          createTableCellSelection(editor, tableRange) ?? tableRange
        );
      }

      return true;
    };

    const tabTable = ({ reverse = false }: { reverse?: boolean } = {}) => {
      const selection = editor.read.selection();

      if (selection && editor.read.selection.isExpanded()) {
        const cells = editor.read.nodes.toArray({
          at: selection,
          match: { type: getCellTypes(editor) },
        });

        if (cells.length > 1) {
          tx.selection.collapse({ edge: 'end' });
          return true;
        }
      }

      const entries = getTableEntries(editor);

      if (!entries) return false;

      const { cell, row } = entries;
      const [, cellPath] = cell;
      const target = reverse
        ? getPreviousTableCell(editor, cell, cellPath, row)
        : getNextTableCell(editor, cell, cellPath, row);

      if (target) tx.selection.set(target[1]);

      return true;
    };

    const mergeTableCells = (): void => {
      const cellEntries = getTableGridAbove(editor, {
        format: 'cell',
      }) as NodeEntry<TTableCellElement>[];

      if (cellEntries.length < 2) return;

      // calculate the colSpan which is the number of horizontal cells that a cell should span.
      let colSpan = 0;

      for (const entry of cellEntries) {
        const [cell, path] = entry;

        const rowIndex = path.at(-2)!;

        // count only those cells that are in the first selected row.
        if (rowIndex === cellEntries[0][1].at(-2)!) {
          const cellColSpan = getColSpan(cell);
          colSpan += cellColSpan;
        }
      }

      // calculate the rowSpan which is the number of vertical cells that a cell should span.
      let rowSpan = 0;
      const { col } = getCellIndices(editor, cellEntries[0][0]);
      cellEntries.forEach((entry) => {
        const cell = entry[0];
        const { col: curCol } = getCellIndices(editor, cell);

        if (col === curCol) {
          rowSpan += getRowSpan(cell);
        }
      });

      // This will store the content of all cells we are merging
      const mergingCellChildren: Descendant[] = [];

      for (const cellEntry of cellEntries) {
        const [el] = cellEntry;

        const cellChildren = el.children;

        if (
          cellChildren.length !== 1 ||
          !ElementApi.isElement(cellChildren[0]) ||
          !tx.nodes.isEmpty(cellChildren[0])
        ) {
          mergingCellChildren.push(...cloneDeep(cellChildren));
        }
      }

      // Create a new cell to replace the merged cells, with
      // calculated colSpan and rowSpan attributes and combined content
      const mergedCell = {
        ...getEmptyCellNode(editor, {
          children: mergingCellChildren,
          header: cellEntries[0][0].type === editor.getType(KEYS.th),
        }),
        colSpan,
        rowSpan,
      };

      const firstCellPath = cellEntries[0][1];
      const tablePath = firstCellPath.slice(0, -2);
      const table = tx.nodes.get(tablePath)?.[0];

      if (!table || !ElementApi.isElement(table)) return;

      const selectedCellsByRow = new Map<number, Set<number>>();

      for (const [, path] of cellEntries) {
        const rowIndex = path.at(-2)!;
        const selectedCells = selectedCellsByRow.get(rowIndex) ?? new Set();

        selectedCells.add(path.at(-1)!);
        selectedCellsByRow.set(rowIndex, selectedCells);
      }

      const firstRowIndex = firstCellPath.at(-2)!;
      const firstCellIndex = firstCellPath.at(-1)!;

      for (const [rowIndex, selectedCells] of [...selectedCellsByRow].sort(
        ([left], [right]) => right - left
      )) {
        const row = table.children[rowIndex] as TTableRowElement | undefined;

        if (!row) continue;

        const children = row.children.filter(
          (_, cellIndex) => !selectedCells.has(cellIndex)
        );
        const rowPath = [...tablePath, rowIndex];

        if (rowIndex === firstRowIndex) {
          const insertionIndex = row.children
            .slice(0, firstCellIndex)
            .filter((_, cellIndex) => !selectedCells.has(cellIndex)).length;

          children.splice(insertionIndex, 0, mergedCell);
          tx.nodes.replaceChildren(children, { at: rowPath });
        } else {
          tx.nodes.replaceChildren(children, { at: rowPath });
        }
      }

      const point = tx.points.end(firstCellPath);

      if (point) tx.selection.set(point);
    };

    const splitTableCell = (): void => {
      const tableRowType = editor.getType(KEYS.tr);

      const cellEntries = getTableGridAbove(editor, { format: 'cell' });
      const firstCell = cellEntries[0];

      if (!firstCell) return;

      const [cellElem, path] = firstCell;

      // creating new object per iteration is essential here
      const createEmptyCell = (children?: Descendant[]) => ({
        ...getEmptyCellNode(editor, {
          children,
          header: cellElem.type === editor.getType(KEYS.th),
        }),
        colSpan: 1,
        rowSpan: 1,
      });

      const tablePath = path.slice(0, -2);

      const cellPath = path.slice(-2);
      const [rowPath, colPath] = cellPath;
      const colSpan = getColSpan(cellElem);
      const rowSpan = getRowSpan(cellElem);

      // Generate an array of column paths from the colspan
      const colPaths: number[] = [];

      for (let i = 0; i < colSpan; i++) {
        colPaths.push(colPath + i);
      }

      const { col } = getCellIndices(editor, cellElem);

      // Remove the original merged cell from the editor
      tx.nodes.remove({ at: path });

      const getClosestColPathForRow = (row: number, targetCol: number) => {
        const rowEntry = tx.nodes.get<TTableRowElement>([...tablePath, row]);

        if (!rowEntry || rowEntry[0].type !== tableRowType) {
          return 0;
        }

        const rowEl = rowEntry[0];
        let closestColPath: Path = [];
        let smallestDiff = Number.POSITIVE_INFINITY;
        let isDirectionLeft = false;

        rowEl.children.forEach((cell) => {
          const cellElement = cell as TTableCellElement;
          const { col: cellCol } = getCellIndices(editor, cellElement);

          const diff = Math.abs(cellCol - targetCol);

          if (diff < smallestDiff) {
            const cellPath = tx.nodes.path(cellElement);

            if (!cellPath) return;

            smallestDiff = diff;
            closestColPath = cellPath;
            isDirectionLeft = cellCol < targetCol;
          }
        });

        if (closestColPath.length > 0) {
          const lastIndex = closestColPath.at(-1)!;

          if (isDirectionLeft) {
            return lastIndex + 1;
          }

          return lastIndex;
        }

        return 1;
      };

      // Generate an array of cell paths from the row and col spans and then insert empty cells at those paths
      for (let i = 0; i < rowSpan; i++) {
        const currentRowPath = rowPath + i;
        const pathForNextRows = getClosestColPathForRow(currentRowPath, col);
        const newRowChildren: TTableRowElement[] = [];
        const _rowPath = [...tablePath, currentRowPath];
        const rowEntry = tx.nodes.get<TTableRowElement>(_rowPath);

        for (let j = 0; j < colPaths.length; j++) {
          const cellChildren = cellElem.children;

          const cellToInsert =
            i === 0 && j === 0
              ? createEmptyCell(cellChildren)
              : createEmptyCell();

          // if row exists, insert into it, otherwise insert row
          if (rowEntry) {
            const currentColPath = i === 0 ? colPaths[j] : pathForNextRows;
            const pathForNewCell = [
              ...tablePath,
              currentRowPath,
              currentColPath,
            ];

            tx.nodes.insert(cellToInsert, { at: pathForNewCell });
          } else {
            newRowChildren.push(cellToInsert);
          }
        }

        if (!rowEntry) {
          tx.nodes.insert(
            {
              children: newRowChildren,
              type: editor.getType(KEYS.tr),
            },
            { at: _rowPath }
          );
        }
      }

      const point = tx.points.end(path);

      if (point) tx.selection.set(point);
    };

    return {
      merge: mergeTableCells,
      moveSelection: moveSelectionFromCell,
      selectAll: selectAllTable,
      setBorderSize,
      setBorderSizes,
      setCellBackground,
      setColumnSize: setTableColSize,
      setMarginLeft: setTableMarginLeft,
      setRowSize: setTableRowSize,
      split: splitTableCell,
      tab: tabTable,
    };
  })
  .extendExtension(({ setOption, type: tableType }) => ({
    commands: ({ around }) => [
      around(editorCommands.select, ({ input, state, next }) =>
        next({
          ...input,
          target: RangeApi.isRange(input.target)
            ? clampTableSelection(tableType, input.target, state)
            : input.target,
        })
      ),
      around(editorCommands.setSelection, ({ input, state, next }) => {
        const selection = state.selection();

        if (!selection) return next();

        const nextSelection = { ...selection, ...input.props };
        const clamped = clampTableSelection(tableType, nextSelection, state);

        return next({
          ...input,
          props:
            clamped === nextSelection
              ? input.props
              : { ...input.props, focus: clamped.focus },
        });
      }),
    ],
    onTransactionChange({ after, before, change, changed }) {
      const changedRoots = new Set<string | null>([
        ...(change.primary ? [null] : []),
        ...change.roots.keys(),
        ...change.createRoots,
        ...change.deleteRoots,
      ]);
      const affectsTable = [...changedRoots].some((root) => {
        const namedRoot = root ?? undefined;
        const propertiesChanged = changed.has('properties', namedRoot);
        const structureChanged = changed.has('structure', namedRoot);

        if (!propertiesChanged && !structureChanged) return false;

        const changedPaths = changed.paths(namedRoot);

        if (changedPaths.length === 0) return true;

        return changedPaths.some(
          (path) =>
            pathTouchesSnapshotTable(before, root, tableType, path) ||
            pathTouchesSnapshotTable(after, root, tableType, path)
        );
      });

      if (!affectsTable) return;

      setOption('_cellIndices', {});
    },
  }))
  .extendExtension(({ editor, type }) => ({
    commands: ({ handle }) => [
      handle(editorCommands.delete, ({ input, state }) => {
        const selection = state.selection();

        if (!selection || !state.selection.isCollapsed()) return false;

        const reverse = input.direction === 'forward';
        const cellEntry = state.nodes.block({
          match: { type: getCellTypes(editor) },
        });

        if (cellEntry) {
          const edge = reverse
            ? state.points.end(cellEntry[1])
            : state.points.start(cellEntry[1]);

          return edge && PointApi.equals(selection.anchor, edge)
            ? state.transaction(() => {})
            : false;
        }

        const nextPoint = reverse
          ? state.points.after(selection, { unit: input.unit })
          : state.points.before(selection, { unit: input.unit });

        if (
          nextPoint &&
          state.nodes.block({
            at: nextPoint,
            match: { type: getCellTypes(editor) },
          })
        ) {
          return state.transaction((tx) => {
            tx.selection.move({ reverse: !reverse });
          });
        }

        return false;
      }),
      handle(editorCommands.deleteFragment, ({ input, state }) => {
        const selection =
          input.at === undefined
            ? state.selection()
            : state.ranges.get(input.at);

        if (!selection) return false;

        if (state.selection.isWithinBlock({ at: selection, match: { type } })) {
          const transaction = clearSelectedTableCells(editor, state, selection);

          if (transaction) return transaction;
        }

        return false;
      }),
    ],
  }))
  .extendExtension(({ editor, type }) => ({
    queries: {
      fragment: {
        get({ next }) {
          const fragment = next();
          const nextFragment: Descendant[] = [];

          fragment.forEach((node) => {
            if (!ElementApi.isElement(node) || node.type !== type) {
              nextFragment.push(node);
              return;
            }

            const rows = node.children as TTableRowElement[];
            const rowCount = rows.length;

            if (!rowCount) return;

            const colCount = rows[0].children.length;

            if (rowCount <= 1 && colCount <= 1) {
              const cell = rows[0].children[0] as TTableCellElement;
              nextFragment.push(...cell.children);

              return;
            }

            const [subTable] = getTableGridAbove(editor);

            if (subTable) nextFragment.push(subTable[0]);
          });

          return nextFragment;
        },
      },
    },
  }))
  .extendExtension(({ api, editor, getOptions, type }) => ({
    commands: ({ handle }) => [
      handle(editorCommands.replaceSlice, ({ input, state }) => {
        const { slice } = input;
        const fragment = [...slice.content];
        const insertedTable = fragment.find(
          (node) => ElementApi.isElement(node) && node.type === type
        ) as TTableElement | undefined;
        const selection = state.selection();
        const root = selection?.anchor.root;
        const tableEntry = selection
          ? state.nodes.above<TTableElement>({
              at: selection.anchor,
              match: { type },
            })
          : undefined;

        if (!insertedTable && tableEntry) {
          const cells = getTableGridAbove(editor, { format: 'cell' }, state);

          if (cells.length > 1) {
            const replacements = cells.flatMap(([parent, path]) => {
              const children = state.slice.fitContent(slice, {
                parent,
                ...(root === undefined ? {} : { root }),
              });

              return children === null ? [] : [{ children, path }];
            });

            if (replacements.length !== cells.length) return false;

            return state.transaction((tx) => {
              replacements.forEach(({ children, path }) => {
                tx.nodes.replaceChildren([...children], { at: path });
              });

              const anchor = tx.points.start(cells[0][1]);
              const focus = tx.points.end(cells.at(-1)![1]);

              if (anchor && focus) tx.selection.set({ anchor, focus });
            });
          }
        }

        if (insertedTable && tableEntry) {
          const [cellEntry] = getTableGridAbove(
            editor,
            {
              at: selection?.anchor,
              format: 'cell',
            },
            state
          );

          if (cellEntry) {
            const [table, tablePath] = tableEntry as NodeEntry<TTableElement>;
            const [startCell] = cellEntry as NodeEntry<TTableCellElement>;
            const { col: startColumn, row: startRow } = getCellIndices(
              editor,
              startCell
            );
            const createCell = (row: TTableRowElement) =>
              api.createCell({
                header:
                  row.children.length > 0 &&
                  (row.children as Element[]).every(
                    (cell) => cell.type === editor.getType(KEYS.th)
                  ),
              });
            const source = repairTableGrid(insertedTable, createCell, {
              createRow: () => api.createRow({ colCount: 0 }),
              extendRowSpans: true,
            });
            const target = repairTableGrid(table, createCell);
            const nextTable = target.table;
            const disableExpand = getOptions().disableExpandOnInsert;
            const endRow = disableExpand
              ? Math.min(target.grid.height, startRow + source.grid.height)
              : startRow + source.grid.height;
            const endColumn = disableExpand
              ? Math.min(target.grid.width, startColumn + source.grid.width)
              : startColumn + source.grid.width;

            if (endRow <= startRow || endColumn <= startColumn) {
              return false;
            }

            while (nextTable.children.length < endRow) {
              nextTable.children.push(api.createRow({ colCount: 0 }));
            }

            const anchors: { cell: TTableCellElement; col: number }[][] =
              Array.from({ length: nextTable.children.length }, () => []);
            const occupied: boolean[][] = Array.from(
              { length: nextTable.children.length },
              () => []
            );
            const addCell = (
              cell: TTableCellElement,
              row: number,
              col: number,
              rowSpan = 1,
              colSpan = 1
            ) => {
              anchors[row].push({ cell, col });

              for (let rowOffset = 0; rowOffset < rowSpan; rowOffset++) {
                for (let colOffset = 0; colOffset < colSpan; colOffset++) {
                  occupied[row + rowOffset][col + colOffset] = true;
                }
              }
            };
            const createUnitCell = (row: number, col: number) => {
              const existing = target.grid.cells[row]?.[col];

              if (existing?.row === row && existing.col === col) {
                const cell = cloneDeep(existing.cell);

                setSpan(cell, 'rowSpan', 1);
                setSpan(cell, 'colSpan', 1);

                return cell;
              }

              return createCell(nextTable.children[row] as TTableRowElement);
            };

            target.grid.rows.flat().forEach((gridCell) => {
              if (
                !(
                  gridCell.row < endRow &&
                  gridCell.row + gridCell.rowSpan > startRow &&
                  gridCell.col < endColumn &&
                  gridCell.col + gridCell.colSpan > startColumn
                )
              ) {
                addCell(
                  gridCell.cell,
                  gridCell.row,
                  gridCell.col,
                  gridCell.rowSpan,
                  gridCell.colSpan
                );
                return;
              }

              for (
                let row = gridCell.row;
                row < gridCell.row + gridCell.rowSpan;
                row++
              ) {
                for (
                  let col = gridCell.col;
                  col < gridCell.col + gridCell.colSpan;
                  col++
                ) {
                  if (
                    !(
                      row >= startRow &&
                      row < endRow &&
                      col >= startColumn &&
                      col < endColumn
                    )
                  ) {
                    addCell(createUnitCell(row, col), row, col);
                  }
                }
              }
            });

            for (const gridCell of source.grid.rows.flat()) {
              const row = startRow + gridCell.row;
              const col = startColumn + gridCell.col;

              if (row >= endRow || col >= endColumn) continue;

              const rowSpan = Math.min(gridCell.rowSpan, endRow - row);
              const colSpan = Math.min(gridCell.colSpan, endColumn - col);
              const cell = createUnitCell(row, col);
              const children = state.slice.fitContent(
                ContentSlice.closed(gridCell.cell.children),
                {
                  parent: cell,
                  ...(root === undefined ? {} : { root }),
                }
              );

              if (children === null) return false;

              cell.children = [...children];
              setSpan(cell, 'rowSpan', rowSpan);
              setSpan(cell, 'colSpan', colSpan);
              addCell(cell, row, col, rowSpan, colSpan);
            }

            for (let row = 0; row < nextTable.children.length; row++) {
              for (
                let col = 0;
                col < Math.max(target.grid.width, endColumn);
                col++
              ) {
                if (!occupied[row][col]) {
                  addCell(createUnitCell(row, col), row, col);
                }
              }

              (nextTable.children[row] as TTableRowElement).children = anchors[
                row
              ]
                .sort((a, b) => a.col - b.col)
                .map(({ cell }) => cell);
            }

            const resultGrid = getTableGrid(nextTable);
            const firstCell = resultGrid.cells[startRow]?.[startColumn];
            const lastCell = resultGrid.cells[endRow - 1]?.[endColumn - 1];

            if (!firstCell || !lastCell) {
              return false;
            }

            return state.transaction((tx) => {
              tx.nodes.replace(nextTable, { at: tablePath });

              const anchor = tx.points.start([
                ...tablePath,
                firstCell.row,
                firstCell.cellIndex,
              ]);
              const focus = tx.points.end([
                ...tablePath,
                lastCell.row,
                lastCell.cellIndex,
              ]);

              if (anchor && focus) tx.selection.set({ anchor, focus });
            });
          }
        }

        return false;
      }),
    ],
  }))
  .extendExtension(({ editor }) => ({
    commands: ({ around }) => [
      around(editorCommands.insertText, ({ state, next }) => {
        const selection = state.selection();

        if (!selection || !state.selection.isExpanded()) return next();
        if (
          !state.nodes.above({
            at: selection.anchor,
            match: { type: editor.getType(KEYS.table) },
          })
        ) {
          return next();
        }

        const edges = state.ranges.edges(selection);

        if (!edges) return next();

        const cellTypes = getCellTypes(editor);
        const start = state.nodes.above({
          at: edges[0],
          match: { type: cellTypes },
        });
        const end = state.nodes.above({
          at: edges[1],
          match: { type: cellTypes },
        });

        if (!start || !end || PathApi.equals(start[1], end[1])) return next();

        const transaction = clearSelectedTableCells(editor, state, selection, {
          collapse: true,
        });

        return transaction ? next.after(transaction) : next();
      }),
    ],
  }))
  .extendExtension(({ api, editor, getOption, getOptions, type }) => ({
    corrections: [
      {
        event: 'content',
        correct({ entry, tx }) {
          const [node, path] = entry;

          if (!ElementApi.isElement(node)) {
            return;
          }

          const { enableUnsetSingleColSize, initialTableWidth } = getOptions();

          if (node.type === type) {
            const table = node as TTableElement;

            const repaired = repairTableGrid(table, (row) =>
              api.createCell({
                header:
                  row.children.length > 0 &&
                  (row.children as TTableCellElement[]).every(
                    (cell) => cell.type === editor.getType(KEYS.th)
                  ),
              })
            );

            if (repaired.changed) {
              tx.nodes.replace(repaired.table, { at: path });
              return;
            }

            if (
              table.colSizes?.length &&
              enableUnsetSingleColSize &&
              getTableColumnCount(table) < 2
            ) {
              tx.nodes.unset('colSizes', { at: path });
              return;
            }

            if (initialTableWidth) {
              const colCount = (
                table.children[0] as TTableRowElement | undefined
              )?.children.length;

              if (colCount) {
                const fallbackSize = initialTableWidth / colCount;
                const colSizes = table.colSizes
                  ? table.colSizes.map((size) => size || fallbackSize)
                  : Array.from({ length: colCount }, () => fallbackSize);

                if (!table.colSizes || table.colSizes.some((size) => !size)) {
                  tx.nodes.set<TTableElement>({ colSizes }, { at: path });
                  return;
                }
              }
            }
          }

          if (getCellTypes(editor).includes(node.type)) {
            const cell = node as TTableCellElement;
            const cellIndices = cell.id
              ? getOption('cellIndices', cell.id)
              : undefined;

            if (cell.id && !cellIndices) {
              const table = tx.nodes.above<TTableElement>({
                at: path,
                match: { type },
              })?.[0];

              if (table) {
                computeCellIndices(editor, {
                  all: true,
                  cellNode: cell,
                  tableNode: table,
                });
              }
            }
          }
        },
      },
    ],
  }))
  .extendExtension(({ editor }) => ({
    selections: [
      {
        codec: defineValueCodec<TableCellSelection>({
          decode(value) {
            if (!isTableCellSelection(value)) {
              throw new Error('Invalid table-cell selection.');
            }

            return value;
          },
          encode: (selection) => selection,
          version: 1,
        }),
        domRange: (selection) => selection,
        kind: 'table-cell',
        map(selection, context) {
          const range = context.mapRange(selection, {
            association: 'outward',
          });
          const cells = selection.cells.flatMap((cell) => {
            const mapped = context.mapRange(cell, {
              association: 'outward',
            });

            return mapped ? [mapped] : [];
          });

          return range && cells.length > 0
            ? { ...selection, ...range, cells }
            : null;
        },
        ranges: (selection) => selection.cells,
        replacementRange: (selection) => selection,
        validate: isTableCellSelection,
      } satisfies EditorSelectionSpec<TableCellSelection>,
    ],
    commands: ({ around, handle }) => [
      handle(editorCommands.addMark, ({ input, state }) => {
        if (!state.selection() || state.selection.isCollapsed()) return false;

        const cells = getTableGridAbove(editor, { format: 'cell' }, state);

        if (cells.length <= 1) return false;

        return state.transaction((tx) => {
          cells.forEach(([, cellPath]) => {
            tx.nodes.set(
              { [input.key]: input.value },
              { at: cellPath, marks: true }
            );
          });
        });
      }),
      handle(editorCommands.removeMark, ({ input, state }) => {
        if (!state.selection() || state.selection.isCollapsed()) return false;

        const cells = getTableGridAbove(editor, { format: 'cell' }, state);

        if (cells.length <= 1) return false;

        return state.transaction((tx) => {
          cells.forEach(([, cellPath]) => {
            tx.nodes.unset(input.key, {
              at: cellPath,
              match: (node) => TextApi.isText(node),
            });
          });
        });
      }),
      around(editorCommands.setNodes, ({ input, state, next }) => {
        if (input.options?.marks) return next();
        if (!state.selection() || state.selection.isCollapsed()) return next();

        const cells = getTableGridAbove(editor, { format: 'cell' }, state);

        if (cells.length <= 1) return next();

        const cellPaths = cells.map(([, cellPath]) => cellPath);

        if (input.options?.at) {
          const target = input.options.at;
          const range = PathApi.isPath(target)
            ? undefined
            : state.ranges.get(target);
          const targetsSelectedCell = PathApi.isPath(target)
            ? cellPaths.some((cellPath) => PathApi.isCommon(cellPath, target))
            : !!range &&
              cellPaths.some((cellPath) => {
                const cellRange = state.ranges.get(cellPath);

                return (
                  !!cellRange &&
                  (RangeApi.includes(cellRange, range.anchor) ||
                    RangeApi.includes(cellRange, range.focus) ||
                    RangeApi.includes(range, cellRange))
                );
              });

          if (!targetsSelectedCell) return next();
        }

        const optionMatch = input.options?.match;
        const optionAt = input.options?.at;

        return next({
          ...input,
          options: {
            ...input.options,
            match: (node, path) => {
              if (
                !cellPaths.some((cellPath) => PathApi.isCommon(cellPath, path))
              ) {
                return false;
              }

              if (optionMatch) return NodeApi.matches(node, optionMatch, path);
              if (optionAt && PathApi.isPath(optionAt)) {
                return PathApi.equals(path, optionAt);
              }

              return ElementApi.isElement(node) && state.nodes.isBlock(node);
            },
          },
        });
      }),
    ],
    queries: {
      marks: {
        get({ next }) {
          const selection = editor.read.selection();

          if (!selection || editor.read.selection.isCollapsed()) return next();

          const cells = getTableGridAbove(editor, { format: 'cell' });

          if (cells.length <= 1) return next();

          const markCounts: Record<string, number> = {};
          const marks: Record<string, unknown> = {};
          let textCount = 0;

          cells.forEach(([, cellPath]) => {
            editor.read.nodes
              .toArray({ at: cellPath, match: (node) => TextApi.isText(node) })
              .forEach(([text]) => {
                textCount++;

                Object.keys(text).forEach((key) => {
                  if (key === 'text') return;

                  markCounts[key] = (markCounts[key] ?? 0) + 1;
                  marks[key] = text[key];
                });
              });
          });

          Object.keys(markCounts).forEach((key) => {
            if (markCounts[key] !== textCount) delete marks[key];
          });

          return marks;
        },
      },
    },
  }));

export type TableConfig = InferConfig<typeof BaseTablePlugin>;
