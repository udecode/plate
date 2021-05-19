import { getNodeDeserializer } from '@udecode/slate-plugins-common';
import {
  Deserialize,
  getSlateClass,
  getSlatePluginOptions,
} from '@udecode/slate-plugins-core';
import { ELEMENT_EXCALIDRAW } from './defaults';

export const getExcalidrawDeserialize = (
  pluginKey = ELEMENT_EXCALIDRAW
): Deserialize => (editor) => {
  const options = getSlatePluginOptions(editor, pluginKey);

  return {
    element: getNodeDeserializer({
      type: options.type,
      getNode: (el: HTMLElement) => {
        // let url = el.getAttribute('src');
        // if (url) {
        //  [url] = url.split('?');

        return {
          type: options.type,
          //  url,
        };
        // }
      },
      rules: [
        // FIXME: What to do here.
        /* { nodeNames: 'IFRAME' }, */
        { className: getSlateClass(options.type) },
      ],
      ...options.deserialize,
    }),
  };
};
