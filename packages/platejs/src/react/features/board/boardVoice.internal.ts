import {
  type Element,
  type NodeKey,
  NodeApi,
  screenReaderAnnouncementEffect,
} from '../../../core';
import {
  BaseBoardFramePlugin,
  BaseBoardGeoPlugin,
  BaseBoardNotePlugin,
  BaseBoardStrokePlugin,
  type BoardArrowAnchor,
  type BoardArrowSide,
  type BoardMemberEntry,
  type BoardPlace,
} from '../../../features/board/lib';
import { BOARD_FRAME_TYPE } from '../../../features/board/lib/boardFrame.internal';
import type { Editor } from '../../core';
import type {
  BoardCorner,
  BoardIndex,
  BoardShapeLayout,
} from './boardIndex.internal';
import type { BoardTool } from './boardView.internal';

/**
 * A board shape as the board's words describe it. `kind` comes from the
 * shape's type, and any shape type the board does not ship reads `shape`.
 * `text` is the shape's top-level blocks' text joined with a space, or a
 * frame's name. An arrow's `ends` describe the shapes its two ends attach to,
 * or `null` for a free end.
 */
export type BoardShapeDescription =
  | Readonly<{
      kind: 'arrow';
      text: string;
      ends: Readonly<{
        start: BoardShapeDescription | null;
        end: BoardShapeDescription | null;
      }>;
    }>
  | Readonly<{
      kind: 'frame' | 'geo' | 'note' | 'shape' | 'stroke';
      text: string;
    }>;

/**
 * Where picking stands when the board says `pick` or `picking`: whether the
 * shape under the cursor is `selected`, how many shapes are selected
 * (`count`), and that shape's 1-based `position` in stored order among the
 * board's `total` shapes.
 */
export type BoardPickState = Readonly<{
  count: number;
  position: number;
  selected: boolean;
  total: number;
}>;

/**
 * Every word a board says. The view whose surface holds focus puts one
 * message per action into the editor's status region, read from the latest
 * `messages` it rendered with. A member that returns an empty string says
 * nothing.
 */
export type BoardMessages = Readonly<{
  /**
   * Called with `shape` and its 1-based place in stored order among the
   * board's shapes when the connect end the keys move binds to it: when Tab,
   * Shift+Tab or Mod with an arrow aims that end at its middle, when an arrow
   * key moves the end into it or within it, and again when Mod with an arrow
   * finds no shape that way.
   * `anchor` is where the end sits in the shape's box, in whole percents
   * `across` from its left edge and `down` from its top, so its middle is 50
   * and 50. `side` is the arrow end the keys move: `start` while an arrow
   * begun with nothing selected places its start, and `end` once Enter keeps
   * the start or when the arrow starts from a selected shape.
   */
  aim: (
    shape: BoardShapeDescription,
    at: Readonly<{
      anchor: Readonly<{ across: number; down: number }>;
      position: number;
      side: BoardArrowSide;
      total: number;
    }>
  ) => string;
  /**
   * Called when Enter with the arrow tool starts connecting from `from`, the
   * one selected shape, and when Enter keeps the start of an arrow begun with
   * nothing selected, with `from` as the shape that start binds to, or `null`
   * for a start on no shape. While the keys place the end and the connect
   * has none, before an arrow key or an aim key places one and after the
   * shape it binds to is removed, Enter and an aim key that finds no shape
   * call it again. Enter also calls
   * it again, and writes no arrow, when the arrow would draw with no length,
   * as with the end back at the start's point.
   */
  connecting: (from: BoardShapeDescription | null) => string;
  /**
   * Called when an arrow key moves the connect end the keys move onto no
   * shape it can bind to, with the board point it sits at in whole units,
   * and again when Tab or Shift+Tab finds no shape to aim at, or Mod with an
   * arrow finds no shape that way from there. `side` is the arrow end the
   * keys move, as `aim` says.
   */
  free: (place: BoardPlace, end: Readonly<{ side: BoardArrowSide }>) => string;
  /**
   * The board's accessible name, which its focus target and its shapes'
   * content root carry.
   */
  label: string;
  /**
   * The focus target's description, which a screen reader says when the
   * target takes focus.
   */
  instructions: string;
  /**
   * Called at each key of picking that Space started: when Tab, Shift+Tab or
   * Mod with an arrow moves the cursor to `shape`, again when Mod with an
   * arrow finds no shape that way, and when Space adds the cursor's shape to
   * the selection or takes it out.
   */
  pick: (shape: BoardShapeDescription, state: BoardPickState) => string;
  /**
   * Called when Space goes down and comes up on the focus target of a board
   * with shapes, with no modifier, no other key or pointer press between and
   * no picking, connect, gesture or resize running, which starts picking in
   * any view, a read-only one included. `shape` is the cursor's first shape,
   * the first selected one in stored order or else the first one. Tab and
   * Shift+Tab then move the cursor through every shape in stored order and
   * wrap, Mod with an arrow moves it to the nearest shape that way, and Space
   * adds the cursor's shape to the selection or takes it out, each leaving the
   * rest of the selection as it is and calling `pick`. Enter, Escape, a
   * pointer press, focus leaving the board, the cursor's shape going away and
   * any other board key end picking and keep the selection, and every end but
   * focus leaving, a pointer press and a key that says something of its own
   * calls `shape` or `shapes` again.
   */
  picking: (shape: BoardShapeDescription, state: BoardPickState) => string;
  /**
   * Called when the selection becomes one shape, with its 1-based place in
   * stored order among the board's shapes.
   */
  shape: (
    shape: BoardShapeDescription,
    at: Readonly<{ position: number; total: number }>
  ) => string;
  /**
   * Called when the selection becomes `count` shapes, more than one, and
   * with 0 when the board says the selection again while no shape is
   * selected, such as after an Enter that adds nothing.
   */
  shapes: (count: number) => string;
  /**
   * Called when Enter with the arrow tool and nothing selected, in a view
   * that can write, starts an arrow at `place`, the view's center in whole
   * units. The start binds to the shape under that point as an arrow key
   * move binds it, and sits free where that move would bind it to no shape.
   * `from` is the shape the start binds to, or `null` for a free start.
   * The arrow keys and the aim keys then move the start, as they move a
   * connect's end, and Enter keeps it and calls `connecting`.
   */
  starting: (
    place: BoardPlace,
    start: Readonly<{ from: BoardShapeDescription | null }>
  ) => string;
  /** Called when a tool is picked, by its key or from the toolbar. */
  tool: (tool: BoardTool) => string;
  /**
   * Called when a zoom key, `zoomIn`, `zoomOut`, `resetZoom` or `fit` changes
   * the view's zoom, with the new zoom in whole percent. A zoom with the wheel
   * says nothing.
   */
  zoom: (percent: number) => string;
  /**
   * Called when a removal lands, with the number of shapes it took off the
   * board, a removed frame's members included. The selection it clears says
   * nothing.
   */
  removed: (count: number) => string;
  /**
   * Called at each key of a resize that S started: when Tab or Shift+Tab
   * moves it to another corner, and when an arrow key moves the corner. It
   * gets the corner the keys move and the size of the box it shows, in whole
   * units.
   */
  resize: (
    size: Readonly<{ corner: BoardCorner; height: number; width: number }>
  ) => string;
  /**
   * Called when S, with one shape selected that is not an arrow, in a view
   * that can write, starts resizing `shape` from its bottom-right corner, with
   * its size in whole units. Tab then moves to the next corner clockwise and
   * Shift+Tab to the one before, an arrow key moves the corner by 1 unit, or
   * 10 with Shift, down to 8 units a side, and each calls `resize`. Enter
   * writes the box when it changed and Escape puts it back. Enter, Escape and
   * every other end of the resize but focus leaving and a pointer press call
   * `shape` again, unless the end says something of its own.
   */
  resizing: (
    shape: BoardShapeDescription,
    size: Readonly<{ corner: BoardCorner; height: number; width: number }>
  ) => string;
}>;

type ResizeSize = Readonly<{
  corner: BoardCorner;
  height: number;
  width: number;
}>;

type BoardUtterance =
  | Readonly<{
      kind: 'aim';
      anchor: BoardArrowAnchor;
      key: NodeKey;
      side: BoardArrowSide;
    }>
  | Readonly<{ kind: 'connecting'; key: NodeKey | null }>
  | Readonly<{ kind: 'free'; at: BoardPlace; side: BoardArrowSide }>
  | Readonly<{ kind: 'pick' | 'picking'; key: NodeKey }>
  | Readonly<{ kind: 'starting'; at: BoardPlace; key: NodeKey | null }>
  | Readonly<{ kind: 'quiet' | 'repeatSelection' | 'selection' }>
  | Readonly<{ kind: 'removed'; count: number }>
  | Readonly<{ kind: 'resize'; size: ResizeSize }>
  | Readonly<{ kind: 'resizing'; key: NodeKey; size: ResizeSize }>
  | Readonly<{ kind: 'tool'; tool: BoardTool }>
  | Readonly<{ kind: 'zoom'; percent: number }>;

const KINDS: ReadonlyMap<
  string,
  Exclude<BoardShapeDescription['kind'], 'arrow'>
> = new Map([
  [BaseBoardFramePlugin.name, 'frame'],
  [BaseBoardGeoPlugin.name, 'geo'],
  [BaseBoardNotePlugin.name, 'note'],
  [BaseBoardStrokePlugin.name, 'stroke'],
]);

const textOf = (node: Element) => {
  if (node.type === BOARD_FRAME_TYPE) {
    return typeof node.name === 'string' ? node.name : '';
  }

  return node.children
    .map((child) => NodeApi.string(child))
    .filter(Boolean)
    .join(' ');
};

export const activeElementOf = (host: HTMLElement) =>
  (host.getRootNode() as Document | ShadowRoot).activeElement;

const inWholeUnits = ({ corner, height, width }: ResizeSize) => ({
  corner,
  height: Math.round(height),
  width: Math.round(width),
});

const sameKeys = (a: readonly NodeKey[], b: readonly NodeKey[]) =>
  a.length === b.length && a.every((key, at) => key === b[at]);

export const createBoardVoice = ({
  editing,
  editor,
  index,
  members,
  messages,
  selectedShapes,
  surface,
}: Readonly<{
  editing: () => boolean;
  editor: Editor;
  index: BoardIndex;
  members: () => readonly BoardMemberEntry[];
  messages: () => BoardMessages;
  selectedShapes: () => readonly BoardShapeLayout[];
  surface: () => HTMLElement | null;
}>) => {
  let owed: BoardUtterance | null = null;
  let pending: BoardUtterance | null = null;
  let selection: readonly NodeKey[] = [];

  const describe = (
    entry: BoardMemberEntry,
    entries: readonly BoardMemberEntry[]
  ): BoardShapeDescription => {
    const text = textOf(entry.node);

    if (entry.kind !== 'arrow') {
      return { kind: KINDS.get(entry.node.type) ?? 'shape', text };
    }

    const endOf = (side: 'end' | 'start') => {
      const shape = index.drawnTo(entry[side]);
      const target =
        shape === undefined
          ? undefined
          : entries.find(({ id }) => id === shape);

      return target ? describe(target, entries) : null;
    };

    return {
      ends: { end: endOf('end'), start: endOf('start') },
      kind: 'arrow',
      text,
    };
  };

  const shapeWords = (
    key: NodeKey | undefined,
    say: BoardMessages['shape']
  ): string => {
    const entries = members();
    const at = entries.findIndex((entry) => entry.key === key);

    return at === -1
      ? ''
      : say(describe(entries[at], entries), {
          position: at + 1,
          total: entries.length,
        });
  };

  const words = (utterance: BoardUtterance) => {
    const said = messages();

    if (utterance.kind === 'quiet') return '';
    if (utterance.kind === 'removed') return said.removed(utterance.count);
    if (utterance.kind === 'tool') return said.tool(utterance.tool);
    if (utterance.kind === 'zoom') return said.zoom(utterance.percent);
    if (utterance.kind === 'resize') {
      return said.resize(inWholeUnits(utterance.size));
    }
    if (utterance.kind === 'resizing') {
      const size = inWholeUnits(utterance.size);

      return shapeWords(utterance.key, (shape) => said.resizing(shape, size));
    }
    if (utterance.kind === 'aim') {
      const [across, down] = utterance.anchor;
      const anchor = {
        across: Math.round(across * 100),
        down: Math.round(down * 100),
      };

      return shapeWords(utterance.key, (shape, at) =>
        said.aim(shape, { ...at, anchor, side: utterance.side })
      );
    }
    if (utterance.kind === 'free') {
      return said.free(
        { x: Math.round(utterance.at.x), y: Math.round(utterance.at.y) },
        { side: utterance.side }
      );
    }
    if (utterance.kind === 'starting') {
      const { at, key } = utterance;

      return key === null
        ? said.starting(at, { from: null })
        : shapeWords(key, (from) => said.starting(at, { from }));
    }
    if (utterance.kind === 'pick' || utterance.kind === 'picking') {
      const { key, kind } = utterance;
      const selected = selectedShapes();
      const state = {
        count: selected.length,
        selected: selected.some((shape) => shape.key === key),
      };

      return shapeWords(key, (shape, at) =>
        said[kind](shape, { ...at, ...state })
      );
    }
    if (utterance.kind === 'connecting') {
      return utterance.key === null
        ? said.connecting(null)
        : shapeWords(utterance.key, said.connecting);
    }

    const shapes = selectedShapes();

    if (shapes.length > 1) return said.shapes(shapes.length);
    if (shapes.length === 0 && utterance.kind === 'repeatSelection') {
      return editing() ? '' : said.shapes(0);
    }

    return shapeWords(shapes[0]?.key, said.shape);
  };

  const flush = () => {
    const utterance = pending;
    const host = surface();

    pending = null;
    if (!utterance || !host?.contains(activeElementOf(host))) return;

    const text = words(utterance);

    if (text) {
      editor.update((tx) =>
        tx.effects.emit(screenReaderAnnouncementEffect, text)
      );
    }
  };

  const say = (utterance: BoardUtterance) => {
    if (!pending) queueMicrotask(flush);
    if (utterance.kind !== 'selection' || pending?.kind !== 'repeatSelection') {
      pending = utterance;
    }
  };

  return {
    aim: (key: NodeKey, anchor: BoardArrowAnchor, side: BoardArrowSide) =>
      say({ anchor, key, kind: 'aim', side }),
    connecting: (key: NodeKey | null) => say({ key, kind: 'connecting' }),
    free: (at: BoardPlace, side: BoardArrowSide) =>
      say({ at, kind: 'free', side }),
    hold: (owesSelection = false) => {
      owed = owesSelection ? { kind: 'selection' } : pending;
      pending = null;
    },
    release: () => {
      if (owed) say(owed);
      owed = null;
    },
    pick: (key: NodeKey) => say({ key, kind: 'pick' }),
    picking: (key: NodeKey) => say({ key, kind: 'picking' }),
    quiet: () => say({ kind: 'quiet' }),
    removed: (count: number) =>
      say(count > 0 ? { count, kind: 'removed' } : { kind: 'quiet' }),
    repeatSelection: () => say({ kind: 'repeatSelection' }),
    resize: (size: ResizeSize) => say({ kind: 'resize', size }),
    resizing: (key: NodeKey, size: ResizeSize) =>
      say({ key, kind: 'resizing', size }),
    starting: (at: BoardPlace, key: NodeKey | null) =>
      say({ at, key, kind: 'starting' }),
    selectionChanged: () => {
      const next = selectedShapes().map(({ key }) => key);

      if (sameKeys(next, selection)) return;
      selection = next;
      owed = null;
      say({ kind: 'selection' });
    },
    tool: (tool: BoardTool) => say({ kind: 'tool', tool }),
    zoom: (percent: number) => say({ kind: 'zoom', percent }),
  };
};

export type BoardVoice = ReturnType<typeof createBoardVoice>;
