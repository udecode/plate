import { createPluginFactory, isUrl } from '@udecode/plate-core';
import { deserializeMd } from './utils';

export const KEY_DESERIALIZE_MD = 'deserializeMd';

export const createDeserializeMdPlugin = createPluginFactory({
  key: KEY_DESERIALIZE_MD,
  then: (editor) => ({
    editor: {
      insertData: {
        format: 'text/plain',
        getFragment: ({ data }) => deserializeMd(editor, data),
      },
    },
  }),
});
