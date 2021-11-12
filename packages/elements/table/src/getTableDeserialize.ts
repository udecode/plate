import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

export const getTableDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: 'TABLE' }],
    }),
  };
};

export const getTrDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: 'TR' }],
    }),
  };
};

export const getTdDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    element: getElementDeserializer({
      type,
      attributeNames: ['rowspan', 'colspan'],
      rules: [{ nodeNames: 'TD' }],
    }),
  };
};

export const getThDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    element: getElementDeserializer({
      type,
      attributeNames: ['rowspan', 'colspan'],
      rules: [{ nodeNames: 'TH' }],
    }),
  };
};
