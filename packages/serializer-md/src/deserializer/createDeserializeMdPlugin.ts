import { createPluginFactory, isUrl, Value } from '@udecode/plate-common';
import {
  remarkDefaultElementRules,
  remarkDefaultTextRules,
} from '../remark-slate/index';
import { deserializeMd } from './utils/index';
import { DeserializeMdPlugin } from './types';

export const KEY_DESERIALIZE_MD = 'deserializeMd';

export const createDeserializeMdPlugin =
  createPluginFactory<DeserializeMdPlugin>({
    key: KEY_DESERIALIZE_MD,
    then: (editor) => ({
      editor: {
        insertData: {
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
          getFragment: ({ data }) => deserializeMd<Value>(editor, data),
        },
      },
    }),
    options: {
      elementRules: remarkDefaultElementRules,
      textRules: remarkDefaultTextRules,
    },
  });
