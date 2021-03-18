import { getElementDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, getOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';

export const useDeserializeList = (): DeserializeHtml => (editor: Editor) => {
  const { li, ul, ol } = getOptions(editor);

  return {
    element: [
      ...getElementDeserializer({
        type: ul.type,
        rules: [{ nodeNames: 'UL' }],
        ...ul.deserialize,
      }),
      ...getElementDeserializer({
        type: ol.type,
        rules: [{ nodeNames: 'OL' }],
        ...ol.deserialize,
      }),
      ...getElementDeserializer({
        type: li.type,
        rules: [{ nodeNames: 'LI' }],
        ...li.deserialize,
      }),
    ],
  };
};
