import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';

export const getHeadingDeserialize = (pluginKey: string): Deserialize => (
  editor
) => {
  const { type, deserialize } = getPlatePluginOptions(editor, pluginKey);

  return {
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: pluginKey.toUpperCase() }],
      ...deserialize,
    }),
  };
};
