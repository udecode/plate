'use client';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  Columns2Icon,
  GripVertical,
  type LucideIcon,
  ScissorsIcon,
} from 'lucide-react';
import { type Element, type NodeKey, PathApi } from 'platejs';
import {
  definePlugin,
  type Editor,
  type RenderNodeWrapperProps,
  type WrapRootProps,
  useDropIndicator,
  useEditor,
  useEditorSelector,
  useElementSelected,
} from 'platejs/react';
import { BaseTablePlugin } from 'platejs/table';
import * as React from 'react';
import { createPortal } from 'react-dom';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';

/**
 * Start a native block drag from a handle and use the dragged blocks as the
 * drag image, held at the pointer's offset from the first block.
 */
export const startBlockDrag = (
  editor: Editor,
  event: React.DragEvent,
  element: Element
) => {
  const drag = editor.api.dom.drag.start(event.nativeEvent, { node: element });

  if (!drag) {
    event.preventDefault();

    return;
  }

  const document = event.currentTarget.ownerDocument;
  const rect = editor.api.dom.resolveDOMNode(element)?.getBoundingClientRect();
  const image = document.createElement('div');

  image.style.cssText = `position:fixed;pointer-events:none;left:${rect?.left ?? 0}px;top:${rect?.top ?? 0}px;width:${rect?.width ?? 0}px;`;
  image.className = 'flow-root opacity-50';
  image.append(...drag.previews);
  document.body.append(image);
  event.dataTransfer.setDragImage(image, drag.origin.x, drag.origin.y);
  // The browser snapshots the image during dragstart.
  requestAnimationFrame(() => image.remove());
};

/**
 * Cut blocks to the clipboard. They are removed only once the clipboard holds
 * them, so a refused clipboard write loses nothing.
 */
export const cutBlocks = async (editor: Editor, keys: readonly NodeKey[]) => {
  if (keys.length === 0) return;

  editor.update.selection.setNodes(keys);

  const data = new Map<string, string>();

  editor.api.dom.clipboard.writeSelection({
    getData: (type) => data.get(type) ?? '',
    setData: (type, value) => {
      data.set(type, value);
    },
  });

  const items: Record<string, Blob> = {};

  for (const type of ['text/html', 'text/plain']) {
    const value = data.get(type);

    if (value !== undefined) items[type] = new Blob([value], { type });
  }

  try {
    await navigator.clipboard.write([new ClipboardItem(items)]);
  } catch {
    return;
  }
  editor.update((tx) => {
    const paths = keys
      .flatMap((key) => {
        const entry = tx.nodes.get(key);

        return entry ? [entry[1]] : [];
      })
      .toSorted((a, b) => PathApi.compare(b, a));

    for (const path of paths) tx.nodes.remove({ at: path });
  });
};

/**
 * A drag handle's actions. The handle opens it on click, which a drag never
 * fires, so the anchor stays out of pointer events.
 */
export function HandleActionsMenu({
  actions,
  className,
  onOpenChange,
  open,
  style,
}: {
  actions: ReadonlyArray<{ icon: LucideIcon; label: string; run: () => void }>;
  className?: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  style?: React.CSSProperties;
}) {
  const editor = useEditor();

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger tabIndex={-1}>
        <span
          aria-hidden
          className={cn('pointer-events-none absolute', className)}
          style={style}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="left">
        {actions.map(({ icon: Icon, label, run }) => (
          <DropdownMenuItem
            key={label}
            finalFocus={() => editor.api.dom.focus()}
            onSelect={run}
          >
            <Icon />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Draggable(props: RenderNodeWrapperProps) {
  const { children, editor, element, renderPath } = props;
  const [buttonTop, setButtonTop] = React.useState(0);
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [besideActions, setBesideActions] = React.useState<
    Array<{ icon: LucideIcon; label: string; run: () => void }>
  >([]);
  const selected = useElementSelected();
  // A drag node-selects the handle's blocks, so their gutter stays laid out.
  // Mode 'node' matches those blocks only, so with hover the blocks nested
  // inside them keep their gutters hidden.
  const nodeSelected = useElementSelected({ mode: 'node' });
  const hasTableCellSelection = React.useContext(TableCellSelectionContext);
  const table = editor.plugin(BaseTablePlugin);
  const isTable = table.installed && element.type === table.schema.type;
  const nodes = () => editor.read.transfer.nodes({ node: element });
  const move = (to: 'next' | 'previous', announce: string) => {
    editor.api.transfer.move({ announce, nodes: nodes(), to });
  };
  // The siblings around the whole payload, such as a list item with its
  // nested items, not around the handle's own block.
  const besideOf = (keys: readonly NodeKey[]) => {
    const paths = keys.map((key) => editor.read.nodes.path(key));
    const first = paths[0];
    const last = paths.at(-1);

    if (
      !first ||
      !last ||
      !PathApi.equals(PathApi.parent(first), PathApi.parent(last))
    ) {
      return [];
    }

    return [
      {
        label: 'Move beside previous',
        sibling: PathApi.hasPrevious(first) ? PathApi.previous(first) : null,
        side: 'end' as const,
      },
      {
        label: 'Move beside next',
        sibling: PathApi.next(last),
        side: 'start' as const,
      },
    ].flatMap(({ label, sibling, side }) => {
      const key = sibling && editor.key(sibling);

      if (!key) return [];

      const to = { key, side };

      return editor.read.transfer.check({ nodes: keys, to }).admitted
        ? [
            {
              icon: Columns2Icon,
              label,
              run: () => {
                editor.api.transfer.move({
                  announce: 'Moved beside',
                  nodes: keys,
                  to,
                });
              },
            },
          ]
        : [];
    });
  };
  const openActions = () => {
    const keys = nodes();

    if (!keys.every((key) => editor.read.selection.contains(key))) {
      editor.update.selection.setNodes(keys);
    }
    setBesideActions(besideOf(keys));
    setActionsOpen(true);
  };

  return (
    // Only the innermost hovered block shows its handle. The hovered flag is a
    // DOM attribute, not React state, so toggling it re-renders nothing, and a
    // nested gutter is display: none until hovered, so a large table lays out
    // no gutter per cell block.
    <div
      className={cn(
        'editor-draggable relative data-hovered:[&>.editor-gutterLeft]:opacity-100 [&>.editor-blockWrapper>[data-editor-dragging]]:opacity-50',
        // A table keeps its handle while the pointer is anywhere inside it, so
        // the handles of its cell blocks do not make it flicker.
        isTable && 'hover:[&>.editor-gutterLeft]:opacity-100',
        renderPath.length > 1 &&
          (isTable
            ? 'not-hover:[&>.editor-gutterLeft]:hidden'
            : 'not-data-hovered:[&>.editor-gutterLeft]:hidden')
      )}
      onMouseEnter={() => setButtonTop(calcDragButtonTop(editor, element))}
      onPointerLeave={(event) => {
        event.currentTarget.removeAttribute('data-hovered');
      }}
      onPointerOver={(event) => {
        event.currentTarget.toggleAttribute(
          'data-hovered',
          (event.target as globalThis.Element).closest('.editor-draggable') ===
            event.currentTarget
        );
      }}
    >
      {!hasTableCellSelection && (
        <Gutter
          className={cn(
            actionsOpen && 'opacity-100',
            // Without hover, a tap's pointerleave clears data-hovered, so
            // every block the selection touches keeps its gutter.
            selected &&
              '[@media(hover:none)]:flex! [@media(hover:none)]:opacity-100',
            (nodeSelected || actionsOpen) && 'flex!'
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-expanded={actionsOpen}
                aria-haspopup="menu"
                aria-label="Drag block"
                className="pointer-events-auto absolute -left-0 flex h-6 w-4.5 cursor-grab items-center justify-center p-0 text-muted-foreground [:is(td,th)_&]:w-3"
                data-editor-prevent-deselect
                data-editor-selectable
                draggable
                style={{ top: `${buttonTop + 3}px` }}
                type="button"
                onClick={openActions}
                onDragStart={(event) => startBlockDrag(editor, event, element)}
              >
                <GripVertical />
              </button>
            </TooltipTrigger>
            {/* A hidden nested gutter leaves the trigger at 0,0; hide the tooltip
                there instead of fading it out in the corner. */}
            <TooltipContent hideWhenDetached>
              Drag to move, click for actions
            </TooltipContent>
          </Tooltip>
          {actionsOpen && (
            <HandleActionsMenu
              actions={[
                {
                  icon: ArrowUpIcon,
                  label: 'Move up',
                  run: () => move('previous', 'Moved up'),
                },
                {
                  icon: ArrowDownIcon,
                  label: 'Move down',
                  run: () => move('next', 'Moved down'),
                },
                ...besideActions,
                {
                  icon: ScissorsIcon,
                  label: 'Cut',
                  run: () => {
                    void cutBlocks(editor, nodes());
                  },
                },
              ]}
              className="-left-0 h-6 w-4.5"
              open
              style={{ top: `${buttonTop + 3}px` }}
              onOpenChange={setActionsOpen}
            />
          )}
        </Gutter>
      )}

      <div className="editor-blockWrapper flow-root">{children}</div>
    </div>
  );
}

function Gutter({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'editor-gutterLeft',
        '-translate-x-full absolute top-0 z-50 flex h-full w-[22px] cursor-text select-none hover:opacity-100 sm:opacity-0 [:is(td,th)_&]:w-3',
        'focus-within:opacity-100',
        className
      )}
      contentEditable={false}
      data-editor-selectable
    >
      {children}
    </div>
  );
}

const calcDragButtonTop = (editor: Editor, element: Element): number => {
  const child = editor.api.dom.resolveDOMNode(element);
  const window = child?.ownerDocument.defaultView;

  if (!child || !window) return 0;

  return Number(window.getComputedStyle(child).marginTop.replace('px', ''));
};

function DropIndicator() {
  const editor = useEditor();
  const indicator = useDropIndicator();

  if (!indicator) return null;

  const { axis, line } = indicator;

  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-50 rounded-full bg-brand/50"
      data-drop-indicator={axis}
      style={
        axis === 'y'
          ? {
              height: 2,
              transform: `translate(${line.x}px, ${line.y - 1}px)`,
              width: line.width,
            }
          : {
              height: line.height,
              transform: `translate(${line.x - 1}px, ${line.y}px)`,
              width: 2,
            }
      }
    />,
    editor.api.dom.getWindow().document.body
  );
}

const TableCellSelectionContext = React.createContext(false);

/** One table-selection subscription for every handle in the editor. */
function DndRoot({ children }: WrapRootProps) {
  // A selected table node also reports its cells; only a text selection
  // across cells hides the handles, so a drag's own selection never removes
  // its source.
  const hasTableCellSelection = useEditorSelector((editor) => {
    const table = editor.plugin(BaseTablePlugin);

    return (
      table.installed &&
      editor.read.selection.nodes().length === 0 &&
      (table.read.selection()?.cells.length ?? 0) > 1
    );
  });

  return (
    <TableCellSelectionContext value={hasTableCellSelection}>
      <TooltipProvider>{children}</TooltipProvider>
    </TableCellSelectionContext>
  );
}

/** Block handles, the drop indicator and the keyboard block move. */
export const DndPlugin = definePlugin('dnd', {
  shortcuts: {
    moveBlockDown: {
      keys: 'mod+shift+arrowdown',
      handler: ({ editor }) =>
        editor.api.transfer.move({ announce: 'Moved down', to: 'next' })
          .status !== 'refused',
    },
    moveBlockUp: {
      keys: 'mod+shift+arrowup',
      handler: ({ editor }) =>
        editor.api.transfer.move({ announce: 'Moved up', to: 'previous' })
          .status !== 'refused',
    },
  },
  slots: {
    afterEditable: DropIndicator,
    wrapNode: {
      component: Draggable,
      match: ({ editor, element }) =>
        !editor.read.view.isReadOnly() &&
        editor.read.schema.isBlockContent(element) &&
        editor.read.nodes.isSelectable(element),
    },
    wrapRoot: DndRoot,
  },
});

export const DndKit = [DndPlugin];
