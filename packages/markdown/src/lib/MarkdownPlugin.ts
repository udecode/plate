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
  type RemarkElementRules,
  type RemarkTextRules,
  remarkDefaultElementRules,
  remarkDefaultTextRules,
} from './remark-slate';
import {
  type SerializeMdOptions,
  type TComponents,
  serializeMd,
} from './serializer';
// export type MarkdownDeserializer = {
//   elementRules?: Partial<Record<MdastElementType, RemarkElementRule>>;
//   textRules?: Partial<Record<MdastTextType, RemarkTextRule>>;
// } & Deserializer;

export type CommentItem = {
  deserialize?: (astNode: any, options: any) => any;
  serialize?: (node: any, options: SerializeMdOptions) => any;
};

export type Components = Partial<Record<TComponents['type'], CommentItem>> &
  Record<string, CommentItem>;

export type MarkdownConfig = PluginConfig<
  'markdown',
  {
    remarkPlugins: Plugin[];
    components?: Components;
    /** Override element rules. */
    elementRules?: RemarkElementRules;
    indentList?: boolean;
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
    elementRules: remarkDefaultElementRules,
    indentList: false,
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
