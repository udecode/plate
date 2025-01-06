import type { Descendant, TElement } from '@udecode/plate-common';

export type CreateCellOptions = {
  children?: Descendant[];
  header?: boolean;
  row?: TTableRowElement;
};

export interface BorderStyle {
  color?: string;
  size?: number;
  // https://docx.js.org/api/enums/BorderStyle.html
  style?: string;
}

export interface TTableElement extends TElement {
  colSizes?: number[];
  marginLeft?: number;
}

export interface TTableRowElement extends TElement {
  size?: number;
}

export interface TTableCellElement extends TElement {
  id?: string;
  attributes?: {
    colspan?: string;
    rowspan?: string;
  };
  borders?: {
    /** Only the last row cells have a bottom border. */
    bottom?: BorderStyle;
    left?: BorderStyle;

    /** Only the last column cells have a right border. */
    right?: BorderStyle;

    top?: BorderStyle;
  };
  background?: string;
  colSpan?: number;
  rowSpan?: number;
  size?: number;
}

export type BorderDirection = 'bottom' | 'left' | 'right' | 'top';

export type TableStoreSizeOverrides = Map<number, number>;
