import { useState } from 'react';
import { DropTargetMonitor } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { TEditor, useEditorRef } from '@udecode/plate-common';
import { DragItemNode, DropLineDirection } from '../types';
import { useDragNode, UseDragNodeOptions } from './useDragNode';
import { useDropNode, UseDropNodeOptions } from './useDropNode';

export interface UseDndNodeOptions
  extends Pick<UseDropNodeOptions, 'id' | 'nodeRef'>,
    Pick<UseDragNodeOptions, 'type'> {
  drag?: UseDragNodeOptions;
  drop?: UseDropNodeOptions;
  onDropHandler?: (
    editor: TEditor,
    props: {
      monitor: DropTargetMonitor<DragItemNode, unknown>;
      dragItem: DragItemNode;
      nodeRef: any;
      id: string;
    }
  ) => boolean;
  preview?: {
    /**
     * Whether to disable the preview.
     */
    disable?: boolean;

    /**
     * The reference to the preview element.
     */
    ref?: any;
  };
}

/**
 * {@link useDragNode} and {@link useDropNode} hooks to drag and drop a node from the editor.
 * A default preview is used to show the node being dragged, which can be customized or removed.
 * Returns the drag ref and drop line direction.
 */
export const useDndNode = ({
  id,
  type,
  nodeRef,
  preview: previewOptions = {},
  drag: dragOptions,
  drop: dropOptions,
  onDropHandler,
}: UseDndNodeOptions) => {
  const editor = useEditorRef();

  const [dropLine, setDropLine] = useState<DropLineDirection>('');

  const [{ isDragging }, dragRef, preview] = useDragNode(editor, {
    id,
    type,
    ...dragOptions,
  });
  const [{ isOver }, drop] = useDropNode(editor, {
    accept: type,
    id,
    nodeRef,
    dropLine,
    onChangeDropLine: setDropLine,
    onDropHandler,
    ...dropOptions,
  });

  if (previewOptions.disable) {
    drop(nodeRef);
    preview(getEmptyImage(), { captureDraggingState: true });
  } else if (previewOptions.ref) {
    drop(nodeRef);
    preview(previewOptions.ref);
  } else {
    preview(drop(nodeRef));
  }

  if (!isOver && dropLine) {
    setDropLine('');
  }

  return {
    isDragging,
    isOver,
    dropLine,
    dragRef,
  };
};
