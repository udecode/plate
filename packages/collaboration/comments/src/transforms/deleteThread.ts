import { getPluginType, PlateEditor, unwrapNodes } from '@udecode/plate-core';
import { Location } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';

export function deleteThread<T = {}>(editor: PlateEditor<T>, thread: Location) {
  unwrapNodes(editor, {
    at: thread,
    match: { type: getPluginType(editor, ELEMENT_THREAD) },
  });
}
