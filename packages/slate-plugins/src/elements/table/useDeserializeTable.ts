import { getElementDeserializer } from '@udecode/slate-plugins-common';
import { Deserialize, getOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';

export const useDeserializeTable = (): Deserialize => (editor: Editor) => {
  const { table, td, th, tr } = getOptions(editor);

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
