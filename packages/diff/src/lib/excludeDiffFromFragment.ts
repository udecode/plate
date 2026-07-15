import cloneDeep from 'lodash/cloneDeep.js';

import {
  type Descendant,
  defineEditorExtension,
  ElementApi,
} from '@platejs/plite';

export const excludeDiffFromFragment = (
  fragment: readonly Descendant[]
): Descendant[] => {
  const nextFragment = cloneDeep(fragment) as Descendant[];

  const removeDiff = (node: Descendant) => {
    if ('diff' in node) node.diff = undefined;
    if ('diffOperation' in node) node.diffOperation = undefined;
    if (ElementApi.isElement(node)) node.children.forEach(removeDiff);
  };

  nextFragment.forEach(removeDiff);

  return nextFragment;
};

/** Remove diff metadata from fragments copied out of an editor. */
export const createExcludeDiffFragmentExtension = () =>
  defineEditorExtension({
    name: 'exclude-diff-fragment',
    queries: {
      fragment: {
        get: ({ next }) => excludeDiffFromFragment(next()),
      },
    },
  });
