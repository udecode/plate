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
  readonly background?: string;
  readonly borders?: TableCellBorders;
  readonly size?: number;
};

const borderDirections = ['bottom', 'left', 'right', 'top'] as const;

const normalizeSpan = (value: unknown): number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  Number.isFinite(value) &&
  value > 0
    ? value
    : 1;

const parseHtmlSpan = (value: string | null): number | undefined => {
  if (value === null) return;

  const span = Number(value);

  if (!Number.isInteger(span) || !Number.isFinite(span) || span <= 1) return;

  return span;
};

const parseCssNumber = (value: string | null | undefined) => {
  if (!value) return;
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const getBorderStyle = (
  style: CSSStyleDeclaration,
  direction: (typeof borderDirections)[number]
) => {
  switch (direction) {
    case 'bottom':
      return {
        color: style.borderBottomColor,
        size: parseCssNumber(style.borderBottomWidth),
        style: style.borderBottomStyle,
      };
    case 'left':
      return {
        color: style.borderLeftColor,
        size: parseCssNumber(style.borderLeftWidth),
        style: style.borderLeftStyle,
      };
    case 'right':
      return {
        color: style.borderRightColor,
        size: parseCssNumber(style.borderRightWidth),
        style: style.borderRightStyle,
      };
    case 'top':
      return {
        color: style.borderTopColor,
        size: parseCssNumber(style.borderTopWidth),
        style: style.borderTopStyle,
      };
  }
};

const parseBorder = (
  style: CSSStyleDeclaration,
  direction: (typeof borderDirections)[number]
): TableCellBorder | undefined => {
  const border = getBorderStyle(style, direction);

  if (!border.color && border.size === undefined && !border.style) return;

  return {
    ...(border.color ? { color: border.color } : {}),
    ...(border.size === undefined ? {} : { size: border.size }),
    ...(border.style ? { style: border.style } : {}),
  };
};

const serializeBorder = (border: TableCellBorder | undefined) => {
  if (!border) return;

  return `${border.size ?? 1}px ${border.style ?? 'solid'} ${
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
    background: cell.background,
    borderBottom: serializeBorder(cell.borders?.bottom),
    borderLeft: serializeBorder(cell.borders?.left),
    borderRight: serializeBorder(cell.borders?.right),
    borderTop: serializeBorder(cell.borders?.top),
    width: cell.size === undefined ? undefined : `${cell.size}px`,
  },
});

export const parseTableCellHtml = (element: HTMLElement) => {
  const background = element.style.background || element.style.backgroundColor;
  const borders = Object.fromEntries(
    borderDirections.flatMap((direction) => {
      const border = parseBorder(element.style, direction);

      return border ? [[direction, border] as const] : [];
    })
  );
  const colSpan = parseHtmlSpan(element.getAttribute('colspan'));
  const rowSpan = parseHtmlSpan(element.getAttribute('rowspan'));
  const size = parseCssNumber(
    element.style.width || element.getAttribute('width')
  );

  return {
    ...(background ? { background } : {}),
    ...(Object.keys(borders).length > 0 ? { borders } : {}),
    ...(colSpan ? { colSpan } : {}),
    ...(rowSpan ? { rowSpan } : {}),
    ...(size === undefined ? {} : { size }),
  };
};
