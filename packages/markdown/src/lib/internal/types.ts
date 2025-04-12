import type { Descendant, TElement, TText } from '@udecode/plate';

export interface TCalloutElement extends TElement {
  backgroundColor?: string;
  icon?: string;
  variant?:
    | (string & {})
    | 'error'
    | 'info'
    | 'note'
    | 'success'
    | 'tip'
    | 'warning';
}
/** @internal avoid duplicate with other packages */
export interface TCodeBlockElement extends TElement {
  lang?: string;
}
export interface TColumnElement extends TElement {
  type: 'column';
  width: string;
  id?: string;
}

export interface TColumnGroupElement extends TElement {
  children: TColumnElement[];
  type: 'column_group';
  id?: string;
  layout?: number[];
}
export interface TDateElement extends TElement {
  date?: string;
}

export interface TEquationElement extends TElement {
  texExpression: string;
}

export interface TImageElement extends TElement {
  url: string;
  id?: string;
  align?: 'center' | 'left' | 'right';
  caption?: Descendant[];
  isUpload?: boolean;
  name?: string;
  placeholderId?: string;
}

export type TIndentListElement = TElement & {
  indent: number;
  listStyleType: string;
  checked?: boolean;
  listStart?: number;
};

export interface TLinkElement extends TElement {
  url: string;
  target?: string;
}

export interface TMentionElement extends TElement {
  value: string;
}

export interface TStandardListElement extends TElement {
  type: 'ol' | 'ul';
}
export type TSuggestionText = TText & {
  [key: string]: TInlineSuggestionData | boolean | string;
  suggestion: true;
  text: string;
};
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

interface BorderStyle {
  color?: string;
  size?: number;
  style?: string;
}

type TInlineSuggestionData =
  | TInsertSuggestionData
  | TRemoveSuggestionData
  | TUpdateSuggestionData;

type TInsertSuggestionData = {
  id: string;
  createdAt: number;
  type: 'insert';
  userId: string;
};

type TRemoveSuggestionData = {
  id: string;
  createdAt: number;
  type: 'remove';
  userId: string;
};

type TUpdateSuggestionData = {
  id: string;
  createdAt: number;
  type: 'update';
  userId: string;
  newProperties?: any;
  properties?: any;
};
