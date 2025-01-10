'use client';

import React, { useMemo } from 'react';

import { cn, withRef } from '@udecode/cn';
import { isType } from '@udecode/plate';
import {
  type NodeWrapperComponent,
  type PlateRenderElementProps,
  MemoizedChildren,
  ParagraphPlugin,
  useEditorPlugin,
  useEditorRef,
  useElement,
  usePath,
} from '@udecode/plate/react';
import { useReadOnly, useSelected } from '@udecode/plate/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { useDraggable, useDropLine } from '@udecode/plate-dnd';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { ColumnItemPlugin, ColumnPlugin } from '@udecode/plate-layout/react';
import {
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
} from '@udecode/plate-media/react';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import {
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { GripVertical } from 'lucide-react';

import { STRUCTURAL_TYPES } from '@/components/editor/transforms';

import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

const UNDRAGGABLE_KEYS = [
  ColumnItemPlugin.key,
  TableRowPlugin.key,
  TableCellPlugin.key,
];

export const DraggableAboveNodes: NodeWrapperComponent = (props) => {
  const { editor, element, path } = props;
  const readOnly = useReadOnly();

  const enabled = useMemo(() => {
    if (readOnly) return false;
    if (path.length === 1 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      return true;
    }
    if (path.length === 3 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: {
          type: editor.getType(ColumnPlugin),
        },
      });

      if (block) {
        return true;
      }
    }
    if (path.length === 4 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: {
          type: editor.getType(TablePlugin),
        },
      });

      if (block) {
        return true;
      }
    }

    return false;
  }, [editor, element, path, readOnly]);

  if (!enabled) return;

  return (props) => <Draggable {...props} />;
};

export const Draggable = withRef<'div', PlateRenderElementProps>(
  ({ className, ...props }, ref) => {
    const { children, editor, element, path } = props;
    const { isDragging, previewRef, handleRef } = useDraggable({ element });

    const isInColumn = path.length === 3;
    const isInTable = path.length === 4;

    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          isDragging && 'opacity-50',
          STRUCTURAL_TYPES.includes(element.type) ? 'group/structural' : 'group'
        )}
      >
        <Gutter>
          <div
            className={cn(
              'slate-blockToolbarWrapper',
              'flex h-[1.5em]',
              isType(editor, element, [
                HEADING_KEYS.h1,
                HEADING_KEYS.h2,
                HEADING_KEYS.h3,
                HEADING_KEYS.h4,
                HEADING_KEYS.h5,
              ]) && 'h-[1.3em]',
              isInColumn && 'h-4',
              isInTable && 'mt-1 size-4'
            )}
          >
            <div
              className={cn(
                'slate-blockToolbar',
                'pointer-events-auto mr-1 flex items-center',
                isInColumn && 'mr-1.5'
              )}
            >
              <div ref={handleRef} className="size-4">
                <DragHandle />
              </div>
            </div>
          </div>
        </Gutter>

        <div ref={previewRef} className="slate-blockWrapper">
          <MemoizedChildren>{children}</MemoizedChildren>

          <DropLine />
        </div>
      </div>
    );
  }
);

const Gutter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { editor, useOption } = useEditorPlugin(BlockSelectionPlugin);
  const element = useElement();
  const path = usePath();
  const isSelectionAreaVisible = useOption('isSelectionAreaVisible');
  const selected = useSelected();

  const isNodeType = (keys: string[] | string) => isType(editor, element, keys);

  const isInColumn = path.length === 3;
  const isInTable = path.length === 4;

  return (
    <div
      ref={ref}
      className={cn(
        'slate-gutterLeft',
        'absolute -top-px z-50 flex h-full -translate-x-full cursor-text hover:opacity-100 sm:opacity-0',
        STRUCTURAL_TYPES.includes(element.type)
          ? 'main-hover:group-hover/structural:opacity-100'
          : 'main-hover:group-hover:opacity-100',
        isSelectionAreaVisible && 'hidden',
        !selected && 'opacity-0',
        isNodeType(HEADING_KEYS.h1) && 'pb-1 text-[1.875em]',
        isNodeType(HEADING_KEYS.h2) && 'pb-1 text-[1.5em]',
        isNodeType(HEADING_KEYS.h3) && 'pb-1 pt-[2px] text-[1.25em]',
        isNodeType([HEADING_KEYS.h4, HEADING_KEYS.h5]) &&
          'pb-0 pt-[3px] text-[1.1em]',
        isNodeType(HEADING_KEYS.h6) && 'pb-0',
        isNodeType(ParagraphPlugin.key) && 'pb-0 pt-[3px]',
        isNodeType(['ul', 'ol']) && 'pb-0',
        isNodeType(BlockquotePlugin.key) && 'pb-0',
        isNodeType(CodeBlockPlugin.key) && 'pb-0 pt-6',
        isNodeType([
          ImagePlugin.key,
          MediaEmbedPlugin.key,
          ExcalidrawPlugin.key,
          TogglePlugin.key,
          ColumnPlugin.key,
        ]) && 'py-0',
        isNodeType([PlaceholderPlugin.key, TablePlugin.key]) && 'pb-0 pt-3',
        isInColumn && 'mt-2 h-4 pt-0',
        isInTable && 'size-4',
        className
      )}
      contentEditable={false}
      {...props}
    >
      {children}
    </div>
  );
});

const DragHandle = React.memo(() => {
  const editor = useEditorRef();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger type="button">
          <GripVertical
            className="size-4 text-muted-foreground"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
            }}
            onMouseDown={() => {
              editor
                .getApi(BlockSelectionPlugin)
                .blockSelection?.resetSelectedIds();
            }}
          />
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>Drag to move</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
});

const DropLine = React.memo(
  React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
      const { dropLine } = useDropLine();

      if (!dropLine) return null;

      return (
        <div
          ref={ref}
          {...props}
          className={cn(
            'slate-dropLine',
            'absolute inset-x-0 h-0.5 opacity-100 transition-opacity',
            'bg-brand/50',
            dropLine === 'top' && '-top-px',
            dropLine === 'bottom' && '-bottom-px',
            className
          )}
        />
      );
    }
  )
);
