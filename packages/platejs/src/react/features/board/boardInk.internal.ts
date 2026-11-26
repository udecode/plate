import type { BoardPlace } from '../../../features/board/lib';
import {
  type BoardInkPoint,
  boardStrokeRadius,
} from '../../../features/board/lib/boardStroke.internal';
import { segmentGap } from '../../../internal/penStroke.internal';

/** How many screen pixels past its line a press still reaches a stroke. */
export const INK_SLOP_PX = 6;

/**
 * Whether the segment from board point `from` to `to` passes over the line
 * through `ink`, or within `INK_SLOP_PX` screen pixels of it at `zoom`. A
 * press passes its point as both `from` and `to`.
 */
export const onInk = (
  ink: readonly BoardInkPoint[],
  from: BoardPlace,
  to: BoardPlace,
  zoom: number
) => {
  const slop = INK_SLOP_PX / zoom;
  const minX = Math.min(from.x, to.x);
  const maxX = Math.max(from.x, to.x);
  const minY = Math.min(from.y, to.y);
  const maxY = Math.max(from.y, to.y);
  let previous: (BoardPlace & { radius: number }) | undefined;

  for (const [x, y, pressure] of ink) {
    const point = { radius: boardStrokeRadius(pressure), x, y };
    const start = previous ?? point;
    const reach = Math.max(point.radius, start.radius) + slop;

    previous = point;
    if (
      Math.min(start.x, x) - reach > maxX ||
      Math.max(start.x, x) + reach < minX ||
      Math.min(start.y, y) - reach > maxY ||
      Math.max(start.y, y) + reach < minY
    ) {
      continue;
    }
    if (segmentGap(from, to, start, point) <= reach) return true;
  }

  return false;
};
