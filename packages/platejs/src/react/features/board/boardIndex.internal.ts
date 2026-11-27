import RBush, { type BBox } from 'rbush';

import { type Element, ElementApi, type NodeKey } from '../../../core';
import type {
  BoardFrameEntry,
  BoardMemberEntry,
  BoardPlace,
  BoardShapeEntry,
  BoardSize,
} from '../../../features/board/lib';
import {
  ARROW_SIDES,
  type BoardArrowEnd,
  type BoardArrowEnds,
  type BoardArrowTarget,
  boardArrowTargetOf,
  boardOutlineOf,
  isBoundArrowEnd,
  resolveBoardArrow,
} from '../../../features/board/lib/boardArrow.internal';
import {
  paintKeyOf,
  paintOrder,
} from '../../../features/board/lib/boardCopy.internal';
import {
  MIN_SHAPE_SIZE,
  flooredSizeKeepingRatio,
} from '../../../features/board/lib/boardRatio.internal';
import {
  BOARD_STROKE_REACH,
  type BoardInkPoint,
  boardInkIn,
  boardStrokePath,
  type BoardStrokePath,
  boardStrokePointsOf,
  type BoardStrokePoints,
} from '../../../features/board/lib/boardStroke.internal';
import type { BoardTypes } from '../../../features/board/lib/boardTypes.internal';
import { lineSide, segmentGap } from '../../../internal/penStroke.internal';
import { INK_SLOP_PX, onInk } from './boardInk.internal';

export type BoardBox = BoardPlace & BoardSize;

export type BoardShapeLayout = Readonly<{
  box: BoardBox;
  takesText: boolean;
  id: string;
  keepsRatio: boolean;
  /** A stroke's stored points, which a press must reach to hit it. */
  ink?: BoardStrokePoints;
  key: NodeKey;
  kind: BoardMemberEntry['kind'];
  rank: number;
}>;

/** Where an arrow draws: its two ends in board coordinates and the path between them. */
export type BoardArrowPath = BoardArrowEnds & Readonly<{ path: string }>;

type ArrowEnds = Readonly<{ end: BoardArrowEnd; start: BoardArrowEnd }>;

type ArrowRecord = ArrowEnds &
  Readonly<{ bound: readonly string[]; drawn: BoardArrowPath }>;

type CullBox = BBox & { key: NodeKey };

const FRAME_EDGE_PX = 8;

export const sameBox = (a: BoardBox, b: BoardBox) =>
  a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

const sameEnd = (a: BoardArrowEnd, b: BoardArrowEnd) =>
  a.x === b.x &&
  a.y === b.y &&
  (isBoundArrowEnd(a)
    ? isBoundArrowEnd(b) &&
      a.shape === b.shape &&
      a.anchor[0] === b.anchor[0] &&
      a.anchor[1] === b.anchor[1]
    : !isBoundArrowEnd(b));

const sameTarget = (a: BoardArrowTarget, b: BoardArrowTarget) =>
  a.outline === b.outline &&
  sameBox({ ...a.place, ...a.size }, { ...b.place, ...b.size });

const memberTarget = (entry: BoardFrameEntry | BoardShapeEntry) =>
  boardArrowTargetOf({
    geo: entry.node.geo,
    place: entry.place,
    size: entry.size,
  });

const drawArrow = (
  ends: ArrowEnds,
  targetOf: (id: string) => BoardArrowTarget | undefined
): BoardArrowPath => {
  const { end, start } = resolveBoardArrow(ends, targetOf);

  return { end, path: `M${start.x} ${start.y}L${end.x} ${end.y}`, start };
};

export const spanOf = ({ end, start }: BoardArrowEnds): BoardBox => ({
  height: Math.abs(end.y - start.y),
  width: Math.abs(end.x - start.x),
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
});

/**
 * A corner of a shape's box: the one a corner handle drags, or the one the
 * keys move while S resizes a shape. The opposite corner stays where it is.
 */
export type BoardCorner = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

export const CORNERS_CLOCKWISE: readonly BoardCorner[] = [
  'bottomRight',
  'bottomLeft',
  'topLeft',
  'topRight',
];

export type BoardBoxModifiers = Readonly<{
  center: boolean;
  keepRatio: boolean;
}>;

export const draggedBox = (
  press: BoardPlace,
  pointer: BoardPlace,
  { center, keepRatio }: BoardBoxModifiers
): BoardBox => {
  const dx = pointer.x - press.x;
  const dy = pointer.y - press.y;
  const side = Math.max(Math.abs(dx), Math.abs(dy));
  const sides = center ? 2 : 1;
  const width = Math.max(
    MIN_SHAPE_SIZE,
    (keepRatio ? side : Math.abs(dx)) * sides
  );
  const height = Math.max(
    MIN_SHAPE_SIZE,
    (keepRatio ? side : Math.abs(dy)) * sides
  );
  const from = (at: number, by: number, length: number) => {
    if (center) return at - length / 2;

    return by < 0 ? at - length : at;
  };

  return {
    height,
    width,
    x: from(press.x, dx, width),
    y: from(press.y, dy, height),
  };
};

export const resized = (
  start: BoardBox,
  corner: BoardCorner,
  dx: number,
  dy: number,
  { center, keepRatio }: BoardBoxModifiers
): BoardBox => {
  const left = corner === 'bottomLeft' || corner === 'topLeft';
  const top = corner === 'topLeft' || corner === 'topRight';
  const sides = center ? 2 : 1;
  let width = start.width + (left ? -dx : dx) * sides;
  let height = start.height + (top ? -dy : dy) * sides;

  if (keepRatio && start.width > 0 && start.height > 0) {
    const across = width / start.width;
    const down = height / start.height;

    ({ height, width } =
      Math.abs(across - 1) > Math.abs(down - 1)
        ? flooredSizeKeepingRatio(start, 'width', width)
        : flooredSizeKeepingRatio(start, 'height', height));
  } else {
    width = Math.max(MIN_SHAPE_SIZE, width);
    height = Math.max(MIN_SHAPE_SIZE, height);
  }

  if (center) {
    return {
      height,
      width,
      x: start.x + (start.width - width) / 2,
      y: start.y + (start.height - height) / 2,
    };
  }

  return {
    height,
    width,
    x: left ? start.x + (start.width - width) : start.x,
    y: top ? start.y + (start.height - height) : start.y,
  };
};

const sameInk = (a: BoardStrokePoints, b: BoardStrokePoints) =>
  a === b || (a.length === b.length && a.every((value, at) => value === b[at]));

// An unchanged member keeps its layout object, so its line in board
// coordinates is computed once, not on every press or eraser move.
const drawnInk = new WeakMap<BoardShapeLayout, readonly BoardInkPoint[]>();

const inkOnBoard = (layout: BoardShapeLayout, ink: BoardStrokePoints) => {
  let drawn = drawnInk.get(layout);

  if (!drawn) {
    drawn = boardInkIn(ink, layout.box);
    drawnInk.set(layout, drawn);
  }

  return drawn;
};

const inBox = (box: BoardBox, at: BoardPlace) =>
  at.x >= box.x &&
  at.y >= box.y &&
  at.x <= box.x + box.width &&
  at.y <= box.y + box.height;

const onFrameEdge = (box: BoardBox, at: BoardPlace, zoom: number) =>
  Math.min(
    at.x - box.x,
    at.y - box.y,
    box.x + box.width - at.x,
    box.y + box.height - at.y
  ) <
  FRAME_EDGE_PX / zoom;

// Every outline is convex, so a point inside it is on one side of each edge.
const inOutline = (outline: readonly BoardPlace[], at: BoardPlace) => {
  const sides = new Set(
    outline.map((start, index) =>
      Math.sign(lineSide(start, outline[(index + 1) % outline.length], at))
    )
  );

  return !sides.has(1) || !sides.has(-1);
};

const outlineAlong = (
  outline: readonly BoardPlace[],
  from: BoardPlace,
  to: BoardPlace,
  slop: number,
  solid: () => boolean
) =>
  outline.some(
    (start, at) =>
      segmentGap(from, to, start, outline[(at + 1) % outline.length]) <= slop
  ) ||
  ((inOutline(outline, from) || inOutline(outline, to)) && solid());

// A geo shape with no fill and no label draws only its outline, so, as in
// Excalidraw, the eraser reaches it only near that outline.
const hollow = (
  node: Element | undefined,
  geoType: string | undefined,
  isEmpty: (block: Element) => boolean
) =>
  node !== undefined &&
  node.type === geoType &&
  (node.fill ?? 'none') === 'none' &&
  node.children.every((block) => ElementApi.isElement(block) && isEmpty(block));

const reaches = (layout: BoardShapeLayout, at: BoardPlace, zoom: number) => {
  switch (layout.kind) {
    case 'arrow': {
      return false;
    }
    case 'frame': {
      return inBox(layout.box, at) && onFrameEdge(layout.box, at, zoom);
    }
    default: {
      return layout.ink
        ? onInk(inkOnBoard(layout, layout.ink), at, at, zoom)
        : inBox(layout.box, at);
    }
  }
};

/**
 * The board's derived geometry, rebuilt from its members when its root
 * changes: each member's layout and paint rank, the spatial index the window
 * and hit tests read, frame membership, and where each arrow draws, with the
 * preview a gesture shows in place of the stored drawing.
 */
export const createBoardIndex = ({
  children: childrenOf,
  takesText: takesTextIn,
  isEmpty,
  keepsRatio: keepsRatioIn,
  members: membersRead,
  nodeOf,
  previewCleared,
  types,
}: Readonly<{
  /** The board root's top-level blocks, whose identity changes with them. */
  children: () => readonly unknown[];
  takesText: (node: BoardMemberEntry['node']) => boolean;
  isEmpty: (block: Element) => boolean;
  keepsRatio: (node: BoardMemberEntry['node']) => boolean;
  members: () => readonly BoardMemberEntry[];
  /** A member's current node, which a text commit changes without an update. */
  nodeOf: (key: NodeKey) => Element | undefined;
  previewCleared: () => void;
  types: BoardTypes;
}>) => {
  const tree = new RBush<CullBox>();
  let children: readonly unknown[] | null = null;
  let entries: readonly BoardMemberEntry[] = [];
  let layouts = new Map<NodeKey, BoardShapeLayout>();
  let byId = new Map<string, BoardShapeLayout>();
  let membersOf = new Map<string, readonly string[]>();
  let targets = new Map<string, BoardArrowTarget>();
  let arrows = new Map<NodeKey, ArrowRecord>();
  let arrowsTo = new Map<string, ReadonlySet<NodeKey>>();
  let previewed = new Map<NodeKey, BoardArrowPath>();
  let previewedBoxes = new Map<string, BoardBox>();
  const shownLayouts = new WeakMap<BoardShapeLayout, BoardShapeLayout>();
  const arrowListeners = new Map<NodeKey, Set<() => void>>();
  const strokePaths = new WeakMap<BoardStrokePoints, BoardStrokePath>();
  let version = 0;

  const isStroke = (entry: BoardMemberEntry) =>
    entry.node.type === types.stroke();

  const inkOf = (entry: BoardMemberEntry) =>
    boardStrokePointsOf(entry, types.stroke());

  const sameMember = (entry: BoardMemberEntry, previous: BoardMemberEntry) => {
    if (
      entry.key !== previous.key ||
      entry.id !== previous.id ||
      entry.zIndex !== previous.zIndex
    ) {
      return false;
    }
    if (entry.kind === 'arrow') {
      return (
        previous.kind === 'arrow' &&
        sameEnd(entry.start, previous.start) &&
        sameEnd(entry.end, previous.end)
      );
    }

    const shown = targets.get(entry.id);

    return (
      entry.node.type === previous.node.type &&
      (!isStroke(entry) || entry.node.points === previous.node.points) &&
      (entry.kind === 'frame' ||
        (previous.kind === 'shape' && previous.frame === entry.frame)) &&
      !!shown &&
      sameTarget(memberTarget(entry), shown)
    );
  };

  const update = () => {
    const next = childrenOf();

    if (next === children) return;
    children = next;

    const read = membersRead();
    const same =
      read.length === entries.length &&
      read.every((entry, at) => sameMember(entry, entries[at]));

    entries = read;
    if (same) return;
    version += 1;

    const nextTargets = new Map<string, BoardArrowTarget>();
    const changed = new Set<string>();

    for (const entry of read) {
      if (entry.kind === 'arrow') continue;

      const target = memberTarget(entry);
      const previous = targets.get(entry.id);

      if (previous && sameTarget(previous, target)) {
        nextTargets.set(entry.id, previous);
      } else {
        nextTargets.set(entry.id, target);
        changed.add(entry.id);
      }
    }
    for (const id of targets.keys()) {
      if (!nextTargets.has(id)) changed.add(id);
    }
    targets = nextTargets;

    const redraw = new Set<NodeKey>();

    for (const id of changed) {
      for (const key of arrowsTo.get(id) ?? []) redraw.add(key);
    }

    const nextArrows = new Map<NodeKey, ArrowRecord>();
    const nextArrowsTo = new Map<string, Set<NodeKey>>();

    for (const entry of read) {
      if (entry.kind !== 'arrow') continue;

      const previous = arrows.get(entry.key);
      const record =
        previous &&
        !redraw.has(entry.key) &&
        sameEnd(previous.start, entry.start) &&
        sameEnd(previous.end, entry.end)
          ? previous
          : {
              bound: ARROW_SIDES.flatMap((side) => {
                const end = entry[side];

                return isBoundArrowEnd(end) ? [end.shape] : [];
              }),
              drawn: drawArrow(entry, (id) => targets.get(id)),
              end: entry.end,
              start: entry.start,
            };

      nextArrows.set(entry.key, record);
      for (const id of record.bound) {
        const keys = nextArrowsTo.get(id) ?? new Set();

        keys.add(entry.key);
        nextArrowsTo.set(id, keys);
      }
    }
    arrows = nextArrows;
    arrowsTo = nextArrowsTo;

    const ranks = new Map(
      read
        .map(paintKeyOf)
        .map((key, at) => ({ key, member: read[at] }))
        .sort((a, b) => paintOrder(a.key, b.key))
        .map(({ member }, at) => [member.key, at + 1])
    );
    const nextLayouts = new Map<NodeKey, BoardShapeLayout>();
    const nextMembers = new Map<string, string[]>();

    for (const entry of read) {
      const arrow = arrows.get(entry.key);
      const box = arrow
        ? spanOf(arrow.drawn)
        : entry.kind === 'arrow'
          ? null
          : { ...entry.place, ...entry.size };
      const rank = ranks.get(entry.key) ?? 0;
      const previous = layouts.get(entry.key);
      const stored = inkOf(entry);
      // A write to a stroke copies its points, so equal points keep the
      // previous array, which the path cache holds.
      const ink =
        stored && previous?.ink && sameInk(previous.ink, stored)
          ? previous.ink
          : stored;
      const takesText = takesTextIn(entry.node);
      const keepsRatio = keepsRatioIn(entry.node);

      if (!box) continue;
      if (entry.kind === 'shape' && entry.frame !== undefined) {
        const members = nextMembers.get(entry.frame);

        if (members) members.push(entry.id);
        else nextMembers.set(entry.frame, [entry.id]);
      }
      nextLayouts.set(
        entry.key,
        previous &&
          previous.rank === rank &&
          previous.id === entry.id &&
          previous.kind === entry.kind &&
          previous.takesText === takesText &&
          previous.keepsRatio === keepsRatio &&
          previous.ink === ink &&
          sameBox(previous.box, box)
          ? previous
          : {
              box,
              takesText,
              id: entry.id,
              keepsRatio,
              ...(ink ? { ink } : {}),
              key: entry.key,
              kind: entry.kind,
              rank,
            }
      );
    }
    layouts = nextLayouts;
    membersOf = nextMembers;
    byId = new Map(
      [...nextLayouts.values()].map((layout) => [layout.id, layout])
    );
    tree.clear().load(
      [...nextLayouts.values()].map(({ box, key }) => ({
        key,
        maxX: box.x + box.width,
        maxY: box.y + box.height,
        minX: box.x,
        minY: box.y,
      }))
    );
  };

  const notifyArrows = (keys: Iterable<NodeKey>) => {
    for (const key of keys) {
      for (const listener of arrowListeners.get(key) ?? []) listener();
    }
  };

  const along = (
    layout: BoardShapeLayout,
    from: BoardPlace,
    to: BoardPlace,
    zoom: number
  ) => {
    const slop = INK_SLOP_PX / zoom;

    switch (layout.kind) {
      case 'arrow': {
        const drawn = arrows.get(layout.key)?.drawn;

        return !!drawn && segmentGap(from, to, drawn.start, drawn.end) <= slop;
      }
      case 'frame': {
        return false;
      }
      default: {
        if (layout.ink) {
          return onInk(inkOnBoard(layout, layout.ink), from, to, zoom);
        }

        const target = targets.get(layout.id);

        return (
          !!target &&
          outlineAlong(
            boardOutlineOf(target, zoom),
            from,
            to,
            slop,
            () => !hollow(nodeOf(layout.key), types.geo(), isEmpty)
          )
        );
      }
    }
  };

  const drawnTo = (end: BoardArrowEnd) =>
    isBoundArrowEnd(end) && targets.has(end.shape) ? end.shape : undefined;

  return {
    arrowPathOf: (key: NodeKey) => {
      if (!arrows.has(key)) update();

      return previewed.get(key) ?? arrows.get(key)?.drawn;
    },
    byId: (id: string) => byId.get(id),
    clearPreview: () => {
      if (previewedBoxes.size > 0) {
        previewedBoxes = new Map();
        previewCleared();
      }
      if (previewed.size === 0) return;

      const keys = [...previewed.keys()];

      previewed = new Map();
      notifyArrows(keys);
    },
    drawnTo,
    entries: () => entries,
    layout: (key: NodeKey) => layouts.get(key),
    layouts: () => layouts.values(),
    membersOf: (id: string) => membersOf.get(id),
    /**
     * Show the arrows that `ids` carry or bind as if each shape `boxOf`
     * names sat at that box and each carried arrow's free ends moved by
     * `delta`, until the next preview or `clearPreview`.
     */
    previewArrows: (
      ids: readonly string[],
      boxOf: (id: string) => BoardBox | undefined,
      delta: BoardPlace
    ) => {
      const moving = new Set<NodeKey>();
      const reached = new Set<NodeKey>();

      for (const id of ids) {
        const layout = byId.get(id);

        if (layout?.kind === 'arrow') {
          moving.add(layout.key);
          reached.add(layout.key);
        }
        for (const key of arrowsTo.get(id) ?? []) reached.add(key);
      }

      const shift = (end: BoardArrowEnd) =>
        drawnTo(end) === undefined
          ? { x: end.x + delta.x, y: end.y + delta.y }
          : end;
      const next = new Map<NodeKey, BoardArrowPath>();

      for (const key of reached) {
        const arrow = arrows.get(key);

        if (!arrow) continue;
        next.set(
          key,
          drawArrow(
            moving.has(key)
              ? { end: shift(arrow.end), start: shift(arrow.start) }
              : arrow,
            (id) => {
              const target = targets.get(id);
              const box = target && boxOf(id);

              return box
                ? {
                    ...target,
                    place: { x: box.x, y: box.y },
                    size: { height: box.height, width: box.width },
                  }
                : target;
            }
          )
        );
      }

      const left = [...previewed.keys()].filter((key) => !next.has(key));

      previewed = next;
      notifyArrows([...next.keys(), ...left]);
    },
    previewShape: (id: string, box: BoardBox) => {
      previewedBoxes.set(id, box);
    },
    resolveArrow: (ends: ArrowEnds) =>
      resolveBoardArrow(ends, (id) => targets.get(id)),
    search: (box: BBox) => tree.search(box),
    /**
     * The ids of the members the segment from board point `from` to `to`
     * passes over, or within `INK_SLOP_PX` screen pixels of at `zoom`: a
     * stroke near its line, an arrow near its drawn line, any other shape
     * inside or near its outline, and a geo shape with no fill or label only
     * near its outline. A frame is never among them.
     */
    shapesAlong: (from: BoardPlace, to: BoardPlace, zoom: number) => {
      // A stroke resized below twice its line's radius draws past its box,
      // by up to that radius.
      const reach = INK_SLOP_PX / zoom + BOARD_STROKE_REACH;
      const ids: string[] = [];

      for (const { key } of tree.search({
        maxX: Math.max(from.x, to.x) + reach,
        maxY: Math.max(from.y, to.y) + reach,
        minX: Math.min(from.x, to.x) - reach,
        minY: Math.min(from.y, to.y) - reach,
      })) {
        const layout = layouts.get(key);

        if (layout && along(layout, from, to, zoom)) ids.push(layout.id);
      }

      return ids;
    },
    /**
     * The frontmost member other than `except` that a press at `at` reaches:
     * no arrow, a frame only on its edge, and a stroke only on its line.
     */
    shapeAt: (at: BoardPlace, zoom: number, except?: string) => {
      // A press within the slop of a stroke's line can fall past its box.
      const slop = INK_SLOP_PX / zoom;
      let top: BoardShapeLayout | undefined;

      for (const { key } of tree.search({
        maxX: at.x + slop,
        maxY: at.y + slop,
        minX: at.x - slop,
        minY: at.y - slop,
      })) {
        const layout = layouts.get(key);

        if (
          layout &&
          layout.id !== except &&
          (!top || layout.rank > top.rank) &&
          reaches(layout, at, zoom)
        ) {
          top = layout;
        }
      }

      return top;
    },
    shownLayout: (id: string) => {
      const layout = byId.get(id);
      const box = previewedBoxes.get(id);

      if (!layout || !box) return layout;

      const cached = shownLayouts.get(layout);

      if (cached?.box === box) return cached;

      const shown = { ...layout, box };

      shownLayouts.set(layout, shown);

      return shown;
    },
    snapTargets: (area: BoardBox, except: ReadonlySet<string>) => {
      const boxes: BoardBox[] = [];

      for (const { key } of tree.search({
        maxX: area.x + area.width,
        maxY: area.y + area.height,
        minX: area.x,
        minY: area.y,
      })) {
        const layout = layouts.get(key);

        if (
          layout &&
          layout.kind !== 'arrow' &&
          !layout.ink &&
          !except.has(layout.id)
        ) {
          boxes.push(layout.box);
        }
      }

      return boxes;
    },
    storedBoxOf: (id: string) => {
      const layout = byId.get(id);

      return layout && layout.kind !== 'arrow' ? layout.box : undefined;
    },
    /**
     * Where the stroke `key` draws its line within its box. The path is
     * computed once per points and size, so a write that keeps both, such as
     * a move, returns the same path.
     */
    strokePathOf: (key: NodeKey) => {
      if (!layouts.has(key)) update();

      const layout = layouts.get(key);
      const ink = layout?.ink;

      if (!layout || !ink) return undefined;

      const { height, width } = layout.box;
      const drawn = strokePaths.get(ink);

      if (drawn && drawn.height === height && drawn.width === width) {
        return drawn;
      }

      const next = boardStrokePath(ink, layout.box);

      strokePaths.set(ink, next);

      return next;
    },
    subscribeArrow: (key: NodeKey, listener: () => void) => {
      const listeners = arrowListeners.get(key) ?? new Set();

      listeners.add(listener);
      arrowListeners.set(key, listeners);

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) arrowListeners.delete(key);
      };
    },
    update,
    version: () => version,
  };
};

export type BoardIndex = ReturnType<typeof createBoardIndex>;
