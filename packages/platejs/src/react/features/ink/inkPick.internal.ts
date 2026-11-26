import {
  BaseInkPlugin,
  type InkMark,
  type InkTool,
} from '../../../features/ink/lib';
import { segmentGap, windsAround } from '../../../internal/penStroke.internal';
import { type Editor, HistoryPlugin } from '../../core';
import { inkDraws, inkSamplesOf } from './inkInput.internal';
import { inkOutlinePoints } from './inkPaint.internal';
import type { InkPlaced } from './inkPlacement.internal';
import { InkPlugin } from './InkPlugin';

type Point = Readonly<{ x: number; y: number }>;

type Erasing = {
  last: Point;
  readonly pointerId: number;
  readonly radius: number;
  step: unknown;
  readonly tool: InkTool;
};

type Lassoing = {
  readonly loop: Point[];
  path: string;
  readonly pointerId: number;
  readonly tool: InkTool;
};

type Box = Readonly<{
  bottom: number;
  left: number;
  right: number;
  top: number;
}>;

type Outline = Readonly<{ box: Box; points: readonly Point[] }>;

const metrics = { boxChecks: 0, sampleTests: 0, segmentTests: 0 };

export const getInkPickMetrics = () => Object.freeze({ ...metrics });

const LOOP = {
  fill: 'none',
  opacity: '1',
  stroke: 'currentColor',
  'stroke-dasharray': '4 4',
  'stroke-width': '1',
};

const boxOf = (points: readonly Point[]): Box => {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const { x, y } of points) {
    left = Math.min(left, x);
    right = Math.max(right, x);
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }

  return { bottom, left, right, top };
};

const touches = ({ points }: Outline, a: Point, b: Point, radius: number) => {
  metrics.segmentTests += 1;
  if (windsAround(points, a)) return true;

  return points.some(
    (corner, at) =>
      segmentGap(a, b, corner, points[(at + 1) % points.length]) <= radius
  );
};

export const attachInkPick = ({
  editor,
  holds,
  layer,
  painted,
  preview,
  tool,
  view,
}: Readonly<{
  editor: Editor;
  holds: (mark: InkMark) => boolean;
  layer: HTMLElement;
  painted: () => InkPlaced['ink'];
  preview: SVGPathElement;
  tool: () => InkTool | null;
  view: Editor;
}>) => {
  const outlines = new Map<InkMark, Outline>();
  let commits = 0;
  let contact: Erasing | Lassoing | null = null;
  const unsubscribe = editor.subscribeCommit(() => {
    commits += 1;
  });

  const outlineOf = (mark: InkMark) => {
    let outline = outlines.get(mark);

    if (!outline) {
      const points = inkOutlinePoints(mark).map(([x, y]) => ({ x, y }));

      outline = { box: boxOf(points), points };
      outlines.set(mark, outline);
    }

    return outline;
  };

  const pointOf = ({ clientX, clientY }: PointerEvent): Point => {
    const { left, top } = layer.getBoundingClientRect();

    return { x: clientX - left, y: clientY - top };
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
        const a = { x: from.x - dx, y: from.y - dy };
        const b = { x: to.x - dx, y: to.y - dy };

        return (
          Math.min(a.x, b.x) <= box.right + radius &&
          Math.max(a.x, b.x) >= box.left - radius &&
          Math.min(a.y, b.y) <= box.bottom + radius &&
          Math.max(a.y, b.y) >= box.top - radius &&
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

  const lasso = (lassoing: Lassoing, to: Point) => {
    const last = lassoing.loop.at(-1);

    if (last?.x === to.x && last.y === to.y) return;
    lassoing.loop.push(to);
    lassoing.path += `${last ? 'L' : 'M'}${to.x} ${to.y}`;
    preview.setAttribute('d', `${lassoing.path}Z`);
  };

  const pick = (loop: readonly Point[]) => {
    const { bottom, left, right, top } = boxOf(loop);
    const picks = painted().filter(({ dx, dy, mark }) => {
      metrics.boxChecks += 1;
      if (!(mark.brush.size > 0 && mark.brush.opacity > 0)) return false;

      const { box } = outlineOf(mark);

      if (
        box.left + dx > right ||
        box.right + dx < left ||
        box.top + dy > bottom ||
        box.bottom + dy < top
      ) {
        return false;
      }

      const inside = mark.samples.filter(([x, y]) => {
        metrics.sampleTests += 1;

        return windsAround(loop, { x: x + dx, y: y + dy });
      });

      return inside.length > mark.samples.length / 2 && holds(mark);
    });

    view.plugin(InkPlugin).api.setPicked(picks.map(({ mark }) => mark.id));
  };

  const end = () => {
    if (contact && 'loop' in contact) {
      preview.setAttribute('d', '');
      for (const name of ['stroke', 'stroke-dasharray', 'stroke-width']) {
        preview.removeAttribute(name);
      }
    }
    contact = null;
  };

  const holdOrEnd = (event: PointerEvent) => {
    if (event.pointerId !== contact?.pointerId) return null;
    if (tool() === contact.tool) return contact;
    end();

    return null;
  };

  const onPointerDown = (event: PointerEvent) => {
    const current = tool();

    if (
      !current ||
      current.type === 'draw' ||
      !inkDraws(event, contact !== null) ||
      (event.target instanceof Element &&
        event.target.closest('[data-ink-sign]'))
    ) {
      return;
    }
    event.preventDefault();
    layer.setPointerCapture(event.pointerId);

    const point = pointOf(event);
    const { pointerId } = event;

    if (current.type === 'lasso') {
      // The prevented press moves no focus, and the keys on the pick act only
      // in the Editable.
      if (
        !view.api.dom.editable()?.contains(layer.ownerDocument.activeElement)
      ) {
        view.api.dom.focus();
      }
      contact = { loop: [], path: '', pointerId, tool: current };
      for (const [name, value] of Object.entries(LOOP)) {
        preview.setAttribute(name, value);
      }
      lasso(contact, point);

      return;
    }
    contact = {
      last: point,
      pointerId,
      radius: current.size / 2,
      step: undefined,
      tool: current,
    };
    erase(contact, point);
  };
  const onPointerMove = (event: PointerEvent) => {
    // A chord reports the primary button's lift as a move.
    if (!(event.buttons & 1)) {
      onPointerCancel(event);

      return;
    }
    for (const sample of inkSamplesOf(event)) {
      const current = holdOrEnd(event);

      if (!current) return;
      if ('loop' in current) lasso(current, pointOf(sample));
      else erase(current, pointOf(sample));
    }
  };
  const onPointerUp = (event: PointerEvent) => {
    const current = holdOrEnd(event);

    if (!current) return;
    if ('loop' in current) {
      lasso(current, pointOf(event));
      end();
      pick(current.loop);

      return;
    }
    contact = null;
    erase(current, pointOf(event));
  };
  const onPointerCancel = (event: PointerEvent) => {
    if (event.pointerId === contact?.pointerId) end();
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
    cancel: end,
    detach: () => {
      end();
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
