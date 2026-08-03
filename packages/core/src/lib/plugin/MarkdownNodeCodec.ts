import type {
  AnyBasePluginDefinition,
  PluginReference,
  PluginSchemaIdentity,
} from './PluginDefinition';
import type {
  InferExactPluginSchemaContribution,
  InferPluginDocumentType,
} from './pluginSchemaModel.internal';
import type {
  Descendant,
  Element,
  PropertyValueOf,
  SchemaElementProperty,
  SchemaProperty,
  SchemaTextProperty,
  Text,
} from '@platejs/plite';
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

type Contribution<D extends AnyBasePluginDefinition> =
  InferExactPluginSchemaContribution<D>;

type ContributionElements<D extends AnyBasePluginDefinition> =
  Contribution<D> extends Readonly<{
    elements: infer TElements extends Readonly<Record<string, object>>;
  }>
    ? TElements
    : Readonly<Record<never, never>>;

type ContributionProperties<D extends AnyBasePluginDefinition> =
  Contribution<D> extends Readonly<{
    properties: readonly (infer TProperty extends SchemaProperty)[];
  }>
    ? TProperty
    : never;

type PropertyMap<TProperty> = Readonly<{
  [TMember in TProperty as TMember extends SchemaProperty
    ? TMember['key'] extends string
      ? TMember['key']
      : never
    : never]?: TMember extends SchemaProperty
    ? PropertyValueOf<TMember['value']>
    : never;
}>;

type ElementOwnProperties<TElement> =
  TElement extends Readonly<{
    properties?: infer TProperties extends Readonly<Record<string, object>>;
  }>
    ? Readonly<{
        [TKey in keyof TProperties]?: PropertyValueOf<TProperties[TKey]>;
      }>
    : Readonly<Record<never, never>>;

type ElementNode<D extends AnyBasePluginDefinition> =
  InferPluginDocumentType<D> extends keyof ContributionElements<D>
    ? Element &
        ElementOwnProperties<
          ContributionElements<D>[InferPluginDocumentType<D>]
        > &
        PropertyMap<Extract<ContributionProperties<D>, SchemaElementProperty>>
    : never;

type TextNode<D extends AnyBasePluginDefinition> = Text &
  PropertyMap<Extract<ContributionProperties<D>, SchemaTextProperty>>;

type PropertyElementNode<D extends AnyBasePluginDefinition> = Element &
  PropertyMap<Extract<ContributionProperties<D>, SchemaElementProperty>>;

/** Plate node narrowed from the codec target's schema contribution. */
export type MarkdownPlateNode<D extends AnyBasePluginDefinition> = [
  ElementNode<D>,
] extends [never]
  ? [Extract<ContributionProperties<D>, SchemaTextProperty>] extends [never]
    ? [Extract<ContributionProperties<D>, SchemaElementProperty>] extends [
        never,
      ]
      ? Descendant
      : PropertyElementNode<D>
    : [Extract<ContributionProperties<D>, SchemaElementProperty>] extends [
          never,
        ]
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
  column: MdxJsxFlowElement;
  column_group: MdxJsxFlowElement;
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
  key: (plugin: PluginReference | string) => string | undefined;
  type: (plugin: PluginReference | string) => string | undefined;
}>;

type MarkdownContext = Readonly<{
  isBlock: (node: Descendant) => boolean;
  isInline: (node: Descendant) => boolean;
  registry: MarkdownPluginRegistry;
}>;

export type MarkdownDecodeContext<
  TNode extends UnistNode = UnistNode,
  D extends AnyBasePluginDefinition = never,
> = MarkdownContext &
  PluginSchemaIdentity<D> &
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
    splitLineBreaks?: boolean;
  }>;

export type MarkdownEncodeContext<
  TNode extends Descendant = Descendant,
  D extends AnyBasePluginDefinition = never,
> = MarkdownContext &
  PluginSchemaIdentity<D> &
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
