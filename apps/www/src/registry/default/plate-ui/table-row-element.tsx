'use client';

import React from 'react';

import { cn, useComposedRef, withRef } from '@udecode/cn';
import { PathApi } from '@udecode/plate';
import {
  PlateElement,
  useEditorRef,
  useElement,
  useReadOnly,
  useSelected,
} from '@udecode/plate/react';
import { useDraggable, useDropLine } from '@udecode/plate-dnd';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { GripVertical } from 'lucide-react';

import { Button } from './button';

export const TableRowElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const { element } = props;
    const readOnly = useReadOnly();
    const selected = useSelected();
    const editor = useEditorRef();
    const isSelectionAreaVisible = editor.useOption(
      BlockSelectionPlugin,
      'isSelectionAreaVisible'
    );
    const hasControls = !readOnly && !isSelectionAreaVisible;

    const { isDragging, previewRef, handleRef } = useDraggable({
      canDropNode: ({ dragEntry, dropEntry }) =>
        PathApi.equals(
          PathApi.parent(dragEntry[1]),
          PathApi.parent(dropEntry[1])
        ),
      element,
      type: element.type,
      onDropHandler: (_, { dragItem }) => {
        const dragElement = (dragItem as any).element;

        if (dragElement) {
          editor.tf.select(dragElement);
        }
      },
    });

    return (
      <PlateElement
        ref={useComposedRef(ref, previewRef)}
        as="tr"
        className={cn(className, 'group/row', isDragging && 'opacity-50')}
        data-selected={selected ? 'true' : undefined}
        {...props}
      >
        {hasControls && (
          <td className="w-2 select-none" contentEditable={false}>
            <RowDragHandle dragRef={handleRef} />
            <DropLine />
          </td>
        )}

        {children}
      </PlateElement>
    );
  }
);

function RowDragHandle({ dragRef }: { dragRef: React.Ref<any> }) {
  const editor = useEditorRef();
  const element = useElement();

  return (
    <Button
      ref={dragRef}
      variant="outline"
      className={cn(
        'absolute left-0 top-1/2 z-[51] h-6 w-4 -translate-y-1/2 p-0 focus-visible:ring-0 focus-visible:ring-offset-0',
        'cursor-grab active:cursor-grabbing',
        'opacity-0 transition-opacity duration-100 group-hover/row:opacity-100 group-has-[[data-resizing="true"]]/row:opacity-0'
      )}
      onClick={() => {
        editor.tf.select(element);
      }}
    >
      <GripVertical className="text-muted-foreground" />
    </Button>
  );
}

function DropLine() {
  const { dropLine } = useDropLine();

  if (!dropLine) return null;

  return (
    <div
      className={cn(
        'absolute inset-x-0 left-2 z-50 h-0.5 bg-brand/50',
        dropLine === 'top' ? '-top-px' : '-bottom-px'
      )}
    />
  );
}
