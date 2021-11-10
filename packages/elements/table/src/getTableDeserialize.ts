import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH, ELEMENT_TR } from './defaults';

export const getTableDeserialize = (): Deserialize => (editor) => {
  const table = getPlatePluginOptions(editor, ELEMENT_TABLE);

  return {
    element: getElementDeserializer({
      type: table.type,
      rules: [{ nodeNames: 'TABLE' }],
      ...table.deserialize,
    }),
  };
};

export const getTrDeserialize = (): Deserialize => (editor) => {
  const tr = getPlatePluginOptions(editor, ELEMENT_TR);

  return {
    element: getElementDeserializer({
      type: tr.type,
      rules: [{ nodeNames: 'TR' }],
      ...tr.deserialize,
    }),
  };
};

export const getTdDeserialize = (): Deserialize => (editor) => {
  const td = getPlatePluginOptions(editor, ELEMENT_TD);

  return {
    element: getElementDeserializer({
      type: td.type,
      attributeNames: ['rowspan', 'colspan'],
      rules: [{ nodeNames: 'TD' }],
      ...td.deserialize,
    }),
  };
};

export const getThDeserialize = (): Deserialize => (editor) => {
  const th = getPlatePluginOptions(editor, ELEMENT_TH);

  return {
    element: getElementDeserializer({
      type: th.type,
      attributeNames: ['rowspan', 'colspan'],
      rules: [{ nodeNames: 'TH' }],
      ...th.deserialize,
    }),
  };
};
