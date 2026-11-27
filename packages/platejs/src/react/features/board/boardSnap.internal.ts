import type { BoardPlace } from '../../../features/board/lib';
import { MIN_SHAPE_SIZE } from '../../../features/board/lib/boardRatio.internal';
import {
  type BoardBox,
  type BoardBoxModifiers,
  type BoardCorner,
  resized,
} from './boardIndex.internal';

export const SNAP_PX = 8;

type Axis = 'x' | 'y';

export type BoardGuide = Readonly<{
  from: BoardPlace;
  gap?: true;
  to: BoardPlace;
}>;

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

const endOf = (box: BoardBox, axis: Axis) =>
  startOf(box, axis) + lengthOf(box, axis);

const overlap = (a: BoardBox, b: BoardBox, axis: Axis) =>
  startOf(a, axis) < endOf(b, axis) && startOf(b, axis) < endOf(a, axis);

const spaceBetween = (a: BoardBox, b: BoardBox, axis: Axis) =>
  startOf(b, axis) - endOf(a, axis);

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
  valuesFor: (axis: Axis) => readonly number[],
  axes: readonly Axis[] = AXES
) => {
  const guides: BoardGuide[] = [];

  for (const axis of axes) {
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

const besideOf = (
  of: BoardBox,
  row: readonly BoardBox[],
  axis: Axis,
  after: boolean
) => {
  const across = acrossOf(axis);
  let found: BoardBox | undefined;

  for (const box of row) {
    if (!overlap(box, of, across)) continue;
    if (after) {
      if (
        startOf(box, axis) > endOf(of, axis) &&
        (!found || startOf(box, axis) < startOf(found, axis))
      ) {
        found = box;
      }
    } else if (
      endOf(box, axis) < startOf(of, axis) &&
      (!found || endOf(box, axis) > endOf(found, axis))
    ) {
      found = box;
    }
  }

  return found;
};

const neighborsOf = (
  box: BoardBox,
  targets: readonly BoardBox[],
  axis: Axis
) => {
  const across = acrossOf(axis);
  const beforeRow: BoardBox[] = [];
  const afterRow: BoardBox[] = [];

  for (const target of targets) {
    if (!overlap(target, box, across)) continue;
    if (endOf(target, axis) < startOf(box, axis)) beforeRow.push(target);
    else if (startOf(target, axis) > endOf(box, axis)) afterRow.push(target);
  }

  const before = besideOf(box, beforeRow, axis, false);
  const after = besideOf(box, afterRow, axis, true);

  return {
    after,
    afterNext: after && besideOf(after, afterRow, axis, true),
    before,
    beforeNext: before && besideOf(before, beforeRow, axis, false),
  };
};

const evenStarts = (
  moved: BoardBox,
  targets: readonly BoardBox[],
  axis: Axis
) => {
  const { after, afterNext, before, beforeNext } = neighborsOf(
    moved,
    targets,
    axis
  );
  const length = lengthOf(moved, axis);
  const starts: number[] = [];

  if (before && after) {
    starts.push(
      endOf(before, axis) + (spaceBetween(before, after, axis) - length) / 2
    );
  }
  if (before && beforeNext) {
    starts.push(endOf(before, axis) + spaceBetween(beforeNext, before, axis));
  }
  if (after && afterNext) {
    starts.push(
      startOf(after, axis) - spaceBetween(after, afterNext, axis) - length
    );
  }

  return starts;
};

const evenGuidesAt = (
  landed: BoardBox,
  targets: readonly BoardBox[],
  axis: Axis
) => {
  const across = acrossOf(axis);
  const { after, afterNext, before, beforeNext } = neighborsOf(
    landed,
    targets,
    axis
  );
  const even = (a: BoardBox, b: BoardBox, c: BoardBox) =>
    Math.abs(spaceBetween(a, b, axis) - spaceBetween(b, c, axis)) <= ALIGNED;
  const pairs: Array<readonly [BoardBox, BoardBox]> = [];
  const add = (a: BoardBox, b: BoardBox) => {
    if (!pairs.some(([p, q]) => p === a && q === b)) pairs.push([a, b]);
  };

  if (before && after && even(before, landed, after)) {
    add(before, landed);
    add(landed, after);
  }
  if (beforeNext && before && even(beforeNext, before, landed)) {
    add(beforeNext, before);
    add(before, landed);
  }
  if (after && afterNext && even(landed, after, afterNext)) {
    add(landed, after);
    add(after, afterNext);
  }

  return pairs.map(([a, b]): BoardGuide => {
    const at =
      (Math.max(startOf(a, across), startOf(b, across)) +
        Math.min(endOf(a, across), endOf(b, across))) /
      2;

    return axis === 'x'
      ? { from: { x: endOf(a, axis), y: at }, gap: true, to: { x: b.x, y: at } }
      : {
          from: { x: at, y: endOf(a, axis) },
          gap: true,
          to: { x: at, y: b.y },
        };
  });
};

export const snapMove = (
  held: BoardBox,
  delta: BoardPlace,
  field: SnapField
) => {
  const reach = SNAP_PX / field.zoom;
  const moved = { ...held, x: held.x + delta.x, y: held.y + delta.y };
  const targets = targetsAround(moved, reach, field);
  const shown = (axis: Axis) => bandOf(moved, axis, reach, field.view) !== null;
  const snapped = { ...delta };

  for (const axis of AXES) {
    const point = nearest(targets[axis], axis, valuesOf(moved, axis), reach);
    let even: { gap: number; value: number } | undefined;

    if (shown(axis)) {
      for (const start of evenStarts(moved, targets[acrossOf(axis)], axis)) {
        const gap = start - startOf(moved, axis);

        if (Math.abs(gap) <= reach && closer(gap, even)) {
          even = { gap, value: start };
        }
      }
    }

    if (even && (!point || Math.abs(even.gap) < Math.abs(point.gap))) {
      snapped[axis] = even.value - startOf(held, axis);
    } else if (point) {
      snapped[axis] = point.value - valuesOf(held, axis)[point.at];
    }
  }

  const landed = { ...held, x: held.x + snapped.x, y: held.y + snapped.y };

  return {
    delta: snapped,
    guides: [
      ...guidesAt(landed, targets, (axis) => valuesOf(landed, axis)),
      ...AXES.flatMap((axis) =>
        shown(axis) ? evenGuidesAt(landed, targets[acrossOf(axis)], axis) : []
      ),
    ],
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
  field: SnapField,
  options?: Readonly<{
    drawnBox?: (rect: BoardBox) => BoardBox;
    lockY?: boolean;
  }>
) => {
  const lockY = options?.lockY ?? false;
  const axes: readonly Axis[] = lockY ? ['x'] : AXES;
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
    const found = {
      x: match('x'),
      y: lockY ? undefined : match('y'),
    };
    const fixed = { ...offset };

    for (const axis of axes) {
      const best = found[axis];

      if (best) fixed[axis] = corrected(axis, best);
    }
    rect = resized(start, corner, fixed.x, fixed.y, modifiers);

    for (const axis of axes) {
      const best = found[axis];

      if (best && !lands(rect, axis, best)) fixed[axis] = offset[axis];
    }
    rect = resized(start, corner, fixed.x, fixed.y, modifiers);
  } else if (raw.width > MIN_SHAPE_SIZE && raw.height > MIN_SHAPE_SIZE) {
    const drawnRaw = options?.drawnBox ? options.drawnBox(raw) : raw;
    let chosen: { box: BoardBox; gap: number } | undefined;

    for (const axis of axes) {
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
      const drawnCandidate = options?.drawnBox ? options.drawnBox(box) : box;

      if (
        lands(box, axis, best) &&
        Math.abs(
          movingEdgesOf(drawnCandidate, across)[0] -
            movingEdgesOf(drawnRaw, across)[0]
        ) <= reach &&
        closer(best.gap, chosen)
      ) {
        chosen = { box, gap: best.gap };
      }
    }
    rect = chosen?.box ?? raw;
  }

  const landed = options?.drawnBox ? options.drawnBox(rect) : rect;

  return {
    guides: guidesAt(
      landed,
      targets,
      (axis) => movingEdgesOf(landed, axis),
      axes
    ),
    rect,
  };
};
