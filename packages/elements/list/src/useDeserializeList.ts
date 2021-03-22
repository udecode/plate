import { getElementDeserializer } from '@udecode/slate-plugins-common';
import { Deserialize, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from './defaults';

export const useDeserializeList = (): Deserialize => (editor: Editor) => {
  const li = getPluginOptions(editor, ELEMENT_LI);
  const ul = getPluginOptions(editor, ELEMENT_UL);
  const ol = getPluginOptions(editor, ELEMENT_OL);

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
