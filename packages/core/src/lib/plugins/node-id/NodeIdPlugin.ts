import {
  type Descendant,
  type NodeEntry,
  type NodeMatch,
  type NodeProps,
  type Operation,
  type Value,
  ElementApi,
  NodeApi,
  TextApi,
} from '@platejs/plite';
import cloneDeep from 'lodash/cloneDeep.js';
import { nanoid } from 'nanoid';

import type { BaseEditor } from '../../editor/BaseEditor';
import type { PluginConfig } from '../../plugin/PluginConfig';

import { createBasePlugin } from '../../plugin/createBasePlugin';

export type NodeIdOptions = {
  /**
   * By default, inserted nodes reuse their existing id when that id is not
   * already present in the document. Set this option to true to always assign a
   * fresh id.
   */
  disableInsertOverrides?: boolean;
  /**
   * Filter inline `Element` nodes.
   *
   * @default true
   */
  filterInline?: boolean;
  /**
   * Filter `Text` nodes.
   *
   * @default true
   */
  filterText?: boolean;
  /**
   * Node key to store the id.
   *
   * @default 'id'
   */
  idKey?: string;
  /**
   * Controls how missing ids are assigned in the initial value.
   *
   * - `'if-needed'`: normalize only when the first or last top-level node is
   *   missing an id
   * - `'always'`: walk the whole initial value and fill any missing ids
   * - `false`: skip initial-value id assignment
   *
   * @default 'if-needed'
   */
  initialValueIds?: false | 'always' | 'if-needed';
  /**
   * Reports duplicate-id scan cost during inserted-node normalization.
   */
  onDuplicateIdScan?: (stats: {
    candidateCount: number;
    duration: number;
    existingCount: number;
    visitedCount: number;
  }) => void;
  /**
   * Reuse ids on undo/redo and copy/pasting if not existing in the document.
   * This is disabled by default to avoid duplicate ids across documents.
   *
   * @default false
   */
  reuseId?: boolean;
  /**
   * A function that generates and returns a unique ID.
   *
   * @default () => nanoid(10)
   */
  idCreator?: () => any;
  /** Match nodes that receive IDs. */
  match?: NodeMatch<Descendant>;
};

export type NormalizeNodeIdOptions = Pick<
  NodeIdOptions,
  'filterInline' | 'filterText' | 'idCreator' | 'idKey' | 'match'
>;

type NormalizeNodeIdRuntimeOptions = NormalizeNodeIdOptions & {
  isBlock?: (node: Descendant) => boolean;
};

const hasElementType = (node: unknown) =>
  typeof (node as { type?: unknown }).type === 'string' &&
  !TextApi.isText(node);

const isDefaultNodeIdFastPath = ({
  filterInline = true,
  filterText = true,
  match,
}: NormalizeNodeIdRuntimeOptions) =>
  match === undefined && filterInline && filterText;

const isBlockCandidate = (
  node: Descendant,
  isBlock?: (node: Descendant) => boolean
) =>
  ElementApi.isElement(node) &&
  (isBlock ? isBlock(node) : (node as { inline?: boolean }).inline !== true);

const shouldAssignNodeId = (
  entry: [Descendant, number[]],
  options: NormalizeNodeIdRuntimeOptions = {}
) => {
  const {
    filterInline = true,
    filterText = true,
    isBlock,
    idKey = 'id',
    match,
  } = options;
  const [node, path] = entry;

  return (
    !node[idKey] &&
    (!match || NodeApi.matches(node, match, path)) &&
    (!filterText || ElementApi.isElement(node)) &&
    (!filterInline ||
      !ElementApi.isElement(node) ||
      (isBlock
        ? isBlock(node)
        : (node as { inline?: boolean }).inline !== true))
  );
};

const resolveInitialValueIds = (
  options: Pick<NodeIdOptions, 'initialValueIds'>
): false | 'always' | 'if-needed' => options.initialValueIds ?? 'if-needed';

const normalizeInsertedNodeIdOperation = (
  editor: BaseEditor,
  operation: Extract<Operation, { type: 'insert_node' }>,
  options: NodeIdOptions
) => {
  const {
    disableInsertOverrides,
    filterText = true,
    idCreator = () => nanoid(10),
    idKey = 'id',
    match,
  } = options;
  const node = cloneDeep(operation.node) as Descendant & {
    _id?: unknown;
  };
  const duplicateCandidateIds = new Set<unknown>();

  const collectCandidateIds = (entry: NodeEntry) => {
    const [entryNode, path] = entry;
    const entryRecord = entryNode as Record<string, unknown>;
    const matches =
      (!match || NodeApi.matches(entryNode as Descendant, match, path)) &&
      (!filterText || hasElementType(entryNode));

    if (matches) {
      if (entryRecord[idKey] !== undefined) {
        duplicateCandidateIds.add(entryRecord[idKey]);
      }

      if (!disableInsertOverrides && entryRecord._id !== undefined) {
        duplicateCandidateIds.add(entryRecord._id);
      }
    }

    if (!ElementApi.isElement(entryNode)) return;

    entryNode.children.forEach((child, index) => {
      collectCandidateIds([child as Descendant, [...path, index]]);
    });
  };

  collectCandidateIds([node, operation.path]);

  const existingIds = new Set<unknown>();
  const start = globalThis.performance?.now() ?? Date.now();
  let visitedCount = 0;

  if (duplicateCandidateIds.size > 0) {
    for (const [entryNode] of editor.read.nodes.entries({ at: [] })) {
      visitedCount += 1;

      const id = (entryNode as Record<string, unknown>)[idKey];

      if (id === undefined || !duplicateCandidateIds.has(id)) continue;

      existingIds.add(id);

      if (existingIds.size === duplicateCandidateIds.size) {
        break;
      }
    }
  }

  options.onDuplicateIdScan?.({
    candidateCount: duplicateCandidateIds.size,
    duration: (globalThis.performance?.now() ?? Date.now()) - start,
    existingCount: existingIds.size,
    visitedCount,
  });

  const normalizeInsertedNode = (entry: NodeEntry) => {
    const [entryNode, path] = entry;
    const entryRecord = entryNode as Record<string, unknown>;
    const matches =
      (!match || NodeApi.matches(entryNode as Descendant, match, path)) &&
      (!filterText || hasElementType(entryNode));

    if (matches) {
      if (
        entryRecord[idKey] !== undefined &&
        existingIds.has(entryRecord[idKey])
      ) {
        delete entryRecord[idKey];
      }

      if (entryRecord[idKey] === undefined) {
        Object.assign(entryRecord, { [idKey]: idCreator() });
      }

      if (!disableInsertOverrides && entryRecord._id !== undefined) {
        const id = entryRecord._id;
        // biome-ignore lint/performance/noDelete: _id is an insert-only override marker.
        delete entryRecord._id;

        if (!existingIds.has(id)) {
          entryRecord[idKey] = id;
        }
      }
    }

    if (!ElementApi.isElement(entryNode)) return;

    entryNode.children.forEach((child, index) => {
      normalizeInsertedNode([child as Descendant, [...path, index]]);
    });
  };

  normalizeInsertedNode([node, operation.path]);

  return {
    ...operation,
    node,
  };
};

const normalizeSplitNodeIdOperation = (
  editor: BaseEditor,
  operation: Extract<Operation, { type: 'split_node' }>,
  options: NodeIdOptions
) => {
  const {
    filterText = true,
    idCreator = () => nanoid(10),
    idKey = 'id',
    match,
    reuseId,
  } = options;
  const properties = {
    ...operation.properties,
  } as NodeProps<Descendant> & Record<string, unknown>;
  if (
    (!match ||
      NodeApi.matches(properties as Descendant, match, operation.path)) &&
    (!filterText || hasElementType(properties))
  ) {
    const id = properties[idKey];
    const duplicate =
      id !== undefined &&
      editor.read.nodes.some({
        at: [],
        match: (node) => (node as Record<string, unknown>)[idKey] === id,
      });

    if (!reuseId || id === undefined || duplicate) {
      properties[idKey] = idCreator();
    }

    return {
      ...operation,
      properties,
    };
  }

  if (properties[idKey] !== undefined) {
    delete properties[idKey];
  }

  return {
    ...operation,
    properties,
  };
};

/**
 * Normalize node IDs in a value without using editor operations. This is a pure
 * function that returns the normalized value and preserves references for
 * unchanged branches.
 */
const normalizeNodeIdRuntime = <V extends Value>(
  value: V,
  options: NormalizeNodeIdRuntimeOptions = {}
): V => {
  const { idCreator = () => nanoid(10), idKey = 'id' } = options;

  if (isDefaultNodeIdFastPath(options)) {
    const normalizeNodeFast = (node: Descendant): Descendant => {
      if (!ElementApi.isElement(node)) return node;
      if (!isBlockCandidate(node, options.isBlock)) return node;

      let nextChildren: Descendant[] | undefined;

      node.children.forEach((child, index) => {
        const nextChild = normalizeNodeFast(child as Descendant);

        if (nextChild !== child) {
          if (!nextChildren) {
            nextChildren = [...node.children] as Descendant[];
          }

          nextChildren[index] = nextChild;
        }
      });

      if (!node[idKey]) {
        return {
          ...node,
          ...(nextChildren ? { children: nextChildren } : {}),
          [idKey]: idCreator(),
        };
      }

      if (nextChildren) {
        return {
          ...node,
          children: nextChildren,
        };
      }

      return node;
    };

    let valueChanged = false;

    const nextValue = value.map((node) => {
      const nextNode = normalizeNodeFast(node as Descendant);

      if (nextNode !== node) {
        valueChanged = true;
      }

      return nextNode;
    }) as V;

    return valueChanged ? nextValue : value;
  }

  const normalizeNode = (node: Descendant, path: number[]): Descendant => {
    let nextNode = node;
    let childrenChanged = false;

    if (shouldAssignNodeId([node, path], options)) {
      nextNode = {
        ...node,
        [idKey]: idCreator(),
      };
    }

    if (ElementApi.isElement(node)) {
      const nextChildren = node.children.map((child, index) => {
        const nextChild = normalizeNode(child as Descendant, [...path, index]);

        if (nextChild !== child) {
          childrenChanged = true;
        }

        return nextChild;
      });

      if (childrenChanged) {
        nextNode =
          nextNode === node
            ? {
                ...node,
                children: nextChildren,
              }
            : {
                ...nextNode,
                children: nextChildren,
              };
      }
    }

    return nextNode;
  };

  let valueChanged = false;

  const nextValue = value.map((node, index) => {
    const nextNode = normalizeNode(node, [index]);

    if (nextNode !== node) {
      valueChanged = true;
    }

    return nextNode;
  }) as V;

  return valueChanged ? nextValue : value;
};

export const normalizeNodeId = <V extends Value>(
  value: V,
  options: NormalizeNodeIdOptions = {}
): V => normalizeNodeIdRuntime(value, options);

export const normalizeNodeIdWithEditor = <V extends Value>(
  editor: BaseEditor,
  value: V,
  options: NormalizeNodeIdOptions = {}
): V =>
  normalizeNodeIdRuntime(value, {
    ...options,
    isBlock: (node) =>
      ElementApi.isElement(node) && editor.read.schema.isBlock(node),
  });

export type NodeIdConfig = PluginConfig<
  'nodeId',
  NodeIdOptions,
  {},
  {
    nodeId: {
      normalize: () => void;
    };
  }
>;

export const NodeIdPlugin = createBasePlugin<NodeIdConfig>({
  key: 'nodeId',
  options: {
    filterInline: true,
    filterText: true,
    idKey: 'id',
    idCreator: () => nanoid(10),
  },
})
  .extend(({ getOptions }) => ({
    node: {
      isMetadataProp: ({ key }) => key === (getOptions().idKey ?? 'id'),
    },
  }))
  .extendTx(({ editor, getOptions }) => (tx) => ({
    normalize() {
      const options = getOptions();
      const { idCreator, idKey } = options;
      const updates: { at: number[]; props: Record<string, unknown> }[] = [];
      const isBlock = (node: Descendant) =>
        ElementApi.isElement(node) && editor.read.schema.isBlock(node);
      const applyUpdates = () => {
        if (updates.length === 0) return;

        tx.metadata.merge({ history: { mode: 'skip' } });

        for (const { at, props } of updates) {
          tx.nodes.set(props, { at });
        }
      };

      if (isDefaultNodeIdFastPath({ ...options, isBlock })) {
        const path: number[] = [];

        const visitFast = (node: Descendant) => {
          if (!ElementApi.isElement(node)) return;
          if (!isBlockCandidate(node, isBlock)) return;

          if (!node[idKey!]) {
            updates.push({
              at: [...path],
              props: { [idKey!]: idCreator!() },
            });
          }

          node.children.forEach((child: Descendant, index: number) => {
            path.push(index);
            visitFast(child);
            path.pop();
          });
        };

        editor.read.children().forEach((node: Descendant, index: number) => {
          path.push(index);
          visitFast(node);
          path.pop();
        });

        applyUpdates();

        return;
      }

      const addNodeId = (entry: [Descendant, number[]]) => {
        const [node, path] = entry;

        if (shouldAssignNodeId(entry, { ...options, isBlock })) {
          updates.push({
            at: path,
            props: { [idKey!]: idCreator!() },
          });
        }

        // Only traverse children if this is an Element node
        if (ElementApi.isElement(node)) {
          node.children.forEach((child: Descendant, index: number) => {
            addNodeId([child, [...path, index]]);
          });
        }
      };

      // Start traversal from top-level nodes.
      editor.read.children().forEach((node: Descendant, index: number) => {
        addNodeId([node, [index]]);
      });

      applyUpdates();
    },
  }))
  .extendExtension(({ editor, getOptions }) => ({
    operations: {
      apply({ operation, next }) {
        if (operation.type === 'insert_node') {
          next(
            normalizeInsertedNodeIdOperation(
              editor,
              operation,
              getOptions()
            ) as Operation
          );
          return;
        }

        if (operation.type === 'split_node') {
          next(
            normalizeSplitNodeIdOperation(
              editor,
              operation,
              getOptions()
            ) as Operation
          );
          return;
        }

        next(operation);
      },
    },
  }))
  .extend({
    transformInitialValue: ({ editor, getOptions, value }): Value => {
      const options = getOptions();
      const { idKey = 'id' } = options;
      const initialValueIds = resolveInitialValueIds(options);

      if (initialValueIds === false) {
        return value;
      }

      // Perf: check if normalization is needed by looking at the first node and last node
      if (initialValueIds === 'if-needed') {
        const firstNode = value[0];
        const lastNode = value.at(-1);

        if (firstNode?.[idKey] && lastNode?.[idKey]) {
          return value;
        }
      }

      return normalizeNodeIdWithEditor(editor, value, options);
    },
  });
