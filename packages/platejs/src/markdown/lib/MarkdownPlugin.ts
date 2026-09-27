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
import {
  projectPlateFormatDocument,
  withPlateFormatCompilation,
} from '../../lib/editor/withPlite';
import {
  createMarkdownOperationRuntime,
  createMarkdownRuntime,
  parseMarkdownDocumentWithRuntime,
  parseMarkdownInlineWithRuntime,
  parseMarkdownSliceWithRuntime,
  prepareMarkdownRuntime,
  serializeMarkdownWithRuntime,
  withMarkdownRuntime,
} from './internal/markdownConversion';
import { markdownMappingsRegistryKey } from './internal/markdownMappings';
import type {
  AllowNodeConfig,
  MarkdownDocumentParseResult,
  MarkdownDocumentParseResultFromPlugins,
  MarkdownDocumentValueFromPlugins,
  MarkdownEditorSerializeOptions,
  MarkdownParseOptions,
  MarkdownParsePolicy,
  MarkdownNodeName,
  MarkdownSerializeOptions,
  MarkdownSerializeResult,
  MarkdownSliceParseResult,
  MarkdownSliceParseResultFromPlugins,
  MarkdownSyncPluggable,
  MarkdownWarningDiagnostic,
} from './types';

export type MarkdownPluginState = {
  /** Allowed node types. Cannot be combined with `disallowedNodes`. */
  allowedNodes: readonly MarkdownNodeName[] | null;
  /** Custom node filters for deserialization and serialization. */
  allowNode: AllowNodeConfig;
  /** Disallowed node types. Cannot be combined with `allowedNodes`. */
  disallowedNodes: readonly MarkdownNodeName[] | null;
  /** Marks serialized as plain text. */
  plainMarks: readonly MarkdownNodeName[] | null;
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
    options?: MarkdownParsePolicy
  ) => MarkdownSliceParseResult<V>;
  serialize: (
    options?: MarkdownEditorSerializeOptions
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
    output.push(node as Element);
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
): MarkdownSerializeResult => {
  if (slice.openStart === 0 && slice.openEnd === 0) {
    return serializeMarkdownWithRuntime(
      runtime,
      createMarkdownDocument(runtime, slice.content, slice.roots)
    );
  }
  const diagnostics: MarkdownWarningDiagnostic[] = [];
  let failure: Extract<MarkdownSerializeResult, { ok: false }> | null = null;
  const serialize = (children: readonly Descendant[]) => {
    const result = serializeMarkdownWithRuntime(
      runtime,
      createMarkdownDocument(runtime, children)
    );

    if (!result.ok) {
      failure = result;

      return '';
    }
    diagnostics.push(...result.diagnostics);

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

  if (failure) return failure;

  return Object.freeze({
    data,
    diagnostics: Object.freeze(diagnostics),
    ok: true,
  });
};

export const MarkdownPlugin = definePlugin(PLUGINS.markdown, {
  dataTransferFormats: [
    {
      mimeType: 'text/markdown',
      scope: 'document',
      decode: ({ data, pluginState, registry, schema, state }) =>
        parseMarkdownSliceWithRuntime(
          createMarkdownOperationRuntime({
            pluginState,
            registry,
            schema,
            state,
          }),
          data
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
      decode: ({ data, pluginState, registry, schema, state }) =>
        parseMarkdownSliceWithRuntime(
          createMarkdownOperationRuntime({
            pluginState,
            registry,
            schema,
            state,
          }),
          data
        ),
      accept: ({ data, snapshot }) => shouldParseMarkdown(data, snapshot),
    },
  ],
  initialState: (): MarkdownPluginState =>
    ({
      [markdownMappingsRegistryKey]: {},
      allowNode: {},
      allowedNodes: null,
      disallowedNodes: null,
      plainMarks: null,
      remarkPlugins: [],
      remarkStringifyOptions: null,
    }) as MarkdownPluginState,
  validate: ({ editor }) => {
    prepareMarkdownRuntime(editor, editor.plugin(MarkdownPlugin).store.get());
  },
}).extend(({ editor, store }) => ({
  api: (): MarkdownApi => ({
    parse: (source, options) =>
      withMarkdownRuntime(editor, store.get(), (runtime) =>
        parseMarkdownDocumentWithRuntime(runtime, source, options)
      ),
    parseInline: (source, options) =>
      withMarkdownRuntime(editor, store.get(), (runtime) =>
        parseMarkdownInlineWithRuntime(runtime, source, options)
      ),
    parseSlice: (source, options) =>
      withMarkdownRuntime(editor, store.get(), (runtime) =>
        parseMarkdownSliceWithRuntime(runtime, source, options)
      ),
    serialize: (options = {}) => {
      const document = options.document ?? editor.read.value();

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

export const parseMarkdown = <
  const TPlugins extends readonly RuntimePluginReference[],
>(
  source: string,
  options: MarkdownParseOptions<TPlugins>
): MarkdownDocumentParseResultFromPlugins<TPlugins> => {
  const { plugins, schema, ...policy } = options;

  return withDetachedMarkdownRuntime({ plugins, schema }, (runtime) =>
    parseMarkdownDocumentWithRuntime(runtime, source, policy)
  ) as MarkdownDocumentParseResultFromPlugins<TPlugins>;
};

export const parseMarkdownSlice = <
  const TPlugins extends readonly RuntimePluginReference[],
>(
  source: string,
  options: MarkdownParseOptions<TPlugins>
): MarkdownSliceParseResultFromPlugins<TPlugins> => {
  const { plugins, schema, ...policy } = options;

  return withDetachedMarkdownRuntime({ plugins, schema }, (runtime) =>
    parseMarkdownSliceWithRuntime(runtime, source, policy)
  ) as MarkdownSliceParseResultFromPlugins<TPlugins>;
};

export const parseMarkdownInline = <
  const TPlugins extends readonly RuntimePluginReference[],
>(
  source: string,
  options: MarkdownParseOptions<TPlugins>
): MarkdownSliceParseResultFromPlugins<TPlugins> => {
  const { plugins, schema, ...policy } = options;

  return withDetachedMarkdownRuntime({ plugins, schema }, (runtime) =>
    parseMarkdownInlineWithRuntime(runtime, source, policy)
  ) as MarkdownSliceParseResultFromPlugins<TPlugins>;
};

export const serializeMarkdown = <
  const TPlugins extends readonly RuntimePluginReference[],
>(
  document: MarkdownDocumentValueFromPlugins<TPlugins>,
  options: MarkdownSerializeOptions<TPlugins>
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
