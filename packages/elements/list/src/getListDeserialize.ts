import { getElementDeserializer } from '@udecode/slate-plugins-common';
import {
  Deserialize,
  getSlatePluginOptions,
} from '@udecode/slate-plugins-core';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from './defaults';

export const getListDeserialize = (): Deserialize => (editor) => {
  const li = getSlatePluginOptions(editor, ELEMENT_LI);
  const ul = getSlatePluginOptions(editor, ELEMENT_UL);
  const ol = getSlatePluginOptions(editor, ELEMENT_OL);

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
