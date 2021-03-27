import { getNodeDeserializer } from '@udecode/slate-plugins-common';
import {
  Deserialize,
  getSlateClass,
  getSlatePluginOptions,
} from '@udecode/slate-plugins-core';
import { ELEMENT_MEDIA_EMBED } from './defaults';

export const getMediaEmbedDeserialize = (): Deserialize => (editor) => {
  const options = getSlatePluginOptions(editor, ELEMENT_MEDIA_EMBED);

  return {
    element: getNodeDeserializer({
      type: options.type,
      getNode: (el: HTMLElement) => {
        let url = el.getAttribute('src');
        if (url) {
          [url] = url.split('?');

          return {
            type: options.type,
            url,
          };
        }
      },
      rules: [
        { nodeNames: 'IFRAME' },
        { className: getSlateClass(options.type) },
      ],
      ...options.deserialize,
    }),
  };
};
