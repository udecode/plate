import {
  findHtmlParentElement,
  getNodeDeserializer,
} from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

export const getCodeDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    leaf: getNodeDeserializer({
      rules: [
        { nodeNames: ['CODE'] },
        {
          style: {
            wordWrap: 'break-word',
          },
        },
      ],
      getNode: (element) => {
        if (!findHtmlParentElement(element, 'PRE')) {
          return { [type]: true };
        }
      },
    }),
  };
};
