/* eslint-disable perfectionist/sort-object-types */

export type * as unistLib from 'unist';

import type { StrictExtract } from 'ts-essentials';

import {
  type NodeKey,
  type Nullable,
  type SlateEditor,
  type TElement,
  type TNodeMap,
  type TText,
  getPluginKey,
} from 'platejs';

import type { DeserializeMdOptions } from './deserializer';
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
  MdRootContent,
  MdStrong,
  MdTable,
  MdTableCell,
  MdTableRow,
  MdText,
  MdThematicBreak,
  MdYaml,
} from './mdast';
import type { SerializeMdOptions } from './serializer';

import 'mdast-util-mdx';

export type MdRules = Partial<{
  [K in keyof PlateNodeMap]: Nullable<MdNodeParser<K>>;
}> &
  Record<string, Nullable<AnyNodeParser>>;

export type MdNodeParser<K extends keyof PlateNodeMap> = {
  mark?: boolean;
  deserialize?: (
    mdastNode: MdNodeMap[K],
    deco: MdDecoration,
    options: DeserializeMdOptions
  ) => PlateNodeMap[K];
  serialize?: (
    slateNode: PlateNodeMap[K],
    options: SerializeMdOptions
  ) => MdNodeMap[K];
};

type AnyNodeParser = {
  mark?: boolean;
  deserialize?: (
    mdastNode: any,
    deco: MdDecoration,
    options: DeserializeMdOptions
  ) => any;
  serialize?: (slateNode: any, options: SerializeMdOptions) => any;
};

type StrictMdType = MdGFM | MdRootContent['type'] | MdStyle;

export type MdType = (string & {}) | StrictMdType;

type MdGFM = 'del' | 'mark' | 'sub' | 'sup' | 'u';

type MdStyle =
  | 'backgroundColor'
  | 'color'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight';

export type MdMark = MdDelete | MdEmphasis | MdInlineCode | MdStrong | MdText;

export type MdDecoration = Readonly<
  Partial<
    Record<
      | (string & {})
      | (MdDelete | MdEmphasis | MdInlineCode | MdStrong)['type']
      | MdStyle
      | 'underline',
      boolean | string
    >
  >
>;

export type StrictPlateType =
  | StrictExtract<
      NodeKey,
      | 'a'
      | 'blockquote'
      | 'bold'
      | 'callout'
      | 'code'
      | 'code_block'
      | 'code_line'
      | 'column'
      | 'column_group'
      | 'comment'
      | 'date'
      | 'equation'
      | 'hr'
      | 'img'
      | 'inline_equation'
      | 'italic'
      | 'li'
      | 'mention'
      | 'p'
      | 'strikethrough'
      | 'subscript'
      | 'suggestion'
      | 'superscript'
      | 'table'
      | 'td'
      | 'th'
      | 'toc'
      | 'toggle'
      | 'tr'
      | 'underline'
    >
  | 'heading'
  | 'list'
  | 'text';

export type PlateType = (string & {}) | StrictPlateType;

type PlateNodeMap = Pick<
  TNodeMap,
  | 'a'
  | 'audio'
  | 'blockquote'
  | 'bold'
  | 'callout'
  | 'code'
  | 'code_block'
  | 'column'
  | 'column_group'
  | 'comment'
  | 'date'
  | 'equation'
  | 'file'
  | 'hr'
  | 'img'
  | 'inline_equation'
  | 'italic'
  | 'mention'
  | 'p'
  | 'strikethrough'
  | 'subscript'
  | 'suggestion'
  | 'superscript'
  | 'table'
  | 'td'
  | 'th'
  | 'toc'
  | 'toggle'
  | 'tr'
  | 'underline'
  | 'video'
> & {
  /** Markdown only */
  text: TText;
  list: any;
  heading: TElement;
  footnoteReference: any;
  definition: any;
  footnoteDefinition: any;
  break: any;
  yaml: any;
  imageReference: any;
  linkReference: any;
  html: any;
};

type MdNodeMap = {
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

  /** Markdown only */
  footnoteReference: MdFootnoteReference;
  definition: MdDefinition;
  footnoteDefinition: MdFootnoteDefinition;
  break: MdBreak;
  yaml: MdYaml;
  imageReference: MdImageReference;
  linkReference: MdLinkReference;
  html: MdHtml;

  /** Plate only */
  column_group: any;
  column: any;
  toc: any;
  callout: any;
  toggle: any;
  mention: any;
  date: any;
  underline: any;
  comment: any;
  superscript: any;
  subscript: any;
  suggestion: any;
  file: any;
  video: any;
  audio: any;
};

const PLATE_TO_MDAST = {
  a: 'link',
  blockquote: 'blockquote',
  bold: 'strong',
  callout: 'callout',
  code: 'inlineCode',
  code_block: 'code',
  code_line: 'code_line',
  column: 'column',
  column_group: 'column_group',
  comment: 'comment',
  date: 'date',
  equation: 'math',
  heading: 'heading',
  hr: 'thematicBreak',
  img: 'image',
  inline_equation: 'inlineMath',
  italic: 'emphasis',
  li: 'listItem',
  list: 'list',
  mention: 'mention',
  p: 'paragraph',
  strikethrough: 'delete',
  subscript: 'sub',
  suggestion: 'suggestion',
  superscript: 'sup',
  table: 'table',
  td: 'tableCell',
  text: 'text',
  th: 'tableCell',
  toc: 'toc',
  toggle: 'toggle',
  tr: 'tableRow',
  underline: 'u',
} as const satisfies Record<StrictPlateType, MdType>;

const MDAST_TO_PLATE = {
  backgroundColor: 'backgroundColor',
  blockquote: 'blockquote',
  break: 'break',
  code: 'code_block',
  color: 'color',
  definition: 'definition',
  del: 'strikethrough',
  delete: 'strikethrough',
  emphasis: 'italic',
  fontFamily: 'fontFamily',
  fontSize: 'fontSize',
  fontWeight: 'fontWeight',
  footnoteDefinition: 'footnoteDefinition',
  footnoteReference: 'footnoteReference',
  heading: 'heading',
  html: 'html',
  image: 'img',
  imageReference: 'imageReference',
  inlineCode: 'code',
  inlineMath: 'inline_equation',
  link: 'a',
  linkReference: 'linkReference',
  list: 'list',
  listItem: 'li',
  mark: 'highlight',
  math: 'equation',
  mdxFlowExpression: 'mdxFlowExpression',
  mdxjsEsm: 'mdxjsEsm',
  mdxJsxFlowElement: 'mdxJsxFlowElement',
  mdxJsxTextElement: 'mdxJsxTextElement',
  mdxTextExpression: 'mdxTextExpression',
  paragraph: 'p',
  strong: 'bold',
  sub: 'subscript',
  sup: 'superscript',
  table: 'table',
  tableCell: 'td',
  tableRow: 'tr',
  text: 'text',
  thematicBreak: 'hr',
  u: 'underline',
  yaml: 'yaml',
} as const satisfies Record<StrictMdType, PlateType>;

/**
 * Get plate node type from mdast node type if the mdast is mdast only return
 * the mdast type itself.
 */
export const mdastToPlate = <T extends StrictMdType>(
  editor: SlateEditor,
  mdastType: T
) => {
  const plateKey = MDAST_TO_PLATE[mdastType];
  
  return getPluginKey(editor, plateKey) ?? plateKey ?? mdastType;
};

/**
 * Get mdast node type from plate element type if the plateType is plate only
 * return the plateType itself.
 */
export const plateToMdast = <T extends StrictPlateType>(plateType: T) => {
  return PLATE_TO_MDAST[plateType] ?? plateType;
};
