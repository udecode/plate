import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor, Path } from 'slate';
import { ELEMENT_LI } from '../defaults';

/**
 * Is the list nested, i.e. its parent is a list item.
 */
export const isListNested = (editor: Editor, listPath: Path) => {
  const [listParentNode] = Editor.parent(editor, listPath);

  return listParentNode.type === getPluginType(editor, ELEMENT_LI);
};
