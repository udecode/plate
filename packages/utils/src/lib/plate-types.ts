import type { Descendant, Element, Text } from '@platejs/slate';
import type { UnknownObject } from '@udecode/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Elements
// ─────────────────────────────────────────────────────────────────────────────

export interface TCalloutElement extends Element {
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

export type TTagProps = { value: string } & UnknownObject;

export type TTagElement = Element & TTagProps;

export interface TCodeBlockElement extends Element {
  lang?: string;
}

export interface TCodeSyntaxLeaf extends Text {
  className?: string;
}

export interface TColumnElement extends Element {
  type: 'column';
  width: string;
  id?: string;
}

export interface TColumnGroupElement extends Element {
  children: TColumnElement[];
  type: 'column_group';
  id?: string;
  layout?: number[];
}

export interface TDateElement extends Element {
  date?: string;
  rawDate?: string;
}

export interface TEquationElement extends Element {
  texExpression: string;
}

export interface TImageElement extends TMediaElement {
  initialHeight?: number;
  initialWidth?: number;
}

export interface TPlaceholderElement extends Element {
  mediaType: string;
}

export interface TAudioElement extends TMediaElement {}

export interface TFileElement extends TMediaElement {}

export interface TVideoElement extends TMediaElement {}

export interface TMediaEmbedElement extends TMediaElement {}

// ─────────────────────────────────────────────────────────────────────────────
// Inline
// ─────────────────────────────────────────────────────────────────────────────

export interface TLinkElement extends Element {
  url: string;
  target?: string;
}

export interface TMentionElement extends Element {
  value: string;
}

export interface TComboboxInputElement extends Element {
  value: string;
}

export interface TTableElement extends Element {
  colSizes?: number[];
  marginLeft?: number;
}

export interface TTableRowElement extends Element {
  size?: number;
}

export interface TTableCellElement extends Element {
  id?: string;
  attributes?: {
    colspan?: string;
    rowspan?: string;
  };
  background?: string;
  borders?: {
    /** Only the last row cells have a bottom border. */
    bottom?: TTableCellBorder;
    left?: TTableCellBorder;
    /** Only the last column cells have a right border. */
    right?: TTableCellBorder;
    top?: TTableCellBorder;
  };
  colSpan?: number;
  rowSpan?: number;
  size?: number;
}

export type TTableCellBorder = {
  color?: string;
  size?: number;
  style?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export type TIdProps = {
  id: string;
};

export type TIdElement = Element & TIdProps;

export type TTextAlignProps = {
  align?: React.CSSProperties['textAlign'];
};

export type TResizableProps = {
  align?: 'center' | 'left' | 'right';
  width?: number;
};

export type TResizableElement = Element & TResizableProps;

export type TMediaProps = {
  url: string;
  id?: string;
  isUpload?: boolean;
  name?: string;
  placeholderId?: string;
  provider?: string;
  sourceUrl?: string;
};

export type TMediaElement = Element & TMediaProps;

export type TCaptionProps = {
  caption?: Descendant[];
};

export type TCaptionElement = Element & TCaptionProps;

export type TIndentProps = {
  indent: number;
};

export type TIndentElement = Element & TIndentProps;

export type TListProps = TIndentProps & {
  listStyleType: string;
  checked?: boolean;
  listRestart?: number;
  listRestartPolite?: number;
  listStart?: number;
};
export type TListElement = Element & TListProps;

export type TSuggestionProps = {
  suggestion: TSuggestionData;
};

export type TSuggestionElement = Element & TSuggestionProps;

export type TLineHeightProps = {
  lineHeight?: React.CSSProperties['lineHeight'];
};

// ─────────────────────────────────────────────────────────────────────────────
// Marks
// ─────────────────────────────────────────────────────────────────────────────

export type TBasicMarks = {
  bold?: boolean;
  code?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  subscript?: boolean;
  underline?: boolean;
};

export type TFontMarks = {
  backgroundColor?: React.CSSProperties['backgroundColor'];
  color?: React.CSSProperties['color'];
  fontFamily?: React.CSSProperties['fontFamily'];
  fontSize?: React.CSSProperties['fontSize'];
  fontWeight?: React.CSSProperties['fontWeight'];
};

export interface TCommentText extends Text {
  comment?: boolean;
}

export type TSuggestionData = {
  id: string;
  createdAt: number;
  type: 'insert' | 'remove';
  userId: string;
  isLineBreak?: boolean;
};

export type TSuggestionText = Text & {
  [key: string]: TInlineSuggestionData | boolean | string;
  suggestion: true;
  text: string;
};

export type TInlineSuggestionData =
  | TInsertSuggestionData
  | TRemoveSuggestionData
  | TUpdateSuggestionData;

export type TInsertSuggestionData = {
  id: string;
  createdAt: number;
  type: 'insert';
  userId: string;
};

export type TRemoveSuggestionData = {
  id: string;
  createdAt: number;
  type: 'remove';
  userId: string;
};

export type TUpdateSuggestionData = {
  id: string;
  createdAt: number;
  type: 'update';
  userId: string;
  newProperties?: any;
  properties?: any;
};

export type EmptyText = {
  text: '';
};

export type PlainText = {
  text: string;
};

export type NodeMap = {
  a: TLinkElement;
  action_item: TListElement;
  ai: Text & { ai: true };
  aiChat: Element;
  audio: TAudioElement;
  blockquote: Element;
  bold: Text & { bold: true };
  callout: TCalloutElement;
  code: Text & { code: true };
  code_block: TCodeBlockElement;
  code_line: Element;
  code_syntax: TCodeSyntaxLeaf;
  column: TColumnElement;
  column_group: TColumnGroupElement;
  comment: Text & { comment: true };
  date: TDateElement;
  emoji_input: TComboboxInputElement;
  equation: TEquationElement;
  excalidraw: Element;
  file: TFileElement;
  h1: Element;
  h2: Element;
  h3: Element;
  h4: Element;
  h5: Element;
  h6: Element;
  highlight: Text & { highlight: true };
  hr: Element;
  img: TImageElement & TCaptionProps;
  inline_equation: TEquationElement;
  italic: Text & { italic: true };
  kbd: Text & { kbd: true };
  li: Element;
  lic: Element;
  media_embed: TMediaEmbedElement & TCaptionProps;
  mention: TMentionElement;
  mention_input: TComboboxInputElement;
  ol: TListElement;
  p: Element;
  search_highlight: Text & { search_highlight: true };
  slash_input: TComboboxInputElement;
  strikethrough: Text & { strikethrough: true };
  subscript: Text & { subscript: true };
  suggestion: TSuggestionText;
  superscript: Text & { superscript: true };
  table: TTableElement;
  tag: TTagElement;
  td: TTableCellElement;
  th: TTableCellElement;
  toc: Element;
  toggle: Element;
  tr: TTableRowElement;
  ul: TListElement;
  underline: Text & { underline: true };
  video: TVideoElement & TCaptionProps;
};
