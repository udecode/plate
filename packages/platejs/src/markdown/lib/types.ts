import type { Root as MdRoot } from 'mdast';
import type { Options as RemarkStringifyOptions } from 'remark-stringify';
import type { Pluggable, Processor, Transformer } from 'unified';
import type { Node as UnistNode } from 'unist';

import type {
  ContentSlice,
  MarkdownMarks,
  MarkdownPluginRegistry,
  Descendant,
  EditorApplicationSchema,
  EditorCoreStateView,
  EditorDocumentValue,
  EditorSchemaValidationDiagnostic,
  RootKey,
  Value,
} from '../../core';
import type {
  NativeAuthoredProjectionDiagnostic,
  RuntimePluginReference,
} from '../../facade';
import type { CompiledMarkdownMappings } from './internal/markdownMappings';
import type {
  MdDelete,
  MdEmphasis,
  MdInlineCode,
  MdMdxJsxTextElement,
  MdRootContent,
  MdStrong,
  MdText,
} from './mdast';
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
        actual: number;
        code: 'markdown-limit-exceeded';
        limit: keyof MarkdownParseLimits;
        maximum: number;
        message: string;
        severity: 'error';
      }>)
  | (MarkdownDiagnosticContext &
      Readonly<{
        code: 'markdown-property-omitted';
        key: string;
        message: string;
        owner: string;
        phase: 'parse' | 'serialize';
        reason: 'invalid' | 'unsupported';
        severity: 'warning';
      }>)
  | (MarkdownDiagnosticContext &
      Readonly<{
        code: 'markdown-tag-repair';
        message: string;
        reason: 'misplaced' | 'unclosed' | 'unmatched';
        severity: 'warning';
        tag: string;
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
        /**
         * `lossless` when nothing a reader sees was lost, such as raw HTML
         * kept as text or an omitted comment; `lossy` otherwise.
         */
        impact: 'lossless' | 'lossy';
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
    }>
  | (MarkdownDiagnosticContext &
      PolicyDiagnostic<{
        code: 'markdown-unsafe-content';
        /**
         * `lossless` when only a script-capable destination was removed and
         * its label kept; `lossy` when visible content went with it.
         */
        impact: 'lossless' | 'lossy';
        message: string;
        nodeType: string;
        phase: 'parse' | 'serialize';
      }>);

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

export type MarkdownParsePolicy = Readonly<{
  limits?: Partial<MarkdownParseLimits>;
  lossPolicy?: 'allow' | 'reject';
  /**
   * The source is an unfinished stream prefix, such as a streaming AI answer.
   * A trailing tag that has not finished arriving is hidden; use a final parse
   * once the stream completes.
   */
  partial?: boolean;
}>;

export type MarkdownSerializePolicy = Readonly<{
  lossPolicy?: 'allow' | 'reject';
  /** Mark keys written as plain text without Markdown formatting. */
  plainMarks?: readonly string[] | null;
  preserveEmptyParagraphs?: boolean;
  projection?: 'accepted' | 'proposed';
  remarkStringifyOptions?: Readonly<RemarkStringifyOptions> | null;
  spread?: boolean;
}>;

export type MarkdownParseOptions = MarkdownParsePolicy &
  Readonly<{
    plugins: readonly RuntimePluginReference[];
    schema?: EditorApplicationSchema;
  }>;

export type MarkdownSerializeOptions = MarkdownSerializePolicy &
  Readonly<{
    plugins: readonly RuntimePluginReference[];
    schema?: EditorApplicationSchema;
  }>;

export type MarkdownEditorSerializeOptions<V extends Value = Value> =
  MarkdownSerializePolicy & Readonly<{ document?: EditorDocumentValue<V> }>;

export type MarkdownConversionContext = Readonly<{
  isBlock: (node: Descendant) => boolean;
  isInline: (node: Descendant) => boolean;
  /** Identity of one conversion; derived contexts keep it, so per-operation caches hold. */
  operation: object;
  registry: MarkdownPluginRegistry;
}>;

/** Prepared Markdown deserialization context supplied to conversion rules. */
export type DeserializeMdContext = Readonly<
  Omit<MarkdownParsePolicy, 'limits'>
> &
  MarkdownConversionContext & {
    /** Whether the optional ElementIdPlugin owns persisted block identity. */
    elementIds?: boolean;
    /** Receives the syntax node count once tree limits pass. */
    onSyntaxNodes?: (count: number) => void;
    /** Receives the root's children before they are converted. */
    onRootChildren?: (children: readonly MdRootContent[]) => void;
    /** The root node before this source when it continues an earlier one. */
    previousRootSibling?: MdRootContent | null;
    limits: MarkdownParseLimits;
    lossPolicy: 'allow' | 'reject';
    mappings: CompiledMarkdownMappings;
    report: (diagnostic: MarkdownDiagnostic) => void;
    remarkPlugins: Pluggable[];
    sourceLocation: (node: UnistNode) => MarkdownSourceLocation | undefined;
    state: EditorCoreStateView;
  };

/** Prepared Markdown serialization context supplied to conversion rules. */
export type SerializeMdContext = Readonly<
  Omit<MarkdownSerializePolicy, 'projection'> & {
    value: readonly Descendant[];
  }
> &
  MarkdownConversionContext & {
    document: EditorDocumentValue;
    lossPolicy: 'allow' | 'reject';
    mappings: CompiledMarkdownMappings;
    modelLocation: (node: Descendant) => MarkdownModelLocation | undefined;
    report: (diagnostic: MarkdownDiagnostic) => void;
    remarkPlugins: Pluggable[];
    state: EditorCoreStateView;
  };

export type MdMark =
  | MdDelete
  | MdEmphasis
  | MdInlineCode
  | MdMdxJsxTextElement
  | MdStrong
  | MdText;

export type MdMarks = MarkdownMarks;
