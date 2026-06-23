import type { Descendant } from '@platejs/plite';
import { isDefined } from '@udecode/utils';
import cloneDeep from 'lodash/cloneDeep.js';

import type { LegacyTransformOverride } from '../../../../internal/plugin/withLegacyTransformOverride';
import {
  type QueryNodeEntry,
  type QueryNodeOptions,
  queryNode,
} from '../../../utils/queryNode';
import type { NodeIdConfig } from '../NodeIdPlugin';

const now = () => globalThis.performance?.now() ?? Date.now();

type NodeIdRecord = Record<string, unknown> & {
  _id?: unknown;
  children?: Descendant[];
  type?: unknown;
};

type NodeIdEntry = QueryNodeEntry<NodeIdRecord>;

const getNodeRecord = (node: unknown): NodeIdRecord => node as NodeIdRecord;

const toNodeIdEntry = (node: unknown, path: number[]): NodeIdEntry => [
  getNodeRecord(node),
  path,
];

function* descendantEntries(
  children: Descendant[],
  parentPath: number[] = []
): Generator<NodeIdEntry> {
  for (const [index, child] of children.entries()) {
    const path = [...parentPath, index];
    const node = getNodeRecord(child);

    yield [node, path];

    if (Array.isArray(node.children)) {
      yield* descendantEntries(node.children, path);
    }
  }
}

/** Enables support for inserting nodes with an id key. */
export const withNodeId: LegacyTransformOverride<NodeIdConfig> = ({
  editor,
  getOptions,
  tf,
}) => {
  const { apply, insertNode, insertNodes } = tf;
  const idPropsCreator = () => ({
    [getOptions().idKey ?? '']: getOptions().idCreator!(),
  });

  const filterNode: QueryNodeOptions['filter'] = (nodeEntry) => {
    const { filter, filterText } = getOptions();
    const props = getNodeRecord(nodeEntry[0]);

    return filter!(nodeEntry) && (!filterText || props.type !== undefined);
  };

  const collectDuplicateCandidateIds = ({
    disableInsertOverrides,
    idKey,
    nodeEntry,
    query,
  }: {
    disableInsertOverrides: boolean | undefined;
    idKey: string;
    nodeEntry: NodeIdEntry;
    query: {
      allow: any;
      exclude: any;
      filter: QueryNodeOptions['filter'];
    };
  }) => {
    const duplicateCandidateIds = new Set<any>();
    const collectNodeIds = (entry: NodeIdEntry) => {
      const [entryNode, path] = entry;

      if (queryNode(entry, query)) {
        if (entryNode[idKey] !== undefined) {
          duplicateCandidateIds.add(entryNode[idKey]);
        }

        if (!disableInsertOverrides && isDefined(entryNode._id)) {
          duplicateCandidateIds.add(entryNode._id);
        }
      }

      const children = Array.isArray(entryNode.children)
        ? entryNode.children
        : undefined;

      if (!children) return;

      children.forEach((child, index: number) => {
        collectNodeIds([child, [...path, index]]);
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
    const start = now();
    let visitedCount = 0;

    for (const [entryNode] of descendantEntries(editor.children)) {
      visitedCount += 1;

      const id = entryNode[idKey];

      if (id === undefined || !duplicateCandidateIds.has(id)) continue;

      existingIds.add(id);

      if (existingIds.size === duplicateCandidateIds.size) {
        break;
      }
    }

    getOptions().onDuplicateIdScan?.({
      candidateCount: duplicateCandidateIds.size,
      duration: now() - start,
      existingCount: existingIds.size,
      visitedCount,
    });

    return existingIds;
  };

  return {
    tf: {
      apply(operation: any) {
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
              nodeEntry: toNodeIdEntry(node, operation.path),
              query,
            }),
            idKey,
          });
          const hasIdInEditor = (id: unknown) => existingIds.has(id);
          const normalizeInsertedNode = (nodeEntry: NodeIdEntry) => {
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

            const children = Array.isArray(entryNode.children)
              ? entryNode.children
              : undefined;

            if (!children) return;

            children.forEach((child, index: number) => {
              normalizeInsertedNode([child, [...path, index]]);
            });
          };

          normalizeInsertedNode(toNodeIdEntry(node, operation.path));

          return apply({
            ...operation,
            node,
          });
        }
        if (operation.type === 'split_node') {
          const props = getNodeRecord(operation.properties);
          let id = props[idKey];

          // only for elements (node with a type) or all nodes if `filterText=false`

          if (
            queryNode(
              toNodeIdEntry(operation.properties, operation.path),
              query
            )
          ) {
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
            delete props[idKey];
          }
        }

        return apply(operation);
      },

      insertNode(node) {
        const { disableInsertOverrides, idKey = '' } = getOptions();
        let nextNode = node;
        let nodeRecord = getNodeRecord(nextNode);

        if (!disableInsertOverrides && nodeRecord[idKey]) {
          if (!Object.isExtensible(nextNode)) {
            nextNode = cloneDeep(nextNode);
            nodeRecord = getNodeRecord(nextNode);
          }

          nodeRecord._id = nodeRecord[idKey];
        }

        insertNode(nextNode);
      },

      insertNodes(_nodes, options) {
        const nodes = (Array.isArray(_nodes) ? _nodes : [_nodes]).filter(
          isDefined
        ) as Descendant[];

        if (nodes.length === 0) return;

        const { disableInsertOverrides, idKey = '' } = getOptions();

        insertNodes(
          nodes.map((node) => {
            let nodeRecord = getNodeRecord(node);

            if (!disableInsertOverrides && nodeRecord[idKey]) {
              if (!Object.isExtensible(node)) {
                // biome-ignore lint/style/noParameterAssign: Need to clone and reassign if node is not extensible
                node = cloneDeep(node);
                nodeRecord = getNodeRecord(node);
              }

              nodeRecord._id = nodeRecord[idKey];
            }

            return node;
          }),
          options
        );
      },
    },
  };
};
