import {
  getNodeEntries,
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';

export function findThreadNodeEntries<V extends Value>(
  editor: PlateEditor<V>
): NodeEntry<any>[] {
  const type = getPluginType(editor, ELEMENT_THREAD);

  return [
    ...getNodeEntries(editor, {
      at: [],
      match: { type },
    }),
  ];
}
