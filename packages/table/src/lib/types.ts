import type { Descendant, TElement } from '@udecode/plate';

export type BorderDirection = 'bottom' | 'left' | 'right' | 'top';

export interface BorderStyle {
  color?: string;
  size?: number;
  // https://docx.js.org/api/enums/BorderStyle.html
  style?: string;
}

export type CreateCellOptions = {
  children?: Descendant[];
  header?: boolean;
  row?: TTableRowElement;
};

export type TableStoreSizeOverrides = Map<number, number>;

export interface TTableCellElement extends TElement {
  id?: string;
  attributes?: {
    colspan?: string;
    rowspan?: string;
  };
  background?: string;
  borders?: {
    /** Only the last row cells have a bottom border. */
    bottom?: BorderStyle;
    left?: BorderStyle;
    /** Only the last column cells have a right border. */
    right?: BorderStyle;
    top?: BorderStyle;
  };
  colSpan?: number;
  rowSpan?: number;
  size?: number;
}

export interface TTableElement extends TElement {
  colSizes?: number[];
  marginLeft?: number;
}

export interface TTableRowElement extends TElement {
  size?: number;
}
