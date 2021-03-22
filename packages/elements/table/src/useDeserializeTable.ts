import { getElementDeserializer } from '@udecode/slate-plugins-common';
import { Deserialize, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH, ELEMENT_TR } from './defaults';

export const useDeserializeTable = (): Deserialize => (editor: Editor) => {
  const table = getPluginOptions(editor, ELEMENT_TABLE);
  const td = getPluginOptions(editor, ELEMENT_TD);
  const th = getPluginOptions(editor, ELEMENT_TH);
  const tr = getPluginOptions(editor, ELEMENT_TR);

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
