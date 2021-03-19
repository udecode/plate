import {
  getNodeDeserializer,
  getSlateClass,
} from '@udecode/slate-plugins-common';
import { Deserialize, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { ELEMENT_MEDIA_EMBED } from './defaults';

export const useDeserializeIframe = (): Deserialize => (editor: Editor) => {
  const options = getPluginOptions(editor, ELEMENT_MEDIA_EMBED);

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
