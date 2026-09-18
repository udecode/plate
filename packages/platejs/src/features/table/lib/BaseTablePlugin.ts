import {
  BaseParagraphPlugin,
  ContentSlice,
  DebugPlugin,
  definePlugin,
  type DefinitionOf,
  type Descendant,
  editorCommands,
  editorReads,
  type Editor,
  type EditorStateView,
  type Element,
  ElementApi,
  type ElementEntry,
  type ElementOf,
  type Location,
  type Node,
  type Path,
  PathApi,
  PLUGINS,
  PointApi,
  property,
  type Range,
  RangeApi,
  schema,
  SelectionApi,
  TextApi,
  type BlockInsertOptions,
  type BlockUpsertOptions,
} from '../../../core';
import { domCommands } from '../../../dom/plite-dom.internal';
import { fitSlicePlacements } from '../../../facade';
import { applyBlockInsertion } from '../../../internal/plugin/blockInsertion';
import {
  getColSpan,
  getImportedTableCellColSpan,
  getRowSpan,
  getTableCellHtmlCodecProps,
  getTableCellHtmlProps,
  MAX_IMPORTED_TABLE_COLUMNS,
  parseHtmlColSpan,
  parseHtmlRowSpan,
  parseTableCellHtml,
  resetImportedTableCellSpans,
} from './internal/codec';
import {
  createDetachedTableContext,
  type createTableContext,
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
  getTablePasteElement,
  planPreparedTablePaste,
  prepareTablePaste,
  type TablePasteDiagnostic,
} from './internal/paste';
import {
  getTableSelectionNeighbor,
  projectTableSelection,
  readTableSelection,
  type TableSelectionView,
} from './internal/selection';
import type {
  BorderDirection,
  TableAxisInsertOptions,
  TableBorderStates,
  TableBorderTarget,
  TableCellBorder,
  TableCellBorders,
  TableCellInfo,
  TableCellTarget,
  TableColumnWidthOptions,
  TableCreateOptions,
  TableInsertPlacement,
  TableResize,
  TableResizeOptions,
  TableResizeTarget,
  TableRowHeightOptions,
  TableSelection,
  TableTargetOptions,
} from './types';

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

const projectTableSelectionSlice = (
  editor: Editor,
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

  const projected = ContentSlice.withContent(
    slice,
    [
      exportedTable
        ? { ...projection, ...exportedTable, children: projection.children }
        : projection,
    ],
    { open: 'closed' }
  );

  if (!projected.roots) return projected;
  const roots: Record<string, readonly Descendant[]> = {};
  const visited = new Set<string>();
  const collectRoots = (children: readonly Descendant[]) => {
    for (const node of children) {
      if (!ElementApi.isElement(node)) continue;

      for (const root of Object.values(
        editor.read.schema.getElementContentRoots(node)
      )) {
        if (visited.has(root)) continue;
        const rootChildren = projected.roots?.[root];

        if (!rootChildren) {
          throw new Error(`Missing content slice source root "${root}".`);
        }
        visited.add(root);
        roots[root] = rootChildren;
        collectRoots(rootChildren);
      }
      collectRoots(node.children);
    }
  };

  collectRoots(projected.content);

  return ContentSlice.fromJSON({
    content: projected.content,
    openEnd: projected.openEnd,
    openStart: projected.openStart,
    ...(visited.size > 0 ? { roots } : {}),
  });
};

const toPublicTableSelection = (view: TableSelectionView): TableSelection => {
  const selectedArea = view.anchors.reduce(
    (area, anchor) => area + anchor.colSpan * anchor.rowSpan,
    0
  );
  const boundsArea =
    (view.bounds.maxCol - view.bounds.minCol + 1) *
    (view.bounds.maxRow - view.bounds.minRow + 1);
  const anchor = view.cellKeys[view.anchors.indexOf(view.anchor)];
  const focus = view.cellKeys[view.anchors.indexOf(view.focus)];

  if (!anchor || !focus) {
    throw new Error('Table selection endpoints must be selected cells.');
  }

  return Object.freeze({
    anchor,
    bounds: view.bounds,
    cells: Object.freeze([...view.cellEntries]),
    focus,
    rectangular: view.complete && selectedArea === boundsArea,
    ...(view.root === undefined ? {} : { root: view.root }),
    table: [
      view.table as TableElement,
      view.tablePath,
    ] as ElementEntry<TableElement>,
    tableKey: view.tableKey,
  });
};

export type TablePluginState = {
  /** Allow merge and split edits that change cell spans. */
  allowCellSpanEditing: boolean;
  /** Width used to resolve missing column sizes. */
  defaultTableWidth: number | null;
  /** Allow a structural table paste to add rows and columns. */
  expandOnPaste: boolean;
  /** Minimum column width. */
  minColumnWidth: number;
};

type CreateCellOptions = {
  children?: TableCellElement['children'];
  header?: boolean;
  row?: TableRowElement;
};

type CreateRowOptions = CreateCellOptions & { columns?: number };
type CreateTableOptions = CreateRowOptions & { rows?: number };

type ToggleTableBordersOptions = {
  at?: TableTargetOptions['at'];
  border: BorderDirection | 'none' | 'outer';
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPositiveSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const isPositiveFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const getFallbackColumnWidth = ({
  columnCount,
  defaultTableWidth,
  minColumnWidth,
}: {
  columnCount: number;
  defaultTableWidth: number | null;
  minColumnWidth?: number;
}) => {
  const minimum = isPositiveFiniteNumber(minColumnWidth) ? minColumnWidth : 1;

  return isPositiveFiniteNumber(defaultTableWidth) && columnCount > 0
    ? Math.max(defaultTableWidth / columnCount, minimum)
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

export const BaseTableCellPlugin = definePlugin(PLUGINS.tableCell, {
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
          if (getColSpan(node) > 1 || getRowSpan(node) > 1) {
            throw new Error(
              'Markdown tables cannot represent rowSpan or colSpan.'
            );
          }

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
  render: { attributes: ({ element }) => getTableCellHtmlProps(element) },
  rules: { merge: { removeEmpty: false } },
});

export const BaseTableRowPlugin = definePlugin(PLUGINS.tableRow, {
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

const initialState: TablePluginState = {
  allowCellSpanEditing: true,
  defaultTableWidth: null,
  expandOnPaste: true,
  minColumnWidth: 48,
};

const MAX_IMPORTED_TABLE_CONSTRAINT_WORK = 10_000;
const TABLE_WIDTH_CONSTRAINT_EPSILON = 0.001;

const isTableCell = (editor: Editor, node: Node): node is TableCellElement =>
  ElementApi.isElement(node) &&
  node.type === editor.plugin(BaseTableCellPlugin).schema.type;

const createTableCell = (
  editor: Editor,
  { children, header, row }: CreateCellOptions = {}
): TableCellElement => {
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
};

const createTableRow = (
  editor: Editor,
  { columns = 1, ...cellOptions }: CreateRowOptions = {}
): TableRowElement => ({
  children: Array.from({ length: columns }, () =>
    createTableCell(editor, cellOptions)
  ),
  type: editor.plugin(BaseTableRowPlugin).schema.type,
});

const createTable = (
  editor: Editor,
  tableType: string,
  { columns = 2, header, rows = 2, ...cellOptions }: CreateTableOptions = {}
): Element => ({
  children: Array.from({ length: rows }, (_, index) =>
    createTableRow(editor, {
      columns,
      ...cellOptions,
      header: header && index === 0,
    })
  ),
  type: tableType,
});

const hasDefaultCellContent = (editor: Editor, cell: TableCellElement) => {
  if (cell.children.length !== 1) return false;
  const paragraph = cell.children[0];

  if (
    !ElementApi.isElement(paragraph) ||
    paragraph.type !== editor.plugin(BaseParagraphPlugin).schema.type ||
    paragraph.children.length !== 1 ||
    Object.keys(paragraph).some((key) => key !== 'children' && key !== 'type')
  ) {
    return false;
  }
  const text = paragraph.children[0];

  return (
    TextApi.isText(text) &&
    text.text === '' &&
    Object.keys(text).every((key) => key === 'text')
  );
};

const getResolvedColumnWidths = (
  table: Element,
  state: Pick<TablePluginState, 'defaultTableWidth' | 'minColumnWidth'>
): readonly number[] => {
  const columnCount = compileTableGrid(table).width;
  const columnWidths = getTableColumnSizes(table);
  const fallbackWidth = getFallbackColumnWidth({
    columnCount,
    defaultTableWidth: state.defaultTableWidth,
    minColumnWidth: state.minColumnWidth,
  });

  return Array.from(
    { length: columnCount },
    (_, index) => columnWidths?.[index] ?? fallbackWidth
  );
};

/** Enables support for tables. */
const BaseTableSchemaPlugin = definePlugin(PLUGINS.table, {
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
});

export type TableCellElement = ElementOf<typeof BaseTableCellPlugin>;
export type TableRowElement = ElementOf<typeof BaseTableRowPlugin>;
export type TableElement = ElementOf<typeof BaseTableSchemaPlugin>;

export const BaseTablePlugin = BaseTableSchemaPlugin.extend(({ store }) => ({
  api: () => ({
    columnWidths: (table: TableElement) =>
      getResolvedColumnWidths(table, store.get()),
    /**
     * Captures table sizes and returns a pure delta-to-preview calculation.
     * Interior boundaries preserve the adjacent columns' combined width.
     * The left boundary exchanges first-column width for table indentation.
     * Commit the result with `update.resize`; previews never change the editor.
     */
    createResize: (table: TableElement, target: TableResizeTarget) => {
      const { minColumnWidth } = store.get();
      const minimum = isPositiveFiniteNumber(minColumnWidth)
        ? minColumnWidth
        : 1;
      const widths = getResolvedColumnWidths(table, store.get());
      const marginLeft = table.marginLeft ?? 0;
      const index = target.edge === 'right' ? target.colIndex : 0;

      if (target.edge === 'bottom') {
        if (
          !Number.isSafeInteger(target.rowIndex) ||
          target.rowIndex < 0 ||
          target.rowIndex >= table.children.length ||
          !isPositiveFiniteNumber(target.height)
        ) {
          throw new TypeError(
            'Table resize requires a valid row and positive height.'
          );
        }
      } else if (
        !Number.isSafeInteger(index) ||
        index < 0 ||
        index >= widths.length
      ) {
        throw new RangeError('Table resize requires an existing column.');
      }

      return (delta: number): TableResize => {
        if (!Number.isFinite(delta)) {
          throw new TypeError('Table resize delta must be finite.');
        }
        if (target.edge === 'bottom') {
          return { ...target, height: Math.max(1, target.height + delta) };
        }

        const initial = widths[index];

        if (target.edge === 'left') {
          const nextMarginLeft = Math.max(
            0,
            Math.min(
              marginLeft + delta,
              marginLeft + initial - Math.min(minimum, initial)
            )
          );

          return {
            columns: [
              { colIndex: 0, width: initial + marginLeft - nextMarginLeft },
            ],
            edge: 'left',
            marginLeft: nextMarginLeft,
          };
        }

        const adjacent = widths[index + 1];
        const width = Math.max(
          Math.min(minimum, initial),
          Math.min(
            initial + delta,
            adjacent === undefined
              ? Number.POSITIVE_INFINITY
              : initial + adjacent - Math.min(minimum, adjacent)
          )
        );

        return {
          columns: [
            { colIndex: index, width },
            ...(adjacent === undefined
              ? []
              : [{ colIndex: index + 1, width: initial + adjacent - width }]),
          ],
          edge: 'right',
        };
      };
    },
  }),
}))
  .extend(({ editor, schema: { type }, store }) => ({
    read: ({ state }) => {
      const selectionView = (options: TableTargetOptions = {}) =>
        readTableSelection(state, {
          at: options.at,
          cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
          selection: state.selection(),
          tableType: type,
        });
      const resolvedBorder = (
        border: TableCellBorder | undefined
      ): Required<TableCellBorder> => ({
        color: border?.color ?? 'currentColor',
        style: border?.style ?? 'solid',
        width: border?.width ?? 1,
      });
      const cellInfo = (view: TableSelectionView): TableCellInfo | null => {
        if (view.anchors.length !== 1) return null;
        const { anchor } = view;
        const entry = view.context.entryAt(anchor.row, anchor.col);

        if (!entry) return null;
        const [cell] = entry;
        const { defaultTableWidth, minColumnWidth } = store.get();
        const columnWidths = getTableColumnSizes(view.table);
        const fallbackWidth = getFallbackColumnWidth({
          columnCount: view.context.grid.width,
          defaultTableWidth,
          minColumnWidth,
        });
        let width = 0;

        for (
          let index = anchor.col;
          index < anchor.col + anchor.colSpan;
          index++
        ) {
          width += columnWidths?.[index] ?? fallbackWidth;
        }
        const minHeight = view.table.children
          .slice(anchor.row, anchor.row + anchor.rowSpan)
          .reduce(
            (total, row) =>
              total +
              (ElementApi.isElement(row) &&
              typeof row.height === 'number' &&
              Number.isFinite(row.height)
                ? row.height
                : 0),
            0
          );
        const firstRow = anchor.row === 0;
        const firstColumn = anchor.col === 0;

        return Object.freeze({
          borders: Object.freeze({
            bottom: resolvedBorder(cell.borders?.bottom),
            ...(firstColumn
              ? { left: resolvedBorder(cell.borders?.left) }
              : {}),
            right: resolvedBorder(cell.borders?.right),
            ...(firstRow ? { top: resolvedBorder(cell.borders?.top) } : {}),
          }),
          col: anchor.col,
          colSpan: anchor.colSpan,
          entry,
          ...(view.root === undefined ? {} : { root: view.root }),
          row: anchor.row,
          rowSpan: anchor.rowSpan,
          size: Object.freeze({ minHeight, width }),
        });
      };
      const edgeVisible = (
        view: TableSelectionView,
        anchor: TableGridAnchor,
        direction: BorderDirection
      ) => {
        if (direction === 'top' && anchor.row > 0) {
          const above = getTableSelectionNeighbor(
            view.context,
            anchor,
            'above'
          );
          const entry = above && view.context.entryAt(above.row, above.col);

          return (entry?.[0].borders?.bottom?.width ?? 1) > 0;
        }
        if (direction === 'left' && anchor.col > 0) {
          const left = getTableSelectionNeighbor(view.context, anchor, 'left');
          const entry = left && view.context.entryAt(left.row, left.col);

          return (entry?.[0].borders?.right?.width ?? 1) > 0;
        }

        return (anchor.cell.borders?.[direction]?.width ?? 1) > 0;
      };
      const mixed = (values: readonly boolean[]) =>
        values.every(Boolean)
          ? true
          : values.every((value) => !value)
            ? false
            : ('mixed' as const);

      return {
        borders: (
          options: TableTargetOptions = {}
        ): TableBorderStates | null => {
          const view = selectionView(options);

          if (!view || view.anchors.length === 0) return null;
          const sides = {
            bottom: view.anchors
              .filter(
                (anchor) =>
                  anchor.row + anchor.rowSpan - 1 === view.bounds.maxRow
              )
              .map((anchor) => edgeVisible(view, anchor, 'bottom')),
            left: view.anchors
              .filter((anchor) => anchor.col === view.bounds.minCol)
              .map((anchor) => edgeVisible(view, anchor, 'left')),
            right: view.anchors
              .filter(
                (anchor) =>
                  anchor.col + anchor.colSpan - 1 === view.bounds.maxCol
              )
              .map((anchor) => edgeVisible(view, anchor, 'right')),
            top: view.anchors
              .filter((anchor) => anchor.row === view.bounds.minRow)
              .map((anchor) => edgeVisible(view, anchor, 'top')),
          };
          const allEdges = view.anchors.flatMap((anchor) =>
            (['bottom', 'left', 'right', 'top'] as const).map((direction) =>
              edgeVisible(view, anchor, direction)
            )
          );
          const outerEdges = [
            ...sides.bottom,
            ...sides.left,
            ...sides.right,
            ...sides.top,
          ];

          return Object.freeze({
            bottom: mixed(sides.bottom),
            left: mixed(sides.left),
            none: mixed(allEdges.map((value) => !value)),
            outer: mixed(outerEdges),
            right: mixed(sides.right),
            top: mixed(sides.top),
          });
        },
        cell: (options: { at?: TableCellTarget } = {}) => {
          const view = selectionView(options);

          return view ? cellInfo(view) : null;
        },
        canMerge: (options: TableTargetOptions = {}) => {
          const view = selectionView(options);

          return (
            store.get().allowCellSpanEditing &&
            !state.view.isReadOnly() &&
            !!view &&
            view.anchors.length > 1 &&
            toPublicTableSelection(view).rectangular
          );
        },
        canSplit: (options: TableTargetOptions = {}) => {
          const view = selectionView(options);

          return (
            store.get().allowCellSpanEditing &&
            !state.view.isReadOnly() &&
            view?.anchors.length === 1 &&
            (view.anchor.colSpan > 1 || view.anchor.rowSpan > 1)
          );
        },
        selection: (options: TableTargetOptions = {}) => {
          const view = selectionView(options);

          return view ? toPublicTableSelection(view) : null;
        },
      };
    },
  }))
  .extend((context) => {
    const { editor } = context;
    const { type } = context.schema;
    const { store } = context;

    return {
      update: ({ tx }) => {
        const selectionView = (options: TableTargetOptions = {}) =>
          readTableSelection(tx, {
            at: options.at,
            cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
            selection: tx.selection(),
            tableType: context.schema.type,
          });
        const applyMutation = (
          tableContext: NonNullable<ReturnType<typeof createTableContext>>,
          intent: TableIntent
        ) => {
          const result = planTableMutation(tableContext, intent);

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
          if (result.operations.length === 0) return false;

          applyTableMutationPlan(tx, result);

          return true;
        };
        const resolvePhysicalEdge = (
          view: TableSelectionView,
          anchor: TableGridAnchor,
          direction: BorderDirection
        ): {
          direction: BorderDirection;
          entry: ElementEntry<TableCellElement>;
        } | null => {
          if (direction === 'top' && anchor.row > 0) {
            const above = getTableSelectionNeighbor(
              view.context,
              anchor,
              'above'
            );
            const entry = above && view.context.entryAt(above.row, above.col);

            return entry ? { direction: 'bottom', entry } : null;
          }
          if (direction === 'left' && anchor.col > 0) {
            const left = getTableSelectionNeighbor(
              view.context,
              anchor,
              'left'
            );
            const entry = left && view.context.entryAt(left.row, left.col);

            return entry ? { direction: 'right', entry } : null;
          }
          const entry = view.context.entryAt(anchor.row, anchor.col);

          return entry ? { direction, entry } : null;
        };
        const edgeVisible = (
          view: TableSelectionView,
          anchor: TableGridAnchor,
          direction: BorderDirection
        ) => {
          const physical = resolvePhysicalEdge(view, anchor, direction);
          const borders = physical?.entry[0].borders;

          return (borders?.[physical?.direction ?? direction]?.width ?? 1) > 0;
        };
        const directionsForBorder = (
          view: TableSelectionView,
          anchor: TableGridAnchor,
          border: TableBorderTarget
        ): readonly BorderDirection[] => {
          if (border === 'all') {
            return ['bottom', 'left', 'right', 'top'];
          }
          if (border === 'outer') {
            return [
              ...(anchor.row === view.bounds.minRow ? (['top'] as const) : []),
              ...(anchor.row + anchor.rowSpan - 1 === view.bounds.maxRow
                ? (['bottom'] as const)
                : []),
              ...(anchor.col === view.bounds.minCol ? (['left'] as const) : []),
              ...(anchor.col + anchor.colSpan - 1 === view.bounds.maxCol
                ? (['right'] as const)
                : []),
            ];
          }

          const onBoundary =
            border === 'top'
              ? anchor.row === view.bounds.minRow
              : border === 'bottom'
                ? anchor.row + anchor.rowSpan - 1 === view.bounds.maxRow
                : border === 'left'
                  ? anchor.col === view.bounds.minCol
                  : anchor.col + anchor.colSpan - 1 === view.bounds.maxCol;

          return onBoundary ? [border] : [];
        };
        const applyBorders = (
          view: TableSelectionView,
          border: TableBorderTarget,
          value: TableCellBorder | null
        ) => {
          type MutableBorders = {
            -readonly [TKey in keyof TableCellBorders]?: TableCellBorders[TKey];
          };
          const updates = new Map<
            string,
            { borders: MutableBorders; path: Path }
          >();
          const add = (anchor: TableGridAnchor, direction: BorderDirection) => {
            const physical = resolvePhysicalEdge(view, anchor, direction);

            if (!physical) return;
            const [cell, path] = physical.entry;
            const key = path.join(',');
            const borders: MutableBorders = {
              ...(updates.get(key)?.borders ?? cell.borders),
            };

            if (value === null) {
              delete borders[physical.direction];
            } else {
              borders[physical.direction] = { ...value };
            }
            updates.set(key, { borders, path });
          };

          for (const anchor of view.anchors) {
            directionsForBorder(view, anchor, border).forEach((direction) =>
              add(anchor, direction)
            );
          }

          let changed = false;

          for (const { borders, path } of updates.values()) {
            const current = tx.nodes.get(path, {
              match: (node) => isTableCell(editor, node),
            })?.[0];

            if (
              current &&
              JSON.stringify(current.borders ?? {}) !== JSON.stringify(borders)
            ) {
              changed = true;
              if (Object.keys(borders).length === 0) {
                tx.nodes.unset('borders', { at: path });
              } else {
                tx.nodes.set({ borders }, { at: path });
              }
            }
          }

          return changed;
        };

        const insertTable = (
          { columns = 2, header, rows = 2 }: TableCreateOptions = {},
          placement: BlockInsertOptions = {}
        ): boolean => {
          if (
            !Number.isSafeInteger(columns) ||
            columns <= 0 ||
            !Number.isSafeInteger(rows) ||
            rows <= 0
          ) {
            throw new TypeError(
              'Table insertion requires positive safe integer rows and columns.'
            );
          }
          if (placement.at !== undefined && placement.after !== undefined) {
            throw new TypeError(
              'Table insertion accepts either at or after, never both.'
            );
          }
          if (tx.view.isReadOnly()) return false;

          const table = createTable(editor, type, { columns, header, rows });

          if (placement.at !== undefined) {
            tx.nodes.insert(table, placement);
          } else {
            const currentTable = tx.nodes.above({
              at: placement.after,
              type,
            });
            tx.blocks.insertAfter(table, {
              ...placement,
              at: currentTable?.[1] ?? placement.after,
            });
          }

          if (placement.select) {
            const tablePath = tx.nodes.path(table);
            const point =
              tablePath && tx.points.start(tablePath.concat([0, 0]));

            if (point) tx.selection.set(point);
          }

          return true;
        };
        const applyTableInsertion = (
          mode: 'insert' | 'upsert',
          input: TableCreateOptions = {},
          options: BlockInsertOptions | BlockUpsertOptions = {}
        ) =>
          applyBlockInsertion({
            insert: (insertOptions) => insertTable(input, insertOptions),
            matches: (block) => block.type === type,
            mode,
            onReuse: () => true,
            options,
            tx,
          }) ?? false;

        return {
          insert: (
            input: TableCreateOptions = {},
            placement: TableInsertPlacement = {}
          ): boolean => applyTableInsertion('insert', input, placement),
          insertColumn: (options: TableAxisInsertOptions = {}): boolean => {
            if (tx.view.isReadOnly()) return false;
            const view = selectionView(options);

            if (!view || view.anchors.length === 0) return false;
            const anchor = [...view.anchors].sort(
              (left, right) => left.col - right.col || left.row - right.row
            )[options.before ? 0 : view.anchors.length - 1];

            if (!anchor) return false;
            const { defaultTableWidth, minColumnWidth } = store.get();

            return applyMutation(view.context, {
              anchorPath: view.tablePath.concat(anchor.path),
              before: options.before,
              createCell: ({ children, header: cellHeader, sourceRow }) =>
                createTableCell(editor, {
                  children: children ? [...children] : undefined,
                  header: cellHeader,
                  row: sourceRow,
                }),
              header: options.header,
              initialTableWidth: defaultTableWidth ?? undefined,
              kind: 'insert-column',
              minColumnWidth,
              select: options.select,
            });
          },
          insertRow: (options: TableAxisInsertOptions = {}): boolean => {
            if (tx.view.isReadOnly()) return false;
            const view = selectionView(options);

            if (!view || view.anchors.length === 0) return false;
            const anchor = [...view.anchors].sort(
              (left, right) => left.row - right.row || left.col - right.col
            )[options.before ? 0 : view.anchors.length - 1];

            if (!anchor) return false;

            return applyMutation(view.context, {
              anchorPath: view.tablePath.concat(anchor.path),
              before: options.before,
              createCell: ({ children, header: cellHeader, sourceRow }) =>
                createTableCell(editor, {
                  children: children ? [...children] : undefined,
                  header: cellHeader,
                  row: sourceRow,
                }),
              header: options.header,
              kind: 'insert-row',
              rowType: editor.plugin(BaseTableRowPlugin).schema.type,
              select: options.select,
            });
          },
          upsert: (
            input: TableCreateOptions = {},
            options: BlockUpsertOptions = {}
          ): boolean => applyTableInsertion('upsert', input, options),
          removeColumn: (options: TableTargetOptions = {}): boolean => {
            if (tx.view.isReadOnly()) return false;
            const view = selectionView(options);

            if (!view) return false;
            const count = view.bounds.maxCol - view.bounds.minCol + 1;

            if (view.anchors.length > 1) {
              if (
                view.bounds.minRow !== 0 ||
                view.bounds.maxRow !== view.context.grid.height - 1
              ) {
                return false;
              }
              if (count >= view.context.grid.width) {
                return applyMutation(view.context, { kind: 'remove-table' });
              }

              return applyMutation(view.context, {
                columnCount: count,
                kind: 'remove-column',
                selectionRows: [view.bounds.minRow, view.bounds.maxRow],
                startCol: view.bounds.minCol,
              });
            }

            if (view.context.grid.width <= view.anchor.colSpan) {
              return applyMutation(view.context, { kind: 'remove-table' });
            }

            return applyMutation(view.context, {
              anchorPath: view.tablePath.concat(view.anchor.path),
              kind: 'remove-column',
            });
          },
          removeRow: (options: TableTargetOptions = {}): boolean => {
            if (tx.view.isReadOnly()) return false;
            const view = selectionView(options);

            if (!view) return false;
            const count = view.bounds.maxRow - view.bounds.minRow + 1;

            if (view.anchors.length > 1) {
              if (
                view.bounds.minCol !== 0 ||
                view.bounds.maxCol !== view.context.grid.width - 1
              ) {
                return false;
              }
              if (count >= view.context.grid.height) {
                return applyMutation(view.context, { kind: 'remove-table' });
              }

              return applyMutation(view.context, {
                kind: 'remove-row',
                rowCount: count,
                selectionCol: view.bounds.minCol,
                startRow: view.bounds.minRow,
              });
            }

            if (view.context.grid.height <= view.anchor.rowSpan) {
              return applyMutation(view.context, { kind: 'remove-table' });
            }

            return applyMutation(view.context, {
              anchorPath: view.tablePath.concat(view.anchor.path),
              kind: 'remove-row',
            });
          },
          remove: (options: TableTargetOptions = {}): boolean => {
            if (tx.view.isReadOnly()) return false;
            const view = selectionView(options);

            return view
              ? applyMutation(view.context, { kind: 'remove-table' })
              : false;
          },
          merge: (options: TableTargetOptions = {}): boolean => {
            if (
              tx.view.isReadOnly() ||
              !context.store.get().allowCellSpanEditing
            ) {
              return false;
            }
            const view = selectionView(options);

            if (
              !view ||
              view.anchors.length < 2 ||
              !toPublicTableSelection(view).rectangular
            ) {
              return false;
            }

            const [destination, ...sources] = view.anchors;

            if (!destination) return false;
            const destinationKey =
              view.cellKeys[view.anchors.indexOf(destination)];

            if (!destinationKey) return false;
            const atPath = (path: Path): Location =>
              view.root === undefined
                ? path
                : { offset: 0, path, root: view.root };
            const sourceChildren = sources.flatMap((anchor) =>
              anchor.cell.children.map((_, index) =>
                tx.key(atPath(view.tablePath.concat(anchor.path, index)))
              )
            );

            if (
              sourceChildren.length > 0 &&
              hasDefaultCellContent(editor, destination.cell)
            ) {
              const placeholderKey = tx.key(
                view.tablePath.concat(destination.path, 0)
              );

              if (placeholderKey) tx.nodes.remove({ at: placeholderKey });
            }
            for (const childKey of sourceChildren) {
              if (!childKey) continue;
              const destinationEntry = tx.nodes.get(destinationKey, {
                match: (node) => isTableCell(editor, node),
              });

              if (!destinationEntry) return false;
              tx.nodes.move({
                at: childKey,
                to: destinationEntry[1].concat(
                  destinationEntry[0].children.length
                ),
              });
            }
            for (const source of sources.toReversed()) {
              const sourceKey = view.cellKeys[view.anchors.indexOf(source)];

              if (sourceKey) tx.nodes.remove({ at: sourceKey });
            }
            tx.nodes.set(
              {
                colSpan: view.bounds.maxCol - view.bounds.minCol + 1,
                rowSpan: view.bounds.maxRow - view.bounds.minRow + 1,
              },
              { at: destinationKey }
            );
            tx.selection.setNodes([destinationKey], {
              anchor: destinationKey,
              focus: destinationKey,
            });

            return true;
          },
          split: (options: TableTargetOptions = {}): boolean => {
            if (
              tx.view.isReadOnly() ||
              !context.store.get().allowCellSpanEditing
            ) {
              return false;
            }
            const view = selectionView(options);

            if (
              !view ||
              view.anchors.length !== 1 ||
              (view.anchor.colSpan === 1 && view.anchor.rowSpan === 1)
            ) {
              return false;
            }

            const selected = view.anchor;
            const selectedKey = view.cellKeys[view.anchors.indexOf(selected)];

            if (!selectedKey) return false;
            tx.nodes.unset(['colSpan', 'rowSpan'], { at: selectedKey });
            for (
              let { row } = selected;
              row < selected.row + selected.rowSpan;
              row++
            ) {
              const rowNode = view.table.children[row] as
                | TableRowElement
                | undefined;

              if (!rowNode) return false;
              const anchors = view.context.grid.anchorsByRow[row] ?? [];
              const insertionIndex =
                row === selected.row
                  ? selected.cellIndex + 1
                  : (anchors.find((anchor) => anchor.col >= selected.col)
                      ?.cellIndex ?? rowNode.children.length);
              const count =
                row === selected.row ? selected.colSpan - 1 : selected.colSpan;

              if (count > 0) {
                tx.nodes.insert(
                  Array.from({ length: count }, () =>
                    createTableCell(editor, {
                      header: selected.cell.header === true,
                      row: rowNode,
                    })
                  ),
                  { at: view.tablePath.concat(row, insertionIndex) }
                );
              }
            }
            tx.selection.setNodes([selectedKey], {
              anchor: selectedKey,
              focus: selectedKey,
            });

            return true;
          },
          setCellBackground: ({
            at,
            color,
          }: TableTargetOptions & { color: string | null }): boolean => {
            if (tx.view.isReadOnly()) return false;
            const view = selectionView({ at });

            if (!view) return false;
            let changed = false;

            for (const [cell, path] of view.cellEntries) {
              if ((cell.backgroundColor ?? null) === color) continue;
              changed = true;
              if (color === null) {
                tx.nodes.unset('backgroundColor', { at: path });
              } else {
                tx.nodes.set({ backgroundColor: color }, { at: path });
              }
            }

            return changed;
          },
          setBorders: ({
            at,
            border,
            value,
          }: TableTargetOptions & {
            border: TableBorderTarget;
            value: TableCellBorder | null;
          }): boolean => {
            if (
              value?.width !== undefined &&
              (!Number.isFinite(value.width) || value.width < 0)
            ) {
              throw new TypeError(
                'Table border width must be a non-negative finite number.'
              );
            }
            if (tx.view.isReadOnly()) return false;
            const view = selectionView({ at });

            return view ? applyBorders(view, border, value) : false;
          },
          toggleBorders: ({
            at,
            border,
          }: ToggleTableBordersOptions): boolean => {
            if (tx.view.isReadOnly()) return false;
            const view = selectionView({ at });

            if (!view) return false;
            const target = border === 'none' ? 'all' : border;
            const visible = view.anchors.flatMap((anchor) =>
              directionsForBorder(view, anchor, target).map((direction) =>
                edgeVisible(view, anchor, direction)
              )
            );
            const width =
              border === 'none'
                ? visible.every((value) => !value)
                  ? 1
                  : 0
                : visible.every(Boolean)
                  ? 0
                  : 1;

            return applyBorders(view, target, { width });
          },
          resize: ({ at, resize }: TableResizeOptions): boolean => {
            if (tx.view.isReadOnly()) return false;
            const view = selectionView({ at });

            if (!view) return false;
            const node = view.table;
            const path = view.tablePath;

            if (resize.edge === 'bottom') {
              if (
                !Number.isSafeInteger(resize.rowIndex) ||
                resize.rowIndex < 0 ||
                resize.rowIndex >= node.children.length ||
                !isPositiveFiniteNumber(resize.height)
              ) {
                throw new TypeError(
                  'Table resize requires a valid row and positive height.'
                );
              }
              const row = node.children[resize.rowIndex];

              if (ElementApi.isElement(row) && row.height === resize.height) {
                return false;
              }
              tx.nodes.set(
                { height: resize.height },
                { at: [...path, resize.rowIndex] }
              );

              return true;
            }
            if (resize.columns.length === 0) {
              throw new TypeError(
                'Horizontal table resize requires at least one column.'
              );
            }

            const columnCount = compileTableGrid(node).width;
            const current = getTableColumnSizes(node);
            const columnWidths = Array.from(
              { length: columnCount },
              (_, index): number | null => current?.[index] ?? null
            );

            for (const { colIndex, width } of resize.columns) {
              if (
                !Number.isSafeInteger(colIndex) ||
                colIndex < 0 ||
                colIndex >= columnCount ||
                !isPositiveFiniteNumber(width)
              ) {
                throw new TypeError(
                  'Table resize requires existing columns and positive widths.'
                );
              }
              columnWidths[colIndex] = width;
            }
            if (
              resize.edge === 'left' &&
              (!Number.isFinite(resize.marginLeft) || resize.marginLeft < 0)
            ) {
              throw new TypeError(
                'Table resize margin must be non-negative and finite.'
              );
            }
            const marginChanged =
              resize.edge === 'left' &&
              (node.marginLeft ?? 0) !== resize.marginLeft;
            const widthsChanged =
              JSON.stringify(current ?? []) !== JSON.stringify(columnWidths);

            if (!marginChanged && !widthsChanged) return false;
            tx.nodes.set(
              {
                columnWidths,
                ...(resize.edge === 'left'
                  ? { marginLeft: resize.marginLeft }
                  : {}),
              },
              { at: path }
            );

            return true;
          },
          setColumnWidth: ({
            at,
            colIndex,
            width,
          }: TableColumnWidthOptions): boolean => {
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
            if (tx.view.isReadOnly()) return false;
            const view = selectionView({ at });

            if (!view) return false;
            const columnCount = view.context.grid.width;

            if (colIndex >= columnCount) {
              throw new RangeError(
                'Table column index exceeds the last table column.'
              );
            }
            const current = getTableColumnSizes(view.table);
            const columnWidths: Array<number | null> = Array.from(
              { length: columnCount },
              (_, index): number | null => current?.[index] ?? null
            );

            if (columnWidths[colIndex] === width) return false;
            columnWidths[colIndex] = width;
            tx.nodes.set({ columnWidths }, { at: view.tablePath });

            return true;
          },
          setRowHeight: ({
            at,
            height,
            rowIndex,
          }: TableRowHeightOptions): boolean => {
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
            if (tx.view.isReadOnly()) return false;
            const view = selectionView({ at });
            const row = view?.table.children[rowIndex];

            if (!view || !ElementApi.isElement(row)) {
              if (view && rowIndex >= view.table.children.length) {
                throw new RangeError(
                  'Table row index exceeds the last table row.'
                );
              }

              return false;
            }
            if (row.height === height) return false;
            tx.nodes.set({ height }, { at: [...view.tablePath, rowIndex] });

            return true;
          },
        };
      },
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

          if (node.type === context.schema.type) {
            const table = node;
            const repair = planTableMutation(
              createDetachedTableContext(table, path),
              {
                createCell: ({ children, header, sourceRow }) =>
                  createTableCell(context.editor, {
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
            }
          }
        },
      },
    ],
  }))
  .extend((context) => {
    const cellType = context.editor.plugin(BaseTableCellPlugin).schema.type;
    const readSelection = (
      state: EditorStateView,
      at?: Location | TableTargetOptions['at']
    ) =>
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
          const view = readSelection(state, input.options.at);
          const hasNodeSelection =
            SelectionApi.isNode(input.options.at) ||
            (input.options.at === undefined &&
              state.selection.nodes().length > 0);

          return hasNodeSelection && view && view.anchors.length > 1
            ? projectTableSelectionSlice(context.editor, slice, view)
            : slice;
        }),
        around(editorReads.slice.export, ({ input, next, state }) => {
          const slice = next();

          if (input.source === 'assembled') return slice;

          const view = readSelection(state, input.options.at);
          const hasNodeSelection =
            SelectionApi.isNode(input.options.at) ||
            (input.options.at === undefined &&
              state.selection.nodes().length > 0);

          if (!view || hasNodeSelection) return slice;
          if (view.anchors.length > 1) {
            return projectTableSelectionSlice(context.editor, slice, view);
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
      around(domCommands.insertData, ({ input, next, state }) => {
        const exact = context.editor.api.dom.clipboard.readSlice(input);
        const view = readTableSelection(state, {
          cellTypes: [context.editor.plugin(BaseTableCellPlugin).schema.type],
          selection: state.selection(),
          tableType: context.schema.type,
        });
        const hasStructuralTarget = (view?.anchors.length ?? 0) > 1;

        if (hasStructuralTarget && exact.kind === 'invalid') {
          context.editor
            .plugin(DebugPlugin)
            .api.warn(
              'Table paste rejected: invalid-source.',
              'TABLE_MUTATION_DIAGNOSTIC',
              { kind: 'invalid-source', reason: 'malformed-exact' }
            );

          return state.transaction(() => {});
        }
        if (exact.kind === 'slice') {
          const table = getTablePasteElement(exact.slice, {
            tableType: context.schema.type,
          });

          if (table) {
            const grid = compileTableGrid(table);

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

              return state.transaction(() => {});
            }
          }
        }

        return next();
      }),
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

        if (!selection || SelectionApi.isNode(selection)) return next();

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

        if (
          !selection ||
          SelectionApi.isNode(selection) ||
          !state.selection.isCollapsed()
        ) {
          return false;
        }

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
        const target = input.at ?? state.selection();

        if (!target) return false;
        const view = readTableSelection(state, {
          at: target,
          cellTypes: [context.editor.plugin(BaseTableCellPlugin).schema.type],
          selection: state.selection(),
          tableType: context.schema.type,
        });

        if (
          !view ||
          (!SelectionApi.isNode(target) && view.cellEntries.length < 2)
        ) {
          return false;
        }

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
      around(editorCommands.replaceSlice, ({ input, state, next }) => {
        const { slice } = input;
        const target = input.options?.at ?? state.selection();
        const rejectTablePaste = (diagnostic: TablePasteDiagnostic): false => {
          context.editor
            .plugin(DebugPlugin)
            .api.warn(
              `Table paste rejected: ${diagnostic.kind}.`,
              'TABLE_MUTATION_DIAGNOSTIC',
              diagnostic
            );

          return false;
        };

        if (!target) return next();
        const view = readTableSelection(state, {
          at: target,
          cellTypes: [context.editor.plugin(BaseTableCellPlugin).schema.type],
          selection: state.selection(),
          tableType: context.schema.type,
        });

        if (!view) return next();

        const prepared = prepareTablePaste(slice, {
          createCell: ({ children, header, sourceRow }) =>
            createTableCell(context.editor, {
              children: children ? [...children] : undefined,
              header,
              row: sourceRow,
            }),
          createRow: () => createTableRow(context.editor, { columns: 0 }),
          tableType: context.schema.type,
        });

        if (prepared === null) {
          if (view.anchors.length <= 1) return next();
          let fitted = false;
          const transaction = state.transaction(() => {
            fitted = fitSlicePlacements(context.editor, slice, {
              placements: view.cellEntries.map(([, path]) => ({
                at: path,
                content: slice.content,
              })),
            });
          });

          return fitted
            ? transaction
            : rejectTablePaste({
                kind: 'invalid-source',
                reason: 'content-rejected',
              });
        }
        if ('kind' in prepared) return rejectTablePaste(prepared);
        if (
          view.anchors.length > 1 &&
          !toPublicTableSelection(view).rectangular
        ) {
          return rejectTablePaste({
            kind: 'invalid-target',
            reason: 'shape-mismatch',
          });
        }

        const { root } = view;
        const fillBounds = view.anchors.length > 1 ? view.bounds : undefined;
        const { defaultTableWidth, minColumnWidth } = context.store.get();
        const plan = planPreparedTablePaste(view.context, prepared, {
          createCell: ({ children, header, sourceRow }) =>
            createTableCell(context.editor, {
              children: children ? [...children] : undefined,
              header,
              row: sourceRow,
            }),
          createRow: () => createTableRow(context.editor, { columns: 0 }),
          disableExpand: !context.store.get().expandOnPaste,
          ...(fillBounds ? { fillBounds } : {}),
          ...(defaultTableWidth === null
            ? {}
            : { initialTableWidth: defaultTableWidth }),
          minColumnWidth,
          ...(root === undefined ? {} : { root }),
          startCol: fillBounds?.minCol ?? view.anchor.col,
          startRow: fillBounds?.minRow ?? view.anchor.row,
        });

        if (plan.kind !== 'plan') return rejectTablePaste(plan);

        let fitted = true;
        const transaction = state.transaction((tx) => {
          applyTableMutationPlan(tx, {
            kind: 'plan',
            operations: plan.operations,
          });

          for (const group of plan.placementGroups) {
            if (
              !fitSlicePlacements(context.editor, group.source, {
                placements: group.placements,
              })
            ) {
              fitted = false;
              return;
            }
          }
          if (!fitted) return;

          const selectedPaths = [
            ...new Map(
              plan.placementGroups.flatMap((group) =>
                group.placements.map(({ at }) => [at.join(','), at] as const)
              )
            ).values(),
          ];

          if (selectedPaths.length > 1) {
            const firstPath = selectedPaths[0];
            const anchorPath =
              selectedPaths.find(
                (path) =>
                  PathApi.equals(path, plan.selection.anchor.path) ||
                  PathApi.isAncestor(path, plan.selection.anchor.path)
              ) ?? selectedPaths[0];
            const focusPath =
              selectedPaths.find(
                (path) =>
                  PathApi.equals(path, plan.selection.focus.path) ||
                  PathApi.isAncestor(path, plan.selection.focus.path)
              ) ?? selectedPaths.at(-1);

            if (firstPath && anchorPath && focusPath) {
              tx.selection.setNodes([firstPath, ...selectedPaths.slice(1)], {
                anchor: anchorPath,
                focus: focusPath,
                ...(root === undefined ? {} : { root }),
              });
            }
          } else {
            tx.selection.set(plan.selection);
          }
        });

        return fitted
          ? transaction
          : rejectTablePaste({
              kind: 'invalid-source',
              reason: 'content-rejected',
            });
      }),
      around(editorCommands.insertText, ({ state, next }) => {
        const selection = state.selection();
        const view = selection
          ? readTableSelection(state, {
              at: selection,
              cellTypes: [
                context.editor.plugin(BaseTableCellPlugin).schema.type,
              ],
              selection,
              tableType: context.schema.type,
            })
          : null;

        if (
          !selection ||
          !view ||
          (!SelectionApi.isNode(selection) && view.cellEntries.length < 2)
        ) {
          return next();
        }
        const focusPath = view.tablePath.concat(view.focus.path);
        const focus = state.points.start(focusPath);
        const transaction = state.transaction((tx) => {
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

          if (focus) tx.selection.set({ anchor: focus, focus });
        });

        return next.after(transaction);
      }),
    ],
  }));

export type TableDefinition = DefinitionOf<typeof BaseTablePlugin>;

export type { TableCellBorder, TableCellBorders } from './types';
