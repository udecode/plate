import { getElementDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, getOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';

export const useDeserializeTable = (): DeserializeHtml => (editor: Editor) => {
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
        attributes: ['rowspan', 'colspan'],
        rules: [{ nodeNames: 'TD' }],
        ...td.deserialize,
      }),
      ...getElementDeserializer({
        type: th.type,
        attributes: ['rowspan', 'colspan'],
        rules: [{ nodeNames: 'TH' }],
        ...th.deserialize,
      }),
    ],
  };
};
