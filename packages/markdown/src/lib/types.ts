export type * as unistLib from 'unist';

import type { StrictExtract } from 'ts-essentials';
import type { Node as UnistNode } from 'unist';

import type {
  Descendant,
  EditorDocumentValue,
  Element,
  Text,
} from '@platejs/plite';
import type { NodeKey, NodeMap, TListElement } from '@platejs/utils';
import type { Nullable } from '@udecode/utils';
import type { Options as RemarkStringifyOptions } from 'remark-stringify';
import type { Pluggable } from 'unified';
import type { MarkdownPluginRegistry } from '@platejs/core';

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
  MdMdxJsxFlowElement,
  MdMdxJsxTextElement,
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
import type { MentionNode } from './plugins/remarkMention';

import 'mdast-util-mdx';

export type AllowNodeConfig = {
  /** Custom filter function for nodes during deserialization. */
  deserialize?: (node: UnistNode & { type: PlateType }) => boolean;
  /** Custom filter function for nodes during serialization. */
  serialize?: (node: Descendant) => boolean;
};

export type DeserializeMdOptions = {
  allowedNodes?: PlateType[] | null;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: PlateType[] | null;
  preserveEmptyParagraphs?: boolean;
  remarkPlugins?: Pluggable[];
  rules?: MdRules | null;
  splitLineBreaks?: boolean;
  withoutMdx?: boolean;
  onError?: (error: Error) => void;
};

export type SerializeMdOptions = {
  allowedNodes?: PlateType[] | null;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: PlateType[] | null;
  /** Marks to treat as plain text without applying markdown formatting. */
  plainMarks?: PlateType[] | null;
  preserveEmptyParagraphs?: boolean;
  remarkPlugins?: Pluggable[];
  remarkStringifyOptions?: Readonly<RemarkStringifyOptions> | null;
  rules?: MdRules;
  spread?: boolean;
  value?: EditorDocumentValue;
  withBlockId?: boolean;
};

export type MarkdownConversionContext = Readonly<{
  isBlock: (node: Descendant) => boolean;
  isInline: (node: Descendant) => boolean;
  registry: MarkdownPluginRegistry;
}>;

/** Prepared Markdown deserialization context supplied to conversion rules. */
export type DeserializeMdContext = Readonly<DeserializeMdOptions> &
  MarkdownConversionContext & {
    /** @internal Compiled feature-owned Markdown node codecs. */
    compiledCodecs?: import('./internal/markdownCodecs').CompiledMarkdownCodecs;
    /** @internal Operation or configured rules that override compiled codecs. */
    ruleOverrides?: MdRules;
  };

/** Prepared Markdown serialization context supplied to conversion rules. */
export type SerializeMdContext = Readonly<
  Omit<SerializeMdOptions, 'value'> & { value: readonly Descendant[] }
> &
  MarkdownConversionContext;

export type MdRules = Partial<{
  [K in keyof PlateNodeMap]: Nullable<MdNodeParser<K>>;
}> &
  Record<string, Nullable<AnyNodeParser>>;

export type MdNodeParser<K extends keyof PlateNodeMap = keyof PlateNodeMap> = {
  mark?: boolean;
  deserialize?(
    mdastNode: MdNodeMap[K],
    deco: MdDecoration,
    options: DeserializeMdContext
  ): Descendant | Descendant[] | undefined;
  serialize?(
    slateNode: PlateNodeMap[K],
    options: SerializeMdContext
  ): MdRootContent;
};

type BivariantCallback<TArgs extends readonly unknown[], TResult> = {
  bivarianceHack(...args: TArgs): TResult;
}['bivarianceHack'];

type AnyNodeParser = {
  mark?: boolean;
  deserialize?: BivariantCallback<
    [UnistNode, MdDecoration, DeserializeMdContext],
    Descendant | Descendant[] | undefined
  >;
  serialize?: BivariantCallback<
    [Descendant, SerializeMdContext],
    MdRootContent
  >;
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

export type MdMark =
  | MdDelete
  | MdEmphasis
  | MdInlineCode
  | MdMdxJsxTextElement
  | MdStrong
  | MdText;

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
      | 'script'
      | 'strikethrough'
      | 'suggestion'
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
  NodeMap,
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
  | 'script'
  | 'strikethrough'
  | 'suggestion'
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
  text: Text;
  list: Element | TListElement;
  heading: Element;
  footnoteReference: Element & { identifier?: string };
  definition: Descendant;
  footnoteDefinition: Element & { identifier: string };
  break: Text;
  yaml: Descendant;
  imageReference: Descendant;
  linkReference: Descendant;
  html: Descendant;
  br: Text;
  del: Text;
  highlight: NodeMap['highlight'];
  kbd: NodeMap['kbd'];
  listItem: Element;
  span: Text;
};

type MdNodeMap = {
  /** Common Elements */
  a: MdLink;
  blockquote: MdBlockquote;
  code_block: MdCode;
  equation: MdMath;
  heading: MdHeading;
  hr: MdThematicBreak;
  img: MdImage & Pick<Partial<MdMdxJsxFlowElement>, 'attributes' | 'children'>;
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
  br: MdBreak;
  del: MdMdxJsxTextElement;
  highlight: MdMdxJsxTextElement;
  kbd: MdMdxJsxTextElement;
  listItem: import('./mdast').MdListItem;
  span: MdMdxJsxTextElement;

  /** Plate only */
  column_group: MdMdxJsxFlowElement;
  column: MdMdxJsxFlowElement;
  toc: MdMdxJsxFlowElement;
  callout: MdMdxJsxFlowElement;
  toggle: MdMdxJsxFlowElement;
  mention: MentionNode;
  date: MdMdxJsxTextElement;
  underline: MdMdxJsxTextElement;
  comment: MdMdxJsxTextElement;
  script: MdMdxJsxTextElement;
  suggestion: MdMdxJsxTextElement;
  file: MdMdxJsxFlowElement;
  video: MdMdxJsxFlowElement;
  audio: MdMdxJsxFlowElement;
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
  script: 'script',
  strikethrough: 'delete',
  suggestion: 'suggestion',
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
  mention: 'mention',
  mdxFlowExpression: 'mdxFlowExpression',
  mdxjsEsm: 'mdxjsEsm',
  mdxJsxFlowElement: 'mdxJsxFlowElement',
  mdxJsxTextElement: 'mdxJsxTextElement',
  mdxTextExpression: 'mdxTextExpression',
  paragraph: 'p',
  strong: 'bold',
  sub: 'script',
  sup: 'script',
  table: 'table',
  tableCell: 'td',
  tableRow: 'tr',
  text: 'text',
  thematicBreak: 'hr',
  u: 'underline',
  yaml: 'yaml',
} as const satisfies Record<StrictMdType, PlateType>;
const MDAST_TO_PLATE_MAP = new Map<string, PlateType>(
  Object.entries(MDAST_TO_PLATE)
);

/** Map an mdast node type to its canonical Markdown rule key. */
export const mdastToPlate = (mdastType: string) =>
  MDAST_TO_PLATE_MAP.get(mdastType) ?? mdastType;

/**
 * Get mdast node type from plate element type if the plateType is plate only
 * return the plateType itself.
 */
export const plateToMdast = <T extends StrictPlateType>(plateType: T) =>
  PLATE_TO_MDAST[plateType] ?? plateType;
