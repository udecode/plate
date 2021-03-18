import { getNodeDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { ELEMENT_IMAGE } from './defaults';

export const useDeserializeImage = (): DeserializeHtml => (editor: Editor) => {
  const options = getPluginOptions(editor, ELEMENT_IMAGE);

  return {
    element: getNodeDeserializer({
      type: options.type,
      node: (el) => ({
        type: options.type,
        url: el.getAttribute('src'),
      }),
      rules: [{ nodeNames: 'IMG' }],
      ...options.deserialize,
    }),
  };
};
