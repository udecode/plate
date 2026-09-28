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
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx';
import type { Node as UnistNode } from 'unist';

import type { Descendant, EditorJsonValue } from '../../facade';
import type { AnyBasePluginDefinition } from './PluginDefinition';
import type {
  MarkdownMappingDiagnosticInput,
  PluginFormatContext,
  PluginFormatModelView,
  PluginFormatRegistry,
} from './PluginFormatContext';
import type {
  PluginFormatNode,
  PluginFormatTextValue,
} from './pluginNodeTypes';

/** Standard MDAST node kinds a mapping can select with `node`. */
export type MarkdownNodeKinds = {
  blockquote: Blockquote;
  break: Break;
  code: Code;
  delete: Delete;
  emphasis: Emphasis;
  footnoteDefinition: FootnoteDefinition;
  footnoteReference: FootnoteReference;
  heading: Heading;
  html: Html;
  image: Image;
  inlineCode: InlineCode;
  inlineMath: InlineMath;
  link: Link;
  list: List;
  listItem: ListItem;
  math: MdMathNode;
  paragraph: Paragraph;
  strong: Strong;
  table: Table;
  tableCell: TableCell;
  tableRow: TableRow;
  text: MdText;
  thematicBreak: ThematicBreak;
};

export type MarkdownNodeKind = keyof MarkdownNodeKinds;

/**
 * A registered Plate tag (`<callout icon="💡">…</callout>`), in the established
 * MDAST shape for JSX-like elements.
 */
export type MarkdownTagNode = MdxJsxFlowElement | MdxJsxTextElement;

declare const markdownRefusal: unique symbol;

/**
 * Returned by `refuse()`: the node cannot be represented, so conversion reports
 * `markdown-unsupported-node` under `lossPolicy` instead of throwing.
 */
export type MarkdownRefusal = Readonly<{ [markdownRefusal]: string }>;

/** Tag attributes as written, and the ones that decode to schema properties. */
export type MarkdownTagAttributeView = Readonly<{
  attributes: Readonly<Record<string, string | true>>;
  properties: Readonly<Record<string, unknown>>;
}>;

export type MarkdownMarks = Readonly<
  Record<string, EditorJsonValue | undefined>
>;

export type MarkdownPluginRegistry = PluginFormatRegistry;

/** A childless inline wrapper. Markdown supplies the encoded text children. */
export type MarkdownMarkWrapper =
  | Readonly<{ type: 'delete' }>
  | Readonly<{ type: 'emphasis' }>
  | Readonly<{
      attributes?: readonly MdxJsxAttribute[];
      name: string;
      type: 'mdxJsxTextElement';
    }>
  | Readonly<{ type: 'strong' }>;

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
      marks?: MarkdownMarks
    ) => Descendant[];
    /** One paragraph's inline content, or `null` when it is not one paragraph. */
    caption: (children: readonly Descendant[]) => readonly Descendant[] | null;
    decode: (
      nodes: readonly RootContent[],
      marks?: MarkdownMarks
    ) => Descendant[];
    decodeNodes: (
      nodes: readonly RootContent[],
      marks?: MarkdownMarks
    ) => Descendant[];
    marks: MarkdownMarks;
    node: TNode;
    /** Attributes of `tag` (default: this node) decoded for the target type. */
    readTagAttributes: (tag?: MarkdownTagNode) => MarkdownTagAttributeView;
    refuse: (message: string) => MarkdownRefusal;
    serializeUnknown: (node: MdxJsxFlowElement) => string;
  }>;

export type MarkdownEncodeContext<
  TNode extends Descendant = Descendant,
  D extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = MarkdownContext<D> &
  Omit<PluginFormatModelView, 'node'> &
  Readonly<{
    encode: (nodes: readonly Descendant[]) => RootContent[];
    encodeBlocks: (nodes: readonly Descendant[]) => BlockContent[];
    encodeFlow: (
      nodes: readonly Descendant[]
    ) => Array<BlockContent | DefinitionContent>;
    encodePhrasing: (nodes: readonly Descendant[]) => PhrasingContent[];
    isFlow: (node: RootContent) => node is BlockContent | DefinitionContent;
    isPhrasing: (node: RootContent) => node is PhrasingContent;
    /** Encode property values as tag attributes for this node's type. */
    encodeAttributes: (
      properties: Readonly<Record<string, unknown>>
    ) => MdxJsxAttribute[];
    node: TNode;
    preserveEmptyParagraphs?: boolean;
    readPlainInline: (children: readonly Descendant[]) => string | null;
    refuse: (message: string) => MarkdownRefusal;
    resourceLink: boolean;
  }>;

export type MarkdownMarkWrapContext<
  D extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = MarkdownEncodeContext<PluginFormatNode<D>, D> &
  Readonly<{ value: PluginFormatTextValue<D> }>;

type MarkdownElementMappingBase<
  D extends AnyBasePluginDefinition,
  TSource extends UnistNode,
> = Readonly<{
  /**
   * Claim the node by returning Plate content, decline with `undefined`
   * so the next mapping on the selector runs, or `refuse(message)`.
   */
  decode?: (
    context: MarkdownDecodeContext<TSource, D>
  ) => Descendant | Descendant[] | MarkdownRefusal | undefined;
  encode?: (
    context: MarkdownEncodeContext<PluginFormatNode<D>, D>
  ) => RootContent | MarkdownRefusal | undefined;
  mark?: false;
  /** Higher runs first among claim mappings on one selector. */
  priority?: number;
  wrap?: never;
}>;

type MarkdownMarkMappingBase<
  D extends AnyBasePluginDefinition,
  TSource extends UnistNode,
> = Readonly<{
  /** Return the schema property value contributed by this mark. */
  decode?: (
    context: MarkdownDecodeContext<TSource, D>
  ) => PluginFormatTextValue<D> | undefined;
  encode?: never;
  mark: true;
  priority?: never;
  /** Return the inline wrapper; Markdown supplies its encoded children. */
  wrap?: (
    context: MarkdownMarkWrapContext<D>
  ) => MarkdownMarkWrapper | MarkdownRefusal | undefined;
}>;

type EncodeOnlyMarkdownNodeMapping<D extends AnyBasePluginDefinition> =
  | (MarkdownElementMappingBase<D, never> &
      Readonly<{
        decode?: never;
        nestedTags?: never;
        node?: never;
        tag?: never;
      }>)
  | (MarkdownMarkMappingBase<D, never> &
      Readonly<{
        decode?: never;
        nestedTags?: never;
        node?: never;
        tag?: never;
      }>);

type NodeMarkdownNodeMapping<D extends AnyBasePluginDefinition> = {
  [TKind in MarkdownNodeKind]:
    | (MarkdownElementMappingBase<D, MarkdownNodeKinds[TKind]> &
        Readonly<{ nestedTags?: never; node: TKind; tag?: never }>)
    | (MarkdownMarkMappingBase<D, MarkdownNodeKinds[TKind]> &
        Readonly<{ nestedTags?: never; node: TKind; tag?: never }>);
}[MarkdownNodeKind];

type TagMarkdownNodeMapping<D extends AnyBasePluginDefinition> =
  | (MarkdownElementMappingBase<D, MarkdownTagNode> &
      Readonly<{
        /** Tags read only inside this one, such as Image's `figcaption`. */
        nestedTags?: readonly string[];
        node?: never;
        /** Registered tag name; for elements, the schema type. */
        tag: string;
      }>)
  | (MarkdownMarkMappingBase<D, MarkdownTagNode> &
      Readonly<{
        nestedTags?: readonly string[];
        node?: never;
        tag: string;
      }>);

/** Schema-bound Markdown conversion owned by one feature plugin. */
export type MarkdownNodeMapping<D extends AnyBasePluginDefinition> =
  | EncodeOnlyMarkdownNodeMapping<D>
  | NodeMarkdownNodeMapping<D>
  | TagMarkdownNodeMapping<D>;

export type MarkdownNodeMappingInput<D extends AnyBasePluginDefinition> =
  | MarkdownNodeMapping<D>
  | readonly [MarkdownNodeMapping<D>, ...Array<MarkdownNodeMapping<D>>];
