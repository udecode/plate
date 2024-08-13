import { createPlugin, isUrl } from '@udecode/plate-common';

import type { DeserializeMdPluginOptions } from './types';

import {
  remarkDefaultElementRules,
  remarkDefaultTextRules,
} from '../remark-slate/index';
import { deserializeMd } from './utils/index';

export const DeserializeMdPlugin = createPlugin<
  'deserializeMd',
  DeserializeMdPluginOptions
>({
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
