import type { Options as RemarkStringifyOptions } from 'remark-stringify';
import type { Pluggable } from 'unified';

import {
  readAuthoredFormatSnapshot,
  type AuthoredFormatDiagnostic,
} from '../../authored';
import {
  ContentSlice,
  definePlugin,
  ElementApi,
  NodeApi,
  PLUGINS,
  type DefinitionOf,
  type Descendant,
  type Editor,
  type EditorCoreStateView,
  type EditorDocumentValue,
  isUrl,
} from '../../core';
import {
  appendAuthoredMarkdownEnvelope,
  readAuthoredMarkdownEnvelope,
} from './internal/authoredMarkdown';
import {
  createMarkdownRuntime,
  deserializeInlineMdWithRuntime,
  deserializeMdWithRuntime,
  serializeMdWithRuntime,
  withMarkdownRuntime,
} from './internal/markdownConversion';
import type {
  AllowNodeConfig,
  AuthoredMarkdownResult,
  DeserializeMdOptions,
  MarkdownNodeName,
  SerializeMdOptions,
  SerializeAuthoredMarkdownOptions,
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
  remarkPlugins: readonly Pluggable[];
  /** Options passed to `remark-stringify`. */
  remarkStringifyOptions: RemarkStringifyOptions | null;
};

export type MarkdownApi = {
  deserialize: (
    data: string,
    options?: DeserializeMdOptions
  ) => EditorDocumentValue;
  deserializeInline: (
    text: string,
    options?: DeserializeMdOptions
  ) => Descendant[];
  serializeAuthored: (
    options: SerializeAuthoredMarkdownOptions
  ) => AuthoredMarkdownResult;
  serialize: (options?: SerializeMdOptions) => string;
};

const lossyProjectionDiagnostic = (
  projection: 'accepted' | 'proposed',
  count: number
): readonly AuthoredFormatDiagnostic[] =>
  count === 0
    ? []
    : [
        Object.freeze({
          code: 'authored-lossy-projection' as const,
          message: `${projection} projection omits ${count} pending authored change${count === 1 ? '' : 's'}.`,
          severity: 'warning' as const,
        }),
      ];

const shouldParseMarkdown = (
  data: string,
  source: { files: { length: number }; getData: (format: string) => string }
) => {
  if (source.getData('text/html')) return false;
  if (source.files.length === 0 && isUrl(data)) return false;

  return true;
};

export const MarkdownPlugin = definePlugin(PLUGINS.markdown, {
  codecs: ({ defineCodecs, editor, store }) => {
    const decode = (data: string, state: EditorCoreStateView) => {
      const document = deserializeMdWithRuntime(
        createMarkdownRuntime(editor, store.get(), state),
        data
      );

      return ContentSlice.closed(document.children);
    };
    return defineCodecs({
      'text/markdown': {
        scope: 'document',
        decode: ({ data, state }) => decode(data, state),
        encode: ({ slice, state }) => {
          const runtime = createMarkdownRuntime(editor, store.get(), state);
          const serialize = (children: readonly Descendant[]) =>
            serializeMdWithRuntime(runtime, undefined, {
              children: [...children],
            });

          if (slice.openStart === 0 && slice.openEnd === 0) {
            return serialize(slice.content);
          }

          const paragraphType =
            runtime.registry.type(PLUGINS.paragraph) ?? 'paragraph';

          function serializeOpenNodes(
            nodes: readonly Descendant[],
            openStart: number,
            openEnd: number
          ): string {
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
          }

          function serializeOpenNode(
            node: Descendant,
            openStart: number,
            openEnd: number
          ): string {
            if (
              (openStart === 0 && openEnd === 0) ||
              !ElementApi.isElement(node)
            ) {
              return serialize([node]).trimEnd();
            }

            if (typeof node.rawCode === 'string') return node.rawCode;

            const hasOnlyInlineChildren = node.children.every(
              (child) =>
                !ElementApi.isElement(child) || state.schema.isInline(child)
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
          }

          if (slice.content.length === 0) return '';

          return `${serializeOpenNodes(
            slice.content,
            slice.openStart,
            slice.openEnd
          )}\n`;
        },
        query: ({ data, source }) => shouldParseMarkdown(data, source),
      },
      'text/plain': {
        scope: 'document',
        decode: ({ data, state }) => decode(data, state),
        query: ({ data, source }) => shouldParseMarkdown(data, source),
      },
    });
  },
  initialState: (): MarkdownPluginState => ({
    allowNode: {},
    allowedNodes: null,
    disallowedNodes: null,
    plainMarks: null,
    remarkPlugins: [],
    remarkStringifyOptions: null,
  }),
}).extend(({ editor, store }) => ({
  api: (): MarkdownApi => ({
    deserialize: (data, options) => {
      const authoredDocument = readAuthoredMarkdownEnvelope(data);

      return (
        authoredDocument ??
        withMarkdownRuntime(editor, store.get(), (runtime) =>
          deserializeMdWithRuntime(runtime, data, options)
        )
      );
    },
    deserializeInline: (text, options) =>
      withMarkdownRuntime(editor, store.get(), (runtime) =>
        deserializeInlineMdWithRuntime(runtime, text, options)
      ),
    serialize: (options) =>
      withMarkdownRuntime(editor, store.get(), (runtime) =>
        serializeMdWithRuntime(runtime, options)
      ),
    serializeAuthored: ({ projection, ...options }) => {
      const snapshot = readAuthoredFormatSnapshot(editor as never);
      const document =
        projection === 'accepted' ? snapshot.accepted : snapshot.proposed;
      const markdown = withMarkdownRuntime(editor, store.get(), (runtime) =>
        serializeMdWithRuntime(runtime, options, document)
      );

      return Object.freeze({
        data:
          projection === 'review'
            ? appendAuthoredMarkdownEnvelope(markdown, editor.read.value())
            : markdown,
        diagnostics:
          projection === 'review'
            ? Object.freeze([])
            : Object.freeze(
                lossyProjectionDiagnostic(projection, snapshot.changes.length)
              ),
      });
    },
  }),
}));

export type MarkdownDefinition = DefinitionOf<typeof MarkdownPlugin>;

export type MarkdownEditor<E = Editor> = E & {
  readonly api: { markdown: MarkdownApi };
};
