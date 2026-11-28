'use client';

import { cn } from 'cn';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BetweenVerticalEndIcon,
  BetweenVerticalStartIcon,
  GripHorizontal,
  Trash2Icon,
  UngroupIcon,
} from 'lucide-react';
import { type Element, type NodeKey, type Path, PathApi } from 'platejs';
import { BaseColumnGroupPlugin, BaseColumnItemPlugin } from 'platejs/column';
import { ColumnGroupPlugin, ColumnItemPlugin } from 'platejs/column/react';
import { BaseLockPlugin } from 'platejs/lock';
import {
  type Editor,
  type EditorElementProps,
  EditorElement,
  useEditor,
  useEditorReadOnly,
  useEditorSelector,
  useElement,
  useElementSelected,
  useFocusedLast,
  usePath,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HandleActionsMenu,
  startBlockDrag,
} from '@/registry/components/editor/dnd';
import {
  FloatingPopover,
  FloatingPopoverAnchor,
  FloatingPopoverContent,
} from '@/registry/components/editor/floating-popover';

const MAX_COLUMNS = 5;
// Smallest share of the resized pair either column keeps.
const MIN_PAIR_SHARE = 0.15;
const KEYBOARD_PAIR_STEP = 0.1;

const weightOf = (column: { width?: number }) => column.width ?? 1;

const roundWeight = (weight: number) => Math.round(weight * 1000) / 1000;

const splitPair = (total: number, share: number): [number, number] => {
  const clamped = Math.min(1 - MIN_PAIR_SHARE, Math.max(MIN_PAIR_SHARE, share));
  const left = roundWeight(total * clamped);

  return [left, roundWeight(total - left)];
};

const readGroupColumns = (editor: Editor, element: Element) => {
  const entry = editor.read.nodes.get(editor.key(element));

  if (!entry) return null;

  const [, path] = entry;
  const group = editor.read.nodes.get(PathApi.parent(path), {
    type: BaseColumnGroupPlugin,
  })?.[0];

  if (!group) return null;

  return {
    columns: group.children.filter((child) =>
      editor.read.nodes.isContent(child)
    ),
    index: path.at(-1) ?? 0,
    siblings: group.children,
  };
};

// The next content column the trailing divider resizes against, or null when
// this column is the last one or either side is locked.
const readResizePartner = (editor: Editor, element: Element) => {
  const group = readGroupColumns(editor, element);

  if (!group || !editor.read.nodes.isContent(element)) return null;

  const next = group.siblings
    .slice(group.index + 1)
    .find((child) => editor.read.nodes.isContent(child));

  if (!next) return null;

  const key = editor.key(next);
  const lock = editor.plugin(BaseLockPlugin);

  if (
    lock.installed &&
    (lock.read.isLocked(editor.key(element)) || lock.read.isLocked(key))
  ) {
    return null;
  }

  return key;
};

export function ColumnElement({
  children,
  element,
  ref,
  ...props
}: EditorElementProps<typeof ColumnItemPlugin>) {
  const readOnly = useEditorReadOnly();
  const selected = useElementSelected();
  const nodeSelected = useElementSelected({ mode: 'node' });
  const partner = useEditorSelector((current) =>
    readResizePartner(current, element)
  );

  return (
    <div
      className={cn(
        'group/column relative w-full flex-none hover:[&>.editor-column-drag-handle]:opacity-100',
        'sm:w-auto sm:min-w-0 sm:flex-(--column-weight)'
      )}
      data-slot="column"
      style={{ '--column-weight': weightOf(element) } as React.CSSProperties}
    >
      {!readOnly && (
        <div
          contentEditable={false}
          className={cn(
            '-translate-y-1/2 absolute inset-x-0 top-2 z-50 mx-auto w-fit',
            'pointer-events-auto flex items-center',
            'editor-column-drag-handle opacity-0 transition-opacity',
            selected && '[@media(hover:none)]:opacity-100'
          )}
        >
          <ColumnDragHandle element={element} />
        </div>
      )}

      <EditorElement
        {...props}
        ref={ref}
        attributes={{
          ...props.attributes,
          'data-node-selection-highlight': 'self',
        }}
        element={element}
        className="h-full pt-2"
      >
        <div
          className={cn(
            'relative h-full border border-transparent p-1.5',
            !readOnly && 'rounded-lg border-border border-dashed',
            '[[data-editor-dragging]>&]:opacity-50',
            nodeSelected &&
              'before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:bg-(--node-selection-tint)'
          )}
        >
          {children}
        </div>
      </EditorElement>

      {!readOnly && partner && (
        <ColumnDivider element={element} partner={partner} />
      )}
    </div>
  );
}

/**
 * Resizes this column and the next one. A pointer drag previews through the
 * `--column-weight` variables and commits one history step on release.
 */
function ColumnDivider({
  element,
  partner,
}: {
  element: EditorElementProps<typeof ColumnItemPlugin>['element'];
  partner: NodeKey;
}) {
  const editor = useEditor();
  const [resizing, setResizing] = React.useState(false);
  const partnerWeight = useEditorSelector((current) => {
    const node = current.read.nodes.get(partner, {
      type: BaseColumnItemPlugin,
    })?.[0];

    return node ? weightOf(node) : 1;
  });
  const drag = React.useRef<{
    left: HTMLElement;
    leftWeight: number;
    next: [number, number] | null;
    pairWidth: number;
    right: HTMLElement;
    rightWeight: number;
    rtl: boolean;
    startX: number;
  } | null>(null);
  const leftWeight = weightOf(element);
  const total = leftWeight + partnerWeight;

  const resize = (widths: [number, number]) => {
    editor.plugin(BaseColumnGroupPlugin).update.resizeColumns({
      columns: [editor.key(element), partner],
      widths,
    });
  };

  const finish = (
    event: React.PointerEvent<HTMLDivElement>,
    commit: boolean
  ) => {
    const { current } = drag;

    if (!current) return;

    drag.current = null;
    setResizing(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    // React owns these variables; hand them back before the commit re-renders.
    current.left.style.setProperty(
      '--column-weight',
      String(current.leftWeight)
    );
    current.right.style.setProperty(
      '--column-weight',
      String(current.rightWeight)
    );

    if (
      commit &&
      current.next &&
      (current.next[0] !== current.leftWeight ||
        current.next[1] !== current.rightWeight)
    ) {
      resize(current.next);
    }
  };

  return (
    <div
      aria-label="Resize columns"
      aria-orientation="vertical"
      aria-valuemax={(1 - MIN_PAIR_SHARE) * 100}
      aria-valuemin={MIN_PAIR_SHARE * 100}
      aria-valuenow={Math.round((leftWeight / total) * 100)}
      className={cn(
        'group/divider absolute top-2 bottom-0 -end-3 z-10 hidden w-2 cursor-col-resize touch-none select-none justify-center outline-none sm:flex',
        // A block drag over the gap must reach the editor's side-drop target.
        '[:root:has([data-editor-dragging])_&]:pointer-events-none'
      )}
      contentEditable={false}
      data-plate-column-divider=""
      data-resizing={resizing || undefined}
      draggable={false}
      role="separator"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

        event.preventDefault();
        event.stopPropagation();

        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const grow = (event.key === 'ArrowRight') !== rtl;

        resize(
          splitPair(
            total,
            leftWeight / total +
              (grow ? KEYBOARD_PAIR_STEP : -KEYBOARD_PAIR_STEP)
          )
        );
      }}
      onPointerCancel={(event) => finish(event, false)}
      onPointerDown={(event) => {
        if (event.button !== 0) return;

        const left = event.currentTarget.closest<HTMLElement>(
          '[data-slot="column"]'
        );
        const right = editor.api.dom
          .resolveDOMNode(partner)
          ?.closest<HTMLElement>('[data-slot="column"]');

        if (!left || !right) return;

        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          left,
          leftWeight,
          next: null,
          pairWidth:
            left.getBoundingClientRect().width +
            right.getBoundingClientRect().width,
          right,
          rightWeight: partnerWeight,
          rtl: getComputedStyle(left).direction === 'rtl',
          startX: event.clientX,
        };
        setResizing(true);
      }}
      onPointerMove={(event) => {
        const { current } = drag;

        if (!current || current.pairWidth <= 0) return;

        const deltaX =
          (event.clientX - current.startX) * (current.rtl ? -1 : 1);
        const next = splitPair(
          total,
          leftWeight / total + deltaX / current.pairWidth
        );

        current.next = next;
        current.left.style.setProperty('--column-weight', String(next[0]));
        current.right.style.setProperty('--column-weight', String(next[1]));
      }}
      onPointerUp={(event) => finish(event, true)}
    >
      <div className="h-full w-0.5 rounded-full bg-transparent transition-colors group-hover/divider:bg-ring group-focus-visible/divider:bg-ring group-data-resizing/divider:bg-ring" />
    </div>
  );
}

function ColumnDragHandle({ element }: { element: Element }) {
  const editor = useEditor();
  const [open, setOpen] = React.useState(false);
  const [rtl, setRtl] = React.useState(false);
  const columnCount = useEditorSelector(
    (current) => readGroupColumns(current, element)?.columns.length ?? 0
  );
  const locked = useEditorSelector((current) => {
    const lock = current.plugin(BaseLockPlugin);

    return lock.installed && lock.read.isLocked(current.key(element));
  });
  const columns = editor.plugin(BaseColumnGroupPlugin);
  const move = (to: 'next' | 'previous', announce: string) => {
    editor.api.transfer.move({
      announce,
      nodes: [editor.key(element)],
      to,
    });
  };
  const atCap = columnCount >= MAX_COLUMNS;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-expanded={open}
            aria-haspopup="menu"
            aria-label="Drag column or open column actions"
            variant="ghost"
            className="h-5 cursor-grab !px-1"
            draggable
            onClick={(event) => {
              event.preventDefault();
              setRtl(getComputedStyle(event.currentTarget).direction === 'rtl');
              setOpen(true);
            }}
            onDragStart={(event) => startBlockDrag(editor, event, element)}
          >
            <GripHorizontal className="text-muted-foreground" />
          </Button>
        </TooltipTrigger>

        <TooltipContent className="pointer-events-none">
          Drag to move column, click for actions
        </TooltipContent>
      </Tooltip>
      <HandleActionsMenu
        actions={[
          {
            icon: <ArrowLeftIcon />,
            label: 'Move left',
            run: () => move(rtl ? 'next' : 'previous', 'Moved left'),
          },
          {
            icon: <ArrowRightIcon />,
            label: 'Move right',
            run: () => move(rtl ? 'previous' : 'next', 'Moved right'),
          },
          {
            disabled: atCap || locked,
            icon: <BetweenVerticalStartIcon />,
            label: 'Add column left',
            run: () =>
              columns.update.insertColumn({
                at: element,
                side: rtl ? 'after' : 'before',
              }),
          },
          {
            disabled: atCap || locked,
            icon: <BetweenVerticalEndIcon />,
            label: 'Add column right',
            run: () =>
              columns.update.insertColumn({
                at: element,
                side: rtl ? 'before' : 'after',
              }),
          },
          {
            disabled: locked,
            icon: <Trash2Icon />,
            label: 'Delete column',
            run: () => columns.update.removeColumn({ at: element }),
          },
        ]}
        className="inset-0"
        open={open}
        rtl={rtl}
        onOpenChange={setOpen}
      />
    </TooltipProvider>
  );
}

export function ColumnGroupElement(
  props: EditorElementProps<typeof ColumnGroupPlugin>
) {
  return (
    <EditorElement className="mb-2" {...props}>
      <ColumnFloatingToolbar>
        <div className="flex size-full flex-col gap-4 rounded sm:flex-row">
          {props.children}
        </div>
      </ColumnFloatingToolbar>
    </EditorElement>
  );
}

const PRESET_SHARE_TOLERANCE = 0.02;

const sharesOf = (weights: readonly number[]) => {
  const total = weights.reduce((sum, weight) => sum + weight, 0);

  return weights.map((weight) => weight / total);
};

// The preset whose split the group's content columns match, if any.
const readActivePreset = (editor: Editor, at: Path) => {
  const group = editor.read.nodes.get(at, { type: BaseColumnGroupPlugin })?.[0];

  if (!group) return null;

  const shares = sharesOf(
    group.children.flatMap((child) => {
      const column = editor.read.nodes.get(editor.key(child), {
        type: BaseColumnItemPlugin,
      })?.[0];

      return column && editor.read.nodes.isContent(column)
        ? [weightOf(column)]
        : [];
    })
  );

  return (
    COLUMN_PRESETS.find(({ widths }) => {
      const presetShares = sharesOf(widths);

      return (
        presetShares.length === shares.length &&
        presetShares.every(
          (share, index) =>
            Math.abs(share - shares[index]) <= PRESET_SHARE_TOLERANCE
        )
      );
    })?.label ?? null
  );
};

function ColumnFloatingToolbar({ children }: { children: React.ReactElement }) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const element = useElement(ColumnGroupPlugin);
  const selected = useElementSelected();
  const isCollapsed = useEditorSelector((innerEditor) =>
    innerEditor.read.selection.isCollapsed()
  );
  const isFocusedLast = useFocusedLast();

  const open = isFocusedLast && !readOnly && selected && isCollapsed;
  const path = usePath();
  const activePreset = useEditorSelector((current) =>
    readActivePreset(current, path)
  );
  const columns = editor.plugin(BaseColumnGroupPlugin);

  return (
    <FloatingPopover open={open} modal={false}>
      <FloatingPopoverAnchor element={children} />
      <FloatingPopoverContent
        className="w-auto p-1"
        onInitialFocus={(e) => {
          e.preventDefault();
        }}
        align="center"
        side="top"
        sideOffset={10}
      >
        <TooltipProvider>
          <div className="box-content flex h-8 items-center">
            {COLUMN_PRESETS.map(({ icon, label, widths }) => (
              <ColumnToolbarButton
                key={label}
                active={label === activePreset}
                label={label}
                onClick={() => {
                  columns.update.setColumns({ at: element, widths });
                }}
              >
                {icon}
              </ColumnToolbarButton>
            ))}

            <Separator orientation="vertical" className="mx-1 h-6" />
            <ColumnToolbarButton
              label="Unwrap columns"
              onClick={() => {
                columns.update.unwrap({ at: element });
              }}
            >
              <UngroupIcon />
            </ColumnToolbarButton>
            <ColumnToolbarButton
              label="Delete columns"
              onClick={() => {
                editor.update.nodes.remove({ at: element });
              }}
            >
              <Trash2Icon />
            </ColumnToolbarButton>
          </div>
        </TooltipProvider>
      </FloatingPopoverContent>
    </FloatingPopover>
  );
}

function ColumnToolbarButton({
  active,
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          aria-pressed={active}
          variant="ghost"
          className={cn('size-8', active && 'bg-accent')}
          data-active={active || undefined}
          onClick={onClick}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

const DoubleColumnOutlined = () => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M8.5 3H13V13H8.5V3ZM7.5 2H8.5H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H8.5H7.5H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H7.5ZM7.5 13H3L3 3H7.5V13Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const ThreeColumnOutlined = () => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M9.25 3H6.75V13H9.25V3ZM9.25 2H6.75H5.75H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H5.75H6.75H9.25H10.25H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2H10.25H9.25ZM10.25 3V13H13V3H10.25ZM3 13H5.75V3H3L3 13Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const RightSideDoubleColumnOutlined = () => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M11.25 3H13V13H11.25V3ZM10.25 2H11.25H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H11.25H10.25H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H10.25ZM10.25 13H3L3 3H10.25V13Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const LeftSideDoubleColumnOutlined = () => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M5.75 3H13V13H5.75V3ZM4.75 2H5.75H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H5.75H4.75H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H4.75ZM4.75 13H3L3 3H4.75V13Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const DoubleSideDoubleColumnOutlined = () => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M10.25 3H5.75V13H10.25V3ZM10.25 2H5.75H4.75H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H4.75H5.75H10.25H11.25H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2H11.25H10.25ZM11.25 3V13H13V3H11.25ZM3 13H4.75V3H3L3 13Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const COLUMN_PRESETS = [
  { icon: <DoubleColumnOutlined />, label: '2 columns', widths: [1, 1] },
  { icon: <ThreeColumnOutlined />, label: '3 columns', widths: [1, 1, 1] },
  {
    icon: <RightSideDoubleColumnOutlined />,
    label: 'Right sidebar (70/30)',
    widths: [7, 3],
  },
  {
    icon: <LeftSideDoubleColumnOutlined />,
    label: 'Left sidebar (30/70)',
    widths: [3, 7],
  },
  {
    icon: <DoubleSideDoubleColumnOutlined />,
    label: '3 columns (25/50/25)',
    widths: [1, 2, 1],
  },
];

export const ColumnKit = [
  ColumnGroupPlugin.configure({ component: ColumnGroupElement }),
  ColumnItemPlugin.configure({ component: ColumnElement }),
];
