import { findNode, getElementDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

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
      const liEntry = findNode(editor, { match: { type } });

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
