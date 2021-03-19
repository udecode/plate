import { getNodeDeserializer } from '@udecode/slate-plugins-common';
import { Deserialize, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { ELEMENT_IMAGE } from './defaults';

export const useDeserializeImage = (): Deserialize => (editor: Editor) => {
  const options = getPluginOptions(editor, ELEMENT_IMAGE);

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
