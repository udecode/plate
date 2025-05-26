import type { Plugin } from 'unified';

import {
  type OmitFirst,
  type PluginConfig,
  bindFirst,
  createTSlatePlugin,
  isUrl,
  KEYS,
} from '@udecode/plate';

import type { MdRules, PlateType } from './types';

import { deserializeInlineMd, deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

export type AllowNodeConfig = {
  /** Custom filter function for nodes during deserialization */
  deserialize?: (node: any) => boolean;
  /** Custom filter function for nodes during serialization */
  serialize?: (node: any) => boolean;
};

export type MarkdownConfig = PluginConfig<
  'markdown',
  {
    /**
     * Configuration for allowed node types. Cannot be combined with
     * disallowedNodes.
     */
    allowedNodes: PlateType[] | null;
    /**
     * Configuration for disallowed node types. Cannot be combined with
     * allowedNodes.
     *
     * @default null
     */
    disallowedNodes: PlateType[] | null;
    /**
     * Array of remark plugins to extend Markdown parsing and serialization
     * functionality. For example, you can add remark-gfm to support GFM syntax,
     * remark-math to support mathematical formulas, etc. These plugins will be
     * used during the parsing and generation of Markdown text.
     *
     * @default undefined
     */
    remarkPlugins: Plugin[];
    /**
     * Rules that define how to convert Markdown syntax elements to Slate editor
     * elements. Or rules that how to convert Slate editor elements to Markdown
     * syntax elements. Includes conversion rules for elements such as
     * paragraphs, headings, lists, links, images, etc.
     *
     * You can pass null disable default node parser.
     *
     * NOTE: don't forget pass `mark:true` when you custom inline nodes.
     *
     * @default null
     */
    rules: MdRules | null;
    /**
     * Custom filter function for nodes during deserialization and
     * serialization.
     *
     * @default null
     */
    allowNode?: AllowNodeConfig;
  },
  {
    markdown: {
      deserialize: OmitFirst<typeof deserializeMd>;
      deserializeInline: OmitFirst<typeof deserializeInlineMd>;
      serialize: OmitFirst<typeof serializeMd>;
    };
  }
>;

export const MarkdownPlugin = createTSlatePlugin<MarkdownConfig>({
  key: KEYS.markdown,
  options: {
    allowedNodes: null,
    disallowedNodes: null,
    remarkPlugins: [],
    rules: null,
  },
})
  .extendApi(({ editor }) => ({
    deserialize: bindFirst(deserializeMd, editor),
    deserializeInline: bindFirst(deserializeInlineMd, editor),
    serialize: bindFirst(serializeMd, editor),
  }))
  .extend(({ api }) => ({
    parser: {
      format: 'text/plain',
      deserialize: ({ data }) => api.markdown.deserialize(data),
      query: ({ data, dataTransfer }) => {
        const htmlData = dataTransfer.getData('text/html');

        if (htmlData) return false;

        const { files } = dataTransfer;

        if (
          !files?.length && // if content is simply a URL pass through to not break LinkPlugin
          isUrl(data)
        ) {
          return false;
        }

        return true;
      },
    },
  }));
