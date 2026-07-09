import cloneDeep from 'lodash/cloneDeep.js';

import { type Descendant, ElementApi } from '@platejs/plite';

export const withGetFragmentExcludeDiff = (
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
