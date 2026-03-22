'use client';

import { useDraggable, useDropLine } from '@platejs/dnd';
import { resizeLengthClampStatic } from '@platejs/resizable';
import {
  BlockSelectionPlugin,
  useBlockSelected,
} from '@platejs/selection/react';
import {
  getTableColumnCount,
  setCellBackground,
  setTableColSize,
  setTableMarginLeft,
  setTableRowSize,
} from '@platejs/table';
import {
  roundCellSizeToStep,
  TablePlugin,
  TableProvider,
  useCellIndices,
  useOverrideColSize,
  useOverrideMarginLeft,
  useOverrideRowSize,
  useTableBordersDropdownMenuContentState,
  useTableCellBorders,
  useTableColSizes,
  useTableElement,
  useTableMergeState,
  useTableSelectionDom,
  useTableValue,
} from '@platejs/table/react';
import {
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
import {
  KEYS,
  PathApi,
  type TElement,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
} from 'platejs';
import {
  PlateElement,
  type PlateElementProps,
  useComposedRef,
  useEditorPlugin,
  useEditorRef,
  useEditorSelector,
  useElement,
  useElementSelector,
  useFocusedLast,
  usePluginOption,
  useReadOnly,
  useRemoveNodeButton,
  useSelected,
  withHOC,
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
  BorderAllIcon,
  BorderBottomIcon,
  BorderLeftIcon,
  BorderNoneIcon,
  BorderRightIcon,
  BorderTopIcon,
} from './table-icons';
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
  disableMarginLeft: boolean;
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
  deferColumnResize,
  dragIndicatorRef,
  hoverIndicatorRef,
  marginLeft,
  controlColumnWidth,
  tablePath,
  tableRef,
  wrapperRef,
}: {
  deferColumnResize: boolean;
  dragIndicatorRef: React.RefObject<HTMLDivElement | null>;
  hoverIndicatorRef: React.RefObject<HTMLDivElement | null>;
  marginLeft: number;
  controlColumnWidth: number;
  tablePath: number[];
  tableRef: React.RefObject<HTMLTableElement | null>;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { editor, getOptions } = useEditorPlugin(TablePlugin);
  const { disableMarginLeft = false, minColumnWidth = 0 } = getOptions();
  const colSizes = useTableColSizes({
    disableOverrides: true,
  });
  const effectiveColSizes = React.useMemo(
    () => colSizes.map((colSize) => colSize || TABLE_DEFAULT_COLUMN_WIDTH),
    [colSizes]
  );
  const effectiveColSizesRef = React.useRef(effectiveColSizes);
  const activeHandleKeyRef = React.useRef<string | null>(null);
  const activeRowElementRef = React.useRef<HTMLTableRowElement | null>(null);
  const cleanupListenersRef = React.useRef<(() => void) | null>(null);
  const marginLeftRef = React.useRef(marginLeft);
  const dragStateRef = React.useRef<TableResizeDragState | null>(null);
  const frozenRowIndicesRef = React.useRef<number[] | null>(null);
  const previewHandleKeyRef = React.useRef<string | null>(null);
  const overrideColSize = useOverrideColSize();
  const overrideMarginLeft = useOverrideMarginLeft();
  const overrideRowSize = useOverrideRowSize();

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
      const height = row.getBoundingClientRect().height;

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
      setTableColSize(editor, { colIndex, width }, { at: tablePath });
      setTimeout(() => overrideColSize(colIndex, null), 0);
    },
    [editor, overrideColSize, tablePath]
  );

  const commitRowSize = React.useCallback(
    (rowIndex: number, height: number) => {
      setTableRowSize(editor, { height, rowIndex }, { at: tablePath });
      setTimeout(() => overrideRowSize(rowIndex, null), 0);
    },
    [editor, overrideRowSize, tablePath]
  );

  const commitMarginLeft = React.useCallback(
    (nextMarginLeft: number) => {
      setTableMarginLeft(
        editor,
        { marginLeft: nextMarginLeft },
        { at: tablePath }
      );
      setTimeout(() => overrideMarginLeft(null), 0);
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

  React.useEffect(() => stopResize, [stopResize]);

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

export const TableElement = withHOC(
  TableProvider,
  function TableElement({
    children,
    ...props
  }: PlateElementProps<TTableElement>) {
    const readOnly = useReadOnly();
    const isSelectionAreaVisible = usePluginOption(
      BlockSelectionPlugin,
      'isSelectionAreaVisible'
    );
    const hasControls = !readOnly && !isSelectionAreaVisible;
    const { marginLeft, props: tableProps } = useTableElement();
    const colSizes = useTableColSizes();
    const controlColumnWidth = hasControls ? TABLE_CONTROL_COLUMN_WIDTH : 0;
    const dragIndicatorRef = React.useRef<HTMLDivElement>(null);
    const hoverIndicatorRef = React.useRef<HTMLDivElement>(null);
    const deferColumnResize =
      colSizes.length * props.element.children.length >
      TABLE_DEFERRED_COLUMN_RESIZE_CELL_COUNT;
    const tablePath = useElementSelector(([, path]) => path, [], {
      key: KEYS.table,
    });
    const tableRef = React.useRef<HTMLTableElement>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    useTableSelectionDom(tableRef);
    const resizeController = useTableResizeController({
      controlColumnWidth,
      deferColumnResize,
      dragIndicatorRef,
      hoverIndicatorRef,
      marginLeft,
      tablePath,
      tableRef,
      wrapperRef,
    });
    const resolvedColSizes = React.useMemo(() => {
      if (colSizes.length > 0) {
        return colSizes.map((colSize) => colSize || TABLE_DEFAULT_COLUMN_WIDTH);
      }

      return Array.from(
        { length: getTableColumnCount(props.element) },
        () => TABLE_DEFAULT_COLUMN_WIDTH
      );
    }, [colSizes, props.element]);
    const tableVariableStyle = React.useMemo(() => {
      if (resolvedColSizes.length === 0) {
        return;
      }

      return {
        ...Object.fromEntries(
          resolvedColSizes.map((colSize, index) => [
            `--table-col-${index}`,
            `${colSize}px`,
          ])
        ),
      } as React.CSSProperties;
    }, [resolvedColSizes]);
    const tableStyle = React.useMemo(
      () =>
        ({
          width: `${
            resolvedColSizes.reduce((total, colSize) => total + colSize, 0) +
            controlColumnWidth
          }px`,
        }) as React.CSSProperties,
      [controlColumnWidth, resolvedColSizes]
    );

    const isSelectingTable = useBlockSelected(props.element.id as string);

    const content = (
      <PlateElement
        {...props}
        className={cn(
          'overflow-x-auto py-5',
          hasControls && '-ml-2 *:data-[slot=block-selection]:left-2'
        )}
        style={{ paddingLeft: marginLeft }}
      >
        <TableResizeContext.Provider value={resizeController}>
          <div
            className="group/table relative w-fit"
            ref={wrapperRef}
            style={tableVariableStyle}
          >
            <div
              className="pointer-events-none absolute inset-y-0 z-36 hidden w-[3px] -translate-x-[1.5px] bg-ring/70"
              contentEditable={false}
              ref={dragIndicatorRef}
            />
            <div
              className="pointer-events-none absolute inset-y-0 z-35 hidden w-[3px] -translate-x-[1.5px] bg-ring/80"
              contentEditable={false}
              ref={hoverIndicatorRef}
            />
            <table
              className={cn(
                'mr-0 ml-px table h-px table-fixed border-collapse',
                'data-[table-selecting=true]:[&_*::selection]:!bg-transparent',
                'data-[table-selecting=true]:[&_*::selection]:!text-inherit',
                'data-[table-selecting=true]:[&_*::-moz-selection]:!bg-transparent',
                'data-[table-selecting=true]:[&_*::-moz-selection]:!text-inherit',
                'data-[table-selecting=true]:[&_*]:!caret-transparent'
              )}
              ref={tableRef}
              style={tableStyle}
              {...tableProps}
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
              <div
                className={blockSelectionVariants()}
                contentEditable={false}
              />
            )}
          </div>
        </TableResizeContext.Provider>
      </PlateElement>
    );

    if (readOnly) {
      return content;
    }

    return <TableFloatingToolbar>{content}</TableFloatingToolbar>;
  }
);

function TableFloatingToolbar({
  children,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  const selectedCellCount = useEditorSelector(
    (editor) =>
      editor.getApi(TablePlugin).table.getSelectedCellIds()?.length ?? 0,
    []
  );
  const selected = useSelected();
  const collapsedInside = useEditorSelector(
    (editor) => selected && editor.api.isCollapsed(),
    [selected]
  );
  const isFocusedLast = useFocusedLast();
  const [isExpandedSelectionToolbarReady, setIsExpandedSelectionToolbarReady] =
    React.useState(false);
  const isCollapsedToolbarOpen = isFocusedLast && collapsedInside;
  const isExpandedSelectionPending =
    isFocusedLast && !collapsedInside && selectedCellCount > 1;

  React.useEffect(() => {
    if (!isExpandedSelectionPending) {
      setIsExpandedSelectionToolbarReady(false);

      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsExpandedSelectionToolbarReady(true);
    }, TABLE_MULTI_SELECTION_TOOLBAR_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isExpandedSelectionPending]);

  const shouldRenderExpandedSelectionToolbar =
    isExpandedSelectionToolbarReady && isExpandedSelectionPending;
  const isToolbarOpen =
    isCollapsedToolbarOpen || shouldRenderExpandedSelectionToolbar;

  return (
    <Popover modal={false} open={isToolbarOpen}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      {isCollapsedToolbarOpen && (
        <CollapsedTableFloatingToolbarContent {...props} />
      )}
      {shouldRenderExpandedSelectionToolbar && (
        <ExpandedSelectionTableFloatingToolbarContent {...props} />
      )}
    </Popover>
  );
}

function ExpandedSelectionTableFloatingToolbarContent(
  props: React.ComponentProps<typeof PopoverContent>
) {
  const { tf } = useEditorPlugin(TablePlugin);
  const { canMerge, canSplit } = useTableMergeState();

  if (!canMerge && !canSplit) return null;

  return (
    <TableFloatingToolbarContent
      canMerge={canMerge}
      canSplit={canSplit}
      onMerge={() => tf.table.merge()}
      onSplit={() => tf.table.split()}
      {...props}
    />
  );
}

function CollapsedTableFloatingToolbarContent(
  props: React.ComponentProps<typeof PopoverContent>
) {
  const { tf } = useEditorPlugin(TablePlugin);
  const element = useElement<TTableElement>();
  const { props: buttonProps } = useRemoveNodeButton({ element });
  const { canSplit } = useTableMergeState();

  return (
    <TableFloatingToolbarContent
      buttonProps={buttonProps}
      canSplit={canSplit}
      collapsedInside
      onDeleteColumn={() => {
        tf.remove.tableColumn();
      }}
      onDeleteRow={() => {
        tf.remove.tableRow();
      }}
      onInsertColumnAfter={() => {
        tf.insert.tableColumn();
      }}
      onInsertColumnBefore={() => {
        tf.insert.tableColumn({ before: true });
      }}
      onInsertRowAfter={() => {
        tf.insert.tableRow();
      }}
      onInsertRowBefore={() => {
        tf.insert.tableRow({ before: true });
      }}
      onSplit={() => tf.table.split()}
      {...props}
    />
  );
}

function TableFloatingToolbarContent({
  buttonProps,
  canMerge = false,
  canSplit = false,
  collapsedInside = false,
  onDeleteColumn,
  onDeleteRow,
  onInsertColumnAfter,
  onInsertColumnBefore,
  onInsertRowAfter,
  onInsertRowBefore,
  onMerge,
  onSplit,
  ...props
}: React.ComponentProps<typeof PopoverContent> & {
  buttonProps?: React.ComponentProps<typeof ToolbarButton>;
  canMerge?: boolean;
  canSplit?: boolean;
  collapsedInside?: boolean;
  onDeleteColumn?: () => void;
  onDeleteRow?: () => void;
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
      contentEditable={false}
      onOpenAutoFocus={(e) => e.preventDefault()}
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
              onClick={onMerge}
              onMouseDown={(e) => e.preventDefault()}
              tooltip="Merge cells"
            >
              <CombineIcon />
            </ToolbarButton>
          )}
          {canSplit && onSplit && (
            <ToolbarButton
              onClick={onSplit}
              onMouseDown={(e) => e.preventDefault()}
              tooltip="Split cell"
            >
              <SquareSplitHorizontalIcon />
            </ToolbarButton>
          )}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <ToolbarButton tooltip="Cell borders">
                <Grid2X2Icon />
              </ToolbarButton>
            </DropdownMenuTrigger>

            <DropdownMenuPortal>
              <TableBordersDropdownMenuContent />
            </DropdownMenuPortal>
          </DropdownMenu>

          {collapsedInside && (
            <ToolbarGroup>
              <ToolbarButton tooltip="Delete table" {...buttonProps}>
                <Trash2Icon />
              </ToolbarButton>
            </ToolbarGroup>
          )}
        </ToolbarGroup>

        {collapsedInside && (
          <ToolbarGroup>
            <ToolbarButton
              onClick={onInsertRowBefore}
              onMouseDown={(e) => e.preventDefault()}
              tooltip="Insert row before"
            >
              <ArrowUp />
            </ToolbarButton>
            <ToolbarButton
              onClick={onInsertRowAfter}
              onMouseDown={(e) => e.preventDefault()}
              tooltip="Insert row after"
            >
              <ArrowDown />
            </ToolbarButton>
            <ToolbarButton
              onClick={onDeleteRow}
              onMouseDown={(e) => e.preventDefault()}
              tooltip="Delete row"
            >
              <XIcon />
            </ToolbarButton>
          </ToolbarGroup>
        )}

        {collapsedInside && (
          <ToolbarGroup>
            <ToolbarButton
              onClick={onInsertColumnBefore}
              onMouseDown={(e) => e.preventDefault()}
              tooltip="Insert column before"
            >
              <ArrowLeft />
            </ToolbarButton>
            <ToolbarButton
              onClick={onInsertColumnAfter}
              onMouseDown={(e) => e.preventDefault()}
              tooltip="Insert column after"
            >
              <ArrowRight />
            </ToolbarButton>
            <ToolbarButton
              onClick={onDeleteColumn}
              onMouseDown={(e) => e.preventDefault()}
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
  const editor = useEditorRef();
  const {
    getOnSelectTableBorder,
    hasBottomBorder,
    hasLeftBorder,
    hasNoBorders,
    hasOuterBorders,
    hasRightBorder,
    hasTopBorder,
  } = useTableBordersDropdownMenuContentState();

  return (
    <DropdownMenuContent
      align="start"
      className="min-w-[220px]"
      onCloseAutoFocus={(e) => {
        e.preventDefault();
        editor.tf.focus();
      }}
      side="right"
      sideOffset={0}
      {...props}
    >
      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem
          checked={hasTopBorder}
          onCheckedChange={getOnSelectTableBorder('top')}
        >
          <BorderTopIcon />
          <div>Top Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasRightBorder}
          onCheckedChange={getOnSelectTableBorder('right')}
        >
          <BorderRightIcon />
          <div>Right Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasBottomBorder}
          onCheckedChange={getOnSelectTableBorder('bottom')}
        >
          <BorderBottomIcon />
          <div>Bottom Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasLeftBorder}
          onCheckedChange={getOnSelectTableBorder('left')}
        >
          <BorderLeftIcon />
          <div>Left Border</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>

      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem
          checked={hasNoBorders}
          onCheckedChange={getOnSelectTableBorder('none')}
        >
          <BorderNoneIcon />
          <div>No Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasOuterBorders}
          onCheckedChange={getOnSelectTableBorder('outer')}
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

  const editor = useEditorRef();

  const onUpdateColor = React.useCallback(
    (color: string) => {
      setOpen(false);
      setCellBackground(editor, {
        color,
        selectedCells:
          editor.getApi(TablePlugin).table.getSelectedCells() ?? [],
      });
    },
    [editor]
  );

  const onClearColor = React.useCallback(() => {
    setOpen(false);
    setCellBackground(editor, {
      color: null,
      selectedCells: editor.getApi(TablePlugin).table.getSelectedCells() ?? [],
    });
  }, [editor]);

  return (
    <DropdownMenu modal={false} onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton tooltip={tooltip}>{children}</ToolbarButton>
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
}: PlateElementProps<TTableRowElement>) {
  const { element } = props;
  const readOnly = useReadOnly();
  const editor = useEditorRef();
  const rowIndex = useElementSelector(([, path]) => path.at(-1) as number, [], {
    key: KEYS.tr,
  });
  const rowSize = useElementSelector(
    ([node]) => (node as TTableRowElement).size,
    [],
    {
      key: KEYS.tr,
    }
  );
  const rowSizeOverrides = useTableValue('rowSizeOverrides');
  const rowMinHeight = rowSizeOverrides.get?.(rowIndex) ?? rowSize;
  const isSelectionAreaVisible = usePluginOption(
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
    onDropHandler: (_, { dragItem }) => {
      const dragElement = (dragItem as { element: TElement }).element;

      if (dragElement) {
        editor.tf.select(dragElement);
      }
    },
  });

  return (
    <PlateElement
      {...props}
      as="tr"
      className={cn('group/row', isDragging && 'opacity-50')}
      ref={useComposedRef(props.ref, previewRef, nodeRef)}
      style={
        {
          ...props.style,
          '--tableRowMinHeight': rowMinHeight ? `${rowMinHeight}px` : undefined,
        } as React.CSSProperties
      }
    >
      {hasControls && (
        <td
          className="w-2 min-w-2 max-w-2 select-none p-0"
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

function useTableCellPresentation(element: TTableCellElement) {
  const { api } = useEditorPlugin(TablePlugin);
  const borders = useTableCellBorders({ element });
  const { col, row } = useCellIndices();

  const colSpan = api.table.getColSpan(element);
  const rowSpan = api.table.getRowSpan(element);
  const width = React.useMemo(() => {
    const terms = Array.from(
      { length: colSpan },
      (_, offset) => `var(--table-col-${col + offset}, 120px)`
    );

    return terms.length === 1 ? terms[0]! : `calc(${terms.join(' + ')})`;
  }, [col, colSpan]);

  return {
    borders,
    colIndex: col + colSpan - 1,
    colSpan,
    rowIndex: row + rowSpan - 1,
    rowSpan,
    width,
  };
}

function RowDragHandle({ dragRef }: { dragRef: React.Ref<any> }) {
  const editor = useEditorRef();
  const element = useElement();

  return (
    <Button
      className={cn(
        'absolute top-1/2 left-0 z-51 h-6 w-4 -translate-y-1/2 p-0 focus-visible:ring-0 focus-visible:ring-offset-0',
        'cursor-grab active:cursor-grabbing',
        'opacity-0 transition-opacity duration-100 group-hover/row:opacity-100 group-data-[table-resizing=true]/row:opacity-0'
      )}
      onClick={() => {
        editor.tf.select(element);
      }}
      ref={dragRef}
      variant="outline"
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

export function TableCellElement({
  isHeader,
  ...props
}: PlateElementProps<TTableCellElement> & {
  isHeader?: boolean;
}) {
  const readOnly = useReadOnly();
  const element = props.element;

  const tableId = useElementSelector(([node]) => node.id as string, [], {
    key: KEYS.table,
  });
  const rowId = useElementSelector(([node]) => node.id as string, [], {
    key: KEYS.tr,
  });
  const isSelectingTable = useBlockSelected(tableId);
  const isSelectingRow = useBlockSelected(rowId) || isSelectingTable;
  const isSelectionAreaVisible = usePluginOption(
    BlockSelectionPlugin,
    'isSelectionAreaVisible'
  );

  const { borders, colIndex, colSpan, rowIndex, rowSpan, width } =
    useTableCellPresentation(element);

  return (
    <PlateElement
      {...props}
      as={isHeader ? 'th' : 'td'}
      attributes={{
        ...props.attributes,
        colSpan,
        'data-table-cell-id': element.id,
        rowSpan,
      }}
      className={cn(
        'relative h-full overflow-visible border-none bg-background p-0',
        element.background ? 'bg-(--cellBackground)' : 'bg-background',
        isHeader && 'text-left *:m-0',
        'before:size-full',
        'data-[table-cell-selected=true]:before:z-10',
        'data-[table-cell-selected=true]:before:bg-brand/5',
        "before:absolute before:box-border before:select-none before:content-['']",
        borders.bottom?.size && 'before:border-b before:border-b-border',
        borders.right?.size && 'before:border-r before:border-r-border',
        borders.left?.size && 'before:border-l before:border-l-border',
        borders.top?.size && 'before:border-t before:border-t-border'
      )}
      style={
        {
          '--cellBackground': element.background,
          maxWidth: width,
          minWidth: width,
        } as React.CSSProperties
      }
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

      {!readOnly && !isSelectionAreaVisible && (
        <TableCellResizeControls colIndex={colIndex} rowIndex={rowIndex} />
      )}

      {isSelectingRow && (
        <div className={blockSelectionVariants()} contentEditable={false} />
      )}
    </PlateElement>
  );
}

export function TableCellHeaderElement(
  props: React.ComponentProps<typeof TableCellElement>
) {
  return <TableCellElement {...props} isHeader />;
}

const TableCellResizeControls = React.memo(function TableCellResizeControls({
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
        onPointerDown={(event) => {
          startResize(event, {
            colIndex,
            direction: 'right',
            handleKey: rightHandleKey,
            rowIndex,
          });
        }}
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
      />
      <div
        className="pointer-events-auto absolute -bottom-1 left-0 z-40 h-2 w-full cursor-row-resize touch-none"
        onPointerDown={(event) => {
          startResize(event, {
            colIndex,
            direction: 'bottom',
            handleKey: bottomHandleKey,
            rowIndex,
          });
        }}
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
      />
      {isLeftHandle && (
        <div
          className="pointer-events-auto absolute top-0 -left-1 z-40 h-full w-2 cursor-col-resize touch-none"
          onPointerDown={(event) => {
            startResize(event, {
              colIndex,
              direction: 'left',
              handleKey: leftHandleKey,
              rowIndex,
            });
          }}
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
        />
      )}
    </div>
  );
});

TableCellResizeControls.displayName = 'TableCellResizeControls';
