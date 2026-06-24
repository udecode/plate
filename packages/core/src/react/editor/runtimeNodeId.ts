import {
  defineEditorExtension,
  type Descendant,
  ElementApi,
  type NodeIn,
  type NodeProps,
  type Value,
} from '@platejs/plite';
import cloneDeep from 'lodash/cloneDeep.js';
import { nanoid } from 'nanoid';

import { mergePlugins } from '../../internal/utils/mergePlugins';
import type { NodeIdOptions } from '../../lib/plugins/node-id/NodeIdPlugin';
import {
  type QueryNodeEntry,
  type QueryNodeOptions,
  queryNode,
} from '../../lib/utils/queryNode';
import type {
  PlateRuntimeEditor,
  PlateRuntimePlugin,
  PlateRuntimeTransforms,
} from './createPlateRuntimeEditor';

type RuntimeNodeIdRecord = Record<string, unknown> & {
  _id?: unknown;
  children?: readonly Descendant[];
  type?: unknown;
};

type RuntimeNodeIdEntry = QueryNodeEntry<RuntimeNodeIdRecord>;

type RuntimeNodeIdNormalizeUpdate<V extends Value = Value> = {
  at: number[];
  props: Partial<NodeProps<NodeIn<V>>>;
};

const getRuntimeReadRoot = (root?: string) =>
  root === undefined || root === 'main' ? undefined : root;

const getRuntimeNodeIdRecord = (node: unknown): RuntimeNodeIdRecord =>
  node as RuntimeNodeIdRecord;

const toRuntimeNodeIdEntry = (
  node: unknown,
  path: number[]
): RuntimeNodeIdEntry => [getRuntimeNodeIdRecord(node), path];

function* runtimeNodeIdEntries(
  children: readonly Descendant[],
  parentPath: number[] = []
): Generator<RuntimeNodeIdEntry> {
  for (const [index, child] of children.entries()) {
    const path = [...parentPath, index];
    const node = getRuntimeNodeIdRecord(child);

    yield [node, path];

    if (Array.isArray(node.children)) {
      yield* runtimeNodeIdEntries(node.children, path);
    }
  }
}

const getRuntimeNodeIdQuery = ({
  allow,
  exclude,
  filter = () => true,
  filterText,
}: NodeIdOptions): QueryNodeOptions => ({
  allow,
  exclude,
  filter: (entry) => {
    const props = getRuntimeNodeIdRecord(entry[0]);

    return filter(entry) && (!filterText || props.type !== undefined);
  },
});

const collectRuntimeDuplicateCandidateIds = ({
  disableInsertOverrides,
  idKey,
  nodeEntry,
  query,
}: {
  disableInsertOverrides: boolean | undefined;
  idKey: string;
  nodeEntry: RuntimeNodeIdEntry;
  query: QueryNodeOptions;
}) => {
  const duplicateCandidateIds = new Set<unknown>();

  const collectNodeIds = (entry: RuntimeNodeIdEntry) => {
    const [entryNode, path] = entry;

    if (queryNode(entry, query)) {
      if (entryNode[idKey] !== undefined) {
        duplicateCandidateIds.add(entryNode[idKey]);
      }

      if (!disableInsertOverrides && entryNode._id !== undefined) {
        duplicateCandidateIds.add(entryNode._id);
      }
    }

    const children = Array.isArray(entryNode.children)
      ? entryNode.children
      : undefined;

    if (!children) return;

    children.forEach((child, index) => {
      collectNodeIds([getRuntimeNodeIdRecord(child), [...path, index]]);
    });
  };

  collectNodeIds(nodeEntry);

  return duplicateCandidateIds;
};

const collectRuntimeExistingNodeIds = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  {
    candidateIds,
    idKey,
    onDuplicateIdScan,
    root,
  }: {
    candidateIds: Set<unknown>;
    idKey: string;
    onDuplicateIdScan?: NodeIdOptions['onDuplicateIdScan'];
    root?: string;
  }
) => {
  if (candidateIds.size === 0) return new Set<unknown>();

  const existingIds = new Set<unknown>();
  const start = performance.now();
  let visitedCount = 0;
  const rootValue = editor.read((state) =>
    state.value.root(getRuntimeReadRoot(root))
  );

  for (const [entryNode] of runtimeNodeIdEntries(rootValue)) {
    visitedCount += 1;

    const id = entryNode[idKey];

    if (id === undefined || !candidateIds.has(id)) continue;

    existingIds.add(id);

    if (existingIds.size === candidateIds.size) {
      break;
    }
  }

  onDuplicateIdScan?.({
    candidateCount: candidateIds.size,
    duration: performance.now() - start,
    existingCount: existingIds.size,
    visitedCount,
  });

  return existingIds;
};

const hasRuntimeNodeId = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  {
    id,
    idKey,
    root,
  }: {
    id: unknown;
    idKey: string;
    root?: string;
  }
) =>
  collectRuntimeExistingNodeIds(editor, {
    candidateIds: new Set([id]),
    idKey,
    root,
  }).has(id);

const normalizeRuntimeNodeIdInsertedNode = (
  nodeEntry: RuntimeNodeIdEntry,
  {
    disableInsertOverrides,
    existingIds,
    idCreator,
    idKey,
    query,
  }: {
    disableInsertOverrides: boolean | undefined;
    existingIds: Set<unknown>;
    idCreator: () => unknown;
    idKey: string;
    query: QueryNodeOptions;
  }
) => {
  const [entryNode, path] = nodeEntry;

  if (queryNode(nodeEntry, query)) {
    if (entryNode[idKey] !== undefined && existingIds.has(entryNode[idKey])) {
      delete entryNode[idKey];
    }

    if (entryNode[idKey] === undefined) {
      entryNode[idKey] = idCreator();
    }

    if (!disableInsertOverrides && entryNode._id !== undefined) {
      const id = entryNode._id;
      entryNode._id = undefined;

      if (!existingIds.has(id)) {
        entryNode[idKey] = id;
      }
    }
  }

  const children = Array.isArray(entryNode.children)
    ? entryNode.children
    : undefined;

  if (!children) return;

  children.forEach((child, index) => {
    normalizeRuntimeNodeIdInsertedNode(
      [getRuntimeNodeIdRecord(child), [...path, index]],
      {
        disableInsertOverrides,
        existingIds,
        idCreator,
        idKey,
        query,
      }
    );
  });
};

const shouldAssignRuntimeNodeId = (
  entry: RuntimeNodeIdEntry,
  options: NodeIdOptions & {
    isBlock: (node: Descendant) => boolean;
  }
) => {
  const {
    allow,
    exclude,
    filter = () => true,
    filterInline = true,
    filterText = true,
    idKey = 'id',
    isBlock,
  } = options;
  const [node] = entry;

  return (
    !node[idKey] &&
    queryNode(entry, {
      allow,
      exclude,
      filter: (nextEntry) => {
        const [entryNode] = nextEntry;

        if (filterText && !ElementApi.isElement(entryNode)) {
          return false;
        }
        if (
          filterInline &&
          ElementApi.isElement(entryNode) &&
          !isBlock(entryNode)
        ) {
          return false;
        }

        return filter(nextEntry);
      },
    })
  );
};

const createRuntimeNodeIdProps = <V extends Value>(
  idKey: string,
  id: unknown
): Partial<NodeProps<NodeIn<V>>> =>
  ({ [idKey]: id }) as Partial<NodeProps<NodeIn<V>>>;

const isRuntimeBlockElement = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  node: unknown
) =>
  ElementApi.isElement(node) &&
  editor.read((state) => state.schema.isBlock(node));

const collectRuntimeNodeIdNormalizeUpdates = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  options: NodeIdOptions
): RuntimeNodeIdNormalizeUpdate<V>[] => {
  const { idCreator = () => nanoid(10), idKey = 'id' } = options;
  const updates: RuntimeNodeIdNormalizeUpdate<V>[] = [];
  const rootValue = editor.read((state) => state.value.root());

  const visit = (node: Descendant, path: number[]) => {
    const entry = toRuntimeNodeIdEntry(node, path);

    if (
      shouldAssignRuntimeNodeId(entry, {
        ...options,
        isBlock: (node) => isRuntimeBlockElement(editor, node),
      })
    ) {
      updates.push({
        at: path,
        props: createRuntimeNodeIdProps(idKey, idCreator()),
      });
    }

    if (!ElementApi.isElement(node)) return;

    node.children.forEach((child, index) => {
      visit(child as Descendant, [...path, index]);
    });
  };

  rootValue.forEach((node, index) => {
    visit(node as Descendant, [index]);
  });

  return updates;
};

export const installRuntimeNodeId = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeNodeId) return;

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    nodeId: {
      normalize: () => {
        const updates = collectRuntimeNodeIdNormalizeUpdates(
          editor,
          (plugin.options ?? {}) as NodeIdOptions
        );

        if (updates.length === 0) return;

        editor.update(
          (tx) => {
            updates.forEach(({ at, props }) => {
              tx.nodes.set(props, { at });
            });
          },
          { metadata: { history: { mode: 'skip' } }, skipNormalize: true }
        );
      },
    },
  }) as PlateRuntimeTransforms;

  const extension = defineEditorExtension({
    name: 'plate:node-id:runtime',
    setup() {
      return {
        operations: {
          apply({ operation, next }) {
            const {
              disableInsertOverrides,
              idCreator = () => nanoid(10),
              idKey = 'id',
              reuseId,
            } = (plugin.options ?? {}) as NodeIdOptions;
            const query = getRuntimeNodeIdQuery(
              (plugin.options ?? {}) as NodeIdOptions
            );

            if (operation.type === 'insert_node') {
              const node = cloneDeep(operation.node) as Descendant;
              const candidateIds = collectRuntimeDuplicateCandidateIds({
                disableInsertOverrides,
                idKey,
                nodeEntry: toRuntimeNodeIdEntry(node, operation.path),
                query,
              });
              const existingIds = collectRuntimeExistingNodeIds(editor, {
                candidateIds,
                idKey,
                onDuplicateIdScan: ((plugin.options ?? {}) as NodeIdOptions)
                  .onDuplicateIdScan,
                root: operation.root,
              });

              normalizeRuntimeNodeIdInsertedNode(
                toRuntimeNodeIdEntry(node, operation.path),
                {
                  disableInsertOverrides,
                  existingIds,
                  idCreator,
                  idKey,
                  query,
                }
              );

              next({
                ...operation,
                node,
              });
              return;
            }

            if (operation.type === 'split_node') {
              const props = getRuntimeNodeIdRecord(operation.properties);
              let id = props[idKey];

              if (
                queryNode(
                  toRuntimeNodeIdEntry(operation.properties, operation.path),
                  query
                )
              ) {
                if (
                  !reuseId ||
                  id === undefined ||
                  hasRuntimeNodeId(editor, {
                    id,
                    idKey,
                    root: operation.root,
                  })
                ) {
                  id = idCreator();
                }

                next({
                  ...operation,
                  properties: {
                    ...operation.properties,
                    [idKey]: id,
                  },
                });
                return;
              }

              if (id !== undefined) {
                const properties = { ...operation.properties };

                delete getRuntimeNodeIdRecord(properties)[idKey];

                next({
                  ...operation,
                  properties,
                });
                return;
              }
            }

            next(operation);
          },
        },
      };
    },
  });

  plugin.runtimeNodeIdCleanup = editor.extend(extension);
  plugin.runtimeNodeIdExtension = extension;
};
