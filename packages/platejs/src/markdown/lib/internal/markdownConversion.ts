import type { Root, RootContent as MdRootContent } from 'mdast';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { type Plugin as UnifiedPlugin, unified } from 'unified';

import {
  ContentSlice,
  type Descendant,
  type Editor,
  type EditorCoreStateView,
  type EditorDocumentValue,
  EditorSchemaValidationError,
  type Element,
  ElementIdPlugin,
  type MarkdownPluginRegistry,
  PLUGINS,
  TextApi,
  type Value,
} from '../../../core';
import { getCompiledPlatePlugin } from '../../../internal/plugin/compilePlateModel';
import { createValidatedContentSlice } from '../../../internal/utils/trustedContentSlice';
import type { NormalizePluginState } from '../../../lib/plugin/PluginDefinition';
import { mdastToSlate } from '../deserializer/mdastToSlate';
import type { MarkdownPluginState } from '../MarkdownPlugin';
import { convertNodesSerialize } from '../serializer/convertNodesSerialize';
import type {
  DeserializeMdContext,
  MarkdownDiagnostic,
  MarkdownDocumentParseResult,
  MarkdownConversionContext,
  MarkdownParsePolicy,
  MarkdownSerializePolicy,
  MarkdownSerializeResult,
  MarkdownSliceParseResult,
  SerializeMdContext,
} from '../types';
import {
  materializeMarkdownSettings,
  materializeRemarkPlugins,
} from '../utils/remarkPlugins';
import {
  checkMarkdownTreeLimits,
  createMarkdownModelLocator,
  createMarkdownSourceLocation,
  DEFAULT_MARKDOWN_PARSE_LIMITS,
  MarkdownDiagnostics,
  ReportedMarkdownFailureError,
} from './markdownDiagnostics';
import type { MarkdownSerializeDocumentValue } from './markdownDocument';
import {
  type CompiledMarkdownMappings,
  compileMarkdownMappings,
  getMarkdownMappingsRegistryKey,
  getRegisteredMarkdownMappings,
  registerMarkdownMappings,
} from './markdownMappings';
import {
  allocateMarkdownFootnoteLabels,
  remarkResolveMarkdownReferences,
} from './markdownReferences';
import { cleanMarkdownDestinations } from './markdownSafety';
import {
  countMarkdownLines,
  findMarkdownSegmentBoundaries,
  MARKDOWN_DEFINITION,
  shiftMarkdownDiagnostic,
} from './markdownSegments';
import {
  remarkMarkdownTags,
  remarkMarkdownTagWriter,
  trimIncompleteMarkdownTag,
} from './markdownTags';

export type MarkdownRuntimeState = NormalizePluginState<MarkdownPluginState>;

type MarkdownRuntimeEditorState = EditorCoreStateView;

type MarkdownRuntimeOptions = Readonly<{
  plainMarks: readonly string[] | null;
  remarkPlugins: NonNullable<MarkdownRuntimeState['remarkPlugins']>;
  remarkStringifyOptions: NonNullable<
    MarkdownRuntimeState['remarkStringifyOptions']
  > | null;
}>;

export type MarkdownRuntime = Readonly<{
  formats: CompiledMarkdownMappings;
  elementId: ((element: Element) => string | undefined) | null;
  options: MarkdownRuntimeOptions;
  registry: MarkdownPluginRegistry;
  state: MarkdownRuntimeEditorState;
}>;

type MarkdownOperationRuntimeContext = Readonly<{
  pluginState: MarkdownRuntimeState;
  registry: MarkdownPluginRegistry;
  schema: object;
  state: MarkdownRuntimeEditorState;
}>;

const createMarkdownRuntimeFromParts = (
  formats: CompiledMarkdownMappings,
  options: MarkdownRuntimeState,
  registry: MarkdownPluginRegistry,
  state: MarkdownRuntimeEditorState
): MarkdownRuntime => {
  const hasElementIds = registry.has(ElementIdPlugin);

  return Object.freeze({
    formats,
    elementId: hasElementIds
      ? (element) => {
          const id = state.schema.getProperty(element, 'id');

          return typeof id === 'string' ? id : undefined;
        }
      : null,
    options: Object.freeze(options),
    registry,
    state,
  });
};

export const createMarkdownRuntime = (
  editor: Editor,
  options: MarkdownRuntimeState,
  state: MarkdownRuntimeEditorState
): MarkdownRuntime => {
  const formats = compileMarkdownMappings(editor);
  const registry = Object.freeze({
    has: (plugin) => {
      const descriptor =
        typeof plugin === 'string'
          ? getCompiledPlatePlugin(editor, plugin)
          : plugin;

      return descriptor ? editor.plugin(descriptor).installed : false;
    },
    type: (plugin) => {
      const descriptor =
        typeof plugin === 'string'
          ? getCompiledPlatePlugin(editor, plugin)
          : plugin;

      if (!descriptor) return undefined;
      const portal = editor.plugin(descriptor);
      return portal.installed ? portal.schema.type : undefined;
    },
  }) satisfies MarkdownPluginRegistry;

  registerMarkdownMappings(getMarkdownMappingsRegistryKey(options), formats);

  return createMarkdownRuntimeFromParts(formats, options, registry, state);
};

export const prepareMarkdownRuntime = (
  editor: Editor,
  options: MarkdownRuntimeState
) => {
  registerMarkdownMappings(
    getMarkdownMappingsRegistryKey(options),
    compileMarkdownMappings(editor)
  );
};

export const createMarkdownOperationRuntime = (
  context: MarkdownOperationRuntimeContext
): MarkdownRuntime => {
  void context.schema;

  return createMarkdownRuntimeFromParts(
    getRegisteredMarkdownMappings(
      getMarkdownMappingsRegistryKey(context.pluginState)
    ),
    context.pluginState,
    context.registry,
    context.state
  );
};

export const withMarkdownRuntime = <T>(
  editor: Editor,
  options: MarkdownRuntimeState,
  run: (runtime: MarkdownRuntime) => T
): T =>
  editor.read((state) => run(createMarkdownRuntime(editor, options, state)));

const createConversionContext = (
  runtime: MarkdownRuntime
): MarkdownConversionContext => ({
  isBlock: (node) => runtime.state.schema.isBlock(node),
  isInline: (node) => runtime.state.schema.isInline(node),
  operation: {},
  registry: runtime.registry,
});

export const getMergedOptionsDeserialize = (
  runtime: MarkdownRuntime,
  options: MarkdownParsePolicy = {},
  operation: Readonly<{
    diagnostics?: MarkdownDiagnostics;
    positionsReferToSource?: boolean;
    source?: string;
  }> = {}
): DeserializeMdContext => {
  const { remarkPlugins } = runtime.options;
  const diagnostics = operation.diagnostics ?? new MarkdownDiagnostics();
  const source = operation.source ?? '';

  const context: DeserializeMdContext = {
    ...createConversionContext(runtime),
    limits: Object.freeze({
      ...DEFAULT_MARKDOWN_PARSE_LIMITS,
      ...options.limits,
    }),
    lossPolicy: options.lossPolicy ?? 'reject',
    mappings: runtime.formats,
    partial: options.partial,
    remarkPlugins: materializeRemarkPlugins(remarkPlugins),
    report: diagnostics.report,
    ...(runtime.elementId ? { elementIds: true } : {}),
    sourceLocation: (node) =>
      createMarkdownSourceLocation(
        node,
        source,
        operation.positionsReferToSource ?? false
      ),
    state: runtime.state,
  };

  return context;
};

export const getMergedOptionsSerialize = (
  runtime: MarkdownRuntime,
  options: MarkdownSerializePolicy = {},
  documentOverride?: MarkdownSerializeDocumentValue,
  diagnostics = new MarkdownDiagnostics()
): SerializeMdContext => {
  const { plainMarks, remarkPlugins, remarkStringifyOptions } = runtime.options;

  const document = documentOverride ?? runtime.state.value();
  const context: SerializeMdContext = {
    ...createConversionContext(runtime),
    document,
    lossPolicy: options.lossPolicy ?? 'reject',
    mappings: runtime.formats,
    modelLocation: createMarkdownModelLocator(document),
    plainMarks:
      options.plainMarks ?? (plainMarks ? [...plainMarks] : plainMarks),
    preserveEmptyParagraphs: options.preserveEmptyParagraphs,
    remarkPlugins: materializeRemarkPlugins(remarkPlugins),
    remarkStringifyOptions:
      options.remarkStringifyOptions ??
      (remarkStringifyOptions
        ? materializeMarkdownSettings(remarkStringifyOptions)
        : remarkStringifyOptions),
    report: diagnostics.report,
    spread: options.spread,
    state: runtime.state,
    value: [...document.children],
  };

  return context;
};

type MarkdownSegmentHooks = Pick<
  DeserializeMdContext,
  'onRootChildren' | 'onSyntaxNodes' | 'previousRootSibling'
>;

export const markdownToSlateNodesWithRuntime = (
  runtime: MarkdownRuntime,
  data: string,
  options: MarkdownParsePolicy = {},
  diagnostics = new MarkdownDiagnostics(),
  hooks: MarkdownSegmentHooks = {}
): Descendant[] => {
  const mergedOptions: DeserializeMdContext = {
    ...getMergedOptionsDeserialize(runtime, options, {
      diagnostics,
      positionsReferToSource: true,
      source: data,
    }),
    ...hooks,
  };
  const toSlateProcessor = unified()
    .use(remarkParse)
    .use(remarkMarkdownTags, { tags: runtime.formats.tags })
    .use(remarkResolveMarkdownReferences)
    .use(mergedOptions.remarkPlugins ?? [])
    .use(remarkToSlate, mergedOptions);

  return toSlateProcessor.processSync(data).result;
};

export const deserializeMdWithRuntime = (
  runtime: MarkdownRuntime,
  data: string,
  options: MarkdownParsePolicy = {},
  diagnostics = new MarkdownDiagnostics()
): EditorDocumentValue => {
  const output = markdownToSlateNodesWithRuntime(
    runtime,
    data,
    options,
    diagnostics
  );

  const paragraphType = runtime.registry.type(PLUGINS.paragraph) ?? 'paragraph';

  return {
    children: output.map((item) =>
      TextApi.isText(item)
        ? {
            children: [item],
            type: paragraphType,
          }
        : item
    ),
  };
};

declare module 'unified' {
  interface CompileResultMap {
    remarkToSlateNode: Descendant[];
  }
}

const remarkToSlate: UnifiedPlugin<[DeserializeMdContext], Root, Descendant[]> =
  function (options) {
    this.compiler = (node) => {
      const syntaxNodes = checkMarkdownTreeLimits(
        node,
        options.limits,
        options.report
      );

      if (syntaxNodes === null) throw new ReportedMarkdownFailureError();
      options.onSyntaxNodes?.(syntaxNodes);
      cleanMarkdownDestinations(node as Root, {
        lossPolicy: options.lossPolicy,
        phase: 'parse',
        report: options.report,
        sourceLocation: options.sourceLocation,
      });

      return mdastToSlate(node as Root, options);
    };
  };

export const serializeMdWithRuntime = (
  runtime: MarkdownRuntime,
  options: MarkdownSerializePolicy = {},
  document?: MarkdownSerializeDocumentValue,
  diagnostics = new MarkdownDiagnostics()
) => {
  const mergedOptions = getMergedOptionsSerialize(
    runtime,
    options,
    document,
    diagnostics
  );
  const { remarkPlugins, value } = mergedOptions;
  const toRemarkProcessor = unified()
    .use(remarkMarkdownTagWriter)
    .use(remarkPlugins ?? [])
    .use(remarkStringify, {
      emphasis: '_',
      resourceLink: false,
      ...mergedOptions.remarkStringifyOptions,
    });
  const tree: Root = {
    children: convertNodesSerialize(value, mergedOptions),
    type: 'root',
  };

  cleanMarkdownDestinations(tree, {
    lossPolicy: mergedOptions.lossPolicy,
    phase: 'serialize',
    report: diagnostics.report,
  });
  allocateMarkdownFootnoteLabels(tree, (label) =>
    diagnostics.report({
      action: 'replaced',
      code: 'markdown-unsupported-node',
      impact: 'lossy',
      message: `Footnote reference "${label}" has no definition in the output and reads back as text.`,
      nodeType: 'footnoteReference',
      owner: 'markdown',
      phase: 'serialize',
      severity: 'warning',
    })
  );

  return toRemarkProcessor.stringify(toRemarkProcessor.runSync(tree));
};

const markdownParseLimits = (options: MarkdownParsePolicy) =>
  Object.freeze({
    ...DEFAULT_MARKDOWN_PARSE_LIMITS,
    ...options.limits,
  });

const reportByteLimit = (
  source: string,
  options: MarkdownParsePolicy,
  diagnostics: MarkdownDiagnostics
) => {
  const limits = markdownParseLimits(options);
  const bytes = new TextEncoder().encode(source).byteLength;

  if (bytes <= limits.maxBytes) return false;
  diagnostics.report({
    actual: bytes,
    code: 'markdown-limit-exceeded',
    limit: 'maxBytes',
    maximum: limits.maxBytes,
    message: `Markdown source exceeds ${limits.maxBytes} UTF-8 bytes.`,
    severity: 'error',
  });

  return true;
};

// A partial source is an unfinished stream prefix: hide a trailing tag that
// has not finished arriving.
const previewSource = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy
) =>
  options.partial
    ? trimIncompleteMarkdownTag(source, runtime.formats.tags)
    : source;

const runParsedNodes = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy,
  diagnostics: MarkdownDiagnostics,
  hooks?: MarkdownSegmentHooks
): Descendant[] | null => {
  if (reportByteLimit(source, options, diagnostics)) return null;

  try {
    return markdownToSlateNodesWithRuntime(
      runtime,
      previewSource(runtime, source, options),
      options,
      diagnostics,
      hooks
    );
  } catch (error) {
    if (error instanceof ReportedMarkdownFailureError) return null;
    throw error;
  }
};

/**
 * The installed editor and plugin state a parse ran under, and the earlier
 * result it may continue. Reuse requires all of them to match.
 */
export type MarkdownReuse = Readonly<{
  editor: object;
  pluginStates: readonly unknown[];
  previous: object | undefined;
}>;

type MarkdownSegment = Readonly<{
  diagnostics: readonly MarkdownDiagnostic[];
  /** Where the segment ends in the source. */
  end: number;
  /** The next segment's first node reads this as its previous sibling. */
  lastRoot: MdRootContent | null;
  /** Frozen snapshots, returned as they are by every continuation. */
  nodes: readonly Descendant[];
  syntaxNodes: number;
}>;

type MarkdownCheckpoint = Readonly<{
  editor: object;
  formats: CompiledMarkdownMappings;
  limits: string;
  lossPolicy: 'allow' | 'reject';
  pluginStates: readonly unknown[];
  segments: readonly MarkdownSegment[];
  source: string;
}>;

// Keyed by the returned result, so a fabricated or copied result never matches.
const markdownCheckpoints = new WeakMap<object, MarkdownCheckpoint>();

type MarkdownConversion = Readonly<{
  checkpoint: Pick<
    MarkdownCheckpoint,
    'limits' | 'lossPolicy' | 'segments' | 'source'
  > | null;
  /** Deeply frozen top-level blocks. */
  nodes: readonly Descendant[] | null;
  /** Blocks a slice still has to validate; reused segments already passed. */
  unvalidated: readonly Descendant[];
}>;

const snapshotBlocks = (
  runtime: MarkdownRuntime,
  parsed: readonly Descendant[]
): readonly Descendant[] =>
  ContentSlice.closed(normalizeDocumentChildren(runtime, parsed)).content;

/**
 * Convert `source` to top-level blocks. A parse with a valid previous result
 * of a source prefix reconverts only what follows its last complete segment:
 * each complete segment keeps its converted node objects, so consumers can
 * publish only the changed tail.
 */
const convertMarkdownSource = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy,
  diagnostics: MarkdownDiagnostics,
  reuse?: MarkdownReuse
): MarkdownConversion => {
  const limits = markdownParseLimits(options);
  const limitsKey = JSON.stringify(limits);
  const lossPolicy = options.lossPolicy ?? 'reject';
  const full = (): MarkdownConversion => {
    const parsed = runParsedNodes(runtime, source, options, diagnostics);
    const nodes = parsed && snapshotBlocks(runtime, parsed);

    return {
      checkpoint: reuse
        ? { limits: limitsKey, lossPolicy, segments: [], source }
        : null,
      nodes,
      unvalidated: nodes ?? [],
    };
  };

  if (
    !reuse?.previous ||
    MARKDOWN_DEFINITION.test(source) ||
    new TextEncoder().encode(source).byteLength > limits.maxBytes
  ) {
    return full();
  }
  const old = markdownCheckpoints.get(reuse.previous);
  const valid =
    !!old &&
    old.editor === reuse.editor &&
    old.formats === runtime.formats &&
    old.limits === limitsKey &&
    old.pluginStates.length === reuse.pluginStates.length &&
    old.pluginStates.every(
      (state, index) => state === reuse.pluginStates[index]
    ) &&
    source.startsWith(old.source);
  const previousSegments = valid ? old.segments : [];
  // A segment's diagnostics take their severity from the loss policy, so
  // under another policy only the segments that reported nothing still hold.
  const kept =
    old?.lossPolicy === lossPolicy
      ? previousSegments.length
      : previousSegments.findIndex((segment) => segment.diagnostics.length > 0);
  const segments = previousSegments.slice(
    0,
    kept === -1 ? previousSegments.length : kept
  );
  const reused = segments.length;
  let stableEnd = segments.at(-1)?.end ?? 0;
  // Each segment parses its own root; the whole source has one.
  let syntaxNodes = segments.reduce(
    (count, segment) => count + segment.syntaxNodes - 1,
    1
  );
  // Content follows every complete segment, so only the tail is the end of a
  // partial source.
  const convertRange = (end: number) => {
    const local = new MarkdownDiagnostics();
    let count = 0;
    let lastRoot: MdRootContent | null = null;
    const parsed = runParsedNodes(
      runtime,
      source.slice(stableEnd, end),
      {
        ...options,
        limits: { ...limits, maxNodes: limits.maxNodes - syntaxNodes + 1 },
        partial: end === source.length && options.partial,
      },
      local,
      {
        onRootChildren: (children) => {
          lastRoot = children.at(-1) ?? null;
        },
        onSyntaxNodes: (nodes) => {
          count = nodes;
        },
        // A decoder reads the node before it, even across segments.
        previousRootSibling: segments.at(-1)?.lastRoot ?? null,
      }
    );

    if (!parsed || local.failure()) return null;
    const lines = countMarkdownLines(source, stableEnd);

    return {
      diagnostics: local
        .all()
        .map((diagnostic) =>
          shiftMarkdownDiagnostic(diagnostic, lines, stableEnd)
        ),
      lastRoot,
      parsed,
      syntaxNodes: count,
    };
  };

  for (const boundary of findMarkdownSegmentBoundaries(
    source,
    stableEnd,
    runtime.formats.tags
  )) {
    const segment = convertRange(boundary);

    if (!segment) return full();
    const last = segment.parsed.at(-1);

    // Normalization joins top-level inline runs across a blank line, so a
    // segment ending in one is not complete yet.
    if (!last || TextApi.isText(last) || runtime.state.schema.isInline(last)) {
      continue;
    }
    segments.push({
      diagnostics: segment.diagnostics,
      end: boundary,
      lastRoot: segment.lastRoot,
      nodes: snapshotBlocks(runtime, segment.parsed),
      syntaxNodes: segment.syntaxNodes,
    });
    syntaxNodes += segment.syntaxNodes - 1;
    stableEnd = boundary;
  }
  const tail = convertRange(source.length);

  if (!tail) return full();
  for (const segment of segments) {
    segment.diagnostics.forEach(diagnostics.report);
  }
  tail.diagnostics.forEach(diagnostics.report);
  const tailNodes = snapshotBlocks(runtime, tail.parsed);

  return {
    checkpoint: { limits: limitsKey, lossPolicy, segments, source },
    nodes: Object.freeze([
      ...segments.flatMap((segment) => segment.nodes),
      ...tailNodes,
    ]),
    unvalidated: [
      ...segments.slice(reused).flatMap((segment) => segment.nodes),
      ...tailNodes,
    ],
  };
};

const rememberMarkdownConversion = <T extends object>(
  result: T,
  conversion: MarkdownConversion,
  runtime: MarkdownRuntime,
  reuse: MarkdownReuse | undefined
): T => {
  if (reuse && conversion.checkpoint) {
    markdownCheckpoints.set(result, {
      ...conversion.checkpoint,
      editor: reuse.editor,
      formats: runtime.formats,
      pluginStates: reuse.pluginStates,
    });
  }

  return result;
};

const normalizeDocumentChildren = (
  runtime: MarkdownRuntime,
  children: readonly Descendant[]
): Element[] => {
  const paragraphType = runtime.registry.type(PLUGINS.paragraph) ?? 'paragraph';
  const output: Element[] = [];
  let inline: Descendant[] = [];
  const flushInline = () => {
    if (inline.length === 0) return;
    output.push({ children: inline, type: paragraphType });
    inline = [];
  };

  children.forEach((node) => {
    if (TextApi.isText(node) || runtime.state.schema.isInline(node)) {
      inline.push(node);

      return;
    }
    flushInline();
    output.push(node);
  });
  flushInline();

  return output;
};

const reportSchemaInvalid = (
  error: unknown,
  diagnostics: MarkdownDiagnostics
) => {
  if (!(error instanceof EditorSchemaValidationError)) throw error;
  const schema = error.diagnostics[0];

  if (!schema) throw error;
  diagnostics.report({
    code: 'markdown-schema-invalid',
    message: schema.message,
    model: Object.freeze({
      path: schema.path,
      ...(schema.property ? { property: schema.property.key } : {}),
      ...(schema.root === null ? {} : { root: schema.root }),
    }),
    schema,
    severity: 'error',
  });
};

type MarkdownSchemaRepair = Extract<
  MarkdownDiagnostic,
  { code: 'markdown-schema-repair' }
>;

const fitMarkdownDocument = (
  runtime: MarkdownRuntime,
  document: EditorDocumentValue,
  options: MarkdownParsePolicy,
  diagnostics: MarkdownDiagnostics
) => {
  const schema = runtime.state.schema as EditorCoreStateView['schema'] &
    Readonly<{
      fitDocumentWithReport: (input: EditorDocumentValue) => Readonly<{
        document: EditorDocumentValue;
        repairs: ReadonlyArray<
          Readonly<{
            code: MarkdownSchemaRepair['repair'];
            impact: MarkdownSchemaRepair['impact'];
            inputs: MarkdownSchemaRepair['inputs'];
            outputs: MarkdownSchemaRepair['outputs'];
            owner: MarkdownSchemaRepair['owner'];
          }>
        >;
      }>;
    }>;
  const report = schema.fitDocumentWithReport(document);

  report.repairs.forEach((repair) => {
    diagnostics.report({
      code: 'markdown-schema-repair',
      impact: repair.impact,
      inputs: repair.inputs,
      message: `Markdown schema fitting applied "${repair.code}".`,
      outputs: repair.outputs,
      owner: repair.owner,
      repair: repair.code,
      severity:
        repair.impact === 'lossy' && options.lossPolicy !== 'allow'
          ? 'error'
          : 'warning',
    });
  });

  return report.document;
};

const documentParseFailure = (
  diagnostics: MarkdownDiagnostics
): MarkdownDocumentParseResult => {
  const failure = diagnostics.failure();

  if (!failure) throw new Error('Markdown parse failed without a diagnostic.');

  return Object.freeze({ diagnostics: failure, ok: false });
};

const sliceParseFailure = (
  diagnostics: MarkdownDiagnostics
): MarkdownSliceParseResult => {
  const failure = diagnostics.failure();

  if (!failure) throw new Error('Markdown parse failed without a diagnostic.');

  return Object.freeze({ diagnostics: failure, ok: false });
};

export const parseMarkdownDocumentWithRuntime = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy = {}
): MarkdownDocumentParseResult => {
  const diagnostics = new MarkdownDiagnostics();
  const parsed = runParsedNodes(runtime, source, options, diagnostics);

  if (!parsed || diagnostics.failure()) {
    return documentParseFailure(diagnostics);
  }
  // Normalized top-level blocks are elements. Fitting copies them, so a
  // document parse needs no frozen snapshot.
  const input = Object.freeze({
    children: normalizeDocumentChildren(runtime, parsed) as Value,
  });
  let document: EditorDocumentValue;

  try {
    document = fitMarkdownDocument(runtime, input, options, diagnostics);
    if (diagnostics.failure()) return documentParseFailure(diagnostics);
    runtime.state.schema.assertDocument(document);
  } catch (error) {
    reportSchemaInvalid(error, diagnostics);

    return documentParseFailure(diagnostics);
  }

  return Object.freeze({
    diagnostics: diagnostics.warnings(),
    document,
    ok: true,
  });
};

export const parseMarkdownSliceWithRuntime = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy = {},
  reuse?: MarkdownReuse
): MarkdownSliceParseResult => {
  const diagnostics = new MarkdownDiagnostics();
  const conversion = convertMarkdownSource(
    runtime,
    source,
    options,
    diagnostics,
    reuse
  );

  if (!conversion.nodes || diagnostics.failure()) {
    return sliceParseFailure(diagnostics);
  }
  try {
    runtime.state.schema.assertFragment(conversion.unvalidated);
  } catch {
    // Report the error as validating the whole slice does.
    try {
      runtime.state.schema.assertFragment(conversion.nodes);
    } catch (error) {
      reportSchemaInvalid(error, diagnostics);

      return sliceParseFailure(diagnostics);
    }
  }
  // Every node is validated for this schema, so insertion can trust it.
  const slice = createValidatedContentSlice(
    conversion.nodes,
    runtime.state.schema
  );

  return rememberMarkdownConversion(
    Object.freeze({
      diagnostics: diagnostics.warnings(),
      ok: true,
      slice,
    }) as MarkdownSliceParseResult,
    conversion,
    runtime,
    reuse
  );
};

const LEADING_WHITESPACE = /^\s*/;
const TRAILING_WHITESPACE = /\s*$/;

// Inline Markdown is exactly one paragraph; its inline children are the
// slice. Surrounding whitespace is kept for insertion into running text.
export const parseMarkdownInlineWithRuntime = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy = {}
): MarkdownSliceParseResult => {
  const diagnostics = new MarkdownDiagnostics();
  const trimmed = source.trim();
  const whitespace = (value: string): Descendant[] =>
    value ? [{ text: value }] : [];

  if (!trimmed) {
    if (reportByteLimit(source, options, diagnostics)) {
      return sliceParseFailure(diagnostics);
    }

    return Object.freeze({
      diagnostics: diagnostics.warnings(),
      ok: true,
      slice: ContentSlice.closed(whitespace(source)),
    });
  }
  const parsed = runParsedNodes(runtime, trimmed, options, diagnostics);

  if (!parsed || diagnostics.failure()) return sliceParseFailure(diagnostics);
  const blocks = normalizeDocumentChildren(runtime, parsed);
  const paragraphType = runtime.registry.type(PLUGINS.paragraph) ?? 'paragraph';
  const [block] = blocks;

  if (blocks.length !== 1 || block?.type !== paragraphType) {
    diagnostics.report({
      actual: blocks.length,
      code: 'markdown-inline-blocks',
      message:
        blocks.length > 1
          ? `Inline Markdown produced ${blocks.length} blocks. Use parseSlice for block content.`
          : `Inline Markdown produced a "${block?.type}" block. Use parseSlice for block content.`,
      severity: 'error',
    });

    return sliceParseFailure(diagnostics);
  }

  return Object.freeze({
    diagnostics: diagnostics.warnings(),
    ok: true,
    slice: ContentSlice.closed([
      ...whitespace(LEADING_WHITESPACE.exec(source)?.[0] ?? ''),
      ...block.children,
      ...whitespace(TRAILING_WHITESPACE.exec(source)?.[0] ?? ''),
    ]),
  });
};

export const serializeMarkdownWithRuntime = (
  runtime: MarkdownRuntime,
  document: EditorDocumentValue,
  options: MarkdownSerializePolicy = {},
  initialDiagnostics: readonly MarkdownDiagnostic[] = []
): MarkdownSerializeResult => {
  runtime.state.schema.assertDocument(document);
  const diagnostics = new MarkdownDiagnostics(initialDiagnostics);

  Object.keys(document.roots ?? {})
    .sort()
    .forEach((root) => {
      diagnostics.report({
        code: 'markdown-unsupported-root',
        message: `Semantic Markdown omits document root "${root}".`,
        root,
        severity: 'warning',
      });
    });
  Object.keys(document.meta ?? {})
    .filter((key) => key !== 'authored')
    .sort()
    .forEach((key) => {
      diagnostics.report({
        code: 'markdown-unsupported-metadata',
        key,
        message: `Semantic Markdown omits document metadata "${key}".`,
        severity: 'warning',
      });
    });
  const data = serializeMdWithRuntime(runtime, options, document, diagnostics);
  const failure = diagnostics.failure();

  if (failure) return Object.freeze({ diagnostics: failure, ok: false });

  return Object.freeze({
    data,
    diagnostics: diagnostics.warnings(),
    ok: true,
  });
};
