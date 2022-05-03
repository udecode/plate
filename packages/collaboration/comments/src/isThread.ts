import { getPluginType, PlateEditor, TNode } from '@udecode/plate-core';
import { ELEMENT_THREAD } from './createThreadPlugin';
import { ThreadNode } from './types';

export function isThread<T>(
  editor: PlateEditor<T>,
  node: TNode
): node is ThreadNode {
  return node.type === getPluginType(editor, ELEMENT_THREAD);
}
