import { type Descendant, type SlateEditor, ElementApi } from '@udecode/plate';

import { getListTypes } from './getListTypes';

export const isListRoot = (editor: SlateEditor, node: Descendant): boolean =>
  ElementApi.isElement(node) && getListTypes(editor).includes(node.type);
