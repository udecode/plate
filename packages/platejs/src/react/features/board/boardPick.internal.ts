import type {
  BoardFrameEntry,
  BoardMemberEntry,
  BoardPlace,
  BoardSize,
} from '../../../features/board/lib';
import {
  BOARD_FRAME_SIZE,
  readBackPointOf,
} from '../../../features/board/lib/boardFrame.internal';
import {
  BOARD_GEO_SIZE,
  BOARD_NOTE_SIZE,
} from '../../../features/board/lib/boardShape.internal';
import type { BoardBox, BoardShapeLayout } from './boardIndex.internal';
import type { BoardPlaceTool } from './boardView.internal';

export const BOARD_PLACE_SIZE: Readonly<Record<BoardPlaceTool, BoardSize>> = {
  frame: BOARD_FRAME_SIZE,
  geo: BOARD_GEO_SIZE,
  note: BOARD_NOTE_SIZE,
};

const DEGREES = 180 / Math.PI;

const centerOf = (box: BoardBox): BoardPlace => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});

const holds = (outer: BoardBox, inner: BoardBox) =>
  inner.x >= outer.x &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y >= outer.y &&
  inner.y + inner.height <= outer.y + outer.height;

export const frontmostAround = (
  layouts: readonly BoardShapeLayout[],
  start: BoardBox
) => {
  let top: BoardShapeLayout | undefined;

  for (const layout of layouts) {
    if (holds(layout.box, start) && (!top || layout.rank > top.rank)) {
      top = layout;
    }
  }

  return top;
};

export const pickInDirection = (
  layouts: readonly BoardShapeLayout[],
  start: BoardBox,
  direction: BoardPlace
) => {
  const from = centerOf(start);
  const middle = { ...from, height: 0, width: 0 };
  let picked: BoardShapeLayout | undefined;
  let lowest = Number.POSITIVE_INFINITY;

  for (const layout of layouts) {
    if (holds(layout.box, layout.kind === 'frame' ? middle : start)) continue;

    const center = centerOf(layout.box);
    const dx = center.x - from.x;
    const dy = center.y - from.y;
    const ahead = dx * direction.x + dy * direction.y;
    const aside = Math.abs(dx * direction.y - dy * direction.x);

    if (aside >= ahead * 2) continue;

    const distance = Math.hypot(dx, dy);
    const score =
      distance +
      aside * 2 +
      (distance - ahead) * 1.5 +
      Math.atan2(aside, ahead) * DEGREES * 0.5;

    if (score < lowest) {
      lowest = score;
      picked = layout;
    }
  }

  return picked;
};

const PLACE_STEP = 24;

export const freePointFrom = (
  start: BoardPlace,
  size: BoardSize,
  entries: readonly BoardMemberEntry[]
) => {
  const frames = new Map<string, BoardFrameEntry>();
  const held = new Set<string>();

  for (const entry of entries) {
    if (entry.kind === 'frame') frames.set(entry.id, entry);
    if (entry.kind !== 'arrow') held.add(`${entry.place.x} ${entry.place.y}`);
  }

  for (let step = 0; step <= entries.length; step += 1) {
    const point = {
      x: start.x + step * PLACE_STEP,
      y: start.y + step * PLACE_STEP,
    };
    const { x, y } = readBackPointOf(frames, { place: point, size });

    if (!held.has(`${x} ${y}`)) return point;
  }

  return undefined;
};
