'use client';

import * as React from 'react';

import { useDraggable, useDropLine } from '@platejs/dnd';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { GripVertical } from 'lucide-react';
import { getContainerTypes, isType, KEYS } from 'platejs';
import {
  type PlateElementProps,
  type RenderNodeWrapper,
  MemoizedChildren,
  useEditorRef,
  useElement,
  usePath,
  usePluginOption,
} from 'platejs/react';
import { useSelected } from 'platejs/react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const UNDRAGGABLE_KEYS = [KEYS.column, KEYS.tr, KEYS.td];

export const BlockDraggable: RenderNodeWrapper = (props) => {
  const { editor, element, path } = props;

  const enabled = React.useMemo(() => {
    if (path.length === 1 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      return true;
    }
    if (path.length === 3 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: {
          type: editor.getType(KEYS.column),
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
          type: editor.getType(KEYS.table),
        },
      });

      if (block) {
        return true;
      }
    }

    return false;
  }, [editor, element, path]);

  if (!enabled) return;

  return (props) => <Draggable {...props} />;
};

export function Draggable(props: PlateElementProps) {
  const { children, editor, element, path } = props;
  const blockSelectionApi = editor.getApi(BlockSelectionPlugin).blockSelection;
  const { isDragging, previewRef, handleRef } = useDraggable({
    element,
    onDropHandler: (_, { dragItem }) => {
      const id = (dragItem as { id: string }).id;

      if (blockSelectionApi && id) {
        blockSelectionApi.set(id);
      }
    },
  });

  const isInColumn = path.length === 3;
  const isInTable = path.length === 4;

  return (
    <div
      className={cn(
        'relative',
        isDragging && 'opacity-50',
        getContainerTypes(editor).includes(element.type)
          ? 'group/container'
          : 'group'
      )}
    >
      {!isInTable && (
        <Gutter>
          <div
            className={cn(
              'slate-blockToolbarWrapper',
              'flex h-[1.5em]',
              isType(editor, element, [
                KEYS.h1,
                KEYS.h2,
                KEYS.h3,
                KEYS.h4,
                KEYS.h5,
              ]) && 'h-[1.3em]',
              isInColumn && 'h-4'
            )}
          >
            <div
              className={cn(
                'slate-blockToolbar',
                'pointer-events-auto mr-1 flex items-center',
                isInColumn && 'mr-1.5'
              )}
            >
              <Button
                ref={handleRef}
                variant="ghost"
                className="h-6 w-4.5 p-0"
                data-plate-prevent-deselect
              >
                <DragHandle />
              </Button>
            </div>
          </div>
        </Gutter>
      )}

      <div ref={previewRef} className="slate-blockWrapper">
        <MemoizedChildren>{children}</MemoizedChildren>
        <DropLine />
      </div>
    </div>
  );
}

function Gutter({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const editor = useEditorRef();
  const element = useElement();
  const path = usePath();
  const isSelectionAreaVisible = usePluginOption(
    BlockSelectionPlugin,
    'isSelectionAreaVisible'
  );
  const selected = useSelected();

  const isNodeType = (keys: string[] | string) => isType(editor, element, keys);

  const isInColumn = path.length === 3;

  return (
    <div
      {...props}
      className={cn(
        'slate-gutterLeft',
        'absolute top-0 z-50 flex h-full -translate-x-full cursor-text hover:opacity-100 sm:opacity-0',
        getContainerTypes(editor).includes(element.type)
          ? 'group-hover/container:opacity-100'
          : 'group-hover:opacity-100',
        isSelectionAreaVisible && 'hidden',
        !selected && 'opacity-0',
        isNodeType(KEYS.h1) && 'pb-1 text-[1.875em]',
        isNodeType(KEYS.h2) && 'pb-1 text-[1.5em]',
        isNodeType(KEYS.h3) && 'pt-[2px] pb-1 text-[1.25em]',
        isNodeType([KEYS.h4, KEYS.h5]) && 'pt-1 pb-0 text-[1.1em]',
        isNodeType(KEYS.h6) && 'pb-0',
        isNodeType(KEYS.p) && 'pt-1 pb-0',
        isNodeType(KEYS.blockquote) && 'pb-0',
        isNodeType(KEYS.codeBlock) && 'pt-6 pb-0',
        isNodeType([
          KEYS.img,
          KEYS.mediaEmbed,
          KEYS.excalidraw,
          KEYS.toggle,
          KEYS.column,
        ]) && 'py-0',
        isNodeType([KEYS.placeholder, KEYS.table]) && 'pt-3 pb-0',
        isInColumn && 'mt-2 h-4 pt-0',
        className
      )}
      contentEditable={false}
    >
      {children}
    </div>
  );
}

const DragHandle = React.memo(function DragHandle() {
  const editor = useEditorRef();
  const element = useElement();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex size-full items-center justify-center"
          onClick={() => {
            editor
              .getApi(BlockSelectionPlugin)
              .blockSelection.set(element.id as string);
          }}
          role="button"
        >
          <GripVertical className="text-muted-foreground" />
        </div>
      </TooltipTrigger>
      <TooltipContent>Drag to move</TooltipContent>
    </Tooltip>
  );
});

const DropLine = React.memo(function DropLine({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { dropLine } = useDropLine();

  if (!dropLine) return null;

  return (
    <div
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
});
