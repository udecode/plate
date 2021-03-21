import { getParent } from '@udecode/slate-plugins-common';
import { getPluginType, TElement } from '@udecode/slate-plugins-core';
import { Editor, Path } from 'slate';
import { ELEMENT_LI } from '../defaults';

/**
 * Is the list nested, i.e. its parent is a list item.
 */
export const isListNested = (editor: Editor, listPath: Path) => {
  const listParentNode = getParent<TElement>(editor, listPath)?.[0];

  return listParentNode?.type === getPluginType(editor, ELEMENT_LI);
};
