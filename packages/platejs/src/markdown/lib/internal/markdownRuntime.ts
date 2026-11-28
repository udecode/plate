import { dequal } from 'dequal';
import type { Root } from 'mdast';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { type Processor, type Plugin as UnifiedPlugin, unified } from 'unified';

import type {
  Editor,
  EditorCoreStateView,
  MarkdownPluginRegistry,
  RootKey,
} from '../../../core';
import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
} from '../../../internal/plugin/compilePlateModel';
import { createPluginFormatRegistry } from '../../../internal/plugin/pluginFormatOperation';
import type { NormalizePluginState } from '../../../lib/plugin/PluginDefinition';
import type { MarkdownPluginState } from '../MarkdownPlugin';
import type {
  DeserializeMdContext,
  MarkdownConversionContext,
  MarkdownParsePolicy,
  MarkdownSerializePolicy,
  SerializeMdContext,
} from '../types';
import {
  materializeMarkdownSettings,
  materializeRemarkPlugins,
} from '../utils/remarkPlugins';
import {
  createMarkdownModelLocator,
  createMarkdownSourceLocation,
  DEFAULT_MARKDOWN_PARSE_LIMITS,
  MarkdownDiagnostics,
} from './markdownDiagnostics';
import type { MarkdownSerializeDocumentValue } from './markdownDocument';
import { remarkFootnoteDefinitionWriter } from './markdownFootnoteWriter';
import { BYTE_ORDER_MARK } from './markdownFrontmatter';
import {
  remarkJoinEscapedTexts,
  remarkSeparateEscapes,
} from './markdownIntrinsics';
import {
  type CompiledMarkdownMappings,
  compileMarkdownMappings,
  getMarkdownMappingsRegistryKey,
  getRegisteredMarkdownMappings,
  registerMarkdownMappings,
} from './markdownMappings';
import { remarkOpenTail } from './markdownOpenTail';
import { remarkResolveMarkdownReferences } from './markdownReferences';
import { type MarkdownReader, readMathSafely } from './markdownSafety';
import {
  type MarkdownTagRegistry,
  remarkMarkdownTags,
  remarkMarkdownTagWriter,
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
  options: MarkdownRuntimeOptions;
  registry: MarkdownPluginRegistry;
  state: MarkdownRuntimeEditorState;
}>;

type MarkdownOperationRuntimeContext = Readonly<{
  pluginState: MarkdownRuntimeState;
  registry: MarkdownPluginRegistry;
  state: MarkdownRuntimeEditorState;
}>;

const createMarkdownRuntimeFromParts = (
  formats: CompiledMarkdownMappings,
  options: MarkdownRuntimeState,
  registry: MarkdownPluginRegistry,
  state: MarkdownRuntimeEditorState
): MarkdownRuntime =>
  Object.freeze({
    formats,
    options: Object.freeze(options),
    registry,
    state,
  });

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
): MarkdownRuntime =>
  createMarkdownRuntimeFromParts(
    getRegisteredMarkdownMappings(
      getMarkdownMappingsRegistryKey(context.pluginState)
    ),
    context.pluginState,
    context.registry,
    context.state
  );

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

// The editor keeps its compiled mappings while its plugins stay the same, so
// they key each cache that outlives one call. A copy clones the plugin state,
// so the remark plugins compare one by one.
export const samePlugins = (
  cached: Readonly<{ remarkPlugins: readonly unknown[] }>,
  remarkPlugins: readonly unknown[]
) =>
  cached.remarkPlugins.length === remarkPlugins.length &&
  cached.remarkPlugins.every(
    (plugin, index) => plugin === remarkPlugins[index]
  );

const materializedPluginsCache = new WeakMap<
  CompiledMarkdownMappings,
  Readonly<{
    materialized: DeserializeMdContext['remarkPlugins'];
    remarkPlugins: readonly unknown[];
  }>
>();

export const getCachedRemarkPlugins = (
  runtime: MarkdownRuntime
): DeserializeMdContext['remarkPlugins'] => {
  const { remarkPlugins } = runtime.options;
  const cached = materializedPluginsCache.get(runtime.formats);

  if (cached && samePlugins(cached, remarkPlugins)) return cached.materialized;
  const materialized = materializeRemarkPlugins(remarkPlugins);

  materializedPluginsCache.set(runtime.formats, {
    materialized,
    remarkPlugins,
  });

  return materialized;
};

const materializedStringifyOptionsCache = new WeakMap<
  CompiledMarkdownMappings,
  Readonly<{
    materialized: SerializeMdContext['remarkStringifyOptions'];
    raw: MarkdownRuntimeOptions['remarkStringifyOptions'];
  }>
>();

const getCachedRemarkStringifyOptions = (
  runtime: MarkdownRuntime
): SerializeMdContext['remarkStringifyOptions'] => {
  const raw = runtime.options.remarkStringifyOptions;

  if (!raw) return raw;
  const cached = materializedStringifyOptionsCache.get(runtime.formats);

  if (cached && (cached.raw === raw || dequal(cached.raw, raw))) {
    return cached.materialized;
  }
  const materialized = materializeMarkdownSettings(raw);

  materializedStringifyOptionsCache.set(runtime.formats, {
    materialized,
    raw,
  });

  return materialized;
};

export const getMergedOptionsDeserialize = (
  runtime: MarkdownRuntime,
  options: MarkdownParsePolicy = {},
  operation: Readonly<{
    diagnostics?: MarkdownDiagnostics;
    positionsReferToSource?: boolean;
    source?: string;
  }> = {}
): DeserializeMdContext => {
  const diagnostics = operation.diagnostics ?? new MarkdownDiagnostics();
  const source = operation.source ?? '';

  return {
    ...createConversionContext(runtime),
    limits: Object.freeze({
      ...DEFAULT_MARKDOWN_PARSE_LIMITS,
      ...options.limits,
    }),
    lossPolicy: options.lossPolicy ?? 'reject',
    mappings: runtime.formats,
    partial: options.partial,
    remarkPlugins: getCachedRemarkPlugins(runtime),
    report: diagnostics.report,
    sourceLocation: (node) =>
      createMarkdownSourceLocation(
        node,
        source,
        operation.positionsReferToSource ?? false
      ),
    state: runtime.state,
  };
};

export const getMergedOptionsSerialize = (
  runtime: MarkdownRuntime,
  options: MarkdownSerializePolicy = {},
  documentOverride?: MarkdownSerializeDocumentValue,
  diagnostics = new MarkdownDiagnostics(),
  readRoots = new Set<RootKey>()
): SerializeMdContext => {
  const { plainMarks } = runtime.options;
  const document = documentOverride ?? runtime.state.value();
  let locate: ReturnType<typeof createMarkdownModelLocator> | undefined;
  const plain =
    options.plainMarks ?? (plainMarks ? [...plainMarks] : plainMarks);

  return {
    ...createConversionContext(runtime),
    document,
    lossPolicy: options.lossPolicy ?? 'reject',
    mappings: runtime.formats,
    modelLocation: (node) =>
      (locate ??= createMarkdownModelLocator(document))(node),
    plainMarks: plain,
    preserveEmptyParagraphs: options.preserveEmptyParagraphs,
    readRoots,
    remarkPlugins: getCachedRemarkPlugins(runtime),
    remarkStringifyOptions:
      options.remarkStringifyOptions ??
      getCachedRemarkStringifyOptions(runtime),
    report: diagnostics.report,
    spread: options.spread,
    state: runtime.state,
    value: [...document.children],
  };
};

const buildMarkdownParser = (
  remarkPlugins: DeserializeMdContext['remarkPlugins'],
  tags: MarkdownTagRegistry
) =>
  unified()
    .use(remarkParse)
    .use(remarkSeparateEscapes)
    .use(remarkMarkdownTags, { tags })
    .use(remarkResolveMarkdownReferences)
    .use(remarkOpenTail)
    .use(remarkPlugins)
    .use(remarkJoinEscapedTexts)
    .use(() => readMathSafely)
    .freeze();

export type FrozenMarkdownParser = ReturnType<typeof buildMarkdownParser>;

const parserCache = new WeakMap<
  CompiledMarkdownMappings,
  {
    extraBlockTagParsers: Map<string, FrozenMarkdownParser>;
    parser: FrozenMarkdownParser;
    remarkPlugins: readonly unknown[];
  }
>();

const MAX_CACHED_EXTRA_TAG_PARSERS = 8;

export const getMarkdownParser = (
  runtime: MarkdownRuntime,
  extraBlockTag?: string
): FrozenMarkdownParser => {
  const { remarkPlugins } = runtime.options;
  let cached = parserCache.get(runtime.formats);

  if (!cached || !samePlugins(cached, remarkPlugins)) {
    const parser = buildMarkdownParser(
      getCachedRemarkPlugins(runtime),
      runtime.formats.tags
    );

    cached = {
      extraBlockTagParsers: new Map(),
      parser,
      remarkPlugins,
    };
    parserCache.set(runtime.formats, cached);
  }
  if (!extraBlockTag) return cached.parser;

  const existing = cached.extraBlockTagParsers.get(extraBlockTag);

  if (existing) return existing;
  const callTags = new Map(runtime.formats.tags);

  callTags.set(extraBlockTag, 'block');
  const parser = buildMarkdownParser(getCachedRemarkPlugins(runtime), callTags);

  if (cached.extraBlockTagParsers.size >= MAX_CACHED_EXTRA_TAG_PARSERS) {
    const oldest = cached.extraBlockTagParsers.keys().next().value;

    if (oldest !== undefined) cached.extraBlockTagParsers.delete(oldest);
  }
  cached.extraBlockTagParsers.set(extraBlockTag, parser);

  return parser;
};

const COMMONMARK = unified().use(remarkParse).freeze();
export const readCommonMark: MarkdownReader = (source) =>
  COMMONMARK.parse(source);

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

const EMOJI_PROBE = ':+1:';

const isParseOnlyEmojiPlugin = (
  plugin: DeserializeMdContext['remarkPlugins'][number]
) => {
  try {
    const processor = unified().use(remarkParse).use([plugin]).freeze();

    if (
      (processor.data('toMarkdownExtensions') as unknown[] | undefined)?.length
    ) {
      return false;
    }
    const root = processor.runSync(
      processor.parse(EMOJI_PROBE),
      EMOJI_PROBE
    ) as Root;
    const paragraph = root.children[0];
    const text =
      paragraph?.type === 'paragraph' ? paragraph.children[0] : undefined;

    return text?.type === 'text' && text.value.startsWith('👍');
  } catch {
    return false;
  }
};

const localTransformerPluginsCache = new WeakMap<
  CompiledMarkdownMappings,
  Readonly<{
    localOnly: boolean;
    remarkPlugins: readonly unknown[];
  }>
>();

const isKnownLocalRemarkPlugin = (
  plugin: DeserializeMdContext['remarkPlugins'][number]
): boolean => {
  if (isParseOnlyEmojiPlugin(plugin)) return true;
  try {
    const fn = Array.isArray(plugin) ? plugin[0] : plugin;
    const args = Array.isArray(plugin) ? plugin.slice(1) : [];
    const probe = unified().use(remarkParse);
    const transformer = (fn as (...params: unknown[]) => unknown).apply(
      probe,
      args
    );

    return typeof transformer !== 'function';
  } catch {
    return false;
  }
};

export const hasOnlyKnownLocalRemarkPlugins = (
  runtime: MarkdownRuntime
): boolean => {
  const { remarkPlugins } = runtime.options;
  const cached = localTransformerPluginsCache.get(runtime.formats);

  if (cached && samePlugins(cached, remarkPlugins)) return cached.localOnly;
  const localOnly = getCachedRemarkPlugins(runtime).every(
    isKnownLocalRemarkPlugin
  );

  localTransformerPluginsCache.set(runtime.formats, {
    localOnly,
    remarkPlugins,
  });

  return localOnly;
};

const remarkEscapeEmojiShortcodes: UnifiedPlugin<[], Root> = function () {
  const data = this.data() as {
    toMarkdownExtensions?: Array<{
      unsafe?: Array<{
        after?: string;
        character?: string;
        inConstruct?: unknown;
      }>;
    }>;
  };

  (data.toMarkdownExtensions ??= []).push({
    unsafe: [
      {
        after: '(?:\\+1|-1|[\\w-]+):',
        character: ':',
        inConstruct: 'phrasing',
      },
    ],
  });
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

export type MarkdownWriterExtension = Readonly<{
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

const buildMarkdownStringifier = (
  serializePlugins: DeserializeMdContext['remarkPlugins'],
  escapes: boolean,
  remarkStringifyOptions: SerializeMdContext['remarkStringifyOptions'],
  unwritable?: MarkdownWriterExtension
) => {
  const processor = unified()
    .use(remarkMarkdownTagWriter)
    .use(serializePlugins)
    .use(remarkEscapeDollars)
    .use(escapes ? [remarkEscapeEmojiShortcodes] : [])
    .use(remarkFootnoteDefinitionWriter, { read: readCommonMark });

  if (unwritable) {
    processor.use(function remarkUnwritableNodeWriter(this: Processor) {
      const data = this.data() as { toMarkdownExtensions?: unknown[] };

      // After every plugin, so a plugin that replaces the list still gets it.
      (data.toMarkdownExtensions ??= []).push(unwritable);
    });
  }

  return processor
    .use(remarkStringify, {
      emphasis: '_',
      resourceLink: false,
      ...remarkStringifyOptions,
    })
    .freeze();
};

export type FrozenMarkdownStringifier = ReturnType<
  typeof buildMarkdownStringifier
>;

export type CachedMarkdownStringifier = Readonly<{
  configuredWriters: ReadonlySet<string>;
  emptyRootHasBom: boolean;
  escapes: boolean;
  processor: FrozenMarkdownStringifier;
  remarkStringifyOptions: SerializeMdContext['remarkStringifyOptions'];
  serializePlugins: DeserializeMdContext['remarkPlugins'];
  writable: ReadonlySet<string>;
}>;

const MAX_CACHED_STRINGIFIERS = 8;

const stringifierCache = new WeakMap<
  CompiledMarkdownMappings,
  {
    entries: CachedMarkdownStringifier[];
    escapes: boolean;
    remarkPlugins: readonly unknown[];
    serializePlugins: DeserializeMdContext['remarkPlugins'];
  }
>();

export const getMarkdownStringifier = (
  runtime: MarkdownRuntime,
  remarkStringifyOptions: SerializeMdContext['remarkStringifyOptions']
): CachedMarkdownStringifier => {
  const { remarkPlugins } = runtime.options;
  let bucket = stringifierCache.get(runtime.formats);

  if (!bucket || !samePlugins(bucket, remarkPlugins)) {
    let escapes = false;
    const serializePlugins = getCachedRemarkPlugins(runtime).filter(
      (plugin) => {
        if (isParseOnlyEmojiPlugin(plugin)) {
          escapes = true;

          return false;
        }

        return true;
      }
    );

    bucket = {
      entries: [],
      escapes,
      remarkPlugins,
      serializePlugins,
    };
    stringifierCache.set(runtime.formats, bucket);
  }

  const existing = bucket.entries.find(
    (entry) =>
      entry.remarkStringifyOptions === remarkStringifyOptions ||
      dequal(entry.remarkStringifyOptions, remarkStringifyOptions)
  );

  if (existing) return existing;

  const processor = buildMarkdownStringifier(
    bucket.serializePlugins,
    bucket.escapes,
    remarkStringifyOptions
  );
  const configuredWriters = new Set<string>();

  [
    ...((processor.data('toMarkdownExtensions') as
      | MarkdownWriterExtension[]
      | undefined) ?? []),
    processor.data('settings'),
    remarkStringifyOptions,
  ].forEach((extension) =>
    addMarkdownWriterKinds(configuredWriters, extension)
  );

  const writable = new Set([...COMMONMARK_WRITER_KINDS, ...configuredWriters]);
  const emptyRootHasBom = processor
    .stringify({ children: [], type: 'root' })
    .startsWith(BYTE_ORDER_MARK);
  const entry: CachedMarkdownStringifier = {
    configuredWriters,
    emptyRootHasBom,
    escapes: bucket.escapes,
    processor,
    remarkStringifyOptions,
    serializePlugins: bucket.serializePlugins,
    writable,
  };

  if (bucket.entries.length >= MAX_CACHED_STRINGIFIERS) {
    bucket.entries.shift();
  }
  bucket.entries.push(entry);

  return entry;
};

export const createFallbackMarkdownStringifier = (
  cached: CachedMarkdownStringifier,
  unwritable: MarkdownWriterExtension
): FrozenMarkdownStringifier =>
  buildMarkdownStringifier(
    cached.serializePlugins,
    cached.escapes,
    cached.remarkStringifyOptions,
    unwritable
  );
