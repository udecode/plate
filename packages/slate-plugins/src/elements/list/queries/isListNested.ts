import { Editor, Path } from 'slate';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';

/**
 * Is the list nested, i.e. its parent is a list item.
 */
export const isListNested = (
  editor: Editor,
  listPath: Path,
  options?: ListOptions
) => {
  const { li } = setDefaults(options, DEFAULTS_LIST);

  const [listParentNode] = Editor.parent(editor, listPath);

  return listParentNode.type === li.type;
};
