import * as React from 'react';

import {
  type ContentSlice,
  createEditorView,
  type Element,
  ElementApi,
  type Descendant,
  type Node,
  type NodeKey,
  PathApi,
  PLUGINS,
  type PluginTransaction,
  SelectionApi,
} from '../../../core';
import {
  isDocumentView,
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
import { boardTypesOf } from '../../../features/board/lib/boardTypes.internal';
import { getCompiledPlateModelBinding } from '../../../internal/plugin/compilePlateModel';
import { uploadDraftsOf } from '../../../internal/plugin/uploadDrafts';
import type { BasePluginInput } from '../../../lib';
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
import { BOARD_PLACE_SIZE } from './boardPick.internal';
import { createPendingPictures } from './boardPictures.internal';
import { measuredNoteHeight } from './boardPreview.internal';
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
  /**
   * Whether the board lands picture files from `upload`, a paste or a drop,
   * which needs a view that can write, the upload plugin, and an image shape
   * that holds both the upload draft and the image element.
   */
  takesPictureFiles: boolean;
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

/** How `exportPicture` draws the board. */
export type BoardPictureOptions = Readonly<{
  /** `png` draws pixels, and `svg` keeps the shapes as markup. */
  format: 'png' | 'svg';
  /**
   * The static plugins that draw each shape and its content, as
   * `renderStaticHtml`'s `presentation` takes them, or a promise of them, such
   * as a dynamic import. The export reads the selection before it waits for
   * the promise.
   */
  kit: Promise<readonly BasePluginInput[]> | readonly BasePluginInput[];
}>;

/**
 * Something the picture shows differently from the board. `content-undrawn`
 * means the kit has no static drawing for some content, `downscaled` that the
 * PNG is the SVG drawn at less than twice its size, and `font-missing` that a
 * font the text uses could not be read. `image-unreadable` means an image in
 * `shapeId` could not be read and draws as a gray box, or stays a web link in
 * an SVG, and `shape-undrawn` that the kit draws no shape for `shapeId`, so a
 * gray box stands in for it.
 */
export type BoardPictureWarning =
  | Readonly<{ code: 'content-undrawn' | 'downscaled' | 'font-missing' }>
  | Readonly<{ code: 'image-unreadable' | 'shape-undrawn'; shapeId: string }>;

/** A picture of the board, with its size in pixels and what it could not show. */
export type BoardPicture = Readonly<{
  blob: Blob;
  height: number;
  warnings: readonly BoardPictureWarning[];
  width: number;
}>;

export type BoardViewActions = Readonly<{
  /**
   * Draw the board as a picture with `kit`. With shapes selected when it is
   * called, it draws only those and the members of each selected frame. The
   * PNG is the SVG drawn at twice its size, or smaller when that passes 16,384
   * px a side or 16,777,216 px in all. It resolves null when there is nothing
   * to draw, such as on an empty board. It rejects when the board surface is
   * not on the page, or leaves it before the picture is drawn. It loads its
   * drawing code on the first call.
   */
  exportPicture: (options: BoardPictureOptions) => Promise<BoardPicture | null>;
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
  /**
   * Upload each of `files` as an image shape, in a row centered on the view,
   * as one undo step, and select the shapes. The shapes land once the
   * pictures load. A landing that still waits lands nothing after another
   * landing starts, a key or press on the board, any paste, a document or
   * selection change, focus leaving the board, or the view turning read-only.
   * The upload plugin reports a file that is not a picture, and the pictures
   * beside it still land. An empty list changes nothing, and neither does a
   * view whose `takesPictureFiles` is false.
   */
  upload: (files: readonly File[]) => void;
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
  landPictureFiles: (
    files: readonly File[],
    point: BoardPlace,
    refused?: () => void
  ) => void;
  landPictures: (
    images: readonly Element[],
    point: BoardPlace,
    fallbackFiles?: readonly File[]
  ) => void;
  leaveBoard: (backward: boolean) => boolean;
  /** Mark the shapes `ids` as ones the eraser will remove. */
  markErasing: (ids: readonly string[]) => void;
  measure: () => void;
  mounted: Editor;
  pan: (viewFraction: BoardPlace) => void;
  paste: (data: DataTransfer) => boolean;
  pasteNote: (data: DataTransfer, point: BoardPlace) => boolean;
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
  styleFor: (type: string | undefined, style: BoardStyle) => BoardStyle;
  syncNoteHeight: (id: string) => void;
  takesPictureFiles: () => boolean;
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
const FILE_DRAG_EVENTS = ['dragenter', 'dragover', 'drop'] as const;

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

const subscribeTo = (listeners: Set<() => void>) => (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const SHAPES_EDITABLE = `[data-editor-content-root-slot="${BOARD_SHAPES_SLOT}"] [data-editor="true"][contenteditable="true"]`;

// Prepending a private layer keeps both rules below every host CSS layer and
// unlayered stylesheet, and keeps them paired so a strict style-src-elem CSP
// that blocks the sheet still leaves visible shapes and handles clickable.
const SHAPE_POINTER_EVENTS_RULE = `@layer board-shapes { :where([data-editor-content-root-slot="${BOARD_SHAPES_SLOT}"] > [data-editor="true"] > div) { pointer-events: none; } :where([data-board-shape]) { pointer-events: auto; } }`;

const mountedPointerStyles = new WeakMap<
  Document | ShadowRoot,
  { count: number; style: HTMLStyleElement }
>();

const isDocumentRoot = (node: globalThis.Node): node is Document =>
  node.nodeType === 9;

const isShadowRootNode = (node: globalThis.Node): node is ShadowRoot =>
  node.nodeType === 11 && 'host' in node;

const mountPointerStyle = (host: HTMLElement) => {
  const root = host.getRootNode();
  const target = isDocumentRoot(root)
    ? root.head
    : isShadowRootNode(root)
      ? root
      : null;
  const key = isDocumentRoot(root) || isShadowRootNode(root) ? root : null;

  if (!target || !key) {
    const style = host.ownerDocument.createElement('style');

    style.setAttribute('data-board-pointer-events', '');
    style.textContent = SHAPE_POINTER_EVENTS_RULE;
    host.prepend(style);

    return () => {
      style.remove();
    };
  }

  let entry = mountedPointerStyles.get(key);

  if (!entry) {
    const style = host.ownerDocument.createElement('style');

    style.setAttribute('data-board-pointer-events', '');
    style.textContent = SHAPE_POINTER_EVENTS_RULE;
    target.prepend(style);
    entry = { count: 0, style };
    mountedPointerStyles.set(key, entry);
  } else if (!entry.style.isConnected) {
    target.prepend(entry.style);
  }
  entry.count += 1;

  return () => {
    entry.count -= 1;
    if (entry.count === 0) {
      entry.style.remove();
      mountedPointerStyles.delete(key);
    }
  };
};

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
  const root =
    editor.read.schema.getElementContentRoots(element)[BOARD_SHAPES_SLOT] ?? '';
  const shownBoard = mounted.read((state) => state.key(element));
  const ownerBoard = editor.read.roots().find((entry) => entry.root === root)
    ?.owners[0];
  const board =
    ownerBoard &&
    (ownerBoard.root
      ? createEditorView(editor, { root: ownerBoard.root })
      : editor
    ).key(ownerBoard.path);

  if (!board) throw new Error('A board view needs its board in the editor.');

  const rootView = createEditorView(editor, { root });
  const boards = editor.plugin(BaseBoardPlugin);
  const shownBoards = mounted.plugin(BaseBoardPlugin);

  const writable = () => {
    const authored = readAuthoredView(shapes);

    return (
      !shapes.read.view.isReadOnly() && !(authored && 'preview' in authored)
    );
  };

  const takesPictureFiles = () => {
    const image = editor.plugin(BaseBoardImagePlugin);
    const holds =
      (image.installed &&
        editor.read.schema.element(image.schema.type)?.content
          ?.allowedElementTypes) ||
      [];

    return (
      writable() &&
      [PLUGINS.upload, PLUGINS.image].every((name) => {
        const type = getCompiledPlateModelBinding(editor, name)?.elementType;

        return !!type && holds.includes(type);
      })
    );
  };

  let state: BoardViewState = {
    camera: { x: 0, y: 0, zoom: 1 },
    nextStyle: {},
    selectedShapes: [],
    styles: {},
    takesPictureFiles: takesPictureFiles(),
    tool: 'select',
    toolLocked: false,
    writable: writable(),
  };
  const stateListeners = new Set<() => void>();
  const shapeListeners = new Map<string, Set<() => void>>();
  const everyShapeListeners = new Set<() => void>();
  const viewportListeners = new Set<() => void>();
  const erasing = new Set<string>();
  const erasingListeners = new Map<string, Set<() => void>>();

  const listenTo =
    (listeners: Map<string, Set<() => void>>) =>
    (id: string, listener: () => void) => {
      const forId = listeners.get(id) ?? new Set();

      forId.add(listener);
      listeners.set(id, forId);

      return () => {
        forId.delete(listener);
        if (forId.size === 0) listeners.delete(id);
      };
    };

  const notifyErasing = (ids: Iterable<string>) => {
    for (const id of ids) {
      for (const listener of erasingListeners.get(id) ?? []) listener();
    }
  };

  const notifyShapes = (ids?: Iterable<string>) => {
    for (const listener of everyShapeListeners) listener();
    if (!ids) {
      for (const forId of shapeListeners.values()) {
        for (const listener of forId) listener();
      }

      return;
    }
    for (const id of ids) {
      for (const listener of shapeListeners.get(id) ?? []) listener();
    }
  };
  const subscribeShape = listenTo(shapeListeners);

  const types = boardTypesOf(editor);
  const toolShapes: Readonly<
    Partial<Record<BoardTool, () => string | undefined>>
  > = {
    arrow: () => BaseBoardArrowPlugin.name,
    frame: () => BaseBoardFramePlugin.name,
    geo: types.geo,
    note: types.note,
    pen: types.stroke,
  };

  const takes = (type: string, key: keyof BoardStyle) =>
    key === 'geo'
      ? type === types.geo()
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

  const styleFor = (type: string | undefined, style: BoardStyle) => {
    const taken: { -readonly [K in keyof BoardStyle]?: BoardStyle[K] } = {};

    if (type === undefined) return taken;

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
    const next = toolShapes[tool]?.();
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
    types,
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
        .shapes(shownBoard)
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
    previewCleared: (cleared) => {
      const measured = new Map<string, number>();
      const confirmed: string[] = [];

      for (const id of cleared) {
        const target = mountedText.get(id);

        if (!target) continue;

        const { zoom } = state.camera;
        const storedHeight = index.storedBoxOf(id)?.height ?? 0;
        const nextHeight = measuredNoteHeight(target, storedHeight, zoom);
        const current = index.byId(id)?.box.height;

        if (nextHeight !== null) {
          const height =
            current !== undefined && Math.abs(nextHeight - current) <= 1e-6
              ? current
              : nextHeight;

          measured.set(id, height);
        } else {
          const height = target.offsetHeight;

          if (
            height > 0 &&
            (current === undefined || Math.abs(height - current) >= 1)
          ) {
            measured.set(id, height);
          } else if (height > 0) {
            confirmed.push(id);
          }
        }
        if (textObserver && observedText.has(target)) {
          textObserver.unobserve(target);
          textObserver.observe(target, { box: 'border-box' });
        }
      }
      if (confirmed.length > 0) index.confirmMountedHeights(confirmed);

      const changed = measured.size > 0 ? index.measure(measured) : undefined;
      const relaidOut =
        !!changed && (changed.moved.size > 0 || changed.redrawn.size > 0);

      if (relaidOut) shownVersion = index.version();
      notifyShapes();
      if (relaidOut) {
        refresh();
        interaction?.follow?.();
        gestures?.follow();
      }
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
  let pictureHost: HTMLDivElement | null = null;
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
    const takesFiles = takesPictureFiles();
    const styles = stylesOf({ ...state, selectedShapes: selected });

    if (
      selected !== state.selectedShapes ||
      canWrite !== state.writable ||
      takesFiles !== state.takesPictureFiles ||
      styles !== state.styles
    ) {
      publish({
        ...state,
        selectedShapes: selected,
        styles,
        takesPictureFiles: takesFiles,
        writable: canWrite,
      });
    }
  };

  const observedText = new Map<HTMLElement, string>();
  const mountedText = new Map<string, HTMLElement>();
  const pendingConfirm = new Set<string>();
  let textObserver: ResizeObserver | null = null;
  let settleFrame = 0;
  let settleTimer: ReturnType<typeof setTimeout> | null = null;

  const cancelSettle = () => {
    if (settleFrame !== 0) {
      cancelAnimationFrame(settleFrame);
      settleFrame = 0;
    }
    if (settleTimer !== null) {
      clearTimeout(settleTimer);
      settleTimer = null;
    }
  };

  const queueConfirm = (ids: Iterable<string>) => {
    let added = false;

    for (const id of ids) {
      if (
        mountedText.has(id) &&
        index.hasHeight(id) &&
        !index.isPreviewing(id)
      ) {
        pendingConfirm.add(id);
        added = true;
      }
    }
    if (!added || typeof requestAnimationFrame !== 'function') return;
    cancelSettle();
    settleFrame = requestAnimationFrame(() => {
      settleFrame = 0;
      settleTimer = setTimeout(() => {
        settleTimer = null;
        if (frame !== 0 || pendingConfirm.size === 0) return;

        const ready = [...pendingConfirm].filter(
          (id) => mountedText.has(id) && !index.isPreviewing(id)
        );

        pendingConfirm.clear();
        if (ready.length > 0) index.confirmMountedHeights(ready);
      }, 0);
    });
  };

  const verticalWriting = (target: HTMLElement) => {
    const mode =
      target.ownerDocument.defaultView?.getComputedStyle(target).writingMode ||
      target.style.writingMode;

    return mode.startsWith('vertical') || mode.startsWith('sideways');
  };

  const layOutText = (measured: ReadonlyMap<string, number | null>) => {
    const { moved: relaidOut, redrawn } = index.measure(measured);

    if (relaidOut.size === 0 && redrawn.size === 0) return;
    shownVersion = index.version();
    notifyShapes([]);
    refresh();
    interaction?.follow?.();
    gestures?.follow();
  };

  const deliverText = (records: readonly ResizeObserverEntry[]) => {
    const measured = new Map<string, number>();

    for (const record of records) {
      const target = record.target as HTMLElement;
      const id = observedText.get(target);

      if (id === undefined || index.isPreviewing(id)) continue;
      pendingConfirm.delete(id);

      const box = record.borderBoxSize?.[0];
      const height = box
        ? verticalWriting(target)
          ? box.inlineSize
          : box.blockSize
        : target.offsetHeight;

      measured.set(id, height);
    }
    if (measured.size > 0) layOutText(measured);
  };

  const follow = () => {
    const rendered = renderedKeyOf;

    index.update();
    if (renderedKeyOf !== rendered) refresh();
    interaction?.follow?.();
    if (index.version() === shownVersion) return;
    shownVersion = index.version();
    notifyShapes();
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
    if (frame === 0 && pendingConfirm.size > 0) {
      queueConfirm([...pendingConfirm]);
    }
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

  const shownLayoutOf = (node: Node | undefined) =>
    ElementApi.isElement(node) ? index.byId(shapeIdOf(node)) : undefined;

  const selectedNodes = () =>
    editor.read.selection.nodeMode() ? editor.read.selection.nodes() : [];

  const selectedKeys = (): ReadonlySet<NodeKey> =>
    new Set(
      selectedNodes().flatMap(([node]) => shownLayoutOf(node)?.key ?? [])
    );

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

    return (key && shownLayoutOf(editor.read.nodes.get(key)?.[0])) ?? null;
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

  const selectIds = (ids: readonly string[]) => {
    const order = new Map(index.entries().map((entry, at) => [entry.id, at]));
    const sorted = ids.toSorted(
      (a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0)
    );

    deselectOnBoard();
    editor.update((tx) =>
      setShapeSelection(
        tx,
        sorted.flatMap((id) => tx.unique.holder('shapeId', id)?.key ?? [])
      )
    );
  };

  const select = (keys: readonly NodeKey[]) =>
    selectIds(keys.flatMap((key) => index.layout(key)?.id ?? []));

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
    if (!id || !boards.read.shape(id)) return false;
    if (!state.toolLocked) setState({ tool: 'select' });
    selectIds([id]);

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
          .insert({ ...box, ...styleFor(types.note(), style) }, { board });
      }

      return tx
        .plugin(BaseBoardGeoPlugin)
        .insert({ ...box, ...styleFor(types.geo(), style) }, { board });
    });
  };

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

  const pendingPictures = createPendingPictures({ editor, shapes, writable });

  const landRow = (
    tx: PluginTransaction,
    children: readonly Element[],
    sizes: readonly BoardSize[],
    point: BoardPlace
  ) => {
    const width =
      sizes.reduce((total, box) => total + box.width, 0) +
      PICTURE_GAP * (sizes.length - 1);
    let x = point.x - width / 2;

    return children.flatMap((child, at) => {
      const box = sizes[at];
      const id = tx
        .plugin(BaseBoardImagePlugin)
        .insert(
          { children: [child], ...box, x, y: point.y - box.height / 2 },
          { board }
        );

      x += box.width + PICTURE_GAP;

      return id ?? [];
    });
  };

  const landPictureFiles: BoardViewCore['landPictureFiles'] = (
    files,
    point,
    refused
  ) => {
    if (!surface || files.length === 0) return;
    pendingPictures.load(surface, files, (sizes) => {
      const ids = write((tx) => {
        const upload = uploadDraftsOf(tx);
        let taken = files;
        let batch = upload?.admit(taken, { kind: 'image' });

        if (
          batch &&
          'failure' in batch &&
          batch.failure.code === 'unsupported-file-type'
        ) {
          const others = new Set(batch.failure.files);

          taken = files.filter((file) => !others.has(file));
          batch = upload?.admit(taken, { kind: 'image' });
        }
        if (!batch || 'failure' in batch) return [];

        const landed = landRow(
          tx,
          batch.drafts,
          taken.map((file) => sizes[files.indexOf(file)]),
          point
        );

        batch.fill(
          landed.flatMap((id) => {
            const holder = tx.unique.holder('shapeId', id);
            const shape = holder && tx.nodes.get(holder.key)?.[0];
            const draft =
              shape && ElementApi.isElement(shape) && shape.children[0];

            return (draft && tx.key(draft)) || [];
          })
        );

        return landed;
      });

      if (ids && ids.length > 0) selectIds(ids);
      else refused?.();
    });
  };

  const landPictures: BoardViewCore['landPictures'] = (
    images,
    point,
    fallbackFiles = []
  ) => {
    if (!surface) return;
    pendingPictures.load(
      surface,
      images.map(({ url }) => String(url)),
      (sizes, failed) => {
        const landLinks = () => {
          const ids = write((tx) => landRow(tx, images, sizes, point));

          if (ids) selectIds(ids);
        };

        if (failed && fallbackFiles.length > 0) {
          landPictureFiles(fallbackFiles, point, landLinks);
        } else landLinks();
      }
    );
  };

  const paste = (data: DataTransfer) => {
    if (!writable()) return false;

    const keys = selectedShapes().map(({ key }) => key);

    shownView.update((tx) => setShapeSelection(tx, keys));

    return !!shownView.api.dom.clipboard.insertData(data);
  };

  const pasteNote: BoardViewCore['pasteNote'] = (data, point) => {
    const { height, width } = BOARD_PLACE_SIZE.note;

    return insertAndSelect((tx) => {
      const id = tx.plugin(BaseBoardNotePlugin).insert(
        {
          height,
          width,
          x: point.x - width / 2,
          y: point.y - height / 2,
          ...styleFor(types.note(), state.nextStyle),
        },
        { board }
      );
      const holder = id && tx.unique.holder('shapeId', id);
      const shape = holder && tx.nodes.get(holder.key);

      if (shape) {
        const at = { offset: 0, path: [...shape[1], 0, 0], root };

        tx.selection.set({ anchor: at, focus: at });
        shownView.api.dom.clipboard.insertData(data);
      }

      return id;
    });
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
      const id = index.layout(key)?.id;

      if (!id || !boards.read.shape(id)) return;
      focusRoot();
      editor.update((tx) => {
        const owned = tx.unique.holder('shapeId', id)?.key;
        const end = owned && tx.points.end(owned);

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
    landPictureFiles,
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
    pasteNote,
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
    syncNoteHeight: (id) => {
      const target = mountedText.get(id);

      if (!target) return;

      const storedHeight = index.storedBoxOf(id)?.height;
      const current = index.byId(id)?.box.height;

      if (storedHeight === undefined || current === undefined) return;

      const next = measuredNoteHeight(target, storedHeight, state.camera.zoom);

      if (next !== null && Math.abs(next - current) > 1e-6) {
        layOutText(new Map([[id, next]]));
      }
    },
    takesPictureFiles,
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

    const unmountPointerStyle = mountPointerStyle(host);
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

    const onFileDrag = (event: DragEvent) => {
      const data = event.dataTransfer;

      if (
        !data ||
        !Array.from(data.types).includes('Files') ||
        editedShape() ||
        !takesPictureFiles()
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      data.dropEffect = 'copy';
      mounted.api.dom.drag.indicate(null);
      if (event.type !== 'drop') return;
      measure();
      landPictureFiles(
        Array.from(data.files),
        boardPointAt({ x: event.clientX, y: event.clientY })
      );
    };

    const keys = attachBoardKeys(host, core);

    gestures = attachBoardGestures(host, core, keys.spaceHeld);

    const detachClipboard = attachBoardClipboard(host, core);

    host.addEventListener('wheel', onWheel, { passive: false });
    for (const type of FILE_DRAG_EVENTS) {
      host.addEventListener(type, onFileDrag);
    }

    return () => {
      gestures?.detach();
      gestures = null;
      cancelAnimationFrame(frame);
      frame = 0;
      cancelSettle();
      pendingConfirm.clear();
      identityAnimation?.cancel();
      identityAnimation = null;
      layer = null;
      zoomLayer = null;
      surface = null;
      unmountPointerStyle();
      resizeObserver.disconnect();
      textObserver?.disconnect();
      textObserver = null;
      observedText.clear();
      mountedText.clear();
      host.removeEventListener('wheel', onWheel);
      for (const type of FILE_DRAG_EVENTS) {
        host.removeEventListener(type, onFileDrag);
      }
      keys.detach();
      detachClipboard();
      pendingPictures.cancel();
    };
  };

  index.update();
  shownVersion = index.version();
  refresh();

  const actions: BoardViewActions = {
    exportPicture: async ({ format, kit }) => {
      const selected = selectedShapes().map(({ id }) => id);
      const [{ drawBoardPicture }, plugins] = await Promise.all([
        import('./boardExport.internal'),
        kit,
      ]);

      return drawBoardPicture(view, selected, format, plugins);
    },
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
      const ownerKeys = new Set(
        edited ? [edited] : selectedNodes().map(([node]) => keyOf(node))
      );
      const picks =
        state.tool === 'select'
          ? boards.read
              .shapes(board)
              .filter(({ key }) => ownerKeys.has(key))
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
    upload: (files) => {
      if (takesPictureFiles()) landPictureFiles(files, viewCenter());
    },
    zoomIn: core.zoomIn,
    zoomOut: core.zoomOut,
  };

  const view = {
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

      const subscribeRootText = () =>
        shownView.subscribeCommit(({ changed }) => {
          const reshaped =
            changed.hasAny('properties') ||
            changed.hasAny('structure') ||
            changed.hasAny('replace');

          if (
            (!reshaped && !changed.has('text', root)) ||
            !index.hasHeights()
          ) {
            return;
          }

          const nodes = shownView.read.children();
          const stale = new Map<string, null>();
          const confirmIds: string[] = [];

          for (const [start, end] of changed.topLevelRanges(root)) {
            for (let at = start; at <= end; at += 1) {
              const node = nodes[at];

              if (!ElementApi.isElement(node)) continue;

              const id = shapeIdOf(node);

              if (!reshaped && index.isStaleStamp(id)) stale.set(id, null);
              if (mountedText.has(id) && index.hasHeight(id)) {
                confirmIds.push(id);
              }
            }
          }
          if (stale.size > 0) layOutText(stale);
          if (confirmIds.length > 0) queueConfirm(confirmIds);
        });

      let unsubscribeRootText = subscribeRootText();

      const unsubscribeViewState = subscribeEditorViewState(
        shapes,
        (change) => {
          if (change !== 'readOnly' && change !== 'authored') return;

          gestures?.refuseWrites();
          unsubscribeRootText();
          shownView = createEditorView(mounted, { root });
          unsubscribeRootText = subscribeRootText();
          if (change === 'authored') index.dropUnmountedHeights();
          follow();
          queueConfirm(mountedText.keys());
          showSelection();
        }
      );

      follow();
      showSelection();

      return () => {
        cancelSettle();
        pendingConfirm.clear();
        unsubscribe();
        unsubscribeRootText();
        unsubscribeViewState();
        pendingPictures.cancel();
      };
    },
    dropText: (id: string) => layOutText(new Map([[id, null]])),
    erasing: (id: string) => erasing.has(id),
    focusTarget,
    isCursor: (id: string) =>
      interaction?.kind === 'pick' && interaction.cursor() === id,
    layoutOf: (id: string) => {
      if (!index.byId(id)) index.update();

      return index.shownLayout(id);
    },
    observeText: (id: string, target: HTMLElement) => {
      const Observer =
        target.ownerDocument.defaultView?.ResizeObserver ?? ResizeObserver;

      textObserver ??= new Observer(deliverText);
      observedText.set(target, id);
      mountedText.set(id, target);
      index.clearStamp(id);
      textObserver.observe(target, { box: 'border-box' });

      return () => {
        textObserver?.unobserve(target);
        observedText.delete(target);
        if (mountedText.get(id) === target) {
          mountedText.delete(id);
          pendingConfirm.delete(id);
          if (!index.stampHeight(id)) layOutText(new Map([[id, null]]));
        }
      };
    },
    placementOf: (id: string) => {
      if (!index.byId(id)) index.update();

      return index.placementOf(id);
    },
    holdPictureHost: (host: HTMLDivElement | null) => {
      pictureHost = host;
    },
    pictureSource: (selected: readonly string[]) => {
      const host = pictureHost;

      if (!host?.isConnected) return null;
      index.update();

      const picked = new Set(selected);

      for (const id of selected) {
        for (const member of index.membersOf(id) ?? []) picked.add(member);
      }

      const authored = isDocumentView(editor)
        ? undefined
        : readAuthoredView(shapes);

      return {
        editor,
        host,
        layouts: [...index.layouts()]
          .filter(({ id }) => selected.length === 0 || picked.has(id))
          .sort((a, b) => a.rank - b.rank),
        projection:
          authored &&
          ('preview' in authored ? authored.preview : ('proposed' as const)),
        root,
      };
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
      const stopShape = subscribeShape(id, listener);

      return () => {
        stop();
        stopShape();
      };
    },
    subscribeErasing: listenTo(erasingListeners),
    subscribeShape,
    subscribeShapes: subscribeTo(everyShapeListeners),
    subscribeViewport: subscribeTo(viewportListeners),
    takeTextTab: (event: React.KeyboardEvent) => takeTextTab(core, event),
    viewport: () => viewport,
  };

  return view;
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
