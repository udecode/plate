import { createPluginFactory, isUrl } from '@udecode/plate-core';
import { deserializeMd } from './utils';

export const KEY_DESERIALIZE_MD = 'deserializeMd';

export const createDeserializeMdPlugin = createPluginFactory({
  key: KEY_DESERIALIZE_MD,
  editor: {
    insertData: {
      format: 'text/plain',
      query: (editor, plugin, { data, dataTransfer }) => {
        const { files } = dataTransfer;
        if (!files?.length) {
          // if content is simply a URL pass through to not break LinkPlugin
          if (isUrl(data)) {
            return false;
          }
        }
        return true;
      },
      getFragment: (editor, plugin, { data }) => deserializeMd(editor, data),
    },
  },
});
