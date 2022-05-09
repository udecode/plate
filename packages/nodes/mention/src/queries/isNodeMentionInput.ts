import { getPluginType, PlateEditor, TNode, Value } from '@udecode/plate-core';
import { ELEMENT_MENTION_INPUT } from '../createMentionPlugin';
import { TMentionInputElement } from '../types';

export const isNodeMentionInput = <V extends Value>(
  editor: PlateEditor<V>,
  node: TNode
): node is TMentionInputElement => {
  return node.type === getPluginType(editor, ELEMENT_MENTION_INPUT);
};
