import { getElementDeserializer } from '@udecode/slate-plugins-common';
import {
  Deserialize,
  getSlatePluginOptions,
} from '@udecode/slate-plugins-core';
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH, ELEMENT_TR } from './defaults';

export const getTableDeserialize = (): Deserialize => (editor) => {
  const table = getSlatePluginOptions(editor, ELEMENT_TABLE);
  const td = getSlatePluginOptions(editor, ELEMENT_TD);
  const th = getSlatePluginOptions(editor, ELEMENT_TH);
  const tr = getSlatePluginOptions(editor, ELEMENT_TR);

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
