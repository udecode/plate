import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize, getSlateClass } from '@udecode/plate-core';

export const getMediaEmbedDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    element: getNodeDeserializer({
      type,
      getNode: (el: HTMLElement) => {
        const url = el.getAttribute('src');
        if (url) {
          return {
            type,
            url,
          };
        }
      },
      rules: [{ nodeNames: 'IFRAME' }, { className: getSlateClass(type!) }],
    }),
  };
};
