import {
  getPluginType,
  PlateEditor,
  TNode,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_SLASH_INPUT } from '../createSlashPlugin';
import { TSlashInputElement } from '../types';

export const isNodeSlashInput = <V extends Value>(
  editor: PlateEditor<V>,
  node: TNode
): node is TSlashInputElement => {
  return node.type === getPluginType(editor, ELEMENT_SLASH_INPUT);
};
