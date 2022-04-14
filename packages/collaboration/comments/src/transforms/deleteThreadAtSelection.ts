import { getPluginType, PlateEditor, unwrapNodes } from '@udecode/plate-core';
import { ELEMENT_THREAD } from '../createThreadPlugin';

export function deleteThreadAtSelection<T = {}>(editor: PlateEditor<T>) {
  unwrapNodes(editor, {
    at: editor.selection!,
    match: { type: getPluginType(editor, ELEMENT_THREAD) },
  });
}
