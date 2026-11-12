import RBush, { type BBox } from 'rbush';
import * as React from 'react';

import {
  type ContentSlice,
  createEditorView,
  type Element,
  type Descendant,
  Hotkeys,
  type NodeKey,
  type PluginTransaction,
} from '../../../core';
import { readAuthoredView, subscribeEditorViewState } from '../../../facade';
import {
  BaseBoardArrowPlugin,
  BaseBoardFramePlugin,
  BaseBoardGeoPlugin,
  BaseBoardNotePlugin,
  BaseBoardPlugin,
  type BoardArrowEndInput,
  type BoardFrameEntry,
  type BoardGeo,
  type BoardMemberEntry,
  type BoardPlace,
  type BoardRestackDirection,
  type BoardShapeEntry,
  type BoardSize,
} from '../../../features/board/lib';
import {
  ARROW_SIDES,
  type BoardArrowEnd,
  type BoardArrowEnds,
  type BoardArrowTarget,
  boardArrowTargetOf,
  isBoundArrowEnd,
  resolveBoardArrow,
} from '../../../features/board/lib/boardArrow.internal';
import {
  paintKeyOf,
  paintOrder,
} from '../../../features/board/lib/boardCopy.internal';
import { BOARD_FRAME_SIZE } from '../../../features/board/lib/boardFrame.internal';
import {
  BOARD_SHAPES_SLOT,
  shapeSelectionMode,
} from '../../../features/board/lib/boardShape.internal';
import type { Editor } from '../../core';

/** Where a board view looks: the board point at its top left corner, and its zoom. */
export type BoardCamera = Readonly<{ x: number; y: number; zoom: number }>;

/**
 * What a press on the board does: `arrow` draws an arrow from the press to
 * the release, and the other tools act on an empty part of the board, which
 * includes the inside of a frame. `frame` draws a frame over a drag, or adds
 * one of the frame's default size centered at a click.
 */
export type BoardTool = 'arrow' | 'frame' | 'geo' | 'note' | 'select';

/** The style the next shape a board view adds gets. */
export type BoardStyle = Readonly<{
  color?: string;
  fill?: string;
  geo?: BoardGeo;
}>;

/**
 * One mounted view's state, which lives in the view and never in the
 * document, so two views of one board each keep their own.
 */
export type BoardViewState = Readonly<{
  camera: BoardCamera;
  nextStyle: BoardStyle;
  /**
   * The id of the frame selected alone, or null. A view that cannot write
   * shows none, since it runs no frame action.
   */
  selectedFrame: string | null;
  tool: BoardTool;
}>;

export type BoardViewActions = Readonly<{
  /** Move the camera so every shape is in view, at most at full size. */
  fit: () => void;
  /** Remove the frame `id` and keep its shapes where they are, as one undo step. */
  removeFrame: (id: string) => void;
  /** Merge `style` into the style the next added shape gets. */
  setNextStyle: (style: BoardStyle) => void;
  setTool: (tool: BoardTool) => void;
}>;

type BoardBox = BoardPlace & BoardSize;

export type BoardShapeLayout = Readonly<{
  box: BoardBox;
  id: string;
  key: NodeKey;
  kind: BoardMemberEntry['kind'];
  rank: number;
}>;

/** Where an arrow draws: its two ends in board coordinates and the path between them. */
export type BoardArrowPath = BoardArrowEnds & Readonly<{ path: string }>;

type ArrowEnds = Readonly<{ end: BoardArrowEnd; start: BoardArrowEnd }>;

type ArrowRecord = ArrowEnds &
  Readonly<{ bound: readonly string[]; drawn: BoardArrowPath }>;

type Corner = 'ne' | 'nw' | 'se' | 'sw';

type Gesture =
  | {
      kind: 'arrow';
      from: BoardPlace;
      line: SVGLineElement;
      pointer: BoardPlace;
      press: BoardPlace;
      start: BoardArrowEndInput;
    }
  | {
      kind: 'frame';
      from: BoardPlace;
      outline: HTMLElement;
      pointer: BoardPlace;
      press: BoardPlace;
    }
  | {
      kind: 'move';
      carried: ReadonlySet<string>;
      copy: boolean;
      delta: BoardPlace;
      elements: readonly HTMLElement[];
      grab: BoardPlace;
      ids: readonly string[];
      pointer: BoardPlace;
    }
  | {
      kind: 'pan';
      camera: BoardCamera;
      pointer: BoardPlace;
      start: BoardPlace;
    }
  | {
      kind: 'resize';
      corner: Corner;
      element: HTMLElement;
      grab: BoardPlace;
      id: string;
      pointer: BoardPlace;
      rect: BoardBox;
      restore: string;
      start: BoardBox;
    };

type CullBox = BBox & { key: NodeKey };

type BoardWrite =
  | Readonly<{ kind: 'move'; delta: BoardPlace; ids: readonly string[] }>
  | Readonly<{ kind: 'remove'; ids: readonly string[] }>
  | Readonly<{ kind: 'removeFrame'; id: string }>
  | Readonly<{ kind: 'resize'; id: string; rect: BoardBox }>
  | Readonly<{
      kind: 'restack';
      direction: BoardRestackDirection;
      ids: readonly string[];
    }>;

const TOOL_KEYS: Readonly<Record<string, BoardTool>> = {
  a: 'arrow',
  f: 'frame',
  n: 'note',
  r: 'geo',
  v: 'select',
};

const ARROWS: Readonly<Record<string, BoardPlace>> = {
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
};

const NUDGE = 1;
const SHIFT_NUDGE = 10;

const CORNERS: Readonly<Record<string, Corner>> = {
  ne: 'ne',
  nw: 'nw',
  se: 'se',
  sw: 'sw',
};

const RESTACK_KEYS: Readonly<Record<string, BoardRestackDirection>> = {
  '[': 'backward',
  ']': 'forward',
};

const MIN_SHAPE_SIZE = 8;
const CLICK_SLOP_PX = 8;
const FRAME_EDGE_PX = 8;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;
const WHEEL_STEP_ZOOM = 100;
const FIT_PADDING = 32;

const clampZoom = (zoom: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

const sameBox = (a: BoardBox, b: BoardBox) =>
  a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

const sameKeys = (a: ReadonlySet<NodeKey>, b: ReadonlySet<NodeKey>) =>
  a.size === b.size && [...a].every((key) => b.has(key));

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

const spanOf = ({ end, start }: BoardArrowEnds): BoardBox => ({
  height: Math.abs(end.y - start.y),
  width: Math.abs(end.x - start.x),
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
});

const dragged = (press: BoardPlace, pointer: BoardPlace) =>
  Math.hypot(pointer.x - press.x, pointer.y - press.y) >= CLICK_SLOP_PX;

const frameToolBox = (
  from: BoardPlace,
  to: BoardPlace,
  drag: boolean
): BoardBox => {
  if (!drag) {
    const { height, width } = BOARD_FRAME_SIZE;

    return { height, width, x: to.x - width / 2, y: to.y - height / 2 };
  }

  const span = spanOf({ end: to, start: from });

  return {
    ...span,
    height: Math.max(MIN_SHAPE_SIZE, span.height),
    width: Math.max(MIN_SHAPE_SIZE, span.width),
  };
};

const onFrameEdge = (box: BoardBox, at: BoardPlace, zoom: number) =>
  Math.min(
    at.x - box.x,
    at.y - box.y,
    box.x + box.width - at.x,
    box.y + box.height - at.y
  ) <
  FRAME_EDGE_PX / zoom;

const fractionOf = (offset: number, length: number) =>
  length > 0 ? Math.min(1, Math.max(0, offset / length)) : 0.5;

const SVG_NS = 'http://www.w3.org/2000/svg';

const resized = (start: BoardBox, corner: Corner, dx: number, dy: number) => {
  const west = corner === 'nw' || corner === 'sw';
  const north = corner === 'ne' || corner === 'nw';
  const width = Math.max(MIN_SHAPE_SIZE, start.width + (west ? -dx : dx));
  const height = Math.max(MIN_SHAPE_SIZE, start.height + (north ? -dy : dy));

  return {
    height,
    width,
    x: west ? start.x + start.width - width : start.x,
    y: north ? start.y + start.height - height : start.y,
  };
};

const elementOf = (host: HTMLElement, id: string) =>
  host.querySelector<HTMLElement>(`[data-board-shape="${CSS.escape(id)}"]`);

const placeElement = (element: HTMLElement, box: BoardBox) => {
  element.style.left = `${box.x}px`;
  element.style.top = `${box.y}px`;
  element.style.width = `${box.width}px`;
  element.style.height = `${box.height}px`;
};

const subscribeTo = (listeners: Set<() => void>) => (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const createBoardView = (
  editor: Editor,
  mounted: Editor,
  element: Element
) => {
  const keyOf = (node: Descendant) => editor.read((state) => state.key(node));
  const board = keyOf(element);
  const root =
    editor.read.schema.getElementContentRoots(element)[BOARD_SHAPES_SLOT] ?? '';
  const rootView = createEditorView(editor, { root });
  const boards = editor.plugin(BaseBoardPlugin);

  let state: BoardViewState = {
    camera: { x: 0, y: 0, zoom: 1 },
    nextStyle: {},
    selectedFrame: null,
    tool: 'select',
  };
  const stateListeners = new Set<() => void>();
  const shapeListeners = new Set<() => void>();
  const viewportListeners = new Set<() => void>();

  const setState = (next: Partial<BoardViewState>) => {
    state = { ...state, ...next };
    for (const listener of stateListeners) listener();
  };

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
  const arrowListeners = new Map<NodeKey, Set<() => void>>();
  let version = 0;
  let shownVersion = 0;
  let mountedKeys: ReadonlySet<NodeKey> = new Set();
  let viewport = { mountedKeys, reveal };
  let size: BoardSize = { height: 0, width: 0 };

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
      previous.kind === entry.kind &&
      (entry.kind === 'frame' ||
        (previous.kind === 'shape' && previous.frame === entry.frame)) &&
      !!shown &&
      sameTarget(memberTarget(entry), shown)
    );
  };

  const index = () => {
    const next = rootView.read.children();

    if (next === children) return;
    children = next;

    const read = boards.read.shapes(board);
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
          sameBox(previous.box, box)
          ? previous
          : {
              box,
              id: entry.id,
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

  const previewArrows = (
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
      isBoundArrowEnd(end) && targets.has(end.shape)
        ? end
        : { x: end.x + delta.x, y: end.y + delta.y };
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
  };

  const clearPreview = () => {
    if (previewed.size === 0) return;

    const keys = [...previewed.keys()];

    previewed = new Map();
    notifyArrows(keys);
  };

  let frame = 0;
  let moved = false;
  let identityAnimation: Animation | null = null;
  let drawnZoom = state.camera.zoom;
  let layer: HTMLElement | null = null;
  let zoomLayer: HTMLElement | null = null;
  let focusTarget: HTMLElement | null = null;

  const refresh = () => {
    const { x, y, zoom } = state.camera;
    const found = new Set(
      tree
        .search({
          maxX: x + size.width / zoom,
          maxY: y + size.height / zoom,
          minX: x,
          minY: y,
        })
        .map((box) => box.key)
    );
    const next = frame === 0 ? found : new Set([...mountedKeys, ...found]);

    if (sameKeys(next, mountedKeys)) return;
    mountedKeys = next;
    viewport = { mountedKeys, reveal };
    for (const listener of viewportListeners) listener();
  };

  const showSelectedFrame = () => {
    const shapes = selectedShapes();
    const selectedFrame =
      shapes.length === 1 && shapes[0].kind === 'frame' && writable()
        ? shapes[0].id
        : null;

    if (selectedFrame !== state.selectedFrame) setState({ selectedFrame });
  };

  const follow = () => {
    index();
    if (version === shownVersion) return;
    shownVersion = version;
    for (const listener of shapeListeners) listener();
    refresh();
    followPointer();
  };

  // The promoted layer translates in screen pixels, and a child of it scales
  // to the drawn zoom. WebKit redraws every mounted shape when the child's
  // scale changes, so a zoom scales the promoted layer by its change from the
  // drawn zoom while the view moves, and moves into the child once it stops.
  const paintCamera = () => {
    const { x, y, zoom } = state.camera;
    const pan = `translate(${-x * zoom}px, ${-y * zoom}px)`;

    if (layer) {
      layer.style.transform =
        zoom === drawnZoom ? pan : `${pan} scale(${zoom / drawnZoom})`;
    }
    if (zoomLayer) zoomLayer.style.transform = `scale(${drawnZoom})`;
  };

  const tick = () => {
    const moving = moved;

    moved = false;
    frame = moving ? requestAnimationFrame(tick) : 0;
    if (!moving) {
      identityAnimation?.cancel();
      identityAnimation = null;
      drawnZoom = state.camera.zoom;
      paintCamera();
    }
    refresh();
  };

  // Blink relayerizes every paint chunk on each change to a layer's transform
  // unless the layer runs a transform animation, about 6.5 ms a frame with
  // 4,000 shapes in view. An additive identity animation keeps the camera's
  // own transform and lets Blink update the compositor's copy directly.
  const setCamera = (camera: BoardCamera) => {
    setState({ camera });
    paintCamera();
    moved = true;
    frame ||= requestAnimationFrame(tick);
    identityAnimation ??=
      layer?.animate(
        [
          { transform: 'translate(0px, 0px)' },
          { transform: 'translate(0px, 0px)' },
        ],
        {
          composite: 'add',
          duration: 1000,
          iterations: Number.POSITIVE_INFINITY,
        }
      ) ?? null;
    followPointer();
  };

  function reveal(path: readonly number[]) {
    const layout = layouts.get(entries[path[0] ?? -1]?.key ?? '');

    if (!layout) return false;

    const { box } = layout;
    const { zoom } = state.camera;

    setCamera({
      x: box.x + box.width / 2 - size.width / 2 / zoom,
      y: box.y + box.height / 2 - size.height / 2 / zoom,
      zoom,
    });
    refresh();

    return true;
  }

  let corner: BoardPlace = { x: 0, y: 0 };
  let gesture: Gesture | null = null;
  let hover: BoardPlace | null = null;

  const boardPointAt = (client: BoardPlace) => ({
    x: state.camera.x + (client.x - corner.x) / state.camera.zoom,
    y: state.camera.y + (client.y - corner.y) / state.camera.zoom,
  });

  function followPointer() {
    if (!gesture || gesture.kind === 'pan') return;

    const at = boardPointAt(gesture.pointer);

    if (gesture.kind === 'arrow') {
      gesture.line.setAttribute('x2', String(at.x));
      gesture.line.setAttribute('y2', String(at.y));

      return;
    }

    if (gesture.kind === 'frame') {
      placeElement(gesture.outline, spanOf({ end: at, start: gesture.from }));

      return;
    }

    const dx = at.x - gesture.grab.x;
    const dy = at.y - gesture.grab.y;

    if (gesture.kind === 'move') {
      const { carried, copy } = gesture;
      const delta = { x: dx, y: dy };

      gesture.delta = delta;
      for (const shape of gesture.elements) {
        shape.style.translate = `${dx}px ${dy}px`;
      }
      if (!copy) {
        previewArrows(
          [...carried],
          (id) => {
            const box = carried.has(id) ? byId.get(id)?.box : undefined;

            return box && { ...box, x: box.x + dx, y: box.y + dy };
          },
          delta
        );
      }
    } else {
      const { id } = gesture;
      const rect = resized(gesture.start, gesture.corner, dx, dy);

      gesture.rect = rect;
      placeElement(gesture.element, rect);
      previewArrows([id], (target) => (target === id ? rect : undefined), {
        x: 0,
        y: 0,
      });
    }
  }

  const selectedShapes = (): BoardShapeLayout[] => {
    if (!editor.read.selection.nodeMode()) return [];

    const keys = new Set(
      editor.read.selection.nodes().map(([node]) => keyOf(node))
    );

    return entries.flatMap((entry) => {
      const layout = keys.has(entry.key) && layouts.get(entry.key);

      return layout ? [layout] : [];
    });
  };

  const boardSelected = () => {
    const nodes = editor.read.selection.nodes();

    return nodes.length === 1 && keyOf(nodes[0][0]) === board;
  };

  const writable = () => {
    const authored = readAuthoredView(mounted);

    return (
      !mounted.read.view.isReadOnly() && !(authored && 'preview' in authored)
    );
  };

  const editedShape = () => {
    const range = editor.read.selection();

    if (
      editor.read.selection.nodeMode() !== null ||
      range?.anchor.root !== root
    ) {
      return null;
    }

    const key = rootView.key([range.anchor.path[0]]);

    return key ? (layouts.get(key) ?? null) : null;
  };

  let surface: HTMLElement | null = null;

  const focusRoot = () => {
    surface
      ?.querySelector<HTMLElement>(
        `[data-editor-content-root-slot="${BOARD_SHAPES_SLOT}"] [contenteditable="true"]`
      )
      ?.focus({ preventScroll: true });
  };

  const focusDocument = () => {
    surface?.parentElement
      ?.closest<HTMLElement>('[contenteditable="true"]')
      ?.focus({ preventScroll: true });
  };

  const select = (keys: readonly NodeKey[]) => {
    const order = new Map(entries.map((entry, at) => [entry.key, at]));
    const sorted = keys.toSorted(
      (a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0)
    );
    focusRoot();
    editor.update((tx) =>
      tx.selection.setNodes(sorted, {
        mode: shapeSelectionMode(
          tx.schema,
          sorted.flatMap((key) => tx.nodes.get(key)?.[0] ?? [])
        ),
      })
    );
  };

  const selectBoard = () => {
    focusDocument();
    editor.update((tx) => tx.selection.setNodes([board], { mode: 'block' }));
  };

  const keepKeysOnBoard = () => {
    if (!focusTarget) return;
    focusTarget.focus({ preventScroll: true });
    // Firefox keeps the selection when a non-editable element takes focus.
    editor.api.dom.deselect();
  };

  const commit = (write: BoardWrite) => {
    if (!writable()) return;
    mounted.update((tx) => {
      const commands = tx.plugin(BaseBoardPlugin);

      tx.history.newBatch();
      if (write.kind === 'move') commands.move(write.ids, write.delta);
      else if (write.kind === 'remove') {
        commands.remove(write.ids);
        tx.selection.set(null);
      } else if (write.kind === 'removeFrame') {
        commands.removeFrame(write.id);
      } else if (write.kind === 'resize') {
        commands.resize(write.id, write.rect);
      } else commands.restack(write.ids, write.direction);
    });
    if (write.kind === 'remove') keepKeysOnBoard();
  };

  const inView = ({ box }: BoardShapeLayout) => {
    const { x, y, zoom } = state.camera;

    return (
      box.x >= x &&
      box.y >= y &&
      box.x + box.width <= x + size.width / zoom &&
      box.y + box.height <= y + size.height / zoom
    );
  };

  const tab = (shapes: readonly BoardShapeLayout[], backward: boolean) => {
    const at = entries.findIndex(
      (entry) => entry.key === (backward ? shapes[0] : shapes.at(-1))?.key
    );
    const next = layouts.get(entries[at + (backward ? -1 : 1)]?.key ?? '');

    if (next) {
      if (!inView(next)) reveal([at + (backward ? -1 : 1)]);
      select([next.key]);

      return true;
    }

    const path = editor.read.nodes.path(board);
    const point =
      path &&
      (backward
        ? editor.read.points.before(path)
        : editor.read.points.after(path));

    if (!point) return false;
    focusDocument();
    editor.update((tx) => tx.selection.set(point));

    return true;
  };

  const previewCopy = (shape: HTMLElement) => {
    const preview = shape.cloneNode(true) as HTMLElement;

    for (const handle of preview.querySelectorAll('[data-board-handle]')) {
      handle.remove();
    }
    for (const node of [preview, ...preview.querySelectorAll('*')]) {
      for (const { name } of [...node.attributes]) {
        if (
          name === 'contenteditable' ||
          name === 'data-board-shape' ||
          name.startsWith('data-editor')
        ) {
          node.removeAttribute(name);
        }
      }
    }
    preview.inert = true;
    preview.setAttribute('aria-hidden', 'true');
    preview.setAttribute('data-board-copy-preview', '');
    preview.setAttribute('data-editor-root-chrome-ignore', 'true');
    preview.style.pointerEvents = 'none';
    preview.style.zIndex = String(entries.length + 1);
    zoomLayer?.append(preview);

    return preview;
  };

  const cancel = () => {
    const done = gesture;

    gesture = null;
    if (done?.kind === 'move') {
      for (const shape of done.elements) {
        if (done.copy) shape.remove();
        else shape.style.translate = '';
      }
    } else if (done?.kind === 'resize') {
      done.element.style.cssText = done.restore;
    } else if (done?.kind === 'arrow') {
      done.line.ownerSVGElement?.remove();
    } else if (done?.kind === 'frame') {
      done.outline.remove();
    }
    clearPreview();
  };

  const previewArrowLine = (from: BoardPlace) => {
    const ownerDocument = zoomLayer?.ownerDocument ?? document;
    const svg = ownerDocument.createElementNS(SVG_NS, 'svg');
    const line = ownerDocument.createElementNS(SVG_NS, 'line');

    for (const [name, value] of [
      ['stroke', 'currentColor'],
      ['stroke-width', '2'],
      ['x1', from.x],
      ['x2', from.x],
      ['y1', from.y],
      ['y2', from.y],
    ] as const) {
      line.setAttribute(name, String(value));
    }
    svg.append(line);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('data-board-arrow-preview', '');
    svg.setAttribute('data-editor-root-chrome-ignore', 'true');
    svg.setAttribute('height', '1');
    svg.setAttribute('width', '1');
    Object.assign(svg.style, {
      left: '0',
      overflow: 'visible',
      pointerEvents: 'none',
      position: 'absolute',
      top: '0',
      zIndex: String(entries.length + 1),
    });
    zoomLayer?.append(svg);

    return line;
  };

  const shapeAt = (at: BoardPlace) => {
    let top: BoardShapeLayout | undefined;

    for (const { key } of tree.search({
      maxX: at.x,
      maxY: at.y,
      minX: at.x,
      minY: at.y,
    })) {
      const layout = layouts.get(key);

      if (
        layout &&
        layout.kind !== 'arrow' &&
        (layout.kind !== 'frame' ||
          onFrameEdge(layout.box, at, state.camera.zoom)) &&
        (!top || layout.rank > top.rank)
      ) {
        top = layout;
      }
    }

    return top;
  };

  const previewFrameOutline = (from: BoardPlace) => {
    const outline = (zoomLayer?.ownerDocument ?? document).createElement('div');

    outline.setAttribute('aria-hidden', 'true');
    outline.setAttribute('data-board-frame-preview', '');
    outline.setAttribute('data-editor-root-chrome-ignore', 'true');
    Object.assign(outline.style, {
      border: '1px dashed currentColor',
      boxSizing: 'border-box',
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: String(entries.length + 1),
    });
    placeElement(outline, { ...from, height: 0, width: 0 });
    zoomLayer?.append(outline);

    return outline;
  };

  const arrowEndAt = (at: BoardPlace): BoardArrowEndInput => {
    const top = shapeAt(at);

    if (!top) return at;

    const { box } = top;

    return {
      anchor: [
        fractionOf(at.x - box.x, box.width),
        fractionOf(at.y - box.y, box.height),
      ],
      shape: top.id,
    };
  };

  const edit = (key: NodeKey) => {
    focusRoot();
    editor.update((tx) => {
      const end = tx.points.end(key);

      if (end) tx.selection.set(end);
    });
  };

  const insertWith = (write: (tx: PluginTransaction) => string | undefined) => {
    if (!writable()) return;

    const id = mounted.update((tx) => {
      tx.history.newBatch();

      return write(tx);
    });
    const inserted = id && boards.read.shape(id);

    setState({ tool: 'select' });
    if (inserted) select([inserted.key]);
  };

  const insert = (at: BoardPlace) => {
    const { color, fill, geo } = state.nextStyle;
    const { tool } = state;

    insertWith((tx) =>
      tool === 'note'
        ? tx
            .plugin(BaseBoardNotePlugin)
            .insert(
              { ...at, ...(color === undefined ? {} : { color }) },
              { board }
            )
        : tx.plugin(BaseBoardGeoPlugin).insert(
            {
              ...at,
              ...(fill === undefined ? {} : { fill }),
              ...(geo === undefined ? {} : { geo }),
            },
            { board }
          )
    );
  };

  const land = (slice: ContentSlice, place: BoardPlace) => {
    if (!writable()) return false;

    const ids = mounted.update((tx) => {
      tx.history.newBatch();

      return tx.plugin(BaseBoardPlugin).insertCopy(slice, { board, place });
    });

    if (!ids) return false;
    select(
      ids.flatMap((id) => {
        const shape = boards.read.shape(id);

        return shape ? [shape.key] : [];
      })
    );

    return true;
  };

  const release = () => {
    const done = gesture;

    if (!done || done.kind === 'pan') {
      gesture = null;

      return;
    }
    cancel();
    if (done.kind === 'arrow') {
      if (dragged(done.press, done.pointer)) {
        const end = arrowEndAt(boardPointAt(done.pointer));

        insertWith((tx) =>
          tx
            .plugin(BaseBoardArrowPlugin)
            .insert({ end, start: done.start }, { board })
        );
      }
    } else if (done.kind === 'frame') {
      const box = frameToolBox(
        done.from,
        boardPointAt(done.pointer),
        dragged(done.press, done.pointer)
      );

      insertWith((tx) =>
        tx.plugin(BaseBoardFramePlugin).insert(box, { board })
      );
    } else if (done.kind === 'move') {
      const { carried, copy, delta, ids } = done;

      if (delta.x === 0 && delta.y === 0) return;
      if (!copy) {
        commit({ delta, ids, kind: 'move' });

        return;
      }

      const boxes = [...carried].flatMap((id) => {
        const layout = byId.get(id);

        return layout ? [layout.box] : [];
      });
      const slice = boards.read.slice(ids);

      if (slice && boxes.length > 0) {
        land(slice, {
          x: Math.min(...boxes.map(({ x }) => x)) + delta.x,
          y: Math.min(...boxes.map(({ y }) => y)) + delta.y,
        });
      }
    } else if (!sameBox(done.rect, done.start)) {
      commit({ id: done.id, kind: 'resize', rect: done.rect });
    }
  };

  const shapeKey = (
    event: KeyboardEvent,
    shapes: readonly BoardShapeLayout[]
  ) => {
    const ids = shapes.map((shape) => shape.id);
    const mod = event.ctrlKey || event.metaKey;
    const arrow = ARROWS[event.key];

    if (event.altKey) return false;
    if (mod && !event.shiftKey && event.key.toLowerCase() === 'a') {
      select(entries.map((entry) => entry.key));
    } else if (mod && event.shiftKey && arrow?.y) {
      commit({
        direction: arrow.y < 0 ? 'front' : 'back',
        ids,
        kind: 'restack',
      });
    } else if (mod) {
      return false;
    } else if (event.key === 'Tab') {
      return tab(shapes, event.shiftKey);
    } else if (event.key === 'Escape') {
      selectBoard();
    } else if (arrow) {
      const step = event.shiftKey ? SHIFT_NUDGE : NUDGE;

      commit({
        delta: { x: arrow.x * step, y: arrow.y * step },
        ids,
        kind: 'move',
      });
    } else if (TOOL_KEYS[event.key]) {
      setState({ tool: TOOL_KEYS[event.key] });
    } else if (RESTACK_KEYS[event.key]) {
      commit({ direction: RESTACK_KEYS[event.key], ids, kind: 'restack' });
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      commit({ ids, kind: 'remove' });
    } else if (event.key === 'Enter') {
      if (shapes.length === 1 && shapes[0].kind !== 'frame') {
        edit(shapes[0].key);
      }
    } else if (event.key.length !== 1) {
      return false;
    }

    return true;
  };

  const focusKey = (event: KeyboardEvent) => {
    if (Hotkeys.isUndo(event)) {
      if (writable()) mounted.api.history.undo();
    } else if (Hotkeys.isRedo(event)) {
      if (writable()) mounted.api.history.redo();
    } else if (event.altKey || event.ctrlKey || event.metaKey) {
      return false;
    } else if (event.key === 'Escape') {
      selectBoard();
    } else if (TOOL_KEYS[event.key]) {
      setState({ tool: TOOL_KEYS[event.key] });
    } else if (
      // WebKit navigates back on Backspace outside an editable element.
      event.key !== 'Backspace' &&
      event.key !== 'Delete' &&
      event.key.length !== 1
    ) {
      return false;
    }

    return true;
  };

  const boardKey = (event: KeyboardEvent) => {
    const [first] = entries;

    if (event.key !== 'Enter' || !first || !boardSelected()) return false;
    select([first.key]);

    return true;
  };

  const attach = (node: HTMLElement) => {
    const host = node.parentElement;

    if (!host) return undefined;
    layer = node;
    zoomLayer =
      node.firstElementChild instanceof HTMLElement
        ? node.firstElementChild
        : null;
    focusTarget = host.querySelector<HTMLElement>(
      ':scope > [data-board-focus]'
    );
    surface = host;
    paintCamera();

    const measure = () => {
      const rect = host.getBoundingClientRect();

      corner = { x: rect.left + host.clientLeft, y: rect.top + host.clientTop };
      if (rect.width === size.width && rect.height === size.height) return;
      size = { height: rect.height, width: rect.width };
      refresh();
    };
    const resizeObserver = new ResizeObserver(measure);

    measure();
    resizeObserver.observe(host);

    let swallowClick = false;
    let pressed: BoardShapeLayout | undefined;

    const pressTargetAt = (
      target: globalThis.Element,
      at: BoardPlace,
      onHandle: boolean
    ) => {
      const hit = target.closest<HTMLElement>('[data-board-shape]');
      const shape = hit ? byId.get(hit.dataset.boardShape ?? '') : undefined;

      if (
        shape?.kind !== 'frame' ||
        onHandle ||
        target.closest('[data-board-frame-name]')
      ) {
        return { element: hit, shape };
      }

      const under = shapeAt(at);

      return {
        element: under === shape ? hit : under && elementOf(host, under.id),
        shape: under,
      };
    };

    const onPointerDown = (event: PointerEvent) => {
      pressed = undefined;
      swallowClick = false;
      if (event.button !== 0 || gesture || !(event.target instanceof Element)) {
        return;
      }
      if (event.target.closest('[data-board-toolbar]')) return;

      measure();

      const pointer = { x: event.clientX, y: event.clientY };
      const at = boardPointAt(pointer);
      const handle =
        CORNERS[
          event.target.closest<HTMLElement>('[data-board-handle]')?.dataset
            .boardHandle ?? ''
        ];
      const { element: shapeElement, shape } = pressTargetAt(
        event.target,
        at,
        !!handle
      );

      pressed = shape;

      if (state.tool === 'arrow') {
        if (!writable()) return;
        gesture = {
          from: at,
          kind: 'arrow',
          line: previewArrowLine(at),
          pointer,
          press: pointer,
          start: arrowEndAt(at),
        };
      } else if (shapeElement && shape && handle) {
        if (!writable()) return;
        gesture = {
          corner: handle,
          element: shapeElement,
          grab: at,
          id: shape.id,
          kind: 'resize',
          pointer,
          rect: shape.box,
          restore: shapeElement.style.cssText,
          start: shape.box,
        };
      } else if (shapeElement && shape) {
        if (editedShape()?.key === shape.key) return;

        const selected = selectedShapes();
        const held = selected.some(({ key }) => key === shape.key);
        let moving = held ? selected : [shape];

        if (event.shiftKey) {
          moving = held ? [] : [...selected, shape];
          select(
            (held
              ? selected.filter(({ key }) => key !== shape.key)
              : moving
            ).map(({ key }) => key)
          );
        } else if (!held) {
          select([shape.key]);
        }

        const ids = new Set(moving.map(({ id }) => id));
        const carried = new Set(ids);

        for (const id of ids) {
          for (const member of membersOf.get(id) ?? []) carried.add(member);
        }

        if (ids.size > 0 && writable()) {
          const elements = [
            ...host.querySelectorAll<HTMLElement>('[data-board-shape]'),
          ].filter((candidate) =>
            carried.has(candidate.dataset.boardShape ?? '')
          );
          const boxesOnly = (candidate: HTMLElement) =>
            byId.get(candidate.dataset.boardShape ?? '')?.kind !== 'arrow';

          gesture = {
            carried,
            copy: event.altKey,
            delta: { x: 0, y: 0 },
            elements: event.altKey
              ? elements.map(previewCopy)
              : elements.filter(boxesOnly),
            grab: at,
            ids: [...ids],
            kind: 'move',
            pointer,
          };
        }
      } else if (state.tool === 'select') {
        gesture = {
          camera: state.camera,
          kind: 'pan',
          pointer,
          start: pointer,
        };
      } else if (state.tool === 'frame') {
        if (!writable()) return;
        gesture = {
          from: at,
          kind: 'frame',
          outline: previewFrameOutline(at),
          pointer,
          press: pointer,
        };
      } else {
        insert(at);
      }

      event.preventDefault();
      event.stopPropagation();
      host.setPointerCapture(event.pointerId);
      swallowClick = true;
    };
    const onPointerMove = (event: PointerEvent) => {
      hover = { x: event.clientX, y: event.clientY };
      if (!gesture) return;
      gesture.pointer = { x: event.clientX, y: event.clientY };
      if (gesture.kind === 'pan') {
        const { camera, pointer, start } = gesture;

        setCamera({
          ...camera,
          x: camera.x - (pointer.x - start.x) / camera.zoom,
          y: camera.y - (pointer.y - start.y) / camera.zoom,
        });
      } else {
        followPointer();
      }
    };
    const onClick = (event: MouseEvent) => {
      const swallow = swallowClick;

      swallowClick = false;
      if (
        !swallow ||
        !(event.target instanceof Node) ||
        !host.contains(event.target)
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };
    // Pointer capture sends the double click to the board, not the shape the
    // pointer is over, so it edits the shape the last press went down on.
    const onDoubleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Node) || !host.contains(event.target)) {
        return;
      }

      const shape = pressed;

      if (
        !shape ||
        shape.kind === 'frame' ||
        editedShape()?.key === shape.key
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      edit(shape.key);
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      measure();

      const { camera } = state;

      if (event.ctrlKey || event.metaKey) {
        const zoom = clampZoom(
          camera.zoom * 2 ** (-event.deltaY / WHEEL_STEP_ZOOM)
        );
        const at = boardPointAt({ x: event.clientX, y: event.clientY });

        setCamera({
          x: at.x - (event.clientX - corner.x) / zoom,
          y: at.y - (event.clientY - corner.y) / zoom,
          zoom,
        });
      } else {
        setCamera({
          ...camera,
          x: camera.x + event.deltaX / camera.zoom,
          y: camera.y + event.deltaY / camera.zoom,
        });
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.target instanceof Node)) return;
      if (host.contains(event.target)) {
        const selected = selectedShapes();
        const edited =
          event.key === 'Escape' && selected.length === 0
            ? editedShape()
            : null;

        if (edited) {
          select([edited.key]);
        } else if (selected.length > 0) {
          if (!shapeKey(event, selected)) return;
        } else if (event.target !== focusTarget || !focusKey(event)) {
          return;
        }
      } else if (!event.target.contains(host) || !boardKey(event)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };
    // A shape selection has no DOM range, so Firefox fires its clipboard
    // events at the body; the focused element names the view they are for.
    const clipboardTarget = (event: ClipboardEvent) =>
      editor.api.dom.hasEditableTarget(event.target)
        ? event.target
        : host.ownerDocument.activeElement;
    const onCut = (event: ClipboardEvent) => {
      const shapes = selectedShapes();
      const target = clipboardTarget(event);

      if (
        !editor.api.dom.hasEditableTarget(target) ||
        !host.contains(target) ||
        !event.clipboardData ||
        shapes.length === 0 ||
        !writable()
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      editor.api.dom.clipboard.writeSelection(event.clipboardData);
      commit({ ids: shapes.map(({ id }) => id), kind: 'remove' });
    };
    const onPaste = (event: ClipboardEvent) => {
      const target = clipboardTarget(event);

      if (
        !hover ||
        !event.clipboardData ||
        !editor.api.dom.hasEditableTarget(target) ||
        !(host.contains(target) || target.contains(host))
      ) {
        return;
      }

      const read = editor.api.dom.clipboard.readSlice(event.clipboardData);

      measure();
      if (read.kind !== 'slice' || !land(read.slice, boardPointAt(hover))) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };
    const onPointerLeave = () => {
      hover = null;
    };
    const view = host.ownerDocument.defaultView;

    host.addEventListener('pointerdown', onPointerDown, true);
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerleave', onPointerLeave);
    host.addEventListener('pointerup', release);
    host.addEventListener('pointercancel', cancel);
    host.addEventListener('wheel', onWheel, { passive: false });
    view?.addEventListener('click', onClick, true);
    view?.addEventListener('cut', onCut, true);
    view?.addEventListener('dblclick', onDoubleClick, true);
    view?.addEventListener('keydown', onKeyDown, true);
    view?.addEventListener('paste', onPaste, true);

    return () => {
      cancel();
      cancelAnimationFrame(frame);
      frame = 0;
      identityAnimation?.cancel();
      identityAnimation = null;
      layer = null;
      zoomLayer = null;
      focusTarget = null;
      surface = null;
      hover = null;
      resizeObserver.disconnect();
      host.removeEventListener('pointerdown', onPointerDown, true);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      host.removeEventListener('pointerup', release);
      host.removeEventListener('pointercancel', cancel);
      host.removeEventListener('wheel', onWheel);
      view?.removeEventListener('click', onClick, true);
      view?.removeEventListener('cut', onCut, true);
      view?.removeEventListener('dblclick', onDoubleClick, true);
      view?.removeEventListener('keydown', onKeyDown, true);
      view?.removeEventListener('paste', onPaste, true);
    };
  };

  index();
  shownVersion = version;
  refresh();

  const actions: BoardViewActions = {
    fit: () => {
      const boxes = [...layouts.values()].map(({ box }) => box);

      if (boxes.length === 0 || size.width === 0) return;

      const minX = Math.min(...boxes.map(({ x }) => x));
      const minY = Math.min(...boxes.map(({ y }) => y));
      const maxX = Math.max(...boxes.map(({ width, x }) => x + width));
      const maxY = Math.max(...boxes.map(({ height, y }) => y + height));
      const zoom = clampZoom(
        Math.min(
          1,
          size.width / (maxX - minX + 2 * FIT_PADDING),
          size.height / (maxY - minY + 2 * FIT_PADDING)
        )
      );

      setCamera({
        x: (minX + maxX) / 2 - size.width / 2 / zoom,
        y: (minY + maxY) / 2 - size.height / 2 / zoom,
        zoom,
      });
    },
    removeFrame: (id) => commit({ id, kind: 'removeFrame' }),
    setNextStyle: (style) =>
      setState({ nextStyle: { ...state.nextStyle, ...style } }),
    setTool: (tool) => setState({ tool }),
  };

  return {
    actions,
    arrowPathOf: (key: NodeKey) => {
      if (!arrows.has(key)) index();

      return previewed.get(key) ?? arrows.get(key)?.drawn;
    },
    attach,
    connect: () => {
      const unsubscribe = editor.subscribeCommit(({ changed }) => {
        if (
          changed.hasAny('properties') ||
          changed.hasAny('structure') ||
          changed.hasAny('replace')
        ) {
          follow();
        }
        if (changed.hasAny('selection') || state.selectedFrame !== null) {
          showSelectedFrame();
        }
      });

      const unsubscribeViewState = subscribeEditorViewState(mounted, () => {
        if (gesture && gesture.kind !== 'pan' && !writable()) cancel();
        showSelectedFrame();
      });

      follow();
      showSelectedFrame();

      return () => {
        unsubscribe();
        unsubscribeViewState();
      };
    },
    keyOf,
    layoutOf: (key: NodeKey) => {
      if (!layouts.has(key)) index();

      return layouts.get(key);
    },
    root,
    state: () => state,
    subscribe: subscribeTo(stateListeners),
    subscribeArrow: (key: NodeKey, listener: () => void) => {
      const listeners = arrowListeners.get(key) ?? new Set();

      listeners.add(listener);
      arrowListeners.set(key, listeners);
      shapeListeners.add(listener);

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) arrowListeners.delete(key);
        shapeListeners.delete(listener);
      };
    },
    subscribeShapes: subscribeTo(shapeListeners),
    subscribeViewport: subscribeTo(viewportListeners),
    viewport: () => viewport,
  };
};

export type BoardView = ReturnType<typeof createBoardView>;

export const BoardViewContext = React.createContext<BoardView | null>(null);

export const useBoardViewContext = () => {
  const view = React.useContext(BoardViewContext);

  if (!view) {
    throw new Error(
      'Board hooks and BoardShape must render inside a BoardSurface.'
    );
  }

  return view;
};
