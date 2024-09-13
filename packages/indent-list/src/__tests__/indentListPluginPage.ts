import { type TElement, getNode, getPreviousPath } from '@udecode/plate-common';
import { Path } from 'slate';

import { type GetSiblingIndentListOptions, BaseIndentListPlugin } from '../lib';

export const indentListPluginPage = BaseIndentListPlugin.extend(
  ({ editor }) => ({
    options: {
      getSiblingIndentListOptions: {
        getNextEntry: ([, path]: any) => {
          const nextPath = Path.next(path);
          const nextNode = getNode<TElement>(editor, nextPath);

          if (!nextNode) {
            const nextPagePath = [path[0] + 1];
            const nextPageNode = getNode<TElement>(editor, nextPagePath);

            if (!nextPageNode) return;

            return [nextPageNode.children[0], nextPagePath.concat([0])];
          }

          return [nextNode, nextPath];
        },
        getPreviousEntry: ([, path]: any) => {
          const prevPath = getPreviousPath(path);

          if (!prevPath) {
            if (path[0] === 0) return;

            const prevPagePath = [path[0] - 1];

            const node = getNode<TElement>(editor, prevPagePath);

            if (!node) return;

            const lastNode = node.children.at(-1);

            return [lastNode, prevPagePath.concat(node.children.length - 1)];
          }

          const prevNode = getNode(editor, prevPath);

          if (!prevNode) return;

          return [prevNode, prevPath];
        },
      } as GetSiblingIndentListOptions<TElement>,
    },
  })
);
