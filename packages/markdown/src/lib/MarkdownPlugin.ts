import type { Plugin } from 'unified';

import {
  type OmitFirst,
  type PluginConfig,
  bindFirst,
  createTSlatePlugin,
  isUrl,
} from '@udecode/plate';

import type { ElementTypes, Nodes } from './types';

import { deserializeMd } from './deserializer/utils';
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
    allowedNodes: ((string & {}) | ElementTypes)[] | null;
    /**
     * Configuration for disallowed node types. Cannot be combined with
     * allowedNodes.
     *
     * @default null
     */
    disallowedNodes: ((string & {}) | ElementTypes)[] | null;
    /**
     * Rules that define how to convert Markdown syntax elements to Slate editor
     * elements. Or rules that how to convert Slate editor elements to Markdown
     * syntax elements. Includes conversion rules for elements such as
     * paragraphs, headings, lists, links, images, etc. When set to null,
     * default conversion rules will be used.
     *
     * @default null
     */
    nodes: Nodes | null;
    /**
     * Array of remark plugins to extend Markdown parsing and serialization
     * functionality. For example, you can add remark-gfm to support GFM syntax,
     * remark-math to support mathematical formulas, etc. These plugins will be
     * used during the parsing and generation of Markdown text.
     *
     * @default [ ]
     */
    remarkPlugins: Plugin[];
    allowNode?: AllowNodeConfig;
    /**
     * Custom filter functions for nodes. Called after
     * allowedNodes/disallowedNodes check. You can specify different functions
     * for serialization and deserialization.
     */
    /**
     * When the text contains \n, split the text into a separate paragraph.
     *
     * Line breaks between paragraphs will also be converted into separate
     * paragraphs.
     *
     * @default false
     */
    splitLineBreaks?: boolean;
  },
  {
    markdown: {
      deserialize: OmitFirst<typeof deserializeMd>;
      serialize: OmitFirst<typeof serializeMd>;
    };
  }
>;

export const MarkdownPlugin = createTSlatePlugin<MarkdownConfig>({
  key: 'markdown',
  options: {
    allowedNodes: null,
    disallowedNodes: null,
    nodes: null,
    remarkPlugins: [],
    splitLineBreaks: false,
  },
})
  .extendApi(({ editor }) => ({
    deserialize: bindFirst(deserializeMd, editor),
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
