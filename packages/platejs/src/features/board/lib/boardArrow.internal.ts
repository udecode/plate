import { ElementApi, type Node } from '../../../core';
import type { BoardMemberEntry } from './boardMember.internal';
import {
  type BoardPlace,
  type BoardSize,
  isBoardPlace,
} from './boardShape.internal';

export const BOARD_ARROW_TYPE = 'boardArrow';

/** Where an arrow end aims in its shape, as fractions of the shape's box. */
export type BoardArrowAnchor = readonly [number, number];

/**
 * One end of an arrow: bound to a shape, with the board point the board last
 * wrote for it, or free at a board point.
 */
export type BoardArrowEnd =
  | BoardPlace
  | Readonly<{ anchor: BoardArrowAnchor; shape: string; x: number; y: number }>;

/** An arrow's two drawn ends, in board coordinates. */
export type BoardArrowEnds = Readonly<{ end: BoardPlace; start: BoardPlace }>;

export type BoardOutline = 'diamond' | 'ellipse' | 'rectangle' | 'triangle';

export type BoardArrowTarget = Readonly<{
  outline: BoardOutline;
  place: BoardPlace;
  size: BoardSize;
}>;

const isFraction = (value: unknown) =>
  typeof value === 'number' && value >= 0 && value <= 1;

const isAnchor = (value: unknown): value is BoardArrowAnchor =>
  Array.isArray(value) &&
  value.length === 2 &&
  isFraction(value[0]) &&
  isFraction(value[1]);

export const isBoardArrowEnd = (value: unknown): value is BoardArrowEnd => {
  if (typeof value !== 'object' || value === null) return false;

  const { anchor, shape, x, y, ...rest } = value as Record<string, unknown>;

  if (Object.keys(rest).length > 0 || !isBoardPlace({ x, y })) return false;
  if (anchor === undefined && shape === undefined) return true;

  return typeof shape === 'string' && shape.length > 0 && isAnchor(anchor);
};

export const isBoundArrowEnd = (
  end: BoardArrowEnd
): end is Extract<BoardArrowEnd, { shape: string }> => 'shape' in end;

/** Which end of an arrow. */
export type BoardArrowSide = 'end' | 'start';

export const ARROW_SIDES: readonly BoardArrowSide[] = ['start', 'end'];

export const arrowEndsOf = (
  node: Node
): Readonly<Record<BoardArrowSide, BoardArrowEnd>> | null =>
  ElementApi.isElement(node) &&
  node.type === BOARD_ARROW_TYPE &&
  isBoardArrowEnd(node.start) &&
  isBoardArrowEnd(node.end)
    ? { end: node.end, start: node.start }
    : null;

const OUTLINES: readonly BoardOutline[] = [
  'diamond',
  'ellipse',
  'rectangle',
  'triangle',
];

const isOutline = (value: unknown): value is BoardOutline =>
  OUTLINES.some((outline) => outline === value);

export const boardArrowTargetOf = ({
  geo,
  place,
  size,
}: Readonly<{
  geo?: unknown;
  place: BoardPlace;
  size: BoardSize;
}>): BoardArrowTarget => ({
  outline: isOutline(geo) ? geo : 'rectangle',
  place,
  size,
});

/**
 * Where the arrows of the board root `root` may bind: each frame and shape of
 * that root that `memberOf` finds, never an arrow.
 */
export const boardTargetsOn =
  (memberOf: (id: string) => BoardMemberEntry | null, root: string) =>
  (id: string): BoardArrowTarget | undefined => {
    const member = memberOf(id);

    return member && member.kind !== 'arrow' && member.root === root
      ? boardArrowTargetOf({
          geo: member.node.geo,
          place: member.place,
          size: member.size,
        })
      : undefined;
  };

// The segment and ellipse intersections below are adapted from Excalidraw's
// @excalidraw/math (MIT, Copyright (c) 2020 Excalidraw).

const cross = (a: BoardPlace, b: BoardPlace) => a.x * b.y - a.y * b.x;

const segmentHit = (
  from: BoardPlace,
  to: BoardPlace,
  a: BoardPlace,
  b: BoardPlace
) => {
  const r = { x: to.x - from.x, y: to.y - from.y };
  const s = { x: b.x - a.x, y: b.y - a.y };
  const denominator = cross(r, s);

  if (denominator === 0) return [];

  const i = { x: a.x - from.x, y: a.y - from.y };
  const t = cross(i, s) / denominator;
  const u = cross(i, r) / denominator;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [t] : [];
};

const ellipseHits = (
  from: BoardPlace,
  to: BoardPlace,
  { place, size }: BoardArrowTarget
) => {
  const rx = size.width / 2;
  const ry = size.height / 2;
  const direction = { x: to.x - from.x, y: to.y - from.y };
  const offset = { x: from.x - place.x - rx, y: from.y - place.y - ry };
  const a =
    (direction.x * direction.x) / (rx * rx) +
    (direction.y * direction.y) / (ry * ry);
  const b =
    (direction.x * offset.x) / (rx * rx) + (direction.y * offset.y) / (ry * ry);
  const c =
    (offset.x * offset.x) / (rx * rx) + (offset.y * offset.y) / (ry * ry) - 1;
  const d = b * b - a * c;

  if (a === 0 || d < 0) return [];

  return [(-b - Math.sqrt(d)) / a, (-b + Math.sqrt(d)) / a].filter(
    (t) => t >= 0 && t <= 1
  );
};

const corners = ({ outline, place: { x, y }, size }: BoardArrowTarget) => {
  const { height: h, width: w } = size;

  if (outline === 'diamond') {
    return [
      { x: x + w / 2, y },
      { x: x + w, y: y + h / 2 },
      { x: x + w / 2, y: y + h },
      { x, y: y + h / 2 },
    ];
  }
  if (outline === 'triangle') {
    return [
      { x: x + w / 2, y },
      { x: x + w, y: y + h },
      { x, y: y + h },
    ];
  }

  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
};

const MIN_ELLIPSE_SIDES = 8;

/**
 * The corners of a target's outline, with an ellipse as a polygon whose sides
 * stay within one screen pixel of the ellipse at `zoom`.
 */
export const boardOutlineOf = (
  target: BoardArrowTarget,
  zoom: number
): readonly BoardPlace[] => {
  if (target.outline !== 'ellipse') return corners(target);

  const {
    place: { x, y },
    size,
  } = target;
  const rx = size.width / 2;
  const ry = size.height / 2;
  // The middle of each side sits radius * (1 - cos(PI / sides)) inside the
  // ellipse, so a large ellipse seen up close needs more sides.
  const sides = Math.max(
    MIN_ELLIPSE_SIDES,
    Math.ceil(
      Math.PI / Math.acos(Math.max(0, 1 - 1 / (Math.max(rx, ry) * zoom)))
    )
  );

  return Array.from({ length: sides }, (_, at) => {
    const angle = (2 * Math.PI * at) / sides;

    return {
      x: x + rx + rx * Math.cos(angle),
      y: y + ry + ry * Math.sin(angle),
    };
  });
};

const stopAt = (from: BoardPlace, to: BoardPlace, target: BoardArrowTarget) => {
  const points = corners(target);
  const hits =
    target.outline === 'ellipse'
      ? ellipseHits(from, to, target)
      : points.flatMap((a, index) =>
          segmentHit(from, to, a, points[(index + 1) % points.length])
        );

  if (hits.length === 0) return to;

  const t = Math.min(...hits);

  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
};

export const resolveBoardArrow = (
  arrow: Readonly<{ end: BoardArrowEnd; start: BoardArrowEnd }>,
  targetOnBoard: ReturnType<typeof boardTargetsOn>
): BoardArrowEnds => {
  const bind = (end: BoardArrowEnd) => {
    const target = isBoundArrowEnd(end) ? targetOnBoard(end.shape) : undefined;

    if (!target || !isBoundArrowEnd(end)) {
      return { aim: { x: end.x, y: end.y }, target: undefined };
    }

    return {
      aim: {
        x: target.place.x + end.anchor[0] * target.size.width,
        y: target.place.y + end.anchor[1] * target.size.height,
      },
      target,
    };
  };
  const start = bind(arrow.start);
  const end = bind(arrow.end);

  return {
    end: end.target ? stopAt(start.aim, end.aim, end.target) : end.aim,
    start: start.target ? stopAt(end.aim, start.aim, start.target) : start.aim,
  };
};
