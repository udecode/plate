import * as React from 'react';

import {
  type ContentSlice,
  createEditorView,
  type Element,
  type Descendant,
  type NodeKey,
  type PluginTransaction,
} from '../../../core';
import { readAuthoredView, subscribeEditorViewState } from '../../../facade';
import {
  BaseBoardPlugin,
  type BoardGeo,
  type BoardPlace,
  type BoardRestackDirection,
  type BoardSize,
} from '../../../features/board/lib';
import {
  BOARD_SHAPES_SLOT,
  shapeSelectionMode,
} from '../../../features/board/lib/boardShape.internal';
import type { Editor } from '../../core';
import { attachBoardClipboard } from './boardClipboard.internal';
import { attachBoardGestures } from './boardGesture.internal';
import {
  type BoardBox,
  type BoardIndex,
  type BoardShapeLayout,
  createBoardIndex,
} from './boardIndex.internal';
import { attachBoardKeys } from './boardKeys.internal';

export type { BoardArrowPath, BoardShapeLayout } from './boardIndex.internal';

/** Where a board view looks: the board point at its top left corner, and its zoom. */
export type BoardCamera = Readonly<{ x: number; y: number; zoom: number }>;

/**
 * What a press on the board does: `arrow` draws an arrow from the press to
 * the release, and `pen` draws a line along the drag, or a dot at a click,
 * and stays the tool after it draws. The other tools act on an empty part of
 * the board, which includes the inside of a frame. `frame` draws a frame over
 * a drag, or adds one of the frame's default size centered at a click.
 */
export type BoardTool = 'arrow' | 'frame' | 'geo' | 'note' | 'pen' | 'select';

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

export type BoardWrite =
  | Readonly<{ kind: 'move'; delta: BoardPlace; ids: readonly string[] }>
  | Readonly<{ kind: 'remove'; ids: readonly string[] }>
  | Readonly<{ kind: 'removeFrame'; id: string }>
  | Readonly<{ kind: 'resize'; id: string; rect: BoardBox }>
  | Readonly<{
      kind: 'restack';
      direction: BoardRestackDirection;
      ids: readonly string[];
    }>;

export type BoardViewCore = Readonly<{
  board: NodeKey;
  boardPointAt: (client: BoardPlace) => BoardPlace;
  boardSelected: () => boolean;
  /** End the pointer gesture in flight with no write, and return whether one was. */
  cancelGesture: () => boolean;
  commit: (change: BoardWrite) => void;
  edit: (key: NodeKey) => void;
  editedShape: () => BoardShapeLayout | null;
  editor: Editor;
  focusTarget: () => HTMLElement | null;
  inView: (layout: BoardShapeLayout) => boolean;
  index: BoardIndex;
  /**
   * When the view can write, run `insert` as one undo step, select the shape
   * whose id it returns and go back to the select tool.
   */
  insertWith: (insert: (tx: PluginTransaction) => string | undefined) => void;
  keepKeysOnBoard: () => void;
  land: (slice: ContentSlice, place?: BoardPlace) => boolean;
  /** Put the caret before the board, or after it, and leave the board. */
  leaveBoard: (backward: boolean) => boolean;
  measure: () => void;
  mounted: Editor;
  reveal: (path: readonly number[]) => boolean;
  select: (keys: readonly NodeKey[]) => void;
  selectBoard: () => void;
  selectedShapes: () => BoardShapeLayout[];
  setCamera: (camera: BoardCamera) => void;
  setTool: (tool: BoardTool) => void;
  shapeAt: (at: BoardPlace) => BoardShapeLayout | undefined;
  slice: (ids: readonly string[]) => ContentSlice | null;
  state: () => BoardViewState;
  writable: () => boolean;
  /**
   * Run `change` as one undo step when the view can write, and return its
   * result.
   */
  write: <T>(change: (tx: PluginTransaction) => T) => T | undefined;
  zoomLayer: () => HTMLElement | null;
}>;

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;
const WHEEL_STEP_ZOOM = 100;
const FIT_PADDING = 32;

const clampZoom = (zoom: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

const sameKeys = (a: ReadonlySet<NodeKey>, b: ReadonlySet<NodeKey>) =>
  a.size === b.size && [...a].every((key) => b.has(key));

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

  const index = createBoardIndex({
    children: () => rootView.read.children(),
    isVoid: (node) => editor.read.schema.isVoid(node),
    members: () => boards.read.shapes(board),
  });
  let shownVersion = 0;
  let mountedKeys: ReadonlySet<NodeKey> = new Set();
  let viewport = { mountedKeys, reveal };
  let size: BoardSize = { height: 0, width: 0 };

  let frame = 0;
  let moved = false;
  let identityAnimation: Animation | null = null;
  let drawnZoom = state.camera.zoom;
  let layer: HTMLElement | null = null;
  let zoomLayer: HTMLElement | null = null;
  let focusTarget: HTMLElement | null = null;
  let surface: HTMLElement | null = null;
  let gestures: ReturnType<typeof attachBoardGestures> | null = null;

  const refresh = () => {
    const { x, y, zoom } = state.camera;
    const found = new Set(
      index
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
    index.update();
    if (index.version() === shownVersion) return;
    shownVersion = index.version();
    for (const listener of shapeListeners) listener();
    refresh();
    gestures?.follow();
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
    gestures?.follow();
  };

  function reveal(path: readonly number[]) {
    const layout = index.layout(index.entries()[path[0] ?? -1]?.key ?? '');

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

  const boardPointAt = (client: BoardPlace) => ({
    x: state.camera.x + (client.x - corner.x) / state.camera.zoom,
    y: state.camera.y + (client.y - corner.y) / state.camera.zoom,
  });

  const measure = () => {
    if (!surface) return;

    const rect = surface.getBoundingClientRect();

    corner = {
      x: rect.left + surface.clientLeft,
      y: rect.top + surface.clientTop,
    };
    if (rect.width === size.width && rect.height === size.height) return;
    size = { height: rect.height, width: rect.width };
    refresh();
  };

  const selectedShapes = (): BoardShapeLayout[] => {
    if (!editor.read.selection.nodeMode()) return [];

    const keys = new Set(
      editor.read.selection.nodes().map(([node]) => keyOf(node))
    );

    return index.entries().flatMap((entry) => {
      const layout = keys.has(entry.key) && index.layout(entry.key);

      return layout ? [layout] : [];
    });
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

    return key ? (index.layout(key) ?? null) : null;
  };

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
    const order = new Map(index.entries().map((entry, at) => [entry.key, at]));
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

  const keepKeysOnBoard = () => {
    if (!focusTarget) return;
    focusTarget.focus({ preventScroll: true });
    // Firefox keeps the selection when a non-editable element takes focus.
    editor.api.dom.deselect();
  };

  const write = <T>(change: (tx: PluginTransaction) => T) => {
    if (!writable()) return undefined;

    return mounted.update((tx) => {
      tx.history.newBatch();

      return change(tx);
    });
  };

  const commit = (change: BoardWrite) => {
    const written = write((tx) => {
      const commands = tx.plugin(BaseBoardPlugin);

      if (change.kind === 'move') commands.move(change.ids, change.delta);
      else if (change.kind === 'remove') {
        commands.remove(change.ids);
        tx.selection.set(null);
      } else if (change.kind === 'removeFrame') {
        commands.removeFrame(change.id);
      } else if (change.kind === 'resize') {
        commands.resize(change.id, change.rect);
      } else commands.restack(change.ids, change.direction);

      return true;
    });

    if (written && change.kind === 'remove') keepKeysOnBoard();
  };

  const insertWith = (
    insert: (tx: PluginTransaction) => string | undefined
  ) => {
    if (!writable()) return;

    const id = write(insert);
    const inserted = id && boards.read.shape(id);

    setState({ tool: 'select' });
    if (inserted) select([inserted.key]);
  };

  const land = (slice: ContentSlice, place?: BoardPlace) => {
    const ids = write((tx) =>
      tx
        .plugin(BaseBoardPlugin)
        .insertCopy(slice, { board, ...(place ? { place } : {}) })
    );

    if (!ids) return false;
    select(
      ids.flatMap((id) => {
        const shape = boards.read.shape(id);

        return shape ? [shape.key] : [];
      })
    );

    return true;
  };

  const core: BoardViewCore = {
    board,
    boardPointAt,
    boardSelected: () => {
      const nodes = editor.read.selection.nodes();

      return nodes.length === 1 && keyOf(nodes[0][0]) === board;
    },
    cancelGesture: () => gestures?.cancel() ?? false,
    commit,
    edit: (key) => {
      focusRoot();
      editor.update((tx) => {
        const end = tx.points.end(key);

        if (end) tx.selection.set(end);
      });
    },
    editedShape,
    editor,
    focusTarget: () => focusTarget,
    index,
    insertWith,
    inView: ({ box }) => {
      const { x, y, zoom } = state.camera;

      return (
        box.x >= x &&
        box.y >= y &&
        box.x + box.width <= x + size.width / zoom &&
        box.y + box.height <= y + size.height / zoom
      );
    },
    keepKeysOnBoard,
    land,
    leaveBoard: (backward) => {
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
    },
    measure,
    mounted,
    reveal,
    select,
    selectBoard: () => {
      focusDocument();
      editor.update((tx) => tx.selection.setNodes([board], { mode: 'block' }));
    },
    selectedShapes,
    setCamera,
    setTool: (tool) => setState({ tool }),
    shapeAt: (at) => index.shapeAt(at, state.camera.zoom),
    slice: (ids) => boards.read.slice(ids),
    state: () => state,
    writable,
    write,
    zoomLayer: () => zoomLayer,
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

    const resizeObserver = new ResizeObserver(measure);

    measure();
    resizeObserver.observe(host);

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

    gestures = attachBoardGestures(host, core);

    const detachKeys = attachBoardKeys(host, core);
    const detachClipboard = attachBoardClipboard(host, core);

    host.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      gestures?.detach();
      gestures = null;
      cancelAnimationFrame(frame);
      frame = 0;
      identityAnimation?.cancel();
      identityAnimation = null;
      layer = null;
      zoomLayer = null;
      focusTarget = null;
      surface = null;
      resizeObserver.disconnect();
      host.removeEventListener('wheel', onWheel);
      detachKeys();
      detachClipboard();
    };
  };

  index.update();
  shownVersion = index.version();
  refresh();

  const actions: BoardViewActions = {
    fit: () => {
      const boxes = [...index.layouts()].map(({ box }) => box);

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
    setTool: core.setTool,
  };

  return {
    actions,
    arrowPathOf: index.arrowPathOf,
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
        gestures?.refuseWrites();
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
      if (!index.layout(key)) index.update();

      return index.layout(key);
    },
    root,
    state: () => state,
    strokePathOf: index.strokePathOf,
    subscribe: subscribeTo(stateListeners),
    subscribeArrow: (key: NodeKey, listener: () => void) => {
      const stop = index.subscribeArrow(key, listener);

      shapeListeners.add(listener);

      return () => {
        stop();
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
