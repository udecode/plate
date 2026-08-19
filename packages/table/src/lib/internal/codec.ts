import type { Descendant } from '@platejs/plite';
import type { TableCellBorder, TableCellBorders } from '../BaseTablePlugin';

type TableCellSpan = {
  readonly colSpan?: number;
  readonly rowSpan?: number;
};
type MutableTableCellSpan = {
  -readonly [TKey in keyof TableCellSpan]: TableCellSpan[TKey];
};
type TableCellHtmlProperties = TableCellSpan & {
  readonly backgroundColor?: string;
  readonly borders?: TableCellBorders;
};

const borderDirections = ['bottom', 'left', 'right', 'top'] as const;
const cssPixelNumberPattern = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))px$/i;
const htmlNonNegativeIntegerPattern = /^[\t\n\f\r ]*([+-]?)([0-9]+)/;
const zeroDigitsPattern = /^0+$/;
export const MAX_IMPORTED_TABLE_COLUMNS = 1000;
const MAX_IMPORTED_TABLE_ROWS = 65_534;
const MAX_IMPORTED_TABLE_PLACEMENT_WORK = 10_000;
const IMPORTED_TABLE_CELL_SPANS = new WeakMap<
  HTMLTableElement,
  ReadonlyMap<HTMLElement, number>
>();
const IMPORTED_ROW_GROUP_INDICES = new WeakMap<
  Element,
  ReadonlyMap<HTMLTableRowElement, number>
>();
const IMPORTED_TABLE_DECODE_SESSIONS = new WeakMap<HTMLTableElement, object>();

const normalizeSpan = (value: unknown): number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  Number.isFinite(value) &&
  value > 0
    ? value
    : 1;

const parseHtmlNonNegativeInteger = (
  value: string | null,
  maximum: number
): number | undefined => {
  if (value === null) return;

  const match = htmlNonNegativeIntegerPattern.exec(value);

  if (!match) return;

  const [, sign, digits] = match;

  if (sign === '-' && !zeroDigitsPattern.test(digits)) return;

  const integer = Number(digits);

  return Number.isFinite(integer) ? Math.min(integer, maximum) : maximum;
};

export const parseHtmlColSpan = (value: string | null): number | undefined => {
  const span = parseHtmlNonNegativeInteger(value, MAX_IMPORTED_TABLE_COLUMNS);

  return span !== undefined && span > 1 ? span : undefined;
};

export const resetImportedTableCellSpans = (table: HTMLTableElement) => {
  const session = {};

  IMPORTED_TABLE_DECODE_SESSIONS.set(table, session);
  IMPORTED_TABLE_CELL_SPANS.delete(table);
  IMPORTED_ROW_GROUP_INDICES.delete(table);
  table
    .querySelectorAll(':scope > thead, :scope > tbody, :scope > tfoot')
    .forEach((section) => {
      IMPORTED_ROW_GROUP_INDICES.delete(section);
    });
  queueMicrotask(() => {
    if (IMPORTED_TABLE_DECODE_SESSIONS.get(table) !== session) return;

    IMPORTED_TABLE_DECODE_SESSIONS.delete(table);
    IMPORTED_TABLE_CELL_SPANS.delete(table);
    IMPORTED_ROW_GROUP_INDICES.delete(table);
    table
      .querySelectorAll(':scope > thead, :scope > tbody, :scope > tfoot')
      .forEach((section) => {
        IMPORTED_ROW_GROUP_INDICES.delete(section);
      });
  });
};

export const getImportedTableCellColSpan = (element: HTMLElement) => {
  const table = element.closest('table') as HTMLTableElement | null;

  if (!table) return parseHtmlColSpan(element.getAttribute('colspan')) ?? 1;

  const decodeSessionActive = IMPORTED_TABLE_DECODE_SESSIONS.has(table);
  let spans = decodeSessionActive
    ? IMPORTED_TABLE_CELL_SPANS.get(table)
    : undefined;

  if (!spans) {
    const rows = Array.from(
      table.querySelectorAll<HTMLTableRowElement>(
        ':scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr, :scope > tr'
      )
    );
    const rowCells = new Map(
      rows.map((row) => [
        row,
        Array.from(
          row.querySelectorAll<HTMLElement>(':scope > td, :scope > th')
        ),
      ])
    );
    const rowGroupEnd = new Array<number>(rows.length);
    let nextRowGroup: HTMLElement | null = null;
    let nextRowGroupEnd = rows.length - 1;

    for (let index = rows.length - 1; index >= 0; index--) {
      const row = rows[index];

      if (row.parentElement !== nextRowGroup) {
        nextRowGroup = row.parentElement;
        nextRowGroupEnd = index;
      }
      rowGroupEnd[index] = nextRowGroupEnd;
    }
    let rangeTreeSize = 1;

    while (rangeTreeSize < rows.length) rangeTreeSize *= 2;
    const rangeTree = new Array<number>(rangeTreeSize * 2).fill(0);

    rows.forEach((row, index) => {
      rangeTree[rangeTreeSize + index] = rowCells.get(row)?.length ?? 0;
    });
    for (let index = rangeTreeSize - 1; index > 0; index--) {
      rangeTree[index] = Math.max(
        rangeTree[index * 2] ?? 0,
        rangeTree[index * 2 + 1] ?? 0
      );
    }
    const getMaximumRowCells = (from: number, to: number) => {
      if (from > to) return 0;

      let left = from + rangeTreeSize;
      let right = to + rangeTreeSize;
      let maximum = 0;

      while (left <= right) {
        if (left % 2 === 1) {
          maximum = Math.max(maximum, rangeTree[left] ?? 0);
          left += 1;
        }
        if (right % 2 === 0) {
          maximum = Math.max(maximum, rangeTree[right] ?? 0);
          right -= 1;
        }
        left = Math.floor(left / 2);
        right = Math.floor(right / 2);
      }

      return maximum;
    };
    const nextSpans = new Map<HTMLElement, number>();
    const occupiedRows: number[] = [];
    let currentRowGroup: HTMLElement | null = null;
    let placementWork = 0;
    let placementWorkExhausted = false;

    rows.forEach((row, rowIndex) => {
      if (row.parentElement !== currentRowGroup) {
        currentRowGroup = row.parentElement;
        occupiedRows.length = 0;
      } else if (rowIndex > 0) {
        occupiedRows.forEach((remaining, index) => {
          occupiedRows[index] = Math.max(0, remaining - 1);
        });
      }

      const cells = rowCells.get(row) ?? [];
      let column = 0;

      cells.forEach((cell, index) => {
        if (placementWorkExhausted) {
          nextSpans.set(cell, 1);
          return;
        }

        const requested = parseHtmlColSpan(cell.getAttribute('colspan')) ?? 1;
        const rowSpan = parseHtmlRowSpan(cell) ?? 1;
        const remainingCells = cells.length - index - 1;
        const coveredRowEnd = Math.min(
          rowGroupEnd[rowIndex] ?? rowIndex,
          rowIndex + rowSpan - 1
        );
        const reservedColumns = Math.max(
          remainingCells,
          rowSpan > 1 ? getMaximumRowCells(rowIndex + 1, coveredRowEnd) : 0
        );
        let span = 1;
        let placed = false;

        while (column < MAX_IMPORTED_TABLE_COLUMNS) {
          const available = Math.max(
            1,
            MAX_IMPORTED_TABLE_COLUMNS - column - reservedColumns
          );
          const candidate = Math.min(requested, available);
          let blocked = false;

          for (let offset = 0; offset < candidate; offset++) {
            placementWork += 1;
            if (placementWork > MAX_IMPORTED_TABLE_PLACEMENT_WORK) {
              placementWorkExhausted = true;
              nextSpans.set(cell, 1);
              return;
            }
            if ((occupiedRows[column + offset] ?? 0) > 0) {
              blocked = true;
              break;
            }
          }

          if (!blocked) {
            span = candidate;
            placed = true;
            break;
          }
          column += 1;
        }

        nextSpans.set(cell, span);

        if (placed) {
          if (rowSpan > 1) {
            for (let offset = 0; offset < span; offset++) {
              occupiedRows[column + offset] = Math.max(
                occupiedRows[column + offset] ?? 0,
                rowSpan
              );
            }
          }
          column += span;
        }
      });
    });

    spans = nextSpans;
    if (decodeSessionActive) IMPORTED_TABLE_CELL_SPANS.set(table, spans);
  }

  return spans.get(element) ?? 1;
};

export const parseHtmlRowSpan = (element: HTMLElement) => {
  const value = element.getAttribute('rowspan');
  const span = parseHtmlNonNegativeInteger(value, MAX_IMPORTED_TABLE_ROWS);
  const isZero = span === 0;

  if (!isZero) return span !== undefined && span > 1 ? span : undefined;

  const row = element.closest('tr') as HTMLTableRowElement | null;
  const parent = row?.parentElement;
  const table = row?.closest('table') as HTMLTableElement | null;
  const decodeSessionActive =
    table !== null && IMPORTED_TABLE_DECODE_SESSIONS.has(table);
  let indices =
    parent && decodeSessionActive
      ? IMPORTED_ROW_GROUP_INDICES.get(parent)
      : undefined;

  if (parent && !indices) {
    const rows = Array.from(
      parent.querySelectorAll<HTMLTableRowElement>(':scope > tr')
    );

    indices = new Map(rows.map((child, index) => [child, index]));
    if (decodeSessionActive) IMPORTED_ROW_GROUP_INDICES.set(parent, indices);
  }

  const rowIndex = row ? indices?.get(row) : undefined;
  const rowCount = indices?.size;
  const remainingRows =
    rowIndex === undefined || rowIndex < 0 || rowCount === undefined
      ? undefined
      : rowCount - rowIndex;

  return remainingRows !== undefined && remainingRows > 1
    ? remainingRows
    : undefined;
};

const parseCssPixelNumber = (value: string | null | undefined) => {
  if (!value) return;
  const match = cssPixelNumberPattern.exec(value.trim());

  if (!match) return;

  const parsed = Number(match[1]);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const getBorderStyle = (
  style: CSSStyleDeclaration,
  direction: (typeof borderDirections)[number]
) => {
  switch (direction) {
    case 'bottom': {
      const rawWidth = style.borderBottomWidth;

      return {
        color: style.borderBottomColor,
        rawWidth,
        style: style.borderBottomStyle,
        width: parseCssPixelNumber(rawWidth),
      };
    }
    case 'left': {
      const rawWidth = style.borderLeftWidth;

      return {
        color: style.borderLeftColor,
        rawWidth,
        style: style.borderLeftStyle,
        width: parseCssPixelNumber(rawWidth),
      };
    }
    case 'right': {
      const rawWidth = style.borderRightWidth;

      return {
        color: style.borderRightColor,
        rawWidth,
        style: style.borderRightStyle,
        width: parseCssPixelNumber(rawWidth),
      };
    }
    case 'top': {
      const rawWidth = style.borderTopWidth;

      return {
        color: style.borderTopColor,
        rawWidth,
        style: style.borderTopStyle,
        width: parseCssPixelNumber(rawWidth),
      };
    }
  }
};

const parseBorder = (
  style: CSSStyleDeclaration,
  direction: (typeof borderDirections)[number]
): TableCellBorder | undefined => {
  const border = getBorderStyle(style, direction);

  if (!border.style || !border.rawWidth || border.width === undefined) return;

  return {
    ...(border.color ? { color: border.color } : {}),
    ...(border.width === undefined ? {} : { width: border.width }),
    ...(border.style ? { style: border.style } : {}),
  };
};

const serializeBorder = (border: TableCellBorder | undefined) => {
  if (!border) return;

  return `${border.width ?? 1}px ${border.style ?? 'solid'} ${
    border.color ?? 'currentColor'
  }`;
};

export const getColSpan = (cell: TableCellSpan): number =>
  normalizeSpan(cell.colSpan);

export const getRowSpan = (cell: TableCellSpan): number =>
  normalizeSpan(cell.rowSpan);

export const setSpan = (
  cell: MutableTableCellSpan,
  key: 'colSpan' | 'rowSpan',
  value: number
) => {
  const span = normalizeSpan(value);

  if (span === 1) {
    delete cell[key];
  } else {
    cell[key] = span;
  }
};

export const getTableCellHtmlProps = (element?: Descendant) => {
  if (!element || !('children' in element)) return {};

  const cell = element as TableCellSpan;
  const colSpan = getColSpan(cell);
  const rowSpan = getRowSpan(cell);

  return {
    colSpan: colSpan > 1 ? colSpan : undefined,
    rowSpan: rowSpan > 1 ? rowSpan : undefined,
  };
};

export const getTableCellHtmlCodecProps = (cell: TableCellHtmlProperties) => ({
  attributes: {
    colspan: getColSpan(cell) > 1 ? getColSpan(cell) : undefined,
    rowspan: getRowSpan(cell) > 1 ? getRowSpan(cell) : undefined,
  },
  style: {
    background: cell.backgroundColor,
    borderBottom: serializeBorder(cell.borders?.bottom),
    borderLeft: serializeBorder(cell.borders?.left),
    borderRight: serializeBorder(cell.borders?.right),
    borderTop: serializeBorder(cell.borders?.top),
  },
});

export const parseTableCellHtml = (element: HTMLElement) => {
  const backgroundColor =
    element.style.background || element.style.backgroundColor;
  const borders = Object.fromEntries(
    borderDirections.flatMap((direction) => {
      const border = parseBorder(element.style, direction);

      return border ? [[direction, border] as const] : [];
    })
  );
  const colSpan = getImportedTableCellColSpan(element);
  const rowSpan = parseHtmlRowSpan(element);
  return {
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(Object.keys(borders).length > 0 ? { borders } : {}),
    ...(colSpan > 1 ? { colSpan } : {}),
    ...(rowSpan ? { rowSpan } : {}),
  };
};
