import {
  type PlatePlugin,
  type TElement,
  type Value,
  getNode,
  getPreviousPath,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import type { IndentListPlugin } from '../createIndentListPlugin';
import type { GetSiblingIndentListOptions } from '../queries/getSiblingIndentList';

export const indentListPluginPage: Partial<PlatePlugin<IndentListPlugin>> = {
  then: (e) => ({
    options: {
      getSiblingIndentListOptions: {
        getNextEntry: ([, path]: any) => {
          const nextPath = Path.next(path);
          const nextNode = getNode<TElement>(e, nextPath);

          if (!nextNode) {
            const nextPagePath = [path[0] + 1];
            const nextPageNode = getNode<TElement>(e, nextPagePath);

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

            const node = getNode<TElement>(e, prevPagePath);

            if (!node) return;

            const lastNode = node.children.at(-1);

            return [lastNode, prevPagePath.concat(node.children.length - 1)];
          }

          const prevNode = getNode(e, prevPath);

          if (!prevNode) return;

          return [prevNode, prevPath];
        },
      } as GetSiblingIndentListOptions<TElement, Value>,
    },
  }),
};
