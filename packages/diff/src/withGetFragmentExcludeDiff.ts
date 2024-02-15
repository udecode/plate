import cloneDeep from 'lodash/cloneDeep.js';
import { BaseEditor, Descendant } from 'slate';

// Uses BaseEditor to be compatible with non-Plate editors
export const withGetFragmentExcludeDiff = <E extends BaseEditor>(
  editor: E
): E => {
  const { getFragment } = editor;

  editor.getFragment = () => {
    const fragment = cloneDeep(getFragment());

    const removeDiff = (node: Descendant) => {
      if ('diff' in node) delete node.diff;
      if ('diffOperation' in node) delete node.diffOperation;
      if ('children' in node) node.children.forEach(removeDiff);
    };

    fragment.forEach(removeDiff);
    return fragment;
  };

  return editor;
};
