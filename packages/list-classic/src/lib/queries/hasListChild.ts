import { type Element, ElementApi } from '@platejs/slate';
import type { SlateEditor } from '@platejs/core';

import { getListTypes } from './getListTypes';

/** Is there a list child in the node. */
export const hasListChild = (editor: SlateEditor, node: Element) =>
  node.children.some(
    (child) =>
      ElementApi.isElement(child) && getListTypes(editor).includes(child.type)
  );
