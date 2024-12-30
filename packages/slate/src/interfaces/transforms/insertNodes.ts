import type { Modify } from '@udecode/utils';
import type { NodeInsertNodesOptions } from 'slate/dist/interfaces/transforms/node';

import { Path, Transforms, removeNodes, withoutNormalizing } from 'slate';

import type { QueryNodeOptions } from '../../types';
import type { QueryMode, QueryOptions } from '../../types/QueryOptions';
import type { TEditor, Value, ValueOf } from '../editor/TEditor';
import type { ElementOrTextIn, ElementOrTextOf } from '../element/TElement';

import { getQueryOptions, queryNode } from '../../utils';
import { getAboveNode, getEndPoint, isInline } from '../editor';
import { type TDescendant, getNodeString } from '../node';

export type InsertNodesOptions<V extends Value = Value> = {
  /**
   * Insert the nodes after the currect block. Does not apply if the removeEmpty
   * option caused the current block to be removed.
   */
  nextBlock?: boolean;

  /**
   * Remove the currect block if empty before inserting. Only applies to
   * paragraphs by default, but can be customized by passing a QueryNodeOptions
   * object.
   */
  removeEmpty?: QueryNodeOptions | boolean;
} & Modify<
  NodeInsertNodesOptions<ElementOrTextIn<V>>,
  QueryOptions<V> & QueryMode
>;

export const insertNodes = <
  N extends ElementOrTextOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  nodes: N | N[],
  { nextBlock, removeEmpty, ...options }: InsertNodesOptions<ValueOf<E>> = {}
) => {
  options = getQueryOptions(editor, options);

  withoutNormalizing(editor as any, () => {
    if (removeEmpty) {
      const blockEntry = getAboveNode(editor, { at: options.at });

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

          if (children.some((n) => isInline(editor, n))) return false;

          return !filter || filter([node, path]);
        };

        if (queryNode(blockEntry, queryNodeOptions)) {
          removeNodes(editor as any, { at: blockEntry[1] });
          nextBlock = false;
        }
      }
    }
    if (nextBlock) {
      const { at = editor.selection } = options;

      if (at) {
        const endPoint = getEndPoint(editor, at);

        const blockEntry = getAboveNode(editor, {
          at: endPoint,
          block: true,
        });

        if (blockEntry) {
          options.at = Path.next(blockEntry[1]);
        }
      }
    }

    Transforms.insertNodes(editor as any, nodes, options as any);
  });
};
