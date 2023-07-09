import {
  PlateEditor,
  TDescendant,
  Value,
  isElement,
} from '@udecode/plate-common';

import { getListTypes } from './getListTypes';

export const isListRoot = <V extends Value>(
  editor: PlateEditor<V>,
  node: TDescendant
): boolean => isElement(node) && getListTypes(editor).includes(node.type);
