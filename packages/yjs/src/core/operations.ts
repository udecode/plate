import type { Operation, Path } from '@platejs/slate';
import * as Y from 'yjs';

import {
  getSlateYjsElementType,
  hasYjsAttributes,
  toYjsAttributeRecord,
  type YjsNode,
} from './attributes';
import {
  createVirtualYjsMovePlaceholder,
  createYjsNode,
  createYjsNodes,
  createYjsText,
  createYjsVisibleChildrenReader,
  getYjsLength,
  getYjsNode,
  getYjsNodeIf,
  getYjsParent,
  getYjsTextContentFrom,
  getYjsVisibleChild,
  hasMultipleYjsVisibleChildren,
  hasYjsVisibleChildren,
  hideYjsNode,
  insertYjsChild,
  isVirtualYjsChild,
  removeYjsChild,
  removeYjsVirtualPlaceholderChild,
  replaceYjsChildren,
  resolveYjsTextPoint,
  setVirtualYjsMove,
  setVirtualYjsUnwrapMove,
  splitVisibleYjsChildren,
  type YjsVisibleChildrenReader,
} from './document';
import { lastPathIndex, parentPath, pathsEqual } from './path';
import { isRecord } from './record';
import {
  createSplitElement,
  isNoopSlateOperationForYjs as isNoopOperationForYjs,
  replaceCompatibleYjsChildren,
  setYjsNodeAttributes,
} from './replacement';
import type { YjsTraceEntry, YjsTraceFallback } from './types';

export { isNoopSlateOperationForYjs } from './replacement';

const materializeEmptyYjsText = (
  root: Y.XmlElement,
  path: Path
): Y.XmlText | null => {
  const index = lastPathIndex(path);

  if (index !== 0) {
    return null;
  }

  const parent = getYjsNodeIf(root, parentPath(path));

  if (!(parent instanceof Y.XmlElement)) {
    return null;
  }
  if (hasYjsVisibleChildren(root, parent)) {
    return null;
  }

  const text = createYjsText('', {});

  insertYjsChild(root, parent, 0, text);

  return text;
};

const getYjsTextForInsert = (
  root: Y.XmlElement,
  path: Path
): Y.XmlText | null => {
  const target = getYjsNodeIf(root, path);

  if (target instanceof Y.XmlText) {
    return target;
  }
  if (target !== null) {
    return null;
  }

  return materializeEmptyYjsText(root, path);
};

const deleteYjsTextRange = (
  root: Y.XmlElement,
  path: Path,
  offset: number,
  length: number,
  readVisibleChildren: YjsVisibleChildrenReader
): void => {
  const point = resolveYjsTextPoint(root, path, offset, readVisibleChildren);

  if (point === null) {
    return;
  }

  let childIndex = point.childIndex;
  let deleteOffset = point.offset;
  let remainingLength = length;
  let children = readVisibleChildren(point.parent);

  while (remainingLength > 0) {
    const child = children[childIndex];

    if (!(child instanceof Y.XmlText)) {
      break;
    }

    const availableLength = getYjsLength(child) - deleteOffset;
    const deleteLength = Math.min(availableLength, remainingLength);
    let removedEmptyText = false;

    if (deleteLength > 0) {
      child.delete(deleteOffset, deleteLength);
      remainingLength -= deleteLength;
      removedEmptyText = removeRedundantEmptyYjsText(
        root,
        point.parent,
        childIndex,
        child,
        readVisibleChildren
      );
    }

    if (remainingLength > 0) {
      if (removedEmptyText) {
        children = readVisibleChildren(point.parent);
      } else {
        childIndex++;
      }
      deleteOffset = 0;
    }
  }
};

const isEmptyYjsText = (node: YjsNode): boolean =>
  node instanceof Y.XmlText && getYjsLength(node) === 0;

const removeRedundantEmptyYjsText = (
  root: Y.XmlElement,
  parent: Y.XmlElement,
  index: number,
  text: Y.XmlText,
  readVisibleChildren: YjsVisibleChildrenReader
): boolean => {
  if (!isEmptyYjsText(text) || hasYjsAttributes(text)) {
    return false;
  }
  if (!hasMultipleYjsVisibleChildren(root, parent)) {
    return false;
  }

  removeYjsChild(root, parent, index);

  return true;
};

type YjsElementChildKind = 'element' | 'empty' | 'mixed' | 'text';

const getYjsElementChildKind = (
  children: readonly YjsNode[]
): YjsElementChildKind => {
  let kind: YjsElementChildKind = 'empty';
  let index = 0;

  while (index < children.length) {
    const child = children[index];

    if (child === undefined) {
      throw new Error('Cannot read child kind from a sparse Yjs child array.');
    }

    const childKind = child instanceof Y.XmlText ? 'text' : 'element';

    if (kind === 'empty') {
      kind = childKind;
      index++;
      continue;
    }

    if (kind !== childKind) {
      return 'mixed';
    }

    index++;
  }

  return kind;
};

const canMergeYjsElements = (
  previous: Y.XmlElement,
  target: Y.XmlElement,
  previousChildren: readonly YjsNode[],
  targetChildren: readonly YjsNode[]
): boolean => {
  if (getSlateYjsElementType(previous) !== getSlateYjsElementType(target)) {
    return false;
  }

  const previousKind = getYjsElementChildKind(previousChildren);

  if (previousKind === 'mixed') {
    return false;
  }

  const targetKind = getYjsElementChildKind(targetChildren);

  if (targetKind === 'mixed') {
    return false;
  }

  return (
    previousKind === 'empty' ||
    targetKind === 'empty' ||
    previousKind === targetKind
  );
};

const getUnsupportedOperationType = (operation: unknown): string => {
  const operationType = isRecord(operation) ? operation.type : undefined;

  return typeof operationType === 'string' ? operationType : 'unknown';
};

const unsupportedYjsOperation = (operation: never): never => {
  throw new Error(
    `Unsupported Yjs operation: ${getUnsupportedOperationType(operation)}`
  );
};

const operationTrace = (operation: Operation): YjsTraceEntry => ({
  mode: 'operation',
  operationType: operation.type,
});

const traceableFallback = (
  operation: Operation,
  fallback: YjsTraceFallback
): YjsTraceEntry => ({
  fallback,
  mode: 'traceable-fallback',
  operationType: operation.type,
});

const getYjsElementOperationTarget = (
  root: Y.XmlElement,
  path: Path,
  operationType: string
): Y.XmlElement => {
  const target = getYjsNode(root, path);

  if (!(target instanceof Y.XmlElement)) {
    throw new Error(`${operationType} target is not a Y.XmlElement.`);
  }

  return target;
};

export const applySlateOperationToYjs = (
  root: Y.XmlElement,
  operation: Operation
): YjsTraceEntry | null => {
  if (isNoopOperationForYjs(operation)) {
    return null;
  }

  let readVisibleChildren: YjsVisibleChildrenReader | undefined;
  const getReadVisibleChildren = (): YjsVisibleChildrenReader => {
    readVisibleChildren ??= createYjsVisibleChildrenReader(root);

    return readVisibleChildren;
  };

  switch (operation.type) {
    case 'insert_text': {
      const text = getYjsTextForInsert(root, operation.path);

      if (!(text instanceof Y.XmlText)) {
        throw new Error('insert_text target is not a Y.XmlText.');
      }

      const point = resolveYjsTextPoint(
        root,
        operation.path,
        operation.offset,
        getReadVisibleChildren()
      );

      if (point === null) {
        return operationTrace(operation);
      }

      point.text.insert(point.offset, operation.text);

      return operationTrace(operation);
    }
    case 'remove_text': {
      deleteYjsTextRange(
        root,
        operation.path,
        operation.offset,
        operation.text.length,
        getReadVisibleChildren()
      );

      return operationTrace(operation);
    }
    case 'insert_node': {
      const { index, parent } = getYjsParent(root, operation.path);

      insertYjsChild(root, parent, index, createYjsNode(operation.node));

      return operationTrace(operation);
    }
    case 'remove_node': {
      const { index, parent } = getYjsParent(root, operation.path);
      const removalMode = removeYjsChild(root, parent, index, operation.node);

      if (removalMode === 'hidden') {
        return traceableFallback(operation, 'virtual-unwrap-wrapper-remove');
      }
      if (removalMode === 'hidden-parent') {
        return traceableFallback(operation, 'virtual-move-parent-remove');
      }

      return operationTrace(operation);
    }
    case 'split_node': {
      const target = getYjsNode(root, operation.path);
      const { index, parent } = getYjsParent(root, operation.path);

      if (target instanceof Y.XmlText) {
        const readVisibleChildren = getReadVisibleChildren();
        const point = resolveYjsTextPoint(
          root,
          operation.path,
          operation.position,
          readVisibleChildren
        );

        if (point === null) {
          return operationTrace(operation);
        }

        const children = readVisibleChildren(point.parent);
        const nextChild = children[point.childIndex + 1];
        const textLength = getYjsLength(point.text);

        if (point.offset === textLength && nextChild instanceof Y.XmlText) {
          return operationTrace(operation);
        }

        const rightText = getYjsTextContentFrom(point.text, point.offset);

        if (rightText.length > 0) {
          point.text.delete(point.offset, rightText.length);
        }

        insertYjsChild(
          root,
          point.parent,
          point.childIndex + 1,
          createYjsText(rightText, toYjsAttributeRecord(operation.properties))
        );

        return operationTrace(operation);
      }

      const rightChildren = splitVisibleYjsChildren(
        root,
        target,
        operation.position
      );

      insertYjsChild(
        root,
        parent,
        index + 1,
        createSplitElement(
          target,
          toYjsAttributeRecord(operation.properties),
          rightChildren
        )
      );

      return operationTrace(operation);
    }
    case 'merge_node': {
      const { index, parent } = getYjsParent(root, operation.path);

      if (index === 0) {
        throw new Error('Cannot merge the first Yjs child.');
      }

      const readVisibleChildren = getReadVisibleChildren();
      const children = readVisibleChildren(parent);
      const previous = children[index - 1];
      const target = children[index];

      if (previous instanceof Y.XmlText && !target) {
        return traceableFallback(operation, 'empty-text-merge-elided');
      }

      if (!previous || !target) {
        throw new Error('Cannot merge a missing Yjs node.');
      }

      if (previous instanceof Y.XmlText && target instanceof Y.XmlText) {
        return traceableFallback(operation, 'text-merge-preserve-yjs-boundary');
      }

      if (previous instanceof Y.XmlElement && target instanceof Y.XmlElement) {
        const previousChildren = readVisibleChildren(previous);
        const targetChildren = readVisibleChildren(target);

        if (
          !canMergeYjsElements(
            previous,
            target,
            previousChildren,
            targetChildren
          )
        ) {
          return traceableFallback(
            operation,
            'incompatible-structural-merge-elided'
          );
        }

        const previousHasVisibleChildren = previousChildren.length > 0;
        let targetIndex = 0;

        while (targetIndex < targetChildren.length) {
          const moveTarget = targetChildren[targetIndex];

          if (moveTarget === undefined) {
            throw new Error('Cannot merge from a sparse Yjs child array.');
          }

          if (previousHasVisibleChildren && isEmptyYjsText(moveTarget)) {
            targetIndex++;
            continue;
          }

          insertYjsChild(
            root,
            previous,
            getYjsLength(previous),
            createVirtualYjsMovePlaceholder(moveTarget)
          );
          targetIndex++;
        }

        removeYjsVirtualPlaceholderChild(root, parent, index, target);
        hideYjsNode(target);

        return traceableFallback(operation, 'virtual-merge-ref');
      }

      throw new Error('Cannot merge Yjs nodes of different kinds.');
    }
    case 'replace_fragment': {
      const target = getYjsElementOperationTarget(
        root,
        operation.path,
        operation.type
      );

      const children = getReadVisibleChildren()(target);
      if (
        replaceCompatibleYjsChildren(
          root,
          children,
          operation.children,
          operation.newChildren
        )
      ) {
        return operationTrace(operation);
      }

      replaceYjsChildren(target, operation.newChildren);

      return traceableFallback(
        operation,
        'replace-fragment-scoped-replace-identity-risk'
      );
    }
    case 'set_selection':
      return null;
    case 'set_node': {
      const node = getYjsNode(root, operation.path);

      setYjsNodeAttributes(
        node,
        toYjsAttributeRecord(operation.properties),
        toYjsAttributeRecord(operation.newProperties)
      );

      return operationTrace(operation);
    }
    case 'replace_children': {
      const target = getYjsElementOperationTarget(
        root,
        operation.path,
        operation.type
      );

      if (
        replaceCompatibleYjsChildren(
          root,
          getReadVisibleChildren()(target),
          operation.children,
          operation.newChildren,
          operation.index
        )
      ) {
        return operationTrace(operation);
      }

      let hasVirtualRemoval = false;
      let childIndex = 0;

      while (childIndex < operation.children.length) {
        const child = operation.children[childIndex];

        if (child === undefined) {
          throw new Error(
            'Cannot remove replace_children entries from a sparse child array.'
          );
        }

        const removalMode = removeYjsChild(
          root,
          target,
          operation.index,
          child
        );

        if (removalMode !== 'visible') {
          hasVirtualRemoval = true;
        }
        childIndex++;
      }

      if (operation.newChildren.length > 0) {
        const newChildren = createYjsNodes(operation.newChildren);

        for (let offset = 0; offset < newChildren.length; offset++) {
          const child = newChildren[offset];

          if (child === undefined) {
            continue;
          }

          insertYjsChild(root, target, operation.index + offset, child);
        }
      }

      if (hasVirtualRemoval) {
        return traceableFallback(operation, 'replace-children-virtual-removal');
      }

      return operationTrace(operation);
    }
    case 'move_node': {
      const target = getYjsNodeIf(root, operation.path);
      const sourceIndex = lastPathIndex(operation.path);

      if (target === null) {
        return traceableFallback(operation, 'missing-move-source-elided');
      }

      const sourceParentPath = parentPath(operation.path);
      const sourceParent = getYjsNodeIf(root, sourceParentPath);
      const newParentPath = parentPath(operation.newPath);
      const newIndex = lastPathIndex(operation.newPath);
      const newParent = getYjsNodeIf(root, newParentPath);

      if (
        sourceParent instanceof Y.XmlElement &&
        isVirtualYjsChild(target, sourceParent) &&
        pathsEqual(operation.newPath, sourceParentPath)
      ) {
        const { index: wrapperIndex, parent: wrapperParent } = getYjsParent(
          root,
          sourceParentPath
        );

        setVirtualYjsUnwrapMove(
          root,
          target,
          sourceParent,
          wrapperParent,
          wrapperIndex
        );

        return traceableFallback(operation, 'virtual-unwrap-ref');
      }

      if (!(newParent instanceof Y.XmlElement)) {
        return traceableFallback(operation, 'missing-move-destination-elided');
      }
      if (newIndex === undefined) {
        throw new Error('move_node destination is missing an index.');
      }

      const removeSourceVirtualPlaceholder = (): void => {
        if (
          sourceParent instanceof Y.XmlElement &&
          sourceParent !== newParent &&
          sourceIndex !== undefined
        ) {
          removeYjsVirtualPlaceholderChild(
            root,
            sourceParent,
            sourceIndex,
            target
          );
        }
      };

      if (
        sourceParent instanceof Y.XmlElement &&
        sourceParent === newParent &&
        sourceIndex !== undefined
      ) {
        removeYjsVirtualPlaceholderChild(
          root,
          sourceParent,
          sourceIndex,
          target
        );
      }
      const firstNewParentChild = getYjsVisibleChild(root, newParent, 0);
      const hasMultipleNewParentChildren =
        getYjsVisibleChild(root, newParent, 1) !== undefined;
      let removedEmptyNewParentChild = false;

      if (
        newIndex === 0 &&
        !hasMultipleNewParentChildren &&
        firstNewParentChild !== undefined &&
        isEmptyYjsText(firstNewParentChild)
      ) {
        removeYjsChild(root, newParent, 0);
        removedEmptyNewParentChild = true;
      }

      if (
        newIndex === 0 &&
        getYjsLength(newParent) === 0 &&
        (firstNewParentChild === undefined || removedEmptyNewParentChild)
      ) {
        setVirtualYjsMove(root, target, newParent);
        removeSourceVirtualPlaceholder();

        return traceableFallback(operation, 'virtual-move-ref');
      }

      insertYjsChild(
        root,
        newParent,
        newIndex,
        createVirtualYjsMovePlaceholder(target)
      );
      removeSourceVirtualPlaceholder();

      return traceableFallback(operation, 'virtual-move-placeholder');
    }
  }

  return unsupportedYjsOperation(operation);
};
