import type { Descendant, TElement, TText } from '@platejs/slate';
import type { UnknownObject } from '@udecode/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Elements
// ─────────────────────────────────────────────────────────────────────────────

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

export type TTagProps = { value: string } & UnknownObject;

export type TTagElement = TElement & TTagProps;

export interface TCodeBlockElement extends TElement {
  lang?: string;
}

export interface TCodeSyntaxLeaf extends TText {
  className?: string;
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

export interface TImageElement extends TMediaElement {
  initialHeight?: number;
  initialWidth?: number;
}

export interface TPlaceholderElement extends TElement {
  mediaType: string;
}

export interface TAudioElement extends TMediaElement {}

export interface TFileElement extends TMediaElement {}

export interface TVideoElement extends TMediaElement {}

export interface TMediaEmbedElement extends TMediaElement {}

// ─────────────────────────────────────────────────────────────────────────────
// Inline
// ─────────────────────────────────────────────────────────────────────────────

export interface TLinkElement extends TElement {
  url: string;
  target?: string;
}

export interface TMentionElement extends TElement {
  value: string;
}

export interface TComboboxInputElement extends TElement {
  value: string;
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

export type TIdElement = TElement & TIdProps;

export type TTextAlignProps = {
  align?: React.CSSProperties['textAlign'];
};

export type TResizableProps = {
  align?: 'center' | 'left' | 'right';
  width?: number;
};

export type TResizableElement = TElement & TResizableProps;

export type TMediaProps = {
  url: string;
  id?: string;
  isUpload?: boolean;
  name?: string;
  placeholderId?: string;
};

export type TMediaElement = TElement & TMediaProps;

export type TCaptionProps = {
  caption?: Descendant[];
};

export type TCaptionElement = TElement & TCaptionProps;

export type TIndentProps = {
  indent: number;
};

export type TIndentElement = TElement & TIndentProps;

export type TListProps = TIndentProps & {
  listStyleType: string;
  checked?: boolean;
  listRestart?: number;
  listRestartPolite?: number;
  listStart?: number;
};
export type TListElement = TElement & TListProps;

export type TSuggestionProps = {
  suggestion: TSuggestionData;
};

export type TSuggestionElement = TElement & TSuggestionProps;

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

export interface TCommentText extends TText {
  comment?: boolean;
}

export type TSuggestionData = {
  id: string;
  createdAt: number;
  type: 'insert' | 'remove';
  userId: string;
  isLineBreak?: boolean;
};

export type TSuggestionText = TText & {
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

export type TNodeMap = {
  a: TLinkElement;
  action_item: TListElement;
  ai: TText & { ai: true };
  aiChat: TElement;
  audio: TAudioElement;
  blockquote: TElement;
  bold: TText & { bold: true };
  callout: TCalloutElement;
  code: TText & { code: true };
  code_block: TCodeBlockElement;
  code_line: TElement;
  code_syntax: TCodeSyntaxLeaf;
  column: TColumnElement;
  column_group: TColumnGroupElement;
  comment: TText & { comment: true };
  date: TDateElement;
  emoji_input: TComboboxInputElement;
  equation: TEquationElement;
  excalidraw: TElement;
  file: TFileElement;
  h1: TElement;
  h2: TElement;
  h3: TElement;
  h4: TElement;
  h5: TElement;
  h6: TElement;
  highlight: TText & { highlight: true };
  hr: TElement;
  img: TImageElement & TCaptionProps;
  inline_equation: TEquationElement;
  italic: TText & { italic: true };
  kbd: TText & { kbd: true };
  li: TElement;
  lic: TElement;
  media_embed: TMediaEmbedElement & TCaptionProps;
  mention: TMentionElement;
  mention_input: TComboboxInputElement;
  ol: TListElement;
  p: TElement;
  search_highlight: TText & { search_highlight: true };
  slash_input: TComboboxInputElement;
  strikethrough: TText & { strikethrough: true };
  subscript: TText & { subscript: true };
  suggestion: TSuggestionText;
  superscript: TText & { superscript: true };
  table: TTableElement;
  tag: TTagElement;
  td: TTableCellElement;
  th: TTableCellElement;
  toc: TElement;
  toggle: TElement;
  tr: TTableRowElement;
  ul: TListElement;
  underline: TText & { underline: true };
  video: TVideoElement & TCaptionProps;
};
