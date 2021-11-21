import { createPluginFactory, isUrl } from '@udecode/plate-core';
import { deserializeMd } from './utils';

export const KEY_DESERIALIZE_MD = 'deserializeMd';

export const createDeserializeMdPlugin = createPluginFactory({
  key: KEY_DESERIALIZE_MD,
  then: (editor) => ({
    editor: {
      insertData: {
        format: 'text/plain',
        query: ({ data, dataTransfer }) => {
          const htmlData = dataTransfer.getData('text/html');
          if (htmlData) return false;

          const { files } = dataTransfer;
          if (!files?.length) {
            // if content is simply a URL pass through to not break LinkPlugin
            if (isUrl(data)) {
              return false;
            }
          }
          return true;
        },
        getFragment: ({ data }) => deserializeMd(editor, data),
      },
    },
  }),
});
