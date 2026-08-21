import type {
  Descendant,
  Element,
  SchemaElementShapeFor,
  SchemaElementTypes,
} from '@platejs/plite';
import type { EditorSchemaSourceProvider } from '@platejs/plite/internal';
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

import type {
  AnyBasePluginDefinition,
  PluginAuthorSchemaView,
  PluginReference,
} from './PluginDefinition';
import type { ElementWith, TextWith } from './pluginNodeTypes';
import type {
  InferExactPluginSchemaContribution,
  InferPluginDocumentType,
  InferPluginWritablePropertyEntries,
} from './pluginSchemaModel.internal';

type Contribution<D extends AnyBasePluginDefinition> =
  InferExactPluginSchemaContribution<D>;

type ContributionSource<D extends AnyBasePluginDefinition> =
  EditorSchemaSourceProvider<Contribution<D>>;

type ContributionElementType<D extends AnyBasePluginDefinition> = Extract<
  InferPluginDocumentType<D>,
  SchemaElementTypes<ContributionSource<D>>
>;

type ElementNode<D extends AnyBasePluginDefinition> = [
  ContributionElementType<D>,
] extends [never]
  ? never
  : Extract<
      SchemaElementShapeFor<ContributionSource<D>, ContributionElementType<D>>,
      Element
    >;

type TextNode<D extends AnyBasePluginDefinition> = TextWith<D>;

type PropertyElementNode<D extends AnyBasePluginDefinition> = ElementWith<D>;

type PropertyEntries<
  D extends AnyBasePluginDefinition,
  TPlacement extends 'element' | 'text',
> = Extract<
  InferPluginWritablePropertyEntries<D>,
  Readonly<{ placement: TPlacement }>
>;

/** Plate node narrowed from the codec target's schema contribution. */
export type MarkdownPlateNode<D extends AnyBasePluginDefinition> = [
  ElementNode<D>,
] extends [never]
  ? [PropertyEntries<D, 'text'>] extends [never]
    ? [PropertyEntries<D, 'element'>] extends [never]
      ? Descendant
      : PropertyElementNode<D>
    : [PropertyEntries<D, 'element'>] extends [never]
      ? TextNode<D>
      : TextNode<D> | PropertyElementNode<D>
  : ElementNode<D>;

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
                                              | 'file'
                                              | 'mediaEmbed'
                                              | 'toc'
                                              | 'toggle'
                                              | 'video'
                                          ? MdxJsxFlowElement
                                          : TType extends
                                                | 'backgroundColor'
                                                | 'color'
                                                | 'comment'
                                                | 'date'
                                                | 'fontFamily'
                                                | 'fontSize'
                                                | 'fontWeight'
                                                | 'highlight'
                                                | 'kbd'
                                                | 'mention'
                                                | 'script'
                                                | 'suggestion'
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
  suggestion: MdxJsxTextElement;
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

export type MarkdownPluginRegistry = Readonly<{
  has: (plugin: PluginReference | string) => boolean;
  type: (plugin: PluginReference | string) => string | undefined;
}>;

type MarkdownContext = Readonly<{
  isBlock: (node: Descendant) => boolean;
  isInline: (node: Descendant) => boolean;
  registry: MarkdownPluginRegistry;
}>;

type MarkdownPluginSchemaContext<D extends AnyBasePluginDefinition> = [
  D,
] extends [never]
  ? Readonly<Record<never, never>>
  : PluginAuthorSchemaView<D>;

export type MarkdownDecodeContext<
  TNode extends UnistNode = UnistNode,
  D extends AnyBasePluginDefinition = never,
> = MarkdownContext &
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
      attributes: readonly (MdxJsxAttribute | MdxJsxExpressionAttribute)[]
    ) => Record<string, unknown>;
    serializeUnknown: (node: MdxJsxFlowElement) => string;
    schema: MarkdownPluginSchemaContext<D>;
    splitLineBreaks?: boolean;
  }>;

export type MarkdownEncodeContext<
  TNode extends Descendant = Descendant,
  D extends AnyBasePluginDefinition = never,
> = MarkdownContext &
  Readonly<{
    encode: (
      nodes: readonly Descendant[],
      options?: Readonly<{ isBlock?: boolean }>
    ) => RootContent[];
    encodeBlocks: (nodes: readonly Descendant[]) => BlockContent[];
    encodeFlow: (
      nodes: readonly Descendant[]
    ) => (BlockContent | DefinitionContent)[];
    encodePhrasing: (nodes: readonly Descendant[]) => PhrasingContent[];
    isFlow: (node: RootContent) => node is BlockContent | DefinitionContent;
    isPhrasing: (node: RootContent) => node is PhrasingContent;
    node: TNode;
    preserveEmptyParagraphs?: boolean;
    propsToAttributes: (props: Record<string, unknown>) => MdxJsxAttribute[];
    readPlainInline: (children: readonly Descendant[]) => string | null;
    resourceLink: boolean;
    schema: MarkdownPluginSchemaContext<D>;
  }>;

type MarkdownNodeCodecBase<
  D extends AnyBasePluginDefinition,
  TSource extends UnistNode,
> = Readonly<{
  decode?: (
    context: MarkdownDecodeContext<TSource, D>
  ) => Descendant | Descendant[] | undefined;
  encode?: (
    context: MarkdownEncodeContext<MarkdownPlateNode<D>, D>
  ) => RootContent | undefined;
  kind: 'node';
  mark?: boolean;
  priority?: number;
}>;

type DefaultMarkdownNodeCodec<D extends AnyBasePluginDefinition> = Omit<
  MarkdownNodeCodecBase<D, DefaultMdastNode<InferPluginDocumentType<D>>>,
  'decode'
> &
  Readonly<{ decode?: never; from?: never }>;

type ExplicitMarkdownNodeCodec<D extends AnyBasePluginDefinition> = {
  [TSource in keyof SourceNodeMap]: MarkdownNodeCodecBase<
    D,
    SourceNodeMap[TSource]
  > &
    Readonly<{ from: TSource }>;
}[keyof SourceNodeMap];

/** Schema-bound Markdown conversion owned by one feature plugin. */
export type MarkdownNodeCodec<D extends AnyBasePluginDefinition> =
  | DefaultMarkdownNodeCodec<D>
  | ExplicitMarkdownNodeCodec<D>;

export type MarkdownNodeCodecInput<D extends AnyBasePluginDefinition> =
  | MarkdownNodeCodec<D>
  | readonly [MarkdownNodeCodec<D>, ...MarkdownNodeCodec<D>[]];
