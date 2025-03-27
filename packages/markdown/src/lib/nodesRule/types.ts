import type { TElement, TText } from '@udecode/plate';

import type { Decoration, deserializeOptions } from '../deserializer';
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
import type * as mdast from '../mdast';
import type { SerializeMdOptions } from '../serializer';

/* eslint-disable perfectionist/sort-modules */

/* eslint-disable perfectionist/sort-object-types */
export type TNodes = Partial<{
  [K in keyof PlateNodeTypeMap]: TNodeParser<K>;
}> &
  Record<string, AnyNodeParser>;

export type AnyNodeParser = {
  deserialize?: (
    mdastNode: any,
    deco: Decoration,
    options: deserializeOptions
  ) => any;
  serialize?: (slateNode: any, options: SerializeMdOptions) => any;
};

export type TNodeParser<K extends keyof PlateNodeTypeMap> = {
  deserialize?: (
    mdastNode: MdastNodeTypeMap[K],
    deco: Decoration,
    options: deserializeOptions
  ) => PlateNodeTypeMap[K];
  serialize?: (
    slateNode: PlateNodeTypeMap[K],
    options: SerializeMdOptions
  ) => MdastNodeTypeMap[K];
};

type MdastNodeTypeMap = {
  /** Common Elements */
  a: mdast.Link;
  blockquote: mdast.Blockquote;
  code_block: mdast.Code;
  equation: mdast.Math;
  heading: mdast.Heading;
  hr: mdast.ThematicBreak;
  img: mdast.Paragraph;
  inline_equation: mdast.InlineMath;
  p: mdast.Paragraph;
  table: mdast.Table;
  td: mdast.TableCell;
  th: mdast.TableCell;
  tr: mdast.TableRow;

  /** Common Marks */
  bold: mdast.Strong;
  italic: mdast.Emphasis;
  code: mdast.InlineCode;
  text: mdast.Text;
  strikethrough: mdast.Delete;

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
  footnoteReference: mdast.FootnoteReference;
  definition: mdast.Definition;
  footnoteDefinition: mdast.FootnoteDefinition;
  break: mdast.Break;
  yaml: mdast.Yaml;
  imageReference: mdast.ImageReference;
  linkReference: mdast.LinkReference;
  html: mdast.Html;

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
