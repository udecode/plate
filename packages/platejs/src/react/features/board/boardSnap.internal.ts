import type { BoardPlace } from '../../../features/board/lib';
import {
  type BoardBox,
  type BoardBoxModifiers,
  type BoardCorner,
  MIN_SHAPE_SIZE,
  resized,
} from './boardIndex.internal';

export const SNAP_PX = 8;

type Axis = 'x' | 'y';

export type BoardGuide = Readonly<{ from: BoardPlace; to: BoardPlace }>;

type SnapField = Readonly<{
  boxesIn: (area: BoardBox) => readonly BoardBox[];
  view: BoardBox;
  zoom: number;
}>;

type Targets = Readonly<Record<Axis, readonly BoardBox[]>>;

type Match = Readonly<{ at: number; gap: number; value: number }>;

const AXES: readonly Axis[] = ['x', 'y'];
const ALIGNED = 1e-6;

const acrossOf = (axis: Axis): Axis => (axis === 'x' ? 'y' : 'x');

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

const targetsAround = (
  box: BoardBox,
  reach: number,
  { boxesIn, view }: SnapField
): Targets => {
  const targets: Record<Axis, readonly BoardBox[]> = { x: [], y: [] };

  for (const axis of AXES) {
    const band = bandOf(box, axis, reach, view);

    if (band) targets[axis] = boxesIn(band);
  }

  return targets;
};

const closer = (gap: number, than: Readonly<{ gap: number }> | undefined) =>
  !than ||
  Math.abs(gap) < Math.abs(than.gap) ||
  (Math.abs(gap) === Math.abs(than.gap) && gap > than.gap);

const nearest = (
  targets: readonly BoardBox[],
  axis: Axis,
  from: readonly number[],
  reach: number
) => {
  let best: Match | undefined;

  for (const target of targets) {
    for (const value of valuesOf(target, axis)) {
      for (let at = 0; at < from.length; at++) {
        const gap = value - from[at];

        if (Math.abs(gap) <= reach && closer(gap, best)) {
          best = { at, gap, value };
        }
      }
    }
  }

  return best;
};

const guidesAt = (
  landed: BoardBox,
  targets: Targets,
  valuesFor: (axis: Axis) => readonly number[]
) => {
  const guides: BoardGuide[] = [];

  for (const axis of AXES) {
    const across = acrossOf(axis);

    for (const at of valuesFor(axis)) {
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

  return guides;
};

export const snapMove = (
  held: BoardBox,
  delta: BoardPlace,
  field: SnapField
) => {
  const reach = SNAP_PX / field.zoom;
  const moved = { ...held, x: held.x + delta.x, y: held.y + delta.y };
  const targets = targetsAround(moved, reach, field);
  const snapped = { ...delta };

  for (const axis of AXES) {
    const best = nearest(targets[axis], axis, valuesOf(moved, axis), reach);

    if (best) snapped[axis] = best.value - valuesOf(held, axis)[best.at];
  }

  const landed = { ...held, x: held.x + snapped.x, y: held.y + snapped.y };

  return {
    delta: snapped,
    guides: guidesAt(landed, targets, (axis) => valuesOf(landed, axis)),
  };
};

const nearIsStart = (corner: BoardCorner, axis: Axis) =>
  axis === 'x'
    ? corner === 'bottomLeft' || corner === 'topLeft'
    : corner === 'topLeft' || corner === 'topRight';

export const snapResize = (
  start: BoardBox,
  corner: BoardCorner,
  offset: BoardPlace,
  modifiers: BoardBoxModifiers,
  field: SnapField
) => {
  const reach = SNAP_PX / field.zoom;
  const raw = resized(start, corner, offset.x, offset.y, modifiers);
  const targets = targetsAround(raw, reach, field);
  const movingEdgesOf = (box: BoardBox, axis: Axis) => {
    const low = startOf(box, axis);
    const high = low + lengthOf(box, axis);
    const near = nearIsStart(corner, axis) ? low : high;

    return modifiers.center ? [near, low + high - near] : [near];
  };
  const match = (axis: Axis) =>
    lengthOf(raw, axis) > MIN_SHAPE_SIZE
      ? nearest(targets[axis], axis, movingEdgesOf(raw, axis), reach)
      : undefined;
  const corrected = (axis: Axis, { at, value }: Match) =>
    at === 0
      ? value - movingEdgesOf(start, axis)[0]
      : movingEdgesOf(start, axis)[1] - value;
  const lands = (box: BoardBox, axis: Axis, { at, value }: Match) =>
    Math.abs(movingEdgesOf(box, axis)[at] - value) <= ALIGNED;
  let rect = raw;

  if (!modifiers.keepRatio) {
    const found = { x: match('x'), y: match('y') };
    const fixed = { ...offset };

    for (const axis of AXES) {
      const best = found[axis];

      if (best) fixed[axis] = corrected(axis, best);
    }
    rect = resized(start, corner, fixed.x, fixed.y, modifiers);

    for (const axis of AXES) {
      const best = found[axis];

      if (best && !lands(rect, axis, best)) fixed[axis] = offset[axis];
    }
    rect = resized(start, corner, fixed.x, fixed.y, modifiers);
  } else if (raw.width > MIN_SHAPE_SIZE && raw.height > MIN_SHAPE_SIZE) {
    let chosen: { box: BoardBox; gap: number } | undefined;

    for (const axis of AXES) {
      const best = match(axis);

      if (!best) continue;

      const across = acrossOf(axis);
      const aligned = { ...offset, [axis]: corrected(axis, best) };
      const scale =
        lengthOf(
          resized(start, corner, aligned.x, aligned.y, {
            center: modifiers.center,
            keepRatio: false,
          }),
          axis
        ) / lengthOf(start, axis);
      const grown = lengthOf(start, across) * (scale - 1);

      aligned[across] =
        (nearIsStart(corner, across) ? -grown : grown) /
        (modifiers.center ? 2 : 1);

      const box = resized(start, corner, aligned.x, aligned.y, modifiers);

      if (
        lands(box, axis, best) &&
        Math.abs(
          movingEdgesOf(box, across)[0] - movingEdgesOf(raw, across)[0]
        ) <= reach &&
        closer(best.gap, chosen)
      ) {
        chosen = { box, gap: best.gap };
      }
    }
    rect = chosen?.box ?? raw;
  }

  return {
    guides: guidesAt(rect, targets, (axis) => movingEdgesOf(rect, axis)),
    rect,
  };
};
