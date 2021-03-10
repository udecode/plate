import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Path } from 'slate';

/**
 * Is the list nested, i.e. its parent is a list item.
 */
export const isListNested = (
  editor: Editor,
  listPath: Path,
  { li }: SlatePluginsOptions
) => {
  const [listParentNode] = Editor.parent(editor, listPath);

  return listParentNode.type === li.type;
};
