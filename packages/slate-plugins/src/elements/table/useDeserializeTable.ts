import { getElementDeserializer } from '@udecode/slate-plugins-common';
import {
  DeserializeHtml,
  useEditorMultiOptions,
} from '@udecode/slate-plugins-core';
import { KEYS_TABLE } from './defaults';

export const useDeserializeTable = (): DeserializeHtml => {
  const { table, td, th, tr } = useEditorMultiOptions(KEYS_TABLE);

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
