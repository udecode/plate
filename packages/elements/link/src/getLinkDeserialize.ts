import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { ELEMENT_LINK } from './defaults';

export const getLinkDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    element: getNodeDeserializer({
      type,
      getNode: (el) => ({
        type,
        url: el.getAttribute('href'),
      }),
      rules: [{ nodeNames: 'A' }],
    }),
  };
};
