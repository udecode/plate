import type { PlateEditor } from '@udecode/plate/react';

import {
  type TElement,
  type TText,
  BaseParagraphPlugin,
  isDefined,
} from '@udecode/plate';

const LIST_STYLE_TYPE = 'listStyleType';

export const isSameNode = (
  editor: PlateEditor,
  node1: TElement | TText,
  node2: TElement | TText
) => {
  if (
    node1.type !== editor.getType(BaseParagraphPlugin) ||
    node2.type !== editor.getType(BaseParagraphPlugin)
  )
    return node1.type === node2.type;

  if (isDefined(node1[LIST_STYLE_TYPE]) || isDefined(node2[LIST_STYLE_TYPE])) {
    return node1[LIST_STYLE_TYPE] === node2[LIST_STYLE_TYPE];
  }

  return node1.type === node2.type;
};
