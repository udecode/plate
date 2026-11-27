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
  type InkTool,
} from '../../../features/ink/lib';
import {
  roundPixel,
  roundSample,
} from '../../../features/ink/lib/inkCodec.internal';
import {
  footprintEnters,
  gapAround,
  inkTouchedWords,
  inkWords,
} from '../../../features/ink/lib/inkMatch.internal';
import { type Editor, HistoryPlugin } from '../../core';
import { inkDraws, inkPressure, inkSamplesOf } from './inkInput.internal';
import {
  type InkLayerOrigin,
  type InkMeasuredBlock,
  type InkTextBlock,
  type InkVoidBlock,
  inkBoxOf,
  inkTextBlocks,
  inkVoidBlocks,
  inkVoidBoxOf,
  inkWordBoxes,
  measureInkBlock,
  sameInkBox,
  sameInkLayout,
} from './inkMeasure.internal';
import { inkOutline } from './inkPaint.internal';
import { type InkLayoutChange, keepsLayouts } from './inkWatch.internal';

type Point = readonly [x: number, y: number];

type Entered = Readonly<{
  block: InkTextBlock;
  direction: InkMarkInput['direction'];
  live: InkMeasuredBlock;
}>;

type EnteredVoid = Readonly<{
  block: InkVoidBlock;
  box: ReturnType<typeof inkBoxOf>;
  direction: InkMarkInput['direction'];
}>;

type Epoch = {
  readonly at: number;
  readonly blocks: Entered[];
  note: Entered | undefined;
  readonly samples: InkSample[];
  readonly start: number;
  readonly voidBlock?: EnteredVoid;
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

  const middle =
    points.reduce((sum, [x]) => sum + x, 0) / points.length - live.box.left;
  let offset = lineStart(live, index);

  for (const { offset: after, word } of placesOnLine(live, index)) {
    if (word && word.left + word.width / 2 < middle) offset = after;
  }

  const place = placeAt(live, offset);

  return place
    ? [{ end: offset, left: place.left, start: offset, width: place.width }]
    : [];
};

const placesOnLine = (live: InkMeasuredBlock, index: number) => {
  const start = lineStart(live, index);
  const { end } = live.lines[index];

  return [
    { offset: start, word: undefined },
    ...inkWords(live.text)
      .filter(([from]) => from >= start && from < end)
      .map(([from, to]) => ({
        offset: Math.min(to, end),
        word: live.measure(from, Math.min(to, end)),
      })),
  ];
};

const placeAt = (live: InkMeasuredBlock, offset: number) =>
  live.measure(...gapAround(live.text, offset)) ?? live.measure(offset, offset);

const readSealBoxes = (live: InkMeasuredBlock) => {
  inkWordBoxes(live);
  for (const index of live.lines.keys()) {
    for (const { offset } of placesOnLine(live, index)) placeAt(live, offset);
  }
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
  tool: () => InkTool | null;
  view: Editor;
}>) => {
  let contact: Readonly<{
    brush: InkBrush;
    pointerId: number;
    tool: InkTool;
  }> | null = null;
  let epoch: Epoch | null = null;
  let blocks: Array<
    Readonly<{ block: InkTextBlock; box: ReturnType<typeof inkBoxOf> }>
  > | null = null;
  let voidTargets: Array<
    Readonly<{
      block: InkVoidBlock;
      box: ReturnType<typeof inkBoxOf> | undefined;
      outer: ReturnType<typeof inkBoxOf>;
    }>
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

  const voidTargetsAt = (origin: InkLayerOrigin) => {
    voidTargets ??= inkVoidBlocks(view).map((block) => ({
      block,
      box: inkVoidBoxOf(block.element, origin),
      outer: inkBoxOf(block.element, origin),
    }));

    return voidTargets;
  };

  const pointInBox = ([x, y]: Point, box: ReturnType<typeof inkBoxOf>) =>
    x >= box.left &&
    x <= box.left + box.width &&
    y >= box.top &&
    y <= box.top + box.height;

  const voidTargetAt = (point: Point, origin: InkLayerOrigin) => {
    const targets = voidTargetsAt(origin);
    const visual = targets.find(
      (target) => target.box !== undefined && pointInBox(point, target.box)
    );

    if (visual?.box) {
      return {
        hit: {
          block: visual.block,
          box: visual.box,
          direction:
            getComputedStyle(visual.block.element).direction === 'rtl'
              ? ('rtl' as const)
              : ('ltr' as const),
        },
        kind: 'void' as const,
      };
    }
    if (targets.some((target) => pointInBox(point, target.outer))) {
      return { kind: 'outside-void-box' as const };
    }

    return undefined;
  };

  const enter = (
    block: InkTextBlock,
    origin: InkLayerOrigin
  ): Entered | undefined => {
    const live = measureInkBlock(block.element, block.text, origin);

    if (live) readSealBoxes(live);

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
    if (done.voidBlock) {
      const { block, box, direction } = done.voidBlock;

      return {
        at: done.at,
        blocks: [
          {
            block: block.id,
            height: box.height,
            left: box.left,
            lines: [],
            runs: [],
            text: '',
            top: box.top,
            width: box.width,
          },
        ],
        brush,
        direction,
        samples: done.samples,
      };
    }

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
        voids: block.voids,
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
    if (!done) return;

    const input = contact && inputOf(done, contact.brush);

    if (!contact || !input) return;

    const by = contact.tool;

    scheduleAfterCommitNotification(editor, () => {
      if (tool() !== by) return;

      const tracked = editor.plugin(HistoryPlugin).installed;
      const joins = tracked && savedAt === editor.read.history().revision;

      editor.update((tx) => {
        if (!input.blocks.every((block) => tx.nodes.byId(block.block))) return;
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
    if (tool() !== contact.tool) {
      cancel();

      return;
    }
    seal();
    cutAt(performance.now());
    draw();
  };

  const heldMoved = (
    open: Epoch,
    origin: InkLayerOrigin,
    change: InkLayoutChange
  ) => {
    if (open.voidBlock) {
      const now = inkVoidBoxOf(open.voidBlock.block.element, origin);

      return !now || !sameInkBox(open.voidBlock.box, now);
    }

    return heldBy(open).some(({ block, live }) =>
      keepsLayouts(change)
        ? !sameInkBox(live.box, inkBoxOf(block.element, origin))
        : !sameInkLayout(
            live,
            measureInkBlock(block.element, block.text, origin)
          )
    );
  };

  const changedAt = (block: Pick<InkTextBlock, 'path'>) =>
    block.path.flatMap((_, at) => {
      const key = view.key(block.path.slice(0, at + 1));
      const time = key === null ? undefined : changedSinceCut.get(key);

      return time === undefined ? [] : [time];
    });

  const take = (
    event: PointerEvent,
    origin: InkLayerOrigin,
    initialVoid?: EnteredVoid
  ) => {
    if (!contact || event.timeStamp < dropBefore) return;

    const point: Point = [
      roundPixel(event.clientX - origin.left),
      roundPixel(event.clientY - origin.top),
    ];
    const [previous] = epoch?.samples.slice(-1) ?? [];
    const { brush } = contact;
    const radius = brush.size / 2;

    if (previous && previous[0] === point[0] && previous[1] === point[1]) {
      return;
    }

    const activeVoid = epoch?.voidBlock ?? initialVoid;

    if (activeVoid) {
      const open = epoch ?? {
        at: Date.now(),
        blocks: [],
        note: undefined,
        samples: [],
        start: event.timeStamp,
        voidBlock: activeVoid,
      };
      const [last] = open.samples.slice(-1);

      epoch = open;
      open.samples.push(
        roundSample([
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
        ])
      );

      return;
    }

    const entering = (segment: readonly Point[]) =>
      blocksAt(origin).filter(
        ({ block, box }) =>
          !epoch?.blocks.some((entered) => entered.block.key === block.key) &&
          footprintEnters(segment, radius, box)
      );

    const changes = entering(
      previous ? [[previous[0], previous[1]], point] : [point]
    ).flatMap(({ block }) => changedAt(block));

    if (changes.length > 0) {
      seal();
      if (!holdOrEnd(event)) return;
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
    open.samples.push(
      roundSample([
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
      ])
    );
  };

  const cancel = () => {
    epoch = null;
    contact = null;
    changedSinceCut = new Map();
    draw();
  };

  const onPointerDown = (event: PointerEvent) => {
    const current = tool();

    if (current?.type !== 'draw' || !inkDraws(event, contact !== null)) {
      return;
    }

    const origin = originOf();

    voidTargets = null;
    const voidHit = voidTargetAt(
      [event.clientX - origin.left, event.clientY - origin.top],
      origin
    );

    if (voidHit?.kind === 'outside-void-box') return;

    event.preventDefault();
    contact = {
      brush: current.brush,
      pointerId: event.pointerId,
      tool: current,
    };
    savedAt = undefined;
    changedSinceCut = new Map();
    dropBefore = Number.NEGATIVE_INFINITY;
    layer.setPointerCapture(event.pointerId);
    take(event, origin, voidHit?.hit);
    draw();
  };
  const holdOrEnd = (event: PointerEvent) => {
    if (event.pointerId !== contact?.pointerId) return false;
    if (tool() === contact.tool) return true;
    cancel();

    return false;
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!holdOrEnd(event)) return;

    const origin = originOf();

    if (epoch && heldMoved(epoch, origin, 'boxes')) {
      blocks = null;
      voidTargets = null;
      sealOnChange();
    }
    for (const sample of inkSamplesOf(event)) {
      if (!holdOrEnd(event)) return;
      take(sample, originOf());
    }
    draw();
  };
  const onPointerUp = (event: PointerEvent) => {
    if (!holdOrEnd(event)) return;
    try {
      seal();
    } finally {
      contact = null;
      draw();
    }
  };
  const onPointerCancel = (event: PointerEvent) => {
    if (event.pointerId === contact?.pointerId) cancel();
  };

  const unsubscribe = editor.subscribeCommit(({ changed }) => {
    blocks = null;
    voidTargets = null;
    if (!contact) return;
    if (tool() !== contact.tool) {
      cancel();

      return;
    }

    const paths = changed.paths();

    if (paths.length === 0) return;
    const heldBlocks: ReadonlyArray<Readonly<{ key: NodeKey }>> =
      epoch?.voidBlock
        ? [epoch.voidBlock.block]
        : epoch
          ? heldBy(epoch).map(({ block }) => block)
          : [];

    if (
      heldBlocks.some((block) => {
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
  layer.addEventListener('lostpointercapture', onPointerCancel);

  return {
    cancel,
    detach: () => {
      cancel();
      unsubscribe();
      layer.removeEventListener('pointerdown', onPointerDown);
      layer.removeEventListener('pointermove', onPointerMove);
      layer.removeEventListener('pointerup', onPointerUp);
      layer.removeEventListener('pointercancel', onPointerCancel);
      layer.removeEventListener('lostpointercapture', onPointerCancel);
    },
    layoutChanged: (change: InkLayoutChange) => {
      blocks = null;
      voidTargets = null;
      if (!epoch || heldMoved(epoch, originOf(), change)) sealOnChange();
    },
  };
};
