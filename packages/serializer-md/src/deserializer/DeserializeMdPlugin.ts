import { type PluginConfig, createTPlugin, isUrl } from '@udecode/plate-common';

import {
  type RemarkElementRules,
  type RemarkTextRules,
  remarkDefaultElementRules,
  remarkDefaultTextRules,
} from '../remark-slate/index';
import { deserializeMd } from './utils/index';

export type DeserializeMdConfig = PluginConfig<
  'deserializeMd',
  {
    elementRules?: RemarkElementRules;
    indentList?: boolean;
    textRules?: RemarkTextRules;
  }
>;

export const DeserializeMdPlugin = createTPlugin<DeserializeMdConfig>({
  key: 'deserializeMd',
  options: {
    elementRules: remarkDefaultElementRules,
    indentList: false,
    textRules: remarkDefaultTextRules,
  },
}).extend(({ editor }) => ({
  editor: {
    insertData: {
      format: 'text/plain',
      getFragment: ({ data }) => deserializeMd(editor, data),
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
  },
}));
