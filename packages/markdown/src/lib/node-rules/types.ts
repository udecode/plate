import type { Nullable, TElement, TText } from '@udecode/plate';

import type { Decoration, DeserializeMdOptions } from '../deserializer';
import type {
  TCalloutElement,
  TCodeBlockElement,
  TColumnElement,
  TColumnGroupElement,
  TDateElement,
  TEquationElement,
  TImageElement,
  TLinkElement,
  TMentionElement,
  TSuggestionText,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../internal/types';
import type {
  MdBlockquote,
  MdBreak,
  MdCode,
  MdDefinition,
  MdDelete,
  MdEmphasis,
  MdFootnoteDefinition,
  MdFootnoteReference,
  MdHeading,
  MdHtml,
  MdImage,
  MdImageReference,
  MdInlineCode,
  MdInlineMath,
  MdLink,
  MdLinkReference,
  MdList,
  MdMath,
  MdParagraph,
  MdStrong,
  MdTable,
  MdTableCell,
  MdTableRow,
  MdText,
  MdThematicBreak,
  MdYaml,
} from '../mdast';
import type { SerializeMdOptions } from '../serializer';

/* eslint-disable perfectionist/sort-modules */

/* eslint-disable perfectionist/sort-object-types */
export type TNodes = Partial<{
  [K in keyof PlateNodeTypeMap]: Nullable<TNodeParser<K>>;
}> &
  Record<string, Nullable<AnyNodeParser>>;

export type AnyNodeParser = {
  deserialize?: (
    mdastNode: any,
    deco: Decoration,
    options: DeserializeMdOptions
  ) => any;
  serialize?: (slateNode: any, options: SerializeMdOptions) => any;
};

export type TNodeParser<K extends keyof PlateNodeTypeMap> = {
  deserialize?: (
    mdastNode: MdastNodeTypeMap[K],
    deco: Decoration,
    options: DeserializeMdOptions
  ) => PlateNodeTypeMap[K];
  serialize?: (
    slateNode: PlateNodeTypeMap[K],
    options: SerializeMdOptions
  ) => MdastNodeTypeMap[K];
};

type MdastNodeTypeMap = {
  /** Common Elements */
  a: MdLink;
  blockquote: MdBlockquote;
  code_block: MdCode;
  equation: MdMath;
  heading: MdHeading;
  hr: MdThematicBreak;
  img: MdImage;
  inline_equation: MdInlineMath;
  p: MdParagraph;
  table: MdTable;
  td: MdTableCell;
  th: MdTableCell;
  tr: MdTableRow;
  list: MdList;

  /** Common Marks */
  bold: MdStrong;
  italic: MdEmphasis;
  code: MdInlineCode;
  text: MdText;
  strikethrough: MdDelete;

  /** Plate Only Elements */
  column_group: any;
  column: any;
  toc: any;
  callout: any;
  toggle: any;
  mention: any;
  date: any;

  /** Plate Only Marks */
  underline: any;
  comment: any;
  superscript: any;
  subscript: any;
  suggestion: any;

  /** Markdown only */
  footnoteReference: MdFootnoteReference;
  definition: MdDefinition;
  footnoteDefinition: MdFootnoteDefinition;
  break: MdBreak;
  yaml: MdYaml;
  imageReference: MdImageReference;
  linkReference: MdLinkReference;
  html: MdHtml;

  /** PlateOnly */
};

type PlateNodeTypeMap = {
  /** Common Elements */
  a: TLinkElement;
  blockquote: TElement;
  code_block: TCodeBlockElement;
  equation: TEquationElement;
  heading: TElement;
  hr: TElement;
  img: TImageElement;
  inline_equation: TEquationElement;
  p: TElement;
  table: TTableElement;
  td: TTableCellElement;
  th: TElement;
  tr: TTableRowElement;
  // TODO support standard list
  // list: TIndentListElement[] | TStandardListElement;
  list: any;

  /** CommonMarks */
  bold: TText & { bold: true };
  italic: TText & { italic: true };
  code: TText & { code: true };
  text: TText;
  strikethrough: TText & { strikethrough: true };

  /** Plate Only Elements */
  column: TColumnElement;
  column_group: TColumnGroupElement;
  toc: TElement;
  callout: TCalloutElement;
  toggle: TElement;
  mention: TMentionElement;
  date: TDateElement;

  /** Plate Only Marks */
  underline: TText & { underline: true };
  comment: TText & { comment: true };
  superscript: TText & { superscript: true };
  subscript: TText & { subscript: true };
  suggestion: TSuggestionText;

  /** Markdown only */
  footnoteReference: any;
  definition: any;
  footnoteDefinition: any;
  break: any;
  yaml: any;
  imageReference: any;
  linkReference: any;
  html: any;
  /** PlateOnly */
};
