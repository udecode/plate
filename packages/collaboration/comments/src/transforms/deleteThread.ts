import {
  getPluginType,
  PlateEditor,
  unwrapNodes,
  Value,
} from '@udecode/plate-core';
import { Location } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';

export function deleteThread<V extends Value>(
  editor: PlateEditor<V>,
  thread: Location
) {
  unwrapNodes(editor, {
    at: thread,
    match: { type: getPluginType(editor, ELEMENT_THREAD) },
  });
}
