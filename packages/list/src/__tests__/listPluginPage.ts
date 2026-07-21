import { type Element, PathApi } from '@platejs/plite';

import { type GetSiblingListOptions, BaseListPlugin } from '../lib';

export const listPluginPage = BaseListPlugin.extend(({ editor }) => ({
  options: {
    getSiblingListOptions: {
      getNextEntry: ([, path]: any, state) => {
        const nodes = state?.nodes ?? editor.read.nodes;
        const nextPath = PathApi.next(path);
        const nextNode = nodes.get<Element>(nextPath)?.[0];

        if (!nextNode) {
          const nextPagePath = [path[0] + 1];
          const nextPageNode = nodes.get<Element>(nextPagePath)?.[0];

          if (!nextPageNode) return;

          return [nextPageNode.children[0], nextPagePath.concat([0])];
        }

        return [nextNode, nextPath];
      },
      getPreviousEntry: ([, path]: any, state) => {
        const nodes = state?.nodes ?? editor.read.nodes;
        const prevPath = PathApi.hasPrevious(path)
          ? PathApi.previous(path)
          : undefined;

        if (!prevPath) {
          if (path[0] === 0) return;

          const prevPagePath = [path[0] - 1];

          const node = nodes.get<Element>(prevPagePath)?.[0];

          if (!node) return;

          const lastNode = node.children.at(-1);

          return [lastNode, prevPagePath.concat(node.children.length - 1)];
        }

        const prevNode = nodes.get<Element>(prevPath)?.[0];

        if (!prevNode) return;

        return [prevNode, prevPath];
      },
    } as GetSiblingListOptions<Element>,
  },
}));
