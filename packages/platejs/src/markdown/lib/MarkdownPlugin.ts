import type { Options as RemarkStringifyOptions } from 'remark-stringify';

import {
  type ContentSlice,
  definePlugin,
  ElementApi,
  NodeApi,
  PLUGINS,
  type DefinitionOf,
  type Descendant,
  type Editor,
  type EditorApplicationSchema,
  type EditorCoreStateView,
  type EditorDocumentValue,
  type Element,
  TextApi,
  type Value,
  isUrl,
} from '../../core';
import type { RuntimePluginReference } from '../../facade';
import { getPlateNodeMappingContributions } from '../../internal/plugin/collectPlateNodeMappings';
import { getPluginStore } from '../../internal/plugin/pluginStore';
import {
  projectPlateFormatDocument,
  withPlateFormatCompilation,
} from '../../lib/editor/withPlite';
import {
  createMarkdownOperationRuntime,
  createMarkdownRuntime,
  type MarkdownReuse,
  parseMarkdownDocumentWithRuntime,
  parseMarkdownInlineWithRuntime,
  parseMarkdownSliceWithRuntime,
  prepareMarkdownRuntime,
  serializeMarkdownWithRuntime,
  withMarkdownRuntime,
} from './internal/markdownConversion';
import { markdownMappingsRegistryKey } from './internal/markdownMappings';
import type {
  MarkdownDiagnostic,
  MarkdownDocumentParseResult,
  MarkdownEditorSerializeOptions,
  MarkdownParseOptions,
  MarkdownParsePolicy,
  MarkdownSerializeOptions,
  MarkdownSerializeResult,
  MarkdownSliceParseResult,
  MarkdownSyncPluggable,
} from './types';

export type MarkdownPluginState = {
  /** Mark keys serialized as plain text. */
  plainMarks: readonly string[] | null;
  /** Remark plugins used for parsing and serialization. */
  remarkPlugins: readonly MarkdownSyncPluggable[];
  /** Options passed to `remark-stringify`. */
  remarkStringifyOptions: RemarkStringifyOptions | null;
};

export type MarkdownApi<V extends Value = Value> = {
  parse: (
    source: string,
    options?: MarkdownParsePolicy
  ) => MarkdownDocumentParseResult<V>;
  parseInline: (
    source: string,
    options?: MarkdownParsePolicy
  ) => MarkdownSliceParseResult<V>;
  parseSlice: (
    source: string,
    options?: MarkdownParsePolicy &
      Readonly<{
        /**
         * The previous result of a growing source. When it came from this
         * editor's `parseSlice`, for a prefix of `source`, under unchanged
         * plugins and limits, only the text after its last complete block is
         * converted again, and complete blocks keep their node objects, so a
         * preview or the final parse can publish just the changed tail. Under
         * another `lossPolicy`, only complete blocks that reported nothing
         * are kept. Any other hint parses the whole source, and so does a
         * source with a link reference or footnote definition, which can
         * change blocks before it.
         */
        previous?: MarkdownSliceParseResult<V>;
      }>
  ) => MarkdownSliceParseResult<V>;
  serialize: (
    options?: MarkdownEditorSerializeOptions<V>
  ) => MarkdownSerializeResult;
};

const shouldParseMarkdown = (
  data: string,
  source: { files: { length: number }; getData: (format: string) => string }
) => {
  if (source.getData('text/html')) return false;
  if (source.files.length === 0 && isUrl(data)) return false;

  return true;
};

type MarkdownRuntime = ReturnType<typeof createMarkdownOperationRuntime>;

const markdownStateOwners = new WeakMap<object, readonly string[]>();

// A mapping callback sees only its owner's state, and parsing reads Markdown's
// own remark plugins; no other plugin's state can change a conversion.
const getMarkdownReuse = (
  editor: Editor,
  previous: object | undefined
): MarkdownReuse => {
  let owners = markdownStateOwners.get(editor);

  if (!owners) {
    owners = [
      ...new Set([
        PLUGINS.markdown,
        ...getPlateNodeMappingContributions(editor, 'markdown').map(
          ({ owner }) => owner
        ),
      ]),
    ];
    markdownStateOwners.set(editor, owners);
  }

  return {
    editor,
    pluginStates: owners.map(
      (name) => getPluginStore(editor, name)?.public.get() ?? null
    ),
    previous,
  };
};

const createMarkdownDocument = (
  runtime: MarkdownRuntime,
  children: readonly Descendant[],
  roots?: Readonly<Record<string, readonly Descendant[]>>
): EditorDocumentValue => {
  const output: Element[] = [];
  let inline: Descendant[] = [];
  const paragraphType = runtime.registry.type(PLUGINS.paragraph) ?? 'paragraph';
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

  return {
    children: output,
    ...(roots ? { roots: roots as Readonly<Record<string, Value>> } : {}),
  };
};

const serializeMarkdownDataTransferSlice = (
  runtime: MarkdownRuntime,
  slice: ContentSlice,
  state: EditorCoreStateView
): string | null => {
  if (slice.openStart === 0 && slice.openEnd === 0) {
    const result = serializeMarkdownWithRuntime(
      runtime,
      createMarkdownDocument(runtime, slice.content, slice.roots)
    );

    return result.ok ? result.data : null;
  }
  let failed = false;
  const serialize = (children: readonly Descendant[]) => {
    const result = serializeMarkdownWithRuntime(
      runtime,
      createMarkdownDocument(runtime, children)
    );

    if (!result.ok) {
      failed = true;

      return '';
    }

    return result.data;
  };
  const paragraphType = runtime.registry.type(PLUGINS.paragraph) ?? 'paragraph';
  const serializeOpenNodes = (
    nodes: readonly Descendant[],
    openStart: number,
    openEnd: number
  ): string => {
    const lastIndex = nodes.length - 1;

    return nodes
      .map((node, index) =>
        serializeOpenNode(
          node,
          index === 0 ? openStart : 0,
          index === lastIndex ? openEnd : 0
        )
      )
      .join('\n\n');
  };
  const serializeOpenNode = (
    node: Descendant,
    openStart: number,
    openEnd: number
  ): string => {
    if ((openStart === 0 && openEnd === 0) || !ElementApi.isElement(node)) {
      return serialize([node]).trimEnd();
    }
    if (typeof node.rawCode === 'string') return node.rawCode;

    const hasOnlyInlineChildren = node.children.every(
      (child) => !ElementApi.isElement(child) || state.schema.isInline(child)
    );

    if (
      hasOnlyInlineChildren &&
      state.schema.element(node.type)?.slice.preserveContext
    ) {
      return NodeApi.string(node);
    }
    if (hasOnlyInlineChildren) {
      return serialize([
        {
          children: node.children,
          type: paragraphType,
        },
      ]).trimEnd();
    }
    const unwrapped = serializeOpenNodes(
      node.children,
      Math.max(0, openStart - 1),
      Math.max(0, openEnd - 1)
    );

    return unwrapped.trim()
      ? unwrapped
      : node.children.map(NodeApi.string).join('\n');
  };
  const data =
    slice.content.length === 0
      ? ''
      : `${serializeOpenNodes(
          slice.content,
          slice.openStart,
          slice.openEnd
        )}\n`;

  return failed ? null : data;
};

// Repairs and removed script destinations keep the pasted meaning; anything
// dropped, replaced or rejected does not.
const isLosslessMarkdownDiagnostic = (diagnostic: MarkdownDiagnostic) =>
  'impact' in diagnostic
    ? diagnostic.impact === 'lossless'
    : diagnostic.code === 'markdown-tag-repair' ||
      diagnostic.code === 'markdown-unsupported-metadata';

/**
 * Paste inserts what Markdown can represent and reports the rest, as HTML
 * paste does.
 */
const parseMarkdownDataTransferSlice = (
  runtime: MarkdownRuntime,
  data: string,
  report: (
    diagnostic: Readonly<{ impact: 'lossless' | 'lossy'; message: string }>
  ) => void
): ContentSlice | null => {
  const result = parseMarkdownSliceWithRuntime(runtime, data, {
    lossPolicy: 'allow',
  });

  for (const diagnostic of result.diagnostics) {
    report({
      impact: isLosslessMarkdownDiagnostic(diagnostic) ? 'lossless' : 'lossy',
      message: diagnostic.message,
    });
  }

  return result.ok ? result.slice : null;
};

export const MarkdownPlugin = definePlugin(PLUGINS.markdown, {
  dataTransferFormats: [
    {
      mimeType: 'text/markdown',
      scope: 'document',
      decode: ({ data, pluginState, registry, report, schema, state }) =>
        parseMarkdownDataTransferSlice(
          createMarkdownOperationRuntime({
            pluginState,
            registry,
            schema,
            state,
          }),
          data,
          report
        ),
      encode: ({ pluginState, registry, schema, slice, state }) =>
        serializeMarkdownDataTransferSlice(
          createMarkdownOperationRuntime({
            pluginState,
            registry,
            schema,
            state,
          }),
          slice,
          state
        ),
      accept: ({ data, snapshot }) => shouldParseMarkdown(data, snapshot),
    },
    {
      mimeType: 'text/plain',
      scope: 'document',
      decode: ({ data, pluginState, registry, report, schema, state }) =>
        parseMarkdownDataTransferSlice(
          createMarkdownOperationRuntime({
            pluginState,
            registry,
            schema,
            state,
          }),
          data,
          report
        ),
      accept: ({ data, snapshot }) => shouldParseMarkdown(data, snapshot),
    },
  ],
  initialState: (): MarkdownPluginState =>
    ({
      [markdownMappingsRegistryKey]: {},
      plainMarks: null,
      remarkPlugins: [],
      remarkStringifyOptions: null,
    }) as MarkdownPluginState,
  validate: ({ editor }) => {
    prepareMarkdownRuntime(editor, editor.plugin(MarkdownPlugin).store.get());
  },
}).extend(({ editor, store }) => ({
  api: ({ editor: context }): MarkdownApi => ({
    parse: (source, options) =>
      withMarkdownRuntime(editor, store.get(), (runtime) =>
        parseMarkdownDocumentWithRuntime(runtime, source, options)
      ),
    parseInline: (source, options) =>
      withMarkdownRuntime(editor, store.get(), (runtime) =>
        parseMarkdownInlineWithRuntime(runtime, source, options)
      ),
    parseSlice: (source, { previous, ...options } = {}) =>
      withMarkdownRuntime(editor, store.get(), (runtime) =>
        parseMarkdownSliceWithRuntime(
          runtime,
          source,
          options,
          options.partial || previous
            ? getMarkdownReuse(editor, previous)
            : undefined
        )
      ),
    serialize: (options = {}) => {
      const document = options.document ?? context.read.value();

      assertMarkdownProjection(document, options.projection);
      const projected = projectPlateFormatDocument(
        editor,
        document,
        options.projection ?? 'proposed'
      );

      return withMarkdownRuntime(editor, store.get(), (runtime) =>
        serializeMarkdownWithRuntime(
          runtime,
          projected.document,
          options,
          projected.diagnostics
        )
      );
    },
  }),
}));

const assertMarkdownProjection = (
  document: EditorDocumentValue,
  projection: 'accepted' | 'proposed' | undefined
) => {
  if (document.meta?.authored !== undefined && !projection) {
    throw new TypeError(
      'Markdown serialization requires a projection for authored documents.'
    );
  }
};

const withDetachedMarkdownRuntime = <T>(
  options: Readonly<{
    plugins: readonly RuntimePluginReference[];
    schema?: EditorApplicationSchema;
  }>,
  run: (runtime: ReturnType<typeof createMarkdownRuntime>) => T
) =>
  withPlateFormatCompilation(
    {
      plugins: [MarkdownPlugin, ...options.plugins],
      ...(options.schema ? { schema: options.schema } : {}),
    },
    ({ editor }) =>
      editor.read((state) =>
        run(
          createMarkdownRuntime(
            editor,
            editor.plugin(MarkdownPlugin).store.get(),
            state
          )
        )
      )
  );

export const parseMarkdown = (
  source: string,
  options: MarkdownParseOptions
): MarkdownDocumentParseResult => {
  const { plugins, schema, ...policy } = options;

  return withDetachedMarkdownRuntime({ plugins, schema }, (runtime) =>
    parseMarkdownDocumentWithRuntime(runtime, source, policy)
  );
};

export const serializeMarkdown = (
  document: EditorDocumentValue,
  options: MarkdownSerializeOptions
): MarkdownSerializeResult => {
  const { plugins, schema, ...policy } = options;

  assertMarkdownProjection(document, policy.projection);

  return withPlateFormatCompilation(
    { plugins: [MarkdownPlugin, ...plugins], ...(schema ? { schema } : {}) },
    ({ editor, projectDocument, readDocument }) => {
      const projected = projectDocument(
        document,
        policy.projection ?? 'proposed'
      );

      return readDocument(projected.document, (state, ownedDocument) =>
        serializeMarkdownWithRuntime(
          createMarkdownRuntime(
            editor,
            editor.plugin(MarkdownPlugin).store.get(),
            state
          ),
          ownedDocument,
          policy,
          projected.diagnostics
        )
      );
    }
  );
};

export type MarkdownDefinition = DefinitionOf<typeof MarkdownPlugin>;

export type MarkdownEditor<E = Editor, V extends Value = Value> = E & {
  readonly api: { markdown: MarkdownApi<V> };
};
