import type { Root as MdRoot } from 'mdast';
import type { Options as RemarkStringifyOptions } from 'remark-stringify';
import type { Pluggable, Processor, Transformer } from 'unified';
import type { Node as UnistNode } from 'unist';

import type {
  ContentSlice,
  MarkdownPluginRegistry,
  Descendant,
  EditorApplicationSchema,
  EditorCoreStateView,
  EditorDocumentValue,
  EditorValueFromPlugins,
  EditorSchemaValidationDiagnostic,
  Element,
  Nullable,
  RootKey,
  Text,
  Value,
} from '../../core';
import type {
  NativeAuthoredProjectionDiagnostic,
  RuntimePluginReference,
} from '../../facade';
import type { ListElement } from '../../features/list';
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

export type * as unistLib from 'unist';

export type MarkdownParseLimits = Readonly<{
  maxBytes: number;
  maxDepth: number;
  maxNodes: number;
}>;

export type MarkdownSourceLocation = Readonly<{
  end?: Readonly<{ column: number; line: number; offset?: number }>;
  excerpt?: string;
  nodeType?: string;
  start?: Readonly<{ column: number; line: number; offset?: number }>;
}>;

export type MarkdownModelLocation = Readonly<{
  path?: readonly number[];
  property?: string;
  root?: RootKey;
}>;

type MarkdownDiagnosticContext = Readonly<{
  model?: MarkdownModelLocation;
  source?: MarkdownSourceLocation;
}>;

type PolicyDiagnostic<T extends object> =
  | Readonly<T & { severity: 'error' }>
  | Readonly<T & { severity: 'warning' }>;

type EditorSchemaRepairCode =
  | 'canonicalize-set-property'
  | 'create-root'
  | 'default-property'
  | 'drop-unplaceable-text'
  | 'flatten-block-content'
  | 'generate-property'
  | 'insert-empty-text'
  | 'insert-inline-spacer'
  | 'insert-required-content'
  | 'merge-text'
  | 'omit-default-property'
  | 'remove-empty-text'
  | 'remove-noncanonical-child'
  | 'replace-element-shell'
  | 'resolve-exclusive-property'
  | 'wrap-content';

export type MarkdownDiagnostic =
  | NativeAuthoredProjectionDiagnostic
  | Readonly<{
      actual: number;
      code: 'markdown-inline-blocks';
      message: string;
      severity: 'error';
    }>
  | (MarkdownDiagnosticContext &
      Readonly<{
        code: 'markdown-fallback';
        message: string;
        reason: 'incomplete-stream';
        severity: 'warning';
      }>)
  | (MarkdownDiagnosticContext &
      Readonly<{
        code: 'markdown-filtered-node';
        message: string;
        nodeType: string;
        severity: 'warning';
      }>)
  | (MarkdownDiagnosticContext &
      Readonly<{
        code: 'markdown-invalid-source';
        message: string;
        reason: 'parser-failure';
        severity: 'error';
      }>)
  | (MarkdownDiagnosticContext &
      Readonly<{
        actual: number;
        code: 'markdown-limit-exceeded';
        limit: keyof MarkdownParseLimits;
        maximum: number;
        message: string;
        severity: 'error';
      }>)
  | (MarkdownDiagnosticContext &
      Readonly<{
        code: 'markdown-schema-invalid';
        message: string;
        schema: EditorSchemaValidationDiagnostic;
        severity: 'error';
      }>)
  | (MarkdownDiagnosticContext &
      PolicyDiagnostic<{
        code: 'markdown-schema-repair';
        impact: 'lossless' | 'lossy';
        inputs: readonly MarkdownModelLocation[];
        message: string;
        outputs: readonly MarkdownModelLocation[];
        owner: 'document' | 'grammar' | 'property' | 'representation';
        repair: EditorSchemaRepairCode;
      }>)
  | Readonly<{
      code: 'markdown-unsupported-metadata';
      key: string;
      message: string;
      severity: 'warning';
    }>
  | (MarkdownDiagnosticContext &
      PolicyDiagnostic<{
        action: 'dropped' | 'replaced' | 'unwrapped';
        code: 'markdown-unsupported-node';
        message: string;
        nodeType: string;
        owner: string;
        phase: 'parse' | 'serialize';
      }>)
  | Readonly<{
      code: 'markdown-unsupported-root';
      message: string;
      root: RootKey;
      severity: 'warning';
    }>;

export type MarkdownWarningDiagnostic = Extract<
  MarkdownDiagnostic,
  { severity: 'warning' }
>;

export type MarkdownErrorDiagnostic = Extract<
  MarkdownDiagnostic,
  { severity: 'error' }
>;

export type MarkdownDocumentParseResult<V extends Value = Value> =
  | Readonly<{
      diagnostics: readonly MarkdownWarningDiagnostic[];
      document: EditorDocumentValue<V>;
      ok: true;
    }>
  | Readonly<{
      diagnostics: readonly [MarkdownErrorDiagnostic, ...MarkdownDiagnostic[]];
      ok: false;
    }>;

export type MarkdownSliceParseResult<V extends Value = Value> =
  | Readonly<{
      diagnostics: readonly MarkdownWarningDiagnostic[];
      ok: true;
      slice: ContentSlice<V>;
    }>
  | Readonly<{
      diagnostics: readonly [MarkdownErrorDiagnostic, ...MarkdownDiagnostic[]];
      ok: false;
    }>;

export type MarkdownSerializeResult =
  | Readonly<{
      data: string;
      diagnostics: readonly MarkdownWarningDiagnostic[];
      ok: true;
    }>
  | Readonly<{
      diagnostics: readonly [MarkdownErrorDiagnostic, ...MarkdownDiagnostic[]];
      ok: false;
    }>;

/**
 * A unified transformer admitted to Plate's synchronous Markdown pipeline.
 *
 * Unified's public transformer type includes callback and Promise forms even
 * for plugins whose implementation is synchronous. Plate accepts that
 * ecosystem type here, then rejects callback-style and thenable behavior at
 * the runtime boundary.
 */
export type MarkdownSyncTransformer = Transformer<MdRoot, MdRoot>;

export type MarkdownSyncPlugin<
  TParameters extends readonly unknown[] = readonly never[],
> = (
  this: Processor,
  ...parameters: TParameters
) => MarkdownSyncTransformer | void;

export type MarkdownSyncPluggable =
  | MarkdownSyncPlugin
  | readonly [MarkdownSyncPlugin, ...unknown[]];

export type AllowNodeConfig = Readonly<{
  /** Custom filter function for nodes during deserialization. */
  deserialize?: (node: UnistNode & { type: MarkdownNodeName }) => boolean;
  /** Custom filter function for nodes during serialization. */
  serialize?: (node: Descendant) => boolean;
}>;

export type MarkdownParsePolicy = Readonly<{
  allowedNodes?: readonly MarkdownNodeName[] | null;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: readonly MarkdownNodeName[] | null;
  limits?: Partial<MarkdownParseLimits>;
  lossPolicy?: 'allow' | 'reject';
  preserveEmptyParagraphs?: boolean;
  recovery?: 'incomplete-stream';
  remarkPlugins?: readonly MarkdownSyncPluggable[];
  splitLineBreaks?: boolean;
  withoutMdx?: boolean;
}>;

export type MarkdownSerializePolicy = Readonly<{
  allowedNodes?: readonly MarkdownNodeName[] | null;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: readonly MarkdownNodeName[] | null;
  lossPolicy?: 'allow' | 'reject';
  /** Marks to treat as plain text without applying markdown formatting. */
  plainMarks?: readonly MarkdownNodeName[] | null;
  preserveEmptyParagraphs?: boolean;
  projection?: 'accepted' | 'proposed';
  remarkPlugins?: readonly MarkdownSyncPluggable[];
  remarkStringifyOptions?: Readonly<RemarkStringifyOptions> | null;
  spread?: boolean;
  withBlockId?: boolean;
}>;

export type MarkdownParseOptions<
  TPlugins extends readonly RuntimePluginReference[],
> = MarkdownParsePolicy &
  Readonly<{
    plugins: TPlugins;
    schema?: EditorApplicationSchema;
  }>;

export type MarkdownSerializeOptions<
  TPlugins extends readonly RuntimePluginReference[],
> = MarkdownSerializePolicy &
  Readonly<{
    plugins: TPlugins;
    schema?: EditorApplicationSchema;
  }>;

export type MarkdownEditorSerializeOptions = MarkdownSerializePolicy &
  Readonly<{ document?: EditorDocumentValue }>;

export type MarkdownDocumentParseResultFromPlugins<
  TPlugins extends readonly RuntimePluginReference[],
> = MarkdownDocumentParseResult<EditorValueFromPlugins<TPlugins>>;

export type MarkdownSliceParseResultFromPlugins<
  TPlugins extends readonly RuntimePluginReference[],
> = MarkdownSliceParseResult<EditorValueFromPlugins<TPlugins>>;

export type MarkdownDocumentValueFromPlugins<
  TPlugins extends readonly RuntimePluginReference[],
> = EditorDocumentValue<EditorValueFromPlugins<TPlugins>>;

export type MarkdownConversionContext = Readonly<{
  isBlock: (node: Descendant) => boolean;
  isInline: (node: Descendant) => boolean;
  registry: MarkdownPluginRegistry;
}>;

/** Prepared Markdown deserialization context supplied to conversion rules. */
export type DeserializeMdContext = Readonly<
  Omit<MarkdownParsePolicy, 'limits' | 'remarkPlugins'>
> &
  MarkdownConversionContext & {
    /** Whether the optional ElementIdPlugin owns persisted block identity. */
    elementIds?: boolean;
    /**
     * Compiled feature-owned Markdown node formats.
     *
     * @internal
     */
    compiledMappings?: import('./internal/markdownMappings').CompiledMarkdownMappings;
    limits: MarkdownParseLimits;
    lossPolicy: 'allow' | 'reject';
    report: (diagnostic: MarkdownDiagnostic) => void;
    remarkPlugins: Pluggable[];
    rules: MdRules;
    sourceLocation: (node: UnistNode) => MarkdownSourceLocation | undefined;
    state: EditorCoreStateView;
  };

/** Prepared Markdown serialization context supplied to conversion rules. */
export type SerializeMdContext = Readonly<
  Omit<MarkdownSerializePolicy, 'projection' | 'remarkPlugins'> & {
    value: readonly Descendant[];
  }
> &
  MarkdownConversionContext & {
    /** Read the configured persisted element ID through its schema owner. */
    blockId?: (element: Element) => string | undefined;
    document: EditorDocumentValue;
    lossPolicy: 'allow' | 'reject';
    modelLocation: (node: Descendant) => MarkdownModelLocation | undefined;
    report: (diagnostic: MarkdownDiagnostic) => void;
    remarkPlugins: Pluggable[];
    rules: MdRules;
    state: EditorCoreStateView;
  };

export type MdRules = Partial<{
  [K in keyof NodeMap & keyof MdNodeMap]: Nullable<MdNodeParser<K>>;
}> &
  Record<string, Nullable<AnyNodeParser>>;

export type MdNodeParser<
  K extends keyof NodeMap & keyof MdNodeMap = keyof NodeMap & keyof MdNodeMap,
> = {
  mark?: boolean;
  deserialize?(
    mdastNode: MdNodeMap[K],
    deco: MdDecoration,
    options: DeserializeMdContext
  ): Descendant | Descendant[] | undefined;
  serialize?(slateNode: NodeMap[K], options: SerializeMdContext): MdRootContent;
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
  | 'column'
  | 'columnGroup'
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
  | 'table'
  | 'tableCell'
  | 'tableRow'
  | 'text'
  | 'toc'
  | 'toggle'
  | 'underline'
  | 'video';

export type MarkdownNodeName = (string & {}) | StrictMarkdownNodeName;

type NodeMap = {
  [K in StrictMarkdownNodeName]: K extends
    | 'bold'
    | 'break'
    | 'code'
    | 'italic'
    | 'script'
    | 'strikethrough'
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
