import { getNode, PlatePlugin, TElement } from '@udecode/plate-core';
import { Path } from 'slate';
import { getPreviousPath } from '../../../../core/src/common/queries/getPreviousPath';
import { IndentListPlugin } from '../createIndentListPlugin';

export const indentListPluginPage: Partial<PlatePlugin<IndentListPlugin>> = {
  then: (e) => ({
    options: {
      getSiblingIndentListOptions: {
        getPreviousEntry: ([, path]: any) => {
          const prevPath = getPreviousPath(path);
          if (!prevPath) {
            if (path[0] === 0) return;

            const prevPagePath = [path[0] - 1];

            const node = getNode(e, prevPagePath) as TElement | undefined;
            if (!node) return;

            const lastNode = node.children[node.children.length - 1];
            return [lastNode, prevPagePath.concat(node.children.length - 1)];
          }

          const prevNode = getNode(e, prevPath);
          if (!prevNode) return;

          return [prevNode, prevPath];
        },
        getNextEntry: ([, path]: any) => {
          const nextPath = Path.next(path);
          const nextNode = getNode(e, nextPath);
          if (!nextNode) {
            const nextPagePath = [path[0] + 1];
            const nextPageNode = getNode(e, nextPagePath) as
              | TElement
              | undefined;

            if (!nextPageNode) return;

            return [nextPageNode.children[0], nextPagePath.concat([0])];
          }

          return [nextNode, nextPath];
        },
      },
    },
  }),
};
