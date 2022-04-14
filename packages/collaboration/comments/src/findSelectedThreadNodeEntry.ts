import { getAbove, getPluginType, PlateEditor } from '@udecode/plate-core';
import { ELEMENT_THREAD } from './createThreadPlugin';

export function findSelectedThreadNodeEntry<T = {}>(editor: PlateEditor<T>) {
  const type = getPluginType(editor, ELEMENT_THREAD);
  return getAbove(editor, {
    match: { type },
  });
}
