import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import { Deserialize, getPluginOptions } from '@udecode/slate-plugins-core';
import { MARK_HIGHLIGHT } from './defaults';

export const useDeserializeHighlight = (): Deserialize => (editor) => {
  const options = getPluginOptions(editor, MARK_HIGHLIGHT);

  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [{ nodeNames: ['MARK'] }],
      ...options.deserialize,
    }),
  };
};
