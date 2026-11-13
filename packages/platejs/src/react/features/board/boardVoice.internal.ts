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
  /** The board's accessible name, which its shapes' content root carries. */
  label: string;
  /**
   * Called when the selection becomes one shape, with its 1-based place in
   * stored order among the board's shapes.
   */
  shape: (
    shape: BoardShapeDescription,
    at: Readonly<{ position: number; total: number }>
  ) => string;
  /** Called when the selection becomes `count` shapes, more than one. */
  shapes: (count: number) => string;
  /** Called when a tool is picked, by its key or from the toolbar. */
  tool: (tool: BoardTool) => string;
  /**
   * Called when a removal lands, with the number of shapes it took off the
   * board, a removed frame's members included. The selection it clears says
   * nothing.
   */
  removed: (count: number) => string;
}>;

type BoardUtterance =
  | Readonly<{ kind: 'removed'; count: number }>
  | Readonly<{ kind: 'selection' }>
  | Readonly<{ kind: 'tool'; tool: BoardTool }>;

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
  editor,
  index,
  members,
  messages,
  selectedShapes,
  surface,
}: Readonly<{
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

  const words = (utterance: BoardUtterance) => {
    const said = messages();

    if (utterance.kind === 'removed') return said.removed(utterance.count);
    if (utterance.kind === 'tool') return said.tool(utterance.tool);

    const shapes = selectedShapes();

    if (shapes.length > 1) return said.shapes(shapes.length);

    const entries = members();
    const at = entries.findIndex(({ key }) => key === shapes[0]?.key);

    return at === -1
      ? ''
      : said.shape(describe(entries[at], entries), {
          position: at + 1,
          total: entries.length,
        });
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
    pending = utterance;
  };

  return {
    hold: () => {
      owed = pending;
      pending = null;
    },
    release: () => {
      if (owed) say(owed);
      owed = null;
    },
    removed: (count: number) => {
      if (count > 0) say({ count, kind: 'removed' });
    },
    selectionChanged: () => {
      const next = selectedShapes().map(({ key }) => key);

      if (sameKeys(next, selection)) return;
      selection = next;
      owed = null;
      say({ kind: 'selection' });
    },
    tool: (tool: BoardTool) => say({ kind: 'tool', tool }),
  };
};

export type BoardVoice = ReturnType<typeof createBoardVoice>;
