import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

export const getImageDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    element: getNodeDeserializer({
      type,
      getNode: (el) => ({
        type,
        url: el.getAttribute('src'),
      }),
      rules: [{ nodeNames: 'IMG' }],
    }),
  };
};
