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
  type Value,
  isUrl,
} from '../../core';
import type { RuntimePluginReference } from '../../facade';
import { getPlateNodeMappingContributions } from '../../internal/plugin/collectPlateNodeMappings';
import { getPluginStore } from '../../internal/plugin/pluginStore';
import { readVSCodeLanguage } from '../../internal/utils/vscodeClipboard';
import {
  projectPlateFormatDocument,
  withPlateFormatCompilation,
} from '../../lib/editor/withPlite';
import { groupMarkdownInlineRuns } from './internal/markdownDocument';
import { markdownMappingsRegistryKey } from './internal/markdownMappings';
import {
  type MarkdownReuse,
  parseMarkdownDocumentWithRuntime,
  parseMarkdownInlineWithRuntime,
  parseMarkdownPlaceholdersWithRuntime,
  parseMarkdownSliceWithRuntime,
} from './internal/markdownParse';
import {
  createMarkdownOperationRuntime,
  createMarkdownRuntime,
  type MarkdownRuntime,
  prepareMarkdownRuntime,
  withMarkdownRuntime,
} from './internal/markdownRuntime';
import {
  serializeMarkdownSliceWithRuntime,
  serializeMarkdownWithRuntime,
} from './internal/markdownSerialize';
import type {
  MarkdownDiagnostic,
  MarkdownDocumentParseResult,
  MarkdownEditorSerializeOptions,
  MarkdownParseOptions,
  MarkdownParsePolicy,
  MarkdownPlaceholderParseOptions,
  MarkdownPlaceholderParseResult,
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
  /**
   * Parse Markdown containing self-closing block placeholder tags (`<Tag ref="..." />`)
   * at the Markdown AST stage, returning flat validated node runs and placeholder
   * references without registering a schema element.
   */
  parsePlaceholders: (
    source: string,
    options: MarkdownPlaceholderParseOptions
  ) => MarkdownPlaceholderParseResult<V>;
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
  // VS Code's HTML only colors the Markdown source it copied.
  if (
    source.getData('text/html') &&
    readVSCodeLanguage(source) !== 'markdown'
  ) {
    return false;
  }
  if (source.files.length === 0 && isUrl(data)) return false;

  return true;
};

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

const toMarkdownBlocks = (
  runtime: MarkdownRuntime,
  children: readonly Descendant[]
): Element[] =>
  groupMarkdownInlineRuns(children, {
    isBlock: (node) => !runtime.state.schema.isInline(node),
    paragraphType: runtime.registry.type(PLUGINS.paragraph) ?? 'paragraph',
  });

const serializeMarkdownDataTransferSlice = (
  runtime: MarkdownRuntime,
  slice: ContentSlice,
  state: EditorCoreStateView
): string | null => {
  if (slice.openStart === 0 && slice.openEnd === 0) {
    const result = serializeMarkdownSliceWithRuntime(
      runtime,
      toMarkdownBlocks(runtime, slice.content),
      slice.roots
    );

    return result.ok ? result.data : null;
  }
  let failed = false;
  const serialize = (children: readonly Descendant[]) => {
    const result = serializeMarkdownSliceWithRuntime(
      runtime,
      toMarkdownBlocks(runtime, children),
      slice.roots
    );

    if (!result.ok) {
      failed = true;

      return '';
    }

    return result.data.trimEnd();
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
      return serialize([node]);
    }
    if (
      node.children.every(
        (child) => !ElementApi.isElement(child) || state.schema.isInline(child)
      )
    ) {
      return serialize([
        {
          children: node.children,
          type: paragraphType,
        },
      ]);
    }
    const unwrapped = serializeOpenNodes(
      node.children,
      Math.max(0, openStart - 1),
      Math.max(0, openEnd - 1)
    );

    return unwrapped.trim()
      ? unwrapped
      : serialize(
          node.children.map((child) => ({
            children: [{ text: NodeApi.string(child) }],
            type: paragraphType,
          }))
        );
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

  return result.ok && result.slice.content.length > 0 ? result.slice : null;
};

export const MarkdownPlugin = definePlugin(PLUGINS.markdown, {
  dataTransferFormats: [
    {
      mimeType: 'text/markdown',
      scope: 'document',
      decode: ({ data, pluginState, registry, report, state }) =>
        parseMarkdownDataTransferSlice(
          createMarkdownOperationRuntime({
            pluginState,
            registry,
            state,
          }),
          data,
          report
        ),
      encode: ({ pluginState, registry, slice, state }) =>
        serializeMarkdownDataTransferSlice(
          createMarkdownOperationRuntime({
            pluginState,
            registry,
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
      decode: ({ data, pluginState, registry, report, state }) =>
        parseMarkdownDataTransferSlice(
          createMarkdownOperationRuntime({
            pluginState,
            registry,
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
    parsePlaceholders: (source, options) =>
      withMarkdownRuntime(editor, store.get(), (runtime) =>
        parseMarkdownPlaceholdersWithRuntime(runtime, source, options)
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
      const projected = projectPlateFormatDocument(
        editor,
        options.document ?? context.read.value(),
        options.projection
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
    ({ editor, readState }) =>
      readState((state) =>
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

  return withPlateFormatCompilation(
    { plugins: [MarkdownPlugin, ...plugins], ...(schema ? { schema } : {}) },
    ({ editor, readDocument }) =>
      readDocument(
        document,
        policy.projection,
        (state, ownedDocument, diagnostics) =>
          serializeMarkdownWithRuntime(
            createMarkdownRuntime(
              editor,
              editor.plugin(MarkdownPlugin).store.get(),
              state
            ),
            ownedDocument,
            policy,
            diagnostics
          )
      )
  );
};

export type MarkdownDefinition = DefinitionOf<typeof MarkdownPlugin>;

export type MarkdownEditor<E = Editor, V extends Value = Value> = E & {
  readonly api: { markdown: MarkdownApi<V> };
};
