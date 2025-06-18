'use client';

import * as React from 'react';

import { DndPlugin, useDraggable, useDropLine } from '@platejs/dnd';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { GripVertical } from 'lucide-react';
import {
  type Path,
  type TElement,
  type TTableElement,
  getContainerTypes,
  isType,
  KEYS,
  NodeApi,
  PathApi,
} from 'platejs';
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
      const ids = (dragItem as { ids?: string[] }).ids;
      const id = (dragItem as { id: string }).id;

      if (blockSelectionApi) {
        if (ids && ids.length > 1) {
          // Re-select all dragged nodes
          blockSelectionApi.clear();
          ids.forEach((nodeId) => {
            const nodeEntry = editor.api.node({ id: nodeId, at: [] });

            if (nodeEntry && nodeEntry[0].type === KEYS.table) {
              const tableNode = nodeEntry[0] as TTableElement;
              const trs = tableNode.children.filter(
                (child) => child.type === KEYS.tr
              );

              trs.forEach((tr) => {
                blockSelectionApi.add(tr.id as string);
              });

              return;
            }

            blockSelectionApi.add(nodeId);
          });
        } else if (id) {
          blockSelectionApi.set(id);
        }
      }
      multiplePreviewRef.current?.replaceChildren();
    },
  });

  const isInColumn = path.length === 3;
  const isInTable = path.length === 4;

  const [distance, setDistance] = React.useState(0);
  const [isMultiple, setIsMultiple] = React.useState(false);

  const multiplePreviewRef = React.useRef<HTMLDivElement>(null);

  // clear up virtual multiple preview when drag end
  React.useEffect(() => {
    if (!isDragging && isMultiple) {
      multiplePreviewRef.current?.replaceChildren();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const calculateTopDistance = () => {
    if (isDragging) return;

    const ids = editor.getOption(BlockSelectionPlugin, 'selectedIds');

    if (ids && ids.size > 0 && ids.has(element.id as string)) {
      const child = editor.api.toDOMNode(element)!;
      const editable = editor.api.toDOMNode(editor)!;
      const firstSelectedChild = editor.api.node({
        at: [],
        match: (n) => blockSelectionApi.has(n.id as string),
      })!;

      const firstDomNode = editor.api.toDOMNode(firstSelectedChild[0])!;

      // Get editor's top padding
      const editorPaddingTop = Number(
        window.getComputedStyle(editable).paddingTop.replace('px', '')
      );

      // Calculate distance from first selected node to editor top
      const firstNodeToEditorDistance =
        firstDomNode.getBoundingClientRect().top -
        editable.getBoundingClientRect().top -
        editorPaddingTop;

      // Get margin top of first selected node
      const firstMarginTopString =
        window.getComputedStyle(firstDomNode).marginTop;
      const marginTop = Number(firstMarginTopString.replace('px', ''));

      // Calculate distance from current node to editor top
      const currentToEditorDistance =
        child.getBoundingClientRect().top -
        editable.getBoundingClientRect().top -
        editorPaddingTop;

      const previewElementsTopDistance =
        currentToEditorDistance - firstNodeToEditorDistance + marginTop;

      setDistance(previewElementsTopDistance);
      setIsMultiple(true);
    } else {
      setIsMultiple(false);
    }
  };

  const createDragPreviewElements = () => {
    if (!isMultiple) return editor.setOption(DndPlugin, 'draggingIds', null);

    const sortedNodes = blockSelectionApi.getNodes({ sort: true });

    const elements: HTMLElement[] = [];
    const ids: string[] = [];

    const removeDataAttributes = (element: HTMLElement) => {
      // Remove data attributes from current element
      Array.from(element.attributes).forEach((attr) => {
        if (
          attr.name.startsWith('data-slate') ||
          attr.name.startsWith('data-block-id')
        ) {
          element.removeAttribute(attr.name);
        }
      });
      // Recursively process child elements
      Array.from(element.children).forEach((child) => {
        removeDataAttributes(child as HTMLElement);
      });
    };

    const resolveElement = (node: TElement) => {
      const domNode = editor.api
        .toDOMNode(node)!
        .cloneNode(true) as HTMLElement;
      ids.push(node.id as string);
      removeDataAttributes(domNode);
      elements.push(domNode);
    };

    sortedNodes.forEach(([node, path]) => {
      if (node.type === KEYS.tr) {
        const isLastChild = NodeApi.isLastChild(editor, path);

        if (isLastChild) {
          const tablePath = PathApi.parent(path);
          const [tableNode] = editor.api.node<TTableElement>(tablePath)!;

          resolveElement(tableNode);
        }

        return;
      }

      resolveElement(node);
    });

    editor.setOption(DndPlugin, 'draggingIds', ids);

    multiplePreviewRef.current?.append(...elements);
    multiplePreviewRef.current?.classList.remove('hidden');
  };

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
                onMouseDown={createDragPreviewElements}
                onMouseEnter={calculateTopDistance}
                data-plate-prevent-deselect
              >
                <DragHandle />
              </Button>
            </div>
          </div>
        </Gutter>
      )}

      <div ref={previewRef} className="slate-blockWrapper">
        <div
          ref={multiplePreviewRef}
          className={cn('absolute -left-0 hidden w-full')}
          style={{ top: `${-distance}px` }}
          contentEditable={false}
        />

        <MemoizedChildren>{children}</MemoizedChildren>
        <DropLine element={element} path={path} />
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
        isNodeType(KEYS.h1) && 'pb-1 text-[1.875em] pt-[1.9em]',
        isNodeType(KEYS.h2) && 'pb-1 text-[1.5em] pt-[1.4em]',
        isNodeType(KEYS.h3) && 'pt-[2px] pb-1 text-[1.25em] pt-[1.1em]',
        isNodeType([KEYS.h4, KEYS.h5]) && 'pt-1 pb-0 text-[1.1em] pt-[1em]',
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
}: React.ComponentProps<'div'> & { element: TElement; path: Path }) {
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
