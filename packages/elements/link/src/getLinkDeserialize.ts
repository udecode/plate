import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { ELEMENT_LINK } from './defaults';

export const getLinkDeserialize = (): Deserialize => (editor) => {
  const options = getPlatePluginOptions(editor, ELEMENT_LINK);

  return {
    element: getNodeDeserializer({
      type: options.type,
      getNode: (el) => ({
        type: options.type,
        url: el.getAttribute('href'),
      }),
      rules: [{ nodeNames: 'A' }],
      ...options.deserialize,
    }),
  };
};
