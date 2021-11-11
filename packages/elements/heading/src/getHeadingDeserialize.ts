import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';

export const getHeadingDeserialize = (key: string): Deserialize => (editor) => {
  const { type, deserialize } = getPlatePluginOptions(editor, key);

  return {
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: key.toUpperCase() }],
      ...deserialize,
    }),
  };
};
