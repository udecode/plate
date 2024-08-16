import type { Path } from 'slate';

import {
  type PlateEditor,
  type TElement,
  getParentNode,
} from '@udecode/plate-common';

import { ListItemPlugin } from '../ListPlugin';

/** Is the list nested, i.e. its parent is a list item. */
export const isListNested = (editor: PlateEditor, listPath: Path) => {
  const listParentNode = getParentNode<TElement>(editor, listPath)?.[0];

  return listParentNode?.type === editor.getType(ListItemPlugin);
};
