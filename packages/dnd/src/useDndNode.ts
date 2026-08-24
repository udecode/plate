import { type PlateEditor, useEditor, useElement } from '@platejs/core/react';
import {
  type Element,
  ElementApi,
  type NodeEntry,
  type Path,
  PathApi,
  type NodeKey,
} from '@platejs/plite';
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
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend';

import { useDndPluginStore } from './internal/DndStore';
import { DndStorePlugin } from './internal/DndStorePlugin';

export const DRAG_ITEM_BLOCK = 'block';

const canUseDomDnd = () =>
  typeof document !== 'undefined' && typeof window !== 'undefined';

const useIsomorphicLayoutEffect = canUseDomDnd()
  ? React.useLayoutEffect
  : React.useEffect;

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

const crossEditorDropResult = Symbol('crossEditorDropResult');
const dragSourceSnapshot = Symbol('dragSourceSnapshot');

type ElementDragSourceSnapshot = {
  children: readonly unknown[];
  editor: PlateEditor;
  elements: readonly Element[];
};

type InternalElementDragItemNode = ElementDragItemNode & {
  [dragSourceSnapshot]?: ElementDragSourceSnapshot;
};

type CrossEditorDropResult = {
  dropEffect?: string;
  [crossEditorDropResult]?: {
    children: readonly unknown[];
    editor: PlateEditor;
    paths: readonly Path[];
  };
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

export interface UseDragNodeOptions extends DragSourceHookSpec<
  DragItemNode,
  unknown,
  { isDragging: boolean }
> {
  element: Element;
}

const completeCrossEditorDrag = (
  editor: PlateEditor,
  monitor: Parameters<NonNullable<UseDragNodeOptions['end']>>[1]
) => {
  const dropResult = monitor.getDropResult<CrossEditorDropResult>();
  const move = dropResult?.[crossEditorDropResult];

  if (
    !move ||
    move.editor !== editor ||
    dropResult?.dropEffect === 'copy' ||
    editor.read.runtime.snapshot().children !== move.children
  ) {
    return;
  }

  editor.update((tx) => {
    move.paths.forEach((path) => {
      tx.nodes.remove({ at: path });
    });
  });
};

export interface UseDropNodeOptions extends DropTargetHookSpec<
  DragItemNode,
  unknown,
  { isOver: boolean }
> {
  element: Element;
  nodeRef: React.RefObject<HTMLElement | null>;
  canDropNode?: CanDropCallback;
  orientation?: 'horizontal' | 'vertical';
  onDropHandler?: (
    editor: PlateEditor,
    props: {
      key: NodeKey;
      dragItem: DragItemNode;
      monitor: DropTargetMonitor<DragItemNode>;
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
        monitor: DropTargetMonitor<DragItemNode>;
        nodeRef: React.RefObject<HTMLElement | null>;
      }
    ) => boolean | void;
  };

export type UseDraggableOptions<
  TNode extends HTMLElement = HTMLDivElement,
  TPreview extends HTMLElement = HTMLDivElement,
> = Omit<UseDndNodeOptions, 'multiplePreviewRef' | 'nodeRef'> & {
  multiplePreviewRef?: React.RefObject<TPreview | null>;
  nodeRef?: React.RefObject<TNode | null>;
};

export type DraggableState<
  TNode extends HTMLElement = HTMLDivElement,
  TPreview extends HTMLElement = HTMLDivElement,
> = {
  isAboutToDrag: boolean;
  isDragging: boolean;
  nodeRef: React.RefObject<TNode | null>;
  previewRef: React.RefObject<TPreview | null>;
  handleRef: React.RefCallback<HTMLElement>;
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
  if (!nodeRef.current) return undefined;

  if ('element' in dragItem) {
    if (element === dragItem.element) return undefined;

    const draggedKeys = Array.isArray(dragItem.key)
      ? dragItem.key
      : [dragItem.key];

    if (
      (editorId === undefined || dragItem.editorId === editorId) &&
      nodeKey !== undefined &&
      draggedKeys.includes(nodeKey)
    ) {
      return undefined;
    }
  }

  const hoverBoundingRect = nodeRef.current.getBoundingClientRect();
  const clientOffset = monitor.getClientOffset();

  if (!clientOffset) return undefined;

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

  if (!direction) return undefined;

  let dragEntry: NodeEntry<Element> | undefined;
  let dropEntry: NodeEntry<Element> | undefined;
  const hoveredNodePath = editor.read.nodes.path(element);

  if ('element' in dragItem) {
    if (!hoveredNodePath) return undefined;

    const sourceEditor =
      dragItem.editorId === editor.id ? editor : dragItem.editor;
    const dragPath = sourceEditor?.read.nodes.path(dragItem.element);

    if (sourceEditor && !dragPath) return undefined;

    if (dragPath) {
      dragEntry = [dragItem.element, dragPath];
    }
    dropEntry = [element, hoveredNodePath];
  } else if (hoveredNodePath) dropEntry = [element, hoveredNodePath];
  if (!dropEntry) return undefined;
  if (
    (canDropNode &&
      dragEntry &&
      !canDropNode({ dragEntry, dragItem, dropEntry, editor })) ||
    !monitor.canDrop()
  ) {
    return undefined;
  }

  let dropPath: Path | undefined;
  const dragPath =
    'editorId' in dragItem && dragItem.editorId === editor.id
      ? dragEntry?.[1]
      : undefined;
  const hoveredPath = dropEntry[1];

  if (direction === 'bottom' || direction === 'right') {
    dropPath = hoveredPath;

    if (dragPath && PathApi.equals(dragPath, PathApi.next(dropPath))) {
      return undefined;
    }
  }
  if (direction === 'top' || direction === 'left') {
    const hoveredIndex = hoveredPath.at(-1);

    if (hoveredIndex === undefined) return undefined;

    dropPath = [...hoveredPath.slice(0, -1), hoveredIndex - 1];

    if (dragPath && PathApi.equals(dragPath, dropPath)) return undefined;
  }

  if (!dropPath) return undefined;

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
  {
    canDrag: canDragOption,
    element: staleElement,
    end: onDragEnd,
    item,
    ...options
  }: UseDragNodeOptions
): [
  { isAboutToDrag: boolean; isDragging: boolean },
  ConnectDragSource,
  ConnectDragPreview,
] => {
  const elementKey = editor.key(staleElement);
  const [isAboutToDrag, setIsAboutToDrag] = React.useState(false);
  const cancelAttemptedDragResetRef = React.useRef<(() => void) | null>(null);
  const [collected, dragRef, preview] = useDrag<
    DragItemNode,
    unknown,
    { isDragging: boolean }
  >({
    canDrag: (monitor) => {
      if (
        canDragOption !== undefined &&
        (typeof canDragOption === 'function'
          ? !canDragOption(monitor)
          : !canDragOption)
      ) {
        return false;
      }

      cancelAttemptedDragResetRef.current?.();
      setIsAboutToDrag(true);
      const timeoutId = setTimeout(() => {
        cancelAttemptedDragResetRef.current = null;

        if (!monitor.isDragging()) {
          setIsAboutToDrag(false);
        }
      }, 0);

      cancelAttemptedDragResetRef.current = () => {
        clearTimeout(timeoutId);
        cancelAttemptedDragResetRef.current = null;
      };

      return true;
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    end: (dragItem, monitor) => {
      try {
        completeCrossEditorDrag(editor, monitor);
      } finally {
        try {
          onDragEnd?.(dragItem, monitor);
        } finally {
          cancelAttemptedDragResetRef.current?.();
          editor.plugin(DndStorePlugin).store.set({ isDragging: false });
          document.body.classList.remove('dragging');
          setIsAboutToDrag(false);
        }
      }
    },
    item(monitor) {
      cancelAttemptedDragResetRef.current?.();
      const { store } = editor.plugin(DndStorePlugin);

      store.set({ isDragging: true });
      store.set({ _isOver: true });
      document.body.classList.add('dragging');

      const itemValue = typeof item === 'function' ? item(monitor) : item;
      const element = editor.read.nodes.get(elementKey, {
        match: ElementApi.isElement,
      })?.[0];

      if (!element) return null;

      if (editor.api.dom.isFocused()) {
        editor.api.dom.blur();
      }

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

      const dragItem: ElementDragItemNode = {
        key,
        editor,
        editorId: editor.id,
        element,
        ...itemValue,
      };
      const draggedKeys = Array.isArray(dragItem.key)
        ? dragItem.key
        : [dragItem.key];
      const elements = draggedKeys
        .map((draggedKey) =>
          editor.read.nodes.get(draggedKey, {
            match: ElementApi.isElement,
          })
        )
        .filter((entry): entry is NodeEntry<Element> => !!entry)
        .toSorted(([, a], [, b]) => PathApi.compare(a, b))
        .map(([node]) => node);
      const snapshot = editor.read.runtime.snapshot();

      return {
        ...dragItem,
        [dragSourceSnapshot]: {
          children: snapshot.children,
          editor,
          elements: elements.length > 0 ? elements : [dragItem.element],
        },
      } satisfies InternalElementDragItemNode;
    },
    ...options,
  });

  React.useEffect(
    () => () => {
      cancelAttemptedDragResetRef.current?.();
    },
    []
  );

  return [{ ...collected, isAboutToDrag }, dragRef, preview];
};

const useInertDragNode = (): ReturnType<typeof useDomDragNode> => [
  { isAboutToDrag: false, isDragging: false },
  noopConnector,
  noopConnector,
];

const useDragNode = canUseDomDnd() ? useDomDragNode : useInertDragNode;

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
    drop: (dragItem, monitor): CrossEditorDropResult | undefined => {
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

        if (!result || !onDropFiles) return undefined;

        onDropFiles({
          key,
          dragItem,
          editor,
          monitor,
          nodeRef,
          target: result.to,
        });
        return undefined;
      }

      const handled =
        !!onDropHandler &&
        onDropHandler(editor, { key, dragItem, monitor, nodeRef });

      if (handled) return undefined;

      const result = getDropPath(editor, {
        canDropNode,
        dragItem,
        element,
        monitor,
        nodeRef,
        orientation,
      });

      if (!result) return undefined;

      const { direction, dragPath, to } = result;

      if (dragItem.editorId === editor.id) {
        const draggedKeys = Array.isArray(dragItem.key)
          ? dragItem.key
          : [dragItem.key];

        if (draggedKeys.length > 1) {
          if (draggedKeys.includes(editor.key(element))) {
            return undefined;
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
          if (!dragPath) return undefined;

          editor.update.nodes.move({ at: dragPath, to });
        }

        return undefined;
      }

      const sourceSnapshot = (dragItem as InternalElementDragItemNode)[
        dragSourceSnapshot
      ];
      const sourceEditor = sourceSnapshot?.editor ?? dragItem.editor;

      if (!sourceEditor) {
        editor.update.nodes.insert(dragItem.element, { at: to });

        return undefined;
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
      const elements =
        sourceSnapshot?.elements ??
        entries
          .toSorted(([, a], [, b]) => PathApi.compare(a, b))
          .map(([node]) => node);
      const paths = entries
        .map(([, path]) => path)
        .toSorted((a, b) => PathApi.compare(b, a));

      const targetChildren = editor.read.runtime.snapshot().children;

      editor.update.nodes.insert(
        elements.length > 0 ? elements : dragItem.element,
        { at: to }
      );

      if (editor.read.runtime.snapshot().children === targetChildren) {
        return undefined;
      }

      if (sourceSnapshot) {
        return {
          [crossEditorDropResult]: {
            children: sourceSnapshot.children,
            editor: sourceEditor,
            paths,
          },
        } satisfies CrossEditorDropResult;
      }

      if (paths.length > 0) {
        sourceEditor.update((tx) => {
          paths.forEach((path) => {
            tx.nodes.remove({ at: path });
          });
        });
      }

      return undefined;
    },
    hover: (dragItem, monitor) => {
      const { store } = editor.plugin(DndStorePlugin);
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
          if (!PathApi.hasPrevious(elementPath)) {
            store.set({ dropTarget: newDropTarget });

            return;
          }

          const previousPath = PathApi.previous(elementPath);

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

const useDropNode = canUseDomDnd() ? useDomDropNode : useInertDropNode;

/**
 * Register one element as a drag source and drop target using caller-owned
 * refs. Mount this hook only while the surrounding UI needs DnD interaction;
 * use `useDraggable` when the hook should own the refs instead.
 */
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

  useIsomorphicLayoutEffect(() => {
    drop(resolvedNodeRef);

    if (previewOptions.disable) {
      preview(getEmptyImage(), { captureDraggingState: true });
    } else if (previewOptions.ref) {
      preview(previewOptions.ref);
    } else {
      preview(multiplePreviewRef ?? null);
    }

    return () => {
      drop(null);
      preview(null);
    };
  }, [drop, multiplePreviewRef, preview, previewOptions, resolvedNodeRef]);

  return { dragRef, isAboutToDrag, isDragging, isOver };
};

export const useDraggable = <
  TNode extends HTMLElement = HTMLDivElement,
  TPreview extends HTMLElement = HTMLDivElement,
>(
  props: UseDraggableOptions<TNode, TPreview>
): DraggableState<TNode, TPreview> => {
  const {
    orientation = 'vertical',
    type = DRAG_ITEM_BLOCK,
    onDropHandler,
  } = props;
  const fallbackNodeRef = React.useRef<TNode>(null);
  const fallbackPreviewRef = React.useRef<TPreview>(null);
  const nodeRef = props.nodeRef ?? fallbackNodeRef;
  const multiplePreviewRef = props.multiplePreviewRef ?? fallbackPreviewRef;
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
