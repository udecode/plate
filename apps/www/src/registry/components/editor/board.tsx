'use client';

import { cn } from 'cn';
import {
  ArrowDownToLineIcon,
  BanIcon,
  CircleIcon,
  DiamondIcon,
  EraserIcon,
  FrameIcon,
  HandIcon,
  ImageIcon,
  LockIcon,
  LockOpenIcon,
  MousePointer2Icon,
  MoveUpRightIcon,
  PaletteIcon,
  PencilIcon,
  ScanIcon,
  SquareIcon,
  StickyNoteIcon,
  TriangleIcon,
  TypeIcon,
  UngroupIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';
import { ElementApi } from 'platejs';
import {
  BoardArrowhead,
  BoardArrowLabel,
  BoardArrowPath,
  BoardArrowPlugin,
  type BoardCorner,
  BoardFramePlugin,
  BoardGeoPlugin,
  BoardImagePlugin,
  type BoardMessages,
  BoardNotePlugin,
  type BoardPickState,
  type BoardPicture,
  type BoardPictureWarning,
  BoardPlugin,
  BoardShape,
  type BoardShapeDescription,
  BoardStrokePlugin,
  type BoardStyle,
  BoardSurface,
  BoardTextPlugin,
  type BoardTool,
  useBoardActions,
  useBoardView,
  useStrokePath,
} from 'platejs/board/react';
import type { ImageElement } from 'platejs/media';
import { ImagePlugin } from 'platejs/media/react';
import {
  type EditorElementProps,
  useEditor,
  useEditorSelector,
  usePath,
} from 'platejs/react';
import * as React from 'react';
import { flushSync } from 'react-dom';
import { toast } from 'sonner';
import { useFilePicker } from 'use-file-picker';

import {
  ARROW_HEAD,
  BOARD_COLORS,
  COLORS,
  dashArray,
  geoOutline,
  paint,
  SHAPE_HEADINGS,
  STROKE_WIDTHS,
  TEXT_SIZES,
  tint,
} from '@/registry/components/editor/board-styles';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
} from '@/registry/components/editor/toolbar';

const TOOLS: ReadonlyArray<
  Readonly<{
    icon: React.ReactNode;
    key: string;
    label: string;
    tool: BoardTool;
  }>
> = [
  { icon: <MousePointer2Icon />, key: 'V', label: 'Select', tool: 'select' },
  { icon: <HandIcon />, key: 'H', label: 'Hand', tool: 'hand' },
  { icon: <StickyNoteIcon />, key: 'N', label: 'Note', tool: 'note' },
  { icon: <TypeIcon />, key: 'T', label: 'Text', tool: 'text' },
  { icon: <SquareIcon />, key: 'R', label: 'Shape', tool: 'geo' },
  { icon: <MoveUpRightIcon />, key: 'A', label: 'Arrow', tool: 'arrow' },
  { icon: <FrameIcon />, key: 'F', label: 'Frame', tool: 'frame' },
  { icon: <PencilIcon />, key: 'P', label: 'Pen', tool: 'pen' },
  { icon: <EraserIcon />, key: 'E', label: 'Eraser', tool: 'eraser' },
];

const GEOS: ReadonlyArray<
  Readonly<{
    geo: NonNullable<BoardStyle['geo']>;
    icon: React.ReactNode;
    label: string;
  }>
> = [
  { geo: 'rectangle', icon: <SquareIcon />, label: 'Rectangle' },
  { geo: 'ellipse', icon: <CircleIcon />, label: 'Ellipse' },
  { geo: 'diamond', icon: <DiamondIcon />, label: 'Diamond' },
  { geo: 'triangle', icon: <TriangleIcon />, label: 'Triangle' },
];

type BoardStyleOption<TValue> = Readonly<{
  icon: React.ReactNode;
  label: string;
  value: TValue;
}>;

const FILL_OPTIONS: ReadonlyArray<BoardStyleOption<string>> = [
  { icon: <BanIcon />, label: 'None', value: 'none' },
  ...COLORS.map(({ color, label }) => ({
    icon: (
      <span
        className="size-4 rounded-full border border-foreground/20"
        style={{ backgroundColor: paint(color) }}
      />
    ),
    label,
    value: color,
  })),
];

const OUTLINE_OPTIONS: ReadonlyArray<BoardStyleOption<string>> = [
  {
    icon: <span className="size-4 rounded-full border-[3px] border-current" />,
    label: 'Default',
    value: 'currentColor',
  },
  ...COLORS.map(({ color, label }) => ({
    icon: (
      <span
        className="size-4 rounded-full border-[3px]"
        style={{ borderColor: paint(color) }}
      />
    ),
    label,
    value: color,
  })),
];

const line = (props: React.SVGProps<SVGLineElement>) => (
  <svg aria-hidden viewBox="0 0 16 16">
    <line
      stroke="currentColor"
      strokeLinecap="round"
      x1={2}
      x2={14}
      y1={8}
      y2={8}
      {...props}
    />
  </svg>
);

const DASH_OPTIONS: ReadonlyArray<
  BoardStyleOption<NonNullable<BoardStyle['dash']>>
> = [
  { icon: line({ strokeWidth: 2 }), label: 'Solid', value: 'solid' },
  {
    icon: line({
      strokeDasharray: '4 3',
      strokeLinecap: 'butt',
      strokeWidth: 2,
    }),
    label: 'Dashed',
    value: 'dashed',
  },
  {
    icon: line({ strokeDasharray: '0 4', strokeWidth: 2 }),
    label: 'Dotted',
    value: 'dotted',
  },
];

const SIZE_LABELS = [
  ['s', 'Small', 'S'],
  ['m', 'Medium', 'M'],
  ['l', 'Large', 'L'],
  ['xl', 'Extra large', 'XL'],
] as const;

const WIDTH_OPTIONS: ReadonlyArray<
  BoardStyleOption<NonNullable<BoardStyle['strokeWidth']>>
> = SIZE_LABELS.map(([value, label]) => ({
  icon: line({ strokeWidth: STROKE_WIDTHS[value] }),
  label,
  value,
}));

const TEXT_OPTIONS: ReadonlyArray<
  BoardStyleOption<NonNullable<BoardStyle['textSize']>>
> = SIZE_LABELS.map(([value, label, short]) => ({
  icon: <span className="text-xs font-medium">{short}</span>,
  label,
  value,
}));

const GEO_OPTIONS: ReadonlyArray<
  BoardStyleOption<NonNullable<BoardStyle['geo']>>
> = GEOS.map(({ geo, icon, label }) => ({
  icon,
  label,
  value: geo,
}));

const KINDS: Readonly<Record<BoardShapeDescription['kind'], string>> = {
  arrow: 'Arrow',
  frame: 'Frame',
  geo: 'Shape',
  image: 'Image',
  note: 'Note',
  shape: 'Shape',
  stroke: 'Line',
  text: 'Text',
};

const TOOL_NAMES: Readonly<Record<BoardTool, string>> = {
  arrow: 'Arrow tool',
  eraser: 'Eraser tool',
  frame: 'Frame tool',
  geo: 'Shape tool',
  hand: 'Hand tool',
  note: 'Note tool',
  pen: 'Pen tool',
  select: 'Select tool',
  text: 'Text tool',
};

const CORNERS: Readonly<Record<BoardCorner, string>> = {
  bottomLeft: 'bottom left',
  bottomRight: 'bottom right',
  topLeft: 'top left',
  topRight: 'top right',
};

const nameOf = (shape: BoardShapeDescription): string => {
  if (shape.kind === 'arrow') {
    const end = (side: BoardShapeDescription | null) =>
      side ? nameOf(side) : 'nothing';

    const ends = `Arrow from ${end(shape.ends.start)} to ${end(shape.ends.end)}`;

    return shape.text ? `${shape.text}, ${ends}` : ends;
  }

  return shape.text ? `${shape.text}, ${KINDS[shape.kind]}` : KINDS[shape.kind];
};

const pickOf = (
  shape: BoardShapeDescription,
  { count, position, selected, total }: BoardPickState
) =>
  `${nameOf(shape)}, ${selected ? 'selected' : 'not selected'}. ${position} of ${total}. ${count} selected`;

const boardMessages: BoardMessages = {
  label: 'Board',
  instructions:
    'Enter selects the first shape. Tab moves between shapes and leaves them after the last. Command with an arrow on a Mac, or Control with an arrow elsewhere, picks the nearest shape. With the note, text, shape or frame tool, Enter places one, and with the arrow tool and one shape selected that is not an arrow, Enter connects it to another, whose end the arrow keys then move. With the arrow tool and nothing selected, Enter starts an arrow whose start the arrow keys move until a second Enter keeps it. With one shape selected that is not an arrow, S resizes it: Tab picks a corner, the arrow keys move it and Enter keeps the new size. Space starts picking shapes: Tab moves, Space adds or removes the shape and Enter keeps the selection. Q keeps the drawing tool picked after each shape until a second Q, and Command+D on a Mac, or Control+D elsewhere, copies the selected shapes. Shift+Enter reaches the toolbar.',
  aim: (shape, { anchor, position, side, total }) =>
    `${side === 'start' ? 'From' : 'To'} ${nameOf(shape)}${anchor.across === 50 && anchor.down === 50 ? '' : `, ${anchor.across}% across, ${anchor.down}% down`}. ${position} of ${total}`,
  connecting: (from) =>
    `Connecting ${from ? nameOf(from) : 'a free point'}. Tab picks a shape, arrow keys move the end, Enter draws the arrow and Escape stops.`,
  free: ({ x, y }, { side }) =>
    `${side === 'start' ? 'Start' : 'End'} free at ${x}, ${y}`,
  starting: ({ x, y }, { from }) =>
    `Drawing an arrow from ${from ? nameOf(from) : `${x}, ${y}`}. Arrow keys move its start, Tab picks a shape, Enter keeps the start and Escape stops.`,
  resizing: (shape, { corner, height, width }) =>
    `Resizing ${nameOf(shape)} from its ${CORNERS[corner]} corner, ${width} by ${height}. Tab picks a corner, arrow keys resize, Enter keeps it and Escape stops.`,
  resize: ({ corner, height, width }) =>
    `${CORNERS[corner]}, ${width} by ${height}`,
  picking: (shape, state) =>
    `Picking shapes. ${pickOf(shape, state)}. Tab moves, Space adds or removes, Enter finishes.`,
  pick: (shape, state) => pickOf(shape, state),
  shape: (shape, { position, total }) =>
    `${nameOf(shape)}. ${position} of ${total}`,
  shapes: (count) =>
    count === 0 ? 'No shapes selected' : `${count} shapes selected`,
  tool: (tool) => TOOL_NAMES[tool],
  toolLock: (locked) => (locked ? 'Tool lock on' : 'Tool lock off'),
  zoom: (percent) => `Zoom ${percent}%`,
  removed: (count) =>
    count === 1 ? 'Shape deleted' : `${count} shapes deleted`,
};

function BoardShapeMenu({ pressed }: { pressed: boolean }) {
  const geo = useBoardView((view) => view.nextStyle.geo ?? 'rectangle');
  const { setStyle, setTool } = useBoardActions();
  const icon = GEOS.find((item) => item.geo === geo)?.icon ?? GEOS[0].icon;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <ToolbarButton isDropdown pressed={pressed} tooltip="Shape (R)">
          {icon}
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        <DropdownMenuRadioGroup
          value={geo}
          onValueChange={(value) => {
            const picked = GEOS.find((item) => item.geo === value);

            if (!picked) return;
            setTool('geo');
            setStyle({ geo: picked.geo });
          }}
        >
          {GEOS.map(({ geo: itemGeo, icon: itemIcon, label }) => (
            <DropdownMenuRadioItem key={itemGeo} value={itemGeo}>
              {itemIcon}
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BoardPictureButton() {
  const takesPictureFiles = useBoardView((view) => view.takesPictureFiles);
  const { upload } = useBoardActions();
  const { openFilePicker } = useFilePicker({
    accept: ['image/*'],
    multiple: true,
    readFilesContent: false,
    onFilesSelected: ({ plainFiles }) => upload(plainFiles),
  });

  return (
    <ToolbarButton
      className="min-w-6 px-1"
      disabled={!takesPictureFiles}
      tooltip="Image"
      onClick={() => openFilePicker()}
    >
      <ImageIcon />
    </ToolbarButton>
  );
}

const PICTURE_WARNINGS: Readonly<Record<BoardPictureWarning['code'], string>> =
  {
    'content-undrawn': 'Some content could not be drawn.',
    downscaled: 'The PNG was made smaller to fit the size limit.',
    'font-missing': 'A font could not be read, so its text uses another font.',
    'image-unreadable':
      'Some images could not be read, so they show as gray boxes or links.',
    'shape-undrawn': 'Some shapes could not be drawn and show as gray boxes.',
  };

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const loadPictureKit = () =>
  import('@/registry/components/editor/board-static').then(
    ({ BoardPictureKit }) => BoardPictureKit
  );

const warnAbout = ({ warnings }: BoardPicture) => {
  if (warnings.length === 0) return;

  toast.warning(
    [...new Set(warnings.map(({ code }) => PICTURE_WARNINGS[code]))].join(' ')
  );
};

function BoardExportMenu() {
  const { exportPicture } = useBoardActions();
  const mounted = React.useRef(false);

  React.useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const save = async (format: 'png' | 'svg') => {
    try {
      const picture = await exportPicture({ format, kit: loadPictureKit() });

      if (!picture) {
        toast('There is nothing to export.');
        return;
      }

      downloadBlob(picture.blob, `board.${format}`);
      warnAbout(picture);
    } catch (error) {
      if (!mounted.current) return;
      console.error('Could not export the board.', error);
      toast.error('The board could not be exported.');
    }
  };

  const copy = async (format: 'png' | 'svg') => {
    // Firefox and Safari cannot copy image/svg+xml, so the SVG goes as text.
    const type = format === 'png' ? 'image/png' : 'text/plain';
    const empty = new Error('There is nothing to copy.');
    const drawing = exportPicture({ format, kit: loadPictureKit() }).then(
      (picture) => picture ?? Promise.reject(empty)
    );

    try {
      // Safari and Firefox take a clipboard write only within the click's user
      // activation, so the write starts now with the picture still drawing.
      const [picture] = await Promise.all([
        drawing,
        navigator.clipboard.write([
          new ClipboardItem({
            [type]: drawing.then(({ blob }) => new Blob([blob], { type })),
          }),
        ]),
      ]);

      toast.success(
        `Copied the board as ${format === 'png' ? 'a PNG' : 'an SVG'}.`
      );
      warnAbout(picture);
    } catch (error) {
      if (error === empty) {
        toast(empty.message);
        return;
      }
      if (!mounted.current) return;
      console.error('Could not copy the board.', error);
      toast.error('The board could not be copied.');
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <ToolbarButton isDropdown tooltip="Export">
          <ArrowDownToLineIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        <DropdownMenuItem onSelect={() => save('png')}>
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => save('svg')}>
          Export as SVG
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => copy('png')}>
          Copy as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => copy('svg')}>
          Copy as SVG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BoardToolLock() {
  const locked = useBoardView((view) => view.toolLocked);
  const { setToolLocked } = useBoardActions();

  return (
    <ToolbarButton
      className="min-w-6 px-1"
      pressed={locked}
      tooltip="Keep the tool after drawing (Q)"
      onClick={() => setToolLocked(!locked)}
    >
      {locked ? <LockIcon /> : <LockOpenIcon />}
    </ToolbarButton>
  );
}

function BoardZoomLevel() {
  const percent = useBoardView((view) => Math.round(view.camera.zoom * 100));
  const { resetZoom } = useBoardActions();

  return (
    <ToolbarButton
      className="w-10 px-0"
      aria-label={`Zoom ${percent}%, reset to 100%`}
      tooltip="Reset to 100% (Shift+0)"
      onClick={resetZoom}
    >
      <span className="text-xs tabular-nums">{percent}%</span>
    </ToolbarButton>
  );
}

function BoardToolbarGroup({ children }: { children: React.ReactNode }) {
  return (
    <ToolbarGroup>
      <div className="flex flex-wrap items-center justify-center gap-y-0.5">
        {children}
      </div>
    </ToolbarGroup>
  );
}

export function BoardToolbar() {
  const tool = useBoardView((view) => view.tool);
  const frame = useBoardView((view) => {
    const [only, ...rest] = view.selectedShapes;

    return view.writable && only?.kind === 'frame' && rest.length === 0
      ? only.id
      : null;
  });
  const { fit, removeFrame, setTool, zoomIn, zoomOut } = useBoardActions();

  return (
    <Toolbar className="absolute inset-x-0 bottom-2 z-10 mx-auto w-max max-w-[calc(100%-1rem)] flex-wrap justify-center gap-y-0.5 rounded-lg border bg-background p-1 shadow-sm">
      <BoardToolbarGroup>
        {TOOLS.map(({ icon, key, label, tool: itemTool }) =>
          itemTool === 'geo' ? (
            <BoardShapeMenu key={itemTool} pressed={tool === 'geo'} />
          ) : (
            <ToolbarButton
              key={itemTool}
              className="min-w-6 px-1"
              pressed={tool === itemTool}
              tooltip={`${label} (${key})`}
              onClick={() => setTool(itemTool)}
            >
              {icon}
            </ToolbarButton>
          )
        )}
        <BoardToolLock />
        <BoardPictureButton />
        <BoardExportMenu />
      </BoardToolbarGroup>
      <BoardToolbarGroup>
        <ToolbarButton
          className="min-w-6 px-1"
          tooltip="Zoom out (-)"
          onClick={zoomOut}
        >
          <ZoomOutIcon />
        </ToolbarButton>
        <BoardZoomLevel />
        <ToolbarButton
          className="min-w-6 px-1"
          tooltip="Zoom in (+)"
          onClick={zoomIn}
        >
          <ZoomInIcon />
        </ToolbarButton>
        <ToolbarButton
          className="min-w-6 px-1"
          tooltip="Fit every shape in view"
          onClick={fit}
        >
          <ScanIcon />
        </ToolbarButton>
        {frame && (
          <ToolbarButton
            className="min-w-6 px-1"
            tooltip="Remove the frame and keep its shapes"
            onClick={() => removeFrame(frame)}
          >
            <UngroupIcon />
          </ToolbarButton>
        )}
      </BoardToolbarGroup>
    </Toolbar>
  );
}

const STYLE_GRID_COLUMNS = 4;

const nextStyleOptionIndex = (
  key: string,
  index: number,
  length: number
): number | null => {
  if (key === 'Home') return 0;
  if (key === 'End') return length - 1;
  if (key === 'ArrowRight') return (index + 1) % length;
  if (key === 'ArrowLeft') return (index - 1 + length) % length;
  if (key === 'ArrowDown' || key === 'ArrowUp') {
    const forward = key === 'ArrowDown';

    if (length <= STYLE_GRID_COLUMNS) {
      return (index + (forward ? 1 : -1) + length) % length;
    }

    const next = index + (forward ? STYLE_GRID_COLUMNS : -STYLE_GRID_COLUMNS);

    if (next >= 0 && next < length) return next;

    const col = index % STYLE_GRID_COLUMNS;

    if (forward) return col;

    const lastRowStart =
      Math.floor((length - 1) / STYLE_GRID_COLUMNS) * STYLE_GRID_COLUMNS;

    return lastRowStart + col < length
      ? lastRowStart + col
      : lastRowStart - STYLE_GRID_COLUMNS + col;
  }

  return null;
};

function BoardStyleOptions<TValue extends string>({
  label,
  options,
  shown,
  onPick,
}: {
  label: string;
  options: ReadonlyArray<BoardStyleOption<TValue>>;
  shown: Readonly<{ mixed: false; value: TValue } | { mixed: true }>;
  onPick: (value: TValue) => void;
}) {
  const value = shown.mixed ? undefined : shown.value;
  const [focused, setFocused] = React.useState<number | null>(null);
  const stop =
    focused ??
    Math.max(
      0,
      options.findIndex((option) => option.value === value)
    );

  return (
    <div aria-label={label} className="grid grid-cols-4 gap-1" role="group">
      {options.map((option, index) => (
        <button
          key={option.value}
          className="flex size-7 items-center justify-center rounded-md outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-accent [&_svg]:size-4"
          aria-label={option.label}
          aria-pressed={option.value === value}
          tabIndex={index === stop ? 0 : -1}
          title={option.label}
          type="button"
          onBlur={(event) => {
            if (
              !event.currentTarget.parentElement?.contains(event.relatedTarget)
            ) {
              setFocused(null);
            }
          }}
          onClick={() => onPick(option.value)}
          onFocus={() => setFocused(index)}
          onKeyDown={(event) => {
            const nextIndex = nextStyleOptionIndex(
              event.key,
              index,
              options.length
            );

            if (nextIndex === null) return;
            event.preventDefault();
            const row =
              event.currentTarget.parentElement?.querySelectorAll('button');

            row?.[nextIndex]?.focus();
          }}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}

/**
 * Styles the selected shapes, or the next shape while a drawing tool is
 * active, with a row for each style they take other than opacity. On a board
 * narrower than 36rem it folds behind a Styles button.
 */
export function BoardStylePanel({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const styles = useBoardView((view) => view.styles);
  const writable = useBoardView((view) => view.writable);
  const { setStyle } = useBoardActions();
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);
  const visible = writable && Object.keys(styles).length > 0;
  const isOpen = open && visible;

  React.useEffect(() => {
    const button = buttonRef.current;

    if (!isOpen || !button) return undefined;

    const closeIfWide = () => {
      if (getComputedStyle(button).display === 'none') setOpen(false);
    };

    closeIfWide();

    const host = button.closest('[data-board]') ?? button.parentElement;

    if (!host || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(closeIfWide);

    observer.observe(host);

    return () => observer.disconnect();
  }, [isOpen]);

  if (!visible) {
    if (open) setOpen(false);

    return null;
  }

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- [P1 local-invariant] A press anywhere on the panel keeps focus where it is, so a shape being edited keeps its caret, and the narrow-board panel closes on blur or Escape.
    <div
      {...props}
      className={cn(
        'absolute top-2 end-2 z-10 flex max-h-[calc(100%-5.5rem)] flex-col items-end gap-1',
        className
      )}
      aria-label="Styles"
      data-board-dock="right"
      data-editor-root-chrome-ignore="true"
      role="group"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !isOpen) return;
        event.preventDefault();
        event.stopPropagation();
        buttonRef.current?.focus();
        setOpen(false);
      }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <button
        ref={buttonRef}
        className="flex size-8 items-center justify-center rounded-lg border bg-background shadow-sm outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-expanded:bg-accent @min-[36rem]:hidden [&_svg]:size-4"
        aria-expanded={isOpen}
        aria-label="Styles"
        title="Styles"
        type="button"
        onClick={(event) => {
          const button = event.currentTarget;

          flushSync(() => setOpen(!isOpen));
          (isOpen
            ? button
            : panel.current?.querySelector<HTMLElement>('[tabindex="0"]')
          )?.focus();
        }}
      >
        <PaletteIcon />
      </button>
      <div
        className={cn(
          isOpen ? 'flex' : 'hidden',
          'min-h-0 w-36 flex-col gap-2 overflow-y-auto overscroll-contain rounded-lg border bg-background p-2 shadow-sm @min-[36rem]:flex'
        )}
        aria-label={isOpen ? 'Styles' : undefined}
        ref={panel}
        role={isOpen ? 'dialog' : undefined}
      >
        {styles.geo && (
          <BoardStyleOptions
            label="Shape"
            options={GEO_OPTIONS}
            shown={styles.geo}
            onPick={(geo) => setStyle({ geo })}
          />
        )}
        {styles.fill && (
          <BoardStyleOptions
            label="Fill"
            options={FILL_OPTIONS}
            shown={styles.fill}
            onPick={(fill) => setStyle({ fill })}
          />
        )}
        {styles.strokeColor && (
          <BoardStyleOptions
            label="Outline"
            options={OUTLINE_OPTIONS}
            shown={styles.strokeColor}
            onPick={(strokeColor) => setStyle({ strokeColor })}
          />
        )}
        {styles.dash && (
          <BoardStyleOptions
            label="Line"
            options={DASH_OPTIONS}
            shown={styles.dash}
            onPick={(dash) => setStyle({ dash })}
          />
        )}
        {styles.strokeWidth && (
          <BoardStyleOptions
            label="Width"
            options={WIDTH_OPTIONS}
            shown={styles.strokeWidth}
            onPick={(strokeWidth) => setStyle({ strokeWidth })}
          />
        )}
        {styles.textSize && (
          <BoardStyleOptions
            label="Text size"
            options={TEXT_OPTIONS}
            shown={styles.textSize}
            onPick={(textSize) => setStyle({ textSize })}
          />
        )}
      </div>
    </div>
  );
}

const BOARD_FOCUS_RING =
  'has-[[data-board-focus]:focus-visible]:not-has-[[data-board-shape][data-selected]]:ring-[3px] has-[[data-board-focus]:focus-visible]:not-has-[[data-board-shape][data-selected]]:ring-ring/50';

const BOARD_ERASING = '[&_[data-board-shape][data-erasing]]:opacity-30';

const BOARD_RESIZE_HANDLE =
  '[&_[data-board-resize-corner="topLeft"]>[data-board-handle="topLeft"]]:scale-125 [&_[data-board-resize-corner="topLeft"]>[data-board-handle="topLeft"]]:border-primary! [&_[data-board-resize-corner="topLeft"]>[data-board-handle="topLeft"]]:bg-primary! [&_[data-board-resize-corner="topLeft"]>[data-board-handle="topLeft"]]:ring-2 [&_[data-board-resize-corner="topLeft"]>[data-board-handle="topLeft"]]:ring-ring [&_[data-board-resize-corner="topRight"]>[data-board-handle="topRight"]]:scale-125 [&_[data-board-resize-corner="topRight"]>[data-board-handle="topRight"]]:border-primary! [&_[data-board-resize-corner="topRight"]>[data-board-handle="topRight"]]:bg-primary! [&_[data-board-resize-corner="topRight"]>[data-board-handle="topRight"]]:ring-2 [&_[data-board-resize-corner="topRight"]>[data-board-handle="topRight"]]:ring-ring [&_[data-board-resize-corner="bottomRight"]>[data-board-handle="bottomRight"]]:scale-125 [&_[data-board-resize-corner="bottomRight"]>[data-board-handle="bottomRight"]]:border-primary! [&_[data-board-resize-corner="bottomRight"]>[data-board-handle="bottomRight"]]:bg-primary! [&_[data-board-resize-corner="bottomRight"]>[data-board-handle="bottomRight"]]:ring-2 [&_[data-board-resize-corner="bottomRight"]>[data-board-handle="bottomRight"]]:ring-ring [&_[data-board-resize-corner="bottomLeft"]>[data-board-handle="bottomLeft"]]:scale-125 [&_[data-board-resize-corner="bottomLeft"]>[data-board-handle="bottomLeft"]]:border-primary! [&_[data-board-resize-corner="bottomLeft"]>[data-board-handle="bottomLeft"]]:bg-primary! [&_[data-board-resize-corner="bottomLeft"]>[data-board-handle="bottomLeft"]]:ring-2 [&_[data-board-resize-corner="bottomLeft"]>[data-board-handle="bottomLeft"]]:ring-ring';

const CURSOR_RING =
  'data-board-cursor:after:pointer-events-none data-board-cursor:after:absolute data-board-cursor:after:-inset-1.5 data-board-cursor:after:rounded-md data-board-cursor:after:outline-2 data-board-cursor:after:outline-ring data-board-cursor:after:outline-dashed';

const BOARD_GRID =
  'bg-muted/40 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px]';

const boardToolbar = (
  <>
    <BoardToolbar />
    <BoardStylePanel />
  </>
);

export function BoardElement(props: EditorElementProps<typeof BoardPlugin>) {
  return (
    <BoardSurface
      {...props}
      attributes={{
        ...props.attributes,
        className: cn(
          '@container my-4 rounded-lg border data-selected:ring-2 data-selected:ring-ring',
          BOARD_COLORS,
          BOARD_ERASING,
          BOARD_FOCUS_RING,
          BOARD_GRID,
          BOARD_RESIZE_HANDLE
        ),
      }}
      messages={boardMessages}
      toolbar={boardToolbar}
    />
  );
}

export function BoardPageElement(
  props: EditorElementProps<typeof BoardPlugin>
) {
  return (
    <BoardSurface
      {...props}
      attributes={{
        ...props.attributes,
        className: cn(
          '@container ring-inset data-selected:ring-2 data-selected:ring-ring',
          BOARD_COLORS,
          BOARD_ERASING,
          BOARD_FOCUS_RING,
          BOARD_GRID,
          BOARD_RESIZE_HANDLE
        ),
      }}
      height="100%"
      messages={boardMessages}
      toolbar={boardToolbar}
    />
  );
}

export function BoardNoteElement(
  props: EditorElementProps<typeof BoardNotePlugin>
) {
  const { element } = props;

  return (
    <BoardShape
      {...props}
      className={cn(
        CURSOR_RING,
        'rounded-sm p-3 leading-snug data-selected:outline-2 data-selected:outline-ring data-[editor-authored-change]:outline-2 data-[editor-authored-change]:outline-[color:var(--suggestion-fg,var(--editor-primary,_var(--primary)))] data-[editor-authored-change]:outline-dashed'
      )}
      style={{ fontSize: TEXT_SIZES[element.textSize] }}
    >
      <div
        className="absolute inset-0 rounded-sm shadow-md"
        contentEditable={false}
        data-board-note-paper=""
        style={{
          backgroundColor:
            element.fill === 'none' ? 'var(--background)' : tint(element.fill),
          opacity: element.opacity,
        }}
      />
      <div
        className={cn('relative', SHAPE_HEADINGS)}
        style={{ opacity: element.opacity }}
      >
        {props.children}
      </div>
    </BoardShape>
  );
}

export function BoardTextElement(
  props: EditorElementProps<typeof BoardTextPlugin>
) {
  const { element } = props;

  return (
    <BoardShape
      {...props}
      className={cn(
        CURSOR_RING,
        'rounded-sm px-1.5 py-0.5 leading-snug text-foreground data-selected:outline-2 data-selected:outline-ring data-[editor-authored-change]:outline-2 data-[editor-authored-change]:outline-[color:var(--suggestion-fg,var(--editor-primary,_var(--primary)))] data-[editor-authored-change]:outline-dashed'
      )}
      style={{ fontSize: TEXT_SIZES[element.textSize] }}
    >
      <div
        className={cn('relative flow-root', SHAPE_HEADINGS)}
        style={{ opacity: element.opacity }}
      >
        {props.children}
      </div>
    </BoardShape>
  );
}

export function BoardGeoElement(
  props: EditorElementProps<typeof BoardGeoPlugin>
) {
  const { element } = props;
  const width = STROKE_WIDTHS[element.strokeWidth];

  return (
    <BoardShape
      {...props}
      className={cn(
        CURSOR_RING,
        'flex flex-col justify-center p-3 text-center leading-snug data-selected:outline-2 data-selected:outline-offset-2 data-selected:outline-ring data-[editor-authored-change]:outline-2 data-[editor-authored-change]:outline-offset-2 data-[editor-authored-change]:outline-[color:var(--suggestion-fg,var(--editor-primary,_var(--primary)))] data-[editor-authored-change]:outline-dashed'
      )}
      style={{ fontSize: TEXT_SIZES[element.textSize] }}
    >
      <div
        className="absolute inset-0"
        contentEditable={false}
        style={{ opacity: element.opacity }}
      >
        <svg
          aria-hidden
          className="pointer-events-none size-full overflow-visible"
          data-board-geo-outline={element.geo}
          preserveAspectRatio="none"
          strokeDasharray={dashArray(element.dash, width)}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={width}
          style={{
            fill: element.fill === 'none' ? 'none' : tint(element.fill),
            stroke: paint(element.strokeColor),
          }}
          viewBox="0 0 100 100"
        >
          {geoOutline(element.geo, {
            height: 100,
            vectorEffect: 'non-scaling-stroke',
            width: 100,
          })}
        </svg>
      </div>
      <div
        className={cn('relative', SHAPE_HEADINGS)}
        style={{ opacity: element.opacity }}
      >
        {props.children}
      </div>
    </BoardShape>
  );
}

export function BoardFrameElement(
  props: EditorElementProps<typeof BoardFramePlugin>
) {
  return (
    <BoardShape
      {...props}
      className={cn(
        CURSOR_RING,
        'rounded-sm border-2 border-foreground/50 data-selected:border-ring data-[editor-authored-change]:border-dashed data-[editor-authored-change]:border-[color:var(--suggestion-fg,var(--editor-primary,_var(--primary)))]'
      )}
    >
      <div
        className="absolute bottom-full [left:0] max-w-full cursor-default truncate pb-1 text-xs text-muted-foreground select-none"
        contentEditable={false}
        data-board-frame-name=""
      >
        {props.element.name || 'Frame'}
      </div>
      {props.children}
    </BoardShape>
  );
}

// A suggested arrow or pen line keeps the suggestion's color over its own.
const SUGGESTED_INK =
  'data-[editor-authored-change]:text-[var(--suggestion-fg,var(--editor-primary,_var(--primary)))] [&[data-editor-authored-change]_[data-board-ink]]:text-[var(--suggestion-fg,var(--editor-primary,_var(--primary)))]!';

export function BoardArrowElement(
  props: EditorElementProps<typeof BoardArrowPlugin>
) {
  const { element } = props;
  const width = STROKE_WIDTHS[element.strokeWidth];
  const hitWidth = Math.max(14, width + 10);

  return (
    <BoardShape
      {...props}
      className={cn(
        'text-foreground [&[data-board-cursor]_[data-board-arrow-halo]]:inline [&[data-selected]_[data-board-arrow-halo]]:inline',
        SUGGESTED_INK
      )}
      style={{ fontSize: TEXT_SIZES[element.textSize] }}
    >
      <div className="absolute top-0 [left:0]" contentEditable={false}>
        <svg
          aria-hidden
          className="pointer-events-none overflow-visible"
          height={1}
          width={1}
        >
          <BoardArrowPath
            pointerEvents="stroke"
            stroke="transparent"
            strokeWidth={hitWidth}
          />
          <BoardArrowPath
            className="hidden stroke-ring/50"
            data-board-arrow-halo=""
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={width + 8}
          />
          <g
            data-board-ink=""
            opacity={element.opacity}
            style={{ color: paint(element.strokeColor) }}
          >
            <BoardArrowPath
              data-board-arrow-path=""
              fill="none"
              stroke="currentColor"
              strokeDasharray={dashArray(element.dash, width)}
              strokeLinecap="round"
              strokeWidth={width}
            />
            <BoardArrowhead>
              <polygon fill="currentColor" points={ARROW_HEAD} />
            </BoardArrowhead>
          </g>
        </svg>
      </div>
      <BoardArrowLabel
        className="min-w-4 rounded-sm px-1 text-center leading-snug whitespace-nowrap has-[[data-editor-string]]:bg-background"
        style={{ opacity: element.opacity }}
      >
        {props.children}
      </BoardArrowLabel>
    </BoardShape>
  );
}

export function BoardStrokeElement(
  props: EditorElementProps<typeof BoardStrokePlugin>
) {
  const { element } = props;
  const drawn = useStrokePath(element);

  return (
    <BoardShape
      {...props}
      className={cn(
        CURSOR_RING,
        SUGGESTED_INK,
        'text-foreground data-selected:outline-1 data-selected:outline-ring data-selected:outline-dashed'
      )}
    >
      {drawn && (
        <div
          className="absolute inset-0"
          contentEditable={false}
          data-board-ink=""
          style={{
            color: paint(element.strokeColor),
            opacity: element.opacity,
          }}
        >
          <svg
            aria-hidden
            className="pointer-events-none size-full overflow-visible"
            preserveAspectRatio="none"
            viewBox={`0 0 ${drawn.width} ${drawn.height}`}
          >
            <path
              d={drawn.path}
              data-board-stroke-path=""
              fill="currentColor"
            />
          </svg>
        </div>
      )}
      {props.children}
    </BoardShape>
  );
}

export function BoardImageElement(
  props: EditorElementProps<typeof BoardImagePlugin>
) {
  const { element, slots } = props;
  const editor = useEditor();
  const path = usePath();
  const image = editor.plugin(ImagePlugin);
  const child = useEditorSelector(
    (current) => current.read.nodes.get([...path, 0])?.[0],
    { dependsOn: { nodeKey: editor.key(element) } }
  );
  const picture =
    image.installed &&
    ElementApi.isElement(child) &&
    child.type === image.schema.type
      ? (child as ImageElement)
      : undefined;

  return (
    <BoardShape
      {...props}
      className={cn(
        CURSOR_RING,
        'data-selected:outline-2 data-selected:outline-ring data-[editor-authored-change]:outline-2 data-[editor-authored-change]:outline-[color:var(--suggestion-fg,var(--editor-primary,_var(--primary)))] data-[editor-authored-change]:outline-dashed'
      )}
    >
      {picture
        ? slots.contentBoundary({
            children: (
              // oxlint-disable-next-line nextjs/no-img-element -- [P1 local-invariant] The shape draws the document-owned runtime URL across its box, outside any Next loader.
              <img
                alt={picture.alt}
                className="absolute inset-0 size-full object-contain select-none"
                decoding="async"
                draggable={false}
                src={picture.url}
              />
            ),
            copyPolicy: 'model',
            mounted: false,
            reason: 'app-hidden',
            scope: { from: 0, type: 'children' },
            selectionPolicy: 'skip',
          })
        : props.children}
    </BoardShape>
  );
}

const BoardShapeKit = [
  BoardNotePlugin.configure({ component: BoardNoteElement }),
  BoardTextPlugin.configure({ component: BoardTextElement }),
  BoardGeoPlugin.configure({ component: BoardGeoElement }),
  BoardArrowPlugin.configure({ component: BoardArrowElement }),
  BoardFramePlugin.configure({ component: BoardFrameElement }),
  BoardStrokePlugin.configure({ component: BoardStrokeElement }),
];

export const BoardKit = [
  BoardPlugin.configure({ component: BoardElement }),
  ...BoardShapeKit,
];

export const BoardPageKit = [
  BoardPlugin.configure({ component: BoardPageElement }),
  ...BoardShapeKit,
];

export const BoardImageKit = [
  BoardImagePlugin.configure({ component: BoardImageElement }),
];
