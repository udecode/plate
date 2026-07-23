import cloneDeep from 'lodash/cloneDeep.js';

import {
  type Descendant,
  defineEditorExtension,
  ElementApi,
} from '@platejs/plite';

export const excludeDiffFromFragment = (
  fragment: readonly Descendant[]
): Descendant[] => {
  const removeDiff = (node: Descendant): Descendant => {
    const nextNode = Object.fromEntries(
      Object.entries(node).filter(
        ([key]) => key !== 'diff' && key !== 'diffIntent'
      )
    ) as Descendant;

    return ElementApi.isElement(nextNode)
      ? {
          ...nextNode,
          children: nextNode.children.map(removeDiff),
        }
      : nextNode;
  };

  return (cloneDeep(fragment) as Descendant[]).map(removeDiff);
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
