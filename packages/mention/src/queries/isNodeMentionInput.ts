import {
  type PlateEditor,
  type TNode,
  type Value,
  getPluginType,
} from '@udecode/plate-common';

import type { TMentionInputElement } from '../types';

import { ELEMENT_MENTION_INPUT } from '../createMentionPlugin';

export const isNodeMentionInput = <V extends Value>(
  editor: PlateEditor<V>,
  node: TNode
): node is TMentionInputElement => {
  return node.type === getPluginType(editor, ELEMENT_MENTION_INPUT);
};
