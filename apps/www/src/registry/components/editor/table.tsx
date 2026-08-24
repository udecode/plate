'use client';

import { useDraggable, useDropLine } from '@platejs/dnd';
import { resizeLengthClampStatic } from '@platejs/resizable';
import {
  BlockSelectionPlugin,
  useBlockSelected,
} from '@platejs/selection/react';
import {
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
  useTableSelectionDOM,
} from '@platejs/table/react';
import {
  type LucideProps,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CombineIcon,
  EraserIcon,
  Grid2X2Icon,
  GripVertical,
  PaintBucketIcon,
  SquareSplitHorizontalIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { type Path, PathApi } from 'platejs';
import {
  type PlateEditor,
  type PlateElementProps,
  PlateElement,
  useComposedRef,
  useEditor,
  useEditorPlugin,
  useEditorReadOnly,
  useEditorSelector,
  useElement,
  useElementSelected,
  useFocusedLast,
  usePluginStore,
  useElementSelector,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { blockSelectionVariants } from './block-selection';
import {
  ColorDropdownMenuItems,
  DEFAULT_COLORS,
} from './font-color-toolbar-button';
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarMenuGroup,
} from './toolbar';

type TableResizeDirection = 'bottom' | 'left' | 'right';

type TableResizeStartOptions = {
  colIndex: number;
  direction: TableResizeDirection;
  handleKey: string;
  rowIndex: number;
};

type TableResizeDragState = {
  colIndex: number;
  direction: TableResizeDirection;
  initialPosition: number;
  initialSize: number;
  marginLeft: number;
  rowIndex: number;
};

type TableResizeContextValue = {
  colSizeOverrides: Map<number, number>;
  disableMarginLeft: boolean;
  dragCellKey: string | null;
  marginLeftOverride: number | null;
  rowSizeOverrides: Map<number, number>;
  clearResizePreview: (handleKey: string) => void;
  setResizePreview: (
    event: React.PointerEvent<HTMLDivElement>,
    options: TableResizeStartOptions
  ) => void;
  startResize: (
    event: React.PointerEvent<HTMLDivElement>,
    options: TableResizeStartOptions
  ) => void;
};

const TABLE_CONTROL_COLUMN_WIDTH = 8;

const TABLE_DEFAULT_COLUMN_WIDTH = 120;

const TABLE_DEFERRED_COLUMN_RESIZE_CELL_COUNT = 1200;

const TABLE_MULTI_SELECTION_TOOLBAR_DELAY_MS = 150;

const roundCellSizeToStep = (size: number, step?: number) =>
  step ? Math.round(size / step) * step : size;

const getTablePlugin = (editor: Pick<PlateEditor, 'plugin'>) =>
  editor.plugin(TablePlugin);

const getTableRead = (editor: Pick<PlateEditor, 'plugin'>) =>
  editor.plugin(TablePlugin).read;

const TableResizeContext = React.createContext<TableResizeContextValue | null>(
  null
);

function useTableResizeContext() {
  const context = React.useContext(TableResizeContext);

  if (!context) {
    throw new Error('TableResizeContext is missing');
  }

  return context;
}

function useTableResizeController({
  baseColSizes,
  deferColumnResize,
  dragIndicatorRef,
  hoverIndicatorRef,
  marginLeft,
  overrideColSize,
  overrideMarginLeft,
  overrideRowSize,
  controlColumnWidth,
  tablePath,
  tableRef,
  wrapperRef,
}: {
  baseColSizes: number[];
  deferColumnResize: boolean;
  dragIndicatorRef: React.RefObject<HTMLDivElement | null>;
  hoverIndicatorRef: React.RefObject<HTMLDivElement | null>;
  marginLeft: number;
  overrideColSize: (index: number, size: number | null) => void;
  overrideMarginLeft: React.Dispatch<React.SetStateAction<number | null>>;
  overrideRowSize: (index: number, size: number | null) => void;
  controlColumnWidth: number;
  tablePath: Path;
  tableRef: React.RefObject<HTMLTableElement | null>;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}) {
  const editor = useEditor();
  const { store } = useEditorPlugin(TablePlugin);
  const { disableMarginLeft = false, minColumnWidth = 0 } = store.get();
  const effectiveColSizes = React.useMemo(
    () => baseColSizes.map((colSize) => colSize || TABLE_DEFAULT_COLUMN_WIDTH),
    [baseColSizes]
  );
  const effectiveColSizesRef = React.useRef(effectiveColSizes);
  const activeHandleKeyRef = React.useRef<string | null>(null);
  const activeRowElementRef = React.useRef<HTMLTableRowElement | null>(null);
  const cleanupListenersRef = React.useRef<(() => void) | null>(null);
  const marginLeftRef = React.useRef(marginLeft);
  const dragStateRef = React.useRef<TableResizeDragState | null>(null);
  const frozenRowIndicesRef = React.useRef<number[] | null>(null);
  const previewHandleKeyRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    effectiveColSizesRef.current = effectiveColSizes;
  }, [effectiveColSizes]);

  React.useEffect(() => {
    marginLeftRef.current = marginLeft;
  }, [marginLeft]);

  const hideDeferredResizeIndicator = React.useCallback(() => {
    const indicator = dragIndicatorRef.current;

    if (!indicator) return;

    indicator.style.display = 'none';
    indicator.style.removeProperty('left');
  }, [dragIndicatorRef]);

  const showDeferredResizeIndicator = React.useCallback(
    (offset: number) => {
      const indicator = dragIndicatorRef.current;

      if (!indicator) return;

      indicator.style.display = 'block';
      indicator.style.left = `${offset}px`;
    },
    [dragIndicatorRef]
  );

  const hideResizeIndicator = React.useCallback(() => {
    const indicator = hoverIndicatorRef.current;

    if (!indicator) return;

    indicator.style.display = 'none';
    indicator.style.removeProperty('left');
  }, [hoverIndicatorRef]);

  const clearFrozenRowHeights = React.useCallback(() => {
    const frozenRowIndices = frozenRowIndicesRef.current;

    if (!frozenRowIndices) return;

    frozenRowIndicesRef.current = null;

    frozenRowIndices.forEach((rowIndex) => {
      overrideRowSize(rowIndex, null);
    });
  }, [overrideRowSize]);

  const freezeRowHeights = React.useCallback(() => {
    const table = tableRef.current;

    if (!table || deferColumnResize) return;

    clearFrozenRowHeights();

    const frozenRowIndices: number[] = [];

    Array.from(table.rows).forEach((row, rowIndex) => {
      const { height } = row.getBoundingClientRect();

      if (!height) return;

      overrideRowSize(rowIndex, height);
      frozenRowIndices.push(rowIndex);
    });

    frozenRowIndicesRef.current = frozenRowIndices;
  }, [clearFrozenRowHeights, deferColumnResize, overrideRowSize, tableRef]);

  const showResizeIndicatorAtOffset = React.useCallback(
    (offset: number) => {
      const indicator = hoverIndicatorRef.current;

      if (!indicator) return;

      indicator.style.display = 'block';
      indicator.style.left = `${offset}px`;
    },
    [hoverIndicatorRef]
  );

  const showResizeIndicator = React.useCallback(
    ({
      event,
      direction,
    }: Pick<TableResizeStartOptions, 'direction'> & {
      event: React.PointerEvent<HTMLDivElement>;
    }) => {
      if (direction === 'bottom') return;

      const wrapper = wrapperRef.current;

      if (!wrapper) return;

      const handleRect = event.currentTarget.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const boundaryOffset =
        handleRect.left - wrapperRect.left + handleRect.width / 2;

      showResizeIndicatorAtOffset(boundaryOffset);
    },
    [showResizeIndicatorAtOffset, wrapperRef]
  );

  const setResizePreview = React.useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      options: TableResizeStartOptions
    ) => {
      if (activeHandleKeyRef.current) return;

      previewHandleKeyRef.current = options.handleKey;
      showResizeIndicator({ ...options, event });
    },
    [showResizeIndicator]
  );

  const clearResizePreview = React.useCallback(
    (handleKey: string) => {
      if (activeHandleKeyRef.current) return;
      if (previewHandleKeyRef.current !== handleKey) return;

      previewHandleKeyRef.current = null;
      hideResizeIndicator();
    },
    [hideResizeIndicator]
  );

  const commitColSize = React.useCallback(
    (colIndex: number, width: number) => {
      getTablePlugin(editor).update.setColumnWidth(
        { colIndex, width },
        { at: tablePath }
      );
      setTimeout(() => {
        overrideColSize(colIndex, null);
      }, 0);
    },
    [editor, overrideColSize, tablePath]
  );

  const commitRowSize = React.useCallback(
    (rowIndex: number, height: number) => {
      getTablePlugin(editor).update.setRowHeight(
        { height, rowIndex },
        { at: tablePath }
      );
      setTimeout(() => {
        overrideRowSize(rowIndex, null);
      }, 0);
    },
    [editor, overrideRowSize, tablePath]
  );

  const commitMarginLeft = React.useCallback(
    (nextMarginLeft: number) => {
      getTablePlugin(editor).update.set(
        { marginLeft: nextMarginLeft },
        { at: tablePath }
      );
      setTimeout(() => {
        overrideMarginLeft(null);
      }, 0);
    },
    [editor, overrideMarginLeft, tablePath]
  );

  const getColumnBoundaryOffset = React.useCallback(
    (colIndex: number, currentWidth: number) =>
      controlColumnWidth +
      effectiveColSizesRef.current
        .slice(0, colIndex)
        .reduce((total, colSize) => total + colSize, 0) +
      currentWidth,
    [controlColumnWidth]
  );

  const applyResize = React.useCallback(
    (event: PointerEvent, finished: boolean) => {
      const dragState = dragStateRef.current;

      if (!dragState) return;

      const currentPosition =
        dragState.direction === 'bottom' ? event.clientY : event.clientX;
      const delta = currentPosition - dragState.initialPosition;

      if (dragState.direction === 'bottom') {
        const newHeight = roundCellSizeToStep(
          dragState.initialSize + delta,
          undefined
        );

        if (finished) {
          commitRowSize(dragState.rowIndex, newHeight);
        } else {
          overrideRowSize(dragState.rowIndex, newHeight);
        }

        return;
      }

      if (dragState.direction === 'left') {
        const initial =
          effectiveColSizesRef.current[dragState.colIndex] ??
          dragState.initialSize;
        const complement = (width: number) =>
          initial + dragState.marginLeft - width;
        const nextMarginLeft = roundCellSizeToStep(
          resizeLengthClampStatic(dragState.marginLeft + delta, {
            max: complement(minColumnWidth),
            min: 0,
          }),
          undefined
        );
        const nextWidth = complement(nextMarginLeft);

        if (finished) {
          commitMarginLeft(nextMarginLeft);
          commitColSize(dragState.colIndex, nextWidth);
        } else if (deferColumnResize) {
          showDeferredResizeIndicator(
            controlColumnWidth + (nextMarginLeft - dragState.marginLeft)
          );
        } else {
          showResizeIndicatorAtOffset(
            controlColumnWidth + (nextMarginLeft - dragState.marginLeft)
          );
          overrideMarginLeft(nextMarginLeft);
          overrideColSize(dragState.colIndex, nextWidth);
        }

        return;
      }

      const currentInitial =
        effectiveColSizesRef.current[dragState.colIndex] ??
        dragState.initialSize;
      const nextInitial = effectiveColSizesRef.current[dragState.colIndex + 1];
      const complement = (width: number) =>
        currentInitial + nextInitial - width;
      const currentWidth = roundCellSizeToStep(
        resizeLengthClampStatic(currentInitial + delta, {
          max: nextInitial ? complement(minColumnWidth) : undefined,
          min: minColumnWidth,
        }),
        undefined
      );
      const nextWidth = nextInitial ? complement(currentWidth) : undefined;

      if (finished) {
        commitColSize(dragState.colIndex, currentWidth);

        if (nextWidth !== undefined) {
          commitColSize(dragState.colIndex + 1, nextWidth);
        }
      } else if (deferColumnResize) {
        showDeferredResizeIndicator(
          getColumnBoundaryOffset(dragState.colIndex, currentWidth)
        );
      } else {
        showResizeIndicatorAtOffset(
          getColumnBoundaryOffset(dragState.colIndex, currentWidth)
        );
        overrideColSize(dragState.colIndex, currentWidth);

        if (nextWidth !== undefined) {
          overrideColSize(dragState.colIndex + 1, nextWidth);
        }
      }
    },
    [
      commitColSize,
      commitMarginLeft,
      commitRowSize,
      controlColumnWidth,
      deferColumnResize,
      getColumnBoundaryOffset,
      showDeferredResizeIndicator,
      showResizeIndicatorAtOffset,
      minColumnWidth,
      overrideColSize,
      overrideMarginLeft,
      overrideRowSize,
    ]
  );

  const stopResize = React.useCallback(() => {
    cleanupListenersRef.current?.();
    cleanupListenersRef.current = null;
    activeHandleKeyRef.current = null;
    previewHandleKeyRef.current = null;
    dragStateRef.current = null;

    if (activeRowElementRef.current) {
      delete activeRowElementRef.current.dataset.tableResizing;
      activeRowElementRef.current = null;
    }

    hideDeferredResizeIndicator();
    hideResizeIndicator();
    clearFrozenRowHeights();
  }, [clearFrozenRowHeights, hideDeferredResizeIndicator, hideResizeIndicator]);

  const stopResizeRef = React.useRef(stopResize);

  React.useEffect(() => {
    stopResizeRef.current = stopResize;
  }, [stopResize]);

  React.useEffect(
    () => () => {
      stopResizeRef.current();
    },
    []
  );

  const startResize = React.useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      { colIndex, direction, handleKey, rowIndex }: TableResizeStartOptions
    ) => {
      const rowHeight =
        tableRef.current?.rows.item(rowIndex)?.getBoundingClientRect().height ??
        0;

      dragStateRef.current = {
        colIndex,
        direction,
        initialPosition: direction === 'bottom' ? event.clientY : event.clientX,
        initialSize:
          direction === 'bottom'
            ? rowHeight
            : (effectiveColSizesRef.current[colIndex] ??
              TABLE_DEFAULT_COLUMN_WIDTH),
        marginLeft: marginLeftRef.current,
        rowIndex,
      };
      activeHandleKeyRef.current = handleKey;
      previewHandleKeyRef.current = null;

      const rowElement = tableRef.current?.rows.item(rowIndex) ?? null;

      if (
        activeRowElementRef.current &&
        activeRowElementRef.current !== rowElement
      ) {
        delete activeRowElementRef.current.dataset.tableResizing;
      }

      activeRowElementRef.current = rowElement;

      if (rowElement) {
        rowElement.dataset.tableResizing = 'true';
      }

      cleanupListenersRef.current?.();

      if (direction !== 'bottom') {
        freezeRowHeights();
      }

      const handlePointerMove = (pointerEvent: PointerEvent) => {
        applyResize(pointerEvent, false);
      };

      const handlePointerEnd = (pointerEvent: PointerEvent) => {
        applyResize(pointerEvent, true);
        stopResize();
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerEnd);
      window.addEventListener('pointercancel', handlePointerEnd);

      cleanupListenersRef.current = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerEnd);
        window.removeEventListener('pointercancel', handlePointerEnd);
      };

      if (deferColumnResize && direction !== 'bottom') {
        hideResizeIndicator();
        showDeferredResizeIndicator(
          direction === 'left'
            ? controlColumnWidth
            : getColumnBoundaryOffset(
                colIndex,
                effectiveColSizesRef.current[colIndex] ??
                  TABLE_DEFAULT_COLUMN_WIDTH
              )
        );
      } else {
        showResizeIndicator({ direction, event });
      }

      event.preventDefault();
      event.stopPropagation();
    },
    [
      controlColumnWidth,
      deferColumnResize,
      getColumnBoundaryOffset,
      hideResizeIndicator,
      showDeferredResizeIndicator,
      showResizeIndicator,
      stopResize,
      tableRef,
      applyResize,
      freezeRowHeights,
    ]
  );

  return React.useMemo(
    () => ({
      clearResizePreview,
      disableMarginLeft,
      setResizePreview,
      startResize,
    }),
    [clearResizePreview, disableMarginLeft, setResizePreview, startResize]
  );
}

export function TableElement(props: PlateElementProps<typeof TablePlugin>) {
  return <TableElementContent {...props} />;
}

function TableElementContent({
  children,
  ...props
}: PlateElementProps<typeof TablePlugin>) {
  const editor = useEditor();
  const { api, read, store } = useEditorPlugin(TablePlugin);
  const { disableMarginLeft = false } = store.get();
  const readOnly = useEditorReadOnly();
  const isSelectionAreaVisible = usePluginStore(
    BlockSelectionPlugin,
    'isSelectionAreaVisible'
  );
  const hasControls = !readOnly && !isSelectionAreaVisible;
  const controlColumnWidth = hasControls ? TABLE_CONTROL_COLUMN_WIDTH : 0;
  const dragIndicatorRef = React.useRef<HTMLDivElement>(null);
  const hoverIndicatorRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<HTMLTableElement>(null);
  const [colSizeOverrides, setColSizeOverrides] = React.useState(
    new Map<number, number>()
  );
  const [rowSizeOverrides, setRowHeightOverrides] = React.useState(
    new Map<number, number>()
  );
  const [marginLeftOverride, overrideMarginLeft] = React.useState<
    number | null
  >(null);
  const overrideColSize = React.useCallback(
    (index: number, size: number | null) => {
      setColSizeOverrides((overrides) => {
        const next = new Map(overrides);

        if (size === null) next.delete(index);
        else next.set(index, size);

        return next;
      });
    },
    []
  );
  const overrideRowSize = React.useCallback(
    (index: number, size: number | null) => {
      setRowHeightOverrides((overrides) => {
        const next = new Map(overrides);

        if (size === null) next.delete(index);
        else next.set(index, size);

        return next;
      });
    },
    []
  );
  const marginLeft = disableMarginLeft
    ? 0
    : (marginLeftOverride ?? props.element.marginLeft ?? 0);
  const columnWidths = api.getOverriddenColumnSizes(
    props.element,
    colSizeOverrides
  );
  const baseColSizes = api.getOverriddenColumnSizes(props.element);

  useTableSelectionDOM(tableRef);
  const deferColumnResize =
    (columnWidths?.length ?? 0) * (props.element.children?.length ?? 0) >
    TABLE_DEFERRED_COLUMN_RESIZE_CELL_COUNT;
  const tablePath = useElementSelector(TablePlugin, ([, path]) => path);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const tableNodeKey = props.editor.key(props.element);
  const dragCellKey = useEditorSelector((innerEditor) => {
    const view = getTableRead(innerEditor).getSelection();

    if (
      !view?.complete ||
      view.grid.problems.length > 0 ||
      view.tableKey !== tableNodeKey ||
      view.anchors.length <= 1 ||
      view.cellKeys.length !== view.anchors.length
    ) {
      return null;
    }

    return view.cellKeys[0] ?? null;
  });
  const resizeController = useTableResizeController({
    baseColSizes,
    controlColumnWidth,
    deferColumnResize,
    dragIndicatorRef,
    hoverIndicatorRef,
    marginLeft,
    overrideColSize,
    overrideMarginLeft,
    overrideRowSize,
    tablePath,
    tableRef,
    wrapperRef,
  });
  const tableResizeContext = React.useMemo(
    () => ({
      ...resizeController,
      colSizeOverrides,
      dragCellKey,
      marginLeftOverride,
      rowSizeOverrides,
    }),
    [
      colSizeOverrides,
      dragCellKey,
      marginLeftOverride,
      resizeController,
      rowSizeOverrides,
    ]
  );
  const resolvedColSizes = React.useMemo(() => {
    if (columnWidths && columnWidths.length > 0) {
      return columnWidths.map(
        (colSize) => colSize || TABLE_DEFAULT_COLUMN_WIDTH
      );
    }

    return Array.from(
      { length: api.getColumnCount(props.element) },
      () => TABLE_DEFAULT_COLUMN_WIDTH
    );
  }, [api, columnWidths, props.element]);
  const tableStyle = React.useMemo(
    () => ({
      width: `${
        resolvedColSizes.reduce((total, colSize) => total + colSize, 0) +
        controlColumnWidth
      }px`,
    }),
    [controlColumnWidth, resolvedColSizes]
  );

  const isSelectingTable = useBlockSelected(tableNodeKey);

  const content = (
    <PlateElement
      {...props}
      className={cn(
        'overflow-x-auto py-5',
        hasControls && '-ml-2 *:data-[slot=block-selection]:left-2'
      )}
      style={{ paddingLeft: marginLeft }}
    >
      <TableResizeContext value={tableResizeContext}>
        <div ref={wrapperRef} className="group/table relative w-fit">
          <div
            ref={dragIndicatorRef}
            className="pointer-events-none absolute inset-y-0 z-36 hidden w-[3px] -translate-x-[1.5px] bg-ring/70"
            contentEditable={false}
          />
          <div
            ref={hoverIndicatorRef}
            className="pointer-events-none absolute inset-y-0 z-35 hidden w-[3px] -translate-x-[1.5px] bg-ring/80"
            contentEditable={false}
          />
          {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- [P0 behavior-boundary] The table only intercepts pointer propagation from its owned drag handle; it is not an interactive control. */}
          <table
            ref={tableRef}
            className="mr-0 ml-px table h-px table-fixed border-collapse"
            style={tableStyle}
            onMouseDown={(event) => {
              if (
                (event.target as Element).closest(
                  '[data-table-cell-drag-handle="true"]'
                )
              ) {
                event.stopPropagation();

                return;
              }

              if (read.isSelectingCell()) {
                editor.update.selection.collapse();
              }
            }}
            onPointerDown={(event) => {
              if (
                (event.target as Element).closest(
                  '[data-table-cell-drag-handle="true"]'
                )
              ) {
                event.stopPropagation();
              }
            }}
          >
            {resolvedColSizes.length > 0 && (
              <colgroup>
                {hasControls && (
                  <col
                    style={{
                      maxWidth: TABLE_CONTROL_COLUMN_WIDTH,
                      minWidth: TABLE_CONTROL_COLUMN_WIDTH,
                      width: TABLE_CONTROL_COLUMN_WIDTH,
                    }}
                  />
                )}
                {resolvedColSizes.map((colSize, index) => (
                  <col
                    key={index}
                    style={{
                      maxWidth: colSize,
                      minWidth: colSize,
                      width: colSize,
                    }}
                  />
                ))}
              </colgroup>
            )}
            <tbody className="min-w-full">{children}</tbody>
          </table>

          {isSelectingTable && (
            <div className={blockSelectionVariants()} contentEditable={false} />
          )}
        </div>
      </TableResizeContext>
    </PlateElement>
  );

  if (readOnly) {
    return content;
  }

  return <TableFloatingToolbar>{content}</TableFloatingToolbar>;
}

function TableFloatingToolbar({
  children,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  const selectedCellCount = useEditorSelector(
    (editor) => getTableRead(editor).getSelectedCellKeys()?.length ?? 0
  );
  const selected = useElementSelected();
  const collapsedInside = useEditorSelector(
    (editor) => selected && editor.read.selection.isCollapsed()
  );
  const isFocusedLast = useFocusedLast();
  const isCollapsedToolbarOpen = isFocusedLast && collapsedInside;
  const isExpandedSelectionPending =
    isFocusedLast && !collapsedInside && selectedCellCount > 1;
  const isToolbarOpen = isCollapsedToolbarOpen || isExpandedSelectionPending;

  return (
    <Popover open={isToolbarOpen} modal={false}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      {isCollapsedToolbarOpen && (
        <CollapsedTableFloatingToolbarContent {...props} />
      )}
      {isExpandedSelectionPending && (
        <DelayedExpandedSelectionTableFloatingToolbarContent {...props} />
      )}
    </Popover>
  );
}

function DelayedExpandedSelectionTableFloatingToolbarContent(
  props: React.ComponentProps<typeof PopoverContent>
) {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsReady(true);
    }, TABLE_MULTI_SELECTION_TOOLBAR_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!isReady) return null;

  return <ExpandedSelectionTableFloatingToolbarContent {...props} />;
}

function ExpandedSelectionTableFloatingToolbarContent(
  props: React.ComponentProps<typeof PopoverContent>
) {
  const editor = useEditor();
  const disableMerge = usePluginStore(TablePlugin, 'disableMerge');
  const canMerge = useEditorSelector(
    (innerEditor2) =>
      !disableMerge && innerEditor2.plugin(TablePlugin).read.canMerge()
  );
  const canSplit = useEditorSelector(
    (innerEditor3) =>
      !disableMerge && innerEditor3.plugin(TablePlugin).read.canSplit()
  );

  if (!canMerge && !canSplit) return null;

  return (
    <TableFloatingToolbarContent
      canMerge={canMerge}
      canSplit={canSplit}
      onMerge={() => {
        getTablePlugin(editor).update.merge();
      }}
      onSplit={() => {
        getTablePlugin(editor).update.split();
      }}
      {...props}
    />
  );
}

function CollapsedTableFloatingToolbarContent(
  props: React.ComponentProps<typeof PopoverContent>
) {
  const editor = useEditor();
  const element = useElement(TablePlugin);
  const disableMerge = usePluginStore(TablePlugin, 'disableMerge');
  const canSplit = useEditorSelector(
    (innerEditor4) =>
      !disableMerge && innerEditor4.plugin(TablePlugin).read.canSplit()
  );

  return (
    <TableFloatingToolbarContent
      canSplit={canSplit}
      collapsedInside
      onDeleteTable={() => {
        editor.update.nodes.remove({ at: element });
        editor.api.dom.focus();
      }}
      onDeleteColumn={() => {
        getTablePlugin(editor).update.removeColumn();
      }}
      onDeleteRow={() => {
        getTablePlugin(editor).update.removeRow();
      }}
      onInsertColumnAfter={() => {
        getTablePlugin(editor).update.insertColumn();
      }}
      onInsertColumnBefore={() => {
        getTablePlugin(editor).update.insertColumn({ before: true });
      }}
      onInsertRowAfter={() => {
        getTablePlugin(editor).update.insertRow();
      }}
      onInsertRowBefore={() => {
        getTablePlugin(editor).update.insertRow({ before: true });
      }}
      onSplit={() => {
        getTablePlugin(editor).update.split();
      }}
      {...props}
    />
  );
}

function TableFloatingToolbarContent({
  canMerge = false,
  canSplit = false,
  collapsedInside = false,
  onDeleteColumn,
  onDeleteRow,
  onDeleteTable,
  onInsertColumnAfter,
  onInsertColumnBefore,
  onInsertRowAfter,
  onInsertRowBefore,
  onMerge,
  onSplit,
  ...props
}: React.ComponentProps<typeof PopoverContent> & {
  canMerge?: boolean;
  canSplit?: boolean;
  collapsedInside?: boolean;
  onDeleteColumn?: () => void;
  onDeleteRow?: () => void;
  onDeleteTable?: () => void;
  onInsertColumnAfter?: () => void;
  onInsertColumnBefore?: () => void;
  onInsertRowAfter?: () => void;
  onInsertRowBefore?: () => void;
  onMerge?: () => void;
  onSplit?: () => void;
}) {
  return (
    <PopoverContent
      asChild
      onOpenAutoFocus={(e) => {
        e.preventDefault();
      }}
      contentEditable={false}
      {...props}
    >
      <Toolbar
        className="scrollbar-hide flex w-auto max-w-[80vw] flex-row overflow-x-auto rounded-md border bg-popover p-1 shadow-md print:hidden"
        contentEditable={false}
      >
        <ToolbarGroup>
          <ColorDropdownMenu tooltip="Background color">
            <PaintBucketIcon />
          </ColorDropdownMenu>
          {canMerge && onMerge && (
            <ToolbarButton
              aria-label="Merge cells"
              onClick={onMerge}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              tooltip="Merge cells"
            >
              <CombineIcon />
            </ToolbarButton>
          )}
          {canSplit && onSplit && (
            <ToolbarButton
              aria-label="Split cell"
              onClick={onSplit}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              tooltip="Split cell"
            >
              <SquareSplitHorizontalIcon />
            </ToolbarButton>
          )}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <ToolbarButton aria-label="Cell borders" tooltip="Cell borders">
                <Grid2X2Icon />
              </ToolbarButton>
            </DropdownMenuTrigger>

            <DropdownMenuPortal>
              <TableBordersDropdownMenuContent />
            </DropdownMenuPortal>
          </DropdownMenu>

          {collapsedInside && (
            <ToolbarGroup>
              <ToolbarButton
                aria-label="Delete table"
                onClick={onDeleteTable}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                tooltip="Delete table"
              >
                <Trash2Icon />
              </ToolbarButton>
            </ToolbarGroup>
          )}
        </ToolbarGroup>

        {collapsedInside && (
          <ToolbarGroup>
            <ToolbarButton
              aria-label="Insert row before"
              onClick={onInsertRowBefore}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              tooltip="Insert row before"
            >
              <ArrowUp />
            </ToolbarButton>
            <ToolbarButton
              aria-label="Insert row after"
              onClick={onInsertRowAfter}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              tooltip="Insert row after"
            >
              <ArrowDown />
            </ToolbarButton>
            <ToolbarButton
              aria-label="Delete row"
              onClick={onDeleteRow}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              tooltip="Delete row"
            >
              <XIcon />
            </ToolbarButton>
          </ToolbarGroup>
        )}

        {collapsedInside && (
          <ToolbarGroup>
            <ToolbarButton
              aria-label="Insert column before"
              onClick={onInsertColumnBefore}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              tooltip="Insert column before"
            >
              <ArrowLeft />
            </ToolbarButton>
            <ToolbarButton
              aria-label="Insert column after"
              onClick={onInsertColumnAfter}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              tooltip="Insert column after"
            >
              <ArrowRight />
            </ToolbarButton>
            <ToolbarButton
              aria-label="Delete column"
              onClick={onDeleteColumn}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              tooltip="Delete column"
            >
              <XIcon />
            </ToolbarButton>
          </ToolbarGroup>
        )}
      </Toolbar>
    </PopoverContent>
  );
}

function TableBordersDropdownMenuContent(
  props: React.ComponentProps<typeof DropdownMenuContent>
) {
  const editor = useEditor();
  const borderStates = useEditorSelector((innerEditor5) =>
    getTableRead(innerEditor5).getSelectedCellsBorders()
  );

  return (
    <DropdownMenuContent
      className="min-w-[220px]"
      onCloseAutoFocus={(e) => {
        e.preventDefault();
        editor.api.dom.focus();
      }}
      align="start"
      side="right"
      sideOffset={0}
      {...props}
    >
      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem
          checked={borderStates.top}
          onCheckedChange={() => {
            getTablePlugin(editor).update.toggleBorders({ border: 'top' });
          }}
        >
          <BorderTopIcon />
          <div>Top Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={borderStates.right}
          onCheckedChange={() => {
            getTablePlugin(editor).update.toggleBorders({ border: 'right' });
          }}
        >
          <BorderRightIcon />
          <div>Right Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={borderStates.bottom}
          onCheckedChange={() => {
            getTablePlugin(editor).update.toggleBorders({ border: 'bottom' });
          }}
        >
          <BorderBottomIcon />
          <div>Bottom Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={borderStates.left}
          onCheckedChange={() => {
            getTablePlugin(editor).update.toggleBorders({ border: 'left' });
          }}
        >
          <BorderLeftIcon />
          <div>Left Border</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>

      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem
          checked={borderStates.none}
          onCheckedChange={() => {
            getTablePlugin(editor).update.toggleBorders({ border: 'none' });
          }}
        >
          <BorderNoneIcon />
          <div>No Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={borderStates.outer}
          onCheckedChange={() => {
            getTablePlugin(editor).update.toggleBorders({ border: 'outer' });
          }}
        >
          <BorderAllIcon />
          <div>Outside Borders</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
}

function ColorDropdownMenu({
  children,
  tooltip,
}: {
  children: React.ReactNode;
  tooltip: string;
}) {
  const [open, setOpen] = React.useState(false);

  const editor = useEditor();

  const onUpdateColor = React.useCallback(
    (color: string) => {
      setOpen(false);
      getTablePlugin(editor).update.setCellBackground({
        color,
        selectedCells: getTableRead(editor).getSelectedCells() ?? [],
      });
    },
    [editor]
  );

  const onClearColor = React.useCallback(() => {
    setOpen(false);
    getTablePlugin(editor).update.setCellBackground({
      color: null,
      selectedCells: getTableRead(editor).getSelectedCells() ?? [],
    });
  }, [editor]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton aria-label={tooltip} tooltip={tooltip}>
          {children}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <ToolbarMenuGroup label="Colors">
          <ColorDropdownMenuItems
            className="px-2"
            colors={DEFAULT_COLORS}
            updateColor={onUpdateColor}
          />
        </ToolbarMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem className="p-2" onClick={onClearColor}>
            <EraserIcon />
            <span>Clear</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TableRowElement({
  children,
  ...props
}: PlateElementProps<typeof TableRowPlugin>) {
  const { element } = props;
  const readOnly = useEditorReadOnly();
  const rowIndex = useElementSelector(TableRowPlugin, ([, path]) => {
    const index = path.at(-1);

    if (index === undefined) {
      throw new Error('Table row path must include an index.');
    }

    return index;
  });
  const rowSize = useElementSelector(TableRowPlugin, ([node]) => node.height);
  const { rowSizeOverrides } = useTableResizeContext();
  const rowMinHeight = rowSizeOverrides.get(rowIndex) ?? rowSize;
  const isSelectionAreaVisible = usePluginStore(
    BlockSelectionPlugin,
    'isSelectionAreaVisible'
  );
  const hasControls = !readOnly && !isSelectionAreaVisible;

  const { isDragging, nodeRef, previewRef, handleRef } = useDraggable({
    element,
    type: element.type,
    canDropNode: ({ dragEntry, dropEntry }) =>
      PathApi.equals(
        PathApi.parent(dragEntry[1]),
        PathApi.parent(dropEntry[1])
      ),
    onDropHandler: (editor, { dragItem }) => {
      if (!('key' in dragItem)) return;
      const key = Array.isArray(dragItem.key) ? dragItem.key[0] : dragItem.key;

      if (key) {
        const path = editor.read.nodes.path(key);

        if (!path) return;

        const range = editor.read.ranges.get(path);

        if (!range) return;

        editor.update.selection.set(range);
        editor.api.dom.focus();
      }
    },
  });

  return (
    <PlateElement
      {...props}
      ref={useComposedRef(props.ref, previewRef, nodeRef)}
      as="tr"
      className={cn('group/row', isDragging && 'opacity-50')}
      style={
        {
          '--tableRowMinHeight': rowMinHeight ? `${rowMinHeight}px` : undefined,
        } as React.CSSProperties
      }
    >
      {hasControls && (
        <td
          className="w-2 max-w-2 min-w-2 p-0 select-none"
          contentEditable={false}
        >
          <RowDragHandle dragRef={handleRef} />
          <RowDropLine />
        </td>
      )}

      {children}
    </PlateElement>
  );
}

function RowDragHandle({ dragRef }: { dragRef: React.Ref<HTMLButtonElement> }) {
  const editor = useEditor();
  const element = useElement(TableRowPlugin);

  return (
    <Button
      ref={dragRef}
      aria-label="Select or move row"
      variant="outline"
      className={cn(
        '-translate-y-1/2 absolute top-1/2 left-0 z-51 h-6 w-4 p-0 focus-visible:ring-0 focus-visible:ring-offset-0',
        'cursor-grab active:cursor-grabbing',
        'opacity-0 transition-opacity duration-100 group-hover/row:opacity-100 group-data-[table-resizing=true]/row:opacity-0'
      )}
      onClick={() => {
        const range = editor.read.ranges.get(element);

        if (!range) return;

        editor.update.selection.set(range);
        editor.api.dom.focus();
      }}
    >
      <GripVertical className="text-muted-foreground" />
    </Button>
  );
}

function RowDropLine() {
  const { dropLine } = useDropLine();

  if (!dropLine) return null;

  return (
    <div
      className={cn(
        'absolute inset-x-0 left-2 z-50 h-0.5 bg-brand/50',
        dropLine === 'top' ? '-top-px' : '-bottom-px'
      )}
    />
  );
}

export function TableCellElement(
  props: PlateElementProps<typeof TableCellPlugin>
) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const { element } = props;
  const { dragCellKey } = useTableResizeContext();
  const isHeader = element.header === true;
  const cellKey = editor.key(element);

  const tableKey = useElementSelector(TablePlugin, ([node]) =>
    editor.key(node)
  );
  const rowKey = useElementSelector(TableRowPlugin, ([node]) =>
    editor.key(node)
  );
  const isSelectingTable = useBlockSelected(tableKey);
  const isSelectingRow = useBlockSelected(rowKey) || isSelectingTable;
  const isSelectionAreaVisible = usePluginStore(
    BlockSelectionPlugin,
    'isSelectionAreaVisible'
  );
  const cellIndices = useEditorSelector(
    (innerEditor6) =>
      innerEditor6.plugin(TablePlugin).read.getCellIndices(element),
    {
      equalityFn: (next, previous) =>
        next?.col === previous?.col && next?.row === previous?.row,
      shouldUpdate: (change) =>
        !change ||
        change.changed.hasAny('properties') ||
        change.changed.hasAny('structure') ||
        change.changed.hasAny('replace') ||
        change.changed.hasAny('root-order'),
    }
  );
  const indices = cellIndices ?? { col: 0, row: 0 };
  const table = editor.plugin(TablePlugin);
  const borders = table.read.getCellBorders({
    cellIndices: indices,
    element,
  });
  const colSpan = table.api.getColSpan(element);
  const rowSpan = table.api.getRowSpan(element);
  const colIndex = indices.col + colSpan - 1;
  const rowIndex = indices.row + rowSpan - 1;

  return (
    <PlateElement
      {...props}
      as={isHeader ? 'th' : 'td'}
      className={cn(
        'relative h-full overflow-visible border-none bg-background p-0',
        element.backgroundColor ? 'bg-(--cellBackground)' : 'bg-background',
        isHeader && 'text-left *:m-0',
        'before:size-full',
        'data-[table-cell-selected=true]:before:z-10',
        'data-[table-cell-selected=true]:before:bg-brand/5',
        "before:absolute before:box-border before:select-none before:content-['']",
        borders.bottom?.width && 'before:border-b before:border-b-border',
        borders.right?.width && 'before:border-r before:border-r-border',
        borders.left?.width && 'before:border-l before:border-l-border',
        borders.top?.width && 'before:border-t before:border-t-border'
      )}
      style={
        {
          '--cellBackground': element.backgroundColor,
        } as React.CSSProperties
      }
      attributes={{
        ...props.attributes,
        colSpan,
        rowSpan,
      }}
    >
      <div
        className="relative z-20 box-border h-full px-3 py-2"
        style={
          rowSpan === 1
            ? { minHeight: 'var(--tableRowMinHeight, 0px)' }
            : undefined
        }
      >
        {props.children}
      </div>

      {!readOnly && dragCellKey === cellKey && (
        <button
          aria-label="Move selected cells"
          className="absolute top-1/2 left-6 z-40 flex h-6 w-4 -translate-y-1/2 cursor-grab items-center justify-center rounded-sm border bg-background text-muted-foreground shadow-sm active:cursor-grabbing"
          contentEditable={false}
          data-table-cell-drag-for={dragCellKey}
          data-table-cell-drag-handle="true"
          draggable
          type="button"
        >
          <GripVertical className="size-3" />
        </button>
      )}

      {!readOnly && !isSelectionAreaVisible && (
        <TableCellResizeControls colIndex={colIndex} rowIndex={rowIndex} />
      )}

      {isSelectingRow && (
        <div className={blockSelectionVariants()} contentEditable={false} />
      )}
    </PlateElement>
  );
}

function TableCellResizeControls({
  colIndex,
  rowIndex,
}: {
  colIndex: number;
  rowIndex: number;
}) {
  const {
    clearResizePreview,
    disableMarginLeft,
    setResizePreview,
    startResize,
  } = useTableResizeContext();
  const rightHandleKey = `right:${rowIndex}:${colIndex}`;
  const bottomHandleKey = `bottom:${rowIndex}:${colIndex}`;
  const leftHandleKey = `left:${rowIndex}:${colIndex}`;
  const isLeftHandle = colIndex === 0 && !disableMarginLeft;

  return (
    <div
      className="group/resize pointer-events-none absolute inset-0 z-30 select-none"
      contentEditable={false}
      suppressContentEditableWarning={true}
    >
      <div
        className="pointer-events-auto absolute -top-2 -right-1 z-40 h-[calc(100%_+_8px)] w-2 cursor-col-resize touch-none"
        data-table-resize-handle="column-end"
        onPointerEnter={(event) => {
          setResizePreview(event, {
            colIndex,
            direction: 'right',
            handleKey: rightHandleKey,
            rowIndex,
          });
        }}
        onPointerLeave={() => {
          clearResizePreview(rightHandleKey);
        }}
        onPointerDown={(event) => {
          startResize(event, {
            colIndex,
            direction: 'right',
            handleKey: rightHandleKey,
            rowIndex,
          });
        }}
      />
      <div
        className="pointer-events-auto absolute -bottom-1 left-0 z-40 h-2 w-full cursor-row-resize touch-none"
        onPointerEnter={(event) => {
          setResizePreview(event, {
            colIndex,
            direction: 'bottom',
            handleKey: bottomHandleKey,
            rowIndex,
          });
        }}
        onPointerLeave={() => {
          clearResizePreview(bottomHandleKey);
        }}
        onPointerDown={(event) => {
          startResize(event, {
            colIndex,
            direction: 'bottom',
            handleKey: bottomHandleKey,
            rowIndex,
          });
        }}
      />
      {isLeftHandle && (
        <div
          className="pointer-events-auto absolute top-0 -left-1 z-40 h-full w-2 cursor-col-resize touch-none"
          onPointerEnter={(event) => {
            setResizePreview(event, {
              colIndex,
              direction: 'left',
              handleKey: leftHandleKey,
              rowIndex,
            });
          }}
          onPointerLeave={() => {
            clearResizePreview(leftHandleKey);
          }}
          onPointerDown={(event) => {
            startResize(event, {
              colIndex,
              direction: 'left',
              handleKey: leftHandleKey,
              rowIndex,
            });
          }}
        />
      )}
    </div>
  );
}

export const TableKit = [
  TablePlugin.configure({ component: TableElement }),
  TableRowPlugin.configure({ component: TableRowElement }),
  TableCellPlugin.configure({ component: TableCellElement }),
];

function BorderAllIcon(props: LucideProps) {
  return (
    <svg
      fill="none"
      height="15"
      viewBox="0 0 15 15"
      width="15"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Border All</title>
      <path
        clipRule="evenodd"
        d="M0.25 1C0.25 0.585786 0.585786 0.25 1 0.25H14C14.4142 0.25 14.75 0.585786 14.75 1V14C14.75 14.4142 14.4142 14.75 14 14.75H1C0.585786 14.75 0.25 14.4142 0.25 14V1ZM1.75 1.75V13.25H13.25V1.75H1.75Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="5" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="3" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="7" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="5" y="7" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="3" y="7" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="9" y="7" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="11" y="7" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="9" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="11" />
    </svg>
  );
}

function BorderBottomIcon(props: LucideProps) {
  return (
    <svg
      fill="none"
      height="15"
      viewBox="0 0 15 15"
      width="15"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Border Bottom</title>
      <path
        clipRule="evenodd"
        d="M1 13.25L14 13.25V14.75L1 14.75V13.25Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="5" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="13" y="5" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="3" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="13" y="3" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="7" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="1" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="13" y="7" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="13" y="1" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="5" y="7" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="5" y="1" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="3" y="7" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="3" y="1" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="9" y="7" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="9" y="1" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="11" y="7" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="11" y="1" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="9" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="13" y="9" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="11" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="13" y="11" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="1" y="5" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="1" y="3" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="1" y="7" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="1" y="1" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="1" y="9" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="1" y="11" />
    </svg>
  );
}

function BorderLeftIcon(props: LucideProps) {
  return (
    <svg
      fill="none"
      height="15"
      viewBox="0 0 15 15"
      width="15"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Border Left</title>
      <path
        clipRule="evenodd"
        d="M1.75 1L1.75 14L0.249999 14L0.25 1L1.75 1Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 10 7)"
        width="1"
        x="10"
        y="7"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 10 13)"
        width="1"
        x="10"
        y="13"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 12 7)"
        width="1"
        x="12"
        y="7"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 12 13)"
        width="1"
        x="12"
        y="13"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 8 7)"
        width="1"
        x="8"
        y="7"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 14 7)"
        width="1"
        x="14"
        y="7"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 8 13)"
        width="1"
        x="8"
        y="13"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 14 13)"
        width="1"
        x="14"
        y="13"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 8 5)"
        width="1"
        x="8"
        y="5"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 14 5)"
        width="1"
        x="14"
        y="5"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 8 3)"
        width="1"
        x="8"
        y="3"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 14 3)"
        width="1"
        x="14"
        y="3"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 8 9)"
        width="1"
        x="8"
        y="9"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 14 9)"
        width="1"
        x="14"
        y="9"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 8 11)"
        width="1"
        x="8"
        y="11"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 14 11)"
        width="1"
        x="14"
        y="11"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 6 7)"
        width="1"
        x="6"
        y="7"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 6 13)"
        width="1"
        x="6"
        y="13"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 4 7)"
        width="1"
        x="4"
        y="7"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 4 13)"
        width="1"
        x="4"
        y="13"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 10 1)"
        width="1"
        x="10"
        y="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 12 1)"
        width="1"
        x="12"
        y="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 8 1)"
        width="1"
        x="8"
        y="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 14 1)"
        width="1"
        x="14"
        y="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 6 1)"
        width="1"
        x="6"
        y="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(90 4 1)"
        width="1"
        x="4"
        y="1"
      />
    </svg>
  );
}

function BorderNoneIcon(props: LucideProps) {
  return (
    <svg
      fill="none"
      height="15"
      viewBox="0 0 15 15"
      width="15"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Border None</title>
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="5.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="13" y="5.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="3.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="13" y="3.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="7.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="13.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="1.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="13" y="7.025" />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        width="1"
        x="13"
        y="13.025"
      />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="13" y="1.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="5" y="7.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="5" y="13.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="5" y="1.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="3" y="7.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="3" y="13.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="3" y="1.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="9" y="7.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="9" y="13.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="9" y="1.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="11" y="7.025" />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        width="1"
        x="11"
        y="13.025"
      />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="11" y="1.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="9.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="13" y="9.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="7" y="11.025" />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        width="1"
        x="13"
        y="11.025"
      />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="1" y="5.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="1" y="3.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="1" y="7.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="1" y="13.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="1" y="1.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="1" y="9.025" />
      <rect fill="currentColor" height="1" rx=".5" width="1" x="1" y="11.025" />
    </svg>
  );
}

function BorderRightIcon(props: LucideProps) {
  return (
    <svg
      fill="none"
      height="15"
      viewBox="0 0 15 15"
      width="15"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Border Right</title>
      <path
        clipRule="evenodd"
        d="M13.25 1L13.25 14L14.75 14L14.75 1L13.25 1Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 5 7)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 5 13)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 3 7)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 3 13)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 7 7)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 1 7)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 7 13)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 1 13)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 7 5)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 1 5)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 7 3)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 1 3)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 7 9)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 1 9)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 7 11)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 1 11)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 9 7)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 9 13)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 11 7)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 11 13)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 5 1)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 3 1)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 7 1)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 1 1)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 9 1)"
        width="1"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="matrix(0 1 1 0 11 1)"
        width="1"
      />
    </svg>
  );
}

function BorderTopIcon(props: LucideProps) {
  return (
    <svg
      fill="none"
      height="15"
      viewBox="0 0 15 15"
      width="15"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Border Top</title>
      <path
        clipRule="evenodd"
        d="M14 1.75L1 1.75L1 0.249999L14 0.25L14 1.75Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 8 10)"
        width="1"
        x="8"
        y="10"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 2 10)"
        width="1"
        x="2"
        y="10"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 8 12)"
        width="1"
        x="8"
        y="12"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 2 12)"
        width="1"
        x="2"
        y="12"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 8 8)"
        width="1"
        x="8"
        y="8"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 8 14)"
        width="1"
        x="8"
        y="14"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 2 8)"
        width="1"
        x="2"
        y="8"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 2 14)"
        width="1"
        x="2"
        y="14"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 10 8)"
        width="1"
        x="10"
        y="8"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 10 14)"
        width="1"
        x="10"
        y="14"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 12 8)"
        width="1"
        x="12"
        y="8"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 12 14)"
        width="1"
        x="12"
        y="14"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 6 8)"
        width="1"
        x="6"
        y="8"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 6 14)"
        width="1"
        x="6"
        y="14"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 4 8)"
        width="1"
        x="4"
        y="8"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 4 14)"
        width="1"
        x="4"
        y="14"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 8 6)"
        width="1"
        x="8"
        y="6"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 2 6)"
        width="1"
        x="2"
        y="6"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 8 4)"
        width="1"
        x="8"
        y="4"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 2 4)"
        width="1"
        x="2"
        y="4"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 14 10)"
        width="1"
        x="14"
        y="10"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 14 12)"
        width="1"
        x="14"
        y="12"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 14 8)"
        width="1"
        x="14"
        y="8"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 14 14)"
        width="1"
        x="14"
        y="14"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 14 6)"
        width="1"
        x="14"
        y="6"
      />
      <rect
        fill="currentColor"
        height="1"
        rx=".5"
        transform="rotate(-180 14 4)"
        width="1"
        x="14"
        y="4"
      />
    </svg>
  );
}
