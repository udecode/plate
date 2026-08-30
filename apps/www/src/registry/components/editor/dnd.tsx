'use client';

import { GripVertical } from 'lucide-react';
import {
  ElementApi,
  PathApi,
  type Element,
  type NodeKey,
  type Path,
} from 'platejs';
import {
  DndPlugin,
  type DropLineDirection,
  useDraggable,
  useDropLine,
} from 'platejs/dnd/react';
import { BaseColumnItemPlugin } from 'platejs/layout';
import { PlaceholderPlugin } from 'platejs/media/react';
import {
  ListPlugin,
  type Editor,
  type RenderNodeWrapperDescriptor,
  type RenderNodeWrapperProps,
  useEditor,
  useEditorSelector,
  useElement,
  usePluginStore,
} from 'platejs/react';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from 'platejs/table';
import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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

const DndInteractionContext = React.createContext({
  activate: () => {},
  active: false,
});

const isBlockDraggable: NonNullable<
  RenderNodeWrapperDescriptor<typeof DndPlugin>['match']
> = ({ editor, element, renderPath }) => {
  if (editor.read.view.isReadOnly()) return false;

  const isUndraggable = UNDRAGGABLE_PLUGINS.some((plugin) => {
    const portal = editor.plugin(plugin);

    return portal.installed && portal.schema.type === element.type;
  });

  const container = !isUndraggable
    ? getDraggableContainer(editor, renderPath)
    : null;

  return !!container;
};

const BlockDraggableComponent = (props: RenderNodeWrapperProps) => {
  const container = getDraggableContainer(props.editor, props.renderPath);
  const interaction = React.useContext(DndInteractionContext);

  if (!container) return <>{props.children}</>;

  return (
    <Draggable
      {...props}
      activate={interaction.activate}
      active={interaction.active}
      container={container}
    />
  );
};

export const BlockDraggable: RenderNodeWrapperDescriptor<typeof DndPlugin> = {
  component: BlockDraggableComponent,
  match: isBlockDraggable,
};

type DraggableContainer = 'column' | 'root' | 'table';
type DraggableProps = RenderNodeWrapperProps & {
  activate: () => void;
  active: boolean;
  container: DraggableContainer;
};

function Draggable({ activate, active, container, ...props }: DraggableProps) {
  const { children, editor, element } = props;
  const [dragButtonTop, setDragButtonTop] = React.useState(0);
  const [dropLine, setDropLine] = React.useState<DropLineDirection>('');
  const [isPointerActive, setIsPointerActive] = React.useState(false);
  const [isThisDragging, setIsThisDragging] = React.useState(false);
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const dragButtonRef = React.useRef<HTMLButtonElement>(null);
  const [previewTop, setPreviewTop] = React.useState(0);
  const resetPreview = React.useCallback(() => {
    if (previewRef.current) {
      previewRef.current.replaceChildren();
      previewRef.current.classList.add('hidden');
    }
  }, []);
  const isInColumn = container === 'column';
  const isInTable = container === 'table';
  const hasTableCellSelection = useEditorSelector((innerEditor) => {
    const table = innerEditor.plugin(BaseTablePlugin);

    return (
      table.installed && (table.read.selection()?.cellKeys.length ?? 0) > 1
    );
  });
  const isContainer =
    ElementApi.isElement(element.children[0]) &&
    editor.read.schema.isBlock(element.children[0]);
  const isActive = active || isPointerActive;
  return (
    <div
      className={cn(
        'relative',
        isThisDragging && 'opacity-50',
        isContainer ? 'group/container' : 'group'
      )}
      onMouseEnter={() => {
        if (isThisDragging) return;
        setDragButtonTop(calcDragButtonTop(editor, element));
      }}
    >
      {isActive && (
        <DraggableRuntime
          dragButtonRef={dragButtonRef}
          element={element}
          nodeRef={nodeRef}
          onDraggingChange={setIsThisDragging}
          onDropLineChange={setDropLine}
          previewRef={previewRef}
          resetPreview={resetPreview}
        />
      )}

      {!isInTable && !hasTableCellSelection && (
        <Gutter active={isPointerActive} isContainer={isContainer}>
          <button
            ref={dragButtonRef}
            aria-label="Drag block"
            className={cn(
              'pointer-events-auto absolute -left-0 h-6 w-4.5 cursor-grab p-0 text-muted-foreground',
              isInColumn && 'w-4'
            )}
            style={{ top: `${dragButtonTop + 3}px` }}
            type="button"
            data-plate-prevent-deselect
            data-plate-selectable
            onFocus={() => {
              activate();
              setIsPointerActive(true);
            }}
            onMouseEnter={() => {
              activate();
              setIsPointerActive(true);
            }}
            onPointerOver={() => {
              activate();
              setIsPointerActive(true);
            }}
          >
            {isPointerActive ? (
              <DragHandle
                isDragging={isThisDragging}
                previewRef={previewRef}
                resetPreview={resetPreview}
                setPreviewTop={setPreviewTop}
              />
            ) : (
              '⠿'
            )}
          </button>
        </Gutter>
      )}

      <div
        ref={previewRef}
        className={cn('-left-0 absolute hidden w-full')}
        style={{ top: `${-previewTop}px` }}
        contentEditable={false}
      />

      <DropLine dropLine={dropLine} />

      <div ref={nodeRef} className="plite-blockWrapper flow-root">
        {children}
      </div>
    </div>
  );
}

const getDraggableContainer = (
  editor: Editor,
  path: Path
): DraggableContainer | null => {
  if (path.length === 1) return 'root';

  if (path.length === 3) {
    const column = editor.plugin(BaseColumnItemPlugin);

    if (
      column.installed &&
      editor.read.nodes.some({ at: path, type: BaseColumnItemPlugin })
    ) {
      return 'column';
    }
  }

  if (path.length === 4) {
    const table = editor.plugin(BaseTablePlugin);

    if (
      table.installed &&
      editor.read.nodes.some({ at: path, type: BaseTablePlugin })
    ) {
      return 'table';
    }
  }

  return null;
};

function DraggableRuntime({
  dragButtonRef,
  element,
  nodeRef,
  onDraggingChange,
  onDropLineChange,
  previewRef,
  resetPreview,
}: {
  dragButtonRef: React.RefObject<HTMLButtonElement | null>;
  element: Element;
  nodeRef: React.RefObject<HTMLDivElement | null>;
  onDraggingChange: (dragging: boolean) => void;
  onDropLineChange: (dropLine: DropLineDirection) => void;
  previewRef: React.RefObject<HTMLDivElement | null>;
  resetPreview: () => void;
}) {
  const { handleRef, isAboutToDrag, isDragging } = useDraggable({
    element,
    multiplePreviewRef: previewRef,
    nodeRef,
    onDropHandler: () => {
      resetPreview();
    },
  });
  const { dropLine } = useDropLine();

  React.useEffect(() => {
    handleRef(dragButtonRef.current);

    return () => {
      handleRef(null);
    };
  }, [dragButtonRef, handleRef]);

  React.useEffect(() => {
    onDraggingChange(isDragging);

    return () => {
      onDraggingChange(false);
    };
  }, [isDragging, onDraggingChange]);

  React.useEffect(() => {
    onDropLineChange(dropLine ?? '');

    return () => {
      onDropLineChange('');
    };
  }, [dropLine, onDropLineChange]);

  React.useEffect(() => {
    if (!isDragging) resetPreview();
  }, [isDragging, resetPreview]);

  React.useEffect(() => {
    if (isAboutToDrag) {
      previewRef.current?.classList.remove('opacity-0');
    }
  }, [isAboutToDrag, previewRef]);

  return null;
}

function Gutter({
  active,
  children,
  className,
  isContainer,
  ...props
}: React.ComponentProps<'div'> & {
  active: boolean;
  isContainer: boolean;
}) {
  return (
    <div
      {...props}
      className={cn(
        'plite-gutterLeft',
        '-translate-x-full absolute top-0 z-50 flex h-full w-[22px] cursor-text select-none hover:opacity-100 sm:opacity-0',
        isContainer
          ? 'group-hover/container:opacity-100'
          : 'group-hover:opacity-100',
        'focus-within:opacity-100',
        active && 'opacity-100',
        className
      )}
      contentEditable={false}
      data-plate-selectable
    >
      {children}
    </div>
  );
}

function DragHandle({
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
  const element = useElement();
  const list = editor.plugin(ListPlugin);
  const selectElement = () => {
    const path = editor.read.nodes.path(element);

    if (!path) return;

    if (
      !editor.read.selection
        .nodes()
        .some(([, selectedPath]) => PathApi.equals(selectedPath, path))
    ) {
      editor.update.selection.setNodes([element]);
    }
    editor.api.dom.focus();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex size-full items-center justify-center"
          onClick={(e) => {
            e.preventDefault();
            selectElement();
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;

            event.preventDefault();
            selectElement();
          }}
          onMouseDown={(e) => {
            resetPreview();

            if ((e.button !== 0 && e.button !== 2) || e.shiftKey) return;

            const selectedBlocks = editor.read.nodes.blocks();
            let selectionNodes = selectedBlocks;

            // If current block is not in selection, use it as the starting point
            const elementNodeKey = editor.key(element);

            if (
              !selectionNodes.some(
                ([node]) => editor.key(node) === elementNodeKey
              )
            ) {
              const path = editor.read.nodes.path(element);

              if (!path) return;
              selectionNodes = [[element, path]];
            }

            // Process selection nodes to include list children
            const processedEntries =
              list.installed &&
              selectionNodes.some(([node]) => typeof node.listType === 'string')
                ? list.read.expandItemsWithChildren(selectionNodes)
                : selectionNodes;
            const blocks = processedEntries.map(([node]) => node);

            const elements = createDragPreviewElements(editor, blocks);
            previewRef.current?.append(...elements);
            previewRef.current?.classList.remove('hidden');
            previewRef.current?.classList.add('opacity-0');
            editor
              .plugin(DndPlugin)
              .store.set({ multiplePreviewRef: previewRef });
            editor.update.selection.setNodes(
              processedEntries.map(([node]) => node)
            );
          }}
          onMouseEnter={() => {
            if (isDragging) return;

            let selectedBlocks = editor.read.nodes.blocks();

            // If current block is not in selection, use it as the starting point
            const elementNodeKey = editor.key(element);

            if (
              !selectedBlocks.some(
                ([node]) => editor.key(node) === elementNodeKey
              )
            ) {
              const path = editor.read.nodes.path(element);

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
          tabIndex={0}
        >
          <GripVertical className="text-muted-foreground" />
        </div>
      </TooltipTrigger>
      <TooltipContent>Drag to move</TooltipContent>
    </Tooltip>
  );
}

function DropLine({
  className,
  dropLine,
  ...props
}: React.ComponentProps<'div'> & { dropLine: DropLineDirection }) {
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
}

const createDragPreviewElements = (
  editor: Editor,
  blocks: Element[]
): HTMLElement[] => {
  const elements: HTMLElement[] = [];
  const keys: NodeKey[] = [];

  /**
   * Remove data attributes so the preview is not recognized as Plate content.
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

  const resolveElement = (node: Element, index: number) => {
    const domNode = editor.api.dom.resolveDOMNode(node);

    if (domNode == null) {
      throw new Error(
        'Cannot create a drag preview for a node without a DOM element'
      );
    }

    const newDomNode = domNode.cloneNode(true) as HTMLElement;

    // Apply visual compensation for horizontal scroll
    const applyScrollCompensation = (
      original: HTMLElement,
      cloned: HTMLElement
    ) => {
      const { scrollLeft } = original;

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
      const previousDomNode = editor.api.dom.resolveDOMNode(lastDomNode);

      if (previousDomNode == null) {
        throw new Error('Cannot measure a dragged node without a DOM element');
      }
      if (previousDomNode.parentElement == null) {
        throw new Error(
          'Cannot measure a dragged node without a parent element'
        );
      }
      if (domNode.parentElement == null) {
        throw new Error(
          'Cannot measure a drag preview without a parent element'
        );
      }

      const lastDomNodeRect =
        previousDomNode.parentElement.getBoundingClientRect();
      const domNodeRect = domNode.parentElement.getBoundingClientRect();

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
  editor: Editor,
  {
    blocks,
    element,
  }: {
    blocks: readonly Element[];
    element: Element;
  }
): number => {
  const child = editor.api.dom.resolveDOMNode(element);

  if (child == null) {
    throw new Error(
      'Cannot position a drag preview without the dragged DOM element'
    );
  }

  const editable = editor.api.dom.resolveDOMNode(editor);

  if (editable == null) {
    throw new Error(
      'Cannot position a drag preview without the editor DOM element'
    );
  }

  const firstSelectedChild = blocks[0];

  if (firstSelectedChild == null) {
    throw new Error('Cannot position a drag preview without a selected block');
  }

  const firstDomNode = editor.api.dom.resolveDOMNode(firstSelectedChild);

  if (firstDomNode == null) {
    throw new Error(
      'Cannot position a drag preview without the first selected DOM element'
    );
  }
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

const calcDragButtonTop = (editor: Editor, element: Element): number => {
  const child = editor.api.dom.resolveDOMNode(element);

  if (child == null) {
    throw new Error(
      'Cannot position a drag handle without the block DOM element'
    );
  }

  const currentMarginTopString = window.getComputedStyle(child).marginTop;
  const currentMarginTop = Number(currentMarginTopString.replace('px', ''));

  return currentMarginTop;
};

const DndRoot = ({ children }: { children: React.ReactNode }) => {
  const isDragging = usePluginStore(DndPlugin, 'isDragging');
  const [active, setActive] = React.useState(false);
  const activate = React.useCallback(() => {
    setActive(true);
  }, []);

  React.useEffect(() => {
    const deactivate = () => {
      setActive(false);
    };

    document.addEventListener('dragend', deactivate);
    document.addEventListener('drop', deactivate);
    document.addEventListener('mouseup', deactivate);

    return () => {
      document.removeEventListener('dragend', deactivate);
      document.removeEventListener('drop', deactivate);
      document.removeEventListener('mouseup', deactivate);
    };
  }, []);
  const interaction = React.useMemo(
    () => ({
      activate,
      active: active || isDragging,
    }),
    [activate, active, isDragging]
  );

  return (
    <DndInteractionContext value={interaction}>
      <DndProvider backend={HTML5Backend}>{children}</DndProvider>
    </DndInteractionContext>
  );
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
      abovePlite: DndRoot,
    },
  }),
];
