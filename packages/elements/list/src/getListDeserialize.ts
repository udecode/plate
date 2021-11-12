import { findNode, getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { ELEMENT_LI, ELEMENT_LIC, ELEMENT_OL, ELEMENT_UL } from './defaults';

export const getUlDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: 'UL' }],
    }),
  };
};

export const getOlDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: 'OL' }],
    }),
  };
};

export const getLiDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: 'LI' }],
    }),
    preInsert: () => {
      const liEntry = findNode(editor, { match: { type: li.type } });

      if (liEntry) {
        return true;
      }
    },
  };
};

export const getLicDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: 'LIC' }],
    }),
  };
};
