import {
  type OmitFirst,
  type PluginConfig,
  bindFirst,
  createTSlatePlugin,
  isUrl,
} from '@udecode/plate-common';

import { deserializeMd } from './deserializer/utils';
import {
  type RemarkElementRules,
  type RemarkTextRules,
  remarkDefaultElementRules,
  remarkDefaultTextRules,
} from './remark-slate';
import { serializeMd } from './serializer';

// export type MarkdownDeserializer = {
//   elementRules?: Partial<Record<MdastElementType, RemarkElementRule>>;
//   textRules?: Partial<Record<MdastTextType, RemarkTextRule>>;
// } & Deserializer;

export type MarkdownConfig = PluginConfig<
  'markdown',
  {
    /** Override element rules. */
    elementRules?: RemarkElementRules;
    indentList?: boolean;
    /** Keep original line breaks. @default false */
    keepLineBreak?: boolean;

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
    elementRules: remarkDefaultElementRules,
    indentList: false,
    // Keep original line breaks
    keepLineBreak: false,
    textRules: remarkDefaultTextRules,
  },
})
  .extendApi(({ editor }) => ({
    deserialize: bindFirst(deserializeMd, editor),
    serialize: bindFirst(serializeMd, editor),
  }))
  .extend(({ api }) => ({
    parser: {
      deserialize: ({ data }) => api.markdown.deserialize(data),
      format: 'text/plain',
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
