'use client';

import { DndPlugin, useDraggable, useDropLine } from '@platejs/dnd';
import { BaseColumnItemPlugin } from '@platejs/layout';
import { ListPlugin } from '@platejs/list/react';
import { PlaceholderPlugin } from '@platejs/media/react';
import type { NodeKey, Element as PliteElement } from '@platejs/plite';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';
import { GripVertical } from 'lucide-react';
import { ElementApi } from 'platejs';
import {
  type PlateEditor,
  type RenderNodeWrapper,
  type RenderNodeWrapperProps,
  MemoizedChildren,
  useEditor,
  useEditorPlugin,
  useElement,
  usePath,
  usePluginStore,
  useElementSelected,
} from 'platejs/react';
import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const UNDRAGGABLE_PLUGINS = [
  BaseColumnItemPlugin,
  BaseTableRowPlugin,
  BaseTableCellPlugin,
];

export const BlockDraggable: RenderNodeWrapper = (props) => {
  const { editor, element, path } = props;

  const enabled = React.useMemo(() => {
    if (editor.read.view.isReadOnly()) return false;

    const isUndraggable = UNDRAGGABLE_PLUGINS.some((plugin) => {
      const portal = editor.plugin(plugin);

      return portal.installed && portal.schema.type === element.type;
    });

    if (path.length === 1 && !isUndraggable) {
      return true;
    }
    if (path.length === 3 && !isUndraggable) {
      const column = editor.plugin(BaseColumnItemPlugin);
      const block =
        column.installed &&
        editor.read.nodes.some({
          at: path,
          type: BaseColumnItemPlugin,
        });

      if (block) {
        return true;
      }
    }
    if (path.length === 4 && !isUndraggable) {
      const table = editor.plugin(BaseTablePlugin);
      const block =
        table.installed &&
        editor.read.nodes.some({
          at: path,
          type: BaseTablePlugin,
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

function Draggable(props: RenderNodeWrapperProps) {
  const { children, editor, element, path } = props;
  const { api } = useEditorPlugin(BlockSelectionPlugin);
  const blockSelectionApi = api;

  const { isAboutToDrag, isDragging, nodeRef, previewRef, handleRef } =
    useDraggable({
      element,
      onDropHandler: (_, { dragItem }) => {
        if (blockSelectionApi && 'key' in dragItem) {
          blockSelectionApi.add(dragItem.key);
        }
        resetPreview();
      },
    });

  const isInColumn = path.length === 3;
  const isInTable = path.length === 4;
  const isContainer =
    ElementApi.isElement(element.children[0]) &&
    editor.read.schema.isBlock(element.children[0]);

  const [previewTop, setPreviewTop] = React.useState(0);

  const resetPreview = () => {
    if (previewRef.current) {
      previewRef.current.replaceChildren();
      previewRef.current?.classList.add('hidden');
    }
  };

  // clear up virtual multiple preview when drag end
  React.useEffect(() => {
    if (!isDragging) {
      resetPreview();
    }
  }, [isDragging]);

  React.useEffect(() => {
    if (isAboutToDrag) {
      previewRef.current?.classList.remove('opacity-0');
    }
  }, [isAboutToDrag]);

  const [dragButtonTop, setDragButtonTop] = React.useState(0);

  return (
    <div
      className={cn(
        'relative',
        isDragging && 'opacity-50',
        isContainer ? 'group/container' : 'group'
      )}
      onMouseEnter={() => {
        if (isDragging) return;
        setDragButtonTop(calcDragButtonTop(editor, element));
      }}
    >
      {!isInTable && (
        <Gutter>
          <div
            className={cn(
              'plite-blockToolbarWrapper',
              'flex h-[1.5em]',
              isInColumn && 'h-4'
            )}
          >
            <div
              className={cn(
                'plite-blockToolbar relative w-4.5',
                'pointer-events-auto mr-1 flex items-center',
                isInColumn && 'mr-1.5'
              )}
            >
              <Button
                ref={handleRef}
                variant="ghost"
                className="absolute -left-0 h-6 w-full p-0"
                style={{ top: `${dragButtonTop + 3}px` }}
                aria-label="Drag block"
                data-plate-prevent-deselect
              >
                <DragHandle
                  isDragging={isDragging}
                  previewRef={previewRef}
                  resetPreview={resetPreview}
                  setPreviewTop={setPreviewTop}
                />
              </Button>
            </div>
          </div>
        </Gutter>
      )}

      <div
        ref={previewRef}
        className={cn('-left-0 absolute hidden w-full')}
        style={{ top: `${-previewTop}px` }}
        contentEditable={false}
      />

      <div
        ref={nodeRef}
        className="plite-blockWrapper flow-root"
        onContextMenu={(event) =>
          blockSelectionApi.addOnContextMenu({ element, event })
        }
      >
        <MemoizedChildren>{children}</MemoizedChildren>
      </div>

      {/* Direct drops can rebind nodeRef while the line state clears. */}
      <DropLine />
    </div>
  );
}

function Gutter({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const editor = useEditor();
  const element = useElement();
  const isSelectionAreaVisible = usePluginStore(
    BlockSelectionPlugin,
    'isSelectionAreaVisible'
  );
  const selected = useElementSelected();
  const isContainer =
    ElementApi.isElement(element.children[0]) &&
    editor.read.schema.isBlock(element.children[0]);

  return (
    <div
      {...props}
      className={cn(
        'plite-gutterLeft',
        '-translate-x-full absolute top-0 z-50 flex h-full cursor-text hover:opacity-100 sm:opacity-0',
        isContainer
          ? 'group-hover/container:opacity-100'
          : 'group-hover:opacity-100',
        isSelectionAreaVisible && 'hidden',
        !selected && 'opacity-0',
        className
      )}
      contentEditable={false}
      data-plate-selectable
    >
      {children}
    </div>
  );
}

const DragHandle = React.memo(function DragHandle({
  isDragging,
  previewRef,
  resetPreview,
  setPreviewTop,
}: {
  isDragging: boolean;
  previewRef: React.RefObject<HTMLDivElement | null>;
  resetPreview: () => void;
  setPreviewTop: (top: number) => void;
}) {
  const editor = useEditor();
  const { api, read } = useEditorPlugin(BlockSelectionPlugin);
  const element = useElement();
  const path = usePath();
  const list = editor.plugin(ListPlugin);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex size-full items-center justify-center"
          onClick={(e) => {
            e.preventDefault();
            api.focus();
          }}
          onMouseDown={(e) => {
            resetPreview();

            if ((e.button !== 0 && e.button !== 2) || e.shiftKey) return;

            const blockSelection = read.getNodes({
              sort: true,
            });

            let selectionNodes =
              blockSelection.length > 0
                ? blockSelection
                : editor.read((state) =>
                    state.nodes.toArray({
                      match: (node): node is PliteElement =>
                        ElementApi.isElement(node) &&
                        state.schema.isBlock(node),
                      mode: 'highest',
                    })
                  );

            // If current block is not in selection, use it as the starting point
            const elementNodeKey = editor.key(element);

            if (
              !selectionNodes.some(
                ([node]) => editor.key(node) === elementNodeKey
              )
            ) {
              if (!path) return;
              selectionNodes = [[element, path]];
            }

            // Process selection nodes to include list children
            const blocks = (
              list.installed &&
              selectionNodes.some(([node]) => typeof node.listType === 'string')
                ? list.read.expandItemsWithChildren(selectionNodes)
                : selectionNodes
            ).map(([node]) => node);

            if (blockSelection.length === 0) {
              editor.api.dom.blur();
              editor.update.selection.collapse();
            }

            const elements = createDragPreviewElements(editor, blocks);
            previewRef.current?.append(...elements);
            previewRef.current?.classList.remove('hidden');
            previewRef.current?.classList.add('opacity-0');
            editor
              .plugin(DndPlugin)
              .store.set({ multiplePreviewRef: previewRef });

            api.set(blocks.map((block) => editor.key(block)));
          }}
          onMouseEnter={() => {
            if (isDragging) return;

            const blockSelection = read.getNodes({
              sort: true,
            });

            let selectedBlocks =
              blockSelection.length > 0
                ? blockSelection
                : editor.read((state) =>
                    state.nodes.toArray({
                      match: (node): node is PliteElement =>
                        ElementApi.isElement(node) &&
                        state.schema.isBlock(node),
                      mode: 'highest',
                    })
                  );

            // If current block is not in selection, use it as the starting point
            const elementNodeKey = editor.key(element);

            if (
              !selectedBlocks.some(
                ([node]) => editor.key(node) === elementNodeKey
              )
            ) {
              if (!path) {
                setPreviewTop(0);
                return;
              }
              selectedBlocks = [[element, path]];
            }

            // Process selection to include list children
            const processedBlocks =
              list.installed &&
              selectedBlocks.some(([node]) => typeof node.listType === 'string')
                ? list.read.expandItemsWithChildren(selectedBlocks)
                : selectedBlocks;

            const keys = processedBlocks.map(([block]) => editor.key(block));

            if (keys.length > 1 && keys.includes(elementNodeKey)) {
              const previewTop = calculatePreviewTop(editor, {
                blocks: processedBlocks.map((block) => block[0]),
                element,
              });
              setPreviewTop(previewTop);
            } else {
              setPreviewTop(0);
            }
          }}
          onMouseUp={() => {
            resetPreview();
          }}
          data-plate-prevent-deselect
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

  return (
    <div
      {...props}
      aria-hidden
      className={cn(
        'plite-dropLine',
        'pointer-events-none absolute inset-x-0 h-0.5 transition-opacity',
        'bg-brand/50',
        dropLine ? 'opacity-100' : 'opacity-0',
        dropLine === 'top' && '-top-px',
        dropLine === 'bottom' && '-bottom-px',
        className
      )}
      contentEditable={false}
    />
  );
});

const createDragPreviewElements = (
  editor: PlateEditor,
  blocks: PliteElement[]
): HTMLElement[] => {
  const elements: HTMLElement[] = [];
  const keys: NodeKey[] = [];

  /**
   * Remove data attributes so the preview is not recognized as Plite content.
   */
  const removeDataAttributes = (element: HTMLElement) => {
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-plite')) {
        element.removeAttribute(attr.name);
      }
    });

    Array.from(element.children).forEach((child) => {
      removeDataAttributes(child as HTMLElement);
    });
  };

  const resolveElement = (node: PliteElement, index: number) => {
    const domNode = editor.api.dom.resolveDOMNode(node)!;
    const newDomNode = domNode.cloneNode(true) as HTMLElement;

    // Apply visual compensation for horizontal scroll
    const applyScrollCompensation = (
      original: Element,
      cloned: HTMLElement
    ) => {
      const scrollLeft = original.scrollLeft;

      if (scrollLeft > 0) {
        // Create a wrapper to handle the scroll offset
        const scrollWrapper = document.createElement('div');
        scrollWrapper.style.overflow = 'hidden';
        scrollWrapper.style.width = `${original.clientWidth}px`;

        // Create inner container with the full content
        const innerContainer = document.createElement('div');
        innerContainer.style.transform = `translateX(-${scrollLeft}px)`;
        innerContainer.style.width = `${original.scrollWidth}px`;

        // Move all children to the inner container
        while (cloned.firstChild) {
          innerContainer.append(cloned.firstChild);
        }

        // Apply the original element's styles to maintain appearance
        const originalStyles = window.getComputedStyle(original);
        cloned.style.padding = '0';
        innerContainer.style.padding = originalStyles.padding;

        scrollWrapper.append(innerContainer);
        cloned.append(scrollWrapper);
      }
    };

    applyScrollCompensation(domNode, newDomNode);

    keys.push(editor.key(node));
    const wrapper = document.createElement('div');
    wrapper.append(newDomNode);
    wrapper.style.display = 'flow-root';

    const lastDomNode = blocks[index - 1];

    if (lastDomNode) {
      const lastDomNodeRect = editor.api.dom
        .resolveDOMNode(lastDomNode)!
        .parentElement!.getBoundingClientRect();

      const domNodeRect = domNode.parentElement!.getBoundingClientRect();

      const distance = domNodeRect.top - lastDomNodeRect.bottom;

      // Check if the two elements are adjacent (touching each other)
      if (distance > 15) {
        wrapper.style.marginTop = `${distance}px`;
      }
    }

    removeDataAttributes(newDomNode);
    elements.push(wrapper);
  };

  blocks.forEach((node, index) => {
    resolveElement(node, index);
  });

  editor.plugin(DndPlugin).store.set({ draggingKey: keys });

  return elements;
};

const calculatePreviewTop = (
  editor: PlateEditor,
  {
    blocks,
    element,
  }: {
    blocks: readonly PliteElement[];
    element: PliteElement;
  }
): number => {
  const child = editor.api.dom.resolveDOMNode(element)!;
  const editable = editor.api.dom.resolveDOMNode(editor)!;
  const firstSelectedChild = blocks[0];

  const firstDomNode = editor.api.dom.resolveDOMNode(firstSelectedChild)!;
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
  const firstMarginTopString = window.getComputedStyle(firstDomNode).marginTop;
  const marginTop = Number(firstMarginTopString.replace('px', ''));

  // Calculate distance from current node to editor top
  const currentToEditorDistance =
    child.getBoundingClientRect().top -
    editable.getBoundingClientRect().top -
    editorPaddingTop;

  const currentMarginTopString = window.getComputedStyle(child).marginTop;
  const currentMarginTop = Number(currentMarginTopString.replace('px', ''));

  const previewElementsTopDistance =
    currentToEditorDistance -
    firstNodeToEditorDistance +
    marginTop -
    currentMarginTop;

  return previewElementsTopDistance;
};

const calcDragButtonTop = (
  editor: PlateEditor,
  element: PliteElement
): number => {
  const child = editor.api.dom.resolveDOMNode(element)!;

  const currentMarginTopString = window.getComputedStyle(child).marginTop;
  const currentMarginTop = Number(currentMarginTopString.replace('px', ''));

  return currentMarginTop;
};

export const DndKit = [
  DndPlugin.configure({
    initialState: {
      enableScroller: true,
      onDropFiles: ({ dragItem, editor, target }) => {
        editor
          .plugin(PlaceholderPlugin)
          .update.insertMedia(dragItem.files, { at: target });
      },
    },
    render: {
      aboveNodes: BlockDraggable,
      abovePlite: ({ children }) => (
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      ),
    },
  }),
];
