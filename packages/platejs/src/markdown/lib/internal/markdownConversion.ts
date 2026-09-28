import type { Root } from 'mdast';
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
} from '../../../core';
import { getCompiledPlatePlugin } from '../../../internal/plugin/compilePlateModel';
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

export const markdownToSlateNodesWithRuntime = (
  runtime: MarkdownRuntime,
  data: string,
  options: MarkdownParsePolicy = {},
  diagnostics = new MarkdownDiagnostics()
): Descendant[] => {
  const mergedOptions = getMergedOptionsDeserialize(runtime, options, {
    diagnostics,
    positionsReferToSource: true,
    source: data,
  });
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
      if (!checkMarkdownTreeLimits(node, options.limits, options.report)) {
        throw new ReportedMarkdownFailureError();
      }

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

  allocateMarkdownFootnoteLabels(tree, (label) =>
    diagnostics.report({
      action: 'replaced',
      code: 'markdown-unsupported-node',
      message: `Footnote reference "${label}" has no definition in the output and reads back as text.`,
      nodeType: 'footnoteReference',
      owner: 'markdown',
      phase: 'serialize',
      severity: 'warning',
    })
  );

  return toRemarkProcessor.stringify(toRemarkProcessor.runSync(tree) as Root);
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
  diagnostics: MarkdownDiagnostics
): Descendant[] | null => {
  if (reportByteLimit(source, options, diagnostics)) return null;

  try {
    return markdownToSlateNodesWithRuntime(
      runtime,
      previewSource(runtime, source, options),
      options,
      diagnostics
    );
  } catch (error) {
    if (error instanceof ReportedMarkdownFailureError) return null;
    throw error;
  }
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
  const input = Object.freeze({
    children: normalizeDocumentChildren(runtime, parsed),
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
  options: MarkdownParsePolicy = {}
): MarkdownSliceParseResult => {
  const diagnostics = new MarkdownDiagnostics();
  const parsed = runParsedNodes(runtime, source, options, diagnostics);

  if (!parsed || diagnostics.failure()) return sliceParseFailure(diagnostics);
  const slice = ContentSlice.closed(normalizeDocumentChildren(runtime, parsed));

  try {
    runtime.state.schema.assertFragment(slice.content);
  } catch (error) {
    reportSchemaInvalid(error, diagnostics);

    return sliceParseFailure(diagnostics);
  }

  return Object.freeze({
    diagnostics: diagnostics.warnings(),
    ok: true,
    slice,
  });
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
