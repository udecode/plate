import type { Element } from '@platejs/slate';
import { NodeApi, PathApi } from '@platejs/slate';

import { type GetSiblingListOptions, BaseListPlugin } from '../lib';

export const listPluginPage = BaseListPlugin.extend(({ editor }) => ({
  options: {
    getSiblingListOptions: {
      getNextEntry: ([, path]: any) => {
        const nextPath = PathApi.next(path);
        const nextNode = NodeApi.getIf(editor as any, nextPath) as
          | Element
          | undefined;

        if (!nextNode) {
          const nextPagePath = [path[0] + 1];
          const nextPageNode = NodeApi.getIf(editor as any, nextPagePath) as
            | Element
            | undefined;

          if (!nextPageNode) return;

          return [nextPageNode.children[0], nextPagePath.concat([0])];
        }

        return [nextNode, nextPath];
      },
      getPreviousEntry: ([, path]: any) => {
        if (!PathApi.hasPrevious(path)) {
          if (path[0] === 0) return;

          const prevPagePath = [path[0] - 1];

          const node = NodeApi.getIf(editor as any, prevPagePath) as
            | Element
            | undefined;

          if (!node) return;

          const lastNode = node.children.at(-1);

          return [lastNode, prevPagePath.concat(node.children.length - 1)];
        }

        const prevPath = PathApi.previous(path);
        const prevNode = NodeApi.getIf(editor as any, prevPath);

        if (!prevNode) return;

        return [prevNode, prevPath];
      },
    } as GetSiblingListOptions<Element>,
  },
}));
