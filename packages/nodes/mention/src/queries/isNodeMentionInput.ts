import { getPluginType, PlateEditor, TNode, Value } from '@udecode/plate-core';
import { ELEMENT_MENTION_INPUT } from '../createMentionPlugin';
import { MentionInputNode } from '../types';

export const isNodeMentionInput = <V extends Value>(
  editor: PlateEditor<V>,
  node: TNode
): node is MentionInputNode => {
  return node.type === getPluginType(editor, ELEMENT_MENTION_INPUT);
};
