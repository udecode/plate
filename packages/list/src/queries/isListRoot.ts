import {
  type PlateEditor,
  type TDescendant,
  type Value,
  isElement,
} from '@udecode/plate-common/server';

import { getListTypes } from './getListTypes';

export const isListRoot = <V extends Value>(
  editor: PlateEditor<V>,
  node: TDescendant
): boolean => isElement(node) && getListTypes(editor).includes(node.type);
