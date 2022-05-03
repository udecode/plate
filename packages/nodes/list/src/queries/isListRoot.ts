import { PlateEditor, TDescendant, Value } from '@udecode/plate-core';
import { getListTypes } from './getListTypes';

export const isListRoot = <V extends Value>(
  editor: PlateEditor<V>,
  node: TDescendant
): boolean => getListTypes(editor).includes(node.type);
