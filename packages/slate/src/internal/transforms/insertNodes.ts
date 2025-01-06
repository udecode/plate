import {
  Path,
  insertNodes as insertNodesBase,
  withoutNormalizing,
} from 'slate';

import type { InsertNodesOptions } from '../../interfaces/editor/editor-types';
import type { QueryNodeOptions } from '../../types';

import {
  type ElementOrTextOf,
  type TDescendant,
  type Editor,
  type ValueOf,
  getNodeString,
} from '../../interfaces';
import { getQueryOptions, queryNode } from '../../utils';

export const insertNodes = <
  N extends ElementOrTextOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  nodes: N | N[],
  { nextBlock, removeEmpty, ...options }: InsertNodesOptions<ValueOf<E>> = {}
) => {
  options = getQueryOptions(editor, options);

  withoutNormalizing(editor as any, () => {
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
          if (getNodeString(node)) return false;

          const children = node.children as TDescendant[];

          if (children.some((n) => editor.isInline(n))) return false;

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
          options.at = Path.next(blockEntry[1]);
        }
      }
    }

    insertNodesBase(editor as any, nodes, options as any);
  });
};
