import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';
import { LinkPlugin } from './types';

export const getLinkDeserialize = (): Deserialize<{}, LinkPlugin> => (
  editor,
  { type }
) => {
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
