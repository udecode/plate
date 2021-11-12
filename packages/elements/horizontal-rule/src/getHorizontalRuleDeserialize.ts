import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { ELEMENT_HR } from './defaults';

export const getHorizontalRuleDeserialize = (): Deserialize => (editor) => {
  const options = getPlugin(editor, ELEMENT_HR);

  return {
    element: getElementDeserializer({
      type: ELEMENT_HR,
      rules: [{ nodeNames: 'HR' }],
    }),
  };
};
