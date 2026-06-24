import type { Descendant } from '@platejs/plite';
import type { BasePlateEditor } from '@platejs/core';
import { ElementApi } from '@platejs/plite';

import { getListTypes } from './getListTypes';

export const isListRoot = (
  editor: BasePlateEditor,
  node: Descendant
): boolean =>
  ElementApi.isElement(node) && getListTypes(editor).includes(node.type);
