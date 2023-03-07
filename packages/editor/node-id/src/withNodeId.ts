import {
  applyDeepToNodes,
  defaultsDeepToNodes,
  PlateEditor,
  queryNode,
  someNode,
  TDescendant,
  TNode,
  TNodeEntry,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import cloneDeep from 'lodash/cloneDeep';
import { NodeIdPlugin } from './createNodeIdPlugin';

/**
 * Enables support for inserting nodes with an id key.
 */
export const withNodeId = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
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
  }: WithPlatePlugin<NodeIdPlugin, V, E>
) => {
  const { apply } = editor;

  const idPropsCreator = () => ({ [idKey]: idCreator!() });

  const filterNode = (nodeEntry: TNodeEntry) => {
    return (
      filter!(nodeEntry) && (!filterText || nodeEntry[0]?.type !== undefined)
    );
  };

  const removeIdFromNodeIfDuplicate = <N extends TDescendant>(node: N) => {
    if (
      !reuseId ||
      someNode(editor, { match: { [idKey]: node[idKey] }, at: [] })
    ) {
      delete node[idKey];
    }
  };

  const query = {
    filter: filterNode,
    allow,
    exclude,
  };

  editor.apply = (operation) => {
    if (operation.type === 'insert_node') {
      // clone to be able to write (read-only)
      const node = cloneDeep(operation.node);

      // Delete ids from node that are already being used
      applyDeepToNodes({
        node,
        query,
        source: {},
        apply: removeIdFromNodeIfDuplicate,
      });

      defaultsDeepToNodes({
        node,
        path: operation.path,
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

      let id = operation.properties[idKey];

      // only for elements (node with a type) or all nodes if `filterText=false`
      if (queryNode([node, operation.path], query)) {
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

      // if the node is allowed, we don't want to use the same id
      if (id) {
        delete operation.properties[idKey];
      }
    }

    return apply(operation);
  };

  return editor;
};
