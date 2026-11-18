import type { BoardPlace } from '../../../features/board/lib';
import type { BoardBox } from './boardIndex.internal';

export const SNAP_PX = 8;

type Axis = 'x' | 'y';

export type BoardGuide = Readonly<{ from: BoardPlace; to: BoardPlace }>;

const AXES: readonly Axis[] = ['x', 'y'];
const ALIGNED = 1e-6;

const startOf = (box: BoardBox, axis: Axis) => (axis === 'x' ? box.x : box.y);

const lengthOf = (box: BoardBox, axis: Axis) =>
  axis === 'x' ? box.width : box.height;

const valuesOf = (box: BoardBox, axis: Axis) => {
  const start = startOf(box, axis);
  const length = lengthOf(box, axis);

  return [start, start + length / 2, start + length];
};

const bandOf = (moved: BoardBox, axis: Axis, reach: number, view: BoardBox) => {
  const start = Math.max(startOf(moved, axis) - reach, startOf(view, axis));
  const end = Math.min(
    startOf(moved, axis) + lengthOf(moved, axis) + reach,
    startOf(view, axis) + lengthOf(view, axis)
  );

  if (end < start) return null;

  return axis === 'x'
    ? { ...view, width: end - start, x: start }
    : { ...view, height: end - start, y: start };
};

export const snapMove = (
  held: BoardBox,
  delta: BoardPlace,
  {
    boxesIn,
    view,
    zoom,
  }: Readonly<{
    boxesIn: (area: BoardBox) => readonly BoardBox[];
    view: BoardBox;
    zoom: number;
  }>
) => {
  const reach = SNAP_PX / zoom;
  const moved = { ...held, x: held.x + delta.x, y: held.y + delta.y };
  const snapped = { ...delta };
  const targets: Record<Axis, readonly BoardBox[]> = { x: [], y: [] };

  for (const axis of AXES) {
    const band = bandOf(moved, axis, reach, view);

    if (!band) continue;
    targets[axis] = boxesIn(band);

    const from = valuesOf(moved, axis);
    const kept = valuesOf(held, axis);
    let best: { gap: number; to: number } | undefined;

    for (const target of targets[axis]) {
      for (const value of valuesOf(target, axis)) {
        for (const [at, start] of from.entries()) {
          const gap = value - start;

          if (
            Math.abs(gap) <= reach &&
            (!best ||
              Math.abs(gap) < Math.abs(best.gap) ||
              (Math.abs(gap) === Math.abs(best.gap) && gap > best.gap))
          ) {
            best = { gap, to: value - kept[at] };
          }
        }
      }
    }
    if (best) snapped[axis] = best.to;
  }

  const landed = { ...held, x: held.x + snapped.x, y: held.y + snapped.y };
  const guides: BoardGuide[] = [];

  for (const axis of AXES) {
    const across = axis === 'x' ? 'y' : 'x';

    for (const at of valuesOf(landed, axis)) {
      const joined = targets[axis].filter((target) =>
        valuesOf(target, axis).some((value) => Math.abs(value - at) <= ALIGNED)
      );

      if (joined.length === 0) continue;

      const spanned = [landed, ...joined];
      const from = Math.min(...spanned.map((box) => startOf(box, across)));
      const to = Math.max(
        ...spanned.map((box) => startOf(box, across) + lengthOf(box, across))
      );

      guides.push(
        axis === 'x'
          ? { from: { x: at, y: from }, to: { x: at, y: to } }
          : { from: { x: from, y: at }, to: { x: to, y: at } }
      );
    }
  }

  return { delta: snapped, guides };
};
