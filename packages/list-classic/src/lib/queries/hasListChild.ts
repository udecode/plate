import type { BaseEditor } from '@platejs/core';
import { type Element, ElementApi } from '@platejs/plite';

import { getListTypes } from './getListTypes';

/** Is there a list child in the node. */
export const hasListChild = (editor: BaseEditor, node: Element) =>
  node.children.some(
    (child) =>
      ElementApi.isElement(child) && getListTypes(editor).includes(child.type)
  );
