import { dequal } from 'dequal';
import type {
  Nodes,
  Paragraph,
  Parent,
  Root,
  RootContent as MdRootContent,
} from 'mdast';
import remarkParse from 'remark-parse';
import remarkStringify, {
  type Options as RemarkStringifyOptions,
} from 'remark-stringify';
import { type Processor, type Plugin as UnifiedPlugin, unified } from 'unified';

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
  type RootKey,
  type Text,
  TextApi,
} from '../../../core';
import { sameUpToListIds } from '../../../features/list/lib/listIdentity.internal';
import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
} from '../../../internal/plugin/compilePlateModel';
import {
  getMarkdownParagraphType,
  landsMarkdownParagraph,
  UNLANDED_MARKDOWN_PARAGRAPH_TYPE,
} from '../../../internal/plugin/markdownParagraph';
import {
  createContentFormatDocument,
  createPluginFormatRegistry,
} from '../../../internal/plugin/pluginFormatOperation';
import { createValidatedContentSlice } from '../../../internal/utils/trustedContentSlice';
import type { NormalizePluginState } from '../../../lib/plugin/PluginDefinition';
import { mdastToSlate } from '../deserializer/mdastToSlate';
import type { MarkdownPluginState } from '../MarkdownPlugin';
import { RawHtmlPlugin } from '../RawHtmlPlugin';
import { convertNodesSerialize } from '../serializer/convertNodesSerialize';
import { finishMarkdownLists } from '../serializer/listToMdastTree';
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
  blankMarkdownFrontmatter,
  BYTE_ORDER_MARK,
  hasMarkdownFrontmatterShape,
  isMarkdownFrontmatter,
  MARKDOWN_FRONTMATTER_KEY,
  opensMarkdownFrontmatterFence,
  readMarkdownFrontmatter,
  writeMarkdownFrontmatter,
} from './markdownFrontmatter';
import {
  findMarkdownRawHtml,
  getMarkdownParagraphLanding,
  isMarkdownHtmlComment,
  isRawHtmlFlow,
  rawHtmlPieceOf,
  remarkSeparateEscapes,
  writeBareUrlsSafely,
} from './markdownIntrinsics';
import {
  type CompiledMarkdownMappings,
  compileMarkdownMappings,
  getMarkdownMappingsRegistryKey,
  getRegisteredMarkdownMappings,
  registerMarkdownMappings,
} from './markdownMappings';
import { remarkHoldOpenTail } from './markdownOpenTail';
import {
  createRawHtmlPlacementDecider,
  decideRawHtmlBlocks,
  type MarkdownReader,
  printsNoText,
  type RawHtmlBlockRefusal,
} from './markdownRawHtml';
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
  getMarkdownTagRepair,
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
  const registry = createPluginFormatRegistry(
    (name) => getCompiledPlatePlugin(editor, name),
    (name) =>
      getCompiledPlateModelBinding(editor, name)?.elementType ?? undefined
  );

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

export const writesRawHtml = (
  runtime: MarkdownRuntime,
  plainMarks: readonly string[] | null | undefined
) =>
  runtime.registry.has(RawHtmlPlugin) &&
  !plainMarks?.includes(RawHtmlPlugin.name);

const importsRawHtml = (runtime: MarkdownRuntime) =>
  writesRawHtml(runtime, runtime.options.plainMarks);

export const getMergedOptionsSerialize = (
  runtime: MarkdownRuntime,
  options: MarkdownSerializePolicy = {},
  documentOverride?: MarkdownSerializeDocumentValue,
  diagnostics = new MarkdownDiagnostics(),
  readRoots = new Set<RootKey>()
): SerializeMdContext => {
  const { plainMarks, remarkPlugins, remarkStringifyOptions } = runtime.options;

  const document = documentOverride ?? runtime.state.value();
  const plain =
    options.plainMarks ?? (plainMarks ? [...plainMarks] : plainMarks);
  const context: SerializeMdContext = {
    ...createConversionContext(runtime),
    document,
    lossPolicy: options.lossPolicy ?? 'reject',
    mappings: runtime.formats,
    modelLocation: createMarkdownModelLocator(document),
    plainMarks: plain,
    preserveEmptyParagraphs: options.preserveEmptyParagraphs,
    ...(writesRawHtml(runtime, plain)
      ? {
          rawHtml: {
            decide: createRawHtmlPlacementDecider({
              commonmark: (source) => COMMONMARK.parse(source),
              editor: (source) => getRawHtmlEditorReader(runtime)(source),
            }),
          },
        }
      : {}),
    readRoots,
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
> &
  Readonly<{
    onHeldTail?: () => void;
  }>;

const createMarkdownParser = (
  runtime: MarkdownRuntime,
  remarkPlugins: DeserializeMdContext['remarkPlugins'],
  onHeldTail?: () => void
) =>
  unified()
    .use(remarkParse)
    .use(remarkSeparateEscapes)
    .use(remarkMarkdownTags, { tags: runtime.formats.tags })
    .use(remarkResolveMarkdownReferences)
    .use(onHeldTail ? [[remarkHoldOpenTail, onHeldTail]] : [])
    .use(remarkPlugins);

const COMMONMARK = unified().use(remarkParse).freeze();

// The editor keeps its compiled mappings while its plugins stay the same, so
// they key a reader that outlives one call. A copy clones the plugin state, so
// the remark plugins compare one by one.
const rawHtmlEditorReaders = new WeakMap<
  CompiledMarkdownMappings,
  Readonly<{ read: MarkdownReader; remarkPlugins: readonly unknown[] }>
>();

const getRawHtmlEditorReader = (runtime: MarkdownRuntime) => {
  const { remarkPlugins } = runtime.options;
  const cached = rawHtmlEditorReaders.get(runtime.formats);

  if (
    cached?.remarkPlugins.length === remarkPlugins.length &&
    cached.remarkPlugins.every(
      (plugin, index) => plugin === remarkPlugins[index]
    )
  ) {
    return cached.read;
  }
  const parser = createMarkdownParser(
    runtime,
    materializeRemarkPlugins(remarkPlugins)
  ).freeze();
  const read: MarkdownReader = (source) =>
    parser.runSync(parser.parse(source), source);

  rawHtmlEditorReaders.set(runtime.formats, { read, remarkPlugins });

  return read;
};

export const markdownToSlateNodesWithRuntime = (
  runtime: MarkdownRuntime,
  text: string,
  options: MarkdownParsePolicy = {},
  diagnostics = new MarkdownDiagnostics(),
  { onHeldTail, ...hooks }: MarkdownSegmentHooks = {},
  source = text
): Descendant[] => {
  const mergedOptions: DeserializeMdContext = {
    ...getMergedOptionsDeserialize(runtime, options, {
      diagnostics,
      positionsReferToSource: true,
      source,
    }),
    ...hooks,
  };

  return createMarkdownParser(
    runtime,
    mergedOptions.remarkPlugins,
    options.partial ? onHeldTail : undefined
  )
    .use(remarkToSlate, mergedOptions, importsRawHtml(runtime))
    .processSync(text).result;
};

declare module 'unified' {
  interface CompileResultMap {
    remarkToSlateNode: Descendant[];
  }
}

// This reads the parsed tree, not the source, because node positions count the
// raw source.
const readLineEndingsAsLf = (node: Nodes) => {
  if ('value' in node) node.value = node.value.replaceAll(/\r\n?/g, '\n');
  if ('alt' in node && node.alt) {
    node.alt = node.alt.replaceAll(/\r\n?/g, '\n');
  }
  if ('title' in node && node.title) {
    node.title = node.title.replaceAll(/\r\n?/g, '\n');
  }
  if ('children' in node) node.children.forEach(readLineEndingsAsLf);
  // mdast-util-gfm-task-list-item drops the first character of the item's
  // text, expecting the space after `[ ]`. When nothing but spaces follows
  // `[ ]` on its line, that character is a CRLF's CR, so its LF stays.
  if (node.type === 'listItem' && typeof node.checked === 'boolean') {
    const paragraph = node.children.find(
      (child): child is Paragraph => child.type === 'paragraph'
    );
    const head = paragraph?.children[0];

    if (head?.type === 'text' && head.value.startsWith('\n')) {
      head.value = head.value.slice(1);
      if (!head.value) paragraph?.children.shift();
    }
  }
};

type RemarkToSlateOptions = [DeserializeMdContext, marksRawHtml: boolean];

const remarkToSlate: UnifiedPlugin<RemarkToSlateOptions, Root, Descendant[]> =
  function (options, marksRawHtml) {
    this.compiler = (node, file) => {
      if (String(file).includes('\r')) readLineEndingsAsLf(node as Root);

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

      return mdastToSlate(
        node as Root,
        marksRawHtml
          ? { ...options, rawHtml: findMarkdownRawHtml(node as Root) }
          : options
      );
    };
  };

// mdast-util-math declares its `$` pattern with an `after` key even when that key
// is undefined, so mdast-util-to-markdown treats the escape as conditional and
// drops it before an escaped character: `x$*$y` writes `x$\*\$y`, which reads
// back as math. The same pattern without the key clears that condition.
const remarkEscapeDollars: UnifiedPlugin<[], Root> = function () {
  const data = this.data() as {
    toMarkdownExtensions?: Array<{
      unsafe?: Array<{ character?: string; inConstruct?: unknown }>;
    }>;
  };
  const extensions = data.toMarkdownExtensions ?? [];
  const escapesDollars = extensions.some((extension) =>
    extension.unsafe?.some(
      (pattern) =>
        pattern.character === '$' && pattern.inConstruct === 'phrasing'
    )
  );

  if (escapesDollars) {
    extensions.push({ unsafe: [{ character: '$', inConstruct: 'phrasing' }] });
  }
};

const createMarkdownStringifier = (
  context: SerializeMdContext,
  unwritable: MarkdownWriterExtension
) => {
  const app = context.remarkStringifyOptions;
  const { join: appJoin, ...appWithoutJoin } = app ?? {};

  return unified()
    .use(remarkMarkdownTagWriter)
    .use(context.remarkPlugins)
    .use(remarkEscapeDollars)
    .use(function remarkUnwritableNodeWriter(this: Processor) {
      const data = this.data() as { toMarkdownExtensions?: unknown[] };

      // After every plugin, so a plugin that replaces the list still gets it.
      (data.toMarkdownExtensions ??= []).push(unwritable);
    })
    .use(function remarkRawHtmlJoin(this: Processor) {
      if (!context.rawHtml) return;
      const settings = this.data('settings') ?? {};
      // remark-stringify spreads the app's options over the settings, so an
      // app's `join` key replaces the plugins' joins even when its value is
      // `undefined`.
      const join = app && Object.hasOwn(app, 'join') ? appJoin : settings.join;

      // The writer reads `join` from the end, so this one decides first:
      // outside a list's own items, an HTML block of marked text ends only at
      // a blank line.
      this.data('settings', {
        ...settings,
        join: [...(join ?? []), joinRawHtmlFlow],
      });
    })
    .use(remarkStringify, {
      emphasis: '_',
      resourceLink: false,
      ...(context.rawHtml ? appWithoutJoin : app),
    });
};

// Only a list, list item or quote can hold a flow piece that passes, so a join
// looks for one at a block's edge only through them.
const flowEdgeOf = (node: Nodes, edge: 'first' | 'last'): Nodes | undefined => {
  if (
    node.type !== 'blockquote' &&
    node.type !== 'list' &&
    node.type !== 'listItem'
  ) {
    return node;
  }
  const prints = (child: Nodes) => !printsNoText(child);
  const child =
    edge === 'first'
      ? node.children.find(prints)
      : node.children.findLast(prints);

  return child && flowEdgeOf(child, edge);
};

const joinRawHtmlFlow: NonNullable<RemarkStringifyOptions['join']>[number] = (
  left,
  right,
  parent
) =>
  // Each list item opens on a marker line, which ends the item before it, so
  // a tight list stays tight.
  parent.type !== 'list' &&
  [flowEdgeOf(left, 'last'), flowEdgeOf(right, 'first')].some(
    (node) => node !== undefined && isRawHtmlFlow(node)
  )
    ? 1
    : undefined;

const emptyRootStartsWithByteOrderMark = (context: SerializeMdContext) =>
  createMarkdownStringifier(context, {})
    .stringify({ children: [], type: 'root' })
    .startsWith(BYTE_ORDER_MARK);

const encodeMarkdownBody = (context: SerializeMdContext) => {
  const unwritable: MarkdownWriterExtension & {
    handlers: Record<string, (node: { type: string }) => string>;
  } = { handlers: {} };
  const toRemarkProcessor = createMarkdownStringifier(context, unwritable);
  const tree: Root = {
    children: convertNodesSerialize(context.value, context),
    type: 'root',
  };

  finishMarkdownLists(tree, context);
  cleanMarkdownDestinations(tree, {
    lossPolicy: context.lossPolicy,
    phase: 'serialize',
    report: context.report,
  });
  allocateMarkdownFootnoteLabels(tree, (label) =>
    context.report({
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

  const transformed = toRemarkProcessor.runSync(tree);

  writeBareUrlsSafely(transformed);
  const configuredWriters = new Set<string>();

  [
    ...(toRemarkProcessor.data('toMarkdownExtensions') ?? []),
    toRemarkProcessor.data('settings'),
    context.remarkStringifyOptions,
  ].forEach((extension) =>
    addMarkdownWriterKinds(configuredWriters, extension)
  );
  const writable = new Set([...COMMONMARK_WRITER_KINDS, ...configuredWriters]);
  const reportUnwritable = (nodeType: string) =>
    context.report({
      action: 'dropped',
      code: 'markdown-unsupported-node',
      impact: 'lossy',
      message: `Markdown cannot write "${nodeType}": no configured remark plugin serializes it.`,
      nodeType,
      owner: 'markdown',
      phase: 'serialize',
      severity: context.lossPolicy === 'allow' ? 'warning' : 'error',
    });

  // mdast-util-to-markdown's own writers write every child and read its
  // neighbors' output, so a child no writer handles leaves the tree before
  // they run. A configured writer may write its children itself, so a node
  // under one reports only when that writer reaches it.
  if (!configuredWriters.has('root')) {
    dropUnwritableMarkdownNodes(
      transformed,
      writable,
      configuredWriters,
      reportUnwritable
    );
  }
  addUnwritableMarkdownKinds(transformed, writable, (nodeType) => {
    unwritable.handlers[nodeType] = (node) => {
      reportUnwritable(node.type);

      return '';
    };
  });

  const written = transformed.children.filter(
    (node) => !Object.hasOwn(unwritable.handlers, node.type)
  );

  return {
    lastKind: written.findLast((node) => !printsNoText(node))?.type,
    processor: toRemarkProcessor,
    tree: transformed,
  };
};

const SETEXT_PROBE: Root = {
  children: [
    { children: [{ type: 'text', value: 'x' }], depth: 1, type: 'heading' },
  ],
  type: 'root',
};

// The writer merges `setext` from settings, options and extensions, so ask it.
const writesSetext = (
  processor: ReturnType<typeof createMarkdownStringifier>
) => processor.stringify(SETEXT_PROBE).includes('\n=');

const REFUSAL_ROUNDS = 3;

const holdsRawHtmlPiece = (node: Nodes): boolean =>
  rawHtmlPieceOf(node) !== undefined ||
  ('children' in node && node.children.some(holdsRawHtmlPiece));

const markedLeavesOf = (nodes: readonly Descendant[]): Text[] =>
  nodes.flatMap((node) =>
    TextApi.isText(node)
      ? node[RawHtmlPlugin.name] === true
        ? [node]
        : []
      : markedLeavesOf(node.children)
  );

type RawHtmlWriting = NonNullable<SerializeMdContext['rawHtml']>;

/**
 * Export and import both decide through it, so import marks only what export
 * writes back.
 */
const encodeRawHtmlBody = (
  context: SerializeMdContext,
  rawHtml: RawHtmlWriting,
  refused: RawHtmlWriting['refused'],
  previousKind: string | undefined,
  readSetext: (
    processor: ReturnType<typeof createMarkdownStringifier>
  ) => boolean
) => {
  const diagnostics = new MarkdownDiagnostics();
  const readRoots = new Set<RootKey>();
  const body = encodeMarkdownBody({
    ...context,
    // Each encode is a conversion of its own, so its list audit starts empty.
    operation: {},
    rawHtml: { ...rawHtml, refused },
    readRoots,
    report: diagnostics.report,
  });
  const holdsRawHtml = holdsRawHtmlPiece(body.tree);
  const options = {
    previousKind,
    setext: holdsRawHtml && readSetext(body.processor),
  };

  return {
    ...body,
    diagnostics,
    failing: holdsRawHtml
      ? decideRawHtmlBlocks(body.tree, rawHtml.decide, options)
      : [],
    holdsRawHtml,
    options,
    readRoots,
  };
};

// A mapping that copies marked leaves defeats refusal by object, so export then
// writes every marked text as text.
const copiesMarkedLeaf = (
  failing: readonly RawHtmlBlockRefusal[],
  document: ReadonlySet<Text>
) => failing.some(({ leaves }) => leaves.some((leaf) => !document.has(leaf)));

const sameTextProperties = (left: Text, right: Text) =>
  dequal({ ...left, text: '' }, { ...right, text: '' });

// Only a text next to an unmarked or dropped leaf can newly equal its neighbor.
const unmarkLeaves = (
  nodes: readonly Descendant[],
  leaves: ReadonlySet<Text>,
  dropped: ReadonlySet<Text>
): readonly Descendant[] => {
  const output: Descendant[] = [];
  let changed = false;
  let joinsUnmarked = false;

  for (const node of nodes) {
    let next: Descendant = node;
    let unmarked = false;

    if (!TextApi.isText(node)) {
      next = unmarkElement(node, leaves, dropped);
    } else if (dropped.has(node)) {
      changed = true;
      joinsUnmarked = true;
      continue;
    } else if (leaves.has(node)) {
      const { [RawHtmlPlugin.name]: _marked, ...text } = node;

      next = text;
      unmarked = true;
    }
    changed ||= next !== node;
    const previous = output.at(-1);

    if (
      (unmarked || joinsUnmarked) &&
      previous !== undefined &&
      TextApi.isText(previous) &&
      TextApi.isText(next) &&
      sameTextProperties(previous, next)
    ) {
      output[output.length - 1] = {
        ...previous,
        text: previous.text + next.text,
      };
      joinsUnmarked = true;
    } else {
      output.push(next);
      joinsUnmarked = unmarked;
    }
  }

  return changed ? output : nodes;
};

const unmarkElement = (
  element: Element,
  leaves: ReadonlySet<Text>,
  dropped: ReadonlySet<Text>
): Element => {
  const children = unmarkLeaves(element.children, leaves, dropped);

  if (children === element.children) return element;

  // An inline element that held only a dropped comment keeps an empty text,
  // as a link does without the plugin.
  return {
    ...element,
    children: children.length > 0 ? [...children] : [{ text: '' }],
  };
};

const textsOf = (nodes: readonly Descendant[]): Text[] =>
  nodes.flatMap((node) =>
    TextApi.isText(node) ? [node] : textsOf(node.children)
  );

// Without the plugin a comment drops, so an unmarked one drops too unless
// nothing but comments and whitespace would be left of its block's text.
const droppedCommentsOf = (
  nodes: readonly Descendant[],
  unmarked: ReadonlySet<Text>
): Text[] =>
  nodes.flatMap((node) => {
    if (TextApi.isText(node)) return [];
    if (!node.children.some((child) => TextApi.isText(child))) {
      return droppedCommentsOf(node.children, unmarked);
    }
    const texts = textsOf(node.children);
    const comments = texts.filter(
      (leaf) => unmarked.has(leaf) && isMarkdownHtmlComment(leaf.text)
    );

    return texts.some(
      (leaf) => !comments.includes(leaf) && /\S/.test(leaf.text)
    )
      ? comments
      : [];
  });

const unmarkBlocks = (
  blocks: readonly Element[],
  unmarked: ReadonlySet<Text>
) => {
  const dropped = new Set(droppedCommentsOf(blocks, unmarked));

  return blocks.map((block) => unmarkElement(block, unmarked, dropped));
};

/**
 * Unmarking leaves and dropping comments keep every block in its place, so one
 * decision is final.
 */
const keepWrittenRawHtml = (
  runtime: MarkdownRuntime,
  blocks: readonly Element[],
  {
    meta,
    roots,
  }: Readonly<{
    meta?: EditorDocumentValue['meta'];
    roots?: EditorDocumentValue['roots'];
  }> = {}
): readonly Element[] => {
  if (!importsRawHtml(runtime)) return blocks;
  const marked = markedLeavesOf(blocks);

  if (marked.length === 0) return blocks;
  const context = getMergedOptionsSerialize(
    runtime,
    {},
    createContentFormatDocument({ content: blocks, meta, roots })
  );
  const { rawHtml } = context;

  if (!rawHtml) return blocks;
  const document = new Set(marked);
  let failing: ReturnType<typeof encodeRawHtmlBody>['failing'];

  try {
    ({ failing } = encodeRawHtmlBody(
      context,
      rawHtml,
      undefined,
      undefined,
      writesSetext
    ));
  } catch (error) {
    try {
      encodeRawHtmlBody(context, rawHtml, 'all', undefined, writesSetext);
    } catch {
      // Export throws on these blocks with or without raw HTML.
      return unmarkBlocks(blocks, document);
    }
    throw error;
  }

  if (failing.length === 0) return blocks;

  return unmarkBlocks(
    blocks,
    copiesMarkedLeaf(failing, document)
      ? document
      : new Set(failing.flatMap(({ leaves }) => leaves))
  );
};

/**
 * With `RawHtmlPlugin` installed and its mark not in `plainMarks`, each block
 * of marked text decides on the tree
 * the writer prints, and the document encodes again with every leaf of each
 * failing block refused, so the writers escape that text as they escape any
 * text. A refused leaf can sit in another block too, so encoding repeats until
 * no block fails, for at most `REFUSAL_ROUNDS` rounds, because a chain of
 * blocks that share leaves would otherwise encode once per leaf. `previousKind` is the
 * type of the last root node the copied chunk before this one printed.
 */
const writeMarkdownBody = (
  context: SerializeMdContext,
  previousKind?: string
) => {
  const { rawHtml } = context;

  if (!rawHtml) {
    const { lastKind, processor, tree } = encodeMarkdownBody(context);

    return { data: processor.stringify(tree), holdsRawHtml: false, lastKind };
  }
  let setext: boolean | undefined;
  const encode = (refused?: ReadonlySet<Text> | 'all') =>
    encodeRawHtmlBody(context, rawHtml, refused, previousKind, (processor) => {
      setext ??= writesSetext(processor);

      return setext;
    });
  let body = encode();
  const documentLeaves = new Set(
    body.failing.length > 0
      ? markedLeavesOf([
          ...context.value,
          ...Object.values(context.document.roots ?? {}).flat(),
        ])
      : []
  );
  const report = ({ leaves, reason }: RawHtmlBlockRefusal) =>
    context.report({
      code: 'markdown-unsafe-content',
      impact: 'lossless',
      message: `Markdown raw HTML cannot be written as HTML at its place (${reason}); it was written as text.`,
      model: context.modelLocation(
        leaves.find((leaf) => documentLeaves.has(leaf)) ?? leaves[0]
      ),
      nodeType: 'html',
      phase: 'serialize',
      severity: 'warning',
    });
  const refused = new Set<Text>();

  for (let round = 0; body.failing.length > 0; round += 1) {
    const copied = copiesMarkedLeaf(body.failing, documentLeaves);

    if (copied || round === REFUSAL_ROUNDS) {
      const reason = copied ? 'copied-leaf' : 'shared-leaf';

      decideRawHtmlBlocks(
        body.tree,
        () => ({ ok: false, reason }),
        body.options
      ).forEach(report);
      body = encode('all');
      break;
    }
    for (const block of body.failing) {
      report(block);
      block.leaves.forEach((leaf) => refused.add(leaf));
    }
    body = encode(new Set(refused));
  }
  // Writers report while they print too.
  const data = body.processor.stringify(body.tree);

  body.diagnostics.all().forEach(context.report);
  body.readRoots.forEach((root) => context.readRoots.add(root));

  return {
    data,
    holdsRawHtml: body.holdsRawHtml,
    lastKind: body.lastKind,
  };
};

// mdast-util-to-markdown writes these CommonMark kinds itself and throws on any
// other kind no remark plugin registers a handler for.
const COMMONMARK_WRITER_KINDS = [
  'blockquote',
  'break',
  'code',
  'definition',
  'emphasis',
  'hardBreak',
  'heading',
  'html',
  'image',
  'imageReference',
  'inlineCode',
  'link',
  'linkReference',
  'list',
  'listItem',
  'paragraph',
  'root',
  'strong',
  'text',
  'thematicBreak',
];

type MarkdownWriterExtension = Readonly<{
  extensions?: readonly MarkdownWriterExtension[] | null;
  handlers?: object | null;
}>;

const addMarkdownWriterKinds = (
  kinds: Set<string>,
  extension: MarkdownWriterExtension | null | undefined
) => {
  extension?.extensions?.forEach((nested) =>
    addMarkdownWriterKinds(kinds, nested)
  );
  Object.keys(extension?.handlers ?? {}).forEach((kind) => kinds.add(kind));
};

const dropUnwritableMarkdownNodes = (
  parent: { children: Parent['children'] },
  writable: ReadonlySet<string>,
  configuredWriters: ReadonlySet<string>,
  report: (nodeType: string) => void
) => {
  parent.children = parent.children.filter((child) => {
    if (!writable.has(child.type)) {
      report(child.type);
      return false;
    }
    if ('children' in child && !configuredWriters.has(child.type)) {
      dropUnwritableMarkdownNodes(child, writable, configuredWriters, report);
    }
    return true;
  });
};

const addUnwritableMarkdownKinds = (
  parent: { children: Parent['children'] },
  known: Set<string>,
  add: (nodeType: string) => void
) => {
  for (const child of parent.children) {
    if (!known.has(child.type)) {
      known.add(child.type);
      add(child.type);
    }
    if ('children' in child) {
      addUnwritableMarkdownKinds(child, known, add);
    }
  }
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
  hooks?: MarkdownSegmentHooks,
  text = source
): Descendant[] | null => {
  if (reportByteLimit(source, options, diagnostics)) return null;
  if (
    landsMarkdownParagraph(runtime.registry) &&
    runtime.state.schema.element(UNLANDED_MARKDOWN_PARAGRAPH_TYPE)
  ) {
    reportUnlandedParagraph(
      diagnostics,
      `The schema declares "${UNLANDED_MARKDOWN_PARAGRAPH_TYPE}", which Markdown reserves for its own paragraph.`
    );

    return null;
  }

  try {
    return markdownToSlateNodesWithRuntime(
      runtime,
      previewSource(runtime, text, options),
      options,
      diagnostics,
      hooks,
      source
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
  ContentSlice.closed([
    ...keepWrittenRawHtml(runtime, normalizeDocumentChildren(runtime, parsed)),
  ]).content;

const convertMarkdownSource = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy,
  diagnostics: MarkdownDiagnostics,
  reuse?: MarkdownReuse,
  onHeldTail?: () => void
): MarkdownConversion => {
  const limits = markdownParseLimits(options);
  const limitsKey = JSON.stringify(limits);
  const lossPolicy = options.lossPolicy ?? 'reject';
  const full = (): MarkdownConversion => {
    const parsed = runParsedNodes(runtime, source, options, diagnostics, {
      onHeldTail,
    });
    const nodes = parsed && snapshotBlocks(runtime, parsed);

    return {
      checkpoint: reuse
        ? { limits: limitsKey, lossPolicy, segments: [], source }
        : null,
      nodes,
      unvalidated: nodes ?? [],
    };
  };

  // A segment would decide raw HTML without the blocks before it, so a
  // continued parse that marks raw HTML parses the whole source.
  if (
    !reuse?.previous ||
    importsRawHtml(runtime) ||
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

  // A parse without `partial` converts the whole source, because a remark
  // plugin may read the whole tree.
  if (!options.partial) {
    const fresh = full();

    if (!fresh.nodes || segments.length === 0) return fresh;
    const keptNodes = segments.flatMap((segment) => segment.nodes);
    const tail = fresh.nodes.slice(keptNodes.length);
    const nodes = Object.freeze([...keptNodes, ...tail]);

    return sameUpToListIds(nodes, fresh.nodes)
      ? {
          checkpoint: { limits: limitsKey, lossPolicy, segments, source },
          nodes,
          unvalidated: tail,
        }
      : fresh;
  }
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
        partial: end === source.length,
      },
      local,
      {
        onHeldTail,
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

  const boundaries = findMarkdownSegmentBoundaries(
    source,
    stableEnd,
    runtime.formats.tags
  );
  let nextTry = 0;

  for (const [index, boundary] of boundaries.entries()) {
    if (index < nextTry) continue;
    const segment = convertRange(boundary);

    if (!segment) return full();
    // A tag still open at the segment's end holds what follows, whatever the
    // scan counted. Only the last boundary tries again, because trying each one
    // inside a long open tag would parse its body once per boundary.
    if (getMarkdownTagRepair(segment.lastRoot ?? {})?.repair === 'unclosed') {
      nextTry = boundaries.length - 1;
      continue;
    }
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
  const paragraphType = getMarkdownParagraphType(runtime.registry);
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

const reportUnlandedParagraph = (
  diagnostics: MarkdownDiagnostics,
  message: string,
  path?: readonly number[]
) =>
  diagnostics.report({
    action: 'dropped',
    code: 'markdown-unsupported-node',
    impact: 'lossy',
    message,
    ...(path ? { model: Object.freeze({ path }) } : {}),
    nodeType: 'paragraph',
    owner: 'markdown',
    phase: 'parse',
    severity: 'error',
  });

const findMarkdownParagraph = (
  nodes: readonly Descendant[],
  path: readonly number[]
): readonly number[] | undefined => {
  for (const [index, node] of nodes.entries()) {
    if (!ElementApi.isElement(node)) continue;
    if (node.type === UNLANDED_MARKDOWN_PARAGRAPH_TYPE) return [...path, index];

    const found = findMarkdownParagraph(node.children, [...path, index]);

    if (found) return found;
  }

  return undefined;
};

const landMarkdownParagraphs = (
  runtime: MarkdownRuntime,
  children: readonly Element[],
  diagnostics: MarkdownDiagnostics
): Element[] => {
  const { schema } = runtime.state;

  return children.map((node, index) => {
    if (node.type !== UNLANDED_MARKDOWN_PARAGRAPH_TYPE) {
      const nested = findMarkdownParagraph(node.children, [index]);

      if (nested) {
        reportUnlandedParagraph(
          diagnostics,
          `No paragraph plugin is installed, so a Markdown paragraph inside "${node.type}" has no block to land in.`,
          nested
        );
      }

      return node;
    }

    const fallback = getMarkdownParagraphLanding(schema, index);

    if (
      !fallback ||
      node.children.some(
        (child) =>
          ElementApi.isElement(child) &&
          !schema.allowsElementType(fallback.type, child.type)
      )
    ) {
      reportUnlandedParagraph(
        diagnostics,
        `No paragraph plugin is installed, and the root's default block at position ${index} cannot hold a Markdown paragraph's text.`,
        [index]
      );

      return node;
    }

    const { children: inline, type: _type, ...properties } = node;
    const kept: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (schema.property({ key, placement: 'element', type: fallback.type })) {
        kept[key] = value;
        continue;
      }
      diagnostics.report({
        code: 'markdown-property-omitted',
        key,
        message: `Markdown paragraph property "${key}" is not declared on "${fallback.type}" and was omitted.`,
        model: Object.freeze({ path: [index], property: key }),
        owner: 'markdown',
        phase: 'parse',
        reason: 'unsupported',
        severity: 'warning',
      });
    }

    return { ...fallback, ...kept, children: inline };
  });
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
  const frontmatter = readMarkdownFrontmatter(source);
  const parsed = runParsedNodes(
    runtime,
    source,
    options,
    diagnostics,
    {},
    frontmatter ? blankMarkdownFrontmatter(source, frontmatter.end) : source
  );

  if (!parsed || diagnostics.failure()) {
    return documentParseFailure(diagnostics);
  }
  // Normalized top-level blocks are elements. Fitting copies them, so a
  // document parse needs no frozen snapshot.
  const children = normalizeDocumentChildren(runtime, parsed);
  const input = Object.freeze({
    children: landsMarkdownParagraph(runtime.registry)
      ? landMarkdownParagraphs(runtime, children, diagnostics)
      : children,
    ...(frontmatter
      ? {
          meta: {
            [MARKDOWN_FRONTMATTER_KEY]: {
              format: frontmatter.format,
              value: frontmatter.value,
            },
          },
        }
      : {}),
  });

  if (diagnostics.failure()) return documentParseFailure(diagnostics);
  let document: EditorDocumentValue;

  const invalid = (error: unknown) => {
    reportSchemaInvalid(error, diagnostics);

    return documentParseFailure(diagnostics);
  };

  try {
    document = fitMarkdownDocument(runtime, input, options, diagnostics);
    if (diagnostics.failure()) return documentParseFailure(diagnostics);
  } catch (error) {
    return invalid(error);
  }
  const blocks = keepWrittenRawHtml(runtime, document.children, document);

  if (blocks !== document.children) {
    document = { ...document, children: [...blocks] };
  }
  try {
    runtime.state.schema.assertDocument(document);
  } catch (error) {
    return invalid(error);
  }

  return Object.freeze({
    diagnostics: diagnostics.warnings(),
    document,
    ok: true,
  });
};

const parseMarkdownSlice = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy,
  reuse?: MarkdownReuse,
  onHeldTail?: () => void
): MarkdownSliceParseResult => {
  const diagnostics = new MarkdownDiagnostics();
  const conversion = convertMarkdownSource(
    runtime,
    source,
    options,
    diagnostics,
    reuse,
    onHeldTail
  );

  if (!conversion.nodes || diagnostics.failure()) {
    return sliceParseFailure(diagnostics);
  }

  const unlanded =
    landsMarkdownParagraph(runtime.registry) &&
    findMarkdownParagraph(conversion.nodes, []);

  if (unlanded) {
    reportUnlandedParagraph(
      diagnostics,
      'No paragraph plugin is installed, and only a document parse lands a Markdown paragraph.',
      unlanded
    );

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

export const parseMarkdownSliceWithRuntime = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy = {},
  reuse?: MarkdownReuse
): MarkdownSliceParseResult => {
  // micromark's offsets skip a byte order mark that starts the source, so the
  // held tail cannot read a fresh preview's tree.
  if (options.partial && !source.startsWith(BYTE_ORDER_MARK)) {
    let held = false;
    const preview = parseMarkdownSlice(runtime, source, options, reuse, () => {
      held = true;
    });

    if (preview.ok || !held) return preview;
  }

  return parseMarkdownSlice(runtime, source, options, reuse);
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
  const [block] = blocks;

  if (
    blocks.length !== 1 ||
    block?.type !== getMarkdownParagraphType(runtime.registry)
  ) {
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
  // The decision reads the paragraph the slice lands as, spaces included.
  const paragraph = {
    ...block,
    children: [
      ...whitespace(LEADING_WHITESPACE.exec(source)?.[0] ?? ''),
      ...block.children,
      ...whitespace(TRAILING_WHITESPACE.exec(source)?.[0] ?? ''),
    ],
  };
  const [kept = paragraph] = keepWrittenRawHtml(runtime, [paragraph]);

  return Object.freeze({
    diagnostics: diagnostics.warnings(),
    ok: true,
    slice: ContentSlice.closed(kept.children),
  });
};

type MarkdownFrontmatterOmitted = Extract<
  MarkdownDiagnostic,
  { code: 'markdown-frontmatter-omitted' }
>;

const writeStoredMarkdownFrontmatter = (
  document: EditorDocumentValue
):
  | Readonly<{ block: string }>
  | Readonly<{ reason: MarkdownFrontmatterOmitted['reason'] }>
  | null => {
  const stored = document.meta?.[MARKDOWN_FRONTMATTER_KEY];

  if (stored === undefined) return null;
  if (!hasMarkdownFrontmatterShape(stored)) return { reason: 'shape' };
  if (!isMarkdownFrontmatter(stored)) return { reason: 'format' };

  const block = writeMarkdownFrontmatter(stored);

  return block === null ? { reason: 'unreadable' } : { block };
};

const FRONTMATTER_OMITTED_MESSAGES: Record<
  MarkdownFrontmatterOmitted['reason'],
  string
> = {
  format: 'its format is neither "yaml" nor "toml"',
  shape:
    'it is not an object of exactly a string "format" and a string "value"',
  unreadable: 'the written block would not read back as the same value',
};

const withoutElementIds = (nodes: readonly Descendant[]): Descendant[] =>
  nodes.map((node) => {
    if (!ElementApi.isElement(node)) return node;

    const { id: _id, ...kept } = node;

    return { ...kept, children: withoutElementIds(node.children) };
  });

const isFittedEmptyDocument = (
  runtime: MarkdownRuntime,
  document: EditorDocumentValue
) => {
  const fitted = runtime.state.schema.fitDocument({ children: [] }).children;

  if (document.children.length !== fitted.length) return false;

  const comparable = (children: readonly Descendant[]) =>
    runtime.elementId ? withoutElementIds(children) : children;

  return dequal(comparable(document.children), comparable(fitted));
};

// mdast types name only `yaml`; remark-frontmatter's TOML preset emits `toml`.
const isFrontmatterKind = (kind: string | undefined) =>
  kind === 'yaml' || kind === 'toml';

/**
 * Reads the output as a UTF-8 file gives it back: each lone surrogate
 * replaced, with and without the byte-order mark a file read may drop.
 */
const readsBackMarkdownFrontmatter = (
  runtime: MarkdownRuntime,
  context: SerializeMdContext,
  data: string
) => {
  const readsBlock = (form: string) => {
    if (!opensMarkdownFrontmatterFence(form)) return false;

    const file = form.toWellFormed();

    if (readMarkdownFrontmatter(file)) return true;
    if (context.remarkPlugins.length === 0) return false;

    return isFrontmatterKind(
      createMarkdownParser(runtime, context.remarkPlugins).parse(file)
        .children[0]?.type
    );
  };

  return (
    readsBlock(data) ||
    (data.startsWith(BYTE_ORDER_MARK) && readsBlock(data.slice(1)))
  );
};

const writeMarkdownDocument = (
  runtime: MarkdownRuntime,
  context: SerializeMdContext,
  frontmatter: string | null
) => {
  if (
    frontmatter !== null &&
    isFittedEmptyDocument(runtime, context.document)
  ) {
    return `${emptyRootStartsWithByteOrderMark(context) ? BYTE_ORDER_MARK : ''}${frontmatter}`;
  }

  const { data, holdsRawHtml, lastKind } = writeMarkdownBody(context);
  const insertAfterRootByteOrderMark = (text: string, body: string) => {
    const rootMarkLength =
      body.startsWith(BYTE_ORDER_MARK) &&
      emptyRootStartsWithByteOrderMark(context)
        ? 1
        : 0;

    return `${body.slice(0, rootMarkLength)}${text}${body.slice(rootMarkLength)}`;
  };

  if (frontmatter !== null) {
    // A reader without front matter reads `+++` as paragraph text, which
    // neither an HTML block of a tag outside CommonMark's block list, such as
    // `<span>`, nor an ordered list that starts past 1 can interrupt.
    return insertAfterRootByteOrderMark(
      holdsRawHtml ? `${frontmatter}\n` : frontmatter,
      data
    );
  }
  if (!readsBackMarkdownFrontmatter(runtime, context, data)) return data;

  // mdast-util-to-markdown adds a final line ending only when the output lacks
  // one, so a body that ends in raw HTML may end in the HTML's line ending.
  const bodyLessFinalLineEnding =
    lastKind !== 'html' && data.endsWith('\n') ? data.slice(0, -1) : data;

  return insertAfterRootByteOrderMark('\n', bodyLessFinalLineEnding);
};

export const serializeMarkdownWithRuntime = (
  runtime: MarkdownRuntime,
  document: EditorDocumentValue,
  options: MarkdownSerializePolicy = {},
  initialDiagnostics: readonly MarkdownDiagnostic[] = []
): MarkdownSerializeResult => {
  runtime.state.schema.assertDocument(document);
  const readRoots = new Set<RootKey>();
  const serialized = new MarkdownDiagnostics();
  const frontmatter = writeStoredMarkdownFrontmatter(document);
  const data = writeMarkdownDocument(
    runtime,
    getMergedOptionsSerialize(
      runtime,
      options,
      document,
      serialized,
      readRoots
    ),
    frontmatter && 'block' in frontmatter ? frontmatter.block : null
  );
  const diagnostics = new MarkdownDiagnostics(initialDiagnostics);

  Object.keys(document.roots ?? {})
    .filter((root) => !readRoots.has(root))
    .sort()
    .forEach((root) => {
      diagnostics.report({
        code: 'markdown-unsupported-root',
        message: `Semantic Markdown omits document root "${root}".`,
        root,
        severity: 'warning',
      });
    });
  if (frontmatter && 'reason' in frontmatter) {
    diagnostics.report({
      code: 'markdown-frontmatter-omitted',
      impact: 'lossy',
      message: `Markdown omits the front matter block at document metadata "${MARKDOWN_FRONTMATTER_KEY}": ${FRONTMATTER_OMITTED_MESSAGES[frontmatter.reason]}.`,
      reason: frontmatter.reason,
      severity: options.lossPolicy === 'allow' ? 'warning' : 'error',
    });
  }
  Object.keys(document.meta ?? {})
    .filter((key) => key !== 'authored' && key !== MARKDOWN_FRONTMATTER_KEY)
    .sort()
    .forEach((key) => {
      diagnostics.report({
        code: 'markdown-unsupported-metadata',
        key,
        message: `Semantic Markdown omits document metadata "${key}".`,
        severity: 'warning',
      });
    });
  serialized.all().forEach(diagnostics.report);

  return finishMarkdownSerialize(data, diagnostics);
};

export const serializeMarkdownSliceWithRuntime = (
  runtime: MarkdownRuntime,
  children: Element[],
  roots?: ContentSlice['roots'],
  previousKind?: string
) => {
  const diagnostics = new MarkdownDiagnostics();
  const { data, lastKind } = writeMarkdownBody(
    getMergedOptionsSerialize(
      runtime,
      {},
      createContentFormatDocument({ content: children, roots }),
      diagnostics
    ),
    previousKind
  );

  return { lastKind, result: finishMarkdownSerialize(data, diagnostics) };
};

const finishMarkdownSerialize = (
  data: string,
  diagnostics: MarkdownDiagnostics
): MarkdownSerializeResult => {
  const failure = diagnostics.failure();

  if (failure) return Object.freeze({ diagnostics: failure, ok: false });

  return Object.freeze({
    data,
    diagnostics: diagnostics.warnings(),
    ok: true,
  });
};
