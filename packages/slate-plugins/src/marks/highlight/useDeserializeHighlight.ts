import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, useEditorOptions } from '@udecode/slate-plugins-core';
import { MARK_HIGHLIGHT } from './defaults';

export const useDeserializeHighlight = (): DeserializeHtml => {
  const options = useEditorOptions(MARK_HIGHLIGHT);

  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [{ nodeNames: ['MARK'] }],
      ...options.deserialize,
    }),
  };
};
