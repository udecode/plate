import { PlateEditor, TDescendant } from '@udecode/plate-core';
import { getListTypes } from './getListTypes';

export const isListRoot = (editor: PlateEditor, node: TDescendant): boolean =>
  getListTypes(editor).includes(node.type);
