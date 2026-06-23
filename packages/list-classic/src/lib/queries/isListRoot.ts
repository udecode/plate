import type { Descendant } from '@platejs/slate';
import type { SlateEditor } from '@platejs/core';
import { ElementApi } from '@platejs/slate';

import { getListTypes } from './getListTypes';

export const isListRoot = (editor: SlateEditor, node: Descendant): boolean =>
  ElementApi.isElement(node) && getListTypes(editor).includes(node.type);
