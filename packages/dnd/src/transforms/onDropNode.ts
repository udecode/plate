import type { PlateEditor } from '@platejs/core/react';
import type { Element, NodeEntry, Path } from '@platejs/plite';
import type { DropTargetMonitor } from 'react-dnd';

import { PathApi } from '@platejs/plite';

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
    editorId: editor.id,
    element,
    monitor,
    nodeRef,
    orientation,
  });

  if (!direction) return;

  let dragEntry: NodeEntry<Element> | undefined;
  let dropEntry: NodeEntry<Element> | undefined;

  if ('element' in dragItem) {
    const hoveredPath = editor.read.nodes.path(element);

    if (!hoveredPath) return;

    const sourceEditor =
      dragItem.editorId === editor.id ? editor : dragItem.editor;
    const dragPath = sourceEditor?.read.nodes.path(dragItem.element);

    if (sourceEditor && !dragPath) return;

    if (dragPath) {
      dragEntry = [dragItem.element, dragPath];
    }
    dropEntry = [element, hoveredPath];
  } else {
    dropEntry = editor.read.nodes.find<Element>({
      at: [],
      match: { id: element.id },
    });
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

  const dragPath =
    'editorId' in dragItem && dragItem.editorId === editor.id
      ? dragEntry?.[1]
      : undefined;
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
    const hoveredIndex = hoveredPath.at(-1);

    if (hoveredIndex === undefined) return;

    dropPath = [...hoveredPath.slice(0, -1), hoveredIndex - 1];

    // If the dragged node is already right before hovered node, no change
    if (dragPath && PathApi.equals(dragPath, dropPath)) return;
  }

  if (!dropPath) return;

  const before =
    dragPath &&
    PathApi.isBefore(dragPath, dropPath) &&
    PathApi.isSibling(dragPath, dropPath);
  const to = before ? dropPath : PathApi.next(dropPath);

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

  const { direction, dragPath, to } = result;

  if (dragItem.editorId === editor.id) {
    // Check if we're dragging multiple nodes
    const draggedIds = Array.isArray(dragItem.id) ? dragItem.id : [dragItem.id];

    if (draggedIds.length > 1) {
      if (draggedIds.includes(element.id as string)) return;

      const entries = draggedIds
        .map((id) => editor.read.nodes.find<Element>({ at: [], match: { id } }))
        .filter((entry): entry is NodeEntry<Element> => !!entry)
        .toSorted(([, a], [, b]) => PathApi.compare(a, b));
      const insertAfter = direction === 'bottom' || direction === 'right';

      editor.update((tx) => {
        let target = element;

        for (const [node] of entries) {
          const path = tx.nodes.path(node);
          const targetPath = tx.nodes.path(target);

          if (!path || !targetPath) continue;

          const sameParentBefore =
            PathApi.isBefore(path, targetPath) &&
            PathApi.isSibling(path, targetPath);
          const destination = insertAfter
            ? sameParentBefore
              ? targetPath
              : PathApi.next(targetPath)
            : sameParentBefore
              ? PathApi.previous(targetPath)
              : targetPath;

          tx.nodes.move({
            at: path,
            to: destination,
          });

          if (insertAfter) target = node;
        }
      });
    } else {
      if (!dragPath) return;

      // Single node drop
      editor.update.nodes.move({
        at: dragPath,
        to,
      });
    }
  } else {
    const sourceEditor = dragItem.editor;

    if (sourceEditor) {
      const draggedIds = Array.isArray(dragItem.id)
        ? dragItem.id
        : dragItem.id
          ? [dragItem.id]
          : [];

      const entries = draggedIds
        .map((id) =>
          sourceEditor.read.nodes.find<Element>({ at: [], match: { id } })
        )
        .filter((entry): entry is NodeEntry<Element> => !!entry);
      const elements = entries
        .toSorted(([, a], [, b]) => PathApi.compare(a, b))
        .map(([node]) => node);
      const paths = entries
        .map(([, path]) => path)
        .toSorted((a, b) => PathApi.compare(b, a));

      // Core's NodeIdPlugin rewrites cross-document ID collisions on insert.
      editor.update.nodes.insert(
        elements.length > 0 ? elements : dragItem.element,
        {
          at: to,
        }
      );

      if (paths.length > 0) {
        sourceEditor.update((tx) => {
          paths.forEach((path) => {
            tx.nodes.remove({ at: path });
          });
        });
      }
    } else {
      editor.update.nodes.insert(dragItem.element, { at: to });
    }
  }
};
