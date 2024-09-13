import type { Path } from 'slate';

import {
  type SlateEditor,
  type TElement,
  getParentNode,
} from '@udecode/plate-common';

import { BaseListItemPlugin } from '../BaseListPlugin';

/** Is the list nested, i.e. its parent is a list item. */
export const isListNested = (editor: SlateEditor, listPath: Path) => {
  const listParentNode = getParentNode<TElement>(editor, listPath)?.[0];

  return listParentNode?.type === editor.getType(BaseListItemPlugin);
};
