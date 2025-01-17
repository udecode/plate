import type { PlateEditor } from '@udecode/plate/react';
import type { DropTargetMonitor } from 'react-dnd';

import { type Path, type TElement, PathApi, NodeEntry } from '@udecode/plate';

import type { UseDropNodeOptions } from '../hooks';
import type { ElementDragItemNode } from '../types';

import { getHoverDirection } from '../utils';

/** Callback called on drag and drop a node with id. */
export const getDropPath = (
  editor: PlateEditor,
  {
    element,
    canDropNode,
    dragItem,
    monitor,
    nodeRef,
    orientation = 'vertical',
  }: {
    dragItem: ElementDragItemNode;
    monitor: DropTargetMonitor;
  } & Pick<UseDropNodeOptions, 'canDropNode' | 'element' | 'nodeRef' | 'orientation'>
) => {
  const direction = getHoverDirection({
    element,
    dragItem,
    monitor,
    nodeRef,
    orientation,
  });

  if (!direction) return;

  const dragPath = editor.api.findPath(dragItem.element);
  if (!dragPath) return;
  const dragEntry = editor.api.node<TElement>({
    id: dragItem.id,
    at: [],
  });

  if (!dragEntry) return;

  const hoveredPath = editor.api.findPath(element);
  if (!hoveredPath) return;
  const dropEntry: NodeEntry<TElement> = [element, hoveredPath];

  if (!dropEntry) return;
  if (canDropNode && !canDropNode({ dragEntry, dragItem, dropEntry, editor })) {
    return;
  }

  let dropPath: Path | undefined;

  // Treat 'right' like 'bottom' (after hovered)
  // Treat 'left' like 'top' (before hovered)
  if (direction === 'bottom' || direction === 'right') {
    // Insert after hovered node
    dropPath = hoveredPath;

    // If the dragged node is already right after hovered node, no change
    if (PathApi.equals(dragPath, PathApi.next(dropPath))) return;
  }
  if (direction === 'top' || direction === 'left') {
    // Insert before hovered node
    dropPath = [...hoveredPath.slice(0, -1), hoveredPath.at(-1)! - 1];

    // If the dragged node is already right before hovered node, no change
    if (PathApi.equals(dragPath, dropPath)) return;
  }

  const _dropPath = dropPath as Path;
  const before =
    PathApi.isBefore(dragPath, _dropPath) &&
    PathApi.isSibling(dragPath, _dropPath);
  const to = before ? _dropPath : PathApi.next(_dropPath);

  return { direction, dragPath, to };
};

export const onDropNode = (
  editor: PlateEditor,
  {
    element,
    canDropNode,
    dragItem,
    monitor,
    nodeRef,
    orientation = 'vertical',
  }: {
    dragItem: ElementDragItemNode;
    monitor: DropTargetMonitor;
  } & Pick<UseDropNodeOptions, 'canDropNode' | 'element' | 'nodeRef' | 'orientation'>
) => {
  const result = getDropPath(editor, {
    element,
    canDropNode,
    dragItem,
    monitor,
    nodeRef,
    orientation,
  });

  if (!result) return;

  const { dragPath, to } = result;

  editor.tf.moveNodes({
    at: dragPath,
    to,
  });
};
