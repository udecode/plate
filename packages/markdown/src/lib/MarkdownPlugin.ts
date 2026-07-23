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
import type {
  Descendant,
  EditorCoreStateView,
  EditorExtension,
} from '@platejs/plite';
import { defineHostCodec, hostCodecs } from '@platejs/plite-dom';
import { KEYS } from '@platejs/utils';
import { bindFirst, isUrl } from '@udecode/utils';

import type { MdRules, PlateType } from './types';

import { deserializeInlineMd, deserializeMd } from './deserializer';
import { deserializeMdWithRuntime } from './internal/markdownDeserializer';
import { serializeMdWithRuntime } from './internal/markdownSerializer';
import { createMarkdownRuntime } from './internal/markdownRuntime';
import { serializeMd } from './serializer';

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

const createMarkdownHostCodecExtension = (
  createContext: (
    state: EditorCoreStateView
  ) => Parameters<typeof createMarkdownRuntime>[0]
): EditorExtension =>
  hostCodecs('plate-markdown-host-codec', [
    defineHostCodec({
      format: 'text/markdown',
      key: 'plate:markdown:text/markdown:serialize',
      schema: [{ kind: 'schema' }],
      serialize: ({ slice, state }) =>
        serializeMdWithRuntime(createMarkdownRuntime(createContext(state)), {
          value: [...slice.content],
        }),
    }),
  ]);

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
      deserialize: bindFirst(deserializeMd, editor),
      deserializeInline: bindFirst(deserializeInlineMd, editor),
      serialize: bindFirst(serializeMd, editor),
    },
  }))
  .extend({
    parser: {
      format: ['text/plain', 'text/markdown'],
      deserialize: (context) =>
        deserializeMdWithRuntime(createMarkdownRuntime(context), context.data),
      schema: [{ kind: 'schema' }],
      query: ({ data, source }) => {
        const htmlData = source.getData('text/html');

        if (htmlData) return false;

        const { files } = source;

        if (!files?.length && isUrl(data)) return false;

        return true;
      },
    },
  })
  .extendExtension('hostCodec', ({ editor, plugin }) =>
    createMarkdownHostCodecExtension(prepareParserPluginContext(editor, plugin))
  );

export type MarkdownConfig = InferConfig<typeof MarkdownPlugin>;

export type MarkdownEditor<E extends BaseEditor = BaseEditor> = E & {
  readonly api: E['api'] & MarkdownConfig['api'];
};
