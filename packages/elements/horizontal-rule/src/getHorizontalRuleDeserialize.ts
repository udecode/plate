import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

export const getHorizontalRuleDeserialize = (): Deserialize => (
  editor,
  { type }
) => ({
  element: getElementDeserializer({
    type: type!,
    rules: [{ nodeNames: 'HR' }],
  }),
});
