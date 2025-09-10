import type { PlateEditor } from 'platejs/react';

import { type TElement, type TText, isDefined, KEYS } from 'platejs';

const LIST_STYLE_TYPE = 'listStyleType';

export const isSameNode = (
  editor: PlateEditor,
  node1: TElement | TText,
  node2: TElement | TText
) => {
  if (
    node1.type !== editor.getType(KEYS.p) ||
    node2.type !== editor.getType(KEYS.p)
  )
    return node1.type === node2.type;

  if (isDefined(node1[LIST_STYLE_TYPE]) || isDefined(node2[LIST_STYLE_TYPE])) {
    return node1[LIST_STYLE_TYPE] === node2[LIST_STYLE_TYPE];
  }

  return node1.type === node2.type;
};
