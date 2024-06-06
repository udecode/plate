import type { TEditor } from '@udecode/plate-common/server';
import type { BaseEditor, Descendant } from 'slate';

import cloneDeep from 'lodash/cloneDeep.js';

// Uses BaseEditor to be compatible with non-Plate editors
export const withGetFragmentExcludeDiff = <E extends BaseEditor | TEditor>(
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
