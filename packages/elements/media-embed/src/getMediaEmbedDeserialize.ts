import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin, getSlateClass } from '@udecode/plate-core';
import { ELEMENT_MEDIA_EMBED } from './defaults';

export const getMediaEmbedDeserialize = (
  key = ELEMENT_MEDIA_EMBED
): Deserialize => (editor, { type }) => {
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
      rules: [{ nodeNames: 'IFRAME' }, { className: getSlateClass(type) }],
    }),
  };
};
