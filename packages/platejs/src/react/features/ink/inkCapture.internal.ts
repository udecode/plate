import {
  type NodeKey,
  PathApi,
  scheduleAfterCommitNotification,
} from '../../../facade';
import {
  BaseInkPlugin,
  type InkBrush,
  type InkMarkInput,
  type InkRun,
  type InkSample,
} from '../../../features/ink/lib';
import {
  footprintEnters,
  gapAround,
  inkTouchedWords,
  inkWords,
} from '../../../features/ink/lib/inkMatch.internal';
import { type Editor, HistoryPlugin } from '../../core';
import { inkDraws, inkPressure, inkSamplesOf } from './inkInput.internal';
import {
  type InkMeasuredBlock,
  type InkLayerOrigin,
  type InkTextBlock,
  inkBoxOf,
  inkTextBlocks,
  measureInkBlock,
  sameInkBox,
  sameInkLayout,
} from './inkMeasure.internal';
import { inkOutline } from './inkPaint.internal';
import type { InkLayoutChange } from './inkWatch.internal';

type Point = readonly [x: number, y: number];

type Entered = Readonly<{
  block: InkTextBlock;
  direction: InkMarkInput['direction'];
  live: InkMeasuredBlock;
}>;

type Epoch = {
  readonly at: number;
  readonly blocks: Entered[];
  note: Entered | undefined;
  readonly samples: InkSample[];
  readonly start: number;
};

const heldBy = (epoch: Epoch) =>
  epoch.blocks.length > 0 || !epoch.note ? epoch.blocks : [epoch.note];

const lineStart = (live: InkMeasuredBlock, index: number) =>
  index === 0 ? 0 : live.lines[index - 1].end;

const runsOf = (
  live: InkMeasuredBlock,
  points: readonly Point[],
  radius: number
): InkRun[] => {
  const runs = (inkTouchedWords(live, points, radius) ?? []).flatMap(
    ([start, end]) =>
      live.lines.flatMap((line, index) => {
        const from = Math.max(start, lineStart(live, index));
        const to = Math.min(end, line.end);
        const box = from < to ? live.measure(from, to) : undefined;

        return box
          ? [{ end: to, left: box.left, start: from, width: box.width }]
          : [];
      })
  );

  if (runs.length > 0) return runs;

  const index = live.lines.findIndex((line) =>
    footprintEnters(points, radius, {
      ...line,
      left: live.box.left + line.left,
      top: live.box.top + line.top,
    })
  );

  if (index === -1) return [];

  const start = lineStart(live, index);
  const { end } = live.lines[index];
  const middle =
    points.reduce((sum, [x]) => sum + x, 0) / points.length - live.box.left;
  let offset = start;

  for (const [from, to] of inkWords(live.text)) {
    const box =
      from >= start && from < end
        ? live.measure(from, Math.min(to, end))
        : undefined;

    if (box && box.left + box.width / 2 < middle) offset = Math.min(to, end);
  }

  const gap = live.measure(...gapAround(live.text, offset));
  const place = gap ?? live.measure(offset, offset);

  return place
    ? [{ end: offset, left: place.left, start: offset, width: place.width }]
    : [];
};

const marginOf = (
  live: InkMeasuredBlock,
  points: readonly Point[],
  radius: number
) => {
  const xs = points.map(([x]) => x);
  const left = Math.min(...xs) - radius;
  const right = Math.max(...xs) + radius;
  const edge = live.box.left + live.box.width;

  if (right <= live.box.left) {
    return { reach: live.box.left - left, side: 'left' as const };
  }
  if (left >= edge) return { reach: right - edge, side: 'right' as const };

  return undefined;
};

/**
 * A stroke whose first sample enters no block is a margin note for the
 * nearest block, picked and measured then, until the line enters a block. A
 * commit that changes a crossed block or a margin note's block, or the
 * structure or layout at or above it, and a report to the returned
 * `layoutChanged` under which one of those blocks moved in `layer`, its box
 * for `boxes` and its box, lines or words for `words`, seal the epoch at its
 * last sample and drop the browser's held samples from before that commit or
 * report, so the next sample starts a new mark. A pointer move that finds one
 * of those blocks' boxes moved with no report seals the epoch the same way,
 * dropping its own samples. While no mark is open, any report drops the held
 * samples from before it. Any other report leaves the mark whole. Any other
 * commit during the contact leaves the mark whole until the line enters a
 * block that commit changed, where a new mark starts with the first sample
 * from after that commit, and a later commit to another block still splits
 * the mark there. A mark saves the direction of the first block it holds, as
 * read when the stroke measured that block. A sealed mark saves through
 * `editor` in an update of its own once the commit's handlers have run, so
 * `add` sees the blocks that commit deleted. A contact's later marks join its
 * first mark's undo step while nothing else enters the undo history between
 * their saves. A press on a `[data-ink-sign]` element is left to the sign.
 */
export const attachInkCapture = ({
  editor,
  layer,
  preview,
  tool,
  view,
}: Readonly<{
  editor: Editor;
  layer: HTMLElement;
  preview: SVGPathElement;
  tool: () => Readonly<{ brush: InkBrush }> | null;
  view: Editor;
}>) => {
  let contact: Readonly<{ brush: InkBrush; pointerId: number }> | null = null;
  let epoch: Epoch | null = null;
  let blocks: Array<
    Readonly<{ block: InkTextBlock; box: ReturnType<typeof inkBoxOf> }>
  > | null = null;
  let changedSinceCut = new Map<NodeKey, number>();
  let dropBefore = Number.NEGATIVE_INFINITY;
  let savedAt: number | undefined;

  const originOf = (): InkLayerOrigin => {
    const { left, top } = layer.getBoundingClientRect();

    return { left, top };
  };

  const blocksAt = (origin: InkLayerOrigin) => {
    blocks ??= inkTextBlocks(view).map((block) => ({
      block,
      box: inkBoxOf(block.element, origin),
    }));

    return blocks;
  };

  const enter = (
    block: InkTextBlock,
    origin: InkLayerOrigin
  ): Entered | undefined => {
    const live = measureInkBlock(block.element, block.text, origin);

    return (
      live && {
        block,
        direction:
          getComputedStyle(block.element).direction === 'rtl' ? 'rtl' : 'ltr',
        live,
      }
    );
  };

  const draw = () => {
    if (!contact || !epoch) {
      preview.setAttribute('d', '');

      return;
    }
    preview.setAttribute('fill', contact.brush.color);
    preview.setAttribute('opacity', String(contact.brush.opacity));
    preview.setAttribute(
      'd',
      inkOutline(epoch.samples, contact.brush, { last: false })
    );
  };

  const nearestTo = (
    [, y]: Point,
    origin: InkLayerOrigin
  ): Entered | undefined => {
    const [nearest] = blocksAt(origin)
      .map((candidate) => ({
        ...candidate,
        distance: Math.max(
          candidate.box.top - y,
          y - candidate.box.top - candidate.box.height,
          0
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    return nearest && enter(nearest.block, origin);
  };

  const inputOf = (done: Epoch, brush: InkBrush): InkMarkInput | undefined => {
    const points = done.samples.map(([x, y]): Point => [x, y]);
    const radius = brush.size / 2;
    const entered = heldBy(done);
    const [first] = entered;

    if (!first) return undefined;

    const margin =
      done.blocks.length === 0
        ? marginOf(first.live, points, radius)
        : undefined;

    return {
      at: done.at,
      blocks: entered.map(({ block, live }) => ({
        block: block.id,
        height: live.box.height,
        left: live.box.left,
        lines: live.lines,
        runs: margin ? [] : runsOf(live, points, radius),
        text: live.text,
        top: live.box.top,
        width: live.box.width,
      })),
      brush,
      direction: first.direction,
      ...(margin ? { margin } : {}),
      samples: done.samples,
    };
  };

  const seal = () => {
    const done = epoch;

    epoch = null;
    if (!done || !contact) return;

    const input = inputOf(done, contact.brush);

    if (!input) return;
    scheduleAfterCommitNotification(editor, () => {
      const tracked = editor.plugin(HistoryPlugin).installed;
      const joins = tracked && savedAt === editor.read.history().revision;

      editor.update((tx) => {
        if (joins) tx.history.merge();
        tx.plugin(BaseInkPlugin).add(input);
      });
      savedAt = tracked ? editor.read.history().revision : undefined;
    });
  };

  const cutAt = (time: number) => {
    dropBefore = Math.max(dropBefore, time);
    changedSinceCut = new Map(
      [...changedSinceCut].filter(([, at]) => at > dropBefore)
    );
  };

  const sealOnChange = () => {
    if (!contact) return;
    seal();
    cutAt(performance.now());
    draw();
  };

  const heldMoved = (
    open: Epoch,
    origin: InkLayerOrigin,
    change: InkLayoutChange
  ) =>
    heldBy(open).some(({ block, live }) =>
      change === 'boxes'
        ? !sameInkBox(live.box, inkBoxOf(block.element, origin))
        : !sameInkLayout(
            live,
            measureInkBlock(block.element, block.text, origin)
          )
    );

  const changedAt = (block: InkTextBlock) =>
    block.path.flatMap((_, at) => {
      const key = view.key(block.path.slice(0, at + 1));
      const time = key === null ? undefined : changedSinceCut.get(key);

      return time === undefined ? [] : [time];
    });

  const take = (event: PointerEvent, origin: InkLayerOrigin) => {
    if (!contact || event.timeStamp < dropBefore) return;

    const point: Point = [
      event.clientX - origin.left,
      event.clientY - origin.top,
    ];
    const [previous] = epoch?.samples.slice(-1) ?? [];
    const { brush } = contact;
    const radius = brush.size / 2;
    const entering = (segment: readonly Point[]) =>
      blocksAt(origin).filter(
        ({ block, box }) =>
          !epoch?.blocks.some((entered) => entered.block.key === block.key) &&
          footprintEnters(segment, radius, box)
      );

    if (previous && previous[0] === point[0] && previous[1] === point[1]) {
      return;
    }

    const changes = entering(
      previous ? [[previous[0], previous[1]], point] : [point]
    ).flatMap(({ block }) => changedAt(block));

    if (changes.length > 0) {
      seal();
      cutAt(Math.max(...changes));
      if (event.timeStamp < dropBefore) return;
    }

    const open = epoch ?? {
      at: Date.now(),
      blocks: [],
      note: undefined,
      samples: [],
      start: event.timeStamp,
    };
    const [last] = open.samples.slice(-1);
    const segment: Point[] = last ? [[last[0], last[1]], point] : [point];

    epoch = open;
    for (const { block } of entering(segment)) {
      const entered = enter(block, origin);

      if (entered) open.blocks.push(entered);
    }
    if (open.samples.length === 0 && open.blocks.length === 0) {
      open.note = nearestTo(point, origin);
    }
    open.samples.push([
      point[0],
      point[1],
      inkPressure(
        event,
        last && {
          distance: Math.hypot(point[0] - last[0], point[1] - last[1]),
          pressure: last[2],
        },
        brush.size
      ),
      Math.max(last?.[3] ?? 0, event.timeStamp - open.start),
    ]);
  };

  const cancel = () => {
    epoch = null;
    contact = null;
    changedSinceCut = new Map();
    draw();
  };

  const onPointerDown = (event: PointerEvent) => {
    const current = tool();

    if (
      !current ||
      !inkDraws(event, contact !== null) ||
      (event.target instanceof Element &&
        event.target.closest('[data-ink-sign]'))
    ) {
      return;
    }
    event.preventDefault();
    contact = { brush: current.brush, pointerId: event.pointerId };
    savedAt = undefined;
    changedSinceCut = new Map();
    dropBefore = Number.NEGATIVE_INFINITY;
    layer.setPointerCapture(event.pointerId);
    take(event, originOf());
    draw();
  };
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== contact?.pointerId) return;

    const origin = originOf();

    if (epoch && heldMoved(epoch, origin, 'boxes')) {
      blocks = null;
      sealOnChange();
    }
    for (const sample of inkSamplesOf(event)) take(sample, origin);
    draw();
  };
  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerId !== contact?.pointerId) return;
    seal();
    contact = null;
    draw();
  };
  const onPointerCancel = (event: PointerEvent) => {
    if (event.pointerId === contact?.pointerId) cancel();
  };

  const unsubscribe = editor.subscribeCommit(({ changed }) => {
    blocks = null;
    if (!contact) return;

    const paths = changed.paths();

    if (paths.length === 0) return;
    if (
      epoch &&
      heldBy(epoch).some(({ block }) => {
        const path = view.read.nodes.get(block.key)?.[1];

        return !path || paths.some((at) => PathApi.compare(at, path) <= 0);
      })
    ) {
      sealOnChange();

      return;
    }

    const time = performance.now();

    for (const path of paths) {
      for (let at = 1; at <= path.length; at++) {
        const key = view.key(path.slice(0, at));

        if (key) changedSinceCut.set(key, time);
      }
    }
  });
  layer.addEventListener('pointerdown', onPointerDown);
  layer.addEventListener('pointermove', onPointerMove);
  layer.addEventListener('pointerup', onPointerUp);
  layer.addEventListener('pointercancel', onPointerCancel);

  return {
    cancel,
    detach: () => {
      cancel();
      unsubscribe();
      layer.removeEventListener('pointerdown', onPointerDown);
      layer.removeEventListener('pointermove', onPointerMove);
      layer.removeEventListener('pointerup', onPointerUp);
      layer.removeEventListener('pointercancel', onPointerCancel);
    },
    layoutChanged: (change: InkLayoutChange) => {
      blocks = null;
      if (!epoch || heldMoved(epoch, originOf(), change)) sealOnChange();
    },
  };
};
