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
import {
  readAuthoredView,
  type Editor as RuntimeEditor,
  subscribeEditorViewState,
} from '../../../facade';
import {
  BaseBoardArrowPlugin,
  BaseBoardFramePlugin,
  BaseBoardGeoPlugin,
  BaseBoardImagePlugin,
  BaseBoardNotePlugin,
  BaseBoardPlugin,
  BaseBoardStrokePlugin,
  type BoardGeo,
  type BoardMemberEntry,
  type BoardPlace,
  type BoardRestackDirection,
  type BoardSize,
} from '../../../features/board/lib';
import { shapeIdOf } from '../../../features/board/lib/boardCopy.internal';
import { frameTakes } from '../../../features/board/lib/boardFrame.internal';
import { keepsBoardRatio } from '../../../features/board/lib/boardRatio.internal';
import {
  BOARD_SHAPES_SLOT,
  isBoardGeo,
  shapeSelectionMode,
} from '../../../features/board/lib/boardShape.internal';
import {
  BOARD_STYLE_KEYS,
  type BoardStyles,
  parseBoardStyle,
} from '../../../features/board/lib/boardStyle.internal';
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
import { createPendingPictures } from './boardPictures.internal';
import {
  type BoardMessages,
  type BoardVoice,
  createBoardVoice,
} from './boardVoice.internal';

export type { BoardArrowPath, BoardShapeLayout } from './boardIndex.internal';

/** Where a board view looks: the board point at its top left corner, and its zoom. */
export type BoardCamera = Readonly<{ x: number; y: number; zoom: number }>;

/**
 * What a press on the board does: `hand` pans the view on a drag that starts
 * anywhere on the board, shapes included, and never selects, moves or edits.
 * Its press moves focus to the board unless focus is in the text of a shape on
 * this board, so a note being edited keeps its edit. `arrow` draws an arrow
 * from the press to the release, and `pen` draws a line along the drag, or a
 * dot at a click, and stays the tool after it draws. `eraser` marks every note,
 * shape, arrow and pen line a click or drag passes over, but never a frame, and
 * removes them as one undo step on release, and stays the tool. A marked shape
 * shows `data-erasing`. `frame`, `geo` and `note` draw a frame, a shape of the
 * next style's geo kind or a note over a drag, or add one of the tool's
 * default size centered at a click, over empty board or over other shapes.
 * During the drag Shift keeps the sides equal and Alt centers the box on the
 * press point. `select` acts on an empty part of the board, which includes the
 * inside of a frame: it selects the shapes a mouse or pen drag's box holds
 * wholly, adding them to the selection with Shift, and pans on a touch drag.
 */
export type BoardTool =
  | 'arrow'
  | 'eraser'
  | 'frame'
  | 'geo'
  | 'hand'
  | 'note'
  | 'pen'
  | 'select';

export type BoardPlaceTool = Extract<BoardTool, 'frame' | 'geo' | 'note'>;

/**
 * Board styles by name, as a pick sets them or as the next shape a board view
 * adds gets them. A shape takes the styles its kind stores, and `geo`, the
 * outline kind, goes only to geo shapes.
 */
export type BoardStyle = Readonly<Partial<BoardStyles> & { geo?: BoardGeo }>;

type ShownStyle<T> = Readonly<
  { mixed: false; value: NonNullable<T> } | { mixed: true }
>;

/**
 * One mounted view's state. It lives in the view and never in the document, so
 * two views of one board each keep their own camera, tool and next style.
 */
export type BoardViewState = Readonly<{
  camera: BoardCamera;
  /** The style the next shape this view adds gets, merged from every pick. */
  nextStyle: BoardStyle;
  /**
   * Each style a pick would set, with the value its targets share, or `mixed`
   * when they differ. With the select tool the targets are the selected shapes
   * and the shape whose text is being edited; with a drawing tool, the next
   * shape, which shows its next style or its kind's default. A style no
   * target takes is absent, so the select tool with nothing to style shows
   * none. The object stays the same until a target, the tool or the next
   * style changes.
   */
  styles: Readonly<{
    [K in keyof BoardStyle]?: ShownStyle<BoardStyle[K]>;
  }>;
  /**
   * The selected shapes of this view's board in stored order, each with its
   * node as this view shows it, or none when the selection holds no shape of
   * this board. The array stays the same until the selection or a listed shape
   * changes.
   */
  selectedShapes: readonly BoardMemberEntry[];
  tool: BoardTool;
  /**
   * Whether the note, shape, frame and arrow tools stay picked after they add
   * a shape. Off when the view mounts, kept per view and never stored. The
   * pen and eraser stay picked either way.
   */
  toolLocked: boolean;
  /** Whether the view can write: false when it is read-only or a preview. */
  writable: boolean;
}>;

export type BoardViewActions = Readonly<{
  /** Move the camera so every shape is in view, at most at full size, and clear of the toolbar when the board has room. A focused board says the new zoom when it changes. */
  fit: () => void;
  /** Move focus to the board and keep its selection, such as after a toolbar menu closes. A shape whose text is being edited ends its edit and stays selected. */
  focus: () => void;
  /** Remove the frame `id` and keep its shapes where they are, as one undo step. */
  removeFrame: (id: string) => void;
  /** Zoom to 100 percent around the view's center, as Shift+0 does. A focused board says the new zoom when it changes. */
  resetZoom: () => void;
  /**
   * Merge `style` into the style the next added shape gets. With the select
   * tool, also write each of its styles to every selected shape that takes it
   * and to the shape whose text is being edited, as one undo step that keeps
   * the caret and the edit. A drawing tool's pick styles only the next shape.
   * It skips a value outside the board's values for a style, such as an
   * opacity outside 0.1 to 1. A read-only view or a preview changes nothing.
   */
  setStyle: (style: BoardStyle) => void;
  setTool: (tool: BoardTool) => void;
  /**
   * Turn the tool lock on or off, as Q does. It changes neither the tool nor
   * the selection, and the focused view says `toolLock` when it changes.
   */
  setToolLocked: (locked: boolean) => void;
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

export type BoardInteraction = Readonly<
  {
    cancel: () => void;
    follow?: () => void;
  } & (
    | { kind: 'connect'; startShape: () => string | undefined }
    | { kind: 'drag' | 'draw' | 'resize' }
    | { kind: 'pick'; cursor: () => string }
  )
>;

export type BoardViewCore = Readonly<{
  board: NodeKey;
  boardPointAt: (client: BoardPlace) => BoardPlace;
  replaceInteraction: (interaction: BoardInteraction) => () => void;
  boardSelected: () => boolean;
  cancelInteraction: () => boolean;
  interactionKind: () => BoardInteraction['kind'] | undefined;
  /** Unmark every shape the eraser marked, and return their ids. */
  clearErasing: () => readonly string[];
  viewCenter: () => BoardPlace;
  viewBox: () => BoardBox;
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
  landPictures: (images: readonly Element[], point: BoardPlace) => void;
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
    options: Readonly<{ style: BoardStyle; takesShapes?: boolean }>
  ) => boolean;
  redo: () => void;
  resetZoom: () => void;
  reveal: (
    path: readonly number[],
    align?: 'auto' | 'center' | 'end' | 'start'
  ) => boolean;
  select: (keys: readonly NodeKey[]) => void;
  selectBoard: () => void;
  selectedShapes: () => BoardShapeLayout[];
  setCamera: (camera: BoardCamera) => void;
  setTool: (tool: BoardTool) => void;
  setToolLocked: (locked: boolean) => void;
  shapeAt: (at: BoardPlace, except?: string) => BoardShapeLayout | undefined;
  shapesAlong: (from: BoardPlace, to: BoardPlace) => readonly string[];
  slice: (ids: readonly string[]) => ContentSlice | null;
  state: () => BoardViewState;
  styleFor: (type: string, style: BoardStyle) => BoardStyle;
  toggleSelected: (key: NodeKey) => void;
  undo: () => void;
  voice: Pick<
    BoardVoice,
    | 'aim'
    | 'connecting'
    | 'free'
    | 'hold'
    | 'pick'
    | 'picking'
    | 'quiet'
    | 'release'
    | 'repeatSelection'
    | 'resize'
    | 'resizing'
    | 'starting'
  >;
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
const PICTURE_GAP = 16;

const percentOf = (zoom: number) => Math.round(zoom * 100);

const clampZoom = (zoom: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

const scrollsBy = (
  delta: number,
  overflow: string,
  at: number,
  shown: number,
  total: number
) =>
  (overflow === 'auto' || overflow === 'scroll') &&
  (delta > 0 ? Math.ceil(at + shown) < total : delta < 0 && at > 0);

const toolbarScrollsWith = (host: HTMLElement, event: WheelEvent) => {
  const bar = host.querySelector(':scope > [data-board-toolbar]');
  const { target } = event;

  if (
    !bar ||
    !(target instanceof globalThis.Element) ||
    !bar.contains(target)
  ) {
    return false;
  }

  const vertical = Math.abs(event.deltaY) >= Math.abs(event.deltaX);

  for (
    let at: globalThis.Element | null = target;
    at && at !== bar;
    at = at.parentElement
  ) {
    const { overflowX, overflowY } = getComputedStyle(at);

    if (
      vertical
        ? scrollsBy(
            event.deltaY,
            overflowY,
            at.scrollTop,
            at.clientHeight,
            at.scrollHeight
          )
        : scrollsBy(
            event.deltaX,
            overflowX,
            at.scrollLeft,
            at.clientWidth,
            at.scrollWidth
          )
    ) {
      return true;
    }
  }

  return false;
};

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

const parseStyle: {
  readonly [K in keyof BoardStyle]-?: (value: unknown) => BoardStyle[K];
} = {
  dash: (value) => parseBoardStyle('dash', value),
  fill: (value) => parseBoardStyle('fill', value),
  geo: (value) => (isBoardGeo(value) ? value : undefined),
  opacity: (value) => parseBoardStyle('opacity', value),
  strokeColor: (value) => parseBoardStyle('strokeColor', value),
  strokeWidth: (value) => parseBoardStyle('strokeWidth', value),
  textSize: (value) => parseBoardStyle('textSize', value),
};

const STYLE_KEYS = [...BOARD_STYLE_KEYS, 'geo' as const];

// Under a union key, such as a loop over STYLE_KEYS, TypeScript requires a
// written value to fit every key's type at once (microsoft/TypeScript#30769),
// so each write goes through a helper generic over K. showAs also types its
// target as a mapped type over K, because the full styles map rejects a
// ShownStyle<BoardStyle[K]> write even under a generic K.
const setDefined = <K extends keyof BoardStyle>(
  style: { [P in K]?: BoardStyle[P] },
  key: K,
  value: BoardStyle[K]
) => {
  if (value !== undefined) style[key] = value;
};

const validStyle = (style: BoardStyle) => {
  const valid: { -readonly [K in keyof BoardStyle]?: BoardStyle[K] } = {};

  for (const key of STYLE_KEYS) {
    setDefined(valid, key, parseStyle[key](style[key]));
  }

  return valid;
};

const showAs = <K extends keyof BoardStyle>(
  styles: { [P in K]?: ShownStyle<BoardStyle[P]> },
  key: K,
  shown: ShownStyle<BoardStyle[K]>
) => {
  styles[key] = shown;
};

const TOOL_SHAPES: Readonly<Partial<Record<BoardTool, string>>> = {
  arrow: BaseBoardArrowPlugin.name,
  frame: BaseBoardFramePlugin.name,
  geo: BaseBoardGeoPlugin.name,
  note: BaseBoardNotePlugin.name,
  pen: BaseBoardStrokePlugin.name,
};

const subscribeTo = (listeners: Set<() => void>) => (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const SHAPES_EDITABLE = `[data-editor-content-root-slot="${BOARD_SHAPES_SLOT}"] [data-editor="true"][contenteditable="true"]`;

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
  initialMessages: BoardMessages,
  // The shapes root's editor reads the lock of the view that shows the
  // shapes, which can differ from the page's.
  shapes: RuntimeEditor
) => {
  const keyOf = (node: Descendant) => editor.read((state) => state.key(node));
  const board = keyOf(element);
  const root =
    editor.read.schema.getElementContentRoots(element)[BOARD_SHAPES_SLOT] ?? '';
  const rootView = createEditorView(editor, { root });
  const boards = editor.plugin(BaseBoardPlugin);
  const shownBoards = mounted.plugin(BaseBoardPlugin);

  const writable = () => {
    const authored = readAuthoredView(shapes);

    return (
      !shapes.read.view.isReadOnly() && !(authored && 'preview' in authored)
    );
  };

  let state: BoardViewState = {
    camera: { x: 0, y: 0, zoom: 1 },
    nextStyle: {},
    selectedShapes: [],
    styles: {},
    tool: 'select',
    toolLocked: false,
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

  const takes = (type: string, key: keyof BoardStyle) =>
    key === 'geo'
      ? type === BaseBoardGeoPlugin.name
      : editor.read.schema.property({ key, placement: 'element', type }) !==
        null;

  let storedStylesSchema = editor.read.schema.identity();
  let storedStylesByNode = new WeakMap<
    Element,
    Partial<Record<keyof BoardStyle, unknown>>
  >();
  const storedStylesOf = (node: Element) => {
    const schema = editor.read.schema.identity();

    if (schema !== storedStylesSchema) {
      storedStylesSchema = schema;
      storedStylesByNode = new WeakMap();
    }

    let stored = storedStylesByNode.get(node);

    if (!stored) {
      stored = {};
      for (const key of STYLE_KEYS) {
        if (takes(node.type, key)) {
          stored[key] = editor.read.schema.getProperty(node, key);
        }
      }
      storedStylesByNode.set(node, stored);
    }

    return stored;
  };

  const styleFor = (type: string, style: BoardStyle) => {
    const taken: { -readonly [K in keyof BoardStyle]?: BoardStyle[K] } = {};
    const take = <K extends keyof BoardStyle>(key: K) => {
      if (style[key] !== undefined && takes(type, key)) taken[key] = style[key];
    };

    for (const key of STYLE_KEYS) take(key);

    return taken;
  };

  const styleTargets = (selected: readonly BoardMemberEntry[]) => {
    const edited = editedShape();
    const node = edited ? mounted.read.nodes.get(edited.key)?.[0] : undefined;

    if (
      !edited ||
      !ElementApi.isElement(node) ||
      selected.some(({ id }) => id === edited.id)
    ) {
      return selected;
    }

    return [...selected, { id: edited.id, node }];
  };

  const stylesOf = ({
    nextStyle,
    selectedShapes,
    tool,
  }: BoardViewState): BoardViewState['styles'] => {
    const next = TOOL_SHAPES[tool];
    const targets =
      tool === 'select'
        ? styleTargets(selectedShapes).map(({ node }) => storedStylesOf(node))
        : [];
    const styles: {
      -readonly [K in keyof BoardStyle]?: ShownStyle<BoardStyle[K]>;
    } = {};
    const valuesOf = <K extends keyof BoardStyle>(key: K) => {
      if (!next) {
        return targets.flatMap((stored) =>
          Object.hasOwn(stored, key) ? [parseStyle[key](stored[key])] : []
        );
      }
      if (!takes(next, key)) return [];

      const declared = editor.read.schema.property({
        key,
        placement: 'element',
        type: next,
      });

      return [nextStyle[key] ?? parseStyle[key](declared?.value.default)];
    };
    const show = <K extends keyof BoardStyle>(key: K) => {
      const [first, ...rest] = valuesOf(key).filter(
        (value): value is NonNullable<BoardStyle[K]> => value !== undefined
      );

      if (first === undefined) return;

      showAs(
        styles,
        key,
        rest.every((value) => value === first)
          ? { mixed: false, value: first }
          : { mixed: true }
      );
    };

    for (const key of STYLE_KEYS) show(key);

    return sameValue(styles, state.styles) ? state.styles : styles;
  };

  const publish = (next: BoardViewState) => {
    state = next;
    for (const listener of stateListeners) listener();
  };

  const setState = (next: Partial<Omit<BoardViewState, 'styles'>>) => {
    const merged = { ...state, ...next };

    publish({ ...merged, styles: stylesOf(merged) });
  };

  let shownView = createEditorView(mounted, { root });
  let renderedKeyOf = new Map<NodeKey, NodeKey>();
  const index = createBoardIndex({
    children: () => shownView.read.children(),
    takesText: ({ type }) =>
      editor.read.schema
        .element(type)
        ?.content?.allowedElementTypes.some((childType) => {
          const behavior = editor.read.schema.element(childType)?.behavior;

          return !!behavior && !behavior.object && !behavior.void;
        }) ?? false,
    isEmpty: (block) => editor.read.nodes.isEmpty(block),
    keepsRatio: keepsBoardRatio(editor),
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
    previewCleared: () => {
      for (const listener of shapeListeners) listener();
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

  const viewBox = () => {
    const { x, y, zoom } = state.camera;

    return { height: size.height / zoom, width: size.width / zoom, x, y };
  };

  const refresh = () => {
    const shown = viewBox();
    const found = new Set(
      index
        .search({
          maxX: shown.x + shown.width,
          maxY: shown.y + shown.height,
          minX: shown.x,
          minY: shown.y,
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
    const styles = stylesOf({ ...state, selectedShapes: selected });

    if (
      selected !== state.selectedShapes ||
      canWrite !== state.writable ||
      styles !== state.styles
    ) {
      publish({
        ...state,
        selectedShapes: selected,
        styles,
        writable: canWrite,
      });
    }
  };

  const follow = () => {
    const rendered = renderedKeyOf;

    index.update();
    if (renderedKeyOf !== rendered) refresh();
    interaction?.follow?.();
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
    publish({ ...state, camera });
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

  function reveal(
    path: readonly number[],
    align?: 'auto' | 'center' | 'end' | 'start'
  ) {
    const layout = index.layout(index.entries()[path[0] ?? -1]?.key ?? '');

    if (!layout) return false;

    const { box } = layout;
    const { x, y, zoom } = state.camera;
    const clear =
      align === 'auto'
        ? clearOfToolbar()
        : { bottom: size.height, left: 0, right: size.width, top: 0 };

    if (
      align === 'auto' &&
      box.x >= x + clear.left / zoom &&
      box.y >= y + clear.top / zoom &&
      box.x + box.width <= x + clear.right / zoom &&
      box.y + box.height <= y + clear.bottom / zoom
    ) {
      return true;
    }

    setCamera({
      x: box.x + box.width / 2 - (clear.left + clear.right) / 2 / zoom,
      y: box.y + box.height / 2 - (clear.top + clear.bottom) / 2 / zoom,
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

  const clearOfToolbar = () => {
    const clear = { bottom: size.height, left: 0, right: size.width, top: 0 };
    const toolbar = surface?.querySelector(':scope > [data-board-toolbar]');

    if (!surface || !toolbar) return clear;

    const rect = surface.getBoundingClientRect();
    const edge = {
      x: rect.left + surface.clientLeft,
      y: rect.top + surface.clientTop,
    };

    for (const child of toolbar.children) {
      const dock = child.getAttribute('data-board-dock');
      const box = child.getBoundingClientRect();

      if (dock === 'left' || dock === 'right') {
        const from = box.left - edge.x;
        const to = box.right - edge.x;

        if (to <= 0 || from >= size.width) continue;
        if (dock === 'left') clear.left = Math.max(clear.left, to);
        else clear.right = Math.min(clear.right, from);
        continue;
      }

      const from = box.top - edge.y;
      const to = box.bottom - edge.y;

      if (to <= 0 || from >= size.height) continue;
      if (from + to > size.height) clear.bottom = Math.min(clear.bottom, from);
      else clear.top = Math.max(clear.top, to);
    }

    return clear;
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
    const { height, width, x, y } = viewBox();

    return { x: x + width / 2, y: y + height / 2 };
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
    editing: () => editedShape() !== null,
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
    const along = (from: number, to: number, whole: number, span: number) => {
      const [start, end] =
        (to - from) / (span + 2 * FIT_PADDING) >= MIN_ZOOM
          ? [from, to]
          : [0, whole];

      return {
        center: (start + end) / 2,
        zoom: (end - start) / (span + 2 * FIT_PADDING),
      };
    };
    const clear = clearOfToolbar();
    const horizontal = along(clear.left, clear.right, size.width, maxX - minX);
    const vertical = along(clear.top, clear.bottom, size.height, maxY - minY);
    const zoom = clampZoom(Math.min(1, horizontal.zoom, vertical.zoom));

    setCamera({
      x: (minX + maxX) / 2 - horizontal.center / zoom,
      y: (minY + maxY) / 2 - vertical.center / zoom,
      zoom,
    });
    sayZoomFrom(before);
  };

  const editedKey = () => {
    const range = editor.read.selection();

    if (
      editor.read.selection.nodeMode() !== null ||
      range?.anchor.root !== root
    ) {
      return undefined;
    }

    return rootView.key([range.anchor.path[0]]);
  };

  const editedShape = () => {
    const key = editedKey();

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

  const deselectOnBoard = () => {
    if (!focusTarget.current) return false;
    focusTarget.current.focus({ preventScroll: true });
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

  const focusBoard = () => {
    const edited = editedShape();

    if (edited) select([edited.key]);
    else focusTarget.current?.focus({ preventScroll: true });

    return !!focusTarget.current;
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
    const connectStart =
      interaction?.kind === 'connect' ? interaction.startShape() : undefined;

    if (
      change.kind === 'remove' &&
      connectStart !== undefined &&
      change.ids.includes(connectStart)
    ) {
      cancelInteraction();
    }

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

    const id = write((tx) => {
      const written = insert(tx);
      const holder = written && tx.unique.holder('shapeId', written);

      if (holder) setShapeSelection(tx, [holder.key]);

      return written;
    });
    const inserted = id && boards.read.shape(id);

    if (!inserted) return false;
    if (!state.toolLocked) setState({ tool: 'select' });
    select([inserted.key]);

    return true;
  };

  const placeShape: BoardViewCore['place'] = (
    tool,
    box,
    { style, takesShapes = false }
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

    return insertAndSelect((tx) => {
      if (tool === 'frame') {
        return tx.plugin(BaseBoardFramePlugin).insert(box, { board });
      }
      if (tool === 'note') {
        return tx
          .plugin(BaseBoardNotePlugin)
          .insert(
            { ...box, ...styleFor(BaseBoardNotePlugin.name, style) },
            { board }
          );
      }

      return tx
        .plugin(BaseBoardGeoPlugin)
        .insert(
          { ...box, ...styleFor(BaseBoardGeoPlugin.name, style) },
          { board }
        );
    });
  };

  const selectIds = (ids: readonly string[]) =>
    select(
      ids.flatMap((id) => {
        const shape = boards.read.shape(id);

        return shape ? [shape.key] : [];
      })
    );

  const land = (slice: ContentSlice, place?: BoardPlace) => {
    const ids = write((tx) =>
      tx
        .plugin(BaseBoardPlugin)
        .insertCopy(slice, { board, ...(place ? { place } : {}) })
    );

    if (!ids) return false;
    selectIds(ids);

    return true;
  };

  const pendingPictures = createPendingPictures({ editor, mounted, writable });

  const landPictures = (images: readonly Element[], point: BoardPlace) => {
    if (!surface) return;
    pendingPictures.load(surface, images, (loaded) => {
      const width =
        loaded.reduce((total, { size: box }) => total + box.width, 0) +
        PICTURE_GAP * (loaded.length - 1);
      let x = point.x - width / 2;
      const ids = write((tx) =>
        loaded.flatMap(({ element: image, size: box }) => {
          const id = tx
            .plugin(BaseBoardImagePlugin)
            .insert(
              { children: [image], ...box, x, y: point.y - box.height / 2 },
              { board }
            );

          x += box.width + PICTURE_GAP;

          return id ?? [];
        })
      );

      if (ids) selectIds(ids);
    });
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
    viewBox,
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
    interactionKind: () => interaction?.kind,
    inView: ({ box }) => {
      const shown = viewBox();

      return (
        box.x >= shown.x &&
        box.y >= shown.y &&
        box.x + box.width <= shown.x + shown.width &&
        box.y + box.height <= shown.y + shown.height
      );
    },
    deselectOnBoard,
    land,
    landPictures,
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
      if (
        (interaction?.kind === 'connect' || interaction?.kind === 'draw') &&
        tool !== state.tool
      ) {
        cancelInteraction();
      }
      setState({ tool });
      voice.tool(tool);
    },
    setToolLocked: (locked) => {
      if (locked === state.toolLocked) return;
      setState({ toolLocked: locked });
      voice.toolLock(locked);
    },
    shapeAt: (at, except) => index.shapeAt(at, state.camera.zoom, except),
    shapesAlong: (from, to) => index.shapesAlong(from, to, state.camera.zoom),
    slice: (ids) => boards.read.slice(ids),
    state: () => state,
    styleFor,
    toggleSelected: (key) => {
      const keys = selectedShapes().map((shape) => shape.key);

      select(
        keys.includes(key)
          ? keys.filter((held) => held !== key)
          : [...keys, key]
      );
    },
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
      const zooms = event.ctrlKey || event.metaKey;

      if (!zooms && toolbarScrollsWith(host, event)) return;
      event.preventDefault();
      measure();

      const { camera } = state;

      if (zooms) {
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

    const keys = attachBoardKeys(host, core);

    gestures = attachBoardGestures(host, core, keys.spaceHeld);

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
      keys.detach();
      detachClipboard();
      pendingPictures.cancel();
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
    setStyle: (style) => {
      if (!writable()) return;

      const valid = validStyle(style);

      if (Object.keys(valid).length === 0) return;

      const edited = editedKey();
      const keys = edited ? new Set([edited]) : selectedKeys();
      const picks =
        state.tool === 'select'
          ? boards.read
              .shapes(board)
              .filter(({ key }) => keys.has(key))
              .flatMap(({ id, node }) => {
                const taken = styleFor(node.type, valid);

                return Object.keys(taken).length > 0 ? [{ id, taken }] : [];
              })
          : [];

      if (picks.length > 0) {
        write((tx) => {
          for (const { id, taken } of picks) {
            const key = tx.unique.holder('shapeId', id)?.key;

            if (key) tx.nodes.set(taken, { at: key });
          }
        });
      }
      setState({ nextStyle: { ...state.nextStyle, ...valid } });
    },
    setTool: core.setTool,
    setToolLocked: core.setToolLocked,
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
      let schema = editor.read.schema.identity();
      const unsubscribe = editor.subscribeCommit(({ changed }) => {
        const reshaped =
          changed.hasAny('properties') ||
          changed.hasAny('structure') ||
          changed.hasAny('replace');
        const nextSchema = editor.read.schema.identity();
        const reschemed = nextSchema !== schema;

        schema = nextSchema;
        if (reshaped) follow();
        if (
          reshaped ||
          reschemed ||
          changed.hasAny('selection') ||
          editor.read.selection.nodeMode()
        ) {
          showSelection();
        }
        if (changed.hasAny('selection')) voice.selectionChanged();
      });

      const unsubscribeViewState = subscribeEditorViewState(
        shapes,
        (change) => {
          if (change !== 'readOnly' && change !== 'authored') return;

          gestures?.refuseWrites();
          shownView = createEditorView(mounted, { root });
          follow();
          showSelection();
        }
      );

      follow();
      showSelection();

      return () => {
        unsubscribe();
        unsubscribeViewState();
        pendingPictures.cancel();
      };
    },
    erasing: (id: string) => erasing.has(id),
    focusTarget,
    isCursor: (id: string) =>
      interaction?.kind === 'pick' && interaction.cursor() === id,
    layoutOf: (id: string) => {
      if (!index.byId(id)) index.update();

      return index.shownLayout(id);
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
