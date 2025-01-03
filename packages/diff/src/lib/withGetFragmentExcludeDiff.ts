import type { ExtendEditorApi, TDescendant } from '@udecode/plate-common';

import cloneDeep from 'lodash/cloneDeep.js';

export const withGetFragmentExcludeDiff: ExtendEditorApi = ({
  api: { getFragment },
}) => ({
  getFragment() {
    const fragment = cloneDeep(getFragment());

    const removeDiff = (node: TDescendant) => {
      if ('diff' in node) delete node.diff;
      if ('diffOperation' in node) delete node.diffOperation;
      if ('children' in node)
        (node.children as TDescendant[]).forEach(removeDiff);
    };

    fragment.forEach(removeDiff);

    return fragment;
  },
});
