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
  ElementApi,
  ElementIdPlugin,
  type MarkdownPluginRegistry,
  PLUGINS,
  TextApi,
} from '../../../core';
import { getCompiledPlatePlugin } from '../../../internal/plugin/compilePlateModel';
import type { NormalizePluginState } from '../../../lib/plugin/PluginDefinition';
import { mdastToSlate } from '../deserializer/mdastToSlate';
import { htmlToJsx } from '../deserializer/utils/htmlToJsx';
import { splitIncompleteMdx } from '../deserializer/utils/splitIncompleteMdx';
import { stripMarkdownBlocks } from '../deserializer/utils/stripMarkdown';
import type { MarkdownPluginState } from '../MarkdownPlugin';
import { intrinsicRules } from '../rules/intrinsicRules';
import { convertNodesSerialize } from '../serializer/convertNodesSerialize';
import type {
  DeserializeMdContext,
  MarkdownDiagnostic,
  MarkdownDocumentParseResult,
  MarkdownConversionContext,
  MarkdownNodeName,
  MarkdownParsePolicy,
  MarkdownSerializePolicy,
  MarkdownSerializeResult,
  MarkdownSliceParseResult,
  SerializeMdContext,
} from '../types';
import {
  getRemarkPluginsWithoutMdx,
  getRemarkPluginsForSerialize,
  materializeMarkdownSettings,
  materializeRemarkPlugins,
} from '../utils/getRemarkPluginsWithoutMdx';
import {
  checkMarkdownTreeLimits,
  createMarkdownModelLocator,
  createMarkdownSourceLocation,
  DEFAULT_MARKDOWN_PARSE_LIMITS,
  MarkdownDiagnostics,
  MarkdownPluginConfigurationError,
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

export type MarkdownRuntimeState = NormalizePluginState<MarkdownPluginState>;

type MarkdownRuntimeEditorState = EditorCoreStateView;

type MarkdownRuntimeOptions = Readonly<{
  allowedNodes: readonly MarkdownNodeName[] | null;
  allowNode?: MarkdownRuntimeState['allowNode'];
  disallowedNodes: readonly MarkdownNodeName[] | null;
  plainMarks: readonly MarkdownNodeName[] | null;
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
  const { allowedNodes, allowNode, disallowedNodes, remarkPlugins } =
    runtime.options;
  const diagnostics = operation.diagnostics ?? new MarkdownDiagnostics();
  const source = operation.source ?? '';

  const context: DeserializeMdContext = {
    allowedNodes:
      options.allowedNodes ?? (allowedNodes ? [...allowedNodes] : allowedNodes),
    allowNode: options.allowNode ?? allowNode,
    disallowedNodes:
      options.disallowedNodes ??
      (disallowedNodes ? [...disallowedNodes] : disallowedNodes),
    ...createConversionContext(runtime),
    limits: Object.freeze({
      ...DEFAULT_MARKDOWN_PARSE_LIMITS,
      ...options.limits,
    }),
    lossPolicy: options.lossPolicy ?? 'reject',
    preserveEmptyParagraphs: options.preserveEmptyParagraphs,
    recovery: options.recovery,
    remarkPlugins: options.withoutMdx
      ? getRemarkPluginsWithoutMdx(options.remarkPlugins ?? remarkPlugins)
      : materializeRemarkPlugins(options.remarkPlugins ?? remarkPlugins),
    report: diagnostics.report,
    rules: {
      ...intrinsicRules,
      ...runtime.formats.rules,
    },
    compiledMappings: runtime.formats,
    ...(runtime.elementId ? { elementIds: true } : {}),
    sourceLocation: (node) =>
      createMarkdownSourceLocation(
        node,
        source,
        operation.positionsReferToSource ?? false
      ),
    state: runtime.state,
    splitLineBreaks: options.splitLineBreaks,
    withoutMdx: options.withoutMdx,
  };

  return context;
};

export const getMergedOptionsSerialize = (
  runtime: MarkdownRuntime,
  options: MarkdownSerializePolicy = {},
  documentOverride?: MarkdownSerializeDocumentValue,
  diagnostics = new MarkdownDiagnostics()
): SerializeMdContext => {
  const {
    allowedNodes,
    allowNode,
    disallowedNodes,
    plainMarks,
    remarkPlugins,
    remarkStringifyOptions,
  } = runtime.options;

  const document = documentOverride ?? runtime.state.value();
  const withBlockId = options.withBlockId ?? false;

  if (withBlockId && !runtime.elementId) {
    throw new Error(
      'Markdown withBlockId requires ElementIdPlugin in the editor.'
    );
  }
  const context: SerializeMdContext = {
    allowedNodes:
      options.allowedNodes ?? (allowedNodes ? [...allowedNodes] : allowedNodes),
    allowNode: options.allowNode ?? allowNode,
    disallowedNodes:
      options.disallowedNodes ??
      (disallowedNodes ? [...disallowedNodes] : disallowedNodes),
    ...createConversionContext(runtime),
    document,
    lossPolicy: options.lossPolicy ?? 'reject',
    modelLocation: createMarkdownModelLocator(document),
    plainMarks:
      options.plainMarks ?? (plainMarks ? [...plainMarks] : plainMarks),
    preserveEmptyParagraphs: options.preserveEmptyParagraphs,
    remarkPlugins: getRemarkPluginsForSerialize(
      options.remarkPlugins ?? remarkPlugins
    ),
    remarkStringifyOptions:
      options.remarkStringifyOptions ??
      (remarkStringifyOptions
        ? materializeMarkdownSettings(remarkStringifyOptions)
        : remarkStringifyOptions),
    report: diagnostics.report,
    rules: {
      ...intrinsicRules,
      ...runtime.formats.rules,
    },
    spread: options.spread,
    state: runtime.state,
    value: [...document.children],
    withBlockId,
    ...(runtime.elementId ? { blockId: runtime.elementId } : {}),
  };

  return context;
};

const LEADING_SPACES_REGEX = /^\s*/;
const TRAILING_SPACES_REGEX = /\s*$/;

export const markdownToAstProcessorWithRuntime = (
  runtime: MarkdownRuntime,
  data: string,
  options: MarkdownParsePolicy = {}
) => {
  const mergedOptions = getMergedOptionsDeserialize(runtime, options);

  return unified()
    .use(remarkParse)
    .use(mergedOptions.remarkPlugins ?? [])
    .parse(data);
};

export const markdownToSlateNodesWithRuntime = (
  runtime: MarkdownRuntime,
  data: string,
  options: MarkdownParsePolicy = {},
  diagnostics = new MarkdownDiagnostics()
): Descendant[] => {
  const processedData = options.withoutMdx ? data : htmlToJsx(data);
  const mergedOptions = getMergedOptionsDeserialize(runtime, options, {
    diagnostics,
    positionsReferToSource: processedData === data,
    source: data,
  });
  const toSlateProcessor = unified()
    .use(remarkParse)
    .use(mergedOptions.remarkPlugins ?? [])
    .use(remarkToSlate, mergedOptions);

  return toSlateProcessor.processSync(processedData).result;
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

export const deserializeInlineMdWithRuntime = (
  runtime: MarkdownRuntime,
  text: string,
  options: MarkdownParsePolicy = {},
  diagnostics = new MarkdownDiagnostics(),
  operation: Readonly<{ requireSingleBlock?: boolean }> = {}
) => {
  const trimmedText = text.trim();
  const leadingSpaces = LEADING_SPACES_REGEX.exec(text)?.[0] || '';
  const trailingSpaces = TRAILING_SPACES_REGEX.exec(text)?.[0] || '';
  const strippedText = stripMarkdownBlocks(trimmedText);

  if (!strippedText) return text ? [{ text }] : [];

  const fragment: Descendant[] = [];

  if (leadingSpaces) fragment.push({ text: leadingSpaces });

  const results = markdownToSlateNodesWithRuntime(
    runtime,
    strippedText,
    options,
    diagnostics
  );

  if (operation.requireSingleBlock && results.length > 1) {
    diagnostics.report({
      actual: results.length,
      code: 'markdown-inline-blocks',
      message: `Inline Markdown produced ${results.length} blocks. Use parseSlice for block content.`,
      severity: 'error',
    });

    return [];
  }
  const result = results[0];

  if (result) {
    fragment.push(
      ...(ElementApi.isElement(result) ? result.children : [result])
    );
  }
  if (trailingSpaces) fragment.push({ text: trailingSpaces });

  return fragment;
};

const isPlainTextNode = (node: unknown): node is { text: string } =>
  TextApi.isText(node) && Object.keys(node).every((key) => key === 'text');

const isSplitInsideTableRow = (completeString: string) =>
  completeString.slice(completeString.lastIndexOf('\n') + 1).includes('|');

const markdownToSlateNodesWithoutMdx = (
  runtime: MarkdownRuntime,
  data: string,
  options: MarkdownParsePolicy = {},
  diagnostics = new MarkdownDiagnostics()
) =>
  markdownToSlateNodesWithRuntime(
    runtime,
    data,
    {
      ...options,
      withoutMdx: true,
    },
    diagnostics
  );

const markdownToSlateNodesWithMdxFallback = (
  runtime: MarkdownRuntime,
  data: string,
  options: MarkdownParsePolicy = {},
  diagnostics = new MarkdownDiagnostics()
) => {
  try {
    return markdownToSlateNodesWithRuntime(runtime, data, options, diagnostics);
  } catch (error) {
    if (
      error instanceof MarkdownPluginConfigurationError ||
      error instanceof ReportedMarkdownFailureError
    ) {
      throw error;
    }

    return markdownToSlateNodesWithoutMdx(runtime, data, options, diagnostics);
  }
};

const appendInlineNodesToLastTextContainer = (
  runtime: MarkdownRuntime,
  node: unknown,
  inlineNodes: readonly Descendant[]
): Element | null => {
  if (!ElementApi.isElement(node) || runtime.state.schema.isVoid(node)) {
    return null;
  }

  const paragraphType = runtime.registry.type(PLUGINS.paragraph) ?? 'paragraph';

  if (
    node.type === paragraphType ||
    node.children.some((child) => TextApi.isText(child))
  ) {
    const lastChild = node.children.at(-1);

    if (
      isPlainTextNode(lastChild) &&
      inlineNodes.every((inlineNode) => isPlainTextNode(inlineNode))
    ) {
      return {
        ...node,
        children: [
          ...node.children.slice(0, -1),
          {
            ...lastChild,
            text:
              lastChild.text +
              inlineNodes.map((inlineNode) => inlineNode.text).join(''),
          },
        ],
      };
    }

    return {
      ...node,
      children: [...node.children, ...inlineNodes],
    };
  }

  for (let i = node.children.length - 1; i >= 0; i--) {
    const child = appendInlineNodesToLastTextContainer(
      runtime,
      node.children[i],
      inlineNodes
    );

    if (child) {
      return {
        ...node,
        children: [
          ...node.children.slice(0, i),
          child,
          ...node.children.slice(i + 1),
        ],
      };
    }
  }

  return null;
};

export const markdownToSlateNodesSafelyWithRuntime = (
  runtime: MarkdownRuntime,
  data: string,
  options: MarkdownParsePolicy = {},
  diagnostics = new MarkdownDiagnostics()
) => {
  const result = splitIncompleteMdx(data);

  if (!Array.isArray(result)) {
    return markdownToSlateNodesWithoutMdx(runtime, data, options, diagnostics);
  }

  const [completeString, incompleteString] = result;
  const incompleteNodes = deserializeInlineMdWithRuntime(
    runtime,
    incompleteString,
    { ...options, withoutMdx: true },
    diagnostics
  );
  const completeNodes = markdownToSlateNodesWithMdxFallback(
    runtime,
    completeString,
    options,
    diagnostics
  );
  const paragraphType = runtime.registry.type(PLUGINS.paragraph) ?? 'paragraph';
  const newBlock = {
    children: incompleteNodes,
    type: paragraphType,
  };

  if (completeNodes.length === 0) return [newBlock];

  const lastBlock = completeNodes.at(-1);

  if (
    ElementApi.isElement(lastBlock) &&
    runtime.state.schema.isVoid(lastBlock)
  ) {
    return [...completeNodes, newBlock];
  }

  const tableType = runtime.registry.type(PLUGINS.table) ?? 'table';

  if (ElementApi.isElement(lastBlock) && lastBlock.type === tableType) {
    if (isSplitInsideTableRow(completeString)) {
      const withoutMdxNodes = markdownToSlateNodesWithoutMdx(
        runtime,
        data,
        options,
        diagnostics
      );
      const tableOrdinal = completeNodes
        .filter((node) => ElementApi.isElement(node) && node.type === tableType)
        .indexOf(lastBlock);
      let fallbackTableIndex = -1;
      let seenTables = -1;

      for (const [index, node] of withoutMdxNodes.entries()) {
        if (ElementApi.isElement(node) && node.type === tableType) {
          seenTables += 1;

          if (seenTables === tableOrdinal) {
            fallbackTableIndex = index;
            break;
          }
        }
      }

      if (fallbackTableIndex !== -1) {
        return [
          ...completeNodes.slice(0, -1),
          ...withoutMdxNodes.slice(fallbackTableIndex),
        ];
      }
    }

    return [...completeNodes, newBlock];
  }

  if (ElementApi.isElement(lastBlock)) {
    const appendedBlock = appendInlineNodesToLastTextContainer(
      runtime,
      lastBlock,
      incompleteNodes
    );

    if (appendedBlock) {
      return [...completeNodes.slice(0, -1), appendedBlock];
    }
  }

  return completeNodes;
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
    .use(remarkPlugins ?? [])
    .use(remarkStringify, {
      emphasis: '_',
      resourceLink: false,
      ...mergedOptions.remarkStringifyOptions,
    });
  const tree: Root = {
    children: convertNodesSerialize(value, mergedOptions, true),
    type: 'root',
  };

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

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const reportInvalidSource = (
  error: unknown,
  diagnostics: MarkdownDiagnostics
) => {
  diagnostics.report({
    code: 'markdown-invalid-source',
    message: `Markdown could not be parsed: ${errorMessage(error)}`,
    reason: 'parser-failure',
    severity: 'error',
  });
};

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
      source,
      options,
      diagnostics
    );
  } catch (error) {
    if (error instanceof MarkdownPluginConfigurationError) throw error;
    if (error instanceof ReportedMarkdownFailureError) return null;
    if (options.recovery !== 'incomplete-stream') {
      reportInvalidSource(error, diagnostics);

      return null;
    }

    try {
      const output = markdownToSlateNodesSafelyWithRuntime(
        runtime,
        source,
        options,
        diagnostics
      );

      diagnostics.report({
        code: 'markdown-fallback',
        message: 'Incomplete Markdown was preserved with streaming recovery.',
        reason: 'incomplete-stream',
        severity: 'warning',
      });

      return output;
    } catch (fallbackError) {
      if (fallbackError instanceof MarkdownPluginConfigurationError) {
        throw fallbackError;
      }
      if (fallbackError instanceof ReportedMarkdownFailureError) return null;
      reportInvalidSource(fallbackError, diagnostics);

      return null;
    }
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
  const document = fitMarkdownDocument(runtime, input, options, diagnostics);

  if (diagnostics.failure()) return documentParseFailure(diagnostics);

  try {
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

export const parseMarkdownInlineWithRuntime = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy = {}
): MarkdownSliceParseResult => {
  const diagnostics = new MarkdownDiagnostics();

  if (reportByteLimit(source, options, diagnostics)) {
    return sliceParseFailure(diagnostics);
  }
  let content: Descendant[];

  try {
    content = deserializeInlineMdWithRuntime(
      runtime,
      source,
      options,
      diagnostics,
      { requireSingleBlock: true }
    );
  } catch (error) {
    if (error instanceof MarkdownPluginConfigurationError) throw error;
    if (error instanceof ReportedMarkdownFailureError) {
      return sliceParseFailure(diagnostics);
    }
    if (options.recovery !== 'incomplete-stream') {
      reportInvalidSource(error, diagnostics);

      return sliceParseFailure(diagnostics);
    }
    try {
      content = deserializeInlineMdWithRuntime(
        runtime,
        source,
        { ...options, withoutMdx: true },
        diagnostics,
        { requireSingleBlock: true }
      );
      diagnostics.report({
        code: 'markdown-fallback',
        message:
          'Incomplete inline Markdown was preserved with streaming recovery.',
        reason: 'incomplete-stream',
        severity: 'warning',
      });
    } catch (fallbackError) {
      if (fallbackError instanceof MarkdownPluginConfigurationError) {
        throw fallbackError;
      }
      if (!(fallbackError instanceof ReportedMarkdownFailureError)) {
        reportInvalidSource(fallbackError, diagnostics);
      }

      return sliceParseFailure(diagnostics);
    }
  }
  if (diagnostics.failure()) return sliceParseFailure(diagnostics);
  const slice = ContentSlice.closed(content);

  return Object.freeze({
    diagnostics: diagnostics.warnings(),
    ok: true,
    slice,
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
