import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend';

import React from 'react';
import {
  type ConnectDragPreview,
  type ConnectDragSource,
  type ConnectDropTarget,
  type DragSourceHookSpec,
  type DropTargetHookSpec,
  type DropTargetMonitor,
  useDrag,
  useDrop,
} from 'react-dnd';

import { type PlateEditor, useEditor, useElement } from '@platejs/core/react';
import {
  type Element,
  ElementApi,
  type NodeEntry,
  type Path,
  PathApi,
  type NodeKey,
} from '@platejs/plite';
import { DndStorePlugin, type DndPluginState } from './internal/DndStorePlugin';

export const DRAG_ITEM_BLOCK = 'block';

const canUseDomDnd = () =>
  typeof document !== 'undefined' && typeof window !== 'undefined';

const noopConnector: ConnectDragPreview &
  ConnectDragSource &
  ConnectDropTarget = () => null;

export type DragItemNode = ElementDragItemNode | FileDragItemNode;

export type DropDirection = 'bottom' | 'left' | 'right' | 'top' | undefined;

export type DropLineDirection = '' | 'bottom' | 'left' | 'right' | 'top';

export type ElementDragItemNode = {
  key: NodeKey[] | NodeKey;
  [key: string]: unknown;
  editorId: string;
  element: Element;
  editor?: PlateEditor;
};

export type FileDragItemNode = {
  dataTransfer: DataTransfer[];
  files: FileList;
  items: DataTransferItemList;
};

export type CanDropCallback = (args: {
  dragEntry: NodeEntry<Element>;
  dragItem: DragItemNode;
  dropEntry: NodeEntry<Element>;
  editor: PlateEditor;
}) => boolean;

export interface UseDragNodeOptions
  extends DragSourceHookSpec<DragItemNode, unknown, { isDragging: boolean }> {
  element: Element;
}

export interface UseDropNodeOptions
  extends DropTargetHookSpec<DragItemNode, unknown, { isOver: boolean }> {
  element: Element;
  nodeRef: React.RefObject<HTMLElement | null>;
  canDropNode?: CanDropCallback;
  orientation?: 'horizontal' | 'vertical';
  onDropHandler?: (
    editor: PlateEditor,
    props: {
      key: NodeKey;
      dragItem: DragItemNode;
      monitor: DropTargetMonitor<DragItemNode, unknown>;
      nodeRef: React.RefObject<HTMLElement | null>;
    }
  ) => boolean | void;
}

export type UseDndNodeOptions = Pick<UseDropNodeOptions, 'element'> &
  Partial<Pick<UseDropNodeOptions, 'canDropNode' | 'nodeRef'>> &
  Partial<Pick<UseDragNodeOptions, 'type'>> & {
    drag?: Partial<Omit<UseDragNodeOptions, 'type'>>;
    drop?: Partial<
      Omit<UseDropNodeOptions, 'canDropNode' | 'element' | 'nodeRef'>
    >;
    orientation?: 'horizontal' | 'vertical';
    preview?: {
      disable?: boolean;
      ref?: React.RefObject<HTMLElement | null>;
    };
    multiplePreviewRef?: React.RefObject<HTMLElement | null>;
    onDropHandler?: (
      editor: PlateEditor,
      props: {
        key: NodeKey;
        dragItem: DragItemNode;
        monitor: DropTargetMonitor<DragItemNode, unknown>;
        nodeRef: React.RefObject<HTMLElement | null>;
      }
    ) => boolean | void;
  };

export type DraggableState = {
  isAboutToDrag: boolean;
  isDragging: boolean;
  nodeRef: React.RefObject<HTMLDivElement | null>;
  previewRef: React.RefObject<HTMLDivElement | null>;
  handleRef: React.RefCallback<HTMLElement>;
};

export const useDndPluginStore = <K extends keyof DndPluginState>(key: K) => {
  const editor = useEditor();
  const store = editor.plugin(DndStorePlugin).store;

  return React.useSyncExternalStore(
    store.subscribe,
    () => store.get()[key],
    () => store.get()[key]
  );
};

export const useDndPlugin = () => {
  const editor = useEditor();
  const store = editor.plugin(DndStorePlugin).store;

  React.useEffect(() => {
    const handleDragLeave = (event: DragEvent) => {
      // This event fires for every element that receives a drag leave event. As soon as it is fired on the
      // editable dom node, or above, we will unset the drop target, and therefore hide the drop line.
      // In other words, whenever the drag is not happening inside the editor anymore, we will hide the
      // drop line which makes sense, since a potential drop would not insert anything into the editor.
      // This will also apply, if the user move the drag operation outside the document.
      if (!(event.target instanceof Node)) return;

      const editorDOMNode = editor.api.dom.resolveDOMNode(editor);

      if (!editorDOMNode) return;

      const targetElement =
        event.target instanceof HTMLElement
          ? event.target
          : event.target.parentElement;
      const relatedTarget = event.relatedTarget;
      const relatedElement =
        relatedTarget instanceof HTMLElement
          ? relatedTarget
          : relatedTarget instanceof Node
            ? relatedTarget.parentElement
            : null;
      const targetBlock = targetElement?.closest('[data-plite-node-key]');
      const relatedBlock = relatedElement?.closest('[data-plite-node-key]');
      const isLeavingEditor = !(
        event.target === editorDOMNode || editorDOMNode.contains(event.target)
      );
      const isLeavingBlockForEditorWhitespace =
        !!targetBlock &&
        !relatedBlock &&
        (!relatedTarget ||
          (relatedTarget instanceof Node &&
            editorDOMNode.contains(relatedTarget)));

      if (isLeavingEditor || isLeavingBlockForEditorWhitespace) {
        store.set({ dropTarget: undefined });
      }
    };
    // We listen for the drop event on the document and not only inside the editor, because we want to
    // remove the dropTarget, and therefore hide the drop line, also when the drop happened outside of
    // the editor. Needed, if the drag did not start inside the editor, but for example by dragging a
    // file from the filesystem
    const handleDrop = () => {
      store.set({ _isOver: false });
      store.set({ dropTarget: undefined });
    };

    document.addEventListener('dragleave', handleDragLeave, true);
    document.addEventListener('drop', handleDrop, true);

    return () => {
      document.removeEventListener('dragleave', handleDragLeave, true);
      document.removeEventListener('drop', handleDrop, true);
    };
  }, [editor, store]);
};

export type GetHoverDirectionOptions = {
  dragItem: DragItemNode;
  element: Element;
  monitor: DropTargetMonitor;
  nodeRef: React.RefObject<HTMLElement | null>;
  editorId?: string;
  nodeKey?: NodeKey;
  orientation?: 'horizontal' | 'vertical';
};

export const getHoverDirection = ({
  dragItem,
  editorId,
  element,
  monitor,
  nodeRef,
  orientation = 'vertical',
  nodeKey,
}: GetHoverDirectionOptions): DropDirection => {
  if (!nodeRef.current) return;

  if ('element' in dragItem) {
    if (element === dragItem.element) return;

    const draggedKeys = Array.isArray(dragItem.key)
      ? dragItem.key
      : [dragItem.key];

    if (
      (editorId === undefined || dragItem.editorId === editorId) &&
      nodeKey !== undefined &&
      draggedKeys.includes(nodeKey)
    ) {
      return;
    }
  }

  const hoverBoundingRect = nodeRef.current.getBoundingClientRect();
  const clientOffset = monitor.getClientOffset();

  if (!clientOffset) return;

  if (orientation === 'vertical') {
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    return hoverClientY < hoverMiddleY ? 'top' : 'bottom';
  }

  const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
  const hoverClientX = clientOffset.x - hoverBoundingRect.left;

  return hoverClientX < hoverMiddleX ? 'left' : 'right';
};

export const getDropPath = (
  editor: PlateEditor,
  {
    canDropNode,
    dragItem,
    element,
    monitor,
    nodeRef,
    orientation = 'vertical',
  }: {
    dragItem: DragItemNode;
    monitor: DropTargetMonitor;
  } & Pick<
    UseDropNodeOptions,
    'canDropNode' | 'element' | 'nodeRef' | 'orientation'
  >
) => {
  const direction = getHoverDirection({
    dragItem,
    editorId: editor.id,
    element,
    monitor,
    nodeRef,
    orientation,
    nodeKey: editor.key(element),
  });

  if (!direction) return;

  let dragEntry: NodeEntry<Element> | undefined;
  let dropEntry: NodeEntry<Element> | undefined;

  if ('element' in dragItem) {
    const hoveredPath = editor.read.nodes.path(element);

    if (!hoveredPath) return;

    const sourceEditor =
      dragItem.editorId === editor.id ? editor : dragItem.editor;
    const dragPath = sourceEditor?.read.nodes.path(dragItem.element);

    if (sourceEditor && !dragPath) return;

    if (dragPath) {
      dragEntry = [dragItem.element, dragPath];
    }
    dropEntry = [element, hoveredPath];
  } else {
    const hoveredPath = editor.read.nodes.path(element);

    if (hoveredPath) dropEntry = [element, hoveredPath];
  }
  if (!dropEntry) return;
  if (
    (canDropNode &&
      dragEntry &&
      !canDropNode({ dragEntry, dragItem, dropEntry, editor })) ||
    !monitor.canDrop()
  ) {
    return;
  }

  let dropPath: Path | undefined;
  const dragPath =
    'editorId' in dragItem && dragItem.editorId === editor.id
      ? dragEntry?.[1]
      : undefined;
  const hoveredPath = dropEntry[1];

  if (direction === 'bottom' || direction === 'right') {
    dropPath = hoveredPath;

    if (dragPath && PathApi.equals(dragPath, PathApi.next(dropPath))) return;
  }
  if (direction === 'top' || direction === 'left') {
    const hoveredIndex = hoveredPath.at(-1);

    if (hoveredIndex === undefined) return;

    dropPath = [...hoveredPath.slice(0, -1), hoveredIndex - 1];

    if (dragPath && PathApi.equals(dragPath, dropPath)) return;
  }

  if (!dropPath) return;

  const before =
    dragPath &&
    PathApi.isBefore(dragPath, dropPath) &&
    PathApi.isSibling(dragPath, dropPath);

  return {
    direction,
    dragPath,
    to: before ? dropPath : PathApi.next(dropPath),
  };
};

const useDomDragNode = (
  editor: PlateEditor,
  { element: staleElement, item, ...options }: UseDragNodeOptions
): [
  { isAboutToDrag: boolean; isDragging: boolean },
  ConnectDragSource,
  ConnectDragPreview,
] => {
  const elementKey = editor.key(staleElement);
  const [isAboutToDrag, setIsAboutToDrag] = React.useState(false);
  const [collected, dragRef, preview] = useDrag<
    DragItemNode,
    unknown,
    { isDragging: boolean }
  >({
    canDrag: () => {
      setIsAboutToDrag(true);

      return true;
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    end: () => {
      editor.plugin(DndStorePlugin).store.set({ isDragging: false });
      document.body.classList.remove('dragging');
      setIsAboutToDrag(false);
    },
    item(monitor) {
      const store = editor.plugin(DndStorePlugin).store;

      store.set({ isDragging: true });
      store.set({ _isOver: true });
      document.body.classList.add('dragging');

      const itemValue = typeof item === 'function' ? item(monitor) : item;
      const element = editor.read.nodes.get(elementKey, {
        match: ElementApi.isElement,
      })?.[0];

      if (!element) return null;

      const currentDraggingKey = store.get('draggingKey');
      let key: NodeKey[] | NodeKey;

      if (
        Array.isArray(currentDraggingKey) &&
        currentDraggingKey.length > 1 &&
        currentDraggingKey.includes(elementKey)
      ) {
        key = Array.from(currentDraggingKey);
      } else {
        key = elementKey;
        store.set({ draggingKey: elementKey });
      }

      return {
        key,
        editor,
        editorId: editor.id,
        element,
        ...itemValue,
      };
    },
    ...options,
  });

  React.useEffect(() => {
    if (!collected.isDragging && isAboutToDrag) {
      setIsAboutToDrag(false);
    }
  }, [collected.isDragging, isAboutToDrag]);

  return [{ ...collected, isAboutToDrag }, dragRef, preview];
};

const useInertDragNode = (): ReturnType<typeof useDomDragNode> => [
  { isAboutToDrag: false, isDragging: false },
  noopConnector,
  noopConnector,
];

export const useDragNode = canUseDomDnd() ? useDomDragNode : useInertDragNode;

const useDomDropNode = (
  editor: PlateEditor,
  {
    canDropNode,
    element,
    nodeRef,
    orientation,
    onDropHandler,
    ...options
  }: UseDropNodeOptions
): [{ isOver: boolean }, ConnectDropTarget] =>
  useDrop<DragItemNode, unknown, { isOver: boolean }>({
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
    drop: (dragItem, monitor) => {
      const key = editor.key(element);

      if (!('key' in dragItem)) {
        const result = getDropPath(editor, {
          canDropNode,
          dragItem,
          element,
          monitor,
          nodeRef,
          orientation,
        });
        const onDropFiles = editor
          .plugin(DndStorePlugin)
          .store.get('onDropFiles');

        if (!result || !onDropFiles) return;

        return onDropFiles({
          key,
          dragItem,
          editor,
          monitor,
          nodeRef,
          target: result.to,
        });
      }

      const handled =
        !!onDropHandler &&
        onDropHandler(editor, { key, dragItem, monitor, nodeRef });

      if (handled) return;

      const result = getDropPath(editor, {
        canDropNode,
        dragItem,
        element,
        monitor,
        nodeRef,
        orientation,
      });

      if (!result) return;

      const { direction, dragPath, to } = result;

      if (dragItem.editorId === editor.id) {
        const draggedKeys = Array.isArray(dragItem.key)
          ? dragItem.key
          : [dragItem.key];

        if (draggedKeys.length > 1) {
          if (draggedKeys.includes(editor.key(element))) {
            return;
          }

          const entries = draggedKeys
            .map((draggedKey) =>
              editor.read.nodes.get(draggedKey, {
                match: ElementApi.isElement,
              })
            )
            .filter((entry): entry is NodeEntry<Element> => !!entry)
            .toSorted(([, a], [, b]) => PathApi.compare(a, b));
          const insertAfter = direction === 'bottom' || direction === 'right';

          editor.update((tx) => {
            let target = element;

            for (const [node] of entries) {
              const path = tx.nodes.path(node);
              const targetPath = tx.nodes.path(target);

              if (!path || !targetPath) continue;

              const sameParentBefore =
                PathApi.isBefore(path, targetPath) &&
                PathApi.isSibling(path, targetPath);
              const destination = insertAfter
                ? sameParentBefore
                  ? targetPath
                  : PathApi.next(targetPath)
                : sameParentBefore
                  ? PathApi.previous(targetPath)
                  : targetPath;

              tx.nodes.move({ at: path, to: destination });

              if (insertAfter) target = node;
            }
          });
        } else {
          if (!dragPath) return;

          editor.update.nodes.move({ at: dragPath, to });
        }

        return;
      }

      const sourceEditor = dragItem.editor;

      if (!sourceEditor) {
        editor.update.nodes.insert(dragItem.element, { at: to });

        return;
      }

      const draggedKeys = Array.isArray(dragItem.key)
        ? dragItem.key
        : dragItem.key
          ? [dragItem.key]
          : [];
      const entries = draggedKeys
        .map((draggedKey) =>
          sourceEditor.read.nodes.get(draggedKey, {
            match: ElementApi.isElement,
          })
        )
        .filter((entry): entry is NodeEntry<Element> => !!entry);
      const elements = entries
        .toSorted(([, a], [, b]) => PathApi.compare(a, b))
        .map(([node]) => node);
      const paths = entries
        .map(([, path]) => path)
        .toSorted((a, b) => PathApi.compare(b, a));

      editor.update.nodes.insert(
        elements.length > 0 ? elements : dragItem.element,
        { at: to }
      );

      if (paths.length > 0) {
        sourceEditor.update((tx) => {
          paths.forEach((path) => {
            tx.nodes.remove({ at: path });
          });
        });
      }
    },
    hover: (dragItem, monitor) => {
      const store = editor.plugin(DndStorePlugin).store;
      const { _isOver, dropTarget } = store.get();
      const currentKey = dropTarget?.key ?? null;
      const currentLine = dropTarget?.line ?? '';
      const result = getDropPath(editor, {
        canDropNode,
        dragItem,
        element,
        monitor,
        nodeRef,
        orientation,
      });

      if (!result) {
        if (currentKey || currentLine) {
          store.set({ dropTarget: { key: null, line: '' } });
        }

        return;
      }

      const { direction } = result;
      const elementKey = editor.key(element);

      const newDropTarget = { key: elementKey, line: direction };

      if (
        newDropTarget.key !== currentKey ||
        newDropTarget.line !== currentLine
      ) {
        if (!_isOver) return;

        if (newDropTarget.line === 'top') {
          const elementPath = editor.read.nodes.path(element);

          if (!elementPath) return;

          const previousPath = PathApi.previous(elementPath);

          if (!previousPath) {
            store.set({ dropTarget: newDropTarget });

            return;
          }

          store.set({
            dropTarget: editor.read.nodes.get(previousPath, {
              match: ElementApi.isElement,
            })
              ? {
                  key: editor.key(previousPath),
                  line: 'bottom',
                }
              : newDropTarget,
          });

          return;
        }

        store.set({ dropTarget: newDropTarget });
      }
      if (editor.read.selection.isExpanded()) {
        editor.api.dom.focus();
        editor.update.selection.collapse({ edge: 'anchor' });
      }
    },
    ...options,
  });

const useInertDropNode = (): ReturnType<typeof useDomDropNode> => [
  { isOver: false },
  noopConnector,
];

export const useDropNode = canUseDomDnd() ? useDomDropNode : useInertDropNode;

export const useDndNode = ({
  canDropNode,
  drag: dragOptions,
  drop: dropOptions,
  element,
  multiplePreviewRef,
  nodeRef,
  orientation = 'vertical',
  preview: previewOptions = {},
  type = DRAG_ITEM_BLOCK,
  onDropHandler,
}: UseDndNodeOptions): {
  dragRef: ConnectDragSource;
  isAboutToDrag: boolean;
  isDragging: boolean;
  isOver: boolean;
} => {
  const editor = useEditor();
  const fallbackNodeRef = React.useRef<HTMLElement>(null);
  const resolvedNodeRef = nodeRef ?? fallbackNodeRef;
  const [{ isAboutToDrag, isDragging }, dragRef, preview] = useDragNode(
    editor,
    { element, type, ...dragOptions }
  );
  const [{ isOver }, drop] = useDropNode(editor, {
    accept: [type, NativeTypes.FILE],
    canDropNode,
    element,
    nodeRef: resolvedNodeRef,
    orientation,
    onDropHandler,
    ...dropOptions,
  });

  drop(resolvedNodeRef);

  if (previewOptions.disable) {
    preview(getEmptyImage(), { captureDraggingState: true });
  } else if (previewOptions.ref) {
    preview(previewOptions.ref);
  } else {
    preview(multiplePreviewRef ?? null);
  }

  return { dragRef, isAboutToDrag, isDragging, isOver };
};

export const useDraggable = (props: UseDndNodeOptions): DraggableState => {
  const {
    orientation = 'vertical',
    type = DRAG_ITEM_BLOCK,
    onDropHandler,
  } = props;
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const multiplePreviewRef = React.useRef<HTMLDivElement>(null);
  const { dragRef, isAboutToDrag, isDragging } = useDndNode({
    multiplePreviewRef,
    nodeRef,
    orientation,
    type,
    onDropHandler,
    ...props,
  });
  const handleRef = React.useCallback(
    (node: HTMLElement | null) => {
      dragRef(node);
    },
    [dragRef]
  );

  return {
    isAboutToDrag,
    isDragging,
    nodeRef,
    previewRef: multiplePreviewRef,
    handleRef,
  };
};

export const useDropLine = ({
  key: keyProp,
  orientation = 'vertical',
}: {
  key?: NodeKey;
  orientation?: 'horizontal' | 'vertical';
} = {}): {
  dropLine?: DropLineDirection;
} => {
  const element = useElement();
  const editor = useEditor();
  const key = keyProp ?? editor.key(element);
  const dropTarget = useDndPluginStore('dropTarget');
  const dropLine = dropTarget && dropTarget.key === key ? dropTarget.line : '';

  if (orientation) {
    const isHorizontal = dropLine === 'left' || dropLine === 'right';
    const isVertical = dropLine === 'top' || dropLine === 'bottom';

    if (
      (orientation === 'vertical' && isHorizontal) ||
      (orientation === 'horizontal' && isVertical)
    ) {
      return { dropLine: '' };
    }
  }

  return { dropLine };
};
