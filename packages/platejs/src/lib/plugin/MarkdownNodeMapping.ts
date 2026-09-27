import type {
  BlockContent,
  Blockquote,
  Break,
  Code,
  Delete,
  DefinitionContent,
  Emphasis,
  FootnoteDefinition,
  FootnoteReference,
  Heading,
  Html,
  Image,
  InlineCode,
  Link,
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
  RootContent,
  Strong,
  Table,
  TableCell,
  TableRow,
  Text as MdText,
  ThematicBreak,
} from 'mdast';
import type { InlineMath, Math as MdMathNode } from 'mdast-util-math';
import type {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx';
import type { Node as UnistNode } from 'unist';

import type { Descendant } from '../../facade';
import type { AnyBasePluginDefinition } from './PluginDefinition';
import type {
  MarkdownMappingDiagnosticInput,
  PluginFormatContext,
  PluginFormatModelView,
  PluginFormatRegistry,
} from './PluginFormatContext';
import type { PluginFormatNode } from './pluginNodeTypes';
import type { InferPluginDocumentType } from './pluginSchemaModel.internal';

type DefaultMdastNode<TType extends string> = TType extends 'link'
  ? Link
  : TType extends `h${1 | 2 | 3 | 4 | 5 | 6}`
    ? Heading
    : TType extends 'blockquote'
      ? Blockquote
      : TType extends 'bold'
        ? Strong
        : TType extends 'code'
          ? InlineCode
          : TType extends 'codeBlock'
            ? Code
            : TType extends 'equation'
              ? MdMathNode
              : TType extends 'footnoteDefinition'
                ? FootnoteDefinition
                : TType extends 'footnoteReference'
                  ? FootnoteReference
                  : TType extends 'horizontalRule'
                    ? ThematicBreak
                    : TType extends 'image'
                      ? Image
                      : TType extends 'inlineEquation'
                        ? InlineMath
                        : TType extends 'italic'
                          ? Emphasis
                          : TType extends 'list'
                            ? List
                            : TType extends 'listItem'
                              ? ListItem
                              : TType extends 'paragraph'
                                ? Paragraph
                                : TType extends 'strikethrough'
                                  ? Delete
                                  : TType extends 'table'
                                    ? Table
                                    : TType extends 'tableCell'
                                      ? TableCell
                                      : TType extends 'tableRow'
                                        ? TableRow
                                        : TType extends
                                              | 'audio'
                                              | 'callout'
                                              | 'codeDrawing'
                                              | 'column'
                                              | 'columnGroup'
                                              | 'details'
                                              | 'file'
                                              | 'mediaEmbed'
                                              | 'summary'
                                              | 'toc'
                                              | 'video'
                                          ? MdxJsxFlowElement
                                          : TType extends
                                                | 'backgroundColor'
                                                | 'color'
                                                | 'date'
                                                | 'fontFamily'
                                                | 'fontSize'
                                                | 'fontWeight'
                                                | 'highlight'
                                                | 'kbd'
                                                | 'mention'
                                                | 'script'
                                                | 'underline'
                                            ? MdxJsxTextElement
                                            : RootContent | UnistNode;

type SourceNodeMap = {
  audio: MdxJsxFlowElement;
  blockquote: Blockquote;
  break: Break;
  callout: MdxJsxFlowElement;
  code: Code;
  codeDrawing: MdxJsxFlowElement;
  column: MdxJsxFlowElement;
  columnGroup: MdxJsxFlowElement;
  comment: MdxJsxTextElement;
  date: MdxJsxTextElement;
  details: MdxJsxFlowElement;
  del: MdxJsxTextElement;
  delete: Delete;
  emphasis: Emphasis;
  figure: MdxJsxFlowElement;
  file: MdxJsxFlowElement;
  footnoteDefinition: FootnoteDefinition;
  footnoteReference: FootnoteReference;
  heading: Heading;
  html: Html;
  image: Image;
  img: MdxJsxFlowElement;
  inlineCode: InlineCode;
  inlineMath: InlineMath;
  kbd: MdxJsxTextElement;
  link: Link;
  list: List;
  listItem: ListItem;
  mark: MdxJsxTextElement;
  math: MdMathNode;
  mediaEmbed: MdxJsxFlowElement;
  media_embed: MdxJsxFlowElement;
  mention: UnistNode & {
    displayText?: string;
    type: 'mention';
    username: string;
  };
  mdxJsxFlowElement: MdxJsxFlowElement;
  mdxJsxTextElement: MdxJsxTextElement;
  paragraph: Paragraph;
  script: MdxJsxTextElement;
  span: MdxJsxTextElement;
  strong: Strong;
  sub: MdxJsxTextElement;
  summary: MdxJsxFlowElement;
  sup: MdxJsxTextElement;
  table: Table;
  tableCell: TableCell;
  tableRow: TableRow;
  text: MdText;
  thematicBreak: ThematicBreak;
  toc: MdxJsxFlowElement;
  u: MdxJsxTextElement;
  underline: MdxJsxTextElement;
  video: MdxJsxFlowElement;
};

export type MarkdownDecoration = Readonly<
  Record<string, boolean | string | undefined>
>;

export type MarkdownPluginRegistry = PluginFormatRegistry;

type MarkdownContext<D extends AnyBasePluginDefinition> =
  PluginFormatContext<D> &
    Readonly<{
      isBlock: (node: Descendant) => boolean;
      isInline: (node: Descendant) => boolean;
      report: (diagnostic: MarkdownMappingDiagnosticInput) => void;
    }>;

export type MarkdownDecodeContext<
  TNode extends UnistNode = UnistNode,
  D extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = MarkdownContext<D> &
  Readonly<{
    build: (
      node: RootContent | UnistNode,
      decoration?: MarkdownDecoration
    ) => Descendant[];
    caption: (children: readonly Descendant[]) => readonly Descendant[];
    decode: (
      nodes: readonly RootContent[],
      decoration?: MarkdownDecoration
    ) => Descendant[];
    decodeNodes: (
      nodes: readonly RootContent[],
      decoration?: MarkdownDecoration
    ) => Descendant[];
    decodeTexts: (
      node: Delete | Emphasis | Strong,
      decoration?: MarkdownDecoration
    ) => Descendant[];
    decoration: MarkdownDecoration;
    node: TNode;
    parseAttributes: (
      attributes: ReadonlyArray<MdxJsxAttribute | MdxJsxExpressionAttribute>
    ) => Record<string, unknown>;
    serializeUnknown: (node: MdxJsxFlowElement) => string;
    splitLineBreaks?: boolean;
  }>;

export type MarkdownEncodeContext<
  TNode extends Descendant = Descendant,
  D extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = MarkdownContext<D> &
  Omit<PluginFormatModelView, 'node'> &
  Readonly<{
    encode: (
      nodes: readonly Descendant[],
      options?: Readonly<{ isBlock?: boolean }>
    ) => RootContent[];
    encodeBlocks: (nodes: readonly Descendant[]) => BlockContent[];
    encodeFlow: (
      nodes: readonly Descendant[]
    ) => Array<BlockContent | DefinitionContent>;
    encodePhrasing: (nodes: readonly Descendant[]) => PhrasingContent[];
    isFlow: (node: RootContent) => node is BlockContent | DefinitionContent;
    isPhrasing: (node: RootContent) => node is PhrasingContent;
    node: TNode;
    preserveEmptyParagraphs?: boolean;
    propsToAttributes: (props: Record<string, unknown>) => MdxJsxAttribute[];
    readPlainInline: (children: readonly Descendant[]) => string | null;
    resourceLink: boolean;
  }>;

type MarkdownNodeMappingBase<
  D extends AnyBasePluginDefinition,
  TSource extends UnistNode,
> = Readonly<{
  decode?: (
    context: MarkdownDecodeContext<TSource, D>
  ) => Descendant | Descendant[] | undefined;
  encode?: (
    context: MarkdownEncodeContext<PluginFormatNode<D>, D>
  ) => RootContent | undefined;
  kind: 'node';
  mark?: boolean;
  priority?: number;
}>;

type DefaultMarkdownNodeMapping<D extends AnyBasePluginDefinition> = Omit<
  MarkdownNodeMappingBase<D, DefaultMdastNode<InferPluginDocumentType<D>>>,
  'decode'
> &
  Readonly<{ decode?: never; from?: never }>;

type ExplicitMarkdownNodeMapping<D extends AnyBasePluginDefinition> = {
  [TSource in keyof SourceNodeMap]: MarkdownNodeMappingBase<
    D,
    SourceNodeMap[TSource]
  > &
    Readonly<{ from: TSource }>;
}[keyof SourceNodeMap];

/** Schema-bound Markdown conversion owned by one feature plugin. */
export type MarkdownNodeMapping<D extends AnyBasePluginDefinition> =
  | DefaultMarkdownNodeMapping<D>
  | ExplicitMarkdownNodeMapping<D>;

export type MarkdownNodeMappingInput<D extends AnyBasePluginDefinition> =
  | MarkdownNodeMapping<D>
  | readonly [MarkdownNodeMapping<D>, ...Array<MarkdownNodeMapping<D>>];
