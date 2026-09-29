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
  PluginFormatIsMark,
  PluginFormatNode,
  PluginFormatOwnedPropertyKey,
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
    /** The node before this one among its Markdown siblings. */
    previousSibling: RootContent | null;
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
    /**
     * Encode property values as tag attributes for this node's type, under
     * the mapping's `attributes` names. A property counts as represented when
     * the returned output keeps its attribute.
     */
    encodeAttributes: (
      properties: Readonly<Record<string, unknown>>
    ) => MdxJsxAttribute[];
    /**
     * Encode `node` as a mapping without `encode` writes its tag: this
     * plugin's properties under their `attributes` names, then other plugins'
     * non-metadata properties by key, except those the enclosing Markdown
     * structure writes (list topology). Claims the properties it writes, so
     * return the attributes in your output.
     */
    encodeNodeAttributes: () => MdxJsxAttribute[];
    node: TNode;
    /**
     * Claim that the returned output represents these properties of `node`.
     * Unclaimed content properties are reported as omitted. Claims count only
     * when the encoder returns output.
     */
    preserve: (...keys: ReadonlyArray<PluginFormatOwnedPropertyKey<D>>) => void;
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
  /** Higher runs first among claim mappings on one selector. */
  priority?: number;
  style?: never;
  value?: never;
  wrap?: never;
}>;

type MarkdownMarkMappingBase<
  D extends AnyBasePluginDefinition,
  TSource extends UnistNode,
> = Readonly<{
  attributes?: never;
  /** Return the mark value; without `decode`, the tag or node stands for `value`. */
  decode?: (
    context: MarkdownDecodeContext<TSource, D>
  ) => PluginFormatTextValue<D> | undefined;
  encode?: never;
  priority?: never;
  /** The mark value this tag or node stands for; defaults to `true`. */
  value?: PluginFormatTextValue<D>;
  /** Write the inline wrapper yourself; Markdown supplies its encoded children. */
  wrap?: (
    context: MarkdownMarkWrapContext<D>
  ) => MarkdownMarkWrapper | MarkdownRefusal | undefined;
}>;

/**
 * Element or mark fields, selected by the target's schema contribution: a
 * plugin that contributes a text property maps a mark.
 */
type MarkdownMappingBase<
  D extends AnyBasePluginDefinition,
  TSource extends UnistNode,
> =
  PluginFormatIsMark<D> extends true
    ? MarkdownMarkMappingBase<D, TSource> & Readonly<{ style?: never }>
    : PluginFormatIsMark<D> extends false
      ? MarkdownElementMappingBase<D, TSource> &
          Readonly<{ attributes?: never }>
      :
          | (MarkdownElementMappingBase<D, TSource> &
              Readonly<{ attributes?: never }>)
          | (MarkdownMarkMappingBase<D, TSource> & Readonly<{ style?: never }>);

type MarkdownTagMappingBase<D extends AnyBasePluginDefinition> =
  PluginFormatIsMark<D> extends true
    ? MarkdownMarkMappingBase<D, MarkdownTagNode> &
        Readonly<{
          /** CSS property that carries the mark value, such as `color`. */
          style?: string;
        }>
    : PluginFormatIsMark<D> extends false
      ? MarkdownElementMappingBase<D, MarkdownTagNode> &
          Readonly<{
            /**
             * Attribute names for this plugin's own properties when they
             * differ from the property key, such as `{ url: 'src' }`.
             */
            attributes?: Readonly<
              Partial<Record<PluginFormatOwnedPropertyKey<D>, string>>
            >;
          }>
      :
          | (MarkdownElementMappingBase<D, MarkdownTagNode> &
              Readonly<{
                attributes?: Readonly<
                  Partial<Record<PluginFormatOwnedPropertyKey<D>, string>>
                >;
              }>)
          | (MarkdownMarkMappingBase<D, MarkdownTagNode> &
              Readonly<{ style?: string }>);

type EncodeOnlyMarkdownNodeMapping<D extends AnyBasePluginDefinition> =
  MarkdownMappingBase<D, never> &
    Readonly<{
      decode?: never;
      nestedTags?: never;
      node?: never;
      tag?: never;
    }>;

type NodeMarkdownNodeMapping<D extends AnyBasePluginDefinition> = {
  [TKind in MarkdownNodeKind]: MarkdownMappingBase<
    D,
    MarkdownNodeKinds[TKind]
  > &
    Readonly<{ nestedTags?: never; node: TKind; tag?: never }>;
}[MarkdownNodeKind];

type TagMarkdownNodeMapping<D extends AnyBasePluginDefinition> =
  MarkdownTagMappingBase<D> &
    Readonly<{
      /** Tags read only inside this one, such as Image's `figcaption`. */
      nestedTags?: readonly string[];
      node?: never;
      /** Registered tag name; for elements, usually the schema type. */
      tag: string;
    }>;

/**
 * Schema-bound Markdown conversion owned by one feature plugin. A `tag`
 * mapping without `decode` and `encode` is derived from the schema: the
 * runtime builds the node, converts the plugin's own properties as attributes
 * and traverses children by the content model. Marks derive the same way from
 * `tag`, `node`, `value` and `style`.
 */
export type MarkdownNodeMapping<D extends AnyBasePluginDefinition> =
  | EncodeOnlyMarkdownNodeMapping<D>
  | NodeMarkdownNodeMapping<D>
  | TagMarkdownNodeMapping<D>;

export type MarkdownNodeMappingInput<D extends AnyBasePluginDefinition> =
  | MarkdownNodeMapping<D>
  | readonly [MarkdownNodeMapping<D>, ...Array<MarkdownNodeMapping<D>>];
