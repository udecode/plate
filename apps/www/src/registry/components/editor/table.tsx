'use client';

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
import { PathApi } from 'platejs';
import { useDraggable, useDropLine } from 'platejs/dnd/react';
import {
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
  usePath,
} from 'platejs/react';
import {
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
  useTableSelectionDOM,
  useTableResize,
} from 'platejs/table/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import {
  FloatingPopover,
  FloatingPopoverAnchor,
  FloatingPopoverContent,
} from '@/registry/components/editor/floating-popover';
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarMenuGroup,
} from '@/registry/components/editor/toolbar';

import {
  ColorDropdownMenuItems,
  DEFAULT_COLORS,
} from './font-color-toolbar-button';

type TableResizeDirection = 'bottom' | 'left' | 'right';

type TableResizeStartOptions = {
  colIndex: number;
  direction: TableResizeDirection;
  handleKey: string;
  rowIndex: number;
};

type TableResizeContextValue = {
  disableMarginLeft: boolean;
  hasMultiRowSelection: boolean;
  rowSizeOverrides: Map<number, number>;
  clearResizePreview: (handleKey: string) => void;
  showResizePreview: (
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
const TABLE_SELECTION_OVERLAY_CLASS =
  'pointer-events-none absolute inset-0 z-1 bg-brand/[.13]';

const TableNodeSelectionContext = React.createContext(false);

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

const paintIndicator = (
  ref: React.RefObject<HTMLDivElement | null>,
  offset: number | null
) => {
  const indicator = ref.current;

  if (!indicator) return;
  indicator.style.display = offset === null ? 'none' : 'block';
  if (offset === null) indicator.style.removeProperty('left');
  else indicator.style.left = `${offset}px`;
};

export function TableElement(props: PlateElementProps<typeof TablePlugin>) {
  const { children } = props;
  const isSelectingTable = useElementSelected({ mode: 'node' });
  const editor = useEditor();
  const { api, read, store } = useEditorPlugin(TablePlugin);
  const { disableMarginLeft = false } = store.get();
  const readOnly = useEditorReadOnly();
  const hasControls = !readOnly;
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
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const tableNodeKey = props.editor.key(props.element);
  const hasExpandedCellSelection = useEditorSelector((innerEditor) => {
    const view = innerEditor.plugin(TablePlugin).read.selection();

    return Boolean(view?.tableKey === tableNodeKey && view.anchors.length > 1);
  });
  const hasMultiRowSelection = useEditorSelector((innerEditor) => {
    const view = innerEditor.plugin(TablePlugin).read.selection();

    return Boolean(
      view?.complete &&
      view.grid.problems.length === 0 &&
      view.tableKey === tableNodeKey &&
      view.anchors.length > 1 &&
      view.bounds.maxRow > view.bounds.minRow
    );
  });
  const activeHandleKeyRef = React.useRef<string | null>(null);
  const activeRowElementRef = React.useRef<HTMLTableRowElement | null>(null);
  const previewHandleKeyRef = React.useRef<string | null>(null);

  const clearResize = () => {
    activeHandleKeyRef.current = null;
    previewHandleKeyRef.current = null;
    if (activeRowElementRef.current) {
      delete activeRowElementRef.current.dataset.tableResizing;
      activeRowElementRef.current = null;
    }
    paintIndicator(dragIndicatorRef, null);
    paintIndicator(hoverIndicatorRef, null);
    setColSizeOverrides(new Map());
    setRowHeightOverrides(new Map());
    overrideMarginLeft(null);
  };
  const beginResize = useTableResize({
    element: props.element,
    tableRef,
    onResizeEnd: clearResize,
    onResize: (resize) => {
      if (resize.edge === 'bottom') {
        overrideRowSize(resize.rowIndex, resize.height);
        return;
      }

      const first = resize.columns[0];
      const offset =
        resize.marginLeft === undefined
          ? controlColumnWidth +
            baseColSizes
              .slice(0, first.colIndex)
              .reduce((total, width) => total + width, 0) +
            first.width
          : controlColumnWidth + resize.marginLeft - marginLeft;

      paintIndicator(
        deferColumnResize ? dragIndicatorRef : hoverIndicatorRef,
        offset
      );
      if (deferColumnResize) return;
      setColSizeOverrides(
        new Map(resize.columns.map(({ colIndex, width }) => [colIndex, width]))
      );
      if (resize.marginLeft !== undefined) {
        overrideMarginLeft(resize.marginLeft);
      }
    },
  });
  const showResizePreview = React.useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      { direction, handleKey }: TableResizeStartOptions
    ) => {
      if (
        activeHandleKeyRef.current ||
        event.buttons !== 0 ||
        direction === 'bottom'
      ) {
        return;
      }
      const wrapper = wrapperRef.current;

      if (!wrapper) return;
      previewHandleKeyRef.current = handleKey;
      const handleRect = event.currentTarget.getBoundingClientRect();
      paintIndicator(
        hoverIndicatorRef,
        handleRect.left -
          wrapper.getBoundingClientRect().left +
          handleRect.width / 2
      );
    },
    []
  );
  const clearResizePreview = React.useCallback((handleKey: string) => {
    if (
      activeHandleKeyRef.current ||
      previewHandleKeyRef.current !== handleKey
    ) {
      return;
    }
    previewHandleKeyRef.current = null;
    paintIndicator(hoverIndicatorRef, null);
  }, []);
  const startResize = React.useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      { colIndex, direction, handleKey, rowIndex }: TableResizeStartOptions
    ) => {
      if (
        !beginResize(
          event,
          direction === 'bottom'
            ? { edge: 'bottom', rowIndex }
            : direction === 'left'
              ? { edge: 'left' }
              : { edge: 'right', colIndex }
        )
      ) {
        return;
      }

      activeHandleKeyRef.current = handleKey;
      previewHandleKeyRef.current = null;
      const table = tableRef.current;
      const row = table?.rows.item(rowIndex);

      activeRowElementRef.current = row ?? null;
      if (row) row.dataset.tableResizing = 'true';
      if (direction === 'bottom' || !table) return;
      if (!deferColumnResize) {
        setRowHeightOverrides(
          new Map(
            Array.from(table.rows, (entry, index) => [
              index,
              entry.getBoundingClientRect().height,
            ])
          )
        );
      }
      paintIndicator(hoverIndicatorRef, null);
      paintIndicator(
        deferColumnResize ? dragIndicatorRef : hoverIndicatorRef,
        controlColumnWidth +
          (direction === 'left'
            ? 0
            : baseColSizes
                .slice(0, colIndex + 1)
                .reduce((total, width) => total + width, 0))
      );
    },
    [baseColSizes, beginResize, controlColumnWidth, deferColumnResize]
  );
  const tableResizeContext = React.useMemo(
    () => ({
      clearResizePreview,
      disableMarginLeft,
      hasMultiRowSelection,
      rowSizeOverrides,
      showResizePreview,
      startResize,
    }),
    [
      clearResizePreview,
      disableMarginLeft,
      hasMultiRowSelection,
      rowSizeOverrides,
      showResizePreview,
      startResize,
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

  const content = (
    <PlateElement
      {...props}
      attributes={{
        ...props.attributes,
        'data-node-selection-highlight': 'self',
      }}
      className={cn(
        'overflow-x-auto py-5',
        hasControls && '-ml-2 *:data-[slot=node-selection-highlight]:left-2'
      )}
      style={{ paddingLeft: marginLeft }}
    >
      <TableResizeContext value={tableResizeContext}>
        <div
          ref={wrapperRef}
          className="relative w-fit [&:active:not(:has([data-table-resize-handle]:active))_[data-table-resize-handle]]:cursor-text"
        >
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
          {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- [P0 behavior-boundary] A new table interaction collapses the prior expanded cell selection. */}
          <table
            ref={tableRef}
            className={cn(
              'mr-0 ml-px table h-px table-fixed border-collapse',
              hasExpandedCellSelection && '[&_*::selection]:bg-transparent'
            )}
            style={tableStyle}
            onMouseDown={() => {
              if ((read.selection()?.anchors.length ?? 0) > 1) {
                editor.update.selection.collapse();
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
            <tbody className="min-w-full">
              <TableNodeSelectionContext value={isSelectingTable}>
                {children}
              </TableNodeSelectionContext>
            </tbody>
          </table>
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
}: React.ComponentProps<typeof FloatingPopoverContent>) {
  const selectedCellCount = useEditorSelector(
    (editor) =>
      editor.plugin(TablePlugin).read.selection()?.cellKeys.length ?? 0
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
    <FloatingPopover open={isToolbarOpen} modal={false}>
      <FloatingPopoverAnchor element={children as React.ReactElement} />
      {isCollapsedToolbarOpen && (
        <TableFloatingToolbarContent {...props} collapsedInside />
      )}
      {isExpandedSelectionPending && (
        <DelayedExpandedSelectionTableFloatingToolbarContent {...props} />
      )}
    </FloatingPopover>
  );
}

function DelayedExpandedSelectionTableFloatingToolbarContent(
  props: React.ComponentProps<typeof FloatingPopoverContent>
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

  return <TableFloatingToolbarContent {...props} />;
}

function TableFloatingToolbarContent({
  collapsedInside = false,
  ...props
}: React.ComponentProps<typeof FloatingPopoverContent> & {
  collapsedInside?: boolean;
}) {
  const editor = useEditor();
  const element = useElement(TablePlugin);
  const disableMerge = usePluginStore(TablePlugin, 'disableMerge');
  const canMergeSelection = useEditorSelector((innerEditor) =>
    innerEditor.plugin(TablePlugin).read.canMerge()
  );
  const canSplitSelection = useEditorSelector((innerEditor) =>
    innerEditor.plugin(TablePlugin).read.canSplit()
  );
  const canMerge = !collapsedInside && !disableMerge && canMergeSelection;
  const canSplit = !disableMerge && canSplitSelection;

  if (!collapsedInside && !canMerge && !canSplit) return null;

  return (
    <FloatingPopoverContent
      className="w-auto border-0 bg-transparent p-0 shadow-none ring-0"
      onInitialFocus={(e) => {
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
          {canMerge && (
            <ToolbarButton
              aria-label="Merge cells"
              onClick={() => {
                editor.plugin(TablePlugin).update.merge();
              }}
              tooltip="Merge cells"
            >
              <CombineIcon />
            </ToolbarButton>
          )}
          {canSplit && (
            <ToolbarButton
              aria-label="Split cell"
              onClick={() => {
                editor.plugin(TablePlugin).update.split();
              }}
              tooltip="Split cell"
            >
              <SquareSplitHorizontalIcon />
            </ToolbarButton>
          )}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
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
                onClick={() => {
                  editor.update.nodes.remove({ at: element });
                  editor.api.dom.focus();
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
              onClick={() => {
                editor.plugin(TablePlugin).update.insertRow({ before: true });
              }}
              tooltip="Insert row before"
            >
              <ArrowUp />
            </ToolbarButton>
            <ToolbarButton
              aria-label="Insert row after"
              onClick={() => {
                editor.plugin(TablePlugin).update.insertRow();
              }}
              tooltip="Insert row after"
            >
              <ArrowDown />
            </ToolbarButton>
            <ToolbarButton
              aria-label="Delete row"
              onClick={() => {
                editor.plugin(TablePlugin).update.removeRow();
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
              onClick={() => {
                editor
                  .plugin(TablePlugin)
                  .update.insertColumn({ before: true });
              }}
              tooltip="Insert column before"
            >
              <ArrowLeft />
            </ToolbarButton>
            <ToolbarButton
              aria-label="Insert column after"
              onClick={() => {
                editor.plugin(TablePlugin).update.insertColumn();
              }}
              tooltip="Insert column after"
            >
              <ArrowRight />
            </ToolbarButton>
            <ToolbarButton
              aria-label="Delete column"
              onClick={() => {
                editor.plugin(TablePlugin).update.removeColumn();
              }}
              tooltip="Delete column"
            >
              <XIcon />
            </ToolbarButton>
          </ToolbarGroup>
        )}
      </Toolbar>
    </FloatingPopoverContent>
  );
}

function TableBordersDropdownMenuContent(
  props: React.ComponentProps<typeof DropdownMenuContent>
) {
  const editor = useEditor();
  const borderStates = useEditorSelector((innerEditor) =>
    innerEditor.plugin(TablePlugin).read.getSelectedCellsBorders()
  );

  return (
    <DropdownMenuContent
      className="min-w-[220px]"
      onFinalFocus={(e) => {
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
            editor.plugin(TablePlugin).update.toggleBorders({ border: 'top' });
          }}
        >
          <BorderIcon side="top" />
          <div>Top Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={borderStates.right}
          onCheckedChange={() => {
            editor
              .plugin(TablePlugin)
              .update.toggleBorders({ border: 'right' });
          }}
        >
          <BorderIcon side="right" />
          <div>Right Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={borderStates.bottom}
          onCheckedChange={() => {
            editor
              .plugin(TablePlugin)
              .update.toggleBorders({ border: 'bottom' });
          }}
        >
          <BorderIcon side="bottom" />
          <div>Bottom Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={borderStates.left}
          onCheckedChange={() => {
            editor.plugin(TablePlugin).update.toggleBorders({ border: 'left' });
          }}
        >
          <BorderIcon side="left" />
          <div>Left Border</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>

      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem
          checked={borderStates.none}
          onCheckedChange={() => {
            editor.plugin(TablePlugin).update.toggleBorders({ border: 'none' });
          }}
        >
          <BorderIcon side="none" />
          <div>No Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={borderStates.outer}
          onCheckedChange={() => {
            editor
              .plugin(TablePlugin)
              .update.toggleBorders({ border: 'outer' });
          }}
        >
          <BorderIcon side="outer" />
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
      editor.plugin(TablePlugin).update.setCellBackground({ color });
    },
    [editor]
  );

  const onClearColor = React.useCallback(() => {
    setOpen(false);
    editor.plugin(TablePlugin).update.setCellBackground({ color: null });
  }, [editor]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger>
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
  const isSelectingRow = useElementSelected({ mode: 'node' });
  const isSelectingTable = React.useContext(TableNodeSelectionContext);
  const readOnly = useEditorReadOnly();
  const rowIndex = usePath((path) => path.at(-1));

  if (rowIndex === undefined) {
    throw new Error('Table row path must include an index.');
  }
  const rowSize = useElementSelector(TableRowPlugin, (node) => node.height);
  const { hasMultiRowSelection, rowSizeOverrides } = useTableResizeContext();
  const rowMinHeight = rowSizeOverrides.get(rowIndex) ?? rowSize;
  const hasControls = !readOnly;

  const { isDragging, nodeRef, previewRef, handleRef } = useDraggable({
    element,
    type: element.type,
    canDropNode: ({ dragEntry, dropEntry, editor, sourceEditor }) =>
      sourceEditor === editor &&
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
          {!hasMultiRowSelection && (
            <>
              <RowDragHandle dragRef={handleRef} />
              <RowDropLine />
            </>
          )}
        </td>
      )}

      <TableNodeSelectionContext value={isSelectingRow || isSelectingTable}>
        {children}
      </TableNodeSelectionContext>
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
  const isHeader = element.header === true;

  const isSelectingRow = React.useContext(TableNodeSelectionContext);
  const cellIndices = useElementSelector(
    TablePlugin,
    () => editor.plugin(TablePlugin).read.getCellIndices(element),
    {
      equalityFn: (next, previous) =>
        next?.col === previous?.col && next?.row === previous?.row,
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

      {!readOnly && (
        <TableCellResizeControls colIndex={colIndex} rowIndex={rowIndex} />
      )}

      {isSelectingRow && (
        <div
          className={TABLE_SELECTION_OVERLAY_CLASS}
          contentEditable={false}
          data-plite-root-chrome-ignore="true"
          data-slot="node-selection-highlight"
        />
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
    showResizePreview,
    startResize,
  } = useTableResizeContext();
  const rightHandleKey = `right:${rowIndex}:${colIndex}`;
  const bottomHandleKey = `bottom:${rowIndex}:${colIndex}`;
  const leftHandleKey = `left:${rowIndex}:${colIndex}`;
  const isLeftHandle = colIndex === 0 && !disableMarginLeft;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 select-none"
      contentEditable={false}
      data-plite-root-chrome-ignore="true"
      suppressContentEditableWarning={true}
    >
      <div
        className="pointer-events-auto absolute -top-2 -right-1 z-40 h-[calc(100%_+_8px)] w-2 cursor-col-resize touch-none"
        data-table-resize-handle="column-end"
        onPointerEnter={(event) => {
          showResizePreview(event, {
            colIndex,
            direction: 'right',
            handleKey: rightHandleKey,
            rowIndex,
          });
        }}
        onPointerMove={(event) => {
          showResizePreview(event, {
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
        data-table-resize-handle="row-end"
        onPointerEnter={(event) => {
          showResizePreview(event, {
            colIndex,
            direction: 'bottom',
            handleKey: bottomHandleKey,
            rowIndex,
          });
        }}
        onPointerMove={(event) => {
          showResizePreview(event, {
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
          data-table-resize-handle="column-start"
          onPointerEnter={(event) => {
            showResizePreview(event, {
              colIndex,
              direction: 'left',
              handleKey: leftHandleKey,
              rowIndex,
            });
          }}
          onPointerMove={(event) => {
            showResizePreview(event, {
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

function BorderIcon({
  side,
}: {
  side: 'top' | 'right' | 'bottom' | 'left' | 'none' | 'outer';
}) {
  const border = {
    top: 'M1 1h12',
    right: 'M13 1v12',
    bottom: 'M1 13h12',
    left: 'M1 1v12',
    none: '',
    outer: 'M1 1h12v12H1z',
  }[side];

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="15"
      viewBox="0 0 15 15"
      width="15"
    >
      <path
        d="M1 1h12v12H1z M7 1v12 M1 7h12"
        stroke="currentColor"
        strokeDasharray="0 2"
        strokeLinecap="round"
      />
      <path d={border} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
