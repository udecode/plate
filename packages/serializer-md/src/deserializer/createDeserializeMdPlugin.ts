import {
  type Value,
  createPluginFactory,
  isUrl,
} from '@udecode/plate-common/server';

import type { DeserializeMdPlugin } from './types';

import {
  remarkDefaultElementRules,
  remarkDefaultTextRules,
} from '../remark-slate/index';
import { deserializeMd } from './utils/index';

export const KEY_DESERIALIZE_MD = 'deserializeMd';

export const createDeserializeMdPlugin =
  createPluginFactory<DeserializeMdPlugin>({
    key: KEY_DESERIALIZE_MD,
    options: {
      elementRules: remarkDefaultElementRules,
      indentList: false,
      textRules: remarkDefaultTextRules,
    },
    then: (editor) => ({
      editor: {
        insertData: {
          format: 'text/plain',
          getFragment: ({ data }) => deserializeMd<Value>(editor, data),
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
    }),
  });
