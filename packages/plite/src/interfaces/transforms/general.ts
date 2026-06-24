import {
  deleteEditorRoot,
  getCurrentSelection,
  getCurrentSelectionRoot,
  runEditorTransaction,
  setCurrentSelection,
  setChildren as setEditorChildren,
  syncImplicitTargetToCurrentSelection,
} from '../../core/public-state';
import {
  type Descendant,
  type Node,
  NodeApi,
  type NodeEntry,
  type Operation,
  type Path,
  PathApi,
  PointApi,
  type Range,
  RangeApi,
  type Selection,
  type Text,
} from '../../index';
import { getOperationRoot, getRangeRoot } from '../../internal/root-location';
import { formatDebugValue } from '../../utils/format-debug-value';
import {
  insertChildren,
  modifyChildren,
  modifyDescendant,
  modifyLeaf,
  removeChildren,
  replaceChildRange,
  replaceChildren,
} from '../../utils/modify';
import { inheritRuntimeId } from '../../utils/runtime-ids';
import { getChildren as editorGetChildren } from '../editor';
import type { Editor } from '../editor';

/**
 * The set of properties that cannot be set using set_node.
 */
export const NON_SETTABLE_NODE_PROPERTIES = [
  'children',
  'text',
  // Do not allow overriding any property on the Object prototype
  ...Object.getOwnPropertyNames(Object.prototype),
];

/**
 * The set of properties that cannot be set using set_selection.
 */
export const NON_SETTABLE_SELECTION_PROPERTIES = Object.getOwnPropertyNames(
  Object.prototype
);

const getSelectionRootAfterOperation = (
  editor: Editor,
  selection: Selection,
  root: string
): string => {
  if (!selection) {
    return root;
  }

  return getRangeRoot(selection).root === root
    ? root
    : getCurrentSelectionRoot(editor);
};

const assertChildIndex = (
  op: Operation,
  path: Path,
  index: number,
  childCount: number,
  allowEnd: boolean
) => {
  const max = allowEnd ? childCount : childCount - 1;

  if (!Number.isInteger(index) || index < 0 || index > max) {
    throw new Error(
      `Cannot apply a "${op.type}" operation at path [${path}] because the child index ${index} is invalid for a node with ${childCount} children.`
    );
  }
};

const assertChildRange = (
  op: Extract<Operation, { type: 'replace_children' }>,
  childCount: number,
  removeCount: number
) => {
  if (
    !Number.isInteger(op.index) ||
    op.index < 0 ||
    op.index + removeCount > childCount
  ) {
    throw new Error(
      `Cannot apply a "replace_children" operation at path [${op.path}] because the child range starting at index ${op.index} is invalid for a node with ${childCount} children.`
    );
  }
};

const assertTextOffset = (
  op: Operation,
  path: Path,
  offset: number,
  textLength: number
) => {
  if (!Number.isInteger(offset) || offset < 0 || offset > textLength) {
    throw new Error(
      `Cannot apply a "${op.type}" operation at path [${path}] because offset ${offset} is invalid for text of length ${textLength}.`
    );
  }
};

const getChildContainerChildren = (
  editor: Editor,
  op: Operation,
  path: Path
): Descendant[] => {
  const node = NodeApi.get(editor, path);

  if (NodeApi.isEditor(node)) {
    return editorGetChildren(editor);
  }

  if (NodeApi.isText(node)) {
    throw new Error(
      `Cannot apply a "${op.type}" operation at path [${path}] because it refers to a leaf node.`
    );
  }

  return node.children;
};

const mutateTopLevelChildren = (
  editor: Editor,
  mutate: (children: Descendant[]) => void
) => {
  const children = editorGetChildren(editor);

  mutate(children);
  setEditorChildren(editor, children);
};

export interface OperationTransformMethods {
  /**
   * Transform the editor by an operation.
   */
  applyBatch: (editor: Editor, operations: Operation[]) => void;
  transform: (editor: Editor, op: Operation) => void;
}

export const applyBatch: OperationTransformMethods['applyBatch'] = (
  editor,
  operations
) => {
  runEditorTransaction(editor, (tx) => {
    for (const operation of operations) {
      tx.apply(operation);
    }
  });
};

export const transform: OperationTransformMethods['transform'] = (
  editor,
  op
) => {
  let transformSelection = false;
  let selectionTransformOp = op;

  switch (op.type) {
    case 'insert_node': {
      const { path, node } = op;

      if (NodeApi.isEditor(node)) {
        throw new Error('Cannot insert an editor as a descendant node.');
      }

      if (PathApi.parent(path).length === 0) {
        mutateTopLevelChildren(editor, (children) => {
          const index = path.at(-1)!;

          assertChildIndex(op, path, index, children.length, true);
          children.splice(index, 0, node);
        });

        transformSelection = true;
        break;
      }

      modifyChildren(editor, PathApi.parent(path), (children) => {
        const index = path.at(-1)!;
        assertChildIndex(op, path, index, children.length, true);

        return insertChildren(children, index, node);
      });

      transformSelection = true;
      break;
    }

    case 'insert_text': {
      const { path, offset, text } = op;
      if (text.length === 0) break;

      modifyLeaf(editor, path, (node) => {
        assertTextOffset(op, path, offset, node.text.length);

        const before = node.text.slice(0, offset);
        const after = node.text.slice(offset);

        return {
          ...node,
          text: before + text + after,
        };
      });

      transformSelection = true;
      break;
    }

    case 'merge_node': {
      const { path } = op;
      const index = path.at(-1)!;
      const prevPath = PathApi.previous(path);
      const prevIndex = prevPath.at(-1)!;

      if (path.length === 0) {
        throw new Error(
          `Cannot apply a "merge_node" operation at path [${path}] because the root node cannot be merged.`
        );
      }

      // Defend against malicious paths containing strings
      if (typeof index !== 'number' || typeof prevIndex !== 'number')
        throw new Error('Index must be number');

      modifyChildren(editor, PathApi.parent(path), (children) => {
        const node = children[index];
        const prev = children[prevIndex];
        let newNode: Descendant;

        if (NodeApi.isText(node) && NodeApi.isText(prev)) {
          newNode = { ...prev, text: prev.text + node.text };
        } else if (NodeApi.isElement(node) && NodeApi.isElement(prev)) {
          newNode = { ...prev, children: prev.children.concat(node.children) };
        } else {
          throw new Error(
            `Cannot apply a "merge_node" operation at path [${path}] to nodes of different interfaces: ${formatDebugValue(
              node
            )} ${formatDebugValue(prev)}`
          );
        }

        inheritRuntimeId(newNode, prev, editor);

        return replaceChildren(children, prevIndex, 2, newNode);
      });

      if (getCurrentSelection(editor)) {
        const selection = getCurrentSelection(editor);

        if (selection) {
          const nextSelection = RangeApi.transform(selection, op);

          setCurrentSelection(
            editor,
            nextSelection,
            getSelectionRootAfterOperation(
              editor,
              nextSelection,
              getOperationRoot(op)
            )
          );
        }
      }
      break;
    }

    case 'move_node': {
      const { path, newPath } = op;
      const index = path.at(-1)!;

      if (path.length === 0) {
        throw new Error('Cannot move the editor root.');
      }

      if (newPath.length === 0) {
        throw new Error(
          `Cannot apply a "move_node" operation at path [${newPath}] because the destination must be a child path.`
        );
      }

      const sourceParentPath = PathApi.parent(path);
      const sourceChildren = getChildContainerChildren(
        editor,
        op,
        sourceParentPath
      );
      assertChildIndex(op, path, index, sourceChildren.length, false);

      const destinationParentPath = PathApi.parent(newPath);
      const destinationIndex = newPath.at(-1)!;
      const destinationChildren = getChildContainerChildren(
        editor,
        op,
        destinationParentPath
      );
      assertChildIndex(
        op,
        newPath,
        destinationIndex,
        destinationChildren.length,
        true
      );

      if (PathApi.equals(path, newPath)) {
        break;
      }

      if (PathApi.isAncestor(path, newPath)) {
        throw new Error(
          `Cannot move a path [${path}] to new path [${newPath}] because the destination is inside itself.`
        );
      }

      const node = sourceChildren[index];
      const parentBeforeMoveChildren = sourceChildren;
      const sameParentForwardMove =
        path.length === newPath.length &&
        path.at(-1) != null &&
        newPath.at(-1) != null &&
        PathApi.equals(path.slice(0, -1), newPath.slice(0, -1)) &&
        path.at(-1)! < newPath.at(-1)!;
      const effectiveSelectionPath = sameParentForwardMove
        ? ([
            ...newPath.slice(0, -1),
            Math.min(
              newPath.at(-1)!,
              Math.max(0, parentBeforeMoveChildren.length - 1)
            ),
          ] as Path)
        : null;

      // This is tricky, but since the `path` and `newPath` both refer to
      // the same snapshot in time, there's a mismatch. After either
      // removing the original position, the second step's path can be out
      // of date. So instead of using the `op.newPath` directly, we
      // `newPath` is expressed against the pre-removal tree. When the moved
      // node is before that destination, compute the effective post-removal
      // insertion path first.
      const truePath = sameParentForwardMove
        ? newPath
        : PathApi.transform(newPath, {
            type: 'remove_node',
            path,
            node,
          })!;
      const newIndex = truePath.at(-1)!;
      selectionTransformOp = {
        ...op,
        newPath: effectiveSelectionPath ?? truePath,
      };

      if (
        sourceParentPath.length === 0 &&
        PathApi.parent(truePath).length === 0
      ) {
        mutateTopLevelChildren(editor, (children) => {
          const [movedNode] = children.splice(index, 1);

          if (movedNode) {
            children.splice(newIndex, 0, movedNode);
          }
        });

        transformSelection = true;
        break;
      }

      modifyChildren(editor, PathApi.parent(path), (children) =>
        removeChildren(children, index, 1)
      );

      modifyChildren(editor, PathApi.parent(truePath), (children) =>
        insertChildren(children, newIndex, node)
      );

      transformSelection = true;
      break;
    }

    case 'remove_node': {
      const { path } = op;
      const index = path.at(-1)!;

      if (PathApi.parent(path).length === 0) {
        mutateTopLevelChildren(editor, (children) => {
          assertChildIndex(op, path, index, children.length, false);
          children.splice(index, 1);
        });
      } else {
        modifyChildren(editor, PathApi.parent(path), (children) => {
          assertChildIndex(op, path, index, children.length, false);

          return removeChildren(children, index, 1);
        });
      }

      // Transform all the points in the value, but if the point was in the
      // node that was removed we need to update the range or remove it.
      const currentSelection = getCurrentSelection(editor);

      if (currentSelection) {
        let selection: Selection = { ...currentSelection };

        for (const [point, key] of RangeApi.points(selection)) {
          const result = PointApi.transform(point, op);

          if (selection != null && result != null) {
            selection[key] = result;
          } else {
            let prev: NodeEntry<Text> | undefined;
            let next: NodeEntry<Text> | undefined;

            for (const [n, p] of NodeApi.texts(editor)) {
              if (PathApi.compare(p, path) === -1) {
                prev = [n, p];
              } else {
                next = [n, p];
                break;
              }
            }

            let preferNext = false;
            if (prev && next) {
              if (PathApi.isSibling(prev[1], path)) {
                preferNext = false;
              } else if (PathApi.equals(next[1], path)) {
                preferNext = true;
              } else {
                preferNext =
                  PathApi.common(prev[1], path).length <
                  PathApi.common(next[1], path).length;
              }
            }

            if (prev && !preferNext) {
              selection![key] = { path: prev[1], offset: prev[0].text.length };
            } else if (next) {
              selection![key] = { path: next[1], offset: 0 };
            } else {
              selection = null;
            }
          }
        }

        if (!selection || !RangeApi.equals(selection, currentSelection)) {
          setCurrentSelection(editor, selection, op.root);
        }
      }

      break;
    }

    case 'remove_text': {
      const { path, offset, text } = op;
      if (text.length === 0) break;

      modifyLeaf(editor, path, (node) => {
        assertTextOffset(op, path, offset, node.text.length);
        assertTextOffset(op, path, offset + text.length, node.text.length);

        if (node.text.slice(offset, offset + text.length) !== text) {
          throw new Error(
            `Cannot apply a "remove_text" operation at path [${path}] because the text at offset ${offset} does not match the operation text.`
          );
        }

        const before = node.text.slice(0, offset);
        const after = node.text.slice(offset + text.length);

        return {
          ...node,
          text: before + after,
        };
      });

      transformSelection = true;
      break;
    }

    case 'replace_fragment': {
      modifyChildren(editor, op.path, () => op.newChildren as Descendant[]);
      setCurrentSelection(editor, op.newSelection, op.root);
      syncImplicitTargetToCurrentSelection(editor);
      break;
    }

    case 'replace_children': {
      modifyChildren(editor, op.path, (children) => {
        assertChildRange(op, children.length, op.children.length);

        return replaceChildRange(
          children,
          op.index,
          op.children.length,
          op.newChildren as Descendant[]
        );
      });
      setCurrentSelection(editor, op.newSelection, op.root);
      if (op.rootIsPresent === false) {
        deleteEditorRoot(editor, op.root);
      }
      syncImplicitTargetToCurrentSelection(editor);
      break;
    }

    case 'set_node': {
      const { path, properties, newProperties } = op;

      if (path.length === 0) {
        throw new Error('Cannot set properties on the root node!');
      }

      modifyDescendant(editor, path, (node) => {
        const newNode = { ...node };

        for (const key in newProperties) {
          if (!Object.hasOwn(newProperties, key)) continue;
          if (NON_SETTABLE_NODE_PROPERTIES.includes(key)) {
            if (key === 'children') {
              throw new Error('set_node does not update child content');
            }
            throw new Error(`Cannot set the "${key}" property of nodes!`);
          }

          const value = newProperties[<keyof Node>key];

          // Make sure we're not setting `then` to a function, since this will
          // cause the node to be treated as a Promise-like object, which can
          // cause unexpected behaviour when returning the node from async
          // functions.
          if (key === 'then' && typeof value === 'function') {
            throw new Error(
              'Cannot set the "then" property of a node to a function'
            );
          }

          if (value == null) {
            throw new Error(
              'set_node newProperties cannot remove properties with nullish values; omit the property instead'
            );
          }

          newNode[<keyof Node>key] = value;
        }

        // Existing properties missing from the next property set are deleted.
        for (const key in properties) {
          if (!Object.hasOwn(properties, key)) continue;
          if (NON_SETTABLE_NODE_PROPERTIES.includes(key)) {
            if (key === 'children') {
              throw new Error('set_node does not update child content');
            }
            throw new Error(`Cannot set the "${key}" property of nodes!`);
          }

          if (!Object.hasOwn(newProperties, key)) {
            delete newNode[<keyof Node>key];
          }
        }

        return newNode;
      });

      break;
    }

    case 'set_selection': {
      const { newProperties } = op;
      const root = op.root;

      if (newProperties == null) {
        setCurrentSelection(editor, null, root);
        syncImplicitTargetToCurrentSelection(editor);
        break;
      }

      const currentSelection = getCurrentSelection(editor);

      if (currentSelection == null) {
        if (!(newProperties.anchor && newProperties.focus)) {
          throw new Error(
            `set_selection patch requires an existing selection or a full range. Received: ${formatDebugValue(
              newProperties
            )}`
          );
        }

        setCurrentSelection(editor, newProperties as Range, root);
        syncImplicitTargetToCurrentSelection(editor);
        break;
      }

      const selection = { ...currentSelection };

      for (const key in newProperties) {
        if (!Object.hasOwn(newProperties, key)) continue;
        if (NON_SETTABLE_SELECTION_PROPERTIES.includes(key)) {
          throw new Error(`Cannot set the "${key}" property of the selection!`);
        }

        if (key !== 'anchor' && key !== 'focus') {
          continue;
        }

        const value = newProperties[<keyof Range>key];

        if (value == null) {
          if (key === 'anchor' || key === 'focus') {
            throw new Error(`Cannot remove the "${key}" selection property`);
          }

          delete selection[<keyof Range>key];
        } else {
          selection[<keyof Range>key] = value;
        }
      }

      setCurrentSelection(editor, selection, root);
      syncImplicitTargetToCurrentSelection(editor);

      break;
    }

    case 'split_node': {
      const { path, position, properties } = op;
      const index = path.at(-1);

      if (path.length === 0) {
        throw new Error(
          `Cannot apply a "split_node" operation at path [${path}] because the root node cannot be split.`
        );
      }

      // Defend against malicious paths containing strings
      if (typeof index !== 'number') throw new Error('Index must be number');

      const createSplitNodes = (children: Descendant[]) => {
        assertChildIndex(op, path, index, children.length, false);

        const node = children[index];
        let newNode: Descendant;
        let nextNode: Descendant;

        if (NodeApi.isText(node)) {
          assertTextOffset(op, path, position, node.text.length);

          const before = node.text.slice(0, position);
          const after = node.text.slice(position);
          newNode = {
            ...node,
            text: before,
          };
          nextNode = {
            ...properties,
            text: after,
          };
        } else {
          assertChildIndex(op, path, position, node.children.length, true);

          const before = node.children.slice(0, position);
          const after = node.children.slice(position);
          newNode = {
            ...node,
            children: before,
          };
          nextNode = {
            ...(Object.hasOwn(properties, 'type') &&
            typeof (properties as { type?: unknown }).type === 'string'
              ? { type: (properties as { type: string }).type }
              : Object.hasOwn(node, 'type')
                ? { type: (node as { type?: unknown }).type }
                : {}),
            ...properties,
            children: after,
          } as Descendant;
        }

        inheritRuntimeId(newNode, node, editor);

        for (const key in properties) {
          if (!Object.hasOwn(properties, key)) continue;
          if (NON_SETTABLE_NODE_PROPERTIES.includes(key)) {
            throw new Error(`Cannot set the "${key}" property of nodes!`);
          }

          const value = properties[<keyof Node>key];

          // Make sure we're not setting `then` to a function, since this will
          // cause the node to be treated as a Promise-like object, which can
          // cause unexpected behaviour when returning the node from async
          // functions.
          if (key === 'then' && typeof value === 'function') {
            throw new Error(
              'Cannot set the "then" property of a node to a function'
            );
          }

          if (value != null) {
            nextNode[<keyof Node>key] = value;
          }
        }

        return { newNode, nextNode };
      };

      const parentPath = PathApi.parent(path);

      if (parentPath.length === 0) {
        mutateTopLevelChildren(editor, (children) => {
          const { newNode, nextNode } = createSplitNodes(children);

          children.splice(index, 1, newNode, nextNode);
        });
      } else {
        modifyChildren(editor, parentPath, (children) => {
          const { newNode, nextNode } = createSplitNodes(children);

          return replaceChildren(children, index, 1, newNode, nextNode);
        });
      }

      if (getCurrentSelection(editor)) {
        const selection = getCurrentSelection(editor);

        if (selection) {
          const nextSelection = RangeApi.transform(selection, op, {
            affinity: 'inward',
          });

          setCurrentSelection(
            editor,
            nextSelection,
            getSelectionRootAfterOperation(
              editor,
              nextSelection,
              getOperationRoot(op)
            )
          );
        }
      }
      break;
    }
  }

  const currentSelection = getCurrentSelection(editor);

  if (transformSelection && currentSelection) {
    const selection = { ...currentSelection };

    for (const [point, key] of RangeApi.points(selection)) {
      selection[key] = PointApi.transform(point, selectionTransformOp)!;
    }

    if (!RangeApi.equals(selection, currentSelection)) {
      setCurrentSelection(editor, selection, selectionTransformOp.root);
    }
  }
};
