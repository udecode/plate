import {
  getPluginType,
  PlateEditor,
  unwrapNodes,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_THREAD } from '../createThreadPlugin';

export const deleteThreadAtSelection = <V extends Value>(
  editor: PlateEditor<V>
): void => {
  unwrapNodes(editor, {
    at: editor.selection!,
    match: { type: getPluginType(editor, ELEMENT_THREAD) },
  });
};
