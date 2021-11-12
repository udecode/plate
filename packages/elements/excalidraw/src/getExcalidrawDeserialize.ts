import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin, getSlateClass } from '@udecode/plate-core';
import { ELEMENT_EXCALIDRAW } from './defaults';

export const getExcalidrawDeserialize = (
  key = ELEMENT_EXCALIDRAW
): Deserialize => (editor, { type }) => {
  return {
    element: getNodeDeserializer({
      type,
      getNode: () => {
        // let url = el.getAttribute('src');
        // if (url) {
        //  [url] = url.split('?');

        return {
          type,
          //  url,
        };
        // }
      },
      rules: [{ className: getSlateClass(type) }],
    }),
  };
};
