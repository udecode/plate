import {
  type ConnectDropTarget,
  type DropTargetHookSpec,
  type DropTargetMonitor,
  useDrop,
} from 'react-dnd';

import type React from 'react';

import type { PlateEditor } from '@platejs/core/react';
import type { Element, NodeEntry } from '@platejs/plite';

import type { DragItemNode } from '../types';

import { DndPlugin } from '../DndPlugin';
import { getDropPath, onDropNode } from '../transforms/onDropNode';
import { onHoverNode } from '../transforms/onHoverNode';
import { canUseDomDnd, noopConnector } from '../utils/dndEnvironment';

export type CanDropCallback = (args: {
  dragEntry: NodeEntry<Element>;
  dragItem: DragItemNode;
  dropEntry: NodeEntry<Element>;
  editor: PlateEditor;
}) => boolean;

export interface UseDropNodeOptions
  extends DropTargetHookSpec<DragItemNode, unknown, { isOver: boolean }> {
  /** The node to which the drop line is attached. */
  element: Element;

  /** The reference to the node being dragged. */
  nodeRef: React.RefObject<HTMLElement | null>;

  /**
   * Intercepts the drop handling. If `false` is returned, the default drop
   * behavior is called after. If `true` is returned, the default behavior is
   * not called.
   */
  canDropNode?: CanDropCallback;

  orientation?: 'horizontal' | 'vertical';

  onDropHandler?: (
    editor: PlateEditor,
    props: {
      id: string;
      dragItem: DragItemNode;
      monitor: DropTargetMonitor<DragItemNode, unknown>;
      nodeRef: React.RefObject<HTMLElement | null>;
    }
  ) => boolean | void;
}

/**
 * `useDrop` hook to drop a node on the editor.
 *
 * On drop:
 *
 * - Get hover direction (top, bottom or undefined), return early if undefined
 * - DragPath: find node with id = dragItem.id, return early if not found
 * - Focus editor
 * - DropPath: find node with id = id, its path should be next (bottom) or
 *   previous (top)
 * - Move node from dragPath to dropPath
 *
 * On hover:
 *
 * - Get drop line direction
 * - If differs from dropLine, setDropLine is called
 *
 * Collect:
 *
 * - IsOver: true if mouse is over the block
 */
const useDomDropNode = (
  editor: PlateEditor,
  {
    canDropNode,
    element,
    nodeRef,
    orientation,
    onDropHandler,
    ...options
  }: UseDropNodeOptions
): [{ isOver: boolean }, ConnectDropTarget] => {
  return useDrop<DragItemNode, unknown, { isOver: boolean }>({
    collect: (monitor) => ({
      isOver: monitor.isOver({
        shallow: true,
      }),
    }),
    drop: (dragItem, monitor) => {
      const id = element.id;

      if (typeof id !== 'string') return;

      // Don't call onDropNode if this is a file drop

      if (!('id' in dragItem)) {
        const result = getDropPath(editor, {
          canDropNode,
          dragItem,
          element,
          monitor,
          nodeRef,
          orientation,
        });

        const onDropFiles = editor.plugin(DndPlugin).store.get().onDropFiles;

        if (!result || !onDropFiles) return;

        return onDropFiles({
          id,
          dragItem,
          editor,
          monitor,
          nodeRef,
          target: result.to,
        });
      }

      const handled =
        !!onDropHandler &&
        onDropHandler(editor, {
          id,
          dragItem,
          monitor,
          nodeRef,
        });

      if (handled) return;

      onDropNode(editor, {
        canDropNode,
        dragItem,
        element,
        monitor,
        nodeRef,
        orientation,
      });
    },
    hover(item: DragItemNode, monitor: DropTargetMonitor) {
      onHoverNode(editor, {
        canDropNode,
        dragItem: item,
        element,
        monitor,
        nodeRef,
        orientation,
      });
    },
    ...options,
  });
};

const useInertDropNode = (): ReturnType<typeof useDomDropNode> => [
  { isOver: false },
  noopConnector,
];

export const useDropNode = canUseDomDnd() ? useDomDropNode : useInertDropNode;
