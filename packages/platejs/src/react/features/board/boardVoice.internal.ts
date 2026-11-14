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
  type BoardMemberEntry,
} from '../../../features/board/lib';
import { BOARD_FRAME_TYPE } from '../../../features/board/lib/boardFrame.internal';
import type { Editor } from '../../core';
import type { BoardIndex, BoardShapeLayout } from './boardIndex.internal';
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
 * Every word a board says. The view whose surface holds focus puts one
 * message per action into the editor's status region, read from the latest
 * `messages` it rendered with. A member that returns an empty string says
 * nothing.
 */
export type BoardMessages = Readonly<{
  /**
   * Called with `shape` and its 1-based place in stored order among the
   * board's shapes when Tab, Shift+Tab or Mod with an arrow aims a connect at
   * it, and again when Mod with an arrow finds no shape that way.
   */
  aim: (
    shape: BoardShapeDescription,
    at: Readonly<{ position: number; total: number }>
  ) => string;
  /**
   * Called when Enter with the arrow tool starts connecting `from`, the one
   * selected shape, to another shape. Until the connect aims at a shape, Enter
   * and an aim key that finds no shape call it again.
   */
  connecting: (from: BoardShapeDescription) => string;
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
}>;

type BoardUtterance =
  | Readonly<{ kind: 'aim' | 'connecting'; key: NodeKey }>
  | Readonly<{ kind: 'quiet' | 'repeatSelection' | 'selection' }>
  | Readonly<{ kind: 'removed'; count: number }>
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
    if (utterance.kind === 'aim') return shapeWords(utterance.key, said.aim);
    if (utterance.kind === 'connecting') {
      return shapeWords(utterance.key, said.connecting);
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
    aim: (key: NodeKey) => say({ key, kind: 'aim' }),
    connecting: (key: NodeKey) => say({ key, kind: 'connecting' }),
    hold: (owesSelection = false) => {
      owed = owesSelection ? { kind: 'selection' } : pending;
      pending = null;
    },
    release: () => {
      if (owed) say(owed);
      owed = null;
    },
    removed: (count: number) =>
      say(count > 0 ? { count, kind: 'removed' } : { kind: 'quiet' }),
    repeatSelection: () => say({ kind: 'repeatSelection' }),
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
