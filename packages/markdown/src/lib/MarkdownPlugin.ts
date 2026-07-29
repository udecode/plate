import type { Options as RemarkStringifyOptions } from 'remark-stringify';
import type { Pluggable } from 'unified';
import {
  type BaseEditor,
  type InferConfig,
  createBasePlugin,
} from '@platejs/core';
import type {
  Descendant,
  EditorCoreStateView,
  EditorDocumentValue,
} from '@platejs/plite';
import { ContentSlice } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { isUrl } from '@udecode/utils';

import type {
  AllowNodeConfig,
  DeserializeMdOptions,
  MdRules,
  PlateType,
  SerializeMdOptions,
} from './types';

import {
  createMarkdownRuntime,
  deserializeInlineMdWithRuntime,
  deserializeMdWithRuntime,
  serializeMdWithRuntime,
  withMarkdownRuntime,
} from './internal/markdownConversion';

export type MarkdownPluginState = {
  /** Allowed node types. Cannot be combined with `disallowedNodes`. */
  allowedNodes: readonly PlateType[] | null;
  /** Custom node filters for deserialization and serialization. */
  allowNode?: AllowNodeConfig;
  /** Disallowed node types. Cannot be combined with `allowedNodes`. */
  disallowedNodes: readonly PlateType[] | null;
  /** Marks serialized as plain text. */
  plainMarks: readonly PlateType[] | null;
  /** Remark plugins used for parsing and serialization. */
  remarkPlugins: readonly Pluggable[];
  /** Options passed to `remark-stringify`. */
  remarkStringifyOptions: RemarkStringifyOptions | null;
  /** Markdown conversion rules. Pass `null` to use only defaults. */
  rules: MdRules | null;
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
  serialize: (options?: SerializeMdOptions) => string;
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
  api: ({ editor, store }): MarkdownApi => ({
    deserialize: (data, options) =>
      withMarkdownRuntime(editor, store.get(), (runtime) =>
        deserializeMdWithRuntime(runtime, data, options)
      ),
    deserializeInline: (text, options) =>
      withMarkdownRuntime(editor, store.get(), (runtime) =>
        deserializeInlineMdWithRuntime(runtime, text, options)
      ),
    serialize: (options) =>
      withMarkdownRuntime(editor, store.get(), (runtime) =>
        serializeMdWithRuntime(runtime, options)
      ),
  }),
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
        encode: ({ slice, state }) =>
          serializeMdWithRuntime(
            createMarkdownRuntime(editor, store.get(), state),
            undefined,
            {
              children: [...slice.content],
            }
          ),
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
  initialState: (): MarkdownPluginState => ({
    allowedNodes: null,
    disallowedNodes: null,
    plainMarks: null,
    remarkPlugins: [],
    remarkStringifyOptions: null,
    rules: null,
  }),
});

export type MarkdownConfig = InferConfig<typeof MarkdownPlugin>;

export type MarkdownEditor<E extends BaseEditor = BaseEditor> = E & {
  readonly api: E['api'] & { markdown: MarkdownApi };
};
