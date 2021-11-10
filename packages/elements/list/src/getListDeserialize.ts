import { findNode, getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { ELEMENT_LI, ELEMENT_LIC, ELEMENT_OL, ELEMENT_UL } from './defaults';

export const getUlDeserialize = (): Deserialize => (editor) => {
  const ul = getPlatePluginOptions(editor, ELEMENT_UL);

  return {
    element: getElementDeserializer({
      type: ul.type,
      rules: [{ nodeNames: 'UL' }],
      ...ul.deserialize,
    }),
  };
};

export const getOlDeserialize = (): Deserialize => (editor) => {
  const ol = getPlatePluginOptions(editor, ELEMENT_OL);

  return {
    element: getElementDeserializer({
      type: ol.type,
      rules: [{ nodeNames: 'OL' }],
      ...ol.deserialize,
    }),
  };
};

export const getLiDeserialize = (): Deserialize => (editor) => {
  const li = getPlatePluginOptions(editor, ELEMENT_LI);

  return {
    element: getElementDeserializer({
      type: li.type,
      rules: [{ nodeNames: 'LI' }],
      ...li.deserialize,
    }),
    preInsert: () => {
      const liEntry = findNode(editor, { match: { type: li.type } });

      if (liEntry) {
        return true;
      }
    },
  };
};

export const getLicDeserialize = (): Deserialize => (editor) => {
  const lic = getPlatePluginOptions(editor, ELEMENT_LIC);

  return {
    element: getElementDeserializer({
      type: lic.type,
      rules: [{ nodeNames: 'LIC' }],
      ...lic.deserialize,
    }),
  };
};
