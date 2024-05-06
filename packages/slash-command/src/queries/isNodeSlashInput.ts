import {
  type PlateEditor,
  type TNode,
  type Value,
  getPluginType,
} from '@udecode/plate-common';

import type { TSlashInputElement } from '../types';

import { ELEMENT_SLASH_INPUT } from '../createSlashPlugin';

export const isNodeSlashInput = <V extends Value>(
  editor: PlateEditor<V>,
  node: TNode
): node is TSlashInputElement => {
  return node.type === getPluginType(editor, ELEMENT_SLASH_INPUT);
};
