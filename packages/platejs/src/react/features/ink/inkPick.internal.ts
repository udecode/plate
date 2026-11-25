import {
  BaseInkPlugin,
  type InkMark,
  type InkTool,
} from '../../../features/ink/lib';
import { type Editor, HistoryPlugin } from '../../core';
import { inkDraws, inkSamplesOf } from './inkInput.internal';
import { inkOutlinePoints } from './inkPaint.internal';
import type { InkPlaced } from './inkPlacement.internal';

type Point = readonly [x: number, y: number];

type Erasing = {
  last: Point;
  readonly pointerId: number;
  readonly radius: number;
  step: unknown;
};

type Box = Readonly<{
  bottom: number;
  left: number;
  right: number;
  top: number;
}>;

type Outline = Readonly<{ box: Box; points: readonly Point[] }>;

const metrics = { boxChecks: 0, segmentTests: 0 };

export const getInkPickMetrics = () => Object.freeze({ ...metrics });

const toSegment = ([x, y]: Point, [ax, ay]: Point, [bx, by]: Point) => {
  const dx = bx - ax;
  const dy = by - ay;
  const length = dx * dx + dy * dy;
  const along =
    length === 0
      ? 0
      : Math.min(1, Math.max(0, ((x - ax) * dx + (y - ay) * dy) / length));

  return Math.hypot(x - ax - along * dx, y - ay - along * dy);
};

const turn = ([ox, oy]: Point, [ax, ay]: Point, [bx, by]: Point) =>
  Math.sign((ax - ox) * (by - oy) - (ay - oy) * (bx - ox));

const apart = (a: Point, b: Point, c: Point, d: Point) =>
  turn(a, b, c) * turn(a, b, d) < 0 && turn(c, d, a) * turn(c, d, b) < 0
    ? 0
    : Math.min(
        toSegment(a, c, d),
        toSegment(b, c, d),
        toSegment(c, a, b),
        toSegment(d, a, b)
      );

// SVG fills a path by the nonzero winding rule.
const fills = ([x, y]: Point, points: readonly Point[]) => {
  let winding = 0;

  for (let at = 0; at < points.length; at++) {
    const [ax, ay] = points[at];
    const [bx, by] = points[(at + 1) % points.length];
    const side = (bx - ax) * (y - ay) - (x - ax) * (by - ay);

    if (ay <= y && by > y && side > 0) winding += 1;
    if (ay > y && by <= y && side < 0) winding -= 1;
  }

  return winding !== 0;
};

const touches = ({ points }: Outline, a: Point, b: Point, radius: number) => {
  metrics.segmentTests += 1;
  if (fills(a, points)) return true;

  return points.some(
    (corner, at) =>
      apart(a, b, corner, points[(at + 1) % points.length]) <= radius
  );
};

export const attachInkPick = ({
  editor,
  holds,
  layer,
  painted,
  tool,
}: Readonly<{
  editor: Editor;
  holds: (mark: InkMark) => boolean;
  layer: HTMLElement;
  painted: () => InkPlaced['ink'];
  tool: () => InkTool | null;
}>) => {
  const outlines = new Map<InkMark, Outline>();
  let commits = 0;
  let contact: Erasing | null = null;
  const unsubscribe = editor.subscribeCommit(() => {
    commits += 1;
  });

  const outlineOf = (mark: InkMark) => {
    let outline = outlines.get(mark);

    if (!outline) {
      const points = inkOutlinePoints(mark);
      let left = Infinity;
      let top = Infinity;
      let right = -Infinity;
      let bottom = -Infinity;

      for (const [x, y] of points) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
      outline = { box: { bottom, left, right, top }, points };
      outlines.set(mark, outline);
    }

    return outline;
  };

  const pointsOf = (samples: readonly PointerEvent[]) => {
    const { left, top } = layer.getBoundingClientRect();

    return samples.map(({ clientX, clientY }): Point => [
      clientX - left,
      clientY - top,
    ]);
  };

  const erase = (erasing: Erasing, to: Point) => {
    const { last: from, radius } = erasing;
    const hit = painted()
      .filter(({ dx, dy, mark }) => {
        metrics.boxChecks += 1;
        if (!(mark.brush.size > 0 && mark.brush.opacity > 0) || !holds(mark)) {
          return false;
        }

        const outline = outlineOf(mark);
        const { box } = outline;
        const a: Point = [from[0] - dx, from[1] - dy];
        const b: Point = [to[0] - dx, to[1] - dy];

        return (
          Math.min(a[0], b[0]) <= box.right + radius &&
          Math.max(a[0], b[0]) >= box.left - radius &&
          Math.min(a[1], b[1]) <= box.bottom + radius &&
          Math.max(a[1], b[1]) >= box.top - radius &&
          touches(outline, a, b, radius)
        );
      })
      .map(({ mark }) => mark.id);

    erasing.last = to;
    if (hit.length === 0) return;

    const undos = editor.plugin(HistoryPlugin).installed
      ? editor.read.history().undos
      : undefined;
    const merges = erasing.step !== undefined && undos?.at(-1) === erasing.step;
    const before = commits;

    editor.update((tx) => {
      if (merges) tx.history.merge();
      tx.plugin(BaseInkPlugin).remove(hit);
    });
    if (!undos) return;

    // A step keeps its object until an update joins or maps it, so the top
    // undo is the contact's own step only while no later update has joined,
    // mapped or covered it. The new top is this update's own only when no
    // other update committed with it, such as one a commit listener ran.
    erasing.step =
      commits - before === 1 ? editor.read.history().undos.at(-1) : undefined;
  };

  const holdOrEnd = (event: PointerEvent) => {
    if (event.pointerId !== contact?.pointerId) return null;
    if (tool()?.type === 'erase') return contact;
    contact = null;

    return null;
  };

  const onPointerDown = (event: PointerEvent) => {
    const current = tool();

    if (
      current?.type !== 'erase' ||
      !inkDraws(event, contact !== null) ||
      (event.target instanceof Element &&
        event.target.closest('[data-ink-sign]'))
    ) {
      return;
    }
    event.preventDefault();
    layer.setPointerCapture(event.pointerId);

    const [point] = pointsOf([event]);

    contact = {
      last: point,
      pointerId: event.pointerId,
      radius: current.size / 2,
      step: undefined,
    };
    erase(contact, point);
  };
  const onPointerMove = (event: PointerEvent) => {
    const held = holdOrEnd(event);

    if (!held) return;
    for (const point of pointsOf(inkSamplesOf(event))) erase(held, point);
  };
  const onPointerUp = (event: PointerEvent) => {
    const held = holdOrEnd(event);

    if (!held) return;
    contact = null;
    erase(held, pointsOf([event])[0]);
  };
  const onPointerCancel = (event: PointerEvent) => {
    if (event.pointerId === contact?.pointerId) contact = null;
  };
  const listeners = [
    ['pointerdown', onPointerDown],
    ['pointermove', onPointerMove],
    ['pointerup', onPointerUp],
    ['pointercancel', onPointerCancel],
    ['lostpointercapture', onPointerCancel],
  ] as const;

  for (const [type, listener] of listeners) {
    layer.addEventListener(type, listener);
  }

  return {
    cancel: () => {
      contact = null;
    },
    detach: () => {
      contact = null;
      unsubscribe();
      for (const [type, listener] of listeners) {
        layer.removeEventListener(type, listener);
      }
    },
    keep: (holding: (mark: InkMark) => boolean) => {
      for (const mark of outlines.keys()) {
        if (!holding(mark)) outlines.delete(mark);
      }
    },
  };
};
