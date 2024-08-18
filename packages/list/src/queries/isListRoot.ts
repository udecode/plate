import {
  type SlateEditor,
  type TDescendant,
  isElement,
} from '@udecode/plate-common';

import { getListTypes } from './getListTypes';

export const isListRoot = (editor: SlateEditor, node: TDescendant): boolean =>
  isElement(node) && getListTypes(editor).includes(node.type);
