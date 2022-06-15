import {
  getPluginType,
  PlateEditor,
  unwrapNodes,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_THREAD } from '../createThreadPlugin';

export function deleteThreadAtSelection<V extends Value>(
  editor: PlateEditor<V>
) {
  unwrapNodes(editor, {
    at: editor.selection!,
    match: { type: getPluginType(editor, ELEMENT_THREAD) },
  });
}
