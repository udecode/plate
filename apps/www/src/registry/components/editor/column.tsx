'use client';

import * as React from 'react';
import {
  type PlateElementProps,
  PlateElement,
  useEditor,
  useEditorReadOnly,
  useEditorSelector,
  useElement,
  useElementSelected,
  useFocusedLast,
  usePluginStore,
} from 'platejs/react';
import { useDraggable, useDropLine } from '@platejs/dnd';
import { BaseColumnItemPlugin, BaseColumnPlugin } from '@platejs/layout';
import { ColumnItemPlugin, ColumnPlugin } from '@platejs/layout/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { useComposedRef } from '@udecode/cn';
import { type LucideProps, Trash2Icon, GripHorizontal } from 'lucide-react';
import { PathApi } from 'platejs';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function ColumnElement({
  children,
  element,
  ref,
  ...props
}: PlateElementProps<typeof ColumnItemPlugin>) {
  const editor = useEditor();
  const { width } = element;
  const readOnly = useEditorReadOnly();
  const isSelectionAreaVisible = usePluginStore(
    BlockSelectionPlugin,
    'isSelectionAreaVisible'
  );

  const { isDragging, nodeRef, previewRef, handleRef } = useDraggable({
    element,
    orientation: 'horizontal',
    type: editor.plugin(BaseColumnItemPlugin).schema.type,
    canDropNode: ({ dragEntry, dropEntry }) =>
      PathApi.equals(
        PathApi.parent(dragEntry[1]),
        PathApi.parent(dropEntry[1])
      ),
  });
  const composedRef = useComposedRef(ref, previewRef, nodeRef);

  return (
    <div className="group/column relative" style={{ width: width ?? '100%' }}>
      {!readOnly && !isSelectionAreaVisible && (
        <div
          ref={handleRef}
          className={cn(
            '-translate-x-1/2 -translate-y-1/2 absolute top-2 left-1/2 z-50',
            'pointer-events-auto flex items-center',
            'opacity-0 transition-opacity group-hover/column:opacity-100'
          )}
        >
          <ColumnDragHandle />
        </div>
      )}

      <PlateElement
        {...props}
        ref={composedRef}
        element={element}
        className="h-full px-2 pt-2 group-first/column:pl-0 group-last/column:pr-0"
      >
        <div
          className={cn(
            'relative h-full border border-transparent p-1.5',
            !readOnly && 'rounded-lg border-border border-dashed',
            isDragging && 'opacity-50'
          )}
        >
          {children}

          {!readOnly && !isSelectionAreaVisible && <DropLine />}
        </div>
      </PlateElement>
    </div>
  );
}

const ColumnDragHandle = React.memo(function ColumnDragHandle() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" className="!px-1 h-5">
            <GripHorizontal
              className="text-muted-foreground"
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
              }}
            />
          </Button>
        </TooltipTrigger>

        <TooltipContent>Drag to move column</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

function DropLine() {
  const { dropLine } = useDropLine({ orientation: 'horizontal' });

  if (!dropLine) return null;

  return (
    <div
      className={cn(
        'plite-dropLine',
        'absolute bg-brand/50',
        dropLine === 'left' &&
          'group-first/column:-left-1 inset-y-0 left-[-10.5px] w-1',
        dropLine === 'right' &&
          'group-last/column:-right-1 inset-y-0 right-[-11px] w-1'
      )}
    />
  );
}

export function ColumnGroupElement(
  props: PlateElementProps<typeof ColumnPlugin>
) {
  return (
    <PlateElement className="mb-2" {...props}>
      <ColumnFloatingToolbar>
        <div className="flex size-full rounded">{props.children}</div>
      </ColumnFloatingToolbar>
    </PlateElement>
  );
}

function ColumnFloatingToolbar({ children }: React.PropsWithChildren) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const element = useElement(ColumnPlugin);
  const selected = useElementSelected();
  const isCollapsed = useEditorSelector((editor) =>
    editor.read.selection.isCollapsed()
  );
  const isFocusedLast = useFocusedLast();

  const open = isFocusedLast && !readOnly && selected && isCollapsed;

  const onColumnChange = (widths: string[]) => {
    editor.plugin(BaseColumnPlugin).update.setColumns({
      at: element,
      widths,
    });
  };

  return (
    <Popover open={open} modal={false}>
      <PopoverAnchor>{children}</PopoverAnchor>
      <PopoverContent
        className="w-auto p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
        align="center"
        side="top"
        sideOffset={10}
      >
        <div className="box-content flex h-8 items-center">
          <Button
            variant="ghost"
            className="size-8"
            onClick={() => onColumnChange(['50%', '50%'])}
          >
            <DoubleColumnOutlined />
          </Button>
          <Button
            variant="ghost"
            className="size-8"
            onClick={() => onColumnChange(['33%', '33%', '33%'])}
          >
            <ThreeColumnOutlined />
          </Button>
          <Button
            variant="ghost"
            className="size-8"
            onClick={() => onColumnChange(['70%', '30%'])}
          >
            <RightSideDoubleColumnOutlined />
          </Button>
          <Button
            variant="ghost"
            className="size-8"
            onClick={() => onColumnChange(['30%', '70%'])}
          >
            <LeftSideDoubleColumnOutlined />
          </Button>
          <Button
            variant="ghost"
            className="size-8"
            onClick={() => onColumnChange(['25%', '50%', '25%'])}
          >
            <DoubleSideDoubleColumnOutlined />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button
            variant="ghost"
            className="size-8"
            onClick={() => editor.update.nodes.remove({ at: element })}
            onMouseDown={(event) => event.preventDefault()}
          >
            <Trash2Icon />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const DoubleColumnOutlined = (props: LucideProps) => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M8.5 3H13V13H8.5V3ZM7.5 2H8.5H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H8.5H7.5H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H7.5ZM7.5 13H3L3 3H7.5V13Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const ThreeColumnOutlined = (props: LucideProps) => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M9.25 3H6.75V13H9.25V3ZM9.25 2H6.75H5.75H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H5.75H6.75H9.25H10.25H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2H10.25H9.25ZM10.25 3V13H13V3H10.25ZM3 13H5.75V3H3L3 13Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const RightSideDoubleColumnOutlined = (props: LucideProps) => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M11.25 3H13V13H11.25V3ZM10.25 2H11.25H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H11.25H10.25H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H10.25ZM10.25 13H3L3 3H10.25V13Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const LeftSideDoubleColumnOutlined = (props: LucideProps) => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M5.75 3H13V13H5.75V3ZM4.75 2H5.75H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H5.75H4.75H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H4.75ZM4.75 13H3L3 3H4.75V13Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const DoubleSideDoubleColumnOutlined = (props: LucideProps) => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M10.25 3H5.75V13H10.25V3ZM10.25 2H5.75H4.75H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H4.75H5.75H10.25H11.25H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2H11.25H10.25ZM11.25 3V13H13V3H11.25ZM3 13H4.75V3H3L3 13Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const ColumnKit = [
  ColumnPlugin.configure({ component: ColumnGroupElement }),
  ColumnItemPlugin.configure({ component: ColumnElement }),
];
