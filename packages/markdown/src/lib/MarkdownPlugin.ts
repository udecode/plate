import type { Options as RemarkStringifyOptions } from 'remark-stringify';
import type { Pluggable } from 'unified';
import type { Node as UnistNode } from 'unist';

import {
  type BaseEditor,
  type InferConfig,
  createBasePlugin,
} from '@platejs/core';
import type { Descendant, EditorCoreStateView, Text } from '@platejs/plite';
import { ContentSlice } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { isUrl } from '@udecode/utils';

import type { MdRules, PlateType } from './types';
import type { DeserializeMdOptions } from './deserializer';
import type { SerializeMdOptions } from './serializer';

import { deserializeInlineMd } from './deserializer';
import { deserializeMdWithRuntime } from './internal/markdownDeserializer';
import {
  serializeInlineMdWithRuntime,
  serializeMdWithRuntime,
} from './internal/markdownSerializer';
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

export type MarkdownPluginState = {
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

const shouldParseMarkdown = (
  data: string,
  source: { files: { length: number }; getData: (format: string) => string }
) => {
  if (source.getData('text/html')) return false;
  if (source.files.length === 0 && isUrl(data)) return false;

  return true;
};

export const MarkdownPlugin = createBasePlugin({
  api: ({ editor, plugin }) => ({
    deserialize: (data: string, options?: DeserializeMdOptions) =>
      withMarkdownRuntime(editor, (runtime) =>
        deserializeMdWithRuntime(runtime, data, options)
      ),
    deserializeInline: (text: string, options?: DeserializeMdOptions) =>
      deserializeInlineMd(editor, text, options),
    serializeInline: (
      options?: Omit<SerializeMdOptions, 'value'> & {
        value?: readonly Text[];
      }
    ) =>
      editor.read((state) =>
        serializeInlineMdWithRuntime(
          createMarkdownRuntime(editor, plugin.key, state),
          options
        )
      ),
  }),
  codecs: ({ defineCodecs, editor, plugin }) => {
    const decode = (data: string, state: EditorCoreStateView) => {
      const document = deserializeMdWithRuntime(
        createMarkdownRuntime(editor, plugin.key, state),
        data
      );

      return ContentSlice.closed(document.children);
    };
    const encode = (slice: ContentSlice, state: EditorCoreStateView) =>
      serializeMdWithRuntime(
        createMarkdownRuntime(editor, plugin.key, state),
        undefined,
        {
          children: [...slice.content],
        }
      );

    return defineCodecs({
      'text/markdown': {
        scope: 'document',
        decode: ({ data, state }) => decode(data, state),
        encode: ({ slice, state }) => encode(slice, state),
        query: ({ data, source }) => shouldParseMarkdown(data, source),
      },
      'text/plain': {
        scope: 'document',
        decode: ({ data, state }) => decode(data, state),
        query: ({ data, source }) => shouldParseMarkdown(data, source),
      },
    });
  },
  key: KEYS.markdown,
  initialState: {
    allowedNodes: null,
    disallowedNodes: null,
    plainMarks: null,
    remarkPlugins: [],
    remarkStringifyOptions: null,
    rules: null,
  } as MarkdownPluginState,
  read: ({ editor, plugin, state }) => ({
    serialize: (options?: SerializeMdOptions) =>
      serializeMdWithRuntime(
        createMarkdownRuntime(editor, plugin.key, state),
        options
      ),
  }),
});

export type MarkdownConfig = InferConfig<typeof MarkdownPlugin>;

export type MarkdownEditor<E extends BaseEditor = BaseEditor> = E & {
  readonly api: E['api'] & {
    readonly markdown: MarkdownConfig['pluginApi'];
  };
  readonly read: E['read'] & NonNullable<MarkdownConfig['state']>;
};
