import type { PlateEditor } from '@udecode/plate/react';
import type { DropTargetMonitor } from 'react-dnd';

import {
  type NodeEntry,
  type Path,
  type TElement,
  PathApi,
} from '@udecode/plate';

import type { UseDropNodeOptions } from '../hooks';
import type { DragItemNode, ElementDragItemNode } from '../types';

import { getHoverDirection } from '../utils';

/** Callback called on drag and drop a node with id. */
export const getDropPath = (
  editor: PlateEditor,
  {
    canDropNode,
    dragItem,
    element,
    monitor,
    nodeRef,
    orientation = 'vertical',
  }: {
    dragItem: DragItemNode;
    monitor: DropTargetMonitor;
  } & Pick<
    UseDropNodeOptions,
    'canDropNode' | 'element' | 'nodeRef' | 'orientation'
  >
) => {
  const direction = getHoverDirection({
    dragItem,
    element,
    monitor,
    nodeRef,
    orientation,
  });

  if (!direction) return;

  let dragEntry: NodeEntry<TElement> | undefined;
  let dropEntry: NodeEntry<TElement> | undefined;

  if ('element' in dragItem) {
    const dragPath = editor.api.findPath(dragItem.element);
    const hoveredPath = editor.api.findPath(element);

    if (!dragPath || !hoveredPath) return;

    dragEntry = [dragItem.element, dragPath];
    dropEntry = [element, hoveredPath];
  } else {
    dropEntry = editor.api.node<TElement>({ id: element.id as string, at: [] });
  }
  if (!dropEntry) return;
  if (
    canDropNode &&
    dragEntry &&
    !canDropNode({ dragEntry, dragItem, dropEntry, editor })
  ) {
    return;
  }

  let dropPath: Path | undefined;

  // if drag from file system use [] as default path
  const dragPath = dragEntry?.[1];
  const hoveredPath = dropEntry[1];

  // Treat 'right' like 'bottom' (after hovered)
  // Treat 'left' like 'top' (before hovered)
  if (dragPath && (direction === 'bottom' || direction === 'right')) {
    // Insert after hovered node
    dropPath = hoveredPath;

    // If the dragged node is already right after hovered node, no change
    if (PathApi.equals(dragPath, PathApi.next(dropPath))) return;
  }
  if (direction === 'top' || direction === 'left') {
    // Insert before hovered node
    dropPath = [...hoveredPath.slice(0, -1), hoveredPath.at(-1)! - 1];

    // If the dragged node is already right before hovered node, no change
    if (dragPath && PathApi.equals(dragPath, dropPath)) return;
  }

  const _dropPath = dropPath as Path;
  const before =
    dragPath &&
    PathApi.isBefore(dragPath, _dropPath) &&
    PathApi.isSibling(dragPath, _dropPath);
  const to = before ? _dropPath : PathApi.next(_dropPath);

  return { direction, dragPath, to };
};

export const onDropNode = (
  editor: PlateEditor,
  {
    canDropNode,
    dragItem,
    element,
    monitor,
    nodeRef,
    orientation = 'vertical',
  }: {
    dragItem: ElementDragItemNode;
    monitor: DropTargetMonitor;
  } & Pick<
    UseDropNodeOptions,
    'canDropNode' | 'element' | 'nodeRef' | 'orientation'
  >
) => {
  const result = getDropPath(editor, {
    canDropNode,
    dragItem,
    element,
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
