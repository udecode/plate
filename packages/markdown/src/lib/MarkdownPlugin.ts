import type { Plugin } from 'unified';

import {
  type OmitFirst,
  type PluginConfig,
  bindFirst,
  createTSlatePlugin,
  isUrl,
} from '@udecode/plate';

import { deserializeMd } from './deserializer/utils';
import {
  type RemarkPluginOptions,
  type RemarkTextRules,
  remarkDefaultTextRules,
} from './remark-slate';
import { type SerializeMdOptions, serializeMd } from './serializer';

export type CommentItem = {
  isLeaf?: boolean;
  deserialize?: (astNode: any, options: RemarkPluginOptions) => any;
  serialize?: (node: any, options: SerializeMdOptions) => any;
};

export type Components = Record<string, CommentItem>;

export type MarkdownConfig = PluginConfig<
  'markdown',
  {
    remarkPlugins: Plugin[];
    components?: Components;
    /**
     * When the text contains \n, split the text into a separate paragraph.
     *
     * Line breaks between paragraphs will also be converted into separate
     * paragraphs.
     *
     * @default false
     */
    splitLineBreaks?: boolean;
    /** Override text rules. */
    textRules?: RemarkTextRules;
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
    components: {},
    remarkPlugins: [],
    splitLineBreaks: false,
    textRules: remarkDefaultTextRules,
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
