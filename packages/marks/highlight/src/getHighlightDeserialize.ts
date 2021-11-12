import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { MARK_HIGHLIGHT } from './defaults';

export const getHighlightDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    leaf: getLeafDeserializer({
      type,
      rules: [{ nodeNames: ['MARK'] }],
    }),
  };
};
