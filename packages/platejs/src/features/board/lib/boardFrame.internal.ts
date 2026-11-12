import { type Element, ElementApi, type Node } from '../../../core';
import {
  type BoardPlace,
  type BoardSize,
  isBoardPlace,
  isBoardSize,
} from './boardShape.internal';

export const BOARD_FRAME_TYPE = 'boardFrame';

export const BOARD_FRAME_SIZE: BoardSize = { height: 400, width: 640 };

/**
 * A frame's place: its top-left corner, and the origin its members measure
 * from, which only a move of the frame changes.
 */
export type BoardFramePlace = Readonly<{
  origin: BoardPlace;
  x: number;
  y: number;
}>;

/**
 * The stored place of a shape that is no frame: a board point, or, inside a
 * frame, a point measured from that frame's `origin`, with `frameOrigin` the
 * origin the frame had when the shape joined it.
 */
export type BoardShapePlace =
  | BoardPlace
  | Readonly<{ frame: string; frameOrigin: BoardPlace; x: number; y: number }>;

export const isBoardShapePlace = (value: unknown): value is BoardShapePlace => {
  if (typeof value !== 'object' || value === null) return false;

  const { frame, frameOrigin, x, y, ...rest } = value as Record<
    string,
    unknown
  >;

  if (Object.keys(rest).length > 0 || !isBoardPlace({ x, y })) return false;
  if (frame === undefined && frameOrigin === undefined) return true;

  return (
    typeof frame === 'string' && frame.length > 0 && isBoardPlace(frameOrigin)
  );
};

export const isBoardFramePlace = (value: unknown): value is BoardFramePlace => {
  if (typeof value !== 'object' || value === null) return false;

  const { origin, x, y, ...rest } = value as Record<string, unknown>;

  return (
    Object.keys(rest).length === 0 &&
    isBoardPlace({ x, y }) &&
    isBoardPlace(origin)
  );
};

/** Frames paint behind every other member: layer 0 holds frames, 1 the rest. */
export const boardLayerOf = (type: string): 0 | 1 =>
  type === BOARD_FRAME_TYPE ? 0 : 1;

export type BoardFrameBox = Readonly<{
  id: string;
  origin: BoardPlace;
  place: BoardPlace;
  size: BoardSize;
  zIndex: string;
}>;

/**
 * The frame `node` is, read from its raw properties. Only slice content and
 * the inserts of the board's member plugins read frames this way, since they
 * hold no board property handles; the board reads its members through
 * `boardMembersOf`. Slice content may carry no `shapeId` or `zIndex`, which
 * read as empty.
 */
export const boardFrameOf = (
  node: Node | undefined
): BoardFrameBox | undefined =>
  node &&
  ElementApi.isElement(node) &&
  node.type === BOARD_FRAME_TYPE &&
  isBoardFramePlace(node.place) &&
  isBoardSize(node.size)
    ? {
        id: typeof node.shapeId === 'string' ? node.shapeId : '',
        origin: node.place.origin,
        place: { x: node.place.x, y: node.place.y },
        size: node.size,
        zIndex: typeof node.zIndex === 'string' ? node.zIndex : '',
      }
    : undefined;

export type BoardFrameableNode = Element &
  Readonly<{ place: BoardShapePlace; size: BoardSize }>;

export const isFrameable = (node: Node): node is BoardFrameableNode =>
  ElementApi.isElement(node) &&
  node.type !== BOARD_FRAME_TYPE &&
  isBoardShapePlace(node.place) &&
  isBoardSize(node.size);

export const boardFramesIn = (shapes: readonly Node[]) =>
  new Map(
    shapes.flatMap((node) => {
      const frame = boardFrameOf(node);

      return frame ? [[frame.id, frame] as const] : [];
    })
  );

/**
 * Where a stored place puts its shape on the board, and the frame that holds
 * it. A place that names a frame `frameOf` cannot find reads from the origin
 * it saved, in no frame.
 */
export const boardPointOf = (
  place: BoardShapePlace,
  frameOf: (id: string) => BoardFrameBox | undefined
): Readonly<{ frame?: string; point: BoardPlace }> => {
  if (!('frame' in place)) return { point: { x: place.x, y: place.y } };

  const frame = frameOf(place.frame);

  return frame
    ? {
        frame: frame.id,
        point: { x: frame.origin.x + place.x, y: frame.origin.y + place.y },
      }
    : { point: savedPointOf(place) };
};

/** Where a place puts its shape by the frame origin it saved. */
export const savedPointOf = (place: BoardShapePlace): BoardPlace =>
  'frame' in place
    ? { x: place.frameOrigin.x + place.x, y: place.frameOrigin.y + place.y }
    : { x: place.x, y: place.y };

/** The place that keeps a shape at board point `point` inside `frame`. */
export const framedPlace = (
  frame: Pick<BoardFrameBox, 'id' | 'origin'>,
  point: BoardPlace
): BoardShapePlace => ({
  frame: frame.id,
  frameOrigin: frame.origin,
  x: point.x - frame.origin.x,
  y: point.y - frame.origin.y,
});

type Box = Readonly<{ place: BoardPlace; size: BoardSize }>;

export const boxesOverlap = (a: Box, b: Box) =>
  a.place.x < b.place.x + b.size.width &&
  b.place.x < a.place.x + a.size.width &&
  a.place.y < b.place.y + b.size.height &&
  b.place.y < a.place.y + a.size.height;

export const boxHolds = (outer: Box, inner: Box) =>
  inner.place.x >= outer.place.x &&
  inner.place.y >= outer.place.y &&
  inner.place.x + inner.size.width <= outer.place.x + outer.size.width &&
  inner.place.y + inner.size.height <= outer.place.y + outer.size.height;

const paintsAbove = (a: BoardFrameBox, b: BoardFrameBox) =>
  a.zIndex === b.zIndex ? a.id > b.id : a.zIndex > b.zIndex;

/**
 * The stored place for a shape at `box` among `frames`: in the frame
 * `requested` names when the box overlaps it, else in the frontmost frame
 * under its middle, else on the board. A shape that stays in the frame its
 * `current` place names keeps the origin it saved.
 */
export const placeAmong = (
  frames: Iterable<BoardFrameBox>,
  box: Box,
  {
    current,
    requested,
  }: Readonly<{ current?: BoardShapePlace; requested?: string }> = {}
): BoardShapePlace => {
  const middle = {
    place: {
      x: box.place.x + box.size.width / 2,
      y: box.place.y + box.size.height / 2,
    },
    size: { height: 0, width: 0 },
  };
  let named: BoardFrameBox | undefined;
  let under: BoardFrameBox | undefined;

  for (const candidate of frames) {
    if (candidate.id === requested && boxesOverlap(candidate, box)) {
      named = candidate;
    }
    if (
      boxHolds(candidate, middle) &&
      (!under || paintsAbove(candidate, under))
    ) {
      under = candidate;
    }
  }

  const frame = named ?? under;

  if (!frame) return { x: box.place.x, y: box.place.y };

  const placed = framedPlace(frame, box.place);

  return current && 'frame' in current && current.frame === frame.id
    ? { ...placed, frameOrigin: current.frameOrigin }
    : placed;
};
