import cloneDeep from 'lodash/cloneDeep.js';

import {
  ContentSlice,
  type Descendant,
  defineExtension,
  editorReads,
  ElementApi,
} from '../..';

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
export const excludeDiffFragment = () =>
  defineExtension('exclude-diff-fragment', {
    readMiddleware: ({ around }) => [
      around(editorReads.slice.export, ({ next }) => {
        const slice = next();

        return ContentSlice.fromJSON({
          ...slice,
          content: excludeDiffFromFragment(slice.content),
          ...(slice.roots
            ? {
                roots: Object.fromEntries(
                  Object.entries(slice.roots).map(([root, children]) => [
                    root,
                    excludeDiffFromFragment(children),
                  ])
                ),
              }
            : {}),
        });
      }),
    ],
  });
