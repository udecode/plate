import {
  type TDescendant,
  type TNode,
  type TNodeEntry,
  type WithOverride,
  applyDeepToNodes,
  defaultsDeepToNodes,
  isDefined,
  queryNode,
  someNode,
} from '@udecode/plate-common';
import castArray from 'lodash/castArray.js';
import cloneDeep from 'lodash/cloneDeep.js';

import type { NodeIdConfig } from './NodeIdPlugin';

/** Enables support for inserting nodes with an id key. */
export const withNodeId: WithOverride<NodeIdConfig> = ({
  editor,
  getOptions,
}) => {
  const { apply, insertNode, insertNodes } = editor;

  const idPropsCreator = () => ({
    [getOptions().idKey ?? '']: getOptions().idCreator!(),
  });

  const filterNode = (nodeEntry: TNodeEntry) => {
    const { filter, filterText } = getOptions();

    return (
      filter!(nodeEntry) && (!filterText || nodeEntry[0]?.type !== undefined)
    );
  };

  const removeIdFromNodeIfDuplicate = <N extends TDescendant>(node: N) => {
    const { idKey = '', reuseId } = getOptions();

    if (
      !reuseId ||
      someNode(editor, { at: [], match: { [idKey]: node[idKey] } })
    ) {
      delete node[idKey];
    }
  };

  const overrideIdIfSet = (node: TNode) => {
    const { idKey = '' } = getOptions();

    if (isDefined(node._id)) {
      const id = node._id;
      delete node._id;

      if (!someNode(editor, { at: [], match: { [idKey]: id } })) {
        node[idKey] = id;
      }
    }
  };

  editor.insertNodes = (_nodes, options) => {
    const nodes = castArray<TNode>(_nodes as any).filter((node) => !!node);

    if (nodes.length === 0) return;

    const { disableInsertOverrides, idKey = '' } = getOptions();

    insertNodes(
      nodes.map((node) => {
        if (!disableInsertOverrides && node[idKey]) {
          node._id = node[idKey];
        }

        return node;
      }),
      options
    );
  };

  editor.insertNode = (node) => {
    const { disableInsertOverrides, idKey = '' } = getOptions();

    if (!disableInsertOverrides && node[idKey]) {
      node._id = node[idKey];
    }

    insertNode(node);
  };

  editor.apply = (operation) => {
    const {
      allow,
      disableInsertOverrides,
      exclude,
      idCreator,
      idKey = '',
      reuseId,
    } = getOptions();

    const query = {
      allow,
      exclude,
      filter: filterNode,
    };

    if (operation.type === 'insert_node') {
      // clone to be able to write (read-only)
      const node = cloneDeep(operation.node);

      // Delete ids from node that are already being used
      applyDeepToNodes({
        apply: removeIdFromNodeIfDuplicate,
        node,
        query,
        source: {},
      });

      defaultsDeepToNodes({
        node,
        path: operation.path,
        query,
        source: idPropsCreator,
      });

      if (!disableInsertOverrides) {
        applyDeepToNodes({
          apply: overrideIdIfSet,
          node,
          query,
          source: {},
        });
      }

      return apply({
        ...operation,
        node,
      });
    }
    if (operation.type === 'split_node') {
      const node = operation.properties as TNode;

      let id = (operation.properties as any)[idKey];

      // only for elements (node with a type) or all nodes if `filterText=false`
      if (queryNode([node, operation.path], query)) {
        /**
         * Create a new id if:
         *
         * - The id in the new node is already being used in the editor or,
         * - The node has no id
         */
        if (
          !reuseId ||
          id === undefined ||
          someNode(editor, {
            at: [],
            match: { [idKey]: id },
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
        delete (operation.properties as any)[idKey];
      }
    }

    return apply(operation);
  };

  return editor;
};
