import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH, ELEMENT_TR } from './defaults';

export const getTableDeserialize = (): Deserialize => (editor) => {
  const table = getPlatePluginOptions(editor, ELEMENT_TABLE);
  const td = getPlatePluginOptions(editor, ELEMENT_TD);
  const th = getPlatePluginOptions(editor, ELEMENT_TH);
  const tr = getPlatePluginOptions(editor, ELEMENT_TR);

  return {
    element: [
      ...getElementDeserializer({
        type: table.type,
        rules: [{ nodeNames: 'TABLE' }],
        ...table.deserialize,
      }),
      ...getElementDeserializer({
        type: tr.type,
        rules: [{ nodeNames: 'TR' }],
        ...tr.deserialize,
      }),
      ...getElementDeserializer({
        type: td.type,
        attributeNames: ['rowspan', 'colspan'],
        rules: [{ nodeNames: 'TD' }],
        ...td.deserialize,
      }),
      ...getElementDeserializer({
        type: th.type,
        attributeNames: ['rowspan', 'colspan'],
        rules: [{ nodeNames: 'TH' }],
        ...th.deserialize,
      }),
    ],
  };
};
