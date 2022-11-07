import {
  getNodeEntries,
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_THREAD } from '../createThreadPlugin';

export const getThreadNodeEntries = <V extends Value>(
  editor: PlateEditor<V>
) => {
  const type = getPluginType(editor, ELEMENT_THREAD);

  return [
    ...getNodeEntries(editor, {
      at: [],
      match: { type },
    }),
  ];
};
