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
  defineBasePlugin,
  DebugPlugin,
  type DefinitionOf,
  type PlateNodeInsertOptions,
} from '@platejs/core';
import {
  ContentSlice,
  defineValueCodec,
  type Descendant,
  type EditorAboveOptions,
  editorCommands,
  editorReads,
  type EditorSelectionSpec,
  type EditorStateView,
  type Element,
  type ElementOf,
  ElementApi,
  type ElementEntry,
  type Location,
  type Node,
  NodeApi,
  type NodeEntry,
  type Path,
  PathApi,
  PointApi,
  property,
  type Range,
  RangeApi,
  type NodeKey,
  schema,
  SelectionApi,
  TextApi,
} from '@platejs/plite';
import { clipboardHandler } from '@platejs/plite-dom';
import { PLUGINS } from '@platejs/utils';
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
import {
  compileTableGrid,
  getTableColumnSizes,
  isTableColumnSizes,
  type TableGridAnchor,
} from './internal/grid';
import {
  applyTableMutationPlan,
  planTableMutation,
  type TableIntent,
} from './internal/mutation';
import {
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
  state: Pick<EditorStateView<any, any>, 'nodes' | 'points' | 'selection'>
) => {
  if (
    !state.selection.isAcrossBlocks({
      at: selection,
      type: tableType,
    })
  ) {
    return selection;
  }

  const anchorTable = state.nodes.block({
    at: selection.anchor,
    type: tableType,
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
      type: tableType,
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

export type TableCellSelection = Range &
  Readonly<{
    cells: readonly Range[];
    kind: 'table-cell';
  }>;

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

const projectTableSlice = (
  slice: ContentSlice,
  tableType: string,
  selectedTable: Element | undefined
): ContentSlice => {
  const content: Descendant[] = [];
  let projected = false;
  const tableNodes = slice.content.filter(
    (node) => ElementApi.isElement(node) && node.type === tableType
  );
  const sourceTable = tableNodes.length === 1 ? selectedTable : undefined;

  slice.content.forEach((node) => {
    if (!ElementApi.isElement(node) || node.type !== tableType) {
      content.push(node);
      return;
    }

    if (!sourceTable) {
      content.push(node);
      return;
    }

    const rows = node.children as TableRowElement[];
    const rowCount = rows.length;

    if (!rowCount) {
      content.push(node);
      return;
    }

    const colCount = rows[0].children.length;

    projected = true;

    if (rowCount <= 1 && colCount <= 1) {
      const cell = rows[0].children[0] as TableCellElement;

      content.push(...cell.children);
      return;
    }

    content.push({
      ...sourceTable,
      ...node,
      children: sourceTable.children,
    });
  });

  return projected
    ? ContentSlice.fromJSON({
        ...slice,
        content,
        openEnd: 0,
        openStart: 0,
      })
    : slice;
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

export type TablePluginState = {
  /** Disable expanding the table when inserting cells. */
  disableExpandOnInsert?: boolean;
  /** Disable first column left resizer. */
  disableMarginLeft?: boolean;
  /** Disable cell merging functionality. */
  disableMerge: boolean;
  /** Preserve the first column width when the table has one column. */
  enableUnsetSingleColSize?: boolean;
  /** Initial table width used to derive missing column sizes. */
  initialTableWidth?: number;
  /** Minimum column width. */
  minColumnWidth: number;
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
  cells?: TableCellElement[];
};

export type TableCellBorder = {
  color?: string;
  size?: number;
  style?: string;
};

export type TableCellBorders = {
  /** Only the last row cells have a bottom border. */
  bottom?: TableCellBorder;
  left?: TableCellBorder;
  /** Only the last column cells have a right border. */
  right?: TableCellBorder;
  top?: TableCellBorder;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isTableCellBorder = (value: unknown): value is TableCellBorder =>
  isRecord(value) &&
  (!('color' in value) || typeof value.color === 'string') &&
  (!('size' in value) ||
    (typeof value.size === 'number' && Number.isFinite(value.size))) &&
  (!('style' in value) || typeof value.style === 'string');

const tableCellBordersProperty = property.json({
  validate: (value): value is TableCellBorders =>
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

export const BaseTableCellPlugin = defineBasePlugin(PLUGINS.tableCell, {
  dependencies: [BaseParagraphPlugin],
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: BaseParagraphPlugin,
        min: 1,
      }),
      properties: {
        background: property.string(),
        borders: tableCellBordersProperty,
        colSpan: property.number(),
        header: property.boolean({ default: false, omitDefault: true }),
        rowSpan: property.number(),
        size: property.number(),
      },
      blockContent: false,
    },
  }),
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => ({
          ...parseTableCellHtml(element),
          ...(element.tagName === 'TH' ? { header: true } : {}),
        }),
        encode: ({ content, node }) => ({
          ...getTableCellHtmlCodecProps(node),
          children: content,
          tag: node.header ? 'th' : 'td',
        }),
        match: [{ tag: 'td' }, { tag: 'th' }],
      },
      'text/markdown': {
        encode: ({ encode, isPhrasing, node }) => {
          const blocks = encode(node.children);
          const children = blocks.flatMap((block, index) => {
            const content =
              block.type === 'paragraph'
                ? block.children
                : isPhrasing(block)
                  ? [block]
                  : [];

            if (block.type !== 'paragraph' && !isPhrasing(block)) {
              throw new Error(
                'Markdown table cells can only contain inline content.'
              );
            }

            return index === blocks.length - 1
              ? content
              : [...content, { type: 'html' as const, value: '<br/>' }];
          });

          return { children, type: 'tableCell' };
        },
        kind: 'node',
      },
    }),
  render: { nodeProps: ({ element }) => getTableCellHtmlProps(element) },
  rules: { merge: { removeEmpty: false } },
});

export const BaseTableRowPlugin = defineBasePlugin(PLUGINS.tableRow, {
  dependencies: [BaseTableCellPlugin],
  schema: {
    element: {
      content: schema.content.element(BaseTableCellPlugin, {
        // A row fully covered by row spans has no physical cell children.
        min: 0,
      }),
      properties: { size: property.number() },
      blockContent: false,
    },
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
      'text/markdown': {
        encode: ({ encode, node }) => {
          const children = encode(node.children);

          if (!children.every((child) => child.type === 'tableCell')) {
            throw new Error(
              'Markdown table rows can only contain table cells.'
            );
          }

          return { children, type: 'tableRow' };
        },
        kind: 'node',
      },
    }),
});

const csvSpecialCharacterPattern = /[",\r\n]/;
const tablePasteSources = new WeakMap<object, TablePasteSource[]>();

const initialState: TablePluginState = {
  disableMerge: false,
  minColumnWidth: 48,
};

const escapeCsvField = (value: string) =>
  csvSpecialCharacterPattern.test(value)
    ? `"${value.replaceAll('"', '""')}"`
    : value;

export type TableRowElement = ElementOf<typeof BaseTableRowPlugin>;

export type TableCellElement = ElementOf<typeof BaseTableCellPlugin>;

/** Enables support for tables. */
export const BaseTablePlugin = defineBasePlugin(PLUGINS.table, {
  dependencies: [BaseTableRowPlugin],
  initialState,
  schema: {
    element: {
      content: schema.content.element(BaseTableRowPlugin, { min: 1 }),
      properties: {
        colSizes: property.json({
          validate: isTableColumnSizes,
          validationVersion: 1,
        }),
        marginLeft: property.number(),
      },
    },
  },
  codecs: ({ defineCodecs, editor, schema: { type } }) =>
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
      'text/markdown': {
        decode: ({ decode, decoration, isBlock, isInline, node }) => {
          const cellType = editor.plugin(BaseTableCellPlugin).schema.type;
          const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
          const rowType = editor.plugin(BaseTableRowPlugin).schema.type;
          const rows = node.children.map((row, rowIndex) => ({
            children: row.children.map((cell) => {
              const children = decode(cell.children, decoration);
              const grouped: Descendant[] = [];
              let inline: Descendant[] = [];
              const flush = () => {
                if (inline.length === 0) return;

                grouped.push({ children: inline, type: paragraphType });
                inline = [];
              };

              children.forEach((child) => {
                if (
                  ElementApi.isElement(child) &&
                  !isInline(child) &&
                  isBlock(child)
                ) {
                  flush();
                  grouped.push(child);
                } else {
                  inline.push(child);
                }
              });
              flush();

              return {
                children:
                  grouped.length > 0
                    ? grouped
                    : [
                        {
                          children: [{ text: '' }],
                          type: paragraphType,
                        },
                      ],
                ...(rowIndex === 0 ? { header: true } : {}),
                type: cellType,
              };
            }),
            type: rowType,
          }));

          return { children: rows, type };
        },
        encode: ({ encode, node }) => {
          const children = encode(node.children);

          if (!children.every((child) => child.type === 'tableRow')) {
            throw new Error('Markdown tables can only contain table rows.');
          }

          return { children, type: 'table' };
        },
        from: 'table',
        kind: 'node',
      },
    }),
})

  .extend(({ editor }) => ({
    api: () => ({
      createCell: ({
        children,
        header,
        row,
      }: CreateCellOptions = {}): TableCellElement => {
        const isHeader =
          header ??
          (row
            ? (row as Element).children.every(
                (cell) => ElementApi.isElement(cell) && cell.header === true
              )
            : false);

        return {
          children: children ?? [
            {
              children: [{ text: '' }],
              type: editor.plugin(BaseParagraphPlugin).schema.type,
            },
          ],
          ...(isHeader ? { header: true } : {}),
          type: editor.plugin(BaseTableCellPlugin).schema.type,
        };
      },
      getCellChildren: (cell: TableCellElement) => [...cell.children],
      isCell: (node: Node): node is TableCellElement =>
        ElementApi.isElement(node) &&
        node.type === editor.plugin(BaseTableCellPlugin).schema.type,
      getColSpan,
      getColumnCount: (tableNode: Element) => compileTableGrid(tableNode).width,
      getRowSpan,
      isRectangular: (table?: Element) =>
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
  }))
  .extend(({ api, editor }) => ({
    api: () => ({
      createRow: ({
        colCount = 1,
        ...cellOptions
      }: GetEmptyRowNodeOptions = {}): TableRowElement => ({
        children: Array.from({ length: colCount }, () =>
          api.createCell(cellOptions)
        ),
        type: editor.plugin(BaseTableRowPlugin).schema.type,
      }),
      getOverriddenColumnSizes: (
        tableNode: Element,
        colSizeOverrides?: TableStoreSizeOverrides
      ): number[] => {
        const colCount = api.getColumnCount(tableNode);
        const colSizes = getTableColumnSizes(tableNode);

        return (
          colSizes
            ? [...colSizes]
            : (Array.from({ length: colCount }).fill(0) as number[])
        ).map((size, index) => colSizeOverrides?.get?.(index) ?? size);
      },
    }),
  }))
  .extend(({ api, editor, schema: { type } }) => ({
    api: () => ({
      create: ({
        colCount,
        header,
        rowCount = 0,
        ...cellOptions
      }: GetEmptyTableNodeOptions = {}): Element => ({
        children: Array.from({ length: rowCount }, (_, index) =>
          api.createRow({
            colCount,
            ...cellOptions,
            header: header && index === 0,
          })
        ),
        type,
      }),
    }),
    read: ({ state }) => {
      const getCellIndicesByKey = (key: NodeKey): CellIndices | undefined => {
        const cellPath = state.nodes.path(key);

        if (!cellPath) return;

        const anchor = createTableContext(
          state,
          cellPath.slice(0, -2)
        )?.anchorAtPath(cellPath);

        return anchor ? { col: anchor.col, row: anchor.row } : undefined;
      };

      return {
        getCellIndicesByKey,
        getCellIndices: (element: TableCellElement): CellIndices => {
          const cellPath = state.nodes.path(element);
          const context = cellPath
            ? createTableContext(state, cellPath.slice(0, -2))
            : null;
          const anchor =
            (cellPath ? context?.anchorAtPath(cellPath) : undefined) ??
            context?.anchorOf(element);
          return anchor
            ? { col: anchor.col, row: anchor.row }
            : { col: 0, row: 0 };
        },
        getSelection: (at?: Location) =>
          readTableSelection(state, {
            at,
            cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
            tableType: type,
          }),
      };
    },
  }))
  .extend(({ api, editor, plugin, schema: { type } }) => ({
    read: ({ state }) => {
      const getSelectedCellsBoundingBox = (
        cells: TableCellElement[]
      ): {
        maxCol: number;
        maxRow: number;
        minCol: number;
        minRow: number;
      } => {
        const currentView = state.table.getSelection();
        const firstCell = cells[0];
        const currentContextOwnsFirstCell =
          currentView &&
          firstCell &&
          currentView.context.anchorOf(firstCell)?.cell === firstCell;
        const findTableContainingCell = (
          cell: TableCellElement
        ): Element | undefined => {
          const visit = (children: readonly Node[]): Element | undefined => {
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
                return node as Element;
              }

              const nested = visit(node.children);

              if (nested) return nested;
            }
          };
          const value = state.value();

          return (
            visit(value.children) ??
            Object.values(value.roots ?? {}).reduce<Element | undefined>(
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
        options: GetTableRangeOptions<'all'>
      ): TableRangeEntries;
      function getGridByRange(
        options: GetTableRangeOptions<'cell' | 'table'>
      ): ElementEntry[];
      function getGridByRange({
        at,
        format = 'table',
      }: GetTableRangeOptions<TableRangeFormat>):
        | ElementEntry[]
        | TableRangeEntries {
        const view = readTableSelection(state, {
          at,
          cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
          tableType: type,
        });
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
        createCellSelection: (at: Location): TableCellSelection | null => {
          const range = RangeApi.isRange(at) ? at : state.ranges.get(at);

          if (!range) return null;

          const view = state.table.getSelection(range);

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
          const view = state.table.getSelection(at);

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
          const view = state.table.getSelection(currentRowAt);
          const anchor = view?.grid.anchorsByRow[view.anchor.row + 1]?.[0];

          return anchor && view
            ? view.context.entryAt(anchor.row, anchor.col)
            : undefined;
        },
        getCellInPreviousRow: (
          currentRowAt: Location
        ): NodeEntry | undefined => {
          const view = state.table.getSelection(currentRowAt);
          const anchors = view?.grid.anchorsByRow[view.anchor.row - 1];
          const anchor = anchors?.at(-1);

          return anchor && view
            ? view.context.entryAt(anchor.row, anchor.col)
            : undefined;
        },
        getEntries: ({
          at = state.selection(),
        }: {
          at?: Location | null;
        } = {}) => {
          if (!at) return;

          const cellEntry = state.nodes.find({
            at,
            match: api.isCell,
          });

          if (!cellEntry) return;

          const rowEntry = state.nodes.above({
            at: cellEntry[1],
            type: BaseTableRowPlugin,
          });

          if (!rowEntry) return;

          const tableEntry = state.nodes.above({
            at: rowEntry[1],
            type: plugin,
          });

          if (!tableEntry) return;

          return {
            cell: cellEntry,
            row: rowEntry,
            table: tableEntry,
          };
        },
        getGridAbove: ({
          format = 'table',
          ...options
        }: GetTableRangeAboveOptions = {}): ElementEntry[] => {
          const view = readTableSelection(state, {
            at: options.at,
            cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
            tableType: type,
          });

          if (!view) return [];

          return format === 'cell'
            ? [...view.cellEntries]
            : [[projectTableSelection(view), view.tablePath]];
        },
        getGridByRange,
        getNextCell: (
          currentCell: NodeEntry,
          currentAt: Location,
          _currentRow: NodeEntry
        ): NodeEntry | undefined => {
          const view = state.table.getSelection(currentAt);
          const anchor = ElementApi.isElement(currentCell[0])
            ? view?.context.anchorOf(currentCell[0] as TableCellElement)
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
          const view = state.table.getSelection(currentAt);
          const anchor = ElementApi.isElement(currentCell[0])
            ? view?.context.anchorOf(currentCell[0] as TableCellElement)
            : undefined;
          const previous =
            view && anchor
              ? getTableSelectionNeighbor(view.context, anchor, 'previous')
              : undefined;

          return previous
            ? view?.context.entryAt(previous.row, previous.col)
            : undefined;
        },
        getSelectedCell: (key?: NodeKey | null) => {
          if (!key) return null;

          const view = state.table.getSelection();

          return view && view.anchors.length > 1 && view.hasCellKey(key)
            ? (view.grid.byKey.get(key)?.cell ?? null)
            : null;
        },
        getSelectedCellEntries: (): ElementEntry[] => {
          const cellEntries = state.table.getSelection()?.cellEntries ?? [];

          return cellEntries.length > 1 ? [...cellEntries] : [];
        },
        getSelectedCellKeys: (): NodeKey[] | null => {
          const view = state.table.getSelection();

          return view && view.anchors.length > 1 && view.cellKeys.length > 0
            ? [...view.cellKeys]
            : null;
        },
        getSelectedCells: (): Element[] | null => {
          const view = state.table.getSelection();

          return view && view.anchors.length > 1
            ? view.anchors.map(({ cell }) => cell)
            : null;
        },
        getSelectedCellsBoundingBox,
        getSelectedTableKeys: (): NodeKey[] | null => {
          const view = state.table.getSelection();
          const tableKey = view?.tableKey;

          return view && view.anchors.length > 1 && tableKey
            ? [tableKey]
            : null;
        },
        getSelectedTables: (): Element[] | null => {
          const view = state.table.getSelection();

          return view && view.anchors.length > 1 ? [view.table] : null;
        },
        isCellSelected: (key?: NodeKey | null) => {
          if (!key) return false;

          const view = state.table.getSelection();

          return !!view && view.anchors.length > 1 && view.hasCellKey(key);
        },
        isSelectingCell: () =>
          (state.table.getSelection()?.anchors.length ?? 0) > 1,
      };
    },
  }))
  .extend(({ api, editor, plugin, read, schema: { type } }) => ({
    read: ({ state }) => ({
      getCellBorders: ({
        cellIndices,
        defaultBorder = { size: 1 },
        element,
      }: {
        element: TableCellElement;
        cellIndices?: CellIndices;
        defaultBorder?: TableCellBorder;
      }): BorderStylesDefault => {
        const cellPath = state.nodes.path(element);

        if (!cellPath) {
          return { bottom: defaultBorder, right: defaultBorder };
        }

        const [rowNode, rowPath] =
          state.nodes.parent(cellPath, { type: BaseTableRowPlugin }) ?? [];

        if (!rowNode || !rowPath) {
          return { bottom: defaultBorder, right: defaultBorder };
        }

        const [tableNode] = state.nodes.parent(rowPath, { type: plugin }) ?? [];

        if (!tableNode || tableNode.type !== type) {
          return { bottom: defaultBorder, right: defaultBorder };
        }

        const { col } = cellIndices ?? state.table.getCellIndices(element);
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
        element: TableCellElement;
        cellIndices?: CellIndices;
        colSizes?: number[];
        rowSize?: number;
      }): { minHeight: number; width: number } => {
        const path = state.nodes.path(element);

        if (!path) return { minHeight: rowSize ?? 0, width: 0 };

        if (!rowSize) {
          const [rowElement] =
            state.nodes.parent(path, { type: BaseTableRowPlugin }) ?? [];

          if (
            !rowElement ||
            rowElement.type !== editor.plugin(BaseTableRowPlugin).schema.type
          ) {
            return { minHeight: 0, width: 0 };
          }

          rowSize = rowElement.size ?? 0;
        }
        if (!colSizes) {
          const [, rowPath] =
            state.nodes.parent(path, { type: BaseTableRowPlugin }) ?? [];

          if (!rowPath) return { minHeight: rowSize, width: 0 };

          const [tableNode] =
            state.nodes.parent(rowPath, { type: plugin }) ?? [];

          if (!tableNode) return { minHeight: rowSize, width: 0 };

          colSizes = api.getOverriddenColumnSizes(tableNode);
        }

        const colSpan = getColSpan(element);
        const { col } = cellIndices ?? state.table.getCellIndices(element);
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
          const cell = state.nodes.block({
            match: api.isCell,
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

        const cellElements = cells.map((cell) => cell as TableCellElement);
        const { maxCol, maxRow, minCol, minRow } =
          state.table.getSelectedCellsBoundingBox(cellElements);
        let hasAnyBorder = false;
        let allOuterBordersSet = true;
        const borderStates = {
          bottom: false,
          left: false,
          right: false,
          top: false,
        };

        for (const cell of cellElements) {
          const { col, row } = state.table.getCellIndices(cell);
          const cellPath = state.nodes.path(cell);
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
                const cellAboveEntry = state.table.getAdjacentCell({
                  at: cellPath,
                  deltaRow: -1,
                });

                if (
                  cellAboveEntry &&
                  (cellAboveEntry[0].borders?.bottom?.size ?? 1) > 0
                ) {
                  hasAnyBorder = true;
                }
              }
              if (!isFirstCell) {
                const previousCellEntry = state.table.getAdjacentCell({
                  at: cellPath,
                  deltaCol: -1,
                });

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
                    const cellAboveEntry = state.table.getAdjacentCell({
                      at: cellPath,
                      deltaRow: -1,
                    });

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
                    const previousCellEntry = state.table.getAdjacentCell({
                      at: cellPath,
                      deltaCol: -1,
                    });

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
          const node = state.table.getAdjacentCell({ deltaCol: -1 })?.[0];

          if (node) return node.borders?.right?.size === 0;
        }
        if (border === 'top') {
          const node = state.table.getAdjacentCell({ deltaRow: -1 })?.[0];

          if (node) return node.borders?.bottom?.size === 0;
        }

        return (
          state.nodes.find({
            match: api.isCell,
          })?.[0].borders?.[border]?.size === 0
        );
      },
      isSelectedCellBorder: (
        cells: TableCellElement[],
        side: BorderDirection
      ): boolean => {
        const { maxCol, maxRow, minCol, minRow } =
          state.table.getSelectedCellsBoundingBox(cells);

        return cells.every((cell) => {
          const { col, row } = state.table.getCellIndices(cell);
          const colSpan = getColSpan(cell);
          const rowSpan = getRowSpan(cell);
          const cellPath = state.nodes.path(cell);

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

                const cellAboveEntry = state.table.getAdjacentCell({
                  at: cellPath,
                  deltaRow: -1,
                });

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

                const previousCellEntry = state.table.getAdjacentCell({
                  at: cellPath,
                  deltaCol: -1,
                });

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
      isSelectedCellBordersNone: (cells: TableCellElement[]): boolean =>
        cells.every((cell) => {
          const { borders } = cell;
          const { col, row } = state.table.getCellIndices(cell);
          const cellPath = state.nodes.path(cell);

          if (!cellPath) return true;
          if (row === 0 && (borders?.top?.size ?? 1) > 0) return false;
          if (col === 0 && (borders?.left?.size ?? 1) > 0) return false;
          if ((borders?.bottom?.size ?? 1) > 0) return false;
          if ((borders?.right?.size ?? 1) > 0) return false;

          if (row !== 0) {
            const cellAboveEntry = state.table.getAdjacentCell({
              at: cellPath,
              deltaRow: -1,
            });

            if (
              cellAboveEntry &&
              (cellAboveEntry[0].borders?.bottom?.size ?? 1) > 0
            ) {
              return false;
            }
          }
          if (col !== 0) {
            const previousCellEntry = state.table.getAdjacentCell({
              at: cellPath,
              deltaCol: -1,
            });

            if (
              previousCellEntry &&
              (previousCellEntry[0].borders?.right?.size ?? 1) > 0
            ) {
              return false;
            }
          }

          return true;
        }),
      isSelectedCellBordersOuter: (cells: TableCellElement[]): boolean => {
        const { maxCol, maxRow, minCol, minRow } =
          state.table.getSelectedCellsBoundingBox(cells);

        for (const cell of cells) {
          const { col, row } = state.table.getCellIndices(cell);
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
    }),
    api: () => ({
      writeSelection: (
        data: Pick<DataTransfer, 'getData' | 'setData'>
      ): boolean => {
        const cells = read.getGridAbove({ format: 'cell' });

        if (cells.length <= 1) return false;

        const [tableEntry] = read.getGridAbove({
          format: 'table',
        });

        if (!tableEntry) return false;

        const rows = tableEntry[0].children as TableRowElement[];
        const values = rows.map((row) =>
          (row.children as TableCellElement[]).map((cell) =>
            NodeApi.string(cell)
          )
        );
        const csv = `${values
          .map((row) => row.map(escapeCsvField).join(','))
          .join('\n')}\n`;
        const tsv = `${values.map((row) => row.join('\t')).join('\n')}\n`;

        editor.api.dom.clipboard.writeSlice(data, {
          formats: {
            'text/csv': csv,
            'text/plain': tsv,
            'text/tab-separated-values': tsv,
            'text/tsv': tsv,
          },
          slice: editor.read.slice.export(),
        });

        return true;
      },
    }),
  }))
  .extend(({ api, editor, plugin, store, schema: { type } }) => ({
    update: ({ tx }) => {
      const applyMutation = (
        context: NonNullable<ReturnType<typeof createTableContext>>,
        intent: TableIntent
      ) => {
        const result = planTableMutation(context, intent);

        if (result.kind !== 'plan') {
          editor
            .plugin(DebugPlugin)
            .api.warn(
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
          options: PlateNodeInsertOptions = {}
        ): void => {
          const newTable = api.create({ colCount, header, rowCount });
          let tablePath: Path | undefined;

          if (options.at !== undefined) {
            tablePath = PathApi.isPath(options.at)
              ? options.at
              : tx.nodes.path(options.at);
          } else {
            const currentTable = tx.nodes.above({
              type: plugin,
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
            editor
              .plugin(DebugPlugin)
              .api.warn(
                `Table mutation rejected: ${result.kind}.`,
                'TABLE_MUTATION_DIAGNOSTIC',
                result
              );

            return;
          }

          applyTableMutationPlan(tx, result);
        },
        insertColumn: (options: InsertTableColumnOptions = {}): void => {
          const { initialTableWidth, minColumnWidth } = store.get();
          const tableAt = options.at
            ? tx.nodes.get(options.at, { type: plugin })?.[0]
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
            const cellEntry = tx.nodes.find({
              at: options.fromCell,
              match: api.isCell,
            });

            if (!cellEntry) return;

            anchorPath = cellEntry[1];
            const tableEntry = tx.nodes.above({
              at: anchorPath,
              type: plugin,
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
            ? tx.nodes.get(options.at, { type: plugin })?.[0]
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
            const rowEntry = tx.nodes.find({
              at: options.fromRow ?? options.at,
              type: BaseTableRowPlugin,
            });

            if (!rowEntry) return;

            const tableEntry = tx.nodes.above({
              at: rowEntry[1],
              type: plugin,
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
            rowType: editor.plugin(BaseTableRowPlugin).schema.type,
            select: options.select,
          });
        },
        removeColumn: (): void => {
          const tableEntry = tx.nodes.above({
            type: plugin,
          });

          if (!tableEntry) return;

          const view = tx.selection.isExpanded()
            ? tx.table.getSelection()
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

          const cellEntry = tx.nodes.above({
            match: api.isCell,
          });

          if (!cellEntry) return;

          const selectedAnchor = context.anchorAtPath(cellEntry[1]);
          const selectedRow = context.table.children[
            selectedAnchor?.row ?? -1
          ] as TableRowElement | undefined;

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
          const tableEntry = tx.nodes.above({
            type: plugin,
          });

          if (!tableEntry) return;

          const view = tx.selection.isExpanded()
            ? tx.table.getSelection()
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

          const cellEntry = tx.nodes.above({
            match: api.isCell,
          });

          if (!cellEntry) return;

          applyMutation(context, {
            anchorPath: cellEntry[1],
            kind: 'remove-row',
          });
        },

        remove: () => {
          const tableEntry = tx.nodes.above({
            type: plugin,
          });

          if (!tableEntry) return;

          const context = createTableContext(tx, tableEntry[1]);

          if (!context) return;

          applyMutation(context, { kind: 'remove-table' });
        },
      };
    },
  }))
  .extend((context) => ({
    selectionKinds: [
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
        primaryRange: (selection) =>
          Object.freeze({
            anchor: selection.anchor,
            focus: selection.anchor,
          }),
        kind: 'table-cell',
        map(selection, mapContext) {
          const range = mapContext.mapRange(selection, {
            association: 'outward',
          });
          const seen = new Set<string>();
          const cells = selection.cells.flatMap((cell) => {
            const mapped = mapContext.mapRange(cell, {
              association: 'outward',
              deletion: 'drop',
            });

            if (!mapped) return [];

            const key = JSON.stringify([
              mapped.anchor.root ?? mapContext.root,
              mapped.anchor.path,
              mapped.anchor.offset,
              mapped.focus.root ?? mapContext.root,
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
        marks() {
          const cells = context.read.getGridAbove({
            format: 'cell',
          });
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
        ranges: (selection) => selection.cells,
        replacementRange: (selection) => selection,
        slice: (selection, state) =>
          projectTableSlice(
            state.slice.get({ at: selection }),
            context.schema.type,
            state.table.getGridAbove()[0]?.[0]
          ),
        validate: isTableCellSelection,
      } satisfies EditorSelectionSpec<TableCellSelection>,
    ],
  }))
  .extend((context) => {
    const { api, editor } = context;

    return {
      update: ({ tx }) => {
        const setBorderSizes = (options: readonly SetBorderSizeOptions[]) => {
          const updates = new Map<
            string,
            { borders: TableCellElement['borders']; path: Path }
          >();
          const addBorder = (
            [node, path]: NodeEntry<TableCellElement>,
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
            const cellEntry = tx.nodes.find({
              at,
              match: api.isCell,
            });

            if (!cellEntry) return;

            const [, cellPath] = cellEntry;
            const cellIndex = cellPath.at(-1);
            const rowIndex = cellPath.at(-2);
            const view = tx.table.getSelection(cellPath);
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
            tx.nodes.set({ borders }, { at: path });
          });
        };
        const applyMutation = (
          context: NonNullable<ReturnType<typeof createTableContext>>,
          intent: TableIntent
        ) => {
          const result = planTableMutation(context, intent);

          if (result.kind !== 'plan') {
            editor
              .plugin(DebugPlugin)
              .api.warn(
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
                const selected = tx.table.getSelection()?.cellEntries ?? [];

                if (selected.length > 1) {
                  return selected.map(([cell]) => cell as TableCellElement);
                }

                const cell = tx.nodes.block({
                  match: api.isCell,
                });

                return cell ? [cell[0] as TableCellElement] : [];
              })();

            if (selectedCells.length === 0) return;

            const targets = selectedCells.flatMap((cell) => {
              const path = tx.nodes.path(cell);

              if (!path) return [];

              const view = tx.table.getSelection(path);
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
            const apply = () => setBorderSizes(updates);

            if (border === 'none') {
              const size = tx.table.getSelectedCellsBorders(selectedCells).none
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
              tx.table.getSelectedCellsBoundingBox(selectedCells);

            if (border === 'outer') {
              const size = tx.table.getSelectedCellsBorders(selectedCells).outer
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

            const size = tx.table.isSelectedCellBorder(selectedCells, border)
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
            setBorderSizes([{ at, border, size }]);
          },
          merge: (): void => {
            const cellEntries = tx.table.getSelection()?.cellEntries ?? [];

            if (cellEntries.length < 2) return;

            const firstCellPath = cellEntries[0][1];
            const context = createTableContext(tx, firstCellPath.slice(0, -2));

            if (!context) return;

            const cellKeys = cellEntries.map(
              ([cell]) => context.anchorOf(cell)!.key
            );

            applyMutation(context, {
              cellKeys,
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
            const view = tx.table.getSelection(at);

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
                      tx.table.createCellSelection(range) ?? range
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
            const table = tx.nodes.above({ type: context.plugin });

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
                tx.table.createCellSelection(tableRange) ?? tableRange
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

                if (!cellPath) return;

                if (color === null) {
                  tx.nodes.unset('background', {
                    at: cellPath,
                  });
                } else {
                  tx.nodes.set({ background: color }, { at: cellPath });
                }
              });

              return;
            }

            const currentCell = tx.nodes.find({
              match: api.isCell,
            });

            if (!currentCell) return;

            if (color === null) {
              tx.nodes.unset('background', {
                at: currentCell[1],
              });
            } else {
              tx.nodes.set({ background: color }, { at: currentCell[1] });
            }
          },
          setColumnSize: (
            { colIndex, width }: { colIndex: number; width: number },
            options: TableFindOptions = {}
          ) => {
            const table = tx.nodes.find({
              ...options,
              type: context.plugin,
            });

            if (!table) return;

            const [tableNode, tablePath] = table;
            const currentColSizes = getTableColumnSizes(tableNode);
            const colSizes = currentColSizes
              ? [...currentColSizes]
              : Array.from({ length: api.getColumnCount(tableNode) }, () => 0);

            colSizes[colIndex] = width;

            tx.nodes.set({ colSizes }, { at: tablePath });
          },
          setRowSize: (
            { height, rowIndex }: { height: number; rowIndex: number },
            options: TableFindOptions = {}
          ) => {
            const table = tx.nodes.find({
              ...options,
              type: context.plugin,
            });

            if (!table) return;

            tx.nodes.set({ size: height }, { at: [...table[1], rowIndex] });
          },
          split: (): void => {
            const firstCell = tx.table.getSelection()?.cellEntries[0];

            if (!firstCell) return;

            const [cell, path] = firstCell;
            const context = createTableContext(tx, path.slice(0, -2));

            if (!context) return;

            const cellKey = context.anchorOf(cell)?.key;

            applyMutation(context, {
              ...(cellKey ? { anchorKey: cellKey } : { anchorPath: path }),
              createCell: ({ children, header, sourceRow }) =>
                api.createCell({
                  children: children ? [...children] : undefined,
                  header,
                  row: sourceRow,
                }),
              kind: 'split',
              rowType: editor.plugin(BaseTableRowPlugin).schema.type,
            });
          },
          tab: ({ reverse = false }: { reverse?: boolean } = {}) => {
            const selection = tx.selection();
            const view = selection ? tx.table.getSelection(selection) : null;

            if (
              selection &&
              tx.selection.isExpanded() &&
              (view?.anchors.length ?? 0) > 1
            ) {
              tx.selection.collapse({ edge: 'end' });
              return true;
            }

            const cellEntry = tx.nodes.find({
              match: api.isCell,
            });

            if (!cellEntry) return false;

            const tableView = tx.table.getSelection(cellEntry[1]);
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
    };
  })
  .extend((context) => {
    const { editor } = context;
    const withPasteSource = <T>(source: TablePasteSource, run: () => T): T => {
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

    return {
      contributions: [
        clipboardHandler({
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
            const exact = context.editor.api.dom.clipboard.readSlice(data);
            const hasRecognizedExact = exact.kind !== 'absent';
            const view = context.read.getSelection();
            const hasStructuralTarget =
              !!view &&
              (isTableCellSelection(view.selection) || view.anchors.length > 1);
            const source: TablePasteSource = hasRecognizedExact
              ? 'model'
              : html
                ? 'html'
                : types.includes('text/tsv') ||
                    types.includes('text/tab-separated-values') ||
                    text.includes('\t')
                  ? 'tsv'
                  : 'csv';
            const exactSlice = exact.kind === 'slice' ? exact.slice : null;
            const exactTable =
              exactSlice &&
              getTablePasteElement(exactSlice, {
                cellTypes: [
                  context.editor.plugin(BaseTableCellPlugin).schema.type,
                ],
                rowType: context.editor.plugin(BaseTableRowPlugin).schema.type,
                tableType: context.schema.type,
              });

            if (hasStructuralTarget && exact.kind === 'invalid') {
              context.editor
                .plugin(DebugPlugin)
                .api.warn(
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
                context.editor
                  .plugin(DebugPlugin)
                  .api.warn(
                    'Table paste rejected: invalid-source.',
                    'TABLE_MUTATION_DIAGNOSTIC',
                    { kind: 'invalid-source', reason: 'empty' }
                  );

                return true;
              }

              return withPasteSource('model', () => next(data));
            }

            return withPasteSource(source, () => next(data));
          },
        }),
      ],
    };
  })
  .extend((context) => ({
    corrections: [
      {
        event: 'content',
        correct({ entry, tx }) {
          const [node, path] = entry;

          if (!ElementApi.isElement(node)) {
            return;
          }

          const { enableUnsetSingleColSize, initialTableWidth } =
            context.store.get();

          if (node.type === context.schema.type) {
            const table = node as Element;
            const currentColSizes = getTableColumnSizes(table);
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
              context.editor
                .plugin(DebugPlugin)
                .api.warn(
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
              currentColSizes?.length &&
              enableUnsetSingleColSize &&
              context.api.getColumnCount(table) < 2
            ) {
              tx.nodes.unset('colSizes', { at: path });
              return;
            }

            if (initialTableWidth) {
              const colCount = (
                table.children[0] as TableRowElement | undefined
              )?.children.length;

              if (colCount) {
                const fallbackSize = initialTableWidth / colCount;
                const colSizes = currentColSizes
                  ? currentColSizes.map((size) => size || fallbackSize)
                  : Array.from({ length: colCount }, () => fallbackSize);

                if (!currentColSizes || currentColSizes.some((size) => !size)) {
                  tx.nodes.set({ colSizes }, { at: path });
                  return;
                }
              }
            }
          }
        },
      },
    ],
  }))
  .extend((context) => ({
    readMiddleware: ({ around }) => [
      around(editorReads.slice.export, ({ next, state }) => {
        const slice = next();

        return SelectionApi.isNode(state.selection())
          ? slice
          : projectTableSlice(
              slice,
              context.schema.type,
              context.read.getGridAbove()[0]?.[0]
            );
      }),
    ],
  }))
  .extend((context) => ({
    commands: ({ around, handle }) => [
      around(editorCommands.select, ({ input, state, next }) =>
        next({
          ...input,
          target: RangeApi.isRange(input.target)
            ? clampTableSelection(context.schema.type, input.target, state)
            : input.target,
        })
      ),
      around(editorCommands.setSelection, ({ input, state, next }) => {
        const selection = state.selection();

        if (!selection) return next();

        const nextSelection = { ...selection, ...input.props };
        const clamped = clampTableSelection(
          context.schema.type,
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
      handle(editorCommands.delete, ({ input, state }) => {
        const selection = state.selection();

        if (!selection || !state.selection.isCollapsed()) return false;

        const reverse = input.direction === 'forward';
        const cellEntry = state.nodes.block({
          type: BaseTableCellPlugin,
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
            type: BaseTableCellPlugin,
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
            type: context.plugin,
          })
        ) {
          const cells = state.table.getGridAbove({
            at: selection,
            format: 'cell',
          });

          if (cells.length < 2) return false;

          const anchor = state.points.start(cells[0][1]);
          const focus = state.points.start(cells.at(-1)![1]);
          const range = anchor && focus ? { anchor, focus } : null;

          const replacement = state.transaction((tx) => {
            cells.forEach(([, path]) => {
              tx.nodes.replaceChildren(
                [
                  {
                    children: [{ text: '' }],
                    type: context.editor.plugin(BaseParagraphPlugin).schema
                      .type,
                  },
                ],
                { at: path }
              );
            });
          });

          return range
            ? state.transaction.extend(replacement, (tx) => {
                const cellRanges = cells.flatMap(([, path]) => {
                  const anchor = tx.points.start(path);
                  const focus = tx.points.end(path);

                  return anchor && focus ? [{ anchor, focus }] : [];
                });
                const anchor = cellRanges[0]?.anchor;
                const focus = cellRanges.at(-1)?.anchor;

                if (anchor && focus && cellRanges.length > 1) {
                  tx.selection.set({
                    anchor,
                    cells: cellRanges,
                    focus,
                    kind: 'table-cell',
                  });
                } else {
                  tx.selection.set(range);
                }
              })
            : replacement;
        }

        return false;
      }),
      handle(editorCommands.replaceSlice, ({ input, state }) => {
        const { slice } = input;
        const selection = state.selection();
        const rejectTablePaste = (diagnostic: TablePasteDiagnostic) => {
          context.editor
            .plugin(DebugPlugin)
            .api.warn(
              `Table paste rejected: ${diagnostic.kind}.`,
              'TABLE_MUTATION_DIAGNOSTIC',
              diagnostic
            );

          return state.transaction(() => {});
        };

        if (!selection) return false;

        const view = state.table.getSelection(selection);

        if (!view) return false;

        const root = view.root;
        let source = getTablePasteElement(slice, {
          cellTypes: [context.editor.plugin(BaseTableCellPlugin).schema.type],
          rowType: context.editor.plugin(BaseTableRowPlugin).schema.type,
          tableType: context.schema.type,
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
          }) as TableCellElement['children'] | null;

          if (children === null) {
            return rejectTablePaste({
              kind: 'invalid-source',
              reason: 'content-rejected',
            });
          }

          source = createOrdinaryTablePasteElement(children, {
            cell: view.anchor.cell,
            rowType: context.editor.plugin(BaseTableRowPlugin).schema.type,
            tableType: context.schema.type,
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
          source: tablePasteSources.get(context.editor)?.at(-1) ?? 'model',
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
          disableExpand: context.store.get().disableExpandOnInsert,
          ...(fillBounds ? { fillBounds } : {}),
          fitChildren: ordinary
            ? (_cell, children) => children
            : (cell, children) => {
                const fitted = state.slice.fitContent(
                  ContentSlice.closed(children),
                  {
                    parent: cell,
                    ...(root === undefined ? {} : { root }),
                  }
                ) as TableCellElement['children'] | null;

                if (!fitted) return fitted;

                const anchor = view.context.anchorOf(cell);
                const at = view.context.tablePath
                  .concat(anchor?.path ?? [])
                  .concat(0);

                return fitted.map((node) =>
                  state.schema.copy(node, {
                    at,
                    ...(root === undefined ? {} : { root }),
                  })
                ) as TableCellElement['children'];
              },
          ...(root === undefined ? {} : { root }),
          startCol: fillBounds?.minCol ?? view.anchor.col,
          startRow: fillBounds?.minRow ?? view.anchor.row,
        });

        if (plan.kind !== 'plan') {
          return rejectTablePaste(plan);
        }

        return state.transaction((tx) => {
          applyTableMutationPlan(tx, {
            kind: 'plan',
            operations: plan.operations,
            selection: plan.selection,
          });
        });
      }),
      around(editorCommands.insertText, ({ state, next }) => {
        const selection = state.selection();

        if (!selection || !state.selection.isExpanded()) return next();
        const cells = state.table.getGridAbove({
          at: selection,
          format: 'cell',
        });

        if (cells.length < 2) return next();

        const focus = state.points.start(cells.at(-1)![1]);
        const transaction = state.transaction((tx) => {
          cells.forEach(([, path]) => {
            tx.nodes.replaceChildren(
              [
                {
                  children: [{ text: '' }],
                  type: context.editor.plugin(BaseParagraphPlugin).schema.type,
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
      handle(editorCommands.addMark, ({ input, state }) => {
        if (!state.selection() || state.selection.isCollapsed()) return false;

        const cells = state.table.getGridAbove({ format: 'cell' });

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

        const cells = state.table.getGridAbove({ format: 'cell' });

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

        const cells = state.table.getGridAbove({ format: 'cell' });

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
  }));

export type TableElement = ElementOf<typeof BaseTablePlugin>;
export type TableDefinition = DefinitionOf<typeof BaseTablePlugin>;
