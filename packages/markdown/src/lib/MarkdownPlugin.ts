import type { Options as RemarkStringifyOptions } from 'remark-stringify';
import type { Pluggable } from 'unified';
import type { Node as UnistNode } from 'unist';

import {
  type BaseEditor,
  type InferConfig,
  type PluginConfig,
  createBasePlugin,
  prepareParserPluginContext,
} from '@platejs/core';
import type { Descendant, Value } from '@platejs/plite';
import { ContentSlice, ElementApi } from '@platejs/plite';
import { type HostCodec, hostCodecs } from '@platejs/plite-dom';
import { KEYS } from '@platejs/utils';
import { bindFirst, isUrl } from '@udecode/utils';

import type { MdRules, PlateType } from './types';
import type { DeserializeMdOptions } from './deserializer';
import type { SerializeMdOptions } from './serializer';

import { deserializeInlineMd } from './deserializer';
import { deserializeMdWithRuntime } from './internal/markdownDeserializer';
import { serializeMdWithRuntime } from './internal/markdownSerializer';
import {
  createMarkdownRuntime,
  withMarkdownRuntime,
} from './internal/markdownRuntime';

export type AllowNodeConfig = {
  /** Custom filter function for nodes during deserialization. */
  deserialize?: (node: UnistNode & { type: PlateType }) => boolean;
  /** Custom filter function for nodes during serialization. */
  serialize?: (node: Descendant) => boolean;
};

export type MarkdownPluginOptions = {
  /** Allowed node types. Cannot be combined with `disallowedNodes`. */
  allowedNodes?: readonly PlateType[] | null;
  /** Custom node filters for deserialization and serialization. */
  allowNode?: AllowNodeConfig;
  /** Disallowed node types. Cannot be combined with `allowedNodes`. */
  disallowedNodes?: readonly PlateType[] | null;
  /** Marks serialized as plain text. */
  plainMarks?: readonly PlateType[] | null;
  /** Remark plugins used for parsing and serialization. */
  remarkPlugins?: readonly Pluggable[];
  /** Options passed to `remark-stringify`. */
  remarkStringifyOptions?: RemarkStringifyOptions | null;
  /** Markdown conversion rules. Pass `null` to use only defaults. */
  rules?: MdRules | null;
};

type MarkdownContract = PluginConfig<'markdown', MarkdownPluginOptions>;

const shouldParseMarkdown = (
  data: string,
  source: { files: { length: number }; getData: (format: string) => string }
) => {
  if (source.getData('text/html')) return false;
  if (source.files.length === 0 && isUrl(data)) return false;

  return true;
};

export const MarkdownPlugin = createBasePlugin<MarkdownContract>({
  key: KEYS.markdown,
  options: {
    allowedNodes: null,
    disallowedNodes: null,
    plainMarks: null,
    remarkPlugins: [],
    remarkStringifyOptions: null,
    rules: null,
  },
})
  .extendEditorApi(({ editor }) => ({
    markdown: {
      deserialize: (data: string, options?: DeserializeMdOptions) =>
        withMarkdownRuntime(editor, (runtime) =>
          deserializeMdWithRuntime(runtime, data, options)
        ),
      deserializeInline: bindFirst(deserializeInlineMd, editor),
      serialize: (options?: SerializeMdOptions) =>
        withMarkdownRuntime(editor, (runtime) =>
          serializeMdWithRuntime(runtime, options)
        ),
    },
  }))
  .extend({
    parser: {
      format: ['text/plain', 'text/markdown'],
      query: ({ data, source }) => shouldParseMarkdown(data, source),
    },
  })
  .extendExtension('hostCodec', ({ editor, plugin }) => {
    const createContext = prepareParserPluginContext(editor, plugin);
    const parse: NonNullable<HostCodec['parse']> = ({ data, state }) => {
      const document = deserializeMdWithRuntime(
        createMarkdownRuntime(createContext(state)),
        data
      );

      return ContentSlice.fromJSON({
        content: document.children,
        openEnd: 0,
        openStart: 0,
        ...(document.roots ? { roots: document.roots } : {}),
      });
    };

    return hostCodecs('plate-markdown-host-codec', [
      {
        format: 'text/markdown',
        key: 'plate:markdown:text/markdown',
        owns: [{ kind: 'schema' }],
        parse,
        query: ({ data, source }) => shouldParseMarkdown(data, source),
        serialize: ({ slice, state }) => {
          const roots: Record<string, Value> = {};

          Object.entries(slice.roots ?? {}).forEach(([root, content]) => {
            const blocks = content.flatMap((node) =>
              ElementApi.isElement(node) ? [node] : []
            );

            if (blocks.length !== content.length) {
              throw new Error(
                `Markdown content root "${root}" must contain blocks.`
              );
            }

            roots[root] = blocks;
          });

          return serializeMdWithRuntime(
            createMarkdownRuntime(createContext(state)),
            undefined,
            {
              children: [...slice.content],
              ...(Object.keys(roots).length > 0 ? { roots } : {}),
            }
          );
        },
      },
      {
        format: 'text/plain',
        key: 'plate:markdown:text/plain',
        owns: [{ kind: 'schema' }],
        parse,
        query: ({ data, source }) => shouldParseMarkdown(data, source),
      },
    ]);
  });

export type MarkdownConfig = InferConfig<typeof MarkdownPlugin>;

export type MarkdownEditor<E extends BaseEditor = BaseEditor> = E & {
  readonly api: E['api'] & MarkdownConfig['api'];
};
