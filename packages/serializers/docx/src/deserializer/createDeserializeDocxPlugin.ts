import { createPluginFactory, KEY_DESERIALIZE_HTML } from '@udecode/plate-core';
import cleanDocx from '../docx-cleaner/cleanDocx';

export const KEY_DESERIALIZE_DOCX = 'deserializeDocx';

export const createDeserializeDocxPlugin = createPluginFactory({
  key: KEY_DESERIALIZE_DOCX,
  injectPlugin: (editor, { key }) => {
    if (key === KEY_DESERIALIZE_HTML) {
      return {
        transformData: (data, { dataTransfer }) => {
          const rtf = dataTransfer.getData('text/rtf');

          return cleanDocx(data, rtf);
        },
      };
    }
  },
  // transformPlugin
});
