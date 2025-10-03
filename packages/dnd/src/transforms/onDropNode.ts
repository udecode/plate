import type { PlateEditor } from 'platejs/react';
import type { DropTargetMonitor } from 'react-dnd';

import { type NodeEntry, type Path, type TElement, PathApi } from 'platejs';

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
    (canDropNode &&
      dragEntry &&
      !canDropNode({ dragEntry, dragItem, dropEntry, editor })) ||
    !monitor.canDrop()
  ) {
    return;
  }

  let dropPath: Path | undefined;

  // if drag from file system use [] as default path
  const dragPath = dragEntry?.[1];
  const hoveredPath = dropEntry[1];

  // Treat 'right' like 'bottom' (after hovered)
  // Treat 'left' like 'top' (before hovered)
  if (direction === 'bottom' || direction === 'right') {
    // Insert after hovered node
    dropPath = hoveredPath;

    // If the dragged node is already right after hovered node, no change
    if (dragPath && PathApi.equals(dragPath, PathApi.next(dropPath))) return;
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

  if (dragItem.editorId === editor.id) {
    // Check if we're dragging multiple nodes
    const draggedIds = Array.isArray(dragItem.id) ? dragItem.id : [dragItem.id];

    if (draggedIds.length > 1) {
      // Handle multi-node drop - get elements by their IDs and sort them
      const elements: TElement[] = [];

      draggedIds.forEach((id) => {
        const entry = editor.api.node<TElement>({ id, at: [] });
        if (entry) {
          elements.push(entry[0]);
        }
      });

      editor.tf.moveNodes({
        at: [],
        to,
        match: (n) => elements.some((element) => element.id === n.id),
      });
    } else {
      // Single node drop
      editor.tf.moveNodes({
        at: dragPath,
        to,
      });
    }
  } else {
    editor.tf.insertNodes(dragItem.element, { at: to });

    const sourceEditor = dragItem.editor;

    if (sourceEditor) {
      const draggedIds = Array.isArray(dragItem.id)
        ? dragItem.id
        : dragItem.id
          ? [dragItem.id]
          : [];

      const paths = draggedIds
        .map((id) => sourceEditor.api.node<TElement>({ id, at: [] }))
        .filter((entry): entry is NodeEntry<TElement> => !!entry)
        .map(([, path]) => path)
        .sort((a, b) => PathApi.compare(b, a));

      paths.forEach((path) => {
        sourceEditor.tf.removeNodes({ at: path });
      });
    }
  }
};
