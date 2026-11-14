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
  type BoardCamera,
  type BoardPoint,
  plateBoardPlugins,
  type StoredNode,
  stubBoardPlugins,
  VIEWPORT,
} from './stub-board';

type ShapeGeometry = Readonly<{
  end?: BoardPoint;
  place?: BoardPoint;
  size?: Readonly<{ height: number; width: number }>;
  start?: BoardPoint;
}>;

type ShapeFields = ShapeGeometry &
  Readonly<{
    frame?: string;
    shapeId?: string;
    type: string;
    zIndex?: string;
  }>;

export type ShapeBox = Readonly<{
  height: number;
  width: number;
  x: number;
  y: number;
}>;

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

  return {
    height: shape.size?.height ?? 0,
    width: shape.size?.width ?? 0,
    x: place.x,
    y: place.y,
  };
};

const byStack = (a: ShapeFields, b: ShapeFields) => {
  const left = a.zIndex ?? '';
  const right = b.zIndex ?? '';

  if (left !== right) return left < right ? -1 : 1;

  return (a.shapeId ?? '') < (b.shapeId ?? '') ? -1 : 1;
};

const stackRanks = new WeakMap<
  readonly ShapeFields[],
  ReadonlyMap<string | undefined, number>
>();

const stackRankOf = (shapes: readonly ShapeFields[], shape: ShapeFields) => {
  let ranks = stackRanks.get(shapes);

  if (!ranks) {
    ranks = new Map(
      [...shapes].sort(byStack).map((each, at) => [each.shapeId, at + 1])
    );
    stackRanks.set(shapes, ranks);
  }

  return ranks.get(shape.shapeId) ?? 0;
};

const StackRank = React.createContext<(shape: ShapeFields) => number>(() => 0);

export type RendererView = Readonly<{
  camera: BoardCamera;
  layer: HTMLElement | null;
  zoomLayer: HTMLElement | null;
}>;

export const transformOf = (view: RendererView | null) =>
  view?.layer && view.zoomLayer
    ? new DOMMatrixReadOnly(getComputedStyle(view.layer).transform).multiply(
        new DOMMatrixReadOnly(getComputedStyle(view.zoomLayer).transform)
      )
    : null;

export type BoardView = {
  camera: BoardCamera;
  drawnZoom: number;
  layer: HTMLDivElement | null;
  listeners: Set<(moving: boolean) => void>;
  root: string;
  zoomLayer: HTMLDivElement | null;
  drag: Readonly<{ dx: number; dy: number; id: string }> | null;
  dragged: readonly HTMLElement[];
  grab: Readonly<{
    board: BoardPoint;
    pointer: BoardPoint;
    surface: BoardPoint;
  }> | null;
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

export const LOOK: Readonly<Record<string, React.CSSProperties>> = {
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

type CommittedFiber = {
  alternate: CommittedFiber | null;
  child: CommittedFiber | null;
  flags: number;
  memoizedProps: { element?: StoredNode } | null;
  sibling: CommittedFiber | null;
  subtreeFlags: number;
  type: unknown;
};

declare global {
  interface Window {
    __BOARD_SCALE_COMMIT__?: (root: { current: CommittedFiber }) => void;
  }
}

/** React's flag on a fiber whose component rendered and changed this commit. */
const PERFORMED_WORK = 1;

type CullBox = BBox & { index: number };

const union = (left: readonly number[], right: readonly number[]) =>
  [...new Set([...left, ...right])].sort((one, other) => one - other);

const sameIndexes = (left: readonly number[], right: readonly number[]) =>
  left.length === right.length &&
  left.every((index, at) => index === right[at]);

export const createInstruments = (moving: () => boolean) => {
  const stats = {
    boardRenders: 0,
    geometryScans: 0,
    indexBuilds: 0,
    mountedNow: 0,
    mounts: 0,
    motionUnmounts: 0,
    renderedIds: new Map<string, number>(),
    renders: 0,
    updates: 0,
    valueChanges: 0,
    visibilityRecomputes: 0,
  };

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
    viewScans: 0,
  };
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

  const bumpShapeTick = () => {
    tick += 1;
    plantWork.renderBumps += 1;
    for (const listener of tickListeners) listener();
  };

  const countShapeRender = (id: string, update: boolean) => {
    stats.renders += 1;
    stats.renderedIds.set(id, (stats.renderedIds.get(id) ?? 0) + 1);
    if (update) stats.updates += 1;
  };

  const useShapeMount = () => {
    'use no memo';
    React.useLayoutEffect(() => {
      stats.mounts += 1;
      stats.mountedNow += 1;

      return () => {
        stats.mountedNow -= 1;
        if (moving()) stats.motionUnmounts += 1;
      };
    }, []);
  };

  /**
   * A fiber that rendered and changed carries PerformedWork, and so does each
   * ancestor's subtree flags, so the walk enters only the branches that
   * rendered.
   */
  const countCommittedRenders = ({
    boards = [],
    shapes,
  }: Readonly<{ boards?: readonly unknown[]; shapes: readonly unknown[] }>) => {
    window.__BOARD_SCALE_COMMIT__ = (root) => {
      const stack = [root.current];

      while (stack.length > 0) {
        const fiber = stack.pop();

        if (!fiber) continue;
        if (fiber.flags & PERFORMED_WORK) {
          if (shapes.includes(fiber.type)) {
            countShapeRender(
              fiber.memoizedProps?.element?.shapeId ?? '',
              fiber.alternate !== null
            );
          } else if (boards.includes(fiber.type)) {
            stats.boardRenders += 1;
          }
        }
        if (fiber.subtreeFlags & PERFORMED_WORK) {
          for (let { child } = fiber; child; child = child.sibling) {
            stack.push(child);
          }
        }
      }
    };
  };

  let keptAlive = false;
  const keepAliveListeners = new Set<() => void>();
  const subscribeKeepAlive = (listener: () => void) => {
    keepAliveListeners.add(listener);

    return () => {
      keepAliveListeners.delete(listener);
    };
  };
  const readKeepAlive = () => keptAlive;
  const keepAlive = () => {
    keptAlive = true;
    for (const listener of keepAliveListeners) listener();
  };
  const useKeptAlive = () =>
    React.useSyncExternalStore(
      subscribeKeepAlive,
      readKeepAlive,
      readKeepAlive
    );

  return {
    bumpShapeTick,
    busyWait,
    countCommittedRenders,
    keepAlive,
    plantWork,
    readTick,
    stats,
    subscribeTick,
    useKeptAlive,
    useShapeMount,
  };
};

export const createBoardRenderer = (config: RendererConfig) => {
  const { arm, plant } = config;
  const views = new Set<BoardView>();
  const {
    bumpShapeTick,
    busyWait,
    countCommittedRenders,
    keepAlive,
    plantWork,
    readTick,
    stats,
    subscribeTick,
    useKeptAlive,
    useShapeMount,
  } = createInstruments(() => [...views].some(isViewMoving));
  const queuedRenders = new Set<BoardView>();
  let onCameraWrite: (camera: BoardCamera) => void = () => {};
  let windows = 0;

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

  const attachView = (
    view: BoardView,
    layer: HTMLDivElement | null,
    zoomLayer: HTMLDivElement | null
  ) => {
    if (!layer || !zoomLayer) return undefined;
    view.layer = layer;
    view.zoomLayer = zoomLayer;
    layer.style.transform = panTransform(view);
    zoomLayer.style.transform = zoomTransform(view);
    views.add(view);

    const surface = layer.parentElement;
    const remove = surface ? installGestures(view, surface) : undefined;

    return () => {
      view.identityAnimation?.cancel();
      view.identityAnimation = null;
      view.layer = null;
      view.zoomLayer = null;
      views.delete(view);
      queuedRenders.delete(view);
      remove?.();
    };
  };

  function Shape(props: RenderElementProps) {
    'use no memo';
    const shape = props.element as unknown as ShapeFields;
    const box = shapeBox(shape);
    const rankOf = React.useContext(StackRank);

    useShapeMount();

    return (
      <EditorElement
        {...props}
        attributes={{
          ...props.attributes,
          'data-frame': shape.frame,
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
          zIndex: rankOf(shape),
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

  const createWindow = (
    editor: ReturnType<typeof useEditor>,
    view: BoardView
  ) => {
    const rootView = createEditorView(editor, { root: view.root });
    const tree = new RBush<CullBox>();
    let children: readonly ShapeFields[] | null = null;
    let geometry: ReadonlyArray<readonly unknown[]> = [];
    let boxes: readonly ShapeBox[] = [];
    let framed = new Map<string, number[]>();
    let shown: readonly number[] = [];
    let keys: ReadonlySet<NodeKey> = new Set();
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
        for (const id of [shape.shapeId, shape.frame]) {
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
      follow: () => {
        if (!sync()) return false;
        refresh();

        return true;
      },
      viewport,
      view: (viewMoving: boolean) => {
        heardMoving = viewMoving;

        return refresh();
      },
    };
  };

  const useBoardWindow = (view: BoardView) => {
    'use no memo';
    const editor = useEditor();
    const [window] = React.useState(() => createWindow(editor, view));
    const [, rerender] = React.useReducer((count: number) => count + 1, 0);

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
    const editor = useEditor();
    const [rankOf] = React.useState(() => {
      const rootView = createEditorView(editor, { root: view.root });

      return (shape: ShapeFields) =>
        stackRankOf(rootView.read.children(), shape);
    });
    const layerRef = React.useRef<HTMLDivElement>(null);
    const zoomLayerRef = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(
      () => attachView(view, layerRef.current, zoomLayerRef.current),
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
            ref={zoomLayerRef}
            style={{
              left: 0,
              position: 'absolute',
              top: 0,
              transformOrigin: '0 0',
            }}
          >
            <StackRank value={rankOf}>{content}</StackRank>
          </div>
        </div>
        {props.children}
      </EditorElement>
    );
  }

  const rootOf = (props: RenderElementProps) =>
    (props.element as unknown as StoredNode).childRoots?.shapes ?? '';

  function Board(props: RenderElementProps) {
    'use no memo';
    const [view] = React.useState(() => createView(rootOf(props)));

    return (
      <BoardSurface
        content={props.slots.contentRoot('shapes')}
        props={props}
        view={view}
      />
    );
  }

  function WindowBoard(props: RenderElementProps) {
    'use no memo';
    const [view] = React.useState(() => createView(rootOf(props)));
    const [unwindowed] = React.useState(() => {
      windows += 1;

      return plant === 'double-mount' && windows === 1;
    });
    const viewport = useBoardWindow(view);
    const keptAlive = useKeptAlive();

    return (
      <BoardSurface
        content={props.slots.contentRoot(
          'shapes',
          unwindowed || keptAlive ? undefined : { viewport }
        )}
        props={props}
        view={view}
      />
    );
  }

  function TickingWindowBoard(props: RenderElementProps) {
    'use no memo';
    React.useSyncExternalStore(subscribeTick, readTick, readTick);

    return <WindowBoard {...props} />;
  }

  const ShapeComponent =
    plant === 'render' ||
    plant === 'shape-render' ||
    plant === 'pan-render' ||
    plant === 'drag-render'
      ? TickingShape
      : plant === 'shape-selector'
        ? SelectingShape
        : Shape;

  countCommittedRenders({ boards: [Board, WindowBoard], shapes: [Shape] });

  const plugins = plateBoardPlugins(
    'composed',
    stubBoardPlugins({
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
    })
  );

  return {
    bumpShapeTick,
    busyWait,
    keepAlive,
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
    viewOf: (root: string) =>
      [...views].find((view) => view.root === root) ?? null,
  };
};
