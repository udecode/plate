import {
  getNodeEntries,
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';

export function* findThreadNodeEntries<V extends Value>(
  editor: PlateEditor<V>
): Generator<NodeEntry<any>, void, undefined> {
  const type = getPluginType(editor, ELEMENT_THREAD);
  yield* getNodeEntries(editor, {
    at: [],
    match: { type },
  });
}
