import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { ELEMENT_HR } from './defaults';

export const getHorizontalRuleDeserialize = (): Deserialize => (editor) => {
  const options = getPlatePluginOptions(editor, ELEMENT_HR);

  return {
    element: getElementDeserializer({
      type: ELEMENT_HR,
      rules: [{ nodeNames: 'HR' }],
      ...options.deserialize,
    }),
  };
};
