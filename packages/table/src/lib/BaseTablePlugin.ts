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
  BaseParagraphPlugin,
  createBasePlugin,
  getPluginTypes,
  type InferConfig,
} from '@platejs/core';
import {
  ContentSlice,
  defineValueCodec,
  type Descendant,
  type EditorAboveOptions,
  editorCommands,
  type EditorSelectionSpec,
  type EditorStateView,
  type Element,
  ElementApi,
  type ElementEntry,
  type Location,
  type Node,
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
} from '@platejs/plite';
import {
  getDOMClipboardFormatKey,
  readDOMFragmentData,
  writeDOMHostFragmentData,
} from '@platejs/plite-dom/internal';
import {
  KEYS,
  type TTableCellBorder,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
} from '@platejs/utils';
import {
  getColSpan,
  getRowSpan,
  getTableCellHtmlCodecProps,
  getTableCellHtmlProps,
  parseTableCellHtml,
} from './internal/codec';
import {
  createDetachedTableContext,
  createTableContext,
} from './internal/context';
import { compileTableGrid, type TableGridAnchor } from './internal/grid';
import {
  applyTableMutationPlan,
  planTableMutation,
  type TableIntent,
} from './internal/mutation';
import {
  applyPreparedTablePastePlan,
  createOrdinaryTablePasteElement,
  getTablePasteElement,
  planPreparedTablePaste,
  prepareTablePaste,
  type TablePasteDiagnostic,
  type TablePasteSource,
} from './internal/paste';
import {
  getTableSelectionBounds,
  getTableSelectionExpansion,
  getTableSelectionNeighbor,
  projectTableSelection,
  readTableSelection,
  type TableSelectionView,
} from './internal/selection';

type GetSelectedCellsBordersOptions = {
  select?: {
    none?: boolean;
    outer?: boolean;
    side?: boolean;
  };
};

type TableRangeFormat = 'all' | 'cell' | 'table';

type GetTableRangeOptions<T extends TableRangeFormat = 'cell' | 'table'> = {
  at: Range;
  format?: T;
};

type TableRangeEntries = {
  cellEntries: ElementEntry[];
  tableEntries: ElementEntry[];
};

type GetTableRangeAboveOptions = EditorAboveOptions<Element> &
  Pick<GetTableRangeOptions, 'format'>;

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
): selection is TableCellSelection => {
  if (
    !SelectionApi.isSelection(selection) ||
    selection.kind !== 'table-cell' ||
    !Object.keys(selection).every((key) =>
      ['anchor', 'cells', 'focus', 'kind'].includes(key)
    ) ||
    !Array.isArray((selection as TableCellSelection).cells) ||
    (selection as TableCellSelection).cells.length === 0 ||
    !(selection as TableCellSelection).cells.every(RangeApi.isRange)
  ) {
    return false;
  }

  const tableSelection = selection as TableCellSelection;
  const root = tableSelection.anchor.root;

  if (tableSelection.focus.root !== root) return false;

  const seen = new Set<string>();

  for (const cell of tableSelection.cells) {
    if (
      cell.anchor.root !== root ||
      cell.focus.root !== root ||
      RangeApi.isBackward(cell)
    ) {
      return false;
    }

    const key = JSON.stringify([
      cell.anchor.path,
      cell.anchor.offset,
      cell.focus.path,
      cell.focus.offset,
    ]);

    if (seen.has(key)) return false;

    seen.add(key);
  }

  return true;
};

const getTableAnchorPoint = (
  view: TableSelectionView,
  anchor: TableGridAnchor,
  edge: 'end' | 'start' = 'start'
) => {
  const [text, path] =
    edge === 'end'
      ? NodeApi.last(anchor.cell, [])
      : NodeApi.first(anchor.cell, []);

  if (!TextApi.isText(text)) return;

  return {
    offset: edge === 'end' ? text.text.length : 0,
    path: view.tablePath.concat(anchor.path, path),
    ...(view.root === undefined ? {} : { root: view.root }),
  };
};

type TablePluginOptions = {
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

type ToggleTableBordersOptions = {
  border: BorderDirection | 'none' | 'outer';
  cells?: TTableCellElement[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isTableCellBorder = (value: unknown): value is TTableCellBorder =>
  isRecord(value) &&
  (!('color' in value) || typeof value.color === 'string') &&
  (!('size' in value) ||
    (typeof value.size === 'number' && Number.isFinite(value.size))) &&
  (!('style' in value) || typeof value.style === 'string');

const tableCellBordersProperty = property.json({
  validate: (value): value is NonNullable<TTableCellElement['borders']> =>
    isRecord(value) &&
    (!('bottom' in value) || isTableCellBorder(value.bottom)) &&
    (!('left' in value) || isTableCellBorder(value.left)) &&
    (!('right' in value) || isTableCellBorder(value.right)) &&
    (!('top' in value) || isTableCellBorder(value.top)),
  validationVersion: 1,
});

const parseHtmlCssNumber = (value: string | null | undefined) => {
  if (!value) return;
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : undefined;
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
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          const size = parseHtmlCssNumber(
            element.style.height || element.getAttribute('height')
          );

          return size === undefined ? {} : { size };
        },
        encode: ({ content, node }) => ({
          children: content,
          style: {
            height: node.size === undefined ? undefined : `${node.size}px`,
          },
          tag: 'tr',
        }),
        match: [{ tag: 'tr' }],
      },
    }),
});

export const BaseTableCellPlugin = createBasePlugin({
  key: KEYS.td,
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: { type: plugins.elementType(BaseParagraphPlugin) },
        min: 1,
      }),
      properties: {
        background: property.string(),
        borders: tableCellBordersProperty,
        colSpan: property.number(),
        rowSpan: property.number(),
        size: property.number(),
      },
      topLevel: false,
    },
  }),
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => parseTableCellHtml(element),
        encode: ({ content, node }) => ({
          ...getTableCellHtmlCodecProps(node),
          children: content,
          tag: 'td',
        }),
        match: [{ tag: 'td' }],
      },
    }),

  render: { nodeProps: ({ element }) => getTableCellHtmlProps(element) },
  rules: {
    merge: { removeEmpty: false },
  },
});

export const BaseTableCellHeaderPlugin = createBasePlugin({
  key: KEYS.th,
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: { type: plugins.elementType(BaseParagraphPlugin) },
        min: 1,
      }),
      properties: {
        background: property.string(),
        borders: tableCellBordersProperty,
        colSpan: property.number(),
        rowSpan: property.number(),
        size: property.number(),
      },
      topLevel: false,
    },
  }),
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => parseTableCellHtml(element),
        encode: ({ content, node }) => ({
          ...getTableCellHtmlCodecProps(node),
          children: content,
          tag: 'th',
        }),
        match: [{ tag: 'th' }],
      },
    }),

  render: { nodeProps: ({ element }) => getTableCellHtmlProps(element) },
  rules: {
    merge: { removeEmpty: false },
  },
});

const defaultPliteFragmentFormat = 'x-plite-fragment';
const csvSpecialCharacterPattern = /[",\r\n]/;
const openingHtmlTagPattern = /<[A-Za-z][^<>]*?>/g;
const pliteFragmentAttributePattern = /\bdata-plite-fragment\s*=/i;
const pliteFragmentFormatPattern =
  /\bdata-plite-fragment-format\s*=\s*(["'])(.*?)\1/i;
const tablePasteSources = new WeakMap<object, TablePasteSource[]>();

const hasEmbeddedPliteFragment = (html: string, format: string) =>
  (html.match(openingHtmlTagPattern) ?? []).some((tag) => {
    if (!pliteFragmentAttributePattern.test(tag)) return false;

    const embeddedFormat = tag.match(pliteFragmentFormatPattern)?.[2];

    return embeddedFormat
      ? embeddedFormat === format
      : format === defaultPliteFragmentFormat;
  });

const escapeCsvField = (value: string) =>
  csvSpecialCharacterPattern.test(value)
    ? `"${value.replaceAll('"', '""')}"`
    : value;

const withTablePasteSource = <T>(
  editor: object,
  source: TablePasteSource,
  run: () => T
): T => {
  const stack = tablePasteSources.get(editor) ?? [];

  stack.push(source);
  tablePasteSources.set(editor, stack);

  try {
    return run();
  } finally {
    stack.pop();

    if (stack.length === 0) tablePasteSources.delete(editor);
  }
};

/** Enables support for tables. */
export const BaseTablePlugin = createBasePlugin({
  api: ({ editor }) => ({
    createCell: ({
      children,
      header,
      row,
    }: CreateCellOptions = {}): TTableCellElement => {
      const isHeader =
        header ??
        (row
          ? (row as Element).children.every(
              (cell) => cell.type === editor.getType(KEYS.th)
            )
          : false);

      return {
        children: children ?? [
          { children: [{ text: '' }], type: editor.getType(KEYS.p) },
        ],
        type: isHeader ? editor.getType(KEYS.th) : editor.getType(KEYS.td),
      };
    },
    getCellChildren: (cell: TTableCellElement) => [...cell.children],
    getCellTypes: () => getPluginTypes(editor, [KEYS.td, KEYS.th]),
    getColSpan,
    getColumnCount: (tableNode: TTableElement) =>
      compileTableGrid(tableNode).width,
    getRowSpan,
    isRectangular: (table?: TTableElement) =>
      !table ||
      !compileTableGrid(table).problems.some(({ kind }) =>
        [
          'collision',
          'invalid-col-span',
          'invalid-row-span',
          'row-span-overflow',
          'uncovered-slot',
        ].includes(kind)
      ),
  }),
  key: KEYS.table,
  dependencies: [
    BaseTableRowPlugin,
    BaseTableCellPlugin,
    BaseTableCellHeaderPlugin,
  ],
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
            validate: (
              value
            ): value is NonNullable<TTableElement['colSizes']> =>
              Array.isArray(value) &&
              value.every(
                (size) => typeof size === 'number' && Number.isFinite(size)
              ),
            validationVersion: 1,
          }),
          marginLeft: property.number(),
        },
      },
    };
  },
  options: {
    disableMerge: false,
    minColumnWidth: 48,
  } as TablePluginOptions,
  selectors: ({ editor, type }) => ({
    cellIndices: (id: string): CellIndices | undefined => {
      const value = editor.read.value();

      for (const children of [
        value.children,
        ...Object.values(value.roots ?? {}),
      ]) {
        for (const [node, path] of NodeApi.elements({
          children,
          type: '__table_root__',
        })) {
          if (path.length === 0 || node.type !== type) continue;

          const anchor = compileTableGrid(node as TTableElement).byId.get(id);

          if (anchor) return { col: anchor.col, row: anchor.row };
        }
      }
    },
  }),
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          const widths = Array.from(
            element.querySelectorAll(':scope > colgroup > col')
          ).map((column) =>
            parseHtmlCssNumber(
              (column as HTMLElement).style.width ||
                column.getAttribute('width')
            )
          );
          const colSizes =
            widths.length > 0 && widths.every((width) => width !== undefined)
              ? widths
              : undefined;
          const marginLeft = parseHtmlCssNumber(element.style.marginLeft);

          return {
            ...(colSizes === undefined ? {} : { colSizes }),
            ...(marginLeft === undefined ? {} : { marginLeft }),
          };
        },
        encode: ({ content, node }) => ({
          children: [
            ...(node.colSizes && node.colSizes.length > 0
              ? [
                  {
                    children: node.colSizes.map((size) => ({
                      style: { width: `${size}px` },
                      tag: 'col',
                    })),
                    tag: 'colgroup',
                  },
                ]
              : []),
            { children: content, tag: 'tbody' },
          ],
          style: {
            marginLeft:
              node.marginLeft === undefined
                ? undefined
                : `${node.marginLeft}px`,
          },
          tag: 'table',
        }),
        match: [{ tag: 'table' }],
      },
    }),
})
  .extend(({ api, editor }) => ({
    api: {
      createRow: ({
        colCount = 1,
        ...cellOptions
      }: GetEmptyRowNodeOptions = {}): TTableRowElement => ({
        children: Array.from({ length: colCount }, () =>
          api.createCell(cellOptions)
        ),
        type: editor.getType(KEYS.tr),
      }),
      getOverriddenColumnSizes: (
        tableNode: TTableElement,
        colSizeOverrides?: TableStoreSizeOverrides
      ): number[] => {
        const colCount = api.getColumnCount(tableNode);

        return (
          tableNode.colSizes
            ? [...tableNode.colSizes]
            : (Array.from({ length: colCount }).fill(0) as number[])
        ).map((size, index) => colSizeOverrides?.get?.(index) ?? size);
      },
    },
  }))
  .extend(({ api, editor, getOption, type }) => ({
    api: {
      create: ({
        colCount,
        header,
        rowCount = 0,
        ...cellOptions
      }: GetEmptyTableNodeOptions = {}): TTableElement => ({
        children: Array.from({ length: rowCount }, (_, index) =>
          api.createRow({
            colCount,
            ...cellOptions,
            header: header && index === 0,
          })
        ),
        type,
      }),
      getCellIndices: (element: TTableCellElement): CellIndices => {
        const cellPath = editor.read.nodes.path(element);
        const context = cellPath
          ? createTableContext(editor.read, cellPath.slice(0, -2))
          : null;
        const anchor =
          (cellPath ? context?.anchorAtPath(cellPath) : undefined) ??
          context?.anchorOf(element);
        const byId = element.id
          ? getOption('cellIndices', element.id)
          : undefined;

        if (!anchor && !byId) {
          editor.api.debug.warn(
            'No table grid entry found for element.',
            'TABLE_CELL_INDICES'
          );
        }

        return anchor
          ? { col: anchor.col, row: anchor.row }
          : (byId ?? { col: 0, row: 0 });
      },
      getColumnIndex: (cellNode: Element) => {
        const path = editor.read.nodes.path(cellNode);
        const context = path
          ? createTableContext(editor.read, path.slice(0, -2))
          : null;

        return (
          context?.anchorAtPath(path!)?.col ??
          context?.anchorOf(cellNode as TTableCellElement)?.col ??
          -1
        );
      },
      getRowIndex: (cellNode: Element) => {
        const path = editor.read.nodes.path(cellNode);
        const context = path
          ? createTableContext(editor.read, path.slice(0, -2))
          : null;

        return (
          context?.anchorAtPath(path!)?.row ??
          context?.anchorOf(cellNode as TTableCellElement)?.row ??
          0
        );
      },
      getSelection: (
        at?: Location,
        state: Pick<
          EditorStateView,
          'nodes' | 'ranges' | 'runtime' | 'selection'
        > = editor.read
      ) =>
        readTableSelection(state, {
          at,
          cellTypes: api.getCellTypes(),
          tableType: type,
        }),
    },
  }))
  .extend(({ api, editor, type }) => {
    const getSelectedCellsBoundingBox = (
      cells: TTableCellElement[]
    ): { maxCol: number; maxRow: number; minCol: number; minRow: number } => {
      const currentView = api.getSelection();
      const firstCell = cells[0];
      const currentContextOwnsFirstCell =
        currentView &&
        firstCell &&
        currentView.context.anchorOf(firstCell)?.cell === firstCell;
      const findTableContainingCell = (
        cell: TTableCellElement
      ): TTableElement | undefined => {
        const visit = (
          children: readonly Node[]
        ): TTableElement | undefined => {
          for (const node of children) {
            if (!ElementApi.isElement(node)) continue;

            if (
              node.type === type &&
              node.children.some(
                (row) =>
                  ElementApi.isElement(row) &&
                  row.children.some((rowCell) => rowCell === cell)
              )
            ) {
              return node as TTableElement;
            }

            const nested = visit(node.children);

            if (nested) return nested;
          }
        };
        const value = editor.read.value();

        return (
          visit(value.children) ??
          Object.values(value.roots ?? {}).reduce<TTableElement | undefined>(
            (table, children) => table ?? visit(children),
            undefined
          )
        );
      };
      const owningTable =
        !currentContextOwnsFirstCell && firstCell
          ? findTableContainingCell(firstCell)
          : undefined;
      const context =
        (currentContextOwnsFirstCell ? currentView.context : null) ??
        (owningTable ? createDetachedTableContext(owningTable) : null);
      const bounds = context
        ? getTableSelectionBounds(
            cells.flatMap((cell) => {
              const anchor = context.anchorOf(cell);

              return anchor ? [anchor] : [];
            })
          )
        : null;

      return (
        bounds ?? {
          maxCol: Number.NEGATIVE_INFINITY,
          maxRow: Number.NEGATIVE_INFINITY,
          minCol: Number.POSITIVE_INFINITY,
          minRow: Number.POSITIVE_INFINITY,
        }
      );
    };

    function getGridByRange(
      options: GetTableRangeOptions<'all'>,
      state?: Pick<
        EditorStateView,
        'nodes' | 'ranges' | 'runtime' | 'selection'
      >
    ): TableRangeEntries;
    function getGridByRange(
      options: GetTableRangeOptions<'cell' | 'table'>,
      state?: Pick<
        EditorStateView,
        'nodes' | 'ranges' | 'runtime' | 'selection'
      >
    ): ElementEntry[];
    function getGridByRange(
      { at, format = 'table' }: GetTableRangeOptions<TableRangeFormat>,
      state: Pick<
        EditorStateView,
        'nodes' | 'ranges' | 'runtime' | 'selection'
      > = editor.read
    ): ElementEntry[] | TableRangeEntries {
      const view = api.getSelection(at, state);
      const empty =
        format === 'all' ? { cellEntries: [], tableEntries: [] } : [];

      if (!view) return empty;

      const cellEntries = [...view.cellEntries];

      if (format === 'cell') return cellEntries;

      const tableEntries: ElementEntry[] = [
        [projectTableSelection(view), view.tablePath],
      ];

      return format === 'all' ? { cellEntries, tableEntries } : tableEntries;
    }

    return {
      api: {
        createCellSelection: (
          at: Location,
          state: Pick<
            EditorStateView,
            'nodes' | 'ranges' | 'runtime' | 'selection'
          > = editor.read
        ): TableCellSelection | null => {
          const range = RangeApi.isRange(at) ? at : state.ranges.get(at);

          if (!range) return null;

          const view = api.getSelection(range, state);

          if (!view) return null;

          const cells = view.anchors.flatMap((anchor) => {
            const anchorPoint = getTableAnchorPoint(view, anchor);
            const focusPoint = getTableAnchorPoint(view, anchor, 'end');

            return anchorPoint && focusPoint
              ? [{ anchor: anchorPoint, focus: focusPoint }]
              : [];
          });

          return cells.length <= 1
            ? null
            : { ...range, cells, kind: 'table-cell' };
        },
        getAdjacentCell: ({
          at,
          deltaCol = 0,
          deltaRow = 0,
        }: {
          at?: Location;
          deltaCol?: number;
          deltaRow?: number;
        } = {}) => {
          const view = api.getSelection(at);

          if (!view) return;

          const row =
            view.anchor.row +
            (deltaRow > 0 ? view.anchor.rowSpan + deltaRow - 1 : deltaRow);
          const col =
            view.anchor.col +
            (deltaCol > 0 ? view.anchor.colSpan + deltaCol - 1 : deltaCol);

          return view.context.entryAt(row, col);
        },
        getCellInNextRow: (currentRowAt: Location): NodeEntry | undefined => {
          const view = api.getSelection(currentRowAt);
          const anchor = view?.grid.anchorsByRow[view.anchor.row + 1]?.[0];

          return anchor && view
            ? view.context.entryAt(anchor.row, anchor.col)
            : undefined;
        },
        getCellInPreviousRow: (
          currentRowAt: Location
        ): NodeEntry | undefined => {
          const view = api.getSelection(currentRowAt);
          const anchors = view?.grid.anchorsByRow[view.anchor.row - 1];
          const anchor = anchors?.at(-1);

          return anchor && view
            ? view.context.entryAt(anchor.row, anchor.col)
            : undefined;
        },
        getEntries: ({
          at = editor.read.selection(),
        }: {
          at?: Location | null;
        } = {}) => {
          if (!at) return;

          const cellEntry = editor.read.nodes.find<TTableCellElement>({
            at,
            match: { type: api.getCellTypes() },
          });

          if (!cellEntry) return;

          const rowEntry = editor.read.nodes.above<TTableRowElement>({
            at: cellEntry[1],
            match: { type: editor.getType(KEYS.tr) },
          });

          if (!rowEntry) return;

          const tableEntry = editor.read.nodes.above<TTableElement>({
            at: rowEntry[1],
            match: { type },
          });

          if (!tableEntry) return;

          return {
            cell: cellEntry,
            row: rowEntry,
            table: tableEntry,
          };
        },
        getGridAbove: (
          { format = 'table', ...options }: GetTableRangeAboveOptions = {},
          state: Pick<
            EditorStateView,
            'nodes' | 'ranges' | 'runtime' | 'selection'
          > = editor.read
        ): ElementEntry[] => {
          const view = api.getSelection(options.at, state);

          if (!view) return [];

          return format === 'cell'
            ? [...view.cellEntries]
            : [[projectTableSelection(view), view.tablePath]];
        },
        getGridByRange,
        getMergeGridByRange: getGridByRange,
        getNextCell: (
          currentCell: NodeEntry,
          currentAt: Location,
          _currentRow: NodeEntry
        ): NodeEntry | undefined => {
          const view = api.getSelection(currentAt);
          const anchor = ElementApi.isElement(currentCell[0])
            ? view?.context.anchorOf(currentCell[0] as TTableCellElement)
            : undefined;
          const next =
            view && anchor
              ? getTableSelectionNeighbor(view.context, anchor, 'next')
              : undefined;

          return next ? view?.context.entryAt(next.row, next.col) : undefined;
        },
        getPreviousCell: (
          currentCell: NodeEntry,
          currentAt: Location,
          _currentRow: NodeEntry
        ): NodeEntry | undefined => {
          const view = api.getSelection(currentAt);
          const anchor = ElementApi.isElement(currentCell[0])
            ? view?.context.anchorOf(currentCell[0] as TTableCellElement)
            : undefined;
          const previous =
            view && anchor
              ? getTableSelectionNeighbor(view.context, anchor, 'previous')
              : undefined;

          return previous
            ? view?.context.entryAt(previous.row, previous.col)
            : undefined;
        },
        getSelectedCell: (id?: string | null) => {
          if (!id) return null;

          const view = api.getSelection();

          return view && view.anchors.length > 1 && view.hasCellId(id)
            ? (view.grid.byId.get(id)?.cell ?? null)
            : null;
        },
        getSelectedCellEntries: (): ElementEntry[] => {
          const cellEntries = api.getSelection()?.cellEntries ?? [];

          return cellEntries.length > 1 ? [...cellEntries] : [];
        },
        getSelectedCellIds: (): string[] | null => {
          const view = api.getSelection();

          return view && view.anchors.length > 1 && view.cellIds.length > 0
            ? [...view.cellIds]
            : null;
        },
        getSelectedCells: (): Element[] | null => {
          const view = api.getSelection();

          return view && view.anchors.length > 1
            ? view.anchors.map(({ cell }) => cell)
            : null;
        },
        getSelectedCellsBoundingBox,
        getSelectedTableIds: (): string[] | null => {
          const view = api.getSelection();

          return view &&
            view.anchors.length > 1 &&
            typeof view.table.id === 'string'
            ? [view.table.id]
            : null;
        },
        getSelectedTables: (): Element[] | null => {
          const view = api.getSelection();

          return view && view.anchors.length > 1 ? [view.table] : null;
        },
        isCellSelected: (id?: string | null) => {
          if (!id) return false;

          const view = api.getSelection();

          return !!view && view.anchors.length > 1 && view.hasCellId(id);
        },
        isSelectingCell: () => (api.getSelection()?.anchors.length ?? 0) > 1,
      },
    };
  })
  .extend(({ api }) => ({
    api: {
      getLeftCell: ({ at }: { at?: Location } = {}) =>
        api.getAdjacentCell({ at, deltaCol: -1 }),
      getTopCell: ({ at }: { at?: Location } = {}) =>
        api.getAdjacentCell({ at, deltaRow: -1 }),
    },
  }))
  .extend(({ api, editor, getOptions, type }) => ({
    api: {
      getCellBorders: ({
        cellIndices,
        defaultBorder = { size: 1 },
        element,
      }: {
        element: TTableCellElement;
        cellIndices?: CellIndices;
        defaultBorder?: TTableCellBorder;
      }): BorderStylesDefault => {
        const cellPath = editor.read.nodes.path(element);

        if (!cellPath) {
          return { bottom: defaultBorder, right: defaultBorder };
        }

        const [rowNode, rowPath] =
          editor.read.nodes.parent<TTableRowElement>(cellPath) ?? [];

        if (!rowNode || !rowPath) {
          return { bottom: defaultBorder, right: defaultBorder };
        }

        const [tableNode] =
          editor.read.nodes.parent<TTableElement>(rowPath) ?? [];

        if (!tableNode || tableNode.type !== type) {
          return { bottom: defaultBorder, right: defaultBorder };
        }

        const { col } = cellIndices ?? api.getCellIndices(element);
        const isFirstCell = col === 0;
        const isFirstRow = tableNode.children?.[0] === rowNode;
        const getBorder = (direction: BorderDirection) => {
          const border = element.borders?.[direction];

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
      },
      getCellSize: ({
        cellIndices,
        colSizes,
        element,
        rowSize,
      }: {
        element: TTableCellElement;
        cellIndices?: CellIndices;
        colSizes?: number[];
        rowSize?: number;
      }): { minHeight: number; width: number } => {
        const path = editor.read.nodes.path(element);

        if (!path) return { minHeight: rowSize ?? 0, width: 0 };

        if (!rowSize) {
          const [rowElement] =
            editor.read.nodes.parent<TTableRowElement>(path) ?? [];

          if (!rowElement || rowElement.type !== editor.getType(KEYS.tr)) {
            return { minHeight: 0, width: 0 };
          }

          rowSize = rowElement.size ?? 0;
        }
        if (!colSizes) {
          const [, rowPath] =
            editor.read.nodes.parent<TTableRowElement>(path) ?? [];

          if (!rowPath) return { minHeight: rowSize, width: 0 };

          const [tableNode] =
            editor.read.nodes.parent<TTableElement>(rowPath) ?? [];

          if (!tableNode) return { minHeight: rowSize, width: 0 };

          colSizes = api.getOverriddenColumnSizes(tableNode);
        }

        const colSpan = getColSpan(element);
        const { col } = cellIndices ?? api.getCellIndices(element);
        const width = (colSizes ?? [])
          .slice(col, col + colSpan)
          .reduce((total, size) => total + (size || 0), 0);

        return { minHeight: rowSize, width };
      },
      getSelectedCellsBorders: (
        selectedCells?: Element[] | null,
        options: GetSelectedCellsBordersOptions = {}
      ): TableBorderStates => {
        const { select = { none: true, outer: true, side: true } } = options;
        let cells = selectedCells;

        if (!cells || cells.length === 0) {
          const cell = editor.read.nodes.block({
            match: { type: api.getCellTypes() },
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

        const cellElements = cells.map((cell) => cell as TTableCellElement);
        const { maxCol, maxRow, minCol, minRow } =
          api.getSelectedCellsBoundingBox(cellElements);
        let hasAnyBorder = false;
        let allOuterBordersSet = true;
        const borderStates = {
          bottom: false,
          left: false,
          right: false,
          top: false,
        };

        for (const cell of cellElements) {
          const { col, row } = api.getCellIndices(cell);
          const cellPath = editor.read.nodes.path(cell);
          const colSpan = getColSpan(cell);
          const rowSpan = getRowSpan(cell);
          const isFirstRow = row === 0;
          const isFirstCell = col === 0;

          if (!cellPath) continue;
          if (select.none && !hasAnyBorder) {
            if (isFirstRow && (cell.borders?.top?.size ?? 1) > 0) {
              hasAnyBorder = true;
            }
            if (isFirstCell && (cell.borders?.left?.size ?? 1) > 0) {
              hasAnyBorder = true;
            }
            if ((cell.borders?.bottom?.size ?? 1) > 0) hasAnyBorder = true;
            if ((cell.borders?.right?.size ?? 1) > 0) hasAnyBorder = true;

            if (!hasAnyBorder) {
              if (!isFirstRow) {
                const cellAboveEntry = api.getTopCell({ at: cellPath });

                if (
                  cellAboveEntry &&
                  (cellAboveEntry[0].borders?.bottom?.size ?? 1) > 0
                ) {
                  hasAnyBorder = true;
                }
              }
              if (!isFirstCell) {
                const previousCellEntry = api.getLeftCell({ at: cellPath });

                if (
                  previousCellEntry &&
                  (previousCellEntry[0].borders?.right?.size ?? 1) > 0
                ) {
                  hasAnyBorder = true;
                }
              }
            }
          }
          if (select.side || select.outer) {
            for (let rowIndex = row; rowIndex < row + rowSpan; rowIndex++) {
              for (
                let columnIndex = col;
                columnIndex < col + colSpan;
                columnIndex++
              ) {
                if (rowIndex === minRow) {
                  if (isFirstRow) {
                    if ((cell.borders?.top?.size ?? 1) < 1) {
                      borderStates.top = false;
                      if (select.outer) allOuterBordersSet = false;
                    } else if (!borderStates.top) {
                      borderStates.top = true;
                    }
                  } else {
                    const cellAboveEntry = api.getTopCell({ at: cellPath });

                    if (cellAboveEntry) {
                      if ((cellAboveEntry[0].borders?.bottom?.size ?? 1) < 1) {
                        borderStates.top = false;
                        if (select.outer) allOuterBordersSet = false;
                      } else if (!borderStates.top) {
                        borderStates.top = true;
                      }
                    }
                  }
                }
                if (rowIndex === maxRow) {
                  if ((cell.borders?.bottom?.size ?? 1) < 1) {
                    borderStates.bottom = false;
                    if (select.outer) allOuterBordersSet = false;
                  } else if (!borderStates.bottom) {
                    borderStates.bottom = true;
                  }
                }
                if (columnIndex === minCol) {
                  if (isFirstCell) {
                    if ((cell.borders?.left?.size ?? 1) < 1) {
                      borderStates.left = false;
                      if (select.outer) allOuterBordersSet = false;
                    } else if (!borderStates.left) {
                      borderStates.left = true;
                    }
                  } else {
                    const previousCellEntry = api.getLeftCell({ at: cellPath });

                    if (previousCellEntry) {
                      if (
                        (previousCellEntry[0].borders?.right?.size ?? 1) < 1
                      ) {
                        borderStates.left = false;
                        if (select.outer) allOuterBordersSet = false;
                      } else if (!borderStates.left) {
                        borderStates.left = true;
                      }
                    }
                  }
                }
                if (columnIndex === maxCol) {
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
      },
      isBorderHidden: (border: BorderDirection) => {
        if (border === 'left') {
          const node = api.getLeftCell()?.[0];

          if (node) return node.borders?.right?.size === 0;
        }
        if (border === 'top') {
          const node = api.getTopCell()?.[0];

          if (node) return node.borders?.bottom?.size === 0;
        }

        return (
          editor.read.nodes.find<TTableCellElement>({
            match: { type: api.getCellTypes() },
          })?.[0].borders?.[border]?.size === 0
        );
      },
      isSelectedCellBorder: (
        cells: TTableCellElement[],
        side: BorderDirection
      ): boolean => {
        const { maxCol, maxRow, minCol, minRow } =
          api.getSelectedCellsBoundingBox(cells);

        return cells.every((cell) => {
          const { col, row } = api.getCellIndices(cell);
          const colSpan = getColSpan(cell);
          const rowSpan = getRowSpan(cell);
          const cellPath = editor.read.nodes.path(cell);

          if (!cellPath) return true;

          for (let rowIndex = row; rowIndex < row + rowSpan; rowIndex++) {
            for (
              let columnIndex = col;
              columnIndex < col + colSpan;
              columnIndex++
            ) {
              if (side === 'top' && rowIndex === minRow) {
                if (row === 0) {
                  return (cell.borders?.top?.size ?? 1) >= 1;
                }

                const cellAboveEntry = api.getTopCell({ at: cellPath });

                return cellAboveEntry
                  ? (cellAboveEntry[0].borders?.bottom?.size ?? 1) >= 1
                  : true;
              }
              if (side === 'bottom' && rowIndex === maxRow) {
                return (cell.borders?.bottom?.size ?? 1) >= 1;
              }
              if (side === 'left' && columnIndex === minCol) {
                if (col === 0) {
                  return (cell.borders?.left?.size ?? 1) >= 1;
                }

                const previousCellEntry = api.getLeftCell({ at: cellPath });

                return previousCellEntry
                  ? (previousCellEntry[0].borders?.right?.size ?? 1) >= 1
                  : true;
              }
              if (side === 'right' && columnIndex === maxCol) {
                return (cell.borders?.right?.size ?? 1) >= 1;
              }
            }
          }

          return true;
        });
      },
      isSelectedCellBordersNone: (cells: TTableCellElement[]): boolean =>
        cells.every((cell) => {
          const { borders } = cell;
          const { col, row } = api.getCellIndices(cell);
          const cellPath = editor.read.nodes.path(cell);

          if (!cellPath) return true;
          if (row === 0 && (borders?.top?.size ?? 1) > 0) return false;
          if (col === 0 && (borders?.left?.size ?? 1) > 0) return false;
          if ((borders?.bottom?.size ?? 1) > 0) return false;
          if ((borders?.right?.size ?? 1) > 0) return false;

          if (row !== 0) {
            const cellAboveEntry = api.getTopCell({ at: cellPath });

            if (
              cellAboveEntry &&
              (cellAboveEntry[0].borders?.bottom?.size ?? 1) > 0
            ) {
              return false;
            }
          }
          if (col !== 0) {
            const previousCellEntry = api.getLeftCell({ at: cellPath });

            if (
              previousCellEntry &&
              (previousCellEntry[0].borders?.right?.size ?? 1) > 0
            ) {
              return false;
            }
          }

          return true;
        }),
      isSelectedCellBordersOuter: (cells: TTableCellElement[]): boolean => {
        const { maxCol, maxRow, minCol, minRow } =
          api.getSelectedCellsBoundingBox(cells);

        for (const cell of cells) {
          const { col, row } = api.getCellIndices(cell);
          const colSpan = getColSpan(cell);
          const rowSpan = getRowSpan(cell);

          for (let rowIndex = row; rowIndex < row + rowSpan; rowIndex++) {
            for (
              let columnIndex = col;
              columnIndex < col + colSpan;
              columnIndex++
            ) {
              if (rowIndex === minRow && (cell.borders?.top?.size ?? 1) < 1) {
                return false;
              }
              if (
                rowIndex === maxRow &&
                (cell.borders?.bottom?.size ?? 1) < 1
              ) {
                return false;
              }
              if (
                columnIndex === minCol &&
                (cell.borders?.left?.size ?? 1) < 1
              ) {
                return false;
              }
              if (
                columnIndex === maxCol &&
                (cell.borders?.right?.size ?? 1) < 1
              ) {
                return false;
              }
            }
          }
        }

        return true;
      },
      writeSelection: (
        data: Pick<DataTransfer, 'getData' | 'setData'>
      ): boolean => {
        const cells = api.getGridAbove({ format: 'cell' });

        if (cells.length <= 1) return false;

        const [tableEntry] = api.getGridAbove({ format: 'table' });

        if (!tableEntry) return false;

        writeDOMHostFragmentData(editor, data, {
          html: '',
          slice: ContentSlice.closed([tableEntry[0]]),
        });

        const rows = tableEntry[0].children as TTableRowElement[];
        const values = rows.map((row) =>
          (row.children as TTableCellElement[]).map((cell) =>
            NodeApi.string(cell)
          )
        );
        const csv = `${values
          .map((row) => row.map(escapeCsvField).join(','))
          .join('\n')}\n`;
        const tsv = `${values.map((row) => row.join('\t')).join('\n')}\n`;

        data.setData('text/csv', csv);
        data.setData('text/tsv', tsv);
        data.setData('text/plain', tsv);

        return true;
      },
    },
    selectors: {
      isCellSelected: (id?: string | null) => api.isCellSelected(id),
      isSelectingCell: () => api.isSelectingCell(),
      selectedCell: (id?: string | null) => api.getSelectedCell(id),
      selectedCellIds: () => api.getSelectedCellIds(),
      selectedCells: () => api.getSelectedCells(),
      selectedTableIds: () => api.getSelectedTableIds(),
      selectedTables: () => api.getSelectedTables(),
    },
    update: ({ tx }) => {
      const applyMutation = (
        context: NonNullable<ReturnType<typeof createTableContext>>,
        intent: TableIntent
      ) => {
        const result = planTableMutation(context, intent);

        if (result.kind !== 'plan') {
          editor.api.debug.warn(
            `Table mutation rejected: ${result.kind}.`,
            'TABLE_MUTATION_DIAGNOSTIC',
            result
          );

          return false;
        }

        applyTableMutationPlan(tx, result);

        return true;
      };

      return {
        insert: (
          { colCount = 2, header, rowCount = 2 }: GetEmptyTableNodeOptions = {},
          options: NodeInsertNodesOptions<TTableElement> = {}
        ): void => {
          const newTable = api.create({ colCount, header, rowCount });
          let tablePath: Path | undefined;

          if (options.at !== undefined) {
            tablePath = PathApi.isPath(options.at)
              ? options.at
              : tx.nodes.path(options.at);
          } else {
            const currentTable = tx.nodes.above<TTableElement>({
              match: { type },
            });

            if (currentTable) {
              tablePath = PathApi.next(currentTable[1]);
            } else {
              const currentBlock = tx.nodes.block();

              tablePath = currentBlock
                ? PathApi.next(currentBlock[1])
                : [tx.children().length];
            }
          }

          if (!tablePath) return;

          const result = planTableMutation(
            createDetachedTableContext(newTable, tablePath),
            {
              kind: 'insert-table',
              options,
            }
          );

          if (result.kind !== 'plan') {
            editor.api.debug.warn(
              `Table mutation rejected: ${result.kind}.`,
              'TABLE_MUTATION_DIAGNOSTIC',
              result
            );

            return;
          }

          applyTableMutationPlan(tx, result);
        },
        insertColumn: (options: InsertTableColumnOptions = {}): void => {
          const { initialTableWidth, minColumnWidth } = getOptions();
          const tableAt = options.at
            ? tx.nodes.get<TTableElement>(options.at)?.[0]
            : undefined;
          let tablePath: Path;
          let anchorPath: Path;
          let before = options.before;
          let atColumn: number | undefined;

          if (tableAt?.type === type && options.at) {
            tablePath = options.at;
            const context = createTableContext(tx, tablePath);
            const anchor = context?.grid.slots[0]?.at(-1);

            if (!context || !anchor) return;

            anchorPath = tablePath.concat(anchor.path);
            before = false;
          } else {
            const cellEntry = tx.nodes.find<TTableCellElement>({
              at: options.fromCell,
              match: { type: api.getCellTypes() },
            });

            if (!cellEntry) return;

            anchorPath = cellEntry[1];
            const tableEntry = tx.nodes.above<TTableElement>({
              at: anchorPath,
              match: { type },
            });

            if (!tableEntry) return;

            tablePath = tableEntry[1];
            if (options.at) atColumn = options.at.at(-1);
          }

          const context = createTableContext(tx, tablePath);

          if (!context) return;

          applyMutation(context, {
            anchorPath,
            atColumn,
            before,
            createCell: ({ children, header, sourceRow }) =>
              api.createCell({
                children: children ? [...children] : undefined,
                header,
                row: sourceRow,
              }),
            header: options.header,
            initialTableWidth,
            kind: 'insert-column',
            minColumnWidth,
            select: options.select,
          });
        },

        insertRow: (options: InsertTableRowOptions = {}): void => {
          const tableAt = options.at
            ? tx.nodes.get<TTableElement>(options.at)?.[0]
            : undefined;
          let tablePath: Path;
          let anchorPath: Path;
          let before = options.before;

          if (tableAt?.type === type && options.at) {
            tablePath = options.at;
            const context = createTableContext(tx, tablePath);
            const anchor = context?.grid.slots.at(-1)?.[0];

            if (!context || !anchor) return;

            anchorPath = tablePath.concat(anchor.path);
            before = false;
          } else {
            const rowEntry = tx.nodes.find<TTableRowElement>({
              at: options.fromRow ?? options.at,
              match: { type: editor.getType(KEYS.tr) },
            });

            if (!rowEntry) return;

            const tableEntry = tx.nodes.above<TTableElement>({
              at: rowEntry[1],
              match: { type },
            });

            if (!tableEntry) return;

            tablePath = tableEntry[1];
            const context = createTableContext(tx, tablePath);
            const rowIndex = rowEntry[1].at(-1);
            const anchor =
              rowIndex === undefined
                ? undefined
                : (context?.grid.anchorsByRow[rowIndex]?.[0] ??
                  context?.grid.slots[rowIndex]?.[0]);

            if (!context || !anchor) return;

            anchorPath = tablePath.concat(anchor.path);
            if (options.at) before = true;
          }

          const context = createTableContext(tx, tablePath);

          if (!context) return;

          applyMutation(context, {
            anchorPath,
            before,
            createCell: ({ children, header, sourceRow }) =>
              api.createCell({
                children: children ? [...children] : undefined,
                header,
                row: sourceRow,
              }),
            header: options.header,
            kind: 'insert-row',
            rowType: editor.getType(KEYS.tr),
            select: options.select,
          });
        },
        removeColumn: (): void => {
          const tableEntry = tx.nodes.above<TTableElement>({
            match: { type },
          });

          if (!tableEntry) return;

          const view = tx.selection.isExpanded()
            ? api.getSelection(undefined, tx)
            : null;
          const context =
            view?.context ?? createTableContext(tx, tableEntry[1]);

          if (!context) return;

          if (tx.selection.isExpanded()) {
            if (!view) return;

            if (
              view.bounds.minRow !== 0 ||
              view.bounds.maxRow !== context.grid.height - 1
            ) {
              return;
            }

            const startCol = view.bounds.minCol;
            const endCol = view.bounds.maxCol;

            applyMutation(context, {
              columnCount: endCol - startCol + 1,
              kind: 'remove-column',
              selectionRows: [view.bounds.minRow, view.bounds.maxRow],
              startCol,
            });

            return;
          }

          const cellEntry = tx.nodes.above<TTableCellElement>({
            match: { type: api.getCellTypes() },
          });

          if (!cellEntry) return;

          const selectedAnchor = context.anchorAtPath(cellEntry[1]);
          const selectedRow = context.table.children[
            selectedAnchor?.row ?? -1
          ] as TTableRowElement | undefined;

          if (
            selectedAnchor?.colSpan === 1 &&
            selectedRow?.children.length === 1 &&
            context.grid.width > 1
          ) {
            return;
          }

          applyMutation(context, {
            anchorPath: cellEntry[1],
            kind: 'remove-column',
          });
        },

        removeRow: (): void => {
          const tableEntry = tx.nodes.above<TTableElement>({
            match: { type },
          });

          if (!tableEntry) return;

          const view = tx.selection.isExpanded()
            ? api.getSelection(undefined, tx)
            : null;
          const context =
            view?.context ?? createTableContext(tx, tableEntry[1]);

          if (!context) return;

          if (tx.selection.isExpanded()) {
            if (!view) return;

            if (
              view.bounds.minCol !== 0 ||
              view.bounds.maxCol !== context.grid.width - 1
            ) {
              return;
            }

            const startRow = view.bounds.minRow;
            const endRow = view.bounds.maxRow;

            applyMutation(context, {
              kind: 'remove-row',
              rowCount: endRow - startRow + 1,
              selectionCol: view.bounds.minCol,
              startRow,
            });

            return;
          }

          const cellEntry = tx.nodes.above<TTableCellElement>({
            match: { type: api.getCellTypes() },
          });

          if (!cellEntry) return;

          applyMutation(context, {
            anchorPath: cellEntry[1],
            kind: 'remove-row',
          });
        },

        remove: () => {
          const tableEntry = tx.nodes.above<TTableElement>({
            match: { type },
          });

          if (!tableEntry) return;

          const context = createTableContext(tx, tableEntry[1]);

          if (!context) return;

          applyMutation(context, { kind: 'remove-table' });
        },
        setBorderSizes: (options: readonly SetBorderSizeOptions[]) => {
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
            const cellEntry = tx.nodes.find<TTableCellElement>({
              at,
              match: { type: api.getCellTypes() },
            });

            if (!cellEntry) return;

            const [, cellPath] = cellEntry;
            const cellIndex = cellPath.at(-1);
            const rowIndex = cellPath.at(-2);
            const view = api.getSelection(cellPath, tx);
            const addDirection = (direction: BorderDirection) => {
              if (direction === 'top') {
                if (rowIndex === 0) return addBorder(cellEntry, 'top', size);

                const anchor = view
                  ? getTableSelectionNeighbor(
                      view.context,
                      view.anchor,
                      'above'
                    )
                  : undefined;
                const cellAbove =
                  anchor && view
                    ? view.context.entryAt(anchor.row, anchor.col)
                    : undefined;

                if (cellAbove) addBorder(cellAbove, 'bottom', size);
                return;
              }
              if (direction === 'left') {
                if (cellIndex === 0) return addBorder(cellEntry, 'left', size);

                const anchor = view
                  ? getTableSelectionNeighbor(view.context, view.anchor, 'left')
                  : undefined;
                const cellLeft =
                  anchor && view
                    ? view.context.entryAt(anchor.row, anchor.col)
                    : undefined;

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
        },
      };
    },
  }))
  .extend((context) => {
    const { api, editor, plugin, type } = context;

    return {
      update: ({ tx }) => {
        const applyMutation = (
          context: NonNullable<ReturnType<typeof createTableContext>>,
          intent: TableIntent
        ) => {
          const result = planTableMutation(context, intent);

          if (result.kind !== 'plan') {
            editor.api.debug.warn(
              `Table mutation rejected: ${result.kind}.`,
              'TABLE_MUTATION_DIAGNOSTIC',
              result
            );

            return false;
          }

          applyTableMutationPlan(tx, result);

          return true;
        };

        return {
          toggleBorders: ({
            border,
            cells: explicitCells,
          }: ToggleTableBordersOptions) => {
            const selectedCells =
              explicitCells ??
              (() => {
                const selected =
                  api.getSelection(undefined, tx)?.cellEntries ?? [];

                if (selected.length > 1) {
                  return selected.map(([cell]) => cell as TTableCellElement);
                }

                const cell = tx.nodes.block({
                  match: { type: api.getCellTypes() },
                });

                return cell ? [cell[0] as TTableCellElement] : [];
              })();

            if (selectedCells.length === 0) return;

            const targets = selectedCells.flatMap((cell) => {
              const path = tx.nodes.path(cell);

              if (!path) return [];

              const view = api.getSelection(path, tx);
              const anchor = view?.context.anchorOf(cell);

              if (!view || !anchor) return [];

              const top = getTableSelectionNeighbor(
                view.context,
                anchor,
                'above'
              );
              const left = getTableSelectionNeighbor(
                view.context,
                anchor,
                'left'
              );

              return [
                {
                  col: anchor.col,
                  colSpan: anchor.colSpan,
                  leftCellPath: left
                    ? (view.context.entryAt(left.row, left.col)?.[1] ?? null)
                    : null,
                  path,
                  row: anchor.row,
                  rowSpan: anchor.rowSpan,
                  topCellPath: top
                    ? (view.context.entryAt(top.row, top.col)?.[1] ?? null)
                    : null,
                },
              ];
            });
            const updates: SetBorderSizeOptions[] = [];
            const add = (
              at: Path | null,
              directions: readonly BorderDirection[] | 'all',
              size: number
            ) => {
              if (!at) return;

              if (directions === 'all') {
                updates.push({ at, border: 'all', size });
                return;
              }

              directions.forEach((direction) => {
                updates.push({ at, border: direction, size });
              });
            };
            const apply = () => {
              tx[plugin.key].setBorderSizes(updates);
            };

            if (border === 'none') {
              const size = api.getSelectedCellsBorders(selectedCells).none
                ? 1
                : 0;

              targets.forEach((target) => {
                const directions: BorderDirection[] = ['bottom', 'right'];

                if (target.row === 0) directions.unshift('top');
                if (target.col === 0) directions.unshift('left');
                if (target.row > 0) {
                  add(target.topCellPath, ['bottom'], size);
                }
                if (target.col > 0) {
                  add(target.leftCellPath, ['right'], size);
                }
                add(target.path, directions, size);
              });

              apply();
              return;
            }

            const { maxCol, maxRow, minCol, minRow } =
              api.getSelectedCellsBoundingBox(selectedCells);

            if (border === 'outer') {
              const size = api.getSelectedCellsBorders(selectedCells).outer
                ? 0
                : 1;

              targets.forEach((target) => {
                for (
                  let row = target.row;
                  row < target.row + target.rowSpan;
                  row++
                ) {
                  for (
                    let col = target.col;
                    col < target.col + target.colSpan;
                    col++
                  ) {
                    const directions: BorderDirection[] = [];

                    if (row === minRow) directions.push('top');
                    if (row === maxRow) directions.push('bottom');
                    if (col === minCol) directions.push('left');
                    if (col === maxCol) directions.push('right');
                    add(target.path, directions, size);
                  }
                }
              });

              apply();
              return;
            }

            const size = api.isSelectedCellBorder(selectedCells, border)
              ? 0
              : 1;

            targets.forEach((target) => {
              const directions: BorderDirection[] = [];

              if (border === 'top' && target.row === minRow) {
                if (target.row === 0) {
                  directions.push('top');
                } else {
                  add(target.topCellPath, ['bottom'], size);
                }
              }
              if (
                border === 'bottom' &&
                target.row + target.rowSpan - 1 === maxRow
              ) {
                directions.push('bottom');
              }
              if (border === 'left' && target.col === minCol) {
                if (target.col === 0) {
                  directions.push('left');
                } else {
                  add(target.leftCellPath, ['right'], size);
                }
              }
              if (
                border === 'right' &&
                target.col + target.colSpan - 1 === maxCol
              ) {
                directions.push('right');
              }
              add(target.path, directions, size);
            });

            apply();
          },
          setBorderSize: (
            size: number,
            { at, border = 'all' }: Omit<SetBorderSizeOptions, 'size'> = {}
          ) => {
            tx[plugin.key].setBorderSizes([{ at, border, size }]);
          },
          merge: (): void => {
            const cellEntries =
              api.getSelection(undefined, tx)?.cellEntries ?? [];

            if (cellEntries.length < 2) return;

            const firstCellPath = cellEntries[0][1];
            const context = createTableContext(tx, firstCellPath.slice(0, -2));

            if (!context) return;

            const cellIds = cellEntries.flatMap(([cell]) =>
              typeof cell.id === 'string' ? [cell.id] : []
            );

            if (cellIds.length !== cellEntries.length) {
              editor.api.debug.warn(
                'Table merge requires stable cell IDs.',
                'TABLE_MUTATION_DIAGNOSTIC',
                { kind: 'missing-cell-id' }
              );

              return;
            }

            applyMutation(context, {
              cellIds,
              createCell: ({ children, header, sourceRow }) =>
                api.createCell({
                  children: children ? [...children] : undefined,
                  header,
                  row: sourceRow,
                }),
              kind: 'merge',
            });
          },
          moveSelection: ({
            at,
            edge,
            fromOneCell,
            reverse,
          }: MoveTableSelectionOptions = {}) => {
            const view = api.getSelection(at, tx);

            if (!view) return;

            if (edge) {
              const minCell = fromOneCell ? 0 : 1;

              if (view.anchors.length > minCell) {
                const expansion = getTableSelectionExpansion(view, edge);

                if (expansion) {
                  const anchor = getTableAnchorPoint(view, expansion.anchor);
                  const focus = getTableAnchorPoint(view, expansion.focus);

                  if (anchor && focus) {
                    const range = { anchor, focus };

                    tx.selection.set(
                      api.createCellSelection(range, tx) ?? range
                    );
                  }
                }

                return true;
              }

              return;
            }

            const target = getTableSelectionNeighbor(
              view.context,
              view.anchor,
              reverse ? 'above' : 'below'
            );

            if (target) {
              const point = getTableAnchorPoint(view, target);

              if (point) tx.selection.set(point);
            } else {
              const rootNode = {
                children:
                  view.root === undefined ? tx.children() : tx.root(view.root),
                type: '__table_root__',
              };
              const textEntries = [...NodeApi.texts(rootNode)];
              const nextTablePath = PathApi.next(view.tablePath);
              const textEntry = reverse
                ? textEntries
                    .reverse()
                    .find(([, path]) => PathApi.isBefore(path, view.tablePath))
                : textEntries.find(
                    ([, path]) => !PathApi.isBefore(path, nextTablePath)
                  );
              const point = textEntry
                ? {
                    offset: reverse ? textEntry[0].text.length : 0,
                    path: textEntry[1],
                    ...(view.root === undefined ? {} : { root: view.root }),
                  }
                : undefined;

              if (point) tx.selection.set({ anchor: point, focus: point });
            }

            return true;
          },
          selectAll: () => {
            const table = tx.nodes.above({ match: { type } });

            if (!table) return false;

            const [, tablePath] = table;
            const tableRange = tx.ranges.get(tablePath);
            const selection = tx.selection();

            if (
              tableRange &&
              selection &&
              RangeApi.equals(selection, tableRange)
            ) {
              const documentRange = tx.ranges.get([]);

              if (documentRange) tx.selection.set(documentRange);

              return true;
            }

            if (tableRange) {
              tx.selection.set(
                api.createCellSelection(tableRange, tx) ?? tableRange
              );
            }

            return true;
          },
          setCellBackground: ({
            color,
            selectedCells,
          }: SetCellBackgroundOptions) => {
            if (selectedCells && selectedCells.length > 0) {
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
              match: { type: api.getCellTypes() },
            });

            if (currentCell) {
              tx.nodes.set<TTableCellElement>(
                { background: color },
                { at: currentCell[1] }
              );
            }
          },
          setColumnSize: (
            { colIndex, width }: { colIndex: number; width: number },
            options: TableFindOptions = {}
          ) => {
            const table = tx.nodes.find<TTableElement>({
              match: { type },
              ...options,
            });

            if (!table) return;

            const [tableNode, tablePath] = table;
            const colSizes = tableNode.colSizes
              ? [...tableNode.colSizes]
              : Array.from({
                  length: api.getColumnCount(tableNode),
                }).fill(0);

            colSizes[colIndex] = width;

            tx.nodes.set<TTableElement>({ colSizes }, { at: tablePath });
          },
          setMarginLeft: (
            { marginLeft }: { marginLeft: number },
            options: TableFindOptions = {}
          ) => {
            const table = tx.nodes.find<TTableElement>({
              match: { type },
              ...options,
            });

            if (!table) return;

            tx.nodes.set<TTableElement>({ marginLeft }, { at: table[1] });
          },
          setRowSize: (
            { height, rowIndex }: { height: number; rowIndex: number },
            options: TableFindOptions = {}
          ) => {
            const table = tx.nodes.find<TTableElement>({
              match: { type },
              ...options,
            });

            if (!table) return;

            tx.nodes.set<TTableRowElement>(
              { size: height },
              { at: [...table[1], rowIndex] }
            );
          },
          split: (): void => {
            const firstCell = api.getSelection(undefined, tx)?.cellEntries[0];

            if (!firstCell) return;

            const [cell, path] = firstCell;
            const context = createTableContext(tx, path.slice(0, -2));

            if (!context) return;

            applyMutation(context, {
              ...(typeof cell.id === 'string'
                ? { anchorId: cell.id }
                : { anchorPath: path }),
              createCell: ({ children, header, sourceRow }) =>
                api.createCell({
                  children: children ? [...children] : undefined,
                  header,
                  row: sourceRow,
                }),
              kind: 'split',
              rowType: editor.getType(KEYS.tr),
            });
          },
          tab: ({ reverse = false }: { reverse?: boolean } = {}) => {
            const selection = tx.selection();
            const view = selection ? api.getSelection(selection, tx) : null;

            if (
              selection &&
              tx.selection.isExpanded() &&
              (view?.anchors.length ?? 0) > 1
            ) {
              tx.selection.collapse({ edge: 'end' });
              return true;
            }

            const cellEntry = tx.nodes.find<TTableCellElement>({
              match: { type: api.getCellTypes() },
            });

            if (!cellEntry) return false;

            const tableView = api.getSelection(cellEntry[1], tx);
            const anchor = tableView?.context.anchorAtPath(cellEntry[1]);
            const target =
              tableView && anchor
                ? getTableSelectionNeighbor(
                    tableView.context,
                    anchor,
                    reverse ? 'previous' : 'next'
                  )
                : undefined;
            const targetEntry =
              target && tableView
                ? tableView.context.entryAt(target.row, target.col)
                : undefined;

            if (targetEntry) tx.selection.set(targetEntry[1]);

            return true;
          },
        };
      },
      extension: [
        {
          commands: ({ around }) => [
            around(editorCommands.select, ({ input, state, next }) =>
              next({
                ...input,
                target: RangeApi.isRange(input.target)
                  ? clampTableSelection(context.type, input.target, state)
                  : input.target,
              })
            ),
            around(editorCommands.setSelection, ({ input, state, next }) => {
              const selection = state.selection();

              if (!selection) return next();

              const nextSelection = { ...selection, ...input.props };
              const clamped = clampTableSelection(
                context.type,
                nextSelection,
                state
              );

              return next({
                ...input,
                props:
                  clamped === nextSelection
                    ? input.props
                    : { ...input.props, focus: clamped.focus },
              });
            }),
          ],
        },
        {
          commands: ({ handle }) => [
            handle(editorCommands.delete, ({ input, state }) => {
              const selection = state.selection();

              if (!selection || !state.selection.isCollapsed()) return false;

              const reverse = input.direction === 'forward';
              const cellEntry = state.nodes.block({
                match: { type: context.api.getCellTypes() },
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
                  match: { type: context.api.getCellTypes() },
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

              if (
                state.selection.isWithinBlock({
                  at: selection,
                  match: { type: context.type },
                })
              ) {
                const cells = context.api.getGridAbove(
                  { at: selection, format: 'cell' },
                  state
                );

                if (cells.length < 2) return false;

                const anchor = state.points.start(cells[0][1]);
                const focus = state.points.start(cells.at(-1)![1]);

                return state.transaction((tx) => {
                  cells.forEach(([, path]) => {
                    tx.nodes.replaceChildren(
                      [
                        {
                          children: [{ text: '' }],
                          type: context.editor.getType(KEYS.p),
                        },
                      ],
                      { at: path }
                    );
                  });

                  if (anchor && focus) {
                    const range = { anchor, focus };

                    tx.selection.set(
                      context.api.createCellSelection(range, tx) ?? range
                    );
                  }
                });
              }

              return false;
            }),
          ],
        },
        {
          queries: {
            fragment: {
              get({ next }) {
                const fragment = next();
                const nextFragment: Descendant[] = [];

                fragment.forEach((node) => {
                  if (
                    !ElementApi.isElement(node) ||
                    node.type !== context.type
                  ) {
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

                  const [subTable] = context.api.getGridAbove();

                  if (subTable) nextFragment.push(subTable[0]);
                });

                return nextFragment;
              },
            },
          },
        },
        {
          clipboard: {
            insertData(data, { next }) {
              const types = Array.from(data.types ?? []);
              const read = (format: string) => {
                try {
                  return data.getData(format);
                } catch {
                  return '';
                }
              };
              const html = read('text/html');
              const text =
                read('text/plain') || read('text/tsv') || read('text/csv');
              const clipboardFormat = getDOMClipboardFormatKey(context.editor);
              const exactMime = `application/${clipboardFormat}`;
              const hasExactMime =
                types.includes(exactMime) || read(exactMime).length > 0;
              const hasEmbeddedExact = hasEmbeddedPliteFragment(
                html,
                clipboardFormat
              );
              const hasRecognizedExact = hasExactMime || hasEmbeddedExact;
              const view = context.api.getSelection();
              const hasStructuralTarget =
                !!view &&
                (isTableCellSelection(view.selection) ||
                  view.anchors.length > 1);
              const source: TablePasteSource = hasRecognizedExact
                ? 'model'
                : html
                  ? 'html'
                  : types.includes('text/tsv') ||
                      types.includes('text/tab-separated-values') ||
                      text.includes('\t')
                    ? 'tsv'
                    : 'csv';
              const exactSlice = readDOMFragmentData(context.editor, data);
              const exactTable =
                exactSlice &&
                getTablePasteElement(exactSlice, {
                  cellTypes: context.api.getCellTypes(),
                  rowType: context.editor.getType(KEYS.tr),
                  tableType: context.type,
                });

              if (hasStructuralTarget && hasRecognizedExact && !exactSlice) {
                context.editor.api.debug.warn(
                  'Table paste rejected: invalid-source.',
                  'TABLE_MUTATION_DIAGNOSTIC',
                  { kind: 'invalid-source', reason: 'malformed-exact' }
                );

                return true;
              }

              if (exactSlice && exactTable) {
                const grid = compileTableGrid(exactTable);

                if (
                  grid.height === 0 ||
                  grid.width === 0 ||
                  grid.anchors.length === 0
                ) {
                  context.editor.api.debug.warn(
                    'Table paste rejected: invalid-source.',
                    'TABLE_MUTATION_DIAGNOSTIC',
                    { kind: 'invalid-source', reason: 'empty' }
                  );

                  return true;
                }

                return withTablePasteSource(context.editor, 'model', () =>
                  next(data)
                );
              }

              return withTablePasteSource(context.editor, source, () =>
                next(data)
              );
            },
          },
        },
        {
          commands: ({ handle }) => [
            handle(editorCommands.replaceSlice, ({ input, state }) => {
              const { slice } = input;
              const selection = state.selection();
              const rejectTablePaste = (diagnostic: TablePasteDiagnostic) => {
                context.editor.api.debug.warn(
                  `Table paste rejected: ${diagnostic.kind}.`,
                  'TABLE_MUTATION_DIAGNOSTIC',
                  diagnostic
                );

                return state.transaction(() => {});
              };

              if (!selection) return false;

              const view = context.api.getSelection(selection, state);

              if (!view) return false;

              const root = view.root;
              let source = getTablePasteElement(slice, {
                cellTypes: context.api.getCellTypes(),
                rowType: context.editor.getType(KEYS.tr),
                tableType: context.type,
              });
              let ordinary = false;

              if (!source) {
                if (
                  !isTableCellSelection(view.selection) &&
                  view.anchors.length <= 1
                ) {
                  return false;
                }

                const children = state.slice.fitContent(slice, {
                  parent: view.anchor.cell,
                  ...(root === undefined ? {} : { root }),
                });

                if (children === null) {
                  return rejectTablePaste({
                    kind: 'invalid-source',
                    reason: 'content-rejected',
                  });
                }

                source = createOrdinaryTablePasteElement(children, {
                  cell: view.anchor.cell,
                  rowType: context.editor.getType(KEYS.tr),
                  tableType: context.type,
                });
                ordinary = true;
              }

              const prepared = prepareTablePaste(source, {
                createCell: ({ children, header, sourceRow }) =>
                  context.api.createCell({
                    children: children ? [...children] : undefined,
                    header,
                    row: sourceRow,
                  }),
                createRow: () => context.api.createRow({ colCount: 0 }),
                source:
                  tablePasteSources.get(context.editor)?.at(-1) ?? 'model',
              });

              if ('kind' in prepared) {
                return rejectTablePaste(prepared);
              }

              const fillBounds =
                isTableCellSelection(view.selection) || view.anchors.length > 1
                  ? view.bounds
                  : undefined;
              const plan = planPreparedTablePaste(view.context, prepared, {
                createCell: ({ children, header, sourceRow }) =>
                  context.api.createCell({
                    children: children ? [...children] : undefined,
                    header,
                    row: sourceRow,
                  }),
                createRow: () => context.api.createRow({ colCount: 0 }),
                disableExpand: context.getOptions().disableExpandOnInsert,
                ...(fillBounds ? { fillBounds } : {}),
                fitChildren: ordinary
                  ? (_cell, children) => children
                  : (cell, children) =>
                      state.slice.fitContent(ContentSlice.closed(children), {
                        parent: cell,
                        ...(root === undefined ? {} : { root }),
                      }),
                ...(root === undefined ? {} : { root }),
                startCol: fillBounds?.minCol ?? view.anchor.col,
                startRow: fillBounds?.minRow ?? view.anchor.row,
              });

              if (plan.kind !== 'plan') {
                return rejectTablePaste(plan);
              }

              return state.transaction((tx) => {
                applyPreparedTablePastePlan(tx, plan);
              });
            }),
          ],
        },
        {
          commands: ({ around }) => [
            around(editorCommands.insertText, ({ state, next }) => {
              const selection = state.selection();

              if (!selection || !state.selection.isExpanded()) return next();
              const cells = context.api.getGridAbove(
                { at: selection, format: 'cell' },
                state
              );

              if (cells.length < 2) return next();

              const focus = state.points.start(cells.at(-1)![1]);
              const transaction = state.transaction((tx) => {
                cells.forEach(([, path]) => {
                  tx.nodes.replaceChildren(
                    [
                      {
                        children: [{ text: '' }],
                        type: context.editor.getType(KEYS.p),
                      },
                    ],
                    { at: path }
                  );
                });

                if (focus) {
                  tx.selection.set({ anchor: focus, focus });
                }
              });

              return next.after(transaction);
            }),
          ],
        },
        {
          corrections: [
            {
              event: 'content',
              correct({ entry, tx }) {
                const [node, path] = entry;

                if (!ElementApi.isElement(node)) {
                  return;
                }

                const { enableUnsetSingleColSize, initialTableWidth } =
                  context.getOptions();

                if (node.type === context.type) {
                  const table = node as TTableElement;
                  const repair = planTableMutation(
                    createDetachedTableContext(table, path),
                    {
                      createCell: ({ children, header, sourceRow }) =>
                        context.api.createCell({
                          children: children ? [...children] : undefined,
                          header,
                          row: sourceRow,
                        }),
                      kind: 'repair',
                    }
                  );

                  if (repair.kind !== 'plan') {
                    context.editor.api.debug.warn(
                      `Table correction rejected: ${repair.kind}.`,
                      'TABLE_MUTATION_DIAGNOSTIC',
                      repair
                    );
                    return;
                  }

                  if (repair.operations.length > 0) {
                    applyTableMutationPlan(tx, repair);
                    return;
                  }

                  if (
                    table.colSizes?.length &&
                    enableUnsetSingleColSize &&
                    context.api.getColumnCount(table) < 2
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

                      if (
                        !table.colSizes ||
                        table.colSizes.some((size) => !size)
                      ) {
                        tx.nodes.set<TTableElement>({ colSizes }, { at: path });
                        return;
                      }
                    }
                  }
                }
              },
            },
          ],
        },
        {
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
              domRange: (selection) =>
                Object.freeze({
                  anchor: selection.anchor,
                  focus: selection.anchor,
                }),
              kind: 'table-cell',
              map(selection, context) {
                const range = context.mapRange(selection, {
                  association: 'outward',
                });
                const seen = new Set<string>();
                const cells = selection.cells.flatMap((cell) => {
                  const mapped = context.mapRange(cell, {
                    association: 'outward',
                    deletion: 'drop',
                  });

                  if (!mapped) return [];

                  const key = JSON.stringify([
                    mapped.anchor.root ?? context.root,
                    mapped.anchor.path,
                    mapped.anchor.offset,
                    mapped.focus.root ?? context.root,
                    mapped.focus.path,
                    mapped.focus.offset,
                  ]);

                  if (seen.has(key)) return [];

                  seen.add(key);

                  return [mapped];
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
              if (!state.selection() || state.selection.isCollapsed())
                return false;

              const cells = context.api.getGridAbove({ format: 'cell' }, state);

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
              if (!state.selection() || state.selection.isCollapsed())
                return false;

              const cells = context.api.getGridAbove({ format: 'cell' }, state);

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
              if (!state.selection() || state.selection.isCollapsed())
                return next();

              const cells = context.api.getGridAbove({ format: 'cell' }, state);

              if (cells.length <= 1) return next();

              const cellPaths = cells.map(([, cellPath]) => cellPath);

              if (input.options?.at) {
                const target = input.options.at;
                const range = PathApi.isPath(target)
                  ? undefined
                  : state.ranges.get(target);
                const targetsSelectedCell = PathApi.isPath(target)
                  ? cellPaths.some((cellPath) =>
                      PathApi.isCommon(cellPath, target)
                    )
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
                      !cellPaths.some((cellPath) =>
                        PathApi.isCommon(cellPath, path)
                      )
                    ) {
                      return false;
                    }

                    if (optionMatch)
                      return NodeApi.matches(node, optionMatch, path);
                    if (optionAt && PathApi.isPath(optionAt)) {
                      return PathApi.equals(path, optionAt);
                    }

                    return (
                      ElementApi.isElement(node) && state.nodes.isBlock(node)
                    );
                  },
                },
              });
            }),
          ],
          queries: {
            marks: {
              get({ next }) {
                const selection = context.editor.read.selection();

                if (!selection || context.editor.read.selection.isCollapsed()) {
                  return next();
                }

                const cells = context.api.getGridAbove({ format: 'cell' });

                if (cells.length <= 1) return next();

                const markCounts: Record<string, number> = {};
                const marks: Record<string, unknown> = {};
                let textCount = 0;

                cells.forEach(([, cellPath]) => {
                  context.editor.read.nodes
                    .toArray({
                      at: cellPath,
                      match: (node) => TextApi.isText(node),
                    })
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
        },
      ],
    };
  });

export type TableConfig = InferConfig<typeof BaseTablePlugin>;
