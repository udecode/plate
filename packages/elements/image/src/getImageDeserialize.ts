import { getNodeDeserializer } from '@udecode/slate-plugins-common';
import {
  Deserialize,
  getSlatePluginOptions,
} from '@udecode/slate-plugins-core';
import { ELEMENT_IMAGE } from './defaults';

export const getImageDeserialize = (): Deserialize => (editor) => {
  const options = getSlatePluginOptions(editor, ELEMENT_IMAGE);

  return {
    element: getNodeDeserializer({
      type: options.type,
      getNode: (el) => ({
        type: options.type,
        url: el.getAttribute('src'),
      }),
      rules: [{ nodeNames: 'IMG' }],
      ...options.deserialize,
    }),
  };
};
