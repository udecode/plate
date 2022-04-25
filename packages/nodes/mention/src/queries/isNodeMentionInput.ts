import { getPluginType, PlateEditor, TNode } from '@udecode/plate-core';
import { ELEMENT_MENTION_INPUT } from '../createMentionPlugin';
import { MentionInputNode } from '../types';

export const isNodeMentionInput = (
  editor: PlateEditor,
  node: TNode
): node is MentionInputNode => {
  return node.type === getPluginType(editor, ELEMENT_MENTION_INPUT);
};
