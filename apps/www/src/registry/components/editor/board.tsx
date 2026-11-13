'use client';

import {
  BoardArrowPlugin,
  BoardFramePlugin,
  BoardGeoPlugin,
  type BoardMessages,
  BoardNotePlugin,
  BoardPlugin,
  BoardShape,
  type BoardShapeDescription,
  BoardStrokePlugin,
  BoardSurface,
  type BoardTool,
  useArrowPath,
  useBoardActions,
  useBoardView,
  useStrokePath,
} from 'platejs/board/react';
import type { EditorElementProps } from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Toolbar, ToolbarButton } from '@/registry/components/editor/toolbar';

const TOOLS: ReadonlyArray<
  Readonly<{ key: string; label: string; tool: BoardTool }>
> = [
  { key: 'V', label: 'Select', tool: 'select' },
  { key: 'N', label: 'Note', tool: 'note' },
  { key: 'R', label: 'Shape', tool: 'geo' },
  { key: 'A', label: 'Arrow', tool: 'arrow' },
  { key: 'F', label: 'Frame', tool: 'frame' },
  { key: 'P', label: 'Pen', tool: 'pen' },
];

const KINDS: Readonly<Record<BoardShapeDescription['kind'], string>> = {
  arrow: 'Arrow',
  frame: 'Frame',
  geo: 'Shape',
  note: 'Note',
  shape: 'Shape',
  stroke: 'Line',
};

const TOOL_NAMES: Readonly<Record<BoardTool, string>> = {
  arrow: 'Arrow tool',
  frame: 'Frame tool',
  geo: 'Shape tool',
  note: 'Note tool',
  pen: 'Pen tool',
  select: 'Select tool',
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

const boardMessages: BoardMessages = {
  label: 'Board',
  instructions:
    'Enter selects the first shape. Tab moves between shapes and leaves them after the last.',
  shape: (shape, { position, total }) =>
    `${nameOf(shape)}. ${position} of ${total}`,
  shapes: (count) => `${count} shapes selected`,
  tool: (tool) => TOOL_NAMES[tool],
  removed: (count) =>
    count === 1 ? 'Shape deleted' : `${count} shapes deleted`,
};

export function BoardToolbar() {
  const tool = useBoardView((view) => view.tool);
  const frame = useBoardView((view) => view.selectedFrame);
  const { removeFrame, setTool } = useBoardActions();

  return (
    <Toolbar className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 gap-0.5 rounded-lg border bg-background p-1 shadow-sm">
      {TOOLS.map((item) => (
        <ToolbarButton
          key={item.tool}
          pressed={tool === item.tool}
          tooltip={`${item.label} (${item.key})`}
          onClick={() => setTool(item.tool)}
        >
          {item.label}
        </ToolbarButton>
      ))}
      {frame && (
        <ToolbarButton
          tooltip="Remove the frame and keep its shapes"
          onClick={() => removeFrame(frame)}
        >
          Remove frame
        </ToolbarButton>
      )}
    </Toolbar>
  );
}

const BOARD_FOCUS_RING =
  'has-[[data-board-focus]:focus-visible]:not-has-[[data-board-shape][data-selected]]:ring-[3px] has-[[data-board-focus]:focus-visible]:not-has-[[data-board-shape][data-selected]]:ring-ring/50';

const BOARD_GRID =
  'bg-muted/40 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px]';

export function BoardElement(props: EditorElementProps<typeof BoardPlugin>) {
  return (
    <BoardSurface
      {...props}
      attributes={{
        ...props.attributes,
        className: cn(
          'my-4 rounded-lg border data-selected:ring-2 data-selected:ring-ring',
          BOARD_FOCUS_RING,
          BOARD_GRID
        ),
      }}
      messages={boardMessages}
      toolbar={<BoardToolbar />}
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
          'ring-inset data-selected:ring-2 data-selected:ring-ring',
          BOARD_FOCUS_RING,
          BOARD_GRID
        ),
      }}
      height="100%"
      messages={boardMessages}
      toolbar={<BoardToolbar />}
    />
  );
}

export function BoardNoteElement(
  props: EditorElementProps<typeof BoardNotePlugin>
) {
  return (
    <BoardShape
      {...props}
      className="rounded-sm p-3 text-sm shadow-md data-selected:outline-2 data-selected:outline-ring data-[editor-authored-change]:outline-2 data-[editor-authored-change]:outline-emerald-600 data-[editor-authored-change]:outline-dashed"
      style={{
        backgroundColor: `color-mix(in oklab, ${props.element.fill} 30%, var(--background))`,
      }}
    />
  );
}

const GEO_OUTLINES = {
  diamond: (
    <polygon
      points="50,0 100,50 50,100 0,50"
      vectorEffect="non-scaling-stroke"
    />
  ),
  ellipse: (
    <ellipse
      cx={50}
      cy={50}
      rx={50}
      ry={50}
      vectorEffect="non-scaling-stroke"
    />
  ),
  rectangle: (
    <rect height={100} vectorEffect="non-scaling-stroke" width={100} />
  ),
  triangle: (
    <polygon points="50,0 100,100 0,100" vectorEffect="non-scaling-stroke" />
  ),
};

export function BoardGeoElement(
  props: EditorElementProps<typeof BoardGeoPlugin>
) {
  return (
    <BoardShape
      {...props}
      className="flex flex-col justify-center p-3 text-center text-sm data-selected:outline-2 data-selected:outline-offset-2 data-selected:outline-ring data-[editor-authored-change]:outline-2 data-[editor-authored-change]:outline-offset-2 data-[editor-authored-change]:outline-emerald-600 data-[editor-authored-change]:outline-dashed"
    >
      <div className="absolute inset-0" contentEditable={false}>
        <svg
          aria-hidden
          className="pointer-events-none size-full overflow-visible"
          data-board-geo-outline={props.element.geo}
          fill={props.element.fill}
          preserveAspectRatio="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 100 100"
        >
          {GEO_OUTLINES[props.element.geo]}
        </svg>
      </div>
      <div className="relative">{props.children}</div>
    </BoardShape>
  );
}

export function BoardFrameElement(
  props: EditorElementProps<typeof BoardFramePlugin>
) {
  return (
    <BoardShape
      {...props}
      className="rounded-sm border-2 border-foreground/50 data-selected:border-ring data-[editor-authored-change]:border-dashed data-[editor-authored-change]:border-emerald-600"
    >
      <div
        className="absolute bottom-full left-0 max-w-full cursor-default truncate pb-1 text-xs text-muted-foreground select-none"
        contentEditable={false}
        data-board-frame-name=""
      >
        {props.element.name || 'Frame'}
      </div>
      {props.children}
    </BoardShape>
  );
}

const HEAD_LENGTH = 12;

export function BoardArrowElement(
  props: EditorElementProps<typeof BoardArrowPlugin>
) {
  const drawn = useArrowPath(props.element);

  if (!drawn) return <BoardShape {...props} />;

  const { end, path, start } = drawn;
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const barb = (turn: number) =>
    `${end.x - HEAD_LENGTH * Math.cos(angle + turn)},${
      end.y - HEAD_LENGTH * Math.sin(angle + turn)
    }`;

  return (
    <BoardShape
      {...props}
      className="text-foreground data-selected:text-ring data-[editor-authored-change]:text-emerald-600"
    >
      <div className="absolute top-0 left-0" contentEditable={false}>
        <svg
          aria-hidden
          className="pointer-events-none overflow-visible"
          height={1}
          width={1}
        >
          <path
            d={path}
            pointerEvents="stroke"
            stroke="transparent"
            strokeWidth={14}
          />
          <path
            d={path}
            data-board-arrow-path=""
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          />
          <polygon
            fill="currentColor"
            points={`${end.x},${end.y} ${barb(0.45)} ${barb(-0.45)}`}
          />
        </svg>
      </div>
      <div
        className="absolute min-w-4 -translate-1/2 rounded-sm px-1 text-center text-xs whitespace-nowrap has-[[data-editor-string]]:bg-background"
        data-board-arrow-label=""
        style={{ left: (start.x + end.x) / 2, top: (start.y + end.y) / 2 }}
      >
        {props.children}
      </div>
    </BoardShape>
  );
}

export function BoardStrokeElement(
  props: EditorElementProps<typeof BoardStrokePlugin>
) {
  const drawn = useStrokePath(props.element);

  return (
    <BoardShape
      {...props}
      className="text-foreground data-selected:outline-1 data-selected:outline-ring data-selected:outline-dashed data-[editor-authored-change]:text-emerald-600"
    >
      {drawn && (
        <div className="absolute inset-0" contentEditable={false}>
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

const BoardShapeKit = [
  BoardNotePlugin.configure({ component: BoardNoteElement }),
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
