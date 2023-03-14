import {
  getNode,
  getPreviousPath,
  PlatePlugin,
  TElement,
  Value,
} from '@udecode/plate-common';
import { Path } from 'slate';
import { IndentListPlugin } from '../createIndentListPlugin';
import { GetSiblingIndentListOptions } from '../queries/getSiblingIndentList';

export const indentListPluginPage: Partial<PlatePlugin<IndentListPlugin>> = {
  then: (e) => ({
    options: {
      getSiblingIndentListOptions: {
        getPreviousEntry: ([, path]: any) => {
          const prevPath = getPreviousPath(path);
          if (!prevPath) {
            if (path[0] === 0) return;

            const prevPagePath = [path[0] - 1];

            const node = getNode<TElement>(e, prevPagePath);
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
          const nextNode = getNode<TElement>(e, nextPath);
          if (!nextNode) {
            const nextPagePath = [path[0] + 1];
            const nextPageNode = getNode<TElement>(e, nextPagePath);

            if (!nextPageNode) return;

            return [nextPageNode.children[0], nextPagePath.concat([0])];
          }

          return [nextNode, nextPath];
        },
      } as GetSiblingIndentListOptions<TElement, Value>,
    },
  }),
};
