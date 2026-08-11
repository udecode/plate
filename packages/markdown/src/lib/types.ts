export type * as unistLib from 'unist';

import type { Node as UnistNode } from 'unist';

import type {
  Descendant,
  EditorDocumentValue,
  Element,
  Text,
} from '@platejs/plite';
import type { ListElement } from '@platejs/list';
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
  deserialize?: (node: UnistNode & { type: MarkdownNodeName }) => boolean;
  /** Custom filter function for nodes during serialization. */
  serialize?: (node: Descendant) => boolean;
};

export type DeserializeMdOptions = {
  allowedNodes?: MarkdownNodeName[] | null;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: MarkdownNodeName[] | null;
  preserveEmptyParagraphs?: boolean;
  remarkPlugins?: Pluggable[];
  rules?: MdRules | null;
  splitLineBreaks?: boolean;
  withoutMdx?: boolean;
  onError?: (error: Error) => void;
};

export type SerializeMdOptions = {
  allowedNodes?: MarkdownNodeName[] | null;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: MarkdownNodeName[] | null;
  /** Marks to treat as plain text without applying markdown formatting. */
  plainMarks?: MarkdownNodeName[] | null;
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
  MarkdownConversionContext & {
    /** Read the configured persisted element ID through its schema owner. */
    blockId?: (element: Element) => string | undefined;
  };

export type MdRules = Partial<{
  [K in keyof PlateNodeMap & keyof MdNodeMap]: Nullable<MdNodeParser<K>>;
}> &
  Record<string, Nullable<AnyNodeParser>>;

export type MdNodeParser<
  K extends keyof PlateNodeMap & keyof MdNodeMap = keyof PlateNodeMap &
    keyof MdNodeMap,
> = {
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

export type StrictMarkdownNodeName =
  | 'audio'
  | 'blockquote'
  | 'bold'
  | 'break'
  | 'callout'
  | 'code'
  | 'codeBlock'
  | 'codeDrawing'
  | 'codeLine'
  | 'column'
  | 'columnGroup'
  | 'comment'
  | 'date'
  | 'equation'
  | 'file'
  | 'heading'
  | 'horizontalRule'
  | 'image'
  | 'inlineEquation'
  | 'italic'
  | 'link'
  | 'list'
  | 'listItem'
  | 'mediaEmbed'
  | 'mention'
  | 'paragraph'
  | 'script'
  | 'strikethrough'
  | 'suggestion'
  | 'table'
  | 'tableCell'
  | 'tableRow'
  | 'text'
  | 'toc'
  | 'toggle'
  | 'underline'
  | 'video';

export type MarkdownNodeName = (string & {}) | StrictMarkdownNodeName;

type PlateNodeMap = {
  [K in StrictMarkdownNodeName]: K extends
    | 'bold'
    | 'break'
    | 'code'
    | 'comment'
    | 'italic'
    | 'script'
    | 'strikethrough'
    | 'suggestion'
    | 'text'
    | 'underline'
    ? Text
    : Element;
} & {
  /** Markdown only */
  text: Text;
  list: Element | ListElement;
  heading: Element;
  footnoteReference: Element;
  definition: Descendant;
  footnoteDefinition: Element;
  break: Text;
  yaml: Descendant;
  imageReference: Descendant;
  linkReference: Descendant;
  html: Descendant;
  br: Text;
  del: Text;
  highlight: Text;
  kbd: Text;
  listItem: Element;
  span: Text;
};

type MdNodeMap = {
  /** Common Elements */
  link: MdLink;
  blockquote: MdBlockquote;
  codeBlock: MdCode;
  equation: MdMath;
  heading: MdHeading;
  horizontalRule: MdThematicBreak;
  image: MdImage &
    Pick<Partial<MdMdxJsxFlowElement>, 'attributes' | 'children'>;
  inlineEquation: MdInlineMath;
  paragraph: MdParagraph;
  table: MdTable;
  tableCell: MdTableCell;
  tableRow: MdTableRow;
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
  codeDrawing: MdMdxJsxFlowElement;
  columnGroup: MdMdxJsxFlowElement;
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
  mediaEmbed: MdMdxJsxFlowElement;
  video: MdMdxJsxFlowElement;
  audio: MdMdxJsxFlowElement;
};

const MDAST_TO_RULE = {
  backgroundColor: 'backgroundColor',
  blockquote: 'blockquote',
  break: 'break',
  code: 'codeBlock',
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
  image: 'image',
  imageReference: 'imageReference',
  inlineCode: 'code',
  inlineMath: 'inlineEquation',
  link: 'link',
  linkReference: 'linkReference',
  list: 'list',
  listItem: 'listItem',
  mark: 'highlight',
  math: 'equation',
  mention: 'mention',
  mdxFlowExpression: 'mdxFlowExpression',
  mdxjsEsm: 'mdxjsEsm',
  mdxJsxFlowElement: 'mdxJsxFlowElement',
  mdxJsxTextElement: 'mdxJsxTextElement',
  mdxTextExpression: 'mdxTextExpression',
  paragraph: 'paragraph',
  strong: 'bold',
  sub: 'script',
  sup: 'script',
  table: 'table',
  tableCell: 'tableCell',
  tableRow: 'tableRow',
  text: 'text',
  thematicBreak: 'horizontalRule',
  u: 'underline',
  yaml: 'yaml',
} as const satisfies Record<StrictMdType, MarkdownNodeName>;
const MDAST_TO_RULE_MAP = new Map<string, MarkdownNodeName>(
  Object.entries(MDAST_TO_RULE)
);

/** Map an mdast node type to its canonical Markdown rule key. */
export const mdastToRule = (mdastType: string) =>
  MDAST_TO_RULE_MAP.get(mdastType) ?? mdastType;
