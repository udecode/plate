import {
  BaseParagraphPlugin,
  defineBasePlugin,
  DebugPlugin,
  type DefinitionOf,
  type PlateNodeInsertOptions,
} from '@platejs/core';
import {
  ContentSlice,
  type Descendant,
  editorCommands,
  editorReads,
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
import {
  failInvariant,
  getSelectionRange as getEditorSelectionRange,
} from '@platejs/plite/internal';
import { PLUGINS } from '@platejs/utils';

import {
  getColSpan,
  getImportedTableCellColSpan,
  getRowSpan,
  getTableCellHtmlCodecProps,
  getTableCellHtmlProps,
  MAX_IMPORTED_TABLE_COLUMNS,
  parseHtmlColSpan,
  parseTableCellHtml,
  parseHtmlRowSpan,
  resetImportedTableCellSpans,
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
  getTableSelectionExpansion,
  getTableSelectionNeighbor,
  createTableNodeSelection,
  projectTableSelection,
  readTableSelection,
  type TableSelectionView,
} from './internal/selection';
import type {
  BorderDirection,
  BorderStylesDefault,
  CellIndices,
  CreateCellOptions,
  GetEmptyRowNodeOptions,
  GetEmptyTableNodeOptions,
  SetBorderWidthOptions,
  TableBorderStates,
  TableFindOptions,
  TableStoreSizeOverrides,
} from './types';

type GetSelectedCellsBordersOptions = {
  select?: {
    none?: boolean;
    outer?: boolean;
    side?: boolean;
  };
};

type TableCellBoundsInput = Readonly<{
  col: number;
  colSpan: number;
  row: number;
  rowSpan: number;
}>;

const getTableCellBounds = (cells: readonly TableCellBoundsInput[]) =>
  cells.reduce(
    (bounds, cell) => ({
      maxCol: Math.max(bounds.maxCol, cell.col + cell.colSpan - 1),
      maxRow: Math.max(bounds.maxRow, cell.row + cell.rowSpan - 1),
      minCol: Math.min(bounds.minCol, cell.col),
      minRow: Math.min(bounds.minRow, cell.row),
    }),
    {
      maxCol: Number.NEGATIVE_INFINITY,
      maxRow: Number.NEGATIVE_INFINITY,
      minCol: Number.POSITIVE_INFINITY,
      minRow: Number.POSITIVE_INFINITY,
    }
  );

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
  let { focus } = selection;

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

const getTableAnchorPoint = (
  view: TableSelectionView,
  anchor: TableGridAnchor,
  edge: 'end' | 'start' = 'start'
) => {
  const [text, path] =
    edge === 'end'
      ? NodeApi.last(anchor.cell, [])
      : NodeApi.first(anchor.cell, []);

  if (!TextApi.isText(text)) return undefined;

  return {
    offset: edge === 'end' ? text.text.length : 0,
    path: view.tablePath.concat(anchor.path, path),
    ...(view.root === undefined ? {} : { root: view.root }),
  };
};

const projectTableSelectionSlice = (
  slice: ContentSlice,
  view: TableSelectionView
) => {
  const projection = projectTableSelection(view);
  const exportedTable =
    slice.content.length === 1 &&
    ElementApi.isElement(slice.content[0]) &&
    slice.content[0].type === view.table.type
      ? slice.content[0]
      : null;

  return ContentSlice.withContent(
    slice,
    [
      exportedTable
        ? { ...projection, ...exportedTable, children: projection.children }
        : projection,
    ],
    { open: 'closed' }
  );
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

type ToggleTableBordersOptions = {
  border: BorderDirection | 'none' | 'outer';
  cells?: TableCellElement[];
};

export type TableCellBorder = {
  color?: string;
  style?: string;
  width?: number;
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

const isPositiveSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const isPositiveFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const getFallbackColumnWidth = ({
  columnCount,
  initialTableWidth,
  minColumnWidth,
}: {
  columnCount: number;
  initialTableWidth?: number;
  minColumnWidth?: number;
}) => {
  const minimum = isPositiveFiniteNumber(minColumnWidth) ? minColumnWidth : 1;

  return isPositiveFiniteNumber(initialTableWidth) && columnCount > 0
    ? Math.max(initialTableWidth / columnCount, minimum)
    : minimum;
};

const TABLE_CELL_BORDER_KEYS = new Set(['color', 'style', 'width']);

const isTableCellBorder = (value: unknown): value is TableCellBorder =>
  isRecord(value) &&
  Object.keys(value).every((key) => TABLE_CELL_BORDER_KEYS.has(key)) &&
  (!('color' in value) || typeof value.color === 'string') &&
  (!('width' in value) ||
    (typeof value.width === 'number' &&
      Number.isFinite(value.width) &&
      value.width >= 0)) &&
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

const HTML_PX_NUMBER_PATTERN = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:px)?$/i;

const parseHtmlCssNumber = (value: string | null | undefined) => {
  if (!value) return undefined;
  const normalized = value.trim();

  if (!HTML_PX_NUMBER_PATTERN.test(normalized)) return undefined;

  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const parsePositiveHtmlCssNumber = (value: string | null | undefined) => {
  const parsed = parseHtmlCssNumber(value);

  return parsed !== undefined && parsed > 0 ? parsed : undefined;
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
        backgroundColor: property.string(),
        borders: tableCellBordersProperty,
        colSpan: property.number({
          validate: isPositiveSafeInteger,
          validationVersion: 1,
        }),
        header: property.boolean({ default: false, omitDefault: true }),
        rowSpan: property.number({
          validate: isPositiveSafeInteger,
          validationVersion: 1,
        }),
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
      properties: {
        height: property.number({
          validate: isPositiveFiniteNumber,
          validationVersion: 1,
        }),
      },
      blockContent: false,
    },
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          const height = parsePositiveHtmlCssNumber(
            element.style.height || element.getAttribute('height')
          );

          return height === undefined ? {} : { height };
        },
        encode: ({ content, node }) => ({
          children: content,
          style: {
            height: node.height === undefined ? undefined : `${node.height}px`,
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

const MAX_IMPORTED_TABLE_CONSTRAINT_WORK = 10_000;
const TABLE_WIDTH_CONSTRAINT_EPSILON = 0.001;

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
        columnWidths: property.json({
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
          resetImportedTableCellSpans(element as HTMLTableElement);

          const colgroupColumns = Array.from(
            element.querySelectorAll(':scope > colgroup > col')
          );
          const colgroupWidths: Array<number | undefined> = [];
          let colgroupWidthInferenceTruncated = false;

          for (const column of colgroupColumns) {
            if (colgroupWidths.length >= MAX_IMPORTED_TABLE_COLUMNS) {
              colgroupWidthInferenceTruncated = true;
              break;
            }

            const importedSpan =
              parseHtmlColSpan(column.getAttribute('span')) ?? 1;
            const span = Math.min(
              importedSpan,
              MAX_IMPORTED_TABLE_COLUMNS - colgroupWidths.length
            );
            const width = parsePositiveHtmlCssNumber(
              (column as HTMLElement).style.width ||
                column.getAttribute('width')
            );

            if (span < importedSpan) colgroupWidthInferenceTruncated = true;
            for (let index = 0; index < span; index++) {
              colgroupWidths.push(width);
            }
          }
          const rows = Array.from(
            element.querySelectorAll(
              ':scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr, :scope > tr'
            )
          );
          const cellWidths: Array<number | undefined> = [...colgroupWidths];
          const exactCellWidths = colgroupWidths.map(
            (width) => width !== undefined
          );
          const spanWidthConstraints: Array<{
            indices: number[];
            total: number;
          }> = [];
          const occupiedRows: number[] = [];
          let currentRowGroup: HTMLElement | null = null;
          let columnCount = 0;
          let inferenceWork = 0;
          let widthInferenceTruncated = colgroupWidthInferenceTruncated;

          rows.forEach((row, rowIndex) => {
            if (row.parentElement !== currentRowGroup) {
              currentRowGroup = row.parentElement;
              occupiedRows.length = 0;
            } else if (rowIndex > 0) {
              occupiedRows.forEach((remaining, index) => {
                occupiedRows[index] = Math.max(0, remaining - 1);
              });
            }

            let column = 0;

            Array.from(
              row.querySelectorAll(':scope > td, :scope > th')
            ).forEach((cell) => {
              if (widthInferenceTruncated) return;

              const width = parsePositiveHtmlCssNumber(
                (cell as HTMLElement).style.width || cell.getAttribute('width')
              );
              const importedColumnSpan = getImportedTableCellColSpan(
                cell as HTMLElement
              );
              while (column < MAX_IMPORTED_TABLE_COLUMNS) {
                const candidateSpan = Math.min(
                  importedColumnSpan,
                  MAX_IMPORTED_TABLE_COLUMNS - column
                );
                let blocked = false;

                for (let offset = 0; offset < candidateSpan; offset++) {
                  inferenceWork += 1;
                  if (inferenceWork > MAX_IMPORTED_TABLE_CONSTRAINT_WORK) {
                    widthInferenceTruncated = true;
                    return;
                  }
                  if ((occupiedRows[column + offset] ?? 0) > 0) {
                    blocked = true;
                    break;
                  }
                }

                if (!blocked) break;
                column += 1;
              }
              if (column >= MAX_IMPORTED_TABLE_COLUMNS) {
                widthInferenceTruncated = true;
                return;
              }
              const columnSpan = Math.min(
                importedColumnSpan,
                MAX_IMPORTED_TABLE_COLUMNS - column
              );

              if (columnSpan < importedColumnSpan) {
                widthInferenceTruncated = true;
              }
              const rowSpanValue = parseHtmlRowSpan(cell as HTMLElement) ?? 1;
              const spanIndices = Array.from(
                { length: columnSpan },
                (_, offset) => column + offset
              );

              for (const index of spanIndices) {
                if (rowSpanValue > 1) {
                  occupiedRows[index] = Math.max(
                    occupiedRows[index] ?? 0,
                    rowSpanValue
                  );
                }
              }

              if (columnSpan === 1 && width !== undefined) {
                const index = spanIndices[0];

                if (
                  index !== undefined &&
                  colgroupWidths[index] === undefined
                ) {
                  cellWidths[index] = width;
                  exactCellWidths[index] = true;
                }
              } else if (width !== undefined) {
                inferenceWork += spanIndices.length;

                if (inferenceWork > MAX_IMPORTED_TABLE_CONSTRAINT_WORK) {
                  widthInferenceTruncated = true;
                } else {
                  spanWidthConstraints.push({
                    indices: spanIndices,
                    total: width,
                  });
                }
              }

              column += columnSpan;
              columnCount = Math.max(columnCount, column);
            });
          });

          const constraints = widthInferenceTruncated
            ? []
            : [...spanWidthConstraints].sort(
                (left, right) =>
                  (left.indices[0] ?? 0) - (right.indices[0] ?? 0) ||
                  (left.indices.at(-1) ?? 0) - (right.indices.at(-1) ?? 0) ||
                  left.total - right.total
              );
          const maxPasses = Math.min(
            MAX_IMPORTED_TABLE_COLUMNS + 1,
            Math.max(64, columnCount + 1, constraints.length + 1)
          );
          const resolvedCellWidths = [...exactCellWidths];

          for (let pass = 0; pass < columnCount; pass++) {
            let resolved = false;

            for (const constraint of constraints) {
              const unresolvedIndices = constraint.indices.filter(
                (columnIndex) => !resolvedCellWidths[columnIndex]
              );

              if (unresolvedIndices.length !== 1) continue;

              const targetIndex = unresolvedIndices[0];
              const knownWidth = constraint.indices.reduce(
                (total, columnIndex) =>
                  columnIndex === targetIndex
                    ? total
                    : total + (cellWidths[columnIndex] ?? 0),
                0
              );
              const inferredWidth = constraint.total - knownWidth;

              if (inferredWidth <= 0) continue;
              cellWidths[targetIndex] = inferredWidth;
              resolvedCellWidths[targetIndex] = true;
              resolved = true;
            }

            if (!resolved) break;
          }

          const constraintsSatisfied = () =>
            constraints.every((constraint) => {
              const width = constraint.indices.reduce(
                (total, columnIndex) => total + (cellWidths[columnIndex] ?? 0),
                0
              );

              return (
                Math.abs(width - constraint.total) <
                TABLE_WIDTH_CONSTRAINT_EPSILON * constraint.indices.length
              );
            });
          let constraintsConverged =
            constraints.length === 0 || constraintsSatisfied();

          for (
            let pass = 0;
            !constraintsConverged && pass < maxPasses;
            pass++
          ) {
            let largestAdjustment = 0;

            for (const constraint of constraints) {
              const adjustableIndices = constraint.indices.filter(
                (columnIndex) => !exactCellWidths[columnIndex]
              );

              if (adjustableIndices.length === 0) continue;

              const currentWidth = constraint.indices.reduce(
                (total, columnIndex) => total + (cellWidths[columnIndex] ?? 0),
                0
              );
              const adjustment =
                (constraint.total - currentWidth) / adjustableIndices.length;

              largestAdjustment = Math.max(
                largestAdjustment,
                Math.abs(adjustment)
              );
              adjustableIndices.forEach((columnIndex) => {
                cellWidths[columnIndex] =
                  (cellWidths[columnIndex] ?? 0) + adjustment;
              });
            }

            if (largestAdjustment < TABLE_WIDTH_CONSTRAINT_EPSILON) {
              constraintsConverged = constraintsSatisfied();
              break;
            }
          }

          if (!constraintsConverged) widthInferenceTruncated = true;
          if (
            cellWidths.some(
              (width, index) =>
                !exactCellWidths[index] &&
                width !== undefined &&
                (!Number.isFinite(width) || width <= 0)
            )
          ) {
            widthInferenceTruncated = true;
          }

          if (widthInferenceTruncated) {
            cellWidths.forEach((_width, index) => {
              if (!exactCellWidths[index]) cellWidths[index] = undefined;
            });
          }

          cellWidths.length = columnCount;
          const normalizedCellWidths = Array.from(
            { length: columnCount },
            (_, index) => cellWidths[index]
          );
          const widthCount = Math.max(
            colgroupWidths.length,
            normalizedCellWidths.length
          );
          const widths = Array.from(
            { length: widthCount },
            (_, index) => colgroupWidths[index] ?? normalizedCellWidths[index]
          );
          const columnWidths = widths.some((width) => width !== undefined)
            ? widths.map((width) => width ?? null)
            : undefined;
          const marginLeft = parseHtmlCssNumber(element.style.marginLeft);

          return {
            ...(columnWidths === undefined ? {} : { columnWidths }),
            ...(marginLeft === undefined ? {} : { marginLeft }),
          };
        },
        encode: ({ content, node }) => ({
          children: [
            ...(node.columnWidths && node.columnWidths.length > 0
              ? [
                  {
                    children: node.columnWidths.map((width) => ({
                      style: {
                        width: width === null ? undefined : `${width}px`,
                      },
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
  .extend(({ api, editor, store }) => ({
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
        const columnWidths = getTableColumnSizes(tableNode);
        const { initialTableWidth, minColumnWidth } = store.get();
        const fallbackWidth = getFallbackColumnWidth({
          columnCount: colCount,
          initialTableWidth,
          minColumnWidth,
        });

        return Array.from(
          { length: colCount },
          (_, index) =>
            colSizeOverrides?.get?.(index) ??
            columnWidths?.[index] ??
            fallbackWidth
        );
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

        if (!cellPath) return undefined;

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
        selection: (at?: Location) =>
          readTableSelection(state, {
            at,
            cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
            selection: state.selection(),
            tableType: type,
          }),
      };
    },
  }))
  .extend(({ api, editor, plugin, schema: { type } }) => ({
    read: ({ state }) => ({
      canMerge: () => {
        const view = state.table.selection();

        return (
          !state.view.isReadOnly() &&
          !!view &&
          view.anchors.length > 1 &&
          view.complete
        );
      },
      canSplit: () => {
        const view = state.table.selection();

        return (
          !state.view.isReadOnly() &&
          view?.anchors.length === 1 &&
          (view.anchor.colSpan > 1 || view.anchor.rowSpan > 1)
        );
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
        const view = state.table.selection(at);

        if (!view) return undefined;

        const row =
          view.anchor.row +
          (deltaRow > 0 ? view.anchor.rowSpan + deltaRow - 1 : deltaRow);
        const col =
          view.anchor.col +
          (deltaCol > 0 ? view.anchor.colSpan + deltaCol - 1 : deltaCol);

        return view.context.entryAt(row, col);
      },
      getCellInNextRow: (currentRowAt: Location): NodeEntry | undefined => {
        const view = state.table.selection(currentRowAt);
        const anchor = view?.grid.anchorsByRow[view.anchor.row + 1]?.[0];

        return anchor && view
          ? view.context.entryAt(anchor.row, anchor.col)
          : undefined;
      },
      getCellInPreviousRow: (currentRowAt: Location): NodeEntry | undefined => {
        const view = state.table.selection(currentRowAt);
        const anchors = view?.grid.anchorsByRow[view.anchor.row - 1];
        const anchor = anchors?.at(-1);

        return anchor && view
          ? view.context.entryAt(anchor.row, anchor.col)
          : undefined;
      },
      getEntries: ({
        at,
      }: {
        at?: Location | null;
      } = {}) => {
        const location = at ?? state.selection();

        if (!location) return undefined;

        const cellEntry = state.nodes.find({
          at: location,
          match: api.isCell,
        });

        if (!cellEntry) return undefined;

        const rowEntry = state.nodes.above({
          at: cellEntry[1],
          type: BaseTableRowPlugin,
        });

        if (!rowEntry) return undefined;

        const tableEntry = state.nodes.above({
          at: rowEntry[1],
          type: plugin,
        });

        if (!tableEntry) return undefined;

        return {
          cell: cellEntry,
          row: rowEntry,
          table: tableEntry,
        };
      },
      getNextCell: (
        currentCell: NodeEntry,
        currentAt: Location,
        _currentRow: NodeEntry
      ): NodeEntry | undefined => {
        const view = state.table.selection(currentAt);
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
        const view = state.table.selection(currentAt);
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
    }),
  }))
  .extend(({ api, editor, plugin, read, schema: { type }, store }) => ({
    read: ({ state }) => ({
      getCellBorders: ({
        cellIndices,
        defaultBorder = { width: 1 },
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
            width: border?.width ?? defaultBorder.width,
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
        columnWidths: initialColumnWidths,
        element,
        rowSize: initialRowSize,
      }: {
        element: TableCellElement;
        cellIndices?: CellIndices;
        columnWidths?: ReadonlyArray<number | null>;
        rowSize?: number;
      }): { minHeight: number; width: number } => {
        let rowSize = initialRowSize;
        let columnWidths = initialColumnWidths;
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

          rowSize = rowElement.height ?? 0;
        }
        if (!columnWidths) {
          const [, rowPath] =
            state.nodes.parent(path, { type: BaseTableRowPlugin }) ?? [];

          if (!rowPath) return { minHeight: rowSize, width: 0 };

          const [tableNode] =
            state.nodes.parent(rowPath, { type: plugin }) ?? [];

          if (!tableNode) return { minHeight: rowSize, width: 0 };

          columnWidths = api.getOverriddenColumnSizes(tableNode);
        }

        const { initialTableWidth, minColumnWidth } = store.get();
        const fallbackWidth = getFallbackColumnWidth({
          columnCount: columnWidths.length,
          initialTableWidth,
          minColumnWidth,
        });

        const colSpan = getColSpan(element);
        const { col } = cellIndices ?? state.table.getCellIndices(element);
        const width = columnWidths
          .slice(col, col + colSpan)
          .reduce<number>(
            (total, innerWidth) => total + (innerWidth ?? fallbackWidth),
            0
          );

        return { minHeight: rowSize, width };
      },
      getSelectedCellsBorders: (
        selectedCells?: Element[] | null,
        options: GetSelectedCellsBordersOptions = {}
      ): TableBorderStates => {
        const { select = { none: true, outer: true, side: true } } = options;
        let cells =
          selectedCells ??
          state.table.selection()?.cellEntries.map(([cell]) => cell);

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
        const { maxCol, maxRow, minCol, minRow } = getTableCellBounds(
          cellElements.map((cell) => ({
            ...state.table.getCellIndices(cell),
            colSpan: getColSpan(cell),
            rowSpan: getRowSpan(cell),
          }))
        );
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
            if (isFirstRow && (cell.borders?.top?.width ?? 1) > 0) {
              hasAnyBorder = true;
            }
            if (isFirstCell && (cell.borders?.left?.width ?? 1) > 0) {
              hasAnyBorder = true;
            }
            if ((cell.borders?.bottom?.width ?? 1) > 0) hasAnyBorder = true;
            if ((cell.borders?.right?.width ?? 1) > 0) hasAnyBorder = true;

            if (!hasAnyBorder) {
              if (!isFirstRow) {
                const cellAboveEntry = state.table.getAdjacentCell({
                  at: cellPath,
                  deltaRow: -1,
                });

                if (
                  cellAboveEntry &&
                  (cellAboveEntry[0].borders?.bottom?.width ?? 1) > 0
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
                  (previousCellEntry[0].borders?.right?.width ?? 1) > 0
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
                    if ((cell.borders?.top?.width ?? 1) <= 0) {
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
                      if (
                        (cellAboveEntry[0].borders?.bottom?.width ?? 1) <= 0
                      ) {
                        borderStates.top = false;
                        if (select.outer) allOuterBordersSet = false;
                      } else if (!borderStates.top) {
                        borderStates.top = true;
                      }
                    }
                  }
                }
                if (rowIndex === maxRow) {
                  if ((cell.borders?.bottom?.width ?? 1) <= 0) {
                    borderStates.bottom = false;
                    if (select.outer) allOuterBordersSet = false;
                  } else if (!borderStates.bottom) {
                    borderStates.bottom = true;
                  }
                }
                if (columnIndex === minCol) {
                  if (isFirstCell) {
                    if ((cell.borders?.left?.width ?? 1) <= 0) {
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
                        (previousCellEntry[0].borders?.right?.width ?? 1) <= 0
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
                  if ((cell.borders?.right?.width ?? 1) <= 0) {
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

          if (node) return node.borders?.right?.width === 0;
        }
        if (border === 'top') {
          const node = state.table.getAdjacentCell({ deltaRow: -1 })?.[0];

          if (node) return node.borders?.bottom?.width === 0;
        }

        return (
          state.nodes.find({
            match: api.isCell,
          })?.[0].borders?.[border]?.width === 0
        );
      },
      isSelectedCellBorder: (
        cells: TableCellElement[],
        side: BorderDirection
      ): boolean => {
        const { maxCol, maxRow, minCol, minRow } = getTableCellBounds(
          cells.map((cell) => ({
            ...state.table.getCellIndices(cell),
            colSpan: getColSpan(cell),
            rowSpan: getRowSpan(cell),
          }))
        );

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
                  return (cell.borders?.top?.width ?? 1) > 0;
                }

                const cellAboveEntry = state.table.getAdjacentCell({
                  at: cellPath,
                  deltaRow: -1,
                });

                return cellAboveEntry
                  ? (cellAboveEntry[0].borders?.bottom?.width ?? 1) > 0
                  : true;
              }
              if (side === 'bottom' && rowIndex === maxRow) {
                return (cell.borders?.bottom?.width ?? 1) > 0;
              }
              if (side === 'left' && columnIndex === minCol) {
                if (col === 0) {
                  return (cell.borders?.left?.width ?? 1) > 0;
                }

                const previousCellEntry = state.table.getAdjacentCell({
                  at: cellPath,
                  deltaCol: -1,
                });

                return previousCellEntry
                  ? (previousCellEntry[0].borders?.right?.width ?? 1) > 0
                  : true;
              }
              if (side === 'right' && columnIndex === maxCol) {
                return (cell.borders?.right?.width ?? 1) > 0;
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
          if (row === 0 && (borders?.top?.width ?? 1) > 0) return false;
          if (col === 0 && (borders?.left?.width ?? 1) > 0) return false;
          if ((borders?.bottom?.width ?? 1) > 0) return false;
          if ((borders?.right?.width ?? 1) > 0) return false;

          if (row !== 0) {
            const cellAboveEntry = state.table.getAdjacentCell({
              at: cellPath,
              deltaRow: -1,
            });

            if (
              cellAboveEntry &&
              (cellAboveEntry[0].borders?.bottom?.width ?? 1) > 0
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
              (previousCellEntry[0].borders?.right?.width ?? 1) > 0
            ) {
              return false;
            }
          }

          return true;
        }),
      isSelectedCellBordersOuter: (cells: TableCellElement[]): boolean => {
        const { maxCol, maxRow, minCol, minRow } = getTableCellBounds(
          cells.map((cell) => ({
            ...state.table.getCellIndices(cell),
            colSpan: getColSpan(cell),
            rowSpan: getRowSpan(cell),
          }))
        );

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
              if (rowIndex === minRow && (cell.borders?.top?.width ?? 1) <= 0) {
                return false;
              }
              if (
                rowIndex === maxRow &&
                (cell.borders?.bottom?.width ?? 1) <= 0
              ) {
                return false;
              }
              if (
                columnIndex === minCol &&
                (cell.borders?.left?.width ?? 1) <= 0
              ) {
                return false;
              }
              if (
                columnIndex === maxCol &&
                (cell.borders?.right?.width ?? 1) <= 0
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
        const view = read.selection();

        if (!view || view.cellEntries.length <= 1) return false;
        const rows = projectTableSelection(view).children as TableRowElement[];
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
          let { before } = options;
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
          let { before } = options;

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

          const view = tx.table.selection();
          const isMultiCell = (view?.anchors.length ?? 0) > 1;
          const context =
            view?.context ?? createTableContext(tx, tableEntry[1]);

          if (!context) return;

          if (isMultiCell) {
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

          const view = tx.table.selection();
          const isMultiCell = (view?.anchors.length ?? 0) > 1;
          const context =
            view?.context ?? createTableContext(tx, tableEntry[1]);

          if (!context) return;

          if (isMultiCell) {
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
  .extend((context) => {
    const { api, editor } = context;

    return {
      update: ({ tx }) => {
        const setBorderWidths = (options: readonly SetBorderWidthOptions[]) => {
          const updates = new Map<
            string,
            { borders: TableCellElement['borders']; path: Path }
          >();
          const addBorder = (
            [node, path]: NodeEntry<TableCellElement>,
            direction: BorderDirection,
            width: number
          ) => {
            const key = path.join(',');
            const current = updates.get(key);

            updates.set(key, {
              borders: {
                ...(current?.borders ?? node.borders),
                [direction]: { width },
              },
              path,
            });
          };

          options.forEach(({ at, border = 'all', width }) => {
            const cellEntry = tx.nodes.find({
              at,
              match: api.isCell,
            });

            if (!cellEntry) return;

            const [, cellPath] = cellEntry;
            const cellIndex = cellPath.at(-1);
            const rowIndex = cellPath.at(-2);
            const view = tx.table.selection(cellPath);
            const addDirection = (direction: BorderDirection) => {
              if (direction === 'top') {
                if (rowIndex === 0) {
                  addBorder(cellEntry, 'top', width);
                  return;
                }

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

                if (cellAbove) addBorder(cellAbove, 'bottom', width);
                return;
              }
              if (direction === 'left') {
                if (cellIndex === 0) {
                  addBorder(cellEntry, 'left', width);
                  return;
                }

                const anchor = view
                  ? getTableSelectionNeighbor(view.context, view.anchor, 'left')
                  : undefined;
                const cellLeft =
                  anchor && view
                    ? view.context.entryAt(anchor.row, anchor.col)
                    : undefined;

                if (cellLeft) addBorder(cellLeft, 'right', width);
                return;
              }

              addBorder(cellEntry, direction, width);
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
          innerContext: NonNullable<ReturnType<typeof createTableContext>>,
          intent: TableIntent
        ) => {
          const result = planTableMutation(innerContext, intent);

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
                const selected = tx.table.selection()?.cellEntries ?? [];

                if (selected.length > 1) {
                  return selected.map(([cell]) => cell);
                }

                const cell = tx.nodes.block({
                  match: api.isCell,
                });

                return cell ? [cell[0]] : [];
              })();

            if (selectedCells.length === 0) return;

            const targets = selectedCells.flatMap((cell) => {
              const path = tx.nodes.path(cell);

              if (!path) return [];

              const view = tx.table.selection(path);
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
            const updates: SetBorderWidthOptions[] = [];
            const add = (
              at: Path | null,
              directions: readonly BorderDirection[] | 'all',
              width: number
            ) => {
              if (!at) return;

              if (directions === 'all') {
                updates.push({ at, border: 'all', width });
                return;
              }

              directions.forEach((direction) => {
                updates.push({ at, border: direction, width });
              });
            };
            const apply = () => {
              setBorderWidths(updates);
            };

            if (border === 'none') {
              const width = tx.table.getSelectedCellsBorders(selectedCells).none
                ? 1
                : 0;

              targets.forEach((target) => {
                const directions: BorderDirection[] = ['bottom', 'right'];

                if (target.row === 0) directions.unshift('top');
                if (target.col === 0) directions.unshift('left');
                if (target.row > 0) {
                  add(target.topCellPath, ['bottom'], width);
                }
                if (target.col > 0) {
                  add(target.leftCellPath, ['right'], width);
                }
                add(target.path, directions, width);
              });

              apply();
              return;
            }

            const { maxCol, maxRow, minCol, minRow } =
              getTableCellBounds(targets);

            if (border === 'outer') {
              const width = tx.table.getSelectedCellsBorders(selectedCells)
                .outer
                ? 0
                : 1;

              targets.forEach((target) => {
                for (
                  let { row } = target;
                  row < target.row + target.rowSpan;
                  row++
                ) {
                  for (
                    let { col } = target;
                    col < target.col + target.colSpan;
                    col++
                  ) {
                    const directions: BorderDirection[] = [];

                    if (row === minRow) directions.push('top');
                    if (row === maxRow) directions.push('bottom');
                    if (col === minCol) directions.push('left');
                    if (col === maxCol) directions.push('right');
                    add(target.path, directions, width);
                  }
                }
              });

              apply();
              return;
            }

            const width = tx.table.isSelectedCellBorder(selectedCells, border)
              ? 0
              : 1;

            targets.forEach((target) => {
              const directions: BorderDirection[] = [];

              if (border === 'top' && target.row === minRow) {
                if (target.row === 0) {
                  directions.push('top');
                } else {
                  add(target.topCellPath, ['bottom'], width);
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
                  add(target.leftCellPath, ['right'], width);
                }
              }
              if (
                border === 'right' &&
                target.col + target.colSpan - 1 === maxCol
              ) {
                directions.push('right');
              }
              add(target.path, directions, width);
            });

            apply();
          },
          setBorderWidth: (
            width: number,
            { at, border = 'all' }: Omit<SetBorderWidthOptions, 'width'> = {}
          ) => {
            if (
              typeof width !== 'number' ||
              !Number.isFinite(width) ||
              width < 0
            ) {
              throw new TypeError(
                'Table border width must be a non-negative finite number.'
              );
            }

            setBorderWidths([{ at, border, width }]);
          },
          merge: (): void => {
            const cellEntries = tx.table.selection()?.cellEntries ?? [];

            if (cellEntries.length < 2) return;

            const firstCellPath = cellEntries[0][1];
            const innerContext2 = createTableContext(
              tx,
              firstCellPath.slice(0, -2)
            );

            if (!innerContext2) return;

            const cellKeys = cellEntries.map(
              ([cell]) =>
                (
                  innerContext2.anchorOf(cell) ??
                  failInvariant('Expected value to be defined')
                ).key
            );

            applyMutation(innerContext2, {
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
            const view = tx.table.selection(at);

            if (!view) return undefined;

            if (edge) {
              const minCell = fromOneCell ? 0 : 1;

              if (view.anchors.length > minCell) {
                const expansion = getTableSelectionExpansion(view, edge);

                if (expansion) {
                  const anchor = getTableAnchorPoint(view, expansion.anchor);
                  const focus = getTableAnchorPoint(view, expansion.focus);

                  if (anchor && focus) {
                    const range = { anchor, focus };
                    const expandedView = tx.table.selection(range);

                    tx.selection.set(
                      (expandedView &&
                        createTableNodeSelection(expandedView)) ??
                        range
                    );
                  }
                }

                return true;
              }

              return undefined;
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
              const tableView = tx.table.selection(tableRange);

              tx.selection.set(
                (tableView && createTableNodeSelection(tableView)) ?? tableRange
              );
            }

            return true;
          },
          setCellBackground: ({ color }: { color: string | null }) => {
            const selectedCells = tx.table.selection()?.cellEntries ?? [];
            const currentCell =
              selectedCells.length === 0
                ? tx.nodes.find({ match: api.isCell })
                : undefined;
            const cells =
              selectedCells.length > 0
                ? selectedCells
                : currentCell
                  ? [currentCell]
                  : [];

            cells.forEach(([, path]) => {
              if (color === null) {
                tx.nodes.unset('backgroundColor', { at: path });
              } else {
                tx.nodes.set({ backgroundColor: color }, { at: path });
              }
            });
          },
          setColumnWidth: (
            { colIndex, width }: { colIndex: number; width: number },
            options: TableFindOptions = {}
          ) => {
            if (!Number.isSafeInteger(colIndex) || colIndex < 0) {
              throw new TypeError(
                'Table column index must be a non-negative safe integer.'
              );
            }
            if (!isPositiveFiniteNumber(width)) {
              throw new TypeError(
                'Table column width must be a positive finite number.'
              );
            }

            const table = tx.nodes.find({
              ...options,
              type: context.plugin,
            });

            if (!table) return;

            const [tableNode, tablePath] = table;
            const columnCount = api.getColumnCount(tableNode);

            if (colIndex >= columnCount) {
              throw new RangeError(
                `Table column index ${colIndex} exceeds the last column index ${
                  columnCount - 1
                }.`
              );
            }

            const currentColSizes = getTableColumnSizes(tableNode);
            const columnWidths: Array<number | null> = Array.from(
              { length: columnCount },
              (_, index): number | null => currentColSizes?.[index] ?? null
            );

            columnWidths[colIndex] = width;

            tx.nodes.set({ columnWidths }, { at: tablePath });
          },
          setRowHeight: (
            { height, rowIndex }: { height: number; rowIndex: number },
            options: TableFindOptions = {}
          ) => {
            if (!Number.isSafeInteger(rowIndex) || rowIndex < 0) {
              throw new TypeError(
                'Table row index must be a non-negative safe integer.'
              );
            }
            if (!isPositiveFiniteNumber(height)) {
              throw new TypeError(
                'Table row height must be a positive finite number.'
              );
            }

            const table = tx.nodes.find({
              ...options,
              type: context.plugin,
            });

            if (!table) return;

            const rowCount = table[0].children.length;

            if (rowIndex >= rowCount) {
              throw new RangeError(
                `Table row index ${rowIndex} exceeds the last row index ${
                  rowCount - 1
                }.`
              );
            }

            tx.nodes.set({ height }, { at: [...table[1], rowIndex] });
          },
          split: (): void => {
            const firstCell = tx.table.selection()?.cellEntries[0];

            if (!firstCell) return;

            const [cell, path] = firstCell;
            const innerContext3 = createTableContext(tx, path.slice(0, -2));

            if (!innerContext3) return;

            const cellKey = innerContext3.anchorOf(cell)?.key;

            applyMutation(innerContext3, {
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
            const view = selection ? tx.table.selection(selection) : null;

            if (selection && (view?.anchors.length ?? 0) > 1) {
              tx.selection.collapse({ edge: 'end' });
              return true;
            }

            const cellEntry = tx.nodes.find({
              match: api.isCell,
            });

            if (!cellEntry) return false;

            const tableView = tx.table.selection(cellEntry[1]);
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

            if (targetEntry) {
              const targetStart = tx.points.start(targetEntry[1]);

              if (targetStart) tx.selection.set(targetStart);
            }

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
            const types = new Set(data.types);
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
            const view = context.read.selection();
            const hasStructuralTarget = (view?.anchors.length ?? 0) > 1;
            const source: TablePasteSource = hasRecognizedExact
              ? 'model'
              : html
                ? 'html'
                : types.has('text/tsv') ||
                    types.has('text/tab-separated-values') ||
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
            const table = node;
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
              tx.nodes.unset('columnWidths', { at: path });
              return;
            }

            if (initialTableWidth) {
              const colCount = (
                table.children[0] as TableRowElement | undefined
              )?.children.length;

              if (colCount) {
                const fallbackSize = initialTableWidth / colCount;
                const columnWidths = currentColSizes
                  ? currentColSizes.map((width) => width ?? fallbackSize)
                  : Array.from({ length: colCount }, () => fallbackSize);

                if (
                  !currentColSizes ||
                  currentColSizes.some((width) => width === null)
                ) {
                  tx.nodes.set({ columnWidths }, { at: path });
                }
              }
            }
          }
        },
      },
    ],
  }))
  .extend((context) => {
    const cellType = context.editor.plugin(BaseTableCellPlugin).schema.type;
    const readSelection = (state: EditorStateView, at?: Location) =>
      readTableSelection(state, {
        at,
        cellTypes: [cellType],
        selection: state.selection(),
        tableType: context.schema.type,
      });

    return {
      readMiddleware: ({ around }) => [
        around(editorReads.slice.get, ({ input, next, state }) => {
          const slice = next();
          const at = SelectionApi.isNode(input.options.at)
            ? (getEditorSelectionRange(
                context.editor,
                input.options.at,
                state.value()
              ) ?? undefined)
            : input.options.at;
          const view = readSelection(state, at);
          const hasNodeSelection =
            SelectionApi.isNode(input.options.at) ||
            (input.options.at === undefined &&
              state.selection.nodes().length > 0);

          return hasNodeSelection && view && view.anchors.length > 1
            ? projectTableSelectionSlice(slice, view)
            : slice;
        }),
        around(editorReads.slice.export, ({ input, next, state }) => {
          const slice = next();
          const at = SelectionApi.isNode(input.options.at)
            ? (getEditorSelectionRange(
                context.editor,
                input.options.at,
                state.value()
              ) ?? undefined)
            : input.options.at;
          const view = readSelection(state, at);
          const hasNodeSelection =
            SelectionApi.isNode(input.options.at) ||
            (input.options.at === undefined &&
              state.selection.nodes().length > 0);

          if (!view || hasNodeSelection) return slice;
          if (view.anchors.length > 1) {
            return projectTableSelectionSlice(slice, view);
          }

          const table =
            slice.content.length === 1 &&
            ElementApi.isElement(slice.content[0]) &&
            slice.content[0].type === context.schema.type
              ? slice.content[0]
              : null;
          const row =
            table?.children.length === 1 &&
            ElementApi.isElement(table.children[0])
              ? table.children[0]
              : null;
          const cell =
            row?.children.length === 1 && ElementApi.isElement(row.children[0])
              ? row.children[0]
              : null;

          return cell
            ? ContentSlice.withContent(slice, cell.children, { open: 'closed' })
            : slice;
        }),
      ],
    };
  })
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
        const view = state.table.selection(selection);

        if (!view || view.cellEntries.length < 2) return false;

        return state.transaction((tx) => {
          const cellPaths = view.cellEntries.map(([, path]) => path);

          view.cellEntries.forEach(([, path]) => {
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
          tx.selection.setNodes(cellPaths, {
            anchor: view.tablePath.concat(view.anchor.path),
            focus: view.tablePath.concat(view.focus.path),
          });
        });
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

        const view = state.table.selection(selection);

        if (!view) return false;

        const { root } = view;
        let source = getTablePasteElement(slice, {
          cellTypes: [context.editor.plugin(BaseTableCellPlugin).schema.type],
          rowType: context.editor.plugin(BaseTableRowPlugin).schema.type,
          tableType: context.schema.type,
        });
        let ordinary = false;

        if (!source) {
          if (view.anchors.length <= 1) {
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

        const fillBounds = view.anchors.length > 1 ? view.bounds : undefined;
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
                );

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
                );
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
          const nextView = tx.table.selection(plan.selection);
          const nodeSelection = nextView && createTableNodeSelection(nextView);

          if (nodeSelection) tx.selection.set(nodeSelection);
        });
      }),
      around(editorCommands.insertText, ({ state, next }) => {
        const selection = state.selection();
        const view = selection ? state.table.selection(selection) : null;

        if (!selection || !view || view.cellEntries.length < 2) return next();
        const cells = view.cellEntries;

        const focus = state.points.start(
          (cells.at(-1) ?? failInvariant('Expected value to be defined'))[1]
        );
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
    ],
  }));

export type TableElement = ElementOf<typeof BaseTablePlugin>;
export type TableDefinition = DefinitionOf<typeof BaseTablePlugin>;
