import RBush, { type BBox } from 'rbush';
import * as React from 'react';

import {
  createEditorView,
  type Element,
  type Descendant,
  type NodeKey,
} from '../../../core';
import {
  BaseBoardGeoPlugin,
  BaseBoardNotePlugin,
  BaseBoardPlugin,
  type BoardGeo,
  type BoardPlace,
  type BoardRestackDirection,
  type BoardShapeEntry,
  type BoardSize,
} from '../../../features/board/lib';
import { BOARD_SHAPES_SLOT } from '../../../features/board/lib/boardShape.internal';
import type { Editor } from '../../core';

/** Where a board view looks: the board point at its top left corner, and its zoom. */
export type BoardCamera = Readonly<{ x: number; y: number; zoom: number }>;

/** What a click on an empty part of the board does. */
export type BoardTool = 'geo' | 'note' | 'select';

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
  tool: BoardTool;
}>;

export type BoardViewActions = Readonly<{
  /** Move the camera so every shape is in view, at most at full size. */
  fit: () => void;
  /** Merge `style` into the style the next added shape gets. */
  setNextStyle: (style: BoardStyle) => void;
  setTool: (tool: BoardTool) => void;
}>;

type BoardBox = BoardPlace & BoardSize;

export type BoardShapeLayout = Readonly<{
  box: BoardBox;
  id: string;
  key: NodeKey;
  rank: number;
}>;

type Corner = 'ne' | 'nw' | 'se' | 'sw';

type Gesture =
  | {
      kind: 'move';
      delta: BoardPlace;
      element: HTMLElement;
      grab: BoardPlace;
      id: string;
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

const TOOL_KEYS: Readonly<Record<string, BoardTool>> = {
  n: 'note',
  r: 'geo',
  v: 'select',
};

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
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;
const WHEEL_STEP_ZOOM = 100;
const FIT_PADDING = 32;

const clampZoom = (zoom: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

const byStack = (a: BoardShapeEntry, b: BoardShapeEntry) =>
  a.zIndex === b.zIndex ? (a.id < b.id ? -1 : 1) : a.zIndex < b.zIndex ? -1 : 1;

const sameBox = (a: BoardBox, b: BoardBox) =>
  a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

const sameKeys = (a: ReadonlySet<NodeKey>, b: ReadonlySet<NodeKey>) =>
  a.size === b.size && [...a].every((key) => b.has(key));

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

const placeElement = (element: HTMLElement, box: BoardBox) => {
  element.style.left = `${box.x}px`;
  element.style.top = `${box.y}px`;
  element.style.width = `${box.width}px`;
  element.style.height = `${box.height}px`;
};

export const createBoardView = (
  editor: Editor,
  element: Element,
  requestRender: () => void
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
    tool: 'select',
  };
  const stateListeners = new Set<() => void>();
  const shapeListeners = new Set<() => void>();

  const setState = (next: Partial<BoardViewState>) => {
    state = { ...state, ...next };
    for (const listener of stateListeners) listener();
  };

  const tree = new RBush<CullBox>();
  let children: readonly unknown[] | null = null;
  let entries: readonly BoardShapeEntry[] = [];
  let layouts = new Map<NodeKey, BoardShapeLayout>();
  let byId = new Map<string, BoardShapeLayout>();
  let version = 0;
  let shownVersion = 0;
  let mountedKeys: ReadonlySet<NodeKey> = new Set();
  let size: BoardSize = { height: 0, width: 0 };

  const index = () => {
    const next = rootView.read.children();

    if (next === children) return;
    children = next;

    const read = boards.read.shapes(board);
    const same =
      read.length === entries.length &&
      read.every(
        (entry, at) =>
          entry.key === entries[at].key &&
          entry.zIndex === entries[at].zIndex &&
          sameBox(
            { ...entry.place, ...entry.size },
            { ...entries[at].place, ...entries[at].size }
          )
      );

    entries = read;
    if (same) return;
    version += 1;

    const ranks = new Map(
      [...read].sort(byStack).map((entry, at) => [entry.key, at + 1])
    );
    const nextLayouts = new Map<NodeKey, BoardShapeLayout>();

    for (const entry of read) {
      const box = { ...entry.place, ...entry.size };
      const rank = ranks.get(entry.key) ?? 0;
      const previous = layouts.get(entry.key);

      nextLayouts.set(
        entry.key,
        previous && previous.rank === rank && sameBox(previous.box, box)
          ? previous
          : { box, id: entry.id, key: entry.key, rank }
      );
    }
    layouts = nextLayouts;
    byId = new Map(
      [...nextLayouts.values()].map((layout) => [layout.id, layout])
    );
    tree.clear().load(
      read.map((entry) => ({
        key: entry.key,
        maxX: entry.place.x + entry.size.width,
        maxY: entry.place.y + entry.size.height,
        minX: entry.place.x,
        minY: entry.place.y,
      }))
    );
  };

  let frame = 0;
  let moved = false;
  let identityAnimation: Animation | null = null;
  let drawnZoom = state.camera.zoom;
  let layer: HTMLElement | null = null;
  let zoomLayer: HTMLElement | null = null;

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

    if (sameKeys(next, mountedKeys)) return false;
    mountedKeys = next;

    return true;
  };

  const follow = () => {
    index();
    if (version === shownVersion) return;
    shownVersion = version;
    for (const listener of shapeListeners) listener();
    if (refresh()) requestRender();
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
    if (refresh()) requestRender();
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

  let corner: BoardPlace = { x: 0, y: 0 };
  let gesture: Gesture | null = null;

  const boardPointAt = (client: BoardPlace) => ({
    x: state.camera.x + (client.x - corner.x) / state.camera.zoom,
    y: state.camera.y + (client.y - corner.y) / state.camera.zoom,
  });

  function followPointer() {
    if (!gesture || gesture.kind === 'pan') return;

    const at = boardPointAt(gesture.pointer);
    const dx = at.x - gesture.grab.x;
    const dy = at.y - gesture.grab.y;

    if (gesture.kind === 'move') {
      gesture.delta = { x: dx, y: dy };
      gesture.element.style.translate = `${dx}px ${dy}px`;
    } else {
      gesture.rect = resized(gesture.start, gesture.corner, dx, dy);
      placeElement(gesture.element, gesture.rect);
    }
  }

  const selectedShape = () => {
    if (editor.read.selection.nodeMode() !== 'object') return null;

    const [entry] = editor.read.selection.nodes();

    if (!entry) return null;

    return layouts.get(keyOf(entry[0])) ?? null;
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

  const select = (key: NodeKey) => {
    focusRoot();
    editor.update((tx) => tx.selection.setNodes([key], { mode: 'object' }));
  };

  const edit = (key: NodeKey) => {
    focusRoot();
    editor.update((tx) => {
      const end = tx.points.end(key);

      if (end) tx.selection.set(end);
    });
  };

  const insert = (at: BoardPlace) => {
    const { color, fill, geo } = state.nextStyle;
    const { tool } = state;
    const id = editor.update((tx) => {
      tx.history.newBatch();

      return tool === 'note'
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
          );
    });
    const shape = id && boards.read.shape(id);

    setState({ tool: 'select' });
    if (shape) select(shape.key);
  };

  const release = () => {
    const done = gesture;

    gesture = null;
    if (!done || done.kind === 'pan') return;
    if (done.kind === 'move') {
      const { delta, id } = done;

      if (delta.x !== 0 || delta.y !== 0) {
        editor.update((tx) => {
          tx.history.newBatch();
          tx.plugin(BaseBoardPlugin).move([id], delta);
        });
      }
      done.element.style.translate = '';

      return;
    }

    const { id, rect, start } = done;

    if (sameBox(rect, start)) {
      done.element.style.cssText = done.restore;
    } else {
      editor.update((tx) => {
        tx.history.newBatch();
        tx.plugin(BaseBoardPlugin).resize(id, rect);
      });
    }
  };

  const shapeKey = (event: KeyboardEvent, shape: BoardShapeLayout) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return false;

    const tool = TOOL_KEYS[event.key];
    const restack = RESTACK_KEYS[event.key];

    if (tool) {
      setState({ tool });
    } else if (restack) {
      editor.update((tx) => {
        tx.history.newBatch();
        tx.plugin(BaseBoardPlugin).restack([shape.id], restack);
      });
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      editor.update((tx) => {
        tx.history.newBatch();
        tx.plugin(BaseBoardPlugin).remove([shape.id]);
      });
    } else if (event.key === 'Enter') {
      edit(shape.key);
    } else if (event.key.length !== 1) {
      return false;
    }

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
    surface = host;
    paintCamera();

    const measure = () => {
      const rect = host.getBoundingClientRect();

      corner = { x: rect.left, y: rect.top };
      if (rect.width === size.width && rect.height === size.height) return;
      size = { height: rect.height, width: rect.width };
      if (refresh()) requestRender();
    };
    const resizeObserver = new ResizeObserver(measure);

    measure();
    resizeObserver.observe(host);

    let swallowClick = false;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || gesture || !(event.target instanceof Element)) {
        return;
      }
      if (event.target.closest('[data-board-toolbar]')) return;

      measure();

      const pointer = { x: event.clientX, y: event.clientY };
      const at = boardPointAt(pointer);
      const shapeElement =
        event.target.closest<HTMLElement>('[data-board-shape]');
      const shape = shapeElement
        ? byId.get(shapeElement.dataset.boardShape ?? '')
        : undefined;
      const handle =
        CORNERS[
          event.target.closest<HTMLElement>('[data-board-handle]')?.dataset
            .boardHandle ?? ''
        ];

      if (shapeElement && shape && handle) {
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
        select(shape.key);
        gesture = {
          delta: { x: 0, y: 0 },
          element: shapeElement,
          grab: at,
          id: shape.id,
          kind: 'move',
          pointer,
        };
      } else if (state.tool === 'select') {
        gesture = {
          camera: state.camera,
          kind: 'pan',
          pointer,
          start: pointer,
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
    const onPointerUp = () => {
      release();
      setTimeout(() => {
        swallowClick = false;
      }, 0);
    };
    const onClick = (event: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      event.preventDefault();
      event.stopPropagation();
    };
    const onDoubleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !host.contains(event.target)) {
        return;
      }

      const shapeElement =
        event.target.closest<HTMLElement>('[data-board-shape]');
      const shape =
        shapeElement && byId.get(shapeElement.dataset.boardShape ?? '');

      if (!shape || editedShape()?.key === shape.key) return;
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
      if (!(event.target instanceof Node) || !host.contains(event.target)) {
        return;
      }

      const selected = selectedShape();
      const edited = event.key === 'Escape' && !selected ? editedShape() : null;

      if (edited) {
        select(edited.key);
      } else if (!selected || !shapeKey(event, selected)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };
    const view = host.ownerDocument.defaultView;

    host.addEventListener('pointerdown', onPointerDown, true);
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerup', onPointerUp);
    host.addEventListener('pointercancel', onPointerUp);
    host.addEventListener('wheel', onWheel, { passive: false });
    view?.addEventListener('click', onClick, true);
    view?.addEventListener('dblclick', onDoubleClick, true);
    view?.addEventListener('keydown', onKeyDown, true);

    return () => {
      gesture = null;
      cancelAnimationFrame(frame);
      frame = 0;
      identityAnimation?.cancel();
      identityAnimation = null;
      layer = null;
      zoomLayer = null;
      surface = null;
      resizeObserver.disconnect();
      host.removeEventListener('pointerdown', onPointerDown, true);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerup', onPointerUp);
      host.removeEventListener('pointercancel', onPointerUp);
      host.removeEventListener('wheel', onWheel);
      view?.removeEventListener('click', onClick, true);
      view?.removeEventListener('dblclick', onDoubleClick, true);
      view?.removeEventListener('keydown', onKeyDown, true);
    };
  };

  index();
  shownVersion = version;
  refresh();

  const actions: BoardViewActions = {
    fit: () => {
      if (entries.length === 0 || size.width === 0) return;

      const minX = Math.min(...entries.map((entry) => entry.place.x));
      const minY = Math.min(...entries.map((entry) => entry.place.y));
      const maxX = Math.max(
        ...entries.map((entry) => entry.place.x + entry.size.width)
      );
      const maxY = Math.max(
        ...entries.map((entry) => entry.place.y + entry.size.height)
      );
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
    setNextStyle: (style) =>
      setState({ nextStyle: { ...state.nextStyle, ...style } }),
    setTool: (tool) => setState({ tool }),
  };

  return {
    actions,
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
      });

      follow();

      return unsubscribe;
    },
    keyOf,
    layoutOf: (key: NodeKey) => {
      if (!layouts.has(key)) index();

      return layouts.get(key);
    },
    root,
    state: () => state,
    subscribe: (listener: () => void) => {
      stateListeners.add(listener);

      return () => {
        stateListeners.delete(listener);
      };
    },
    subscribeShapes: (listener: () => void) => {
      shapeListeners.add(listener);

      return () => {
        shapeListeners.delete(listener);
      };
    },
    viewport: () => ({
      mountedKeys,
      reveal: (path: readonly number[]) => {
        const entry = entries[path[0] ?? -1];

        if (!entry) return false;

        const { zoom } = state.camera;

        setCamera({
          x: entry.place.x + entry.size.width / 2 - size.width / 2 / zoom,
          y: entry.place.y + entry.size.height / 2 - size.height / 2 / zoom,
          zoom,
        });
        if (refresh()) requestRender();

        return true;
      },
    }),
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
