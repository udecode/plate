import { insertNodes as insertNodesBase } from 'slate';

import {
  type Descendant,
  type Editor,
  type ElementOrTextOf,
  type InsertNodesOptions,
  type ValueOf,
  NodeApi,
  PathApi,
} from '../../interfaces';
import { type QueryNodeOptions, getQueryOptions, queryNode } from '../../utils';

export const insertNodes = <
  N extends ElementOrTextOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  nodes: N | N[],
  { nextBlock, removeEmpty, ...options }: InsertNodesOptions<ValueOf<E>> = {}
) => {
  options = getQueryOptions(editor, options);

  editor.tf.withoutNormalizing(() => {
    if (removeEmpty) {
      const blockEntry = editor.api.above({ at: options.at });

      if (blockEntry) {
        const queryNodeOptions: QueryNodeOptions =
          removeEmpty === true
            ? {
                allow: ['p'],
              }
            : removeEmpty;

        const { filter } = queryNodeOptions;

        queryNodeOptions.filter = ([node, path]) => {
          if (NodeApi.string(node)) return false;

          const children = node.children as Descendant[];

          if (children.some((n) => editor.api.isInline(n))) return false;

          return !filter || filter([node, path]);
        };

        if (queryNode(blockEntry, queryNodeOptions)) {
          editor.tf.removeNodes({ at: blockEntry[1] });
          nextBlock = false;
        }
      }
    }
    if (nextBlock) {
      const { at = editor.selection } = options;

      if (at) {
        const endPoint = editor.api.end(at);

        const blockEntry = editor.api.above({
          at: endPoint,
          block: true,
        });

        if (blockEntry) {
          options.at = PathApi.next(blockEntry[1]);
        }
      }
    }

    insertNodesBase(editor as any, nodes, options as any);
  });
};
