import type { BoardStyle } from 'platejs/board/react';
import * as React from 'react';

export const COLORS = [
  { color: 'grey', label: 'Grey' },
  { color: 'red', label: 'Red' },
  { color: 'orange', label: 'Orange' },
  { color: 'yellow', label: 'Yellow' },
  { color: 'green', label: 'Green' },
  { color: 'blue', label: 'Blue' },
  { color: 'violet', label: 'Violet' },
] as const;

export const BOARD_COLORS =
  '[--board-blue:#4263eb] [--board-green:#2f9e44] [--board-grey:#868e96] [--board-orange:#f76707] [--board-red:#e03131] [--board-violet:#7048e8] [--board-yellow:#fab005] dark:[--board-blue:#5c7cfa] dark:[--board-green:#51cf66] dark:[--board-grey:#adb5bd] dark:[--board-orange:#ff922b] dark:[--board-red:#ff6b6b] dark:[--board-violet:#9775fa] dark:[--board-yellow:#fcc419]';

const NAMED_COLORS = new Set<string>(COLORS.map(({ color }) => color));

export const paint = (color: string) =>
  NAMED_COLORS.has(color) ? `var(--board-${color})` : color;

export const tint = (fill: string) =>
  `color-mix(in oklab, ${paint(fill)} 30%, var(--background))`;

export const STROKE_WIDTHS: Readonly<
  Record<NonNullable<BoardStyle['strokeWidth']>, number>
> = { l: 3.5, m: 2, s: 1, xl: 5 };

export const TEXT_SIZES: Readonly<
  Record<NonNullable<BoardStyle['textSize']>, string>
> = { l: '1.125rem', m: '0.875rem', s: '0.75rem', xl: '1.5rem' };

export const dashArray = (dash: BoardStyle['dash'], width: number) => {
  if (dash === 'dashed') return `${width * 3} ${width * 2}`;
  if (dash === 'dotted') return `0 ${width * 2}`;

  return undefined;
};

// Headings size against the shape's text size instead of the page's.
export const SHAPE_HEADINGS =
  '[&_h1]:text-[2.25em] [&_h2]:text-[1.5em] [&_h3]:text-[1.25em] [&_h4]:text-[1.125em] [&_h5]:text-[1.125em] [&_h6]:text-[1em]';

export const GEO_OUTLINES = {
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

const HEAD_LENGTH = 12;
const BARB_TURN = 0.45;

type Point = Readonly<{ x: number; y: number }>;

/** The arrowhead's triangle at `end`, pointing along the line from `start`. */
export const arrowHead = (start: Point, end: Point) => {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const barb = (turn: number) =>
    `${end.x - HEAD_LENGTH * Math.cos(angle + turn)},${
      end.y - HEAD_LENGTH * Math.sin(angle + turn)
    }`;

  return `${end.x},${end.y} ${barb(BARB_TURN)} ${barb(-BARB_TURN)}`;
};
