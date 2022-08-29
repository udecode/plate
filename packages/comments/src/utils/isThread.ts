import { getPluginType, PlateEditor, TNode, Value } from '@udecode/plate-core';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { ThreadElement } from '../types';

export function isThread<V extends Value>(
  editor: PlateEditor<V>,
  node: TNode
): node is ThreadElement {
  return node.type === getPluginType(editor, ELEMENT_THREAD);
}
