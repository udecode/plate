import type { Html, Root as MdRoot } from 'mdast';
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
  EditorSchemaRepairCode,
  EditorSchemaValidationDiagnostic,
  Element,
  RootKey,
  Text,
  Value,
} from '../../core';
import type {
  AuthoredProjectionDiagnostic,
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

/**
 * A Markdown file's leading front matter block, stored at
 * `meta['markdown.frontmatter']`: its format and the text between its fences,
 * with LF line endings.
 */
export type MarkdownFrontmatter = Readonly<{
  format: 'toml' | 'yaml';
  value: string;
}>;

export type MarkdownDiagnostic =
  | AuthoredProjectionDiagnostic
  | PolicyDiagnostic<{
      code: 'markdown-frontmatter-omitted';
      impact: 'lossy';
      message: string;
      /**
       * `shape` when the stored block is not an object whose keys are exactly
       * a string `format` and a string `value`, `format` when the format is
       * neither `yaml` nor `toml`, and `unreadable` when the written block
       * would not read back as the same value.
       */
      reason: 'format' | 'shape' | 'unreadable';
    }>
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

/** Options for creating a stateful streaming Markdown session via `editor.api.markdown.stream()`. */
export type MarkdownStreamOptions = Readonly<{
  /**
   * How incomplete inline links (`[label](https://...`) render before `)` arrives.
   * - `'placeholder'` (default): renders a link with the arrived URL prefix (or `'#'` fallback).
   * - `'text'`: renders the link label as plain text until `)` arrives.
   */
  incompleteLinks?: 'placeholder' | 'text';
  /** Parse limits enforced on the accumulated stream. */
  limits?: Partial<MarkdownParseLimits>;
  /**
   * Loss policy applied when `finish()` validates the completed stream.
   * Defaults to `'reject'`, matching `parseSlice` and `parseInline`.
   * Intermediate preview ticks always run with `'allow'`.
   */
  lossPolicy?: 'allow' | 'reject';
  /**
   * Streaming mode:
   * - `'blocks'` (default): block-level slice streaming (`parseSlice` parity on `finish()`).
   * - `'inline'`: single-paragraph inline streaming (`parseInline` parity on `finish()`).
   */
  mode?: 'blocks' | 'inline';
}>;

/** Minimal revisioned patch describing how a streaming Markdown snapshot changed from its predecessor. */
export type MarkdownStreamDelta =
  | Readonly<{ kind: 'reset'; revision: number }>
  | Readonly<{
      baseRevision: number;
      from: number;
      kind: 'splice';
      nodes: readonly Descendant[];
      revision: number;
    }>
  | Readonly<{
      baseRevision: number;
      blockIndex: number;
      kind: 'append-text';
      revision: number;
      text: string;
    }>
  | Readonly<{
      baseRevision: number;
      blockIndex: number;
      kind: 'append-code';
      revision: number;
      text: string;
    }>
  | Readonly<{
      baseRevision: number;
      blockIndex: number;
      kind: 'append-table-row';
      revision: number;
      row: Element;
      rowIndex: number;
    }>
  | Readonly<{
      baseRevision: number;
      blockIndex: number;
      kind: 'replace-table-row';
      revision: number;
      row: Element;
      rowIndex: number;
    }>;

/** Immutable snapshot returned by each `MarkdownStream` operation. */
export type MarkdownStreamSnapshot<V extends Value = Value> = Readonly<{
  /** Revisioned delta from the previous snapshot. */
  delta: MarkdownStreamDelta;
  /** Diagnostics collected for the current snapshot. */
  diagnostics: readonly MarkdownDiagnostic[];
  /** Whether `finish()` has completed on the current source. */
  done: boolean;
  /** Frozen full node array; indices `[0, stableCount)` keep `===` reference identity while revision advances without a reset. */
  nodes: readonly Descendant[];
  /** Whether the snapshot succeeded. */
  ok: boolean;
  /** Monotonically increasing revision number for this stream session. */
  revision: number;
  /** Validated `ContentSlice` populated only when `done && ok`. */
  slice?: ContentSlice<V>;
  /** Provisional committed prefix block count; may decrease with `delta.kind === 'reset'` on late definitions or whole-tree `finish()`. */
  stableCount: number;
}>;

/** Stateful incremental streaming Markdown session returned by `editor.api.markdown.stream()`. */
export type MarkdownStream<V extends Value = Value> = Readonly<{
  /** Append the next raw chunk to the stream and return the updated preview snapshot. */
  append: (chunk: string) => MarkdownStreamSnapshot<V>;
  /** Finalize the accumulated source under the configured `lossPolicy` and return the final snapshot with a validated `slice`. */
  finish: () => MarkdownStreamSnapshot<V>;
  /** Clear all buffered state and reset the session to revision 0. */
  reset: () => void;
  /** Replace or extend the accumulated source (incrementally appending when `source` extends `this.source`). */
  set: (source: string) => MarkdownStreamSnapshot<V>;
  /** Latest immutable snapshot for this session. */
  readonly snapshot: MarkdownStreamSnapshot<V>;
  /** Current raw source accumulated by this session. */
  readonly source: string;
}>;

/**
 * One segment returned by `editor.api.markdown.parsePlaceholders`: either a
 * schema-validated run of decoded nodes or an immutable placeholder reference.
 */
export type MarkdownPlaceholderSegment<V extends Value = Value> =
  | Readonly<{
      kind: 'nodes';
      nodes: V;
    }>
  | Readonly<{
      kind: 'placeholder';
      ref: string;
    }>;

/** Options for `editor.api.markdown.parsePlaceholders`. */
export type MarkdownPlaceholderParseOptions = Readonly<{
  /** Limit overrides for the Markdown parse. */
  limits?: Partial<MarkdownParseLimits>;
  /** Loss policy for unsupported Markdown nodes in unlocked runs. */
  lossPolicy?: 'allow' | 'reject';
  /**
   * Self-closing block tag name (for example `'Locked'`) tokenized at the
   * Markdown AST stage for this parse call only.
   */
  tag: string;
}>;

/** Result returned by `editor.api.markdown.parsePlaceholders`. */
export type MarkdownPlaceholderParseResult<V extends Value = Value> =
  | Readonly<{
      diagnostics: readonly MarkdownWarningDiagnostic[];
      ok: true;
      segments: ReadonlyArray<MarkdownPlaceholderSegment<V>>;
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
   * A trailing tag that has not finished arriving is hidden. `parse`,
   * `parseSlice` and `parseInline` also show a bold, italic or strikethrough
   * run that has not closed yet styled as it will read once it closes, and
   * hide up to three trailing `*`, `_`, `~` or `\` characters in all until
   * the next characters decide them, so a later chunk can take back styling a
   * preview showed. Use a final parse once the stream completes.
   */
  partial?: boolean;
}>;

export type MarkdownSerializePolicy = Readonly<{
  lossPolicy?: 'allow' | 'reject';
  /** Mark keys written as plain text without Markdown formatting. */
  plainMarks?: readonly string[] | null;
  preserveEmptyParagraphs?: boolean;
  /**
   * Version of an authored document to export. `accepted` drops pending changes
   * and `proposed` applies them as plain content. Either choice adds an
   * `authored-lossy-projection` warning while changes are pending. Required
   * when the document has authored metadata, which every document from an
   * editor with the authored plugin carries, even with no pending change.
   * Omitting it or passing any other value then throws, and so does a valid
   * value when the editor or `plugins` lacks the authored plugin. A document
   * without authored metadata ignores it.
   */
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
    /** Receives the syntax node count once tree limits pass. */
    onSyntaxNodes?: (count: number) => void;
    /** Receives the root's children before they are converted. */
    onRootChildren?: (children: readonly MdRootContent[]) => void;
    /** Receives how many nodes each of the root's children converted to. */
    onRootBlocks?: (counts: readonly number[]) => void;
    /** The root node before this source when it continues an earlier one. */
    previousRootSibling?: MdRootContent | null;
    flowHtmlBlocks?: ReadonlySet<Html>;
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
    enclosedMarks?: WeakMap<Text, ReadonlySet<string>>;
    lossPolicy: 'allow' | 'reject';
    mappings: CompiledMarkdownMappings;
    modelLocation: (node: Descendant) => MarkdownModelLocation | undefined;
    readRoots: Set<RootKey>;
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
