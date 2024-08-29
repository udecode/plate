import type { ExtendEditor, TDescendant } from '@udecode/plate-common';

import cloneDeep from 'lodash/cloneDeep.js';

// Uses BaseEditor to be compatible with non-Plate editors
export const withGetFragmentExcludeDiff: ExtendEditor = ({ editor }) => {
  const { getFragment } = editor;

  editor.getFragment = () => {
    const fragment = cloneDeep(getFragment());

    const removeDiff = (node: TDescendant) => {
      if ('diff' in node) delete node.diff;
      if ('diffOperation' in node) delete node.diffOperation;
      if ('children' in node)
        (node.children as TDescendant[]).forEach(removeDiff);
    };

    fragment.forEach(removeDiff);

    return fragment;
  };

  return editor;
};
