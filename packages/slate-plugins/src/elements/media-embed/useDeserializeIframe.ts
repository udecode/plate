import {
  getNodeDeserializer,
  getSlateClass,
} from '@udecode/slate-plugins-common';
import {
  DeserializeHtml,
  useEditorPluginOptions,
} from '@udecode/slate-plugins-core';
import { ELEMENT_MEDIA_EMBED } from './defaults';

export const useDeserializeIframe = (): DeserializeHtml => {
  const options = useEditorPluginOptions(ELEMENT_MEDIA_EMBED);

  return {
    element: getNodeDeserializer({
      type: options.type,
      node: (el: HTMLElement) => {
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
