import {
  defaultsDeepToNodes,
  queryNode,
  someNode,
} from '@udecode/plate-common';
import { TNode, WithOverride } from '@udecode/plate-core';
import cloneDeep from 'lodash/cloneDeep';
import { NodeEntry } from 'slate';
import { NodeIdPlugin } from './createNodeIdPlugin';

/**
 * Enables support for inserting nodes with an id key.
 */
export const withNodeId = (): WithOverride<{}, NodeIdPlugin> => (
  editor,
  {
    options: {
      idKey = '',
      idCreator,
      filterText,
      filter,
      reuseId,
      allow,
      exclude,
    },
  }
) => {
  const { apply } = editor;

  const idPropsCreator = () => ({ [idKey]: idCreator!() });

  const filterNode = (nodeEntry: NodeEntry<TNode>) => {
    return (
      filter!(nodeEntry) && (!filterText || nodeEntry[0]?.type !== undefined)
    );
  };

  const query = {
    filter: filterNode,
    allow,
    exclude,
  };

  editor.apply = (operation) => {
    if (operation.type === 'insert_node') {
      // clone to be able to write (read-only)
      const node = cloneDeep(operation.node) as TNode;

      // the id in the new node is already being used in the editor, we need to replace it with a new id
      if (
        !reuseId ||
        someNode(editor, { match: { [idKey]: node[idKey] }, at: [] })
      ) {
        delete node[idKey];
      }

      defaultsDeepToNodes({
        node,
        source: idPropsCreator,
        query,
      });

      return apply({
        ...operation,
        node,
      });
    }

    if (operation.type === 'split_node') {
      const node = operation.properties as TNode;

      // only for elements (node with a type) or all nodes if `filterText=false`
      if (queryNode([node, []], query)) {
        let id = operation.properties[idKey];

        /**
         * Create a new id if:
         * - the id in the new node is already being used in the editor or,
         * - the node has no id
         */
        if (
          !reuseId ||
          id === undefined ||
          someNode(editor, {
            match: { [idKey]: id },
            at: [],
          })
        ) {
          id = idCreator!();
        }

        return apply({
          ...operation,
          properties: {
            ...operation.properties,
            [idKey]: id,
          },
        });
      }
    }

    return apply(operation);
  };

  return editor;
};
