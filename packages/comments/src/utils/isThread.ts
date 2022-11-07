import { getPluginType, PlateEditor, TNode, Value } from '@udecode/plate-core';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { TThreadElement } from '../types';

export const isThread = <V extends Value>(
  editor: PlateEditor<V>,
  node: TNode
): node is TThreadElement => {
  return node.type === getPluginType(editor, ELEMENT_THREAD);
};
