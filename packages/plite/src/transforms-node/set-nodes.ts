import { getExtensionRegistry } from '../core/extension-registry';
import {
  appendOperation,
  applyOperation,
  getEditorOperationRoot,
  runEditorTransaction,
  setChildren,
} from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { updateDirtyPaths } from '../core/update-dirty-paths';
import { nodes as getNodes } from '../editor/nodes';
import { createInternalRangeRef } from '../editor/range-ref';
import { LocationApi } from '../interfaces';
import { Editor } from '../interfaces/editor';
import { type Descendant, type Node, NodeApi } from '../interfaces/node';
import type { Operation } from '../interfaces/operation';
import { PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { NON_SETTABLE_NODE_PROPERTIES } from '../interfaces/transforms/general';
import type { NodeMutationMethods } from '../interfaces/transforms/node';
import { matchPath } from '../utils/match-path';
import { inheritRuntimeId } from '../utils/runtime-ids';

type SetNodeOperation = Extract<Operation, { type: 'set_node' }>;

const applySetNodeProperties = <T extends Descendant>(
  node: T,
  operation: SetNodeOperation,
  editor: Parameters<typeof inheritRuntimeId>[2]
): T => {
  const newNode = { ...node } as T;

  for (const key in operation.newProperties) {
    if (!Object.hasOwn(operation.newProperties, key)) {
      continue;
    }

    const value = operation.newProperties[key as keyof Node];

    if (value == null) {
      delete newNode[key as keyof T];
    } else {
      newNode[key as keyof T] = value as T[keyof T];
    }
  }

  for (const key in operation.properties) {
    if (
      Object.hasOwn(operation.properties, key) &&
      !Object.hasOwn(operation.newProperties, key)
    ) {
      delete newNode[key as keyof T];
    }
  }

  inheritRuntimeId(newNode, node, editor);

  return newNode;
};

const applySetNodeAtRelativePath = <T extends Descendant>(
  node: T,
  relativePath: readonly number[],
  operation: SetNodeOperation,
  editor: Parameters<typeof inheritRuntimeId>[2]
): T => {
  if (relativePath.length === 0) {
    return applySetNodeProperties(node, operation, editor);
  }

  if (!NodeApi.isElement(node)) {
    return node;
  }

  const [index, ...restPath] = relativePath;
  const child = typeof index === 'number' ? node.children[index] : undefined;

  if (!child) {
    return node;
  }

  const children = [...node.children];
  children[index!] = applySetNodeAtRelativePath(
    child,
    restPath,
    operation,
    editor
  );

  const newNode = { ...node, children } as T;

  inheritRuntimeId(newNode, node, editor);

  return newNode;
};

const canApplySetNodeBatch = (
  editor: Parameters<NodeMutationMethods['setNodes']>[0],
  operations: readonly SetNodeOperation[]
) =>
  operations.length > 1 &&
  operations.every((operation) => operation.path.length > 0) &&
  getExtensionRegistry(editor).operationMiddlewares.size === 0;

const applySetNodeBatch = (
  editor: Parameters<NodeMutationMethods['setNodes']>[0],
  operations: readonly SetNodeOperation[]
) => {
  const root = getEditorOperationRoot(editor);
  const children = Editor.getChildren(editor);
  const nextChildren = [...children];

  for (const operation of operations) {
    const index = operation.path[0];
    const node = typeof index === 'number' ? nextChildren[index] : undefined;

    if (!node) {
      continue;
    }

    nextChildren[index] = applySetNodeAtRelativePath(
      node,
      operation.path.slice(1),
      operation,
      editor
    );
  }

  setChildren(editor, nextChildren);

  updateDirtyPaths(
    editor,
    operations.flatMap((operation) => PathApi.levels(operation.path)),
    undefined,
    { root }
  );

  for (const operation of operations) {
    const rootedOperation = { ...operation, root };

    appendOperation(editor, rootedOperation);
  }
};

export const setNodes: NodeMutationMethods['setNodes'] = (
  editor,
  props: Partial<Node>,
  options = {}
) => {
  runEditorTransaction(editor, (tx) => {
    const transforms = getEditorTransformRegistry(editor);
    const {
      at: optionAt,
      compare: optionCompare,
      hanging = false,
      match: optionMatch,
      merge: optionMerge,
      mode = 'lowest',
      split = false,
      voids = false,
    } = options;
    let match = optionMatch;
    let at = optionAt === undefined ? tx.resolveTarget() : optionAt;
    let compare = optionCompare;
    const merge = optionMerge;

    if (!at) {
      return;
    }

    if (match == null) {
      match = LocationApi.isPath(at)
        ? matchPath(editor, at)
        : (n) => NodeApi.isElement(n) && Editor.isBlock(editor, n);
    }

    if (!hanging && LocationApi.isRange(at)) {
      at = Editor.unhangRange(editor, at, { voids });
    }

    if (split && LocationApi.isRange(at)) {
      if (
        RangeApi.isCollapsed(at) &&
        Editor.leaf(editor, at.anchor)[0].text.length > 0
      ) {
        // If the range is collapsed in a non-empty node and 'split' is true, there's nothing to
        // set that won't get normalized away
        return;
      }
      const rangeRef = createInternalRangeRef(editor, at, {
        affinity: 'inward',
      });
      const [start, end] = RangeApi.edges(at);
      const splitMode = mode === 'lowest' ? 'lowest' : 'highest';
      const endAtEndOfNode = Editor.isEnd(editor, end, end.path);
      transforms.splitNodes({
        at: end,
        match,
        mode: splitMode,
        voids,
        always: !endAtEndOfNode,
      });
      const startAtStartOfNode = Editor.isStart(editor, start, start.path);
      transforms.splitNodes({
        at: start,
        match,
        mode: splitMode,
        voids,
        always: !startAtStartOfNode,
      });
      at = rangeRef.unref()!;

      if (options.at == null) {
        transforms.select(at);
      }
    }

    if (!compare) {
      compare = (prop, nodeProp) => prop !== nodeProp;
    }

    const operations: SetNodeOperation[] = [];

    for (const [node, path] of getNodes(editor, {
      at,
      match,
      mode,
      voids,
    })) {
      const properties: Record<string, unknown> = {};
      const newProperties: Record<string, unknown> = {};

      // You can't set properties on the editor node.
      if (path.length === 0) {
        continue;
      }

      let hasChanges = false;

      for (const k in props) {
        if (NON_SETTABLE_NODE_PROPERTIES.includes(k)) {
          continue;
        }

        const value: unknown = Object.hasOwn(node, k)
          ? node[<keyof Node>k]
          : undefined;

        const newValue: unknown = props[<keyof Node>k];

        if (compare(newValue, value)) {
          hasChanges = true;
          // Omit new properties from the old properties list
          if (Object.hasOwn(node, k)) properties[k] = value;
          // Omit properties that have been removed from the new properties list
          if (merge) {
            if (newValue != null) newProperties[k] = merge(value, newValue);
          } else if (newValue != null) newProperties[k] = newValue;
        }
      }

      if (hasChanges) {
        operations.push({
          type: 'set_node',
          path,
          properties,
          newProperties,
        });
      }
    }

    if (canApplySetNodeBatch(editor, operations)) {
      applySetNodeBatch(editor, operations);
      return;
    }

    for (const operation of operations) {
      applyOperation(editor, operation);
    }
  });
};
