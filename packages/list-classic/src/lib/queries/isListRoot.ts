import type { BaseEditor } from '@platejs/core';
import { type Descendant, ElementApi } from 'platejs';

import { getListTypes } from './getListTypes';

export const isListRoot = (editor: BaseEditor, node: Descendant): boolean =>
  ElementApi.isElement(node) && getListTypes(editor).includes(node.type);
