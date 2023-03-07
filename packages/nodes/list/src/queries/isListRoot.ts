import {
  isElement,
  PlateEditor,
  TDescendant,
  Value,
} from '@udecode/plate-common';
import { getListTypes } from './getListTypes';

export const isListRoot = <V extends Value>(
  editor: PlateEditor<V>,
  node: TDescendant
): boolean => isElement(node) && getListTypes(editor).includes(node.type);
