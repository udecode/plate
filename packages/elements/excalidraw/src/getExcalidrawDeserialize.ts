import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize, getSlateClass } from '@udecode/plate-core';

export const getExcalidrawDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
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
      rules: [{ className: getSlateClass(type!) }],
    }),
  };
};
