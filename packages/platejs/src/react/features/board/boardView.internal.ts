import * as React from 'react';

import {
  type ContentSlice,
  createEditorView,
  type Element,
  ElementApi,
  type Descendant,
  type NodeKey,
  PathApi,
  type PluginTransaction,
  SelectionApi,
} from '../../../core';
import { readAuthoredView, subscribeEditorViewState } from '../../../facade';
import {
  BaseBoardFramePlugin,
  BaseBoardGeoPlugin,
  BaseBoardNotePlugin,
  BaseBoardPlugin,
  type BoardGeo,
  type BoardMemberEntry,
  type BoardPlace,
  type BoardRestackDirection,
  type BoardSize,
} from '../../../features/board/lib';
import { shapeIdOf } from '../../../features/board/lib/boardCopy.internal';
import { frameTakes } from '../../../features/board/lib/boardFrame.internal';
import {
  BOARD_SHAPES_SLOT,
  shapeSelectionMode,
} from '../../../features/board/lib/boardShape.internal';
import type { Editor, EditorHistoryController } from '../../core';
import { attachBoardClipboard } from './boardClipboard.internal';
import { attachBoardGestures } from './boardGesture.internal';
import {
  type BoardBox,
  type BoardIndex,
  type BoardShapeLayout,
  createBoardIndex,
} from './boardIndex.internal';
import { attachBoardKeys, takeTextTab } from './boardKeys.internal';
import {
  type BoardMessages,
  type BoardVoice,
  createBoardVoice,
} from './boardVoice.internal';

export type { BoardArrowPath, BoardShapeLayout } from './boardIndex.internal';

/** Where a board view looks: the board point at its top left corner, and its zoom. */
export type BoardCamera = Readonly<{ x: number; y: number; zoom: number }>;

/**
 * What a press on the board does: `arrow` draws an arrow from the press to
 * the release, and `pen` draws a line along the drag, or a dot at a click,
 * and stays the tool after it draws. `eraser` marks every note, shape, arrow
 * and pen line a click or drag passes over, but never a frame, and removes
 * them as one undo step on release, and stays the tool. A marked shape shows
 * `data-erasing`. The other tools act on an empty part of the board, which
 * includes the inside of a frame. `frame` draws a frame over a drag, or adds
 * one of the frame's default size centered at a click. `select` selects the
 * shapes a mouse or pen drag's box holds wholly, adding them to the selection
 * with Shift, and pans on a touch drag.
 */
export type BoardTool =
  | 'arrow'
  | 'eraser'
  | 'frame'
  | 'geo'
  | 'note'
  | 'pen'
  | 'select';

export type BoardPlaceTool = Extract<BoardTool, 'frame' | 'geo' | 'note'>;

/**
 * The style the next shape a board view adds gets. Its `fill` goes to both the
 * next note and the next geo shape.
 */
export type BoardStyle = Readonly<{
  fill?: string;
  geo?: BoardGeo;
}>;

/**
 * One mounted view's state. It lives in the view and never in the document, so
 * two views of one board each keep their own camera, tool and next style.
 */
export type BoardViewState = Readonly<{
  camera: BoardCamera;
  nextStyle: BoardStyle;
  /**
   * The selected shapes of this view's board in stored order, each with its
   * node as this view shows it, or none when the selection holds no shape of
   * this board. The array stays the same until the selection or a listed shape
   * changes.
   */
  selectedShapes: readonly BoardMemberEntry[];
  tool: BoardTool;
  /** Whether the view can write: false when it is read-only or a preview. */
  writable: boolean;
}>;

export type BoardViewActions = Readonly<{
  /** Move the camera so every shape is in view, at most at full size, and clear of the toolbar when the board has room. A focused board says the new zoom when it changes. */
  fit: () => void;
  /** Move focus to the board and keep its selection, such as after a toolbar menu closes. */
  focus: () => void;
  /** Remove the frame `id` and keep its shapes where they are, as one undo step. */
  removeFrame: (id: string) => void;
  /** Zoom to 100 percent around the view's center, as Shift+0 does. A focused board says the new zoom when it changes. */
  resetZoom: () => void;
  /** Merge `style` into the style the next added shape gets. */
  setNextStyle: (style: BoardStyle) => void;
  setTool: (tool: BoardTool) => void;
  /** Zoom in to the next of 10, 25, 50, 100, 200, 400 and 800 percent around the view's center, as `+` does, and do nothing at 800. A focused board says the new zoom. */
  zoomIn: () => void;
  /** Zoom out to the next lower of 10, 25, 50, 100, 200, 400 and 800 percent around the view's center, as `-` does, and do nothing at 10. A focused board says the new zoom. */
  zoomOut: () => void;
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

export type BoardInteraction = Readonly<{
  cancel: () => void;
  kind: 'drag' | 'draw';
}>;

export type BoardViewCore = Readonly<{
  board: NodeKey;
  boardPointAt: (client: BoardPlace) => BoardPlace;
  replaceInteraction: (interaction: BoardInteraction) => () => void;
  boardSelected: () => boolean;
  cancelInteraction: () => boolean;
  /** Unmark every shape the eraser marked, and return their ids. */
  clearErasing: () => readonly string[];
  viewCenter: () => BoardPlace;
  commit: (change: BoardWrite) => void;
  edit: (key: NodeKey) => void;
  editedShape: () => BoardShapeLayout | null;
  editor: Editor;
  fit: () => void;
  focusBoard: () => boolean;
  focusTarget: React.RefObject<HTMLDivElement | null>;
  inView: (layout: BoardShapeLayout) => boolean;
  index: BoardIndex;
  insertAndSelect: (
    insert: (tx: PluginTransaction) => string | undefined
  ) => boolean;
  deselectOnBoard: () => boolean;
  land: (slice: ContentSlice, place?: BoardPlace) => boolean;
  leaveBoard: (backward: boolean) => boolean;
  /** Mark the shapes `ids` as ones the eraser will remove. */
  markErasing: (ids: readonly string[]) => void;
  measure: () => void;
  mounted: Editor;
  pan: (viewFraction: BoardPlace) => void;
  paste: (data: DataTransfer) => boolean;
  place: (
    tool: BoardPlaceTool,
    box: BoardBox,
    options?: Readonly<{ takesShapes?: boolean }>
  ) => boolean;
  redo: () => void;
  resetZoom: () => void;
  reveal: (path: readonly number[]) => boolean;
  select: (keys: readonly NodeKey[]) => void;
  selectBoard: () => void;
  selectedShapes: () => BoardShapeLayout[];
  setCamera: (camera: BoardCamera) => void;
  setTool: (tool: BoardTool) => void;
  shapeAt: (at: BoardPlace) => BoardShapeLayout | undefined;
  shapesAlong: (from: BoardPlace, to: BoardPlace) => readonly string[];
  slice: (ids: readonly string[]) => ContentSlice | null;
  state: () => BoardViewState;
  undo: () => void;
  voice: Pick<BoardVoice, 'hold' | 'release' | 'repeatSelection'>;
  writable: () => boolean;
  /**
   * Run `change` as one undo step when the view can write, and return its
   * result.
   */
  write: <T>(change: (tx: PluginTransaction) => T) => T | undefined;
  zoomIn: () => void;
  zoomLayer: () => HTMLElement | null;
  zoomOut: () => void;
}>;

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;
const ZOOM_STEPS = [MIN_ZOOM, 0.25, 0.5, 1, 2, 4, MAX_ZOOM];
const WHEEL_STEP_ZOOM = 100;
const FIT_PADDING = 32;

const percentOf = (zoom: number) => Math.round(zoom * 100);

const clampZoom = (zoom: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

const sameKeys = (a: ReadonlySet<NodeKey>, b: ReadonlySet<NodeKey>) =>
  a.size === b.size && [...a].every((key) => b.has(key));

const sameValue = (a: unknown, b: unknown): boolean =>
  a === b ||
  (typeof a === 'object' &&
    typeof b === 'object' &&
    a !== null &&
    b !== null &&
    Object.keys(a).length === Object.keys(b).length &&
    Object.entries(a).every(([field, value]) =>
      sameValue(value, (b as Readonly<Record<string, unknown>>)[field])
    ));

const sameShapes = (
  next: readonly BoardMemberEntry[],
  previous: readonly BoardMemberEntry[]
) =>
  next.length === previous.length &&
  next.every(
    (entry, at) =>
      entry.node === previous[at].node && sameValue(entry, previous[at])
  );

const subscribeTo = (listeners: Set<() => void>) => (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const SHAPES_EDITABLE = `[data-editor-content-root-slot="${BOARD_SHAPES_SLOT}"] [contenteditable="true"]`;

const setShapeSelection = (tx: PluginTransaction, keys: readonly NodeKey[]) =>
  tx.selection.setNodes(keys, {
    mode: shapeSelectionMode(
      tx.schema,
      keys.flatMap((key) => tx.nodes.get(key)?.[0] ?? [])
    ),
  });

export const createBoardView = (
  editor: Editor,
  mounted: Editor,
  element: Element,
  initialMessages: BoardMessages
) => {
  const keyOf = (node: Descendant) => editor.read((state) => state.key(node));
  const board = keyOf(element);
  const root =
    editor.read.schema.getElementContentRoots(element)[BOARD_SHAPES_SLOT] ?? '';
  const rootView = createEditorView(editor, { root });
  const boards = editor.plugin(BaseBoardPlugin);
  const shownBoards = mounted.plugin(BaseBoardPlugin);

  const writable = () => {
    const authored = readAuthoredView(mounted);

    return (
      !mounted.read.view.isReadOnly() && !(authored && 'preview' in authored)
    );
  };

  let state: BoardViewState = {
    camera: { x: 0, y: 0, zoom: 1 },
    nextStyle: {},
    selectedShapes: [],
    tool: 'select',
    writable: writable(),
  };
  const stateListeners = new Set<() => void>();
  const shapeListeners = new Set<() => void>();
  const viewportListeners = new Set<() => void>();
  const erasing = new Set<string>();
  const erasingListeners = new Map<string, Set<() => void>>();

  const notifyErasing = (ids: Iterable<string>) => {
    for (const id of ids) {
      for (const listener of erasingListeners.get(id) ?? []) listener();
    }
  };

  const setState = (next: Partial<BoardViewState>) => {
    state = { ...state, ...next };
    for (const listener of stateListeners) listener();
  };

  let shownView = createEditorView(mounted, { root });
  let renderedKeyOf = new Map<NodeKey, NodeKey>();
  const index = createBoardIndex({
    children: () => shownView.read.children(),
    isEmpty: (block) => editor.read.nodes.isEmpty(block),
    isVoid: (node) => editor.read.schema.isVoid(node),
    members: () => {
      const shown = new Map(
        shownView.read
          .children()
          .map((node, at) => [
            ElementApi.isElement(node) ? shapeIdOf(node) : '',
            shownView.key([at]),
          ])
      );
      const entries = shownBoards.read
        .shapes(board)
        .filter(({ id }) => shown.has(id));

      renderedKeyOf = new Map(
        entries.flatMap(({ id, key }) => {
          const rendered = shown.get(id);

          return rendered ? [[key, rendered]] : [];
        })
      );

      return entries;
    },
    nodeOf: (key) => {
      const node = mounted.read.nodes.get(key)?.[0];

      return ElementApi.isElement(node) ? node : undefined;
    },
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
  const focusTarget = React.createRef<HTMLDivElement>();
  let surface: HTMLElement | null = null;
  let gestures: ReturnType<typeof attachBoardGestures> | null = null;
  let interaction: BoardInteraction | null = null;

  const cancelInteraction = () => {
    const held = interaction;

    if (!held) return false;
    interaction = null;
    held.cancel();

    return true;
  };

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
        .flatMap((box) => renderedKeyOf.get(box.key) ?? [])
    );
    const next = frame === 0 ? found : new Set([...mountedKeys, ...found]);

    if (sameKeys(next, mountedKeys)) return;
    mountedKeys = next;
    viewport = { mountedKeys, reveal };
    for (const listener of viewportListeners) listener();
  };

  const withShownNode = (entry: BoardMemberEntry) => {
    const node = mounted.read.nodes.get(entry.key)?.[0];

    return ElementApi.isElement(node) && node !== entry.node
      ? { ...entry, node }
      : entry;
  };

  const showSelection = () => {
    const keys = selectedKeys();
    const listed =
      keys.size === 0
        ? []
        : index
            .entries()
            .filter((entry) => keys.has(entry.key))
            .map(withShownNode);
    const selected = sameShapes(listed, state.selectedShapes)
      ? state.selectedShapes
      : listed;
    const canWrite = writable();

    if (selected !== state.selectedShapes || canWrite !== state.writable) {
      setState({ selectedShapes: selected, writable: canWrite });
    }
  };

  const follow = () => {
    const rendered = renderedKeyOf;

    index.update();
    if (renderedKeyOf !== rendered) refresh();
    if (index.version() === shownVersion) return;
    shownVersion = index.version();
    for (const listener of shapeListeners) listener();
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

  const rowsClearOfToolbar = () => {
    const rows = { bottom: size.height, top: 0 };
    const toolbar = surface?.querySelector(':scope > [data-board-toolbar]');

    if (!surface || !toolbar) return rows;

    const edge = surface.getBoundingClientRect().top + surface.clientTop;

    for (const child of toolbar.children) {
      const rect = child.getBoundingClientRect();
      const from = rect.top - edge;
      const to = rect.bottom - edge;

      if (to <= 0 || from >= size.height) continue;
      if (from + to > size.height) rows.bottom = Math.min(rows.bottom, from);
      else rows.top = Math.max(rows.top, to);
    }

    return rows.bottom - rows.top > 2 * FIT_PADDING
      ? rows
      : { bottom: size.height, top: 0 };
  };

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

  const viewCenter = () => {
    const { x, y, zoom } = state.camera;

    return {
      x: x + size.width / 2 / zoom,
      y: y + size.height / 2 / zoom,
    };
  };

  const selectedKeys = (): ReadonlySet<NodeKey> =>
    editor.read.selection.nodeMode()
      ? new Set(editor.read.selection.nodes().map(([node]) => keyOf(node)))
      : new Set();

  const selectedShapes = (): BoardShapeLayout[] => {
    const keys = selectedKeys();

    return index.entries().flatMap((entry) => {
      const layout = keys.has(entry.key) && index.layout(entry.key);

      return layout ? [layout] : [];
    });
  };

  let messages = initialMessages;
  const voice = createBoardVoice({
    editor,
    index,
    members: () => {
      index.update();

      return index.entries();
    },
    messages: () => messages,
    selectedShapes,
    surface: () => surface,
  });

  const sayZoomFrom = (before: number) => {
    if (state.camera.zoom !== before) voice.zoom(percentOf(state.camera.zoom));
  };

  const zoomTo = (zoom: number) => {
    const before = state.camera.zoom;
    const center = viewCenter();

    setCamera({
      x: center.x - size.width / 2 / zoom,
      y: center.y - size.height / 2 / zoom,
      zoom,
    });
    sayZoomFrom(before);
  };

  const zoomStep = (direction: -1 | 1) => {
    const said = percentOf(state.camera.zoom);
    const next =
      direction > 0
        ? ZOOM_STEPS.find((step) => percentOf(step) > said)
        : ZOOM_STEPS.findLast((step) => percentOf(step) < said);

    if (next !== undefined) zoomTo(next);
  };

  const fit = () => {
    const boxes = [...index.layouts()].map(({ box }) => box);

    if (boxes.length === 0 || size.width === 0) return;

    const before = state.camera.zoom;
    const minX = Math.min(...boxes.map(({ x }) => x));
    const minY = Math.min(...boxes.map(({ y }) => y));
    const maxX = Math.max(...boxes.map(({ width, x }) => x + width));
    const maxY = Math.max(...boxes.map(({ height, y }) => y + height));
    const { bottom, top } = rowsClearOfToolbar();
    const height = bottom - top;
    const zoom = clampZoom(
      Math.min(
        1,
        size.width / (maxX - minX + 2 * FIT_PADDING),
        height / (maxY - minY + 2 * FIT_PADDING)
      )
    );

    setCamera({
      x: (minX + maxX) / 2 - size.width / 2 / zoom,
      y: (minY + maxY) / 2 - (top + height / 2) / zoom,
      zoom,
    });
    sayZoomFrom(before);
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
      ?.querySelector<HTMLElement>(SHAPES_EDITABLE)
      ?.focus({ preventScroll: true });
  };

  const parentEditable = () =>
    surface?.parentElement?.closest<HTMLElement>('[contenteditable="true"]');

  const focusDocument = () => {
    parentEditable()?.focus({ preventScroll: true });
  };

  const focusBoard = () => {
    focusTarget.current?.focus({ preventScroll: true });

    return !!focusTarget.current;
  };

  const deselectOnBoard = () => {
    if (!focusBoard()) return false;
    // Chrome and Firefox keep the editable's caret after focus leaves it.
    editor.api.dom.deselect();

    return true;
  };

  const select = (keys: readonly NodeKey[]) => {
    const order = new Map(index.entries().map((entry, at) => [entry.key, at]));
    const sorted = keys.toSorted(
      (a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0)
    );
    deselectOnBoard();
    editor.update((tx) => setShapeSelection(tx, sorted));
  };

  let history: Pick<EditorHistoryController, 'redo' | 'undo'> | null = null;

  const keyById = (id: string) => {
    if (!index.byId(id)) index.update();

    return index.byId(id)?.key;
  };

  const write = <T>(change: (tx: PluginTransaction) => T) => {
    if (!writable()) return undefined;

    return mounted.update((tx) => {
      tx.history.newBatch();

      return change(tx);
    });
  };

  const commit = (change: BoardWrite) => {
    const before = boards.read.shapes(board).length;
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

    if (!written) return;
    if (change.kind === 'remove') deselectOnBoard();
    else if (change.kind === 'removeFrame') focusBoard();
    else return;
    voice.removed(before - boards.read.shapes(board).length);
  };

  const insertAndSelect = (
    insert: (tx: PluginTransaction) => string | undefined
  ) => {
    if (!writable()) return false;

    const id = write(insert);
    const inserted = id && boards.read.shape(id);

    if (!inserted) return false;
    setState({ tool: 'select' });
    select([inserted.key]);

    return true;
  };

  const placeShape: BoardViewCore['place'] = (
    tool,
    box,
    { takesShapes = false } = {}
  ) => {
    if (tool === 'frame' && takesShapes) {
      const at = {
        place: { x: box.x, y: box.y },
        size: { height: box.height, width: box.width },
      };

      index.update();
      if (
        !index.entries().some(
          (entry) =>
            entry.kind === 'shape' &&
            frameTakes(at, {
              ...entry,
              content: mounted.read.nodes.isContent(entry.node),
            })
        )
      ) {
        return false;
      }
    }

    const { fill, geo } = state.nextStyle;
    const style = fill === undefined ? {} : { fill };

    return insertAndSelect((tx) => {
      if (tool === 'frame') {
        return tx.plugin(BaseBoardFramePlugin).insert(box, { board });
      }
      if (tool === 'note') {
        return tx
          .plugin(BaseBoardNotePlugin)
          .insert({ ...box, ...style }, { board });
      }

      return tx
        .plugin(BaseBoardGeoPlugin)
        .insert(
          { ...box, ...style, ...(geo === undefined ? {} : { geo }) },
          { board }
        );
    });
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

  const paste = (data: DataTransfer) => {
    if (!writable()) return false;

    const keys = selectedShapes().map(({ key }) => key);

    shownView.update((tx) => setShapeSelection(tx, keys));

    return !!shownView.api.dom.clipboard.insertData(data);
  };

  const core: BoardViewCore = {
    replaceInteraction: (next) => {
      cancelInteraction();
      interaction = next;

      return () => {
        if (interaction === next) interaction = null;
      };
    },
    board,
    boardPointAt,
    boardSelected: () => {
      const nodes = editor.read.selection.nodes();
      const range = editor.read.selection();

      if (nodes.length > 0) {
        return nodes.length === 1 && keyOf(nodes[0][0]) === board;
      }
      if (!range || !editor.read.selection.isCollapsed()) return false;

      const path = createEditorView(editor, {
        root: SelectionApi.root(range),
      }).read.nodes.path(board);

      return !!path && PathApi.isAncestor(path, range.anchor.path);
    },
    cancelInteraction,
    clearErasing: () => {
      const ids = [...erasing];

      erasing.clear();
      notifyErasing(ids);

      return ids;
    },
    viewCenter,
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
    fit,
    focusBoard,
    focusTarget,
    index,
    insertAndSelect,
    inView: ({ box }) => {
      const { x, y, zoom } = state.camera;

      return (
        box.x >= x &&
        box.y >= y &&
        box.x + box.width <= x + size.width / zoom &&
        box.y + box.height <= y + size.height / zoom
      );
    },
    deselectOnBoard,
    land,
    leaveBoard: (backward) => {
      if (!writable()) {
        editor.update((tx) => tx.selection.set(null));

        return false;
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
    },
    markErasing: (ids) => {
      const added = ids.filter((id) => !erasing.has(id));

      for (const id of added) erasing.add(id);
      notifyErasing(added);
    },
    measure,
    mounted,
    pan: (viewFraction) => {
      const { camera } = state;

      setCamera({
        ...camera,
        x: camera.x + (viewFraction.x * size.width) / camera.zoom,
        y: camera.y + (viewFraction.y * size.height) / camera.zoom,
      });
    },
    paste,
    place: placeShape,
    redo: () => {
      if (writable()) history?.redo();
    },
    resetZoom: () => zoomTo(1),
    reveal,
    select,
    selectBoard: () => {
      if (writable()) focusDocument();
      editor.update((tx) => tx.selection.setNodes([board], { mode: 'block' }));
    },
    selectedShapes,
    setCamera,
    setTool: (tool) => {
      if (interaction?.kind === 'draw' && tool !== state.tool) {
        cancelInteraction();
      }
      setState({ tool });
      voice.tool(tool);
    },
    shapeAt: (at) => index.shapeAt(at, state.camera.zoom),
    shapesAlong: (from, to) => index.shapesAlong(from, to, state.camera.zoom),
    slice: (ids) => boards.read.slice(ids),
    state: () => state,
    undo: () => {
      if (writable()) history?.undo();
    },
    voice,
    writable,
    write,
    zoomIn: () => zoomStep(1),
    zoomLayer: () => zoomLayer,
    zoomOut: () => zoomStep(-1),
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
    fit,
    focus: () => {
      core.focusBoard();
    },
    removeFrame: (id) => commit({ id, kind: 'removeFrame' }),
    resetZoom: core.resetZoom,
    setNextStyle: (style) =>
      setState({ nextStyle: { ...state.nextStyle, ...style } }),
    setTool: core.setTool,
    zoomIn: core.zoomIn,
    zoomOut: core.zoomOut,
  };

  return {
    actions,
    arrowPathOf: (id: string) => {
      const key = keyById(id);

      return key ? index.arrowPathOf(key) : undefined;
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
        if (changed.hasAny('selection') || editor.read.selection.nodeMode()) {
          showSelection();
        }
        if (changed.hasAny('selection')) voice.selectionChanged();
      });

      const unsubscribeViewState = subscribeEditorViewState(mounted, () => {
        gestures?.refuseWrites();
        shownView = createEditorView(mounted, { root });
        follow();
        showSelection();
      });

      follow();
      showSelection();

      return () => {
        unsubscribe();
        unsubscribeViewState();
      };
    },
    erasing: (id: string) => erasing.has(id),
    focusTarget,
    layoutOf: (id: string) => {
      if (!index.byId(id)) index.update();

      return index.byId(id);
    },
    renderWith: (
      next: Readonly<{
        history: Pick<EditorHistoryController, 'redo' | 'undo'>;
        messages: BoardMessages;
      }>
    ) => {
      ({ history, messages } = next);
    },
    root,
    state: () => state,
    strokePathOf: (id: string) => {
      const key = keyById(id);

      return key ? index.strokePathOf(key) : undefined;
    },
    subscribe: subscribeTo(stateListeners),
    subscribeArrow: (id: string, listener: () => void) => {
      const key = keyById(id);
      const stop = key ? index.subscribeArrow(key, listener) : () => {};

      shapeListeners.add(listener);

      return () => {
        stop();
        shapeListeners.delete(listener);
      };
    },
    subscribeErasing: (id: string, listener: () => void) => {
      const listeners = erasingListeners.get(id) ?? new Set();

      listeners.add(listener);
      erasingListeners.set(id, listeners);

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) erasingListeners.delete(id);
      };
    },
    subscribeShapes: subscribeTo(shapeListeners),
    subscribeViewport: subscribeTo(viewportListeners),
    takeTextTab: (event: React.KeyboardEvent) => takeTextTab(core, event),
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
