'use client';

import { createEditorView, type NodeKey } from 'platejs';
import {
  EditorElement,
  type RenderElementProps,
  useEditor,
  useEditorSelector,
} from 'platejs/react';
import RBush, { type BBox } from 'rbush';
import * as React from 'react';

import type { BoardPlant, RenderArm } from './browser-cohorts';
import {
  BASE62,
  type BoardCamera,
  type BoardPoint,
  plateBoardPlugins,
  type StoredNode,
  VIEWPORT,
} from './stub-board';

/**
 * The Scale gate's positioned renderer for the stub board. The board is a
 * void block whose shapes are the top-level blocks of the content root it
 * owns, and it mounts them through `slots.contentRoot('shapes')`. Each
 * mounted view of a board keeps its own camera, layers and drag: a clipped
 * surface whose shapes sit absolutely from their place and size with a
 * z-index rank from their stacking key, while the DOM keeps the stored
 * order. The camera and a frame drag's preview reach the DOM through two
 * transforms and a translate on each dragged shape, so neither renders a
 * shape nor writes the document. Arm W also passes the slot a viewport, the
 * keys of the shapes its camera meets, as `useBoardWindow` says.
 */

type ShapeGeometry = Readonly<{
  end?: BoardPoint;
  place?: BoardPoint & { frame?: string; frameOrigin?: BoardPoint };
  size?: Readonly<{ height: number; width: number }>;
  start?: BoardPoint;
}>;

type ShapeFields = ShapeGeometry &
  Readonly<{ shapeId?: string; type: string; zIndex?: string }>;

export type ShapeBox = Readonly<{
  height: number;
  width: number;
  x: number;
  y: number;
}>;

/** A shape's box in board coordinates, as the renderer places it. */
export const shapeBox = (shape: ShapeGeometry): ShapeBox => {
  if (shape.start && shape.end) {
    return {
      height: Math.max(2, Math.abs(shape.end.y - shape.start.y)),
      width: Math.max(2, Math.abs(shape.end.x - shape.start.x)),
      x: Math.min(shape.start.x, shape.end.x),
      y: Math.min(shape.start.y, shape.end.y),
    };
  }

  const place = shape.place ?? { x: 0, y: 0 };
  const origin = place.frame ? (place.frameOrigin ?? { x: 0, y: 0 }) : null;

  return {
    height: shape.size?.height ?? 0,
    width: shape.size?.width ?? 0,
    x: place.x + (origin?.x ?? 0),
    y: place.y + (origin?.y ?? 0),
  };
};

// The stub's stacking keys all have one length, so decoding their digits keeps
// their order.
const rankOf = (key = 'c000') => {
  let rank = 0;

  for (let index = 1; index < key.length; index++) {
    rank = rank * 62 + BASE62.indexOf(key[index]);
  }

  return rank + 1;
};

/** One mounted view of a board: its camera, its two layers and its drag. */
export type BoardView = {
  camera: BoardCamera;
  /** The zoom the child layer draws the shapes at. */
  drawnZoom: number;
  layer: HTMLDivElement | null;
  /** Called once a frame while the view moves, and once in the frame after it stops. */
  listeners: Set<(moving: boolean) => void>;
  root: string;
  zoomLayer: HTMLDivElement | null;
  /** The frame a drag moves and its offset in board units. */
  drag: Readonly<{ dx: number; dy: number; id: string }> | null;
  dragged: readonly HTMLElement[];
  /**
   * The board point a drag grabbed, the pointer's last client point and the
   * surface's client corner, so a pan or zoom mid-drag keeps the grabbed
   * point under the pointer.
   */
  grab: Readonly<{
    board: BoardPoint;
    pointer: BoardPoint;
    surface: BoardPoint;
  }> | null;
  /** Set from the camera change until the frame after the view stops. */
  frame: number;
  identityAnimation: Animation | null;
  moved: boolean;
};

type RendererConfig = Readonly<{
  arm: RenderArm;
  camera: BoardCamera;
  plant: BoardPlant | null;
}>;

// The promoted layer translates in screen pixels, and a child of it scales to
// the drawn zoom. WebKit redraws every mounted shape when the child's scale
// changes, about 157 ms a frame with 4,000 shapes mounted, and dropped most
// frames of a pan while the promoted layer kept a scale. So a zoom scales the
// promoted layer by its change from the drawn zoom while the view moves, and
// the change moves into the child once the view settles.
const panTransform = (view: BoardView) => {
  const { x, y, zoom } = view.camera;

  return zoom === view.drawnZoom
    ? `translate(${-x * zoom}px, ${-y * zoom}px)`
    : `translate(${-x * zoom}px, ${-y * zoom}px) scale(${zoom / view.drawnZoom})`;
};
const zoomTransform = (view: BoardView) => `scale(${view.drawnZoom})`;

const isViewMoving = (view: BoardView) => view.frame !== 0;

const boardPointAt = (
  view: BoardView,
  client: BoardPoint,
  surface: BoardPoint
) => ({
  x: view.camera.x + (client.x - surface.x) / view.camera.zoom,
  y: view.camera.y + (client.y - surface.y) / view.camera.zoom,
});

const LOOK: Readonly<Record<string, React.CSSProperties>> = {
  // An arrow's box spans its two ends, so a fill would cover the shapes
  // between them and take their clicks.
  boardArrow: { borderTop: '2px solid #475569', pointerEvents: 'none' },
  boardFrame: { border: '1px dashed #64748b', cursor: 'grab' },
  boardGeo: { background: '#dbeafe', border: '1px solid #60a5fa' },
  boardNote: {
    background: '#fef9c3',
    border: '1px solid #eab308',
    fontSize: 12,
    overflow: 'hidden',
  },
  boardStroke: { border: '1px solid #0f172a' },
};

const WHEEL_STEP_ZOOM = 100;
const DROP_MS = 40;

type CullBox = BBox & { index: number };

const union = (left: readonly number[], right: readonly number[]) =>
  [...new Set([...left, ...right])].sort((one, other) => one - other);

const sameIndexes = (left: readonly number[], right: readonly number[]) =>
  left.length === right.length &&
  left.every((index, at) => index === right[at]);

/**
 * The stub board's renderer for one page: its counters, its plants and the
 * composed Plate plugins whose board and shape components draw it. Every
 * mounted board gets its own view, so a second view of one board, such as
 * the keep-alive plant's hidden copy, never moves the first one's camera.
 */
export const createBoardRenderer = (config: RendererConfig) => {
  /** Board and shape renders and mounts, and arm W's window work, which the lanes read back. */
  const stats = {
    boardRenders: 0,
    /** Arm W's scans of the root for a changed place, size or child. */
    geometryScans: 0,
    /** Arm W's spatial index rebuilds, one per change to a place, size or the root's blocks. */
    indexBuilds: 0,
    /** Shape trees mounted now. */
    live: 0,
    /** Shape trees mounted in all. */
    mounts: 0,
    /** Shape trees unmounted while the view moved, which arm W must never do. */
    motionUnmounts: 0,
    renderedIds: new Map<string, number>(),
    renders: 0,
    /** Commits of a shape tree that was already mounted. */
    updates: 0,
    valueChanges: 0,
    /** Arm W's searches of its index for the shapes in view. */
    visibilityRecomputes: 0,
  };

  /** Work each planted arm records, so a plant that did nothing fails. */
  const plantWork = {
    busyMs: 0,
    cameraWrites: 0,
    deferredKeys: 0,
    dragRenders: 0,
    droppedFrames: 0,
    endpointCulls: 0,
    ignoredEvents: 0,
    lateMotion: 0,
    layoutReads: 0,
    renderBumps: 0,
    shapeSelectorRuns: 0,
    skippedUpdates: 0,
    stillMembers: 0,
    unmountedMembers: 0,
  };
  const { arm, plant } = config;
  const views = new Set<BoardView>();
  const queuedRenders = new Set<BoardView>();
  /** Writes the camera into the document, for the camera-write plant. */
  let onCameraWrite: (camera: BoardCamera) => void = () => {};
  let windows = 0;

  const busyWait = (ms: number) => {
    const end = performance.now() + ms;

    while (performance.now() < end) {
      // A plant's slowdown holds the thread, as real work would.
    }
    plantWork.busyMs += ms;
  };

  let tick = 0;
  const tickListeners = new Set<() => void>();
  const subscribeTick = (listener: () => void) => {
    tickListeners.add(listener);

    return () => {
      tickListeners.delete(listener);
    };
  };
  const readTick = () => tick;

  /** Re-renders every shape, for the plants that render shapes they should not. */
  const bumpShapeTick = () => {
    tick += 1;
    plantWork.renderBumps += 1;
    for (const listener of tickListeners) listener();
  };

  const createView = (root: string): BoardView => ({
    camera: config.camera,
    drag: null,
    dragged: [],
    drawnZoom: config.camera.zoom,
    frame: 0,
    grab: null,
    layer: null,
    listeners: new Set(),
    identityAnimation: null,
    moved: false,
    root,
    zoomLayer: null,
  });

  const viewTick = (view: BoardView) => {
    const moving = view.moved;

    view.moved = false;
    view.frame = moving ? requestAnimationFrame(() => viewTick(view)) : 0;
    if (!moving) {
      view.identityAnimation?.cancel();
      view.identityAnimation = null;
      if (view.camera.zoom !== view.drawnZoom) {
        view.drawnZoom = view.camera.zoom;
        if (view.zoomLayer) {
          view.zoomLayer.style.transform = zoomTransform(view);
        }
        if (view.layer) view.layer.style.transform = panTransform(view);
      }
    }
    for (const listener of view.listeners) listener(moving);
  };

  // Blink relayerizes every paint chunk on each change to a layer's transform
  // unless the layer runs a transform animation, about 6.5 ms a frame with
  // 4,000 shapes in view. An additive identity animation keeps the camera's
  // own transform and lets Blink update the compositor's copy directly.
  const notifyView = (view: BoardView) => {
    view.moved = true;
    view.frame ||= requestAnimationFrame(() => viewTick(view));
    view.identityAnimation ??=
      view.layer?.animate(
        [
          { transform: 'translate(0px, 0px)' },
          { transform: 'translate(0px, 0px)' },
        ],
        { composite: 'add', duration: 1000, iterations: Infinity }
      ) ?? null;
  };

  // Each dragged shape gets its own translate. A custom property on the layer
  // would restyle every mounted shape on each move, and a rule rewrite
  // restyles every element in WebKit.
  const moveDragged = (view: BoardView) => {
    const { drag } = view;
    const translate = drag ? `${drag.dx}px ${drag.dy}px` : '';

    for (const element of view.dragged) {
      if (
        drag &&
        plant === 'drag-members-still' &&
        element.dataset.shapeId !== drag.id
      ) {
        plantWork.stillMembers += 1;
        continue;
      }
      element.style.translate = translate;
    }
  };

  const placeDragged = (view: BoardView) => {
    if (!view.layer) return;
    view.dragged = view.drag
      ? [
          ...view.layer.querySelectorAll<HTMLElement>(
            `[data-shape-id="${view.drag.id}"], [data-frame="${view.drag.id}"]`
          ),
        ]
      : [];
    moveDragged(view);
  };

  const followPointer = (view: BoardView) => {
    if (!view.drag || !view.grab) return;
    const at = boardPointAt(view, view.grab.pointer, view.grab.surface);

    view.drag = {
      ...view.drag,
      dx: at.x - view.grab.board.x,
      dy: at.y - view.grab.board.y,
    };
    moveDragged(view);
  };

  const setCamera = (view: BoardView, next: BoardCamera) => {
    view.camera = next;
    if (view.layer) view.layer.style.transform = panTransform(view);
    followPointer(view);
    notifyView(view);
  };

  const installGestures = (view: BoardView, surface: HTMLElement) => {
    let wheels = 0;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      wheels += 1;

      if (plant === 'ignore') {
        plantWork.ignoredEvents += 1;

        return;
      }
      if (plant === 'skip' && wheels % 2 === 0) {
        plantWork.skippedUpdates += 1;

        return;
      }

      const { camera } = view;
      const next = event.ctrlKey
        ? {
            ...camera,
            zoom: camera.zoom * 2 ** (-event.deltaY / WHEEL_STEP_ZOOM),
          }
        : {
            ...camera,
            x: camera.x + event.deltaX / camera.zoom,
            y: camera.y + event.deltaY / camera.zoom,
          };

      setCamera(view, next);

      if (plant === 'pan-render') bumpShapeTick();
      if (plant === 'camera-write') {
        plantWork.cameraWrites += 1;
        onCameraWrite(next);
      }
      if (plant === 'drop' && wheels % 10 === 0) {
        plantWork.droppedFrames += 1;
        busyWait(DROP_MS);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const frame = (event.target as Element | null)?.closest<HTMLElement>(
        '[data-shape-type="boardFrame"]'
      );
      const id = frame?.dataset.shapeId;

      if (!id || !view.layer) return;
      event.preventDefault();
      event.stopPropagation();
      surface.setPointerCapture(event.pointerId);
      const corner = surface.getBoundingClientRect();
      const pointer = { x: event.clientX, y: event.clientY };
      const surfacePoint = { x: corner.left, y: corner.top };

      view.grab = {
        board: boardPointAt(view, pointer, surfacePoint),
        pointer,
        surface: surfacePoint,
      };
      view.drag = { dx: 0, dy: 0, id };
      placeDragged(view);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!view.drag || !view.grab || !view.layer) return;
      if (plant === 'drag-ignore') {
        plantWork.ignoredEvents += 1;

        return;
      }

      view.grab = {
        ...view.grab,
        pointer: { x: event.clientX, y: event.clientY },
      };
      followPointer(view);
      notifyView(view);

      if (plant === 'drag-render') {
        plantWork.dragRenders += 1;
        bumpShapeTick();
      }
    };
    let dragEndClickPending = false;
    const onPointerUp = () => {
      if (!view.drag) return;
      view.drag = null;
      view.grab = null;
      moveDragged(view);
      view.dragged = [];
      notifyView(view);
      dragEndClickPending = true;
      setTimeout(() => {
        dragEndClickPending = false;
      }, 0);
    };
    const swallowDragEndClick = (event: MouseEvent) => {
      if (!dragEndClickPending) return;
      dragEndClickPending = false;
      event.preventDefault();
      event.stopPropagation();
    };

    surface.addEventListener('wheel', onWheel, { passive: false });
    surface.addEventListener('pointerdown', onPointerDown, true);
    surface.addEventListener('pointermove', onPointerMove);
    surface.addEventListener('pointerup', onPointerUp);
    window.addEventListener('click', swallowDragEndClick, true);

    return () => {
      surface.removeEventListener('wheel', onWheel);
      surface.removeEventListener('pointerdown', onPointerDown, true);
      surface.removeEventListener('pointermove', onPointerMove);
      surface.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('click', swallowDragEndClick, true);
    };
  };

  const useShapeLife = (id: string) => {
    // oxlint-disable-next-line react/immutability -- counting renders is this probe's job; Shape opts out of the compiler so every render runs.
    stats.renders += 1;
    stats.renderedIds.set(id, (stats.renderedIds.get(id) ?? 0) + 1);

    // A layout effect, so the counts are whole when readiness is stamped in
    // the next frame.
    React.useLayoutEffect(() => {
      stats.mounts += 1;
      stats.live += 1;

      return () => {
        stats.live -= 1;
        if ([...views].some(isViewMoving)) stats.motionUnmounts += 1;
      };
    }, []);

    const committed = React.useRef(false);

    React.useLayoutEffect(() => {
      if (committed.current) stats.updates += 1;
      committed.current = true;
    });
  };

  function Shape(props: RenderElementProps) {
    // Render counts must run on every render, which compiler memoization skips.
    'use no memo';
    const shape = props.element as unknown as ShapeFields;
    const box = shapeBox(shape);

    useShapeLife(shape.shapeId ?? '');

    return (
      <EditorElement
        {...props}
        attributes={{
          ...props.attributes,
          'data-frame': shape.place?.frame,
          'data-shape-id': shape.shapeId,
          'data-shape-type': shape.type,
        }}
        style={{
          height: box.height,
          left: box.x,
          margin: 0,
          position: 'absolute',
          top: box.y,
          width: box.width,
          zIndex: rankOf(shape.zIndex),
          ...LOOK[shape.type],
        }}
      >
        {props.children}
      </EditorElement>
    );
  }

  function TickingShape(props: RenderElementProps) {
    'use no memo';
    React.useSyncExternalStore(subscribeTick, readTick, readTick);

    return <Shape {...props} />;
  }

  function SelectingShape(props: RenderElementProps) {
    'use no memo';
    useEditorSelector(() => {
      plantWork.shapeSelectorRuns += 1;

      return 0;
    });

    return <Shape {...props} />;
  }

  /**
   * Arm W's window over one view: an rbush index of the root's shape boxes,
   * the ascending indexes it keeps mounted and their node keys. The index
   * rebuilds only when a shape's place, size or ends or the root's blocks
   * change. The kept indexes are the shapes the view's camera meets and a
   * dragged frame's members wherever the drag moved them; the slot itself
   * keeps the shapes a selection end sits in. While the view
   * moves the window only grows; it drops the shapes that left the view in
   * the frame after the view stops, because in WebKit each unmount redrew
   * every mounted shape.
   */
  const createWindow = (
    editor: ReturnType<typeof useEditor>,
    view: BoardView
  ) => {
    const rootView = createEditorView(editor, { root: view.root });
    const tree = new RBush<CullBox>();
    let children: readonly ShapeFields[] | null = null;
    let geometry: ReadonlyArray<readonly unknown[]> = [];
    let boxes: readonly ShapeBox[] = [];
    // Each shape's id, and each frame's id, to the indexes a drag of that id moves.
    let framed = new Map<string, number[]>();
    let shown: readonly number[] = [];
    let keys: ReadonlySet<NodeKey> = new Set();
    /** The view's motion as the view listener last reported it, read only by the late-motion plant. */
    let heardMoving = false;
    const moving = () =>
      plant === 'late-motion' ? heardMoving : isViewMoving(view);

    const search = () => {
      stats.visibilityRecomputes += 1;
      const { camera, drag } = view;
      const seen = {
        maxX: camera.x + VIEWPORT.width / camera.zoom,
        maxY: camera.y + VIEWPORT.height / camera.zoom,
        minX: camera.x,
        minY: camera.y,
      };
      const hits = new Set(tree.search(seen).map((box) => box.index));

      if (plant === 'cull-endpoints') {
        const sees = (point: BoardPoint) =>
          point.x >= seen.minX &&
          point.x <= seen.maxX &&
          point.y >= seen.minY &&
          point.y <= seen.maxY;

        for (const index of hits) {
          const { end, start } = children?.[index] ?? {};

          if (start && end && !sees(start) && !sees(end)) {
            hits.delete(index);
            plantWork.endpointCulls += 1;
          }
        }
      }
      if (drag) {
        const { dx, dy, id } = drag;

        for (const index of framed.get(id) ?? []) {
          const box = boxes[index];
          const x = box.x + dx;
          const y = box.y + dy;

          if (
            x <= seen.maxX &&
            x + box.width >= seen.minX &&
            y <= seen.maxY &&
            y + box.height >= seen.minY
          ) {
            hits.add(index);
          }
          if (
            plant === 'drag-members-unmount' &&
            children?.[index]?.shapeId !== id &&
            hits.delete(index)
          ) {
            plantWork.unmountedMembers += 1;
          }
        }
      }

      return [...hits].sort((left, right) => left - right);
    };

    /** Re-indexes when a shape's box or the root's blocks changed; true when it did. */
    const sync = () => {
      const next = rootView.read.children() as readonly ShapeFields[];

      if (next === children) return false;
      stats.geometryScans += 1;
      const previous = children;

      children = next;
      const nextGeometry = next.map((shape) => [
        shape.shapeId,
        shape.place,
        shape.size,
        shape.start,
        shape.end,
      ]);
      const same =
        nextGeometry.length === geometry.length &&
        nextGeometry.every((parts, index) =>
          parts.every((part, slot) => part === geometry[index][slot])
        );

      geometry = nextGeometry;
      if (same) return false;
      stats.indexBuilds += 1;
      if (plant === 'late-motion' && isViewMoving(view) && !heardMoving) {
        plantWork.lateMotion += 1;
      }
      // In WebKit each unmount redraws every mounted shape, so a reindex
      // while the view moves keeps what is mounted, mapped by id.
      if (moving() && previous) {
        const indexOf = new Map(
          next.map((shape, index) => [shape.shapeId, index])
        );

        shown = shown.flatMap((index) => {
          const moved = indexOf.get(previous[index]?.shapeId);

          return moved === undefined ? [] : [moved];
        });
      } else {
        shown = [];
      }
      boxes = next.map(shapeBox);
      framed = new Map();
      next.forEach((shape, index) => {
        for (const id of [shape.shapeId, shape.place?.frame]) {
          if (id === undefined) continue;
          const members = framed.get(id);
          if (members) members.push(index);
          else framed.set(id, [index]);
        }
      });
      tree.clear().load(
        boxes.map((box, index) => ({
          index,
          maxX: box.x + box.width,
          maxY: box.y + box.height,
          minX: box.x,
          minY: box.y,
        }))
      );

      return true;
    };

    /** Searches again; true when the kept indexes changed and the board must render. */
    const refresh = () => {
      const found = search();
      const next = moving() ? union(shown, found) : found;

      if (sameIndexes(next, shown)) return false;
      shown = next;
      keys = new Set(
        shown.flatMap((index) => {
          const key = rootView.key([index]);

          return key === null ? [] : [key];
        })
      );

      return true;
    };

    sync();
    refresh();

    const viewport = () => ({
      mountedKeys: keys,
      reveal: (path: readonly number[]) => {
        const box = boxes[path[0] ?? -1];

        if (!box) return false;
        setCamera(view, {
          ...view.camera,
          x: box.x + box.width / 2 - VIEWPORT.width / 2 / view.camera.zoom,
          y: box.y + box.height / 2 - VIEWPORT.height / 2 / view.camera.zoom,
        });
        refresh();

        return true;
      },
    });

    return {
      /** Re-indexes from a commit that may have moved a shape; true when the board must render. */
      follow: () => sync() && (refresh() || true),
      viewport,
      view: (viewMoving: boolean) => {
        heardMoving = viewMoving;

        return refresh();
      },
    };
  };

  /**
   * Arm W's viewport for one view. A camera change searches the index at most
   * once a frame, and the board renders only when the kept shapes change; a
   * key that changes only a shape's text renders neither the board nor a
   * search.
   */
  const useBoardWindow = (view: BoardView) => {
    const editor = useEditor();
    const [window] = React.useState(() => createWindow(editor, view));
    const [, rerender] = React.useReducer((count: number) => count + 1, 0);

    // A shape this render mounted mid-drag joins the drag's preview before paint.
    React.useLayoutEffect(() => {
      queuedRenders.delete(view);
      if (view.drag) placeDragged(view);
    });
    React.useEffect(() => {
      const onView = (moving: boolean) => {
        if (!window.view(moving)) return;
        queuedRenders.add(view);
        rerender();
      };

      view.listeners.add(onView);
      // A text edit commits no property or structure change, so it costs no
      // scan and no search.
      const unsubscribeCommit = editor.subscribeCommit(({ changed }) => {
        if (
          (changed.hasAny('properties') ||
            changed.hasAny('structure') ||
            changed.hasAny('replace')) &&
          window.follow()
        ) {
          rerender();
        }
      });

      return () => {
        view.listeners.delete(onView);
        unsubscribeCommit();
      };
    }, [editor, view, window]);

    return window.viewport();
  };

  function BoardSurface({
    content,
    props,
    view,
  }: {
    content: React.ReactNode;
    props: RenderElementProps;
    view: BoardView;
  }) {
    'use no memo';
    const layerRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        // oxlint-disable-next-line react/immutability -- the camera view is the gesture handlers' mutable state, not React state; they move this layer outside React.
        view.layer = node;

        if (!node) return undefined;
        node.style.transform = panTransform(view);
        views.add(view);

        const surface = node.parentElement;
        const remove = surface ? installGestures(view, surface) : undefined;

        // React 19 runs a ref's cleanup on detach instead of calling it with null.
        return () => {
          view.identityAnimation?.cancel();
          view.identityAnimation = null;
          view.layer = null;
          views.delete(view);
          queuedRenders.delete(view);
          remove?.();
        };
      },
      [view]
    );
    const zoomRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        // oxlint-disable-next-line react/immutability -- as with the layer above.
        view.zoomLayer = node;
        if (node) node.style.transform = zoomTransform(view);
      },
      [view]
    );

    return (
      <EditorElement
        {...props}
        attributes={{
          ...props.attributes,
          'data-board': view.root,
          'data-render-arm': arm,
        }}
        style={{
          background: '#f8fafc',
          height: VIEWPORT.height,
          overflow: 'clip',
          position: 'relative',
          touchAction: 'none',
          width: VIEWPORT.width,
        }}
      >
        <div
          data-board-layer=""
          ref={layerRef}
          style={{
            left: 0,
            position: 'absolute',
            top: 0,
            transformOrigin: '0 0',
            // oxlint-disable-next-line react-doctor/no-permanent-will-change -- The camera moves this layer on every pan and zoom frame; without the promotion a dense pan dropped 70 of 72 frames in Chromium and 44 of 45 in WebKit.
            willChange: 'transform',
          }}
        >
          <div
            ref={zoomRef}
            style={{
              left: 0,
              position: 'absolute',
              top: 0,
              transformOrigin: '0 0',
            }}
          >
            {content}
          </div>
        </div>
        {props.children}
      </EditorElement>
    );
  }

  const rootOf = (props: RenderElementProps) =>
    (props.element as unknown as StoredNode).childRoots?.shapes ?? '';

  /** Arm A mounts every shape: the uncosted full-DOM control. */
  function Board(props: RenderElementProps) {
    'use no memo';
    // oxlint-disable-next-line react/immutability -- counting renders is this probe's job.
    stats.boardRenders += 1;
    const [view] = React.useState(() => createView(rootOf(props)));

    return (
      <BoardSurface
        content={props.slots.contentRoot('shapes')}
        props={props}
        view={view}
      />
    );
  }

  /** Arm W mounts the root through the slot's window over this view's camera. */
  function WindowBoard(props: RenderElementProps) {
    'use no memo';
    // oxlint-disable-next-line react/immutability -- counting renders is this probe's job.
    stats.boardRenders += 1;
    const [view] = React.useState(() => createView(rootOf(props)));
    // The double-mount plant mounts every shape in the page's first window
    // board, as a board whose index is not ready on its first render would,
    // before the remount that windows it.
    const [unwindowed] = React.useState(() => {
      windows += 1;

      return plant === 'double-mount' && windows === 1;
    });
    const viewport = useBoardWindow(view);

    return (
      <BoardSurface
        content={props.slots.contentRoot(
          'shapes',
          unwindowed ? undefined : { viewport }
        )}
        props={props}
        view={view}
      />
    );
  }

  /**
   * Arm W's render plant: the board renders on every key, and with it every
   * mounted shape, which W1's board-render count in the type lane must reject.
   */
  function TickingWindowBoard(props: RenderElementProps) {
    'use no memo';
    React.useSyncExternalStore(subscribeTick, readTick, readTick);

    return <WindowBoard {...props} />;
  }

  // A plant that renders shapes it should not gets shapes that subscribe to
  // the plant's tick, and the selector plant gets shapes that each add a
  // selector; every other arm gets plain shapes.
  const ShapeComponent =
    plant === 'render' ||
    plant === 'shape-render' ||
    plant === 'pan-render' ||
    plant === 'drag-render'
      ? TickingShape
      : plant === 'shape-selector'
        ? SelectingShape
        : Shape;

  const plugins = plateBoardPlugins('composed', {
    board:
      arm === 'A'
        ? Board
        : plant === 'render'
          ? TickingWindowBoard
          : WindowBoard,
    boardArrow: ShapeComponent,
    boardFrame: ShapeComponent,
    boardGeo: ShapeComponent,
    boardNote: ShapeComponent,
    boardStroke: ShapeComponent,
  });

  return {
    bumpShapeTick,
    busyWait,
    plantWork,
    plugins,
    recordValueChange: () => {
      stats.valueChanges += 1;
    },
    setCameraWrite: (write: (camera: BoardCamera) => void) => {
      onCameraWrite = write;
    },
    stats,
    viewsSettled: () =>
      queuedRenders.size === 0 && ![...views].some(isViewMoving),
    /** The first mounted view of `root`, the one the lanes drive. */
    viewOf: (root: string) =>
      [...views].find((view) => view.root === root) ?? null,
    /** The view's two layers' transforms, composed. */
    transformOf: (view: BoardView | null) =>
      view?.layer && view.zoomLayer
        ? new DOMMatrixReadOnly(
            getComputedStyle(view.layer).transform
          ).multiply(
            new DOMMatrixReadOnly(getComputedStyle(view.zoomLayer).transform)
          )
        : null,
  };
};
