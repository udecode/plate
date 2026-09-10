'use client';

import { GripVertical } from 'lucide-react';
import { ElementApi, PathApi, type Element, type Path } from 'platejs';
import {
  DndPlugin,
  type DropLineDirection,
  useDraggable,
  useDndPlugin,
  useDropLine,
} from 'platejs/dnd/react';
import { BaseColumnItemPlugin } from 'platejs/layout';
import { PlaceholderPlugin } from 'platejs/media/react';
import {
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
import { DndContext, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
  hasTableCellSelection: false,
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
      hasTableCellSelection={interaction.hasTableCellSelection}
    />
  );
};

export const BlockDraggable: RenderNodeWrapperDescriptor<typeof DndPlugin> = {
  component: BlockDraggableComponent,
  match: isBlockDraggable,
};

type DraggableContainer = 'column' | 'root' | 'table';

function Draggable({
  activate,
  active,
  container,
  hasTableCellSelection,
  ...props
}: RenderNodeWrapperProps & {
  activate: () => void;
  active: boolean;
  container: DraggableContainer;
  hasTableCellSelection: boolean;
}) {
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
  const dnd = editor.plugin(DndPlugin);
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

            const elements = styleDragPreviewElements(
              dnd.api.prepareDrag(element)
            );
            previewRef.current?.append(...elements);
            previewRef.current?.classList.remove('hidden');
            previewRef.current?.classList.add('opacity-0');
            editor
              .plugin(DndPlugin)
              .store.set({ multiplePreviewRef: previewRef });
          }}
          onMouseEnter={() => {
            if (isDragging) return;

            const processedBlocks = dnd.read.dragEntries(element);
            const elementNodeKey = editor.key(element);
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

const styleDragPreviewElements = (
  previews: Array<{ domNode: HTMLElement; preview: HTMLElement }>
): HTMLElement[] =>
  previews.map(({ domNode, preview }, index) => {
    const document = domNode.ownerDocument;
    const { scrollLeft } = domNode;

    if (scrollLeft > 0) {
      const scrollWrapper = document.createElement('div');
      scrollWrapper.style.overflow = 'hidden';
      scrollWrapper.style.width = `${domNode.clientWidth}px`;
      const innerContainer = document.createElement('div');
      innerContainer.style.transform = `translateX(-${scrollLeft}px)`;
      innerContainer.style.width = `${domNode.scrollWidth}px`;
      while (preview.firstChild) innerContainer.append(preview.firstChild);
      preview.style.padding = '0';
      innerContainer.style.padding =
        document.defaultView?.getComputedStyle(domNode).padding ?? '';
      scrollWrapper.append(innerContainer);
      preview.append(scrollWrapper);
    }

    const wrapper = document.createElement('div');
    wrapper.append(preview);
    wrapper.style.display = 'flow-root';
    const previous = previews[index - 1]?.domNode.parentElement;
    const current = domNode.parentElement;

    if (previous && current) {
      const distance =
        current.getBoundingClientRect().top -
        previous.getBoundingClientRect().bottom;
      if (distance > 15) wrapper.style.marginTop = `${distance}px`;
    }
    return wrapper;
  });

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

  if (!child) return 0;
  const editable = editor.api.dom.resolveDOMNode(editor);
  const window = child.ownerDocument.defaultView;
  if (!editable || !window) return 0;

  let firstDomNode: HTMLElement | null = null;
  for (const block of blocks) {
    firstDomNode = editor.api.dom.resolveDOMNode(block);
    if (firstDomNode) break;
  }
  if (!firstDomNode) return 0;
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

  const window = child?.ownerDocument.defaultView;
  if (!child || !window) return 0;

  const currentMarginTopString = window.getComputedStyle(child).marginTop;
  const currentMarginTop = Number(currentMarginTopString.replace('px', ''));

  return currentMarginTop;
};

const DndIntegration = ({
  children,
  editableRef,
}: {
  children: React.ReactNode;
  editableRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [editableElement, setEditableElement] =
    React.useState<HTMLDivElement | null>(null);
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- The stable ref can receive a different element during any commit.
  React.useLayoutEffect(() => {
    if (editableElement !== editableRef.current) {
      setEditableElement(editableRef.current);
    }
  });
  const { dragDropManager } = React.useContext(DndContext);
  useDndPlugin(editableElement);
  const hasTableCellSelection = useEditorSelector((innerEditor) => {
    const table = innerEditor.plugin(BaseTablePlugin);

    return (
      table.installed && (table.read.selection()?.cellKeys.length ?? 0) > 1
    );
  });
  const isDragging = usePluginStore(DndPlugin, 'isDragging');
  const [active, setActive] = React.useState(false);
  const activate = React.useCallback(() => {
    setActive(true);
  }, []);

  React.useEffect(() => {
    if (!editableElement) return undefined;

    const document = editableElement.ownerDocument;
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
  }, [editableElement]);
  const interaction = React.useMemo(
    () => ({
      activate,
      active: active || isDragging,
      hasTableCellSelection,
    }),
    [activate, active, hasTableCellSelection, isDragging]
  );

  return (
    <TooltipProvider>
      <DndInteractionContext value={interaction}>
        {dragDropManager ? (
          children
        ) : (
          <DndProvider backend={HTML5Backend}>{children}</DndProvider>
        )}
      </DndInteractionContext>
    </TooltipProvider>
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
    slots: {
      wrapNode: BlockDraggable,
      wrapRoot: DndIntegration,
    },
  }),
];
