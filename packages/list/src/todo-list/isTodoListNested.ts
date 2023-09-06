import {
  getParentNode,
  getPluginType,
  PlateEditor,
  TElement,
  Value,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { ELEMENT_TODO_LI } from '.';

/**
 * Is the todo list nested, i.e. its parent is a todo list item.
 */
export const isTodoListNested = <V extends Value>(
  editor: PlateEditor<V>,
  listPath: Path
) => {
  const listParentNode = getParentNode<TElement>(editor, listPath)?.[0];

  return listParentNode?.type === getPluginType(editor, ELEMENT_TODO_LI);
};
