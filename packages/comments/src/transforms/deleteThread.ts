import {
  getPluginType,
  PlateEditor,
  unwrapNodes,
  UnwrapNodesOptions,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_THREAD } from '../createThreadPlugin';

export const deleteThread = <V extends Value>(
  editor: PlateEditor<V>,
  options?: UnwrapNodesOptions<V>
) => {
  unwrapNodes(editor, {
    match: { type: getPluginType(editor, ELEMENT_THREAD) },
    ...options,
  });
};
