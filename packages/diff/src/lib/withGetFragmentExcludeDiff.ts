import type { Descendant, OverrideEditor } from '@udecode/plate';

import cloneDeep from 'lodash/cloneDeep.js';

export const withGetFragmentExcludeDiff: OverrideEditor = ({
  api: { getFragment },
}) => ({
  api: {
    getFragment() {
      const fragment = cloneDeep(getFragment());

      const removeDiff = (node: Descendant) => {
        if ('diff' in node) delete node.diff;
        if ('diffOperation' in node) delete node.diffOperation;
        if ('children' in node)
          (node.children as Descendant[]).forEach(removeDiff);
      };

      fragment.forEach(removeDiff);

      return fragment;
    },
  },
});
