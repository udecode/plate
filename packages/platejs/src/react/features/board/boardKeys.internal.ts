import type * as React from 'react';

import { Hotkeys } from '../../../core';
import type {
  BoardPlace,
  BoardRestackDirection,
} from '../../../features/board/lib';
import { isImeConfirmKeyEvent } from '../../utils/dispatchPlateShortcut.internal';
import type { BoardShapeLayout } from './boardIndex.internal';
import type { BoardTool, BoardViewCore } from './boardView.internal';

const TOOL_KEYS: Readonly<Record<string, BoardTool>> = {
  a: 'arrow',
  f: 'frame',
  n: 'note',
  p: 'pen',
  r: 'geo',
  v: 'select',
};

const ARROWS: Readonly<Record<string, BoardPlace>> = {
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
};

const NUDGE = 1;
const SHIFT_NUDGE = 10;

const RESTACK_KEYS: Readonly<Record<string, BoardRestackDirection>> = {
  '[': 'backward',
  ']': 'forward',
};

/**
 * The board's keys: on selected shapes, on the board's focus target, and on
 * the board block selected in its document. Returns the detach.
 */
export const attachBoardKeys = (host: HTMLElement, core: BoardViewCore) => {
  const { index } = core;

  const selectFirst = () => {
    const [first] = index.entries();

    if (first) core.select([first.key]);

    return !!first;
  };

  const historyKey = (event: KeyboardEvent) => {
    if (Hotkeys.isUndo(event)) core.undo();
    else if (Hotkeys.isRedo(event)) core.redo();
    else return false;

    return true;
  };

  const tab = (shapes: readonly BoardShapeLayout[], backward: boolean) => {
    const entries = index.entries();
    const at = entries.findIndex(
      (entry) => entry.key === (backward ? shapes[0] : shapes.at(-1))?.key
    );
    const next = index.layout(entries[at + (backward ? -1 : 1)]?.key ?? '');

    if (next) {
      if (!core.inView(next)) core.reveal([at + (backward ? -1 : 1)]);
      core.select([next.key]);

      return true;
    }

    return core.leaveBoard(backward);
  };

  const shapeKey = (
    event: KeyboardEvent,
    shapes: readonly BoardShapeLayout[]
  ) => {
    const ids = shapes.map((shape) => shape.id);
    const mod = event.ctrlKey || event.metaKey;
    const arrow = ARROWS[event.key];

    if (event.altKey) return false;
    if (mod && !event.shiftKey && event.key.toLowerCase() === 'a') {
      core.select(index.entries().map((entry) => entry.key));
    } else if (mod && event.shiftKey && arrow?.y) {
      core.commit({
        direction: arrow.y < 0 ? 'front' : 'back',
        ids,
        kind: 'restack',
      });
    } else if (mod) {
      return false;
    } else if (event.key === 'Tab') {
      return tab(shapes, event.shiftKey);
    } else if (event.key === 'Escape') {
      core.selectBoard();
    } else if (arrow) {
      const step = event.shiftKey ? SHIFT_NUDGE : NUDGE;

      core.commit({
        delta: { x: arrow.x * step, y: arrow.y * step },
        ids,
        kind: 'move',
      });
    } else if (TOOL_KEYS[event.key]) {
      core.setTool(TOOL_KEYS[event.key]);
    } else if (RESTACK_KEYS[event.key]) {
      core.commit({ direction: RESTACK_KEYS[event.key], ids, kind: 'restack' });
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      core.commit({ ids, kind: 'remove' });
    } else if (event.key === 'Enter') {
      if (shapes.length === 1 && shapes[0].holdsText && core.writable()) {
        core.edit(shapes[0].key);
      }
    } else if (event.key.length !== 1) {
      return false;
    }

    return true;
  };

  const focusKey = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return false;
    } else if (event.key === 'Enter') {
      return selectFirst();
    } else if (event.key === 'Escape') {
      core.selectBoard();
    } else if (TOOL_KEYS[event.key]) {
      core.setTool(TOOL_KEYS[event.key]);
    } else if (
      // WebKit navigates back on Backspace outside an editable element.
      event.key !== 'Backspace' &&
      event.key !== 'Delete' &&
      event.key.length !== 1
    ) {
      return false;
    }

    return true;
  };

  const boardKey = (event: KeyboardEvent) =>
    event.key === 'Enter' && core.boardSelected() && selectFirst();

  const takes = (
    event: KeyboardEvent,
    selected: readonly BoardShapeLayout[]
  ) => {
    const onTarget = event.target === core.focusTarget.current;

    if (onTarget && historyKey(event)) return true;
    if (selected.length > 0) return shapeKey(event, selected);

    return onTarget && focusKey(event);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!(event.target instanceof Node)) return;
    if (event.key === 'Escape' && core.cancelGesture()) {
      event.preventDefault();
      event.stopPropagation();

      return;
    }
    if (host.contains(event.target)) {
      const selected = core.selectedShapes();
      const edited =
        event.key === 'Escape' && selected.length === 0
          ? core.editedShape()
          : null;

      if (edited) core.select([edited.key]);
      else if (!takes(event, selected)) return;
    } else if (!event.target.contains(host) || !boardKey(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };
  const view = host.ownerDocument.defaultView;

  view?.addEventListener('keydown', onKeyDown, true);

  return () => {
    view?.removeEventListener('keydown', onKeyDown, true);
  };
};

export const takeTextTab = (
  core: BoardViewCore,
  event: React.KeyboardEvent
) => {
  if (
    event.key !== 'Tab' ||
    event.isDefaultPrevented() ||
    isImeConfirmKeyEvent(event.nativeEvent) ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return;
  }

  const edited = core.editedShape();

  if (!edited) return;
  event.preventDefault();
  core.select([edited.key]);
};
