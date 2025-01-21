'use client';

import React from 'react';

import { cn, useComposedRef, withRef } from '@udecode/cn';
import { PathApi } from '@udecode/plate';
import { PlateElement, useReadOnly, useSelected } from '@udecode/plate/react';
import { useDraggable, useDropLine } from '@udecode/plate-dnd';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { GripVertical } from 'lucide-react';

import { Button } from './button';

export const TableRowElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const { editor, element } = props;
    const readOnly = useReadOnly();
    const selected = useSelected();
    const isSelectionAreaVisible = editor.useOption(
      BlockSelectionPlugin,
      'isSelectionAreaVisible'
    );

    const { isDragging, previewRef, handleRef } = useDraggable({
      canDropNode: ({ dragEntry, dropEntry }) =>
        PathApi.equals(
          PathApi.parent(dragEntry[1]),
          PathApi.parent(dropEntry[1])
        ),
      element,
      type: element.type,
    });

    return (
      <PlateElement
        ref={useComposedRef(ref, previewRef)}
        as="tr"
        className={cn(className, 'group/row', isDragging && 'opacity-50')}
        data-selected={selected ? 'true' : undefined}
        {...props}
      >
        {children}

        {!readOnly && !isSelectionAreaVisible && (
          <>
            <RowDragHandle dragRef={handleRef} isDragging={isDragging} />
            <DropLine />
          </>
        )}
      </PlateElement>
    );
  }
);

function RowDragHandle({
  dragRef,
  isDragging,
}: {
  dragRef: React.Ref<any>;
  isDragging: boolean;
}) {
  return (
    <td
      className={cn(
        'hidden w-0 group-hover/row:table-cell',
        "group-has-[[data-resizing='true']]/row:hidden"
      )}
    >
      <Button
        ref={dragRef}
        variant="outline"
        className={cn(
          'absolute left-0 top-1/2 z-[51] h-6 w-4 -translate-x-1/2 -translate-y-1/2 p-0',
          'cursor-grab active:cursor-grabbing',
          isDragging && 'opacity-70'
        )}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
        }}
        contentEditable={false}
      >
        <GripVertical className="text-muted-foreground" />
      </Button>
    </td>
  );
}

function DropLine() {
  const { dropLine } = useDropLine();

  if (!dropLine) return null;

  return (
    <td>
      <div
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className={cn(
          'slate-dropLine',
          'absolute inset-x-0 z-50 h-0.5 bg-brand/50',
          dropLine === 'top' ? '-top-px' : '-bottom-px'
        )}
      />
    </td>
  );
}
