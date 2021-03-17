import { getElementDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, useEditorOptions } from '@udecode/slate-plugins-core';

export const useDeserializeTable = (): DeserializeHtml => {
  const { table, td, th, tr } = useEditorOptions();

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
