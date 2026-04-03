import {
  type Descendant,
  type NodeEntry,
  type NodeProps,
  type TNode,
  NodeApi,
  queryNode,
} from '@platejs/slate';
import { isDefined } from '@udecode/utils';
import castArray from 'lodash/castArray.js';
import cloneDeep from 'lodash/cloneDeep.js';

import type { OverrideEditor } from '../../plugin';
import type { NodeIdConfig } from './NodeIdPlugin';

/** Enables support for inserting nodes with an id key. */
export const withNodeId: OverrideEditor<NodeIdConfig> = ({
  editor,
  getOptions,
  tf: { apply, insertNode, insertNodes },
}) => {
  const idPropsCreator = () => ({
    [getOptions().idKey ?? '']: getOptions().idCreator!(),
  });

  const filterNode = (nodeEntry: NodeEntry) => {
    const { filter, filterText } = getOptions();

    return (
      filter!(nodeEntry) && (!filterText || nodeEntry[0]?.type !== undefined)
    );
  };

  const collectDuplicateCandidateIds = ({
    disableInsertOverrides,
    idKey,
    nodeEntry,
    query,
  }: {
    disableInsertOverrides: boolean | undefined;
    idKey: string;
    nodeEntry: NodeEntry;
    query: {
      allow: any;
      exclude: any;
      filter: (nodeEntry: NodeEntry) => boolean;
    };
  }) => {
    const duplicateCandidateIds = new Set<any>();
    const collectNodeIds = (entry: NodeEntry) => {
      const [entryNode, path] = entry;

      if (queryNode(entry, query)) {
        if (entryNode[idKey] !== undefined) {
          duplicateCandidateIds.add(entryNode[idKey]);
        }

        if (!disableInsertOverrides && isDefined(entryNode._id)) {
          duplicateCandidateIds.add(entryNode._id);
        }
      }

      const children = (entryNode as any).children as Descendant[] | undefined;

      if (!children) return;

      children.forEach((child, index: number) => {
        collectNodeIds([child as any, [...path, index]]);
      });
    };

    collectNodeIds(nodeEntry);

    return duplicateCandidateIds;
  };

  const collectExistingEditorIds = ({
    duplicateCandidateIds,
    idKey,
  }: {
    duplicateCandidateIds: Set<any>;
    idKey: string;
  }) => {
    if (duplicateCandidateIds.size === 0) {
      return new Set<any>();
    }

    const existingIds = new Set<any>();

    for (const [entryNode] of NodeApi.nodes(editor as any)) {
      const id = (entryNode as any)?.[idKey];

      if (id === undefined || !duplicateCandidateIds.has(id)) continue;

      existingIds.add(id);

      if (existingIds.size === duplicateCandidateIds.size) {
        break;
      }
    }

    return existingIds;
  };

  return {
    transforms: {
      apply(operation) {
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
          const existingIds = collectExistingEditorIds({
            duplicateCandidateIds: collectDuplicateCandidateIds({
              disableInsertOverrides,
              idKey,
              nodeEntry: [node as any, operation.path as any],
              query,
            }),
            idKey,
          });
          const hasIdInEditor = (id: any) => existingIds.has(id);
          const normalizeInsertedNode = (nodeEntry: NodeEntry) => {
            const [entryNode, path] = nodeEntry;

            if (queryNode(nodeEntry, query)) {
              if (
                entryNode[idKey] !== undefined &&
                hasIdInEditor(entryNode[idKey])
              ) {
                delete entryNode[idKey];
              }

              if (entryNode[idKey] === undefined) {
                Object.assign(entryNode, idPropsCreator());
              }

              if (!disableInsertOverrides && isDefined(entryNode._id)) {
                const id = entryNode._id;
                entryNode._id = undefined;

                if (!hasIdInEditor(id)) {
                  entryNode[idKey] = id;
                }
              }
            }

            const children = (entryNode as any).children as
              | Descendant[]
              | undefined;

            if (!children) return;

            children.forEach((child, index: number) => {
              normalizeInsertedNode([child as any, [...path, index]]);
            });
          };

          normalizeInsertedNode([node as any, operation.path as any]);

          return apply({
            ...operation,
            node,
          });
        }
        if (operation.type === 'split_node') {
          const node = operation.properties as NodeProps<TNode>;
          let id = (operation.properties as any)[idKey];

          // only for elements (node with a type) or all nodes if `filterText=false`

          if (queryNode([node as any, operation.path], query)) {
            /**
             * Create a new id if:
             *
             * - The id in the new node is already being used in the editor or,
             * - The node has no id
             */
            if (
              !reuseId ||
              id === undefined ||
              editor.api.some({
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
      },

      insertNode(node) {
        const { disableInsertOverrides, idKey = '' } = getOptions();

        if (!disableInsertOverrides && node[idKey]) {
          if (!Object.isExtensible(node)) {
            // biome-ignore lint/style/noParameterAssign: Need to clone and reassign if node is not extensible
            node = cloneDeep(node);
          }

          node._id = node[idKey];
        }

        insertNode(node);
      },

      insertNodes(_nodes, options) {
        const nodes = castArray<Descendant>(_nodes as any).filter(
          (node) => !!node
        );

        if (nodes.length === 0) return;

        const { disableInsertOverrides, idKey = '' } = getOptions();

        insertNodes(
          nodes.map((node) => {
            if (!disableInsertOverrides && node[idKey]) {
              if (!Object.isExtensible(node)) {
                // biome-ignore lint/style/noParameterAssign: Need to clone and reassign if node is not extensible
                node = cloneDeep(node);
              }

              node._id = node[idKey];
            }

            return node;
          }),
          options
        );
      },
    },
  };
};
