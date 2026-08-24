'use client';

import {
  DndPlugin,
  type DropLineDirection,
  useDraggable,
  useDropLine,
} from '@platejs/dnd';
import { BaseColumnItemPlugin } from '@platejs/layout';
import { ListPlugin } from '@platejs/list/react';
import { PlaceholderPlugin } from '@platejs/media/react';
import type { NodeKey, Path, Element as PliteElement } from '@platejs/plite';
import { failInvariant } from '@platejs/plite/internal';
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
  type RenderNodeWrapperDescriptor,
  type RenderNodeWrapperProps,
  MemoizedChildren,
  useEditor,
  useEditorPlugin,
  useElement,
  usePluginStore,
} from 'platejs/react';
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
  isSelectionAreaVisible: false,
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
      hideGutter={interaction.isSelectionAreaVisible}
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
  hideGutter: boolean;
};

function Draggable({
  activate,
  active,
  container,
  hideGutter,
  ...props
}: DraggableProps) {
  const { children, editor, element } = props;
  const blockSelectionApi = editor.plugin(BlockSelectionPlugin).api;
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

      {!isInTable && (
        <Gutter
          active={isPointerActive}
          hidden={hideGutter}
          isContainer={isContainer}
        >
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

      <div
        ref={nodeRef}
        className="plite-blockWrapper flow-root"
        onContextMenu={(event) => {
          blockSelectionApi.addOnContextMenu({ element, event });
        }}
      >
        <MemoizedChildren>{children}</MemoizedChildren>
      </div>
    </div>
  );
}

const getDraggableContainer = (
  editor: PlateEditor,
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
  element: PliteElement;
  nodeRef: React.RefObject<HTMLDivElement | null>;
  onDraggingChange: (dragging: boolean) => void;
  onDropLineChange: (dropLine: DropLineDirection) => void;
  previewRef: React.RefObject<HTMLDivElement | null>;
  resetPreview: () => void;
}) {
  const { api: blockSelectionApi } = useEditorPlugin(BlockSelectionPlugin);
  const { handleRef, isAboutToDrag, isDragging } = useDraggable({
    element,
    multiplePreviewRef: previewRef,
    nodeRef,
    onDropHandler: (_, { dragItem }) => {
      if ('key' in dragItem) {
        blockSelectionApi.add(dragItem.key);
      }
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
  hidden,
  isContainer,
  ...props
}: React.ComponentProps<'div'> & {
  active: boolean;
  hidden: boolean;
  isContainer: boolean;
}) {
  return (
    <div
      {...props}
      className={cn(
        'plite-gutterLeft',
        '-translate-x-full absolute top-0 z-50 flex h-full w-[22px] cursor-text hover:opacity-100 sm:opacity-0',
        isContainer
          ? 'group-hover/container:opacity-100'
          : 'group-hover:opacity-100',
        'focus-within:opacity-100',
        active && 'opacity-100',
        hidden && 'hidden',
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
  const { api, read } = useEditorPlugin(BlockSelectionPlugin);
  const element = useElement();
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
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;

            event.preventDefault();
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
              const path = editor.read.nodes.path(element);

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
              editor.update.selection.clear();
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
    const domNode =
      editor.api.dom.resolveDOMNode(node) ??
      failInvariant('Expected value to be defined');
    const newDomNode = domNode.cloneNode(true) as HTMLElement;

    // Apply visual compensation for horizontal scroll
    const applyScrollCompensation = (
      original: Element,
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
      const lastDomNodeRect = (
        (
          editor.api.dom.resolveDOMNode(lastDomNode) ??
          failInvariant('Expected value to be defined')
        ).parentElement ?? failInvariant('Expected value to be defined')
      ).getBoundingClientRect();

      const domNodeRect = (
        domNode.parentElement ?? failInvariant('Expected value to be defined')
      ).getBoundingClientRect();

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
  const child =
    editor.api.dom.resolveDOMNode(element) ??
    failInvariant('Expected value to be defined');
  const editable =
    editor.api.dom.resolveDOMNode(editor) ??
    failInvariant('Expected value to be defined');
  const firstSelectedChild = blocks[0];

  const firstDomNode =
    editor.api.dom.resolveDOMNode(firstSelectedChild) ??
    failInvariant('Expected value to be defined');
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
  const child =
    editor.api.dom.resolveDOMNode(element) ??
    failInvariant('Expected value to be defined');

  const currentMarginTopString = window.getComputedStyle(child).marginTop;
  const currentMarginTop = Number(currentMarginTopString.replace('px', ''));

  return currentMarginTop;
};

const DndRoot = ({ children }: { children: React.ReactNode }) => {
  const isDragging = usePluginStore(DndPlugin, 'isDragging');
  const isSelectionAreaVisible = usePluginStore(
    BlockSelectionPlugin,
    'isSelectionAreaVisible'
  );
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
      isSelectionAreaVisible,
    }),
    [activate, active, isDragging, isSelectionAreaVisible]
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
