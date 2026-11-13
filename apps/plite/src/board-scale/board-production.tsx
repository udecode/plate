'use client';

import type { NodeKey } from 'platejs';
import {
  type EditorElementProps,
  type RenderElementProps,
  useEditor,
  useEditorSelector,
  useModelEditor,
} from 'platejs/react';
import RBush from 'rbush';
import * as React from 'react';

import { BaseBoardPlugin } from '../../../../packages/platejs/src/features/board';
import {
  BoardArrowPlugin,
  BoardFramePlugin,
  BoardGeoPlugin,
  type BoardMessages,
  BoardNotePlugin,
  BoardPlugin,
  BoardShape,
  BoardStrokePlugin,
  BoardSurface,
  useArrowPath,
} from '../../../../packages/platejs/src/react/features/board';
import {
  type BoardView as ShippedView,
  BoardViewContext,
} from '../../../../packages/platejs/src/react/features/board/boardView.internal';
import { createInstruments, LOOK, type RendererView } from './board-renderer';
import type { BoardPlant, RenderArm } from './browser-cohorts';
import {
  type BoardCamera,
  type BoardPoint,
  NOTE_TARGETS,
  plateBoardPlugins,
  type StoredNode,
  VIEWPORT,
} from './stub-board';

type Instruments = ReturnType<typeof createInstruments>;

const MESSAGES: BoardMessages = {
  label: 'Board',
  instructions: 'Enter selects the first shape.',
  removed: (count) => `${count} removed`,
  shape: ({ kind, text }, { position, total }) =>
    `${text || kind}. ${position} of ${total}`,
  shapes: (count) => `${count} shapes`,
  tool: (tool) => tool,
};

type Handle = {
  dragFrame: string | null;
  layer: HTMLElement | null;
  unheard: boolean;
  view: ShippedView | null;
  wheels: number;
};

type ProductionConfig = Readonly<{
  arm: RenderArm;
  camera: BoardCamera;
  plant: BoardPlant | null;
}>;

let counting: Instruments['stats'] | null = null;
let afterLoad: () => void = () => {};
let rbushCounted = false;

const countRbush = (stats: Instruments['stats'], onLoad: () => void) => {
  counting = stats;
  afterLoad = onLoad;
  if (rbushCounted) return;
  rbushCounted = true;

  // oxlint-disable-next-line typescript/unbound-method -- each original runs with `call(this)` below.
  const { load: originalLoad, search: originalSearch } = RBush.prototype;

  RBush.prototype.load = function load(this: RBush, items) {
    if (counting) counting.indexBuilds += 1;

    const loaded = originalLoad.call(this, items);

    afterLoad();

    return loaded;
  };
  RBush.prototype.search = function search(this: RBush, box) {
    if (counting) counting.visibilityRecomputes += 1;

    return originalSearch.call(this, box);
  };
};

const FRAME_NAME_LOOK: React.CSSProperties = {
  bottom: '100%',
  fontSize: 12,
  left: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
};

const ARROW_LOOK: React.CSSProperties = { pointerEvents: 'none' };

const DROP_MS = 40;
const WHEEL_STEP_ZOOM = 100;

const marksOf = (shape: StoredNode) => ({
  'data-frame': shape.place?.frame,
  'data-shape-id': shape.shapeId,
  'data-shape-type': shape.type,
});

const isMoving = (handle: Handle) =>
  (handle.layer?.getAnimations().length ?? 0) > 0;

export const createProductionRenderer = (config: ProductionConfig) => {
  const { arm, plant } = config;
  const handles = new Set<Handle>();
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
  } = createInstruments(() => [...handles].some(isMoving));
  let onCameraWrite: (camera: BoardCamera) => void = () => {};
  let windows = 0;
  const scanned = new WeakSet<object>();

  let reindexes = 0;
  const reindexListeners = new Set<() => void>();
  const subscribeReindex = (listener: () => void) => {
    reindexListeners.add(listener);

    return () => reindexListeners.delete(listener);
  };
  const readReindex = () => reindexes;

  countRbush(stats, () => {
    if (plant !== 'late-motion' || ![...handles].some((h) => h.unheard)) {
      return;
    }
    reindexes += 1;
    for (const listener of reindexListeners) listener();
  });

  const countScans = (editor: ReturnType<typeof useEditor>) => {
    if (scanned.has(editor)) return;
    scanned.add(editor);

    type Lookup = (plugin: unknown) => {
      read: { shapes: (board: NodeKey) => unknown };
    };
    const target = editor as unknown as { plugin: Lookup };
    const lookup = target.plugin;

    target.plugin = (plugin) => {
      const handle = lookup.call(editor, plugin);

      if (plugin !== BaseBoardPlugin) return handle;

      return new Proxy(handle, {
        get: (owner, key) =>
          key === 'read'
            ? new Proxy(owner.read, {
                get: (read, name) =>
                  name === 'shapes'
                    ? (board: NodeKey) => {
                        stats.geometryScans += 1;

                        return read.shapes(board);
                      }
                    : Reflect.get(read, name),
              })
            : Reflect.get(owner, key),
      });
    };
  };

  countCommittedRenders({ shapes: [BoardShape] });

  const instrumented = new WeakSet<ShippedView>();
  const layoutPlant = plant === 'shape-render' || plant === 'pan-render';

  const instrumentView = (view: ShippedView) => {
    if (!layoutPlant || instrumented.has(view)) return;
    instrumented.add(view);

    const { layoutOf, subscribeShapes } = view;

    const copies = new Map<
      string,
      { copy: ReturnType<typeof layoutOf>; from: unknown; tick: number }
    >();

    view.subscribeShapes = (listener) => {
      const shapes = subscribeShapes(listener);
      const ticks = subscribeTick(listener);

      return () => {
        shapes();
        ticks();
      };
    };
    view.layoutOf = (key) => {
      const layout = layoutOf(key);
      const tick = readTick();
      const held = copies.get(key);

      if (!layout || tick === 0) return layout;
      if (held?.from === layout && held.tick === tick) return held.copy;

      const copy = { ...layout };

      copies.set(key, { copy, from: layout, tick });

      return copy;
    };
  };

  const meets = (camera: BoardCamera) => {
    const view = {
      maxX: camera.x + VIEWPORT.width / camera.zoom,
      maxY: camera.y + VIEWPORT.height / camera.zoom,
      minX: camera.x,
      minY: camera.y,
    };

    return {
      box: (box: BoardPoint & { height: number; width: number }) =>
        box.x <= view.maxX &&
        box.x + box.width >= view.minX &&
        box.y <= view.maxY &&
        box.y + box.height >= view.minY,
      point: (point: BoardPoint) =>
        point.x >= view.minX &&
        point.x <= view.maxX &&
        point.y >= view.minY &&
        point.y <= view.maxY,
    };
  };

  type Viewport = NonNullable<
    NonNullable<
      Parameters<RenderElementProps['slots']['contentRoot']>[1]
    >['viewport']
  >;

  const plantedViewport = (
    viewport: Viewport,
    handle: Handle,
    editor: ReturnType<typeof useModelEditor>
  ): Viewport => {
    const { view } = handle;

    if (!view) return viewport;
    if (plant === 'cull-endpoints') {
      const sees = meets(view.state().camera).point;
      const kept = [...viewport.mountedKeys].filter((key) => {
        const node = editor.read.nodes.get(key)?.[0] as StoredNode | undefined;

        if (node?.start && node.end && !sees(node.start) && !sees(node.end)) {
          plantWork.endpointCulls += 1;

          return false;
        }

        return true;
      });

      return { ...viewport, mountedKeys: new Set(kept) };
    }
    if (plant === 'late-motion' && handle.unheard) {
      const inView = meets(view.state().camera).box;
      const kept = [...viewport.mountedKeys].filter((key) => {
        const box = view.layoutOf(key)?.box;

        return box !== undefined && inView(box);
      });

      if (kept.length < viewport.mountedKeys.size) plantWork.lateMotion += 1;

      return { ...viewport, mountedKeys: new Set(kept) };
    }
    if (plant === 'drag-members-unmount' && handle.dragFrame) {
      const kept = [...viewport.mountedKeys].filter((key) => {
        const node = editor.read.nodes.get(key)?.[0] as StoredNode | undefined;

        if (node?.place?.frame !== handle.dragFrame) return true;
        plantWork.unmountedMembers += 1;

        return false;
      });

      return { ...viewport, mountedKeys: new Set(kept) };
    }

    return viewport;
  };

  const installPlants = (handle: Handle, host: HTMLElement) => {
    const onWheel = () => {
      handle.wheels += 1;
      if (plant === 'late-motion') {
        handle.unheard = true;
        requestAnimationFrame(() => {
          handle.unheard = false;
        });
      }
      if (plant === 'pan-render') bumpShapeTick();
      if (plant === 'camera-write' && handle.view) {
        plantWork.cameraWrites += 1;
        onCameraWrite(handle.view.state().camera);
      }
      if (plant === 'drop' && handle.wheels % 10 === 0) {
        plantWork.droppedFrames += 1;
        busyWait(DROP_MS);
      }
    };
    let seen = 0;
    // Window capture runs before the view's own listener on the surface.
    const onCaptureWheel = (event: WheelEvent) => {
      if (!(event.target instanceof Node) || !host.contains(event.target)) {
        return;
      }
      seen += 1;
      if (plant === 'ignore' || (plant === 'skip' && seen % 2 === 0)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (plant === 'ignore') plantWork.ignoredEvents += 1;
        else plantWork.skippedUpdates += 1;
      }
    };

    const onDragDown = (event: PointerEvent) => {
      const frame =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-shape-type="boardFrame"]')
          : null;

      handle.dragFrame =
        frame && host.contains(frame) ? (frame.dataset.shapeId ?? null) : null;
      if (handle.dragFrame && plant === 'drag-members-unmount') {
        reindexes += 1;
        for (const listener of reindexListeners) listener();
      }
    };
    const onDragUp = () => {
      handle.dragFrame = null;
    };
    const swallowTimedMove = (event: PointerEvent) => {
      if (!handle.dragFrame) return;
      event.stopImmediatePropagation();
      plantWork.ignoredEvents += 1;
    };
    const onMovedPreview = () => {
      const id = handle.dragFrame;

      if (!id) return;
      if (plant === 'drag-render') {
        plantWork.dragRenders += 1;
        bumpShapeTick();
      }
      if (plant === 'drag-members-still') {
        for (const member of host.querySelectorAll<HTMLElement>(
          `[data-frame="${id}"]`
        )) {
          member.style.translate = '';
          plantWork.stillMembers += 1;
        }
      }
    };
    const drags = plant?.startsWith('drag-') ?? false;

    host.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('wheel', onCaptureWheel, {
      capture: true,
      passive: false,
    });
    if (drags) {
      window.addEventListener('pointerdown', onDragDown, true);
      window.addEventListener('pointerup', onDragUp, true);
      if (plant === 'drag-ignore') {
        document.addEventListener('pointermove', swallowTimedMove, true);
      }
      window.addEventListener('pointermove', onMovedPreview);
    }

    return () => {
      host.removeEventListener('wheel', onWheel);
      window.removeEventListener('wheel', onCaptureWheel, { capture: true });
      window.removeEventListener('pointerdown', onDragDown, true);
      window.removeEventListener('pointerup', onDragUp, true);
      document.removeEventListener('pointermove', swallowTimedMove, true);
      window.removeEventListener('pointermove', onMovedPreview);
    };
  };

  function ViewProbe({ handleRef }: { handleRef: React.RefObject<Handle> }) {
    'use no memo';
    const view = React.useContext(BoardViewContext);
    const ref = React.useRef<HTMLSpanElement>(null);

    React.useLayoutEffect(() => {
      handleRef.current.view = view;
    }, [handleRef, view]);
    React.useLayoutEffect(() => {
      const host = ref.current?.closest<HTMLElement>('[data-board]') ?? null;
      const handle = handleRef.current;

      if (!host) return undefined;
      handle.layer = host.querySelector<HTMLElement>('[data-board-layer]');
      handles.add(handle);

      const remove = installPlants(handle, host);
      const { zoom } = config.camera;

      if (zoom !== 1) {
        const corner = host.getBoundingClientRect();

        host.dispatchEvent(
          new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: corner.left,
            clientY: corner.top,
            ctrlKey: true,
            deltaY: -WHEEL_STEP_ZOOM * Math.log2(zoom),
          })
        );
      }

      return () => {
        handles.delete(handle);
        handle.layer = null;
        remove();
      };
    }, [handleRef]);

    return <span hidden ref={ref} />;
  }

  function Board(props: EditorElementProps<typeof BoardPlugin>) {
    'use no memo';
    const editor = useModelEditor();
    React.useSyncExternalStore(subscribeReindex, readReindex, readReindex);
    const handleRef = React.useRef<Handle>({
      dragFrame: null,
      layer: null,
      unheard: false,
      view: null,
      wheels: 0,
    });
    const [windowed] = React.useState(() => {
      windows += 1;

      return arm === 'W' && !(plant === 'double-mount' && windows === 1);
    });

    const keptAlive = useKeptAlive();
    const mounted = useEditor();

    countScans(editor);
    countScans(mounted);

    const slots = {
      ...props.slots,
      contentRoot: (
        slot: Parameters<typeof props.slots.contentRoot>[0],
        options?: Parameters<typeof props.slots.contentRoot>[1]
      ) => {
        stats.boardRenders += 1;

        const { viewport, ...rest } = options ?? {};

        return props.slots.contentRoot(
          slot,
          windowed && !keptAlive && viewport
            ? {
                ...rest,
                viewport: plantedViewport(viewport, handleRef.current, editor),
              }
            : rest
        );
      },
    };

    return (
      <BoardSurface
        {...props}
        attributes={{ ...props.attributes, 'data-render-arm': arm }}
        messages={MESSAGES}
        slots={slots}
        toolbar={<ViewProbe handleRef={handleRef} />}
      />
    );
  }

  function TickingBoard(props: EditorElementProps<typeof BoardPlugin>) {
    'use no memo';
    React.useSyncExternalStore(subscribeTick, readTick, readTick);

    return <Board {...props} />;
  }

  function Shape(props: RenderElementProps) {
    'use no memo';
    const shape = props.element as unknown as StoredNode;
    const view = React.useContext(BoardViewContext);

    if (view) instrumentView(view);
    useShapeMount();

    const arrow = shape.type === 'boardArrow';

    return (
      <BoardShape
        {...(props as unknown as React.ComponentProps<typeof BoardShape>)}
        attributes={{
          ...props.attributes,
          ...(arrow ? {} : marksOf(shape)),
        }}
        style={arrow ? ARROW_LOOK : LOOK[shape.type ?? '']}
      />
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

  const ShapeComponent =
    plant === 'render' || plant === 'drag-render'
      ? TickingShape
      : plant === 'shape-selector'
        ? SelectingShape
        : Shape;

  function FrameShape(props: RenderElementProps) {
    'use no memo';
    const { name } = props.element as { name?: string };

    return (
      <ShapeComponent {...props}>
        {props.children}
        <div
          contentEditable={false}
          data-board-frame-name=""
          style={FRAME_NAME_LOOK}
        >
          {name || 'Frame'}
        </div>
      </ShapeComponent>
    );
  }

  function ArrowShape(props: RenderElementProps) {
    'use no memo';
    const drawn = useArrowPath(props.element);

    if (!drawn) return <ShapeComponent {...props} />;

    const { end, start } = drawn;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);

    return (
      <ShapeComponent {...props}>
        <div
          {...marksOf(props.element)}
          contentEditable={false}
          style={{
            height: Math.abs(end.y - start.y),
            left: x,
            position: 'absolute',
            top: y,
            width: Math.abs(end.x - start.x),
          }}
        >
          <svg
            aria-hidden
            height={1}
            style={{ overflow: 'visible', position: 'absolute' }}
            width={1}
          >
            <line
              stroke="#475569"
              strokeWidth={2}
              x1={start.x - x}
              x2={end.x - x}
              y1={start.y - y}
              y2={end.y - y}
            />
          </svg>
        </div>
        {props.children}
      </ShapeComponent>
    );
  }

  const plugins = plateBoardPlugins('composed', [
    BoardPlugin.configure({
      component: (plant === 'render' ? TickingBoard : Board) as never,
      targetPlugins: [
        BoardNotePlugin,
        BoardGeoPlugin,
        BoardArrowPlugin,
        BoardFramePlugin,
        BoardStrokePlugin,
      ],
    }),
    BoardNotePlugin.configure({
      component: ShapeComponent as never,
      targetPlugins: NOTE_TARGETS,
    }),
    BoardGeoPlugin.configure({ component: ShapeComponent as never }),
    BoardArrowPlugin.configure({ component: ArrowShape as never }),
    BoardFramePlugin.configure({ component: FrameShape as never }),
    BoardStrokePlugin.configure({ component: ShapeComponent as never }),
  ]);

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
    viewsSettled: () => ![...handles].some(isMoving),
    viewOf: (root: string): RendererView | null => {
      const handle = [...handles].find(
        (each) => each.view?.root === root && each.layer
      );

      return handle?.view
        ? {
            camera: handle.view.state().camera,
            layer: handle.layer,
            zoomLayer:
              handle.layer?.firstElementChild instanceof HTMLElement
                ? handle.layer.firstElementChild
                : null,
          }
        : null;
    },
  };
};
