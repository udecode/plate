import type * as React from 'react';

import { Hotkeys } from '../../../core';
import { usesAppleDOMHotkeys } from '../../../dom/plite-dom.internal';
import type {
  BoardPlace,
  BoardRestackDirection,
} from '../../../features/board/lib';
import { isImeConfirmKeyEvent } from '../../utils/dispatchPlateShortcut.internal';
import type { BoardShapeLayout } from './boardIndex.internal';
import { frontmostAround, pickInDirection } from './boardPick.internal';
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

const TOOLBAR_CONTROLS =
  'a[href], button, input:not([type="hidden"]), select, textarea';

const OPEN_POPUP =
  '[aria-expanded="true"], [popover], [role="dialog"], [role="listbox"], [role="menu"], dialog';

const TEXT_INPUT_TYPES: ReadonlySet<string> = new Set([
  'email',
  'number',
  'password',
  'search',
  'tel',
  'text',
  'url',
]);

const isTextField = (target: Element) =>
  target.localName === 'textarea' ||
  (target.localName === 'input' &&
    TEXT_INPUT_TYPES.has((target as HTMLInputElement).type)) ||
  ('isContentEditable' in target && target.isContentEditable === true);

const plainKey = (event: KeyboardEvent) =>
  !event.altKey && !event.ctrlKey && !event.metaKey;

const pickKey = (event: KeyboardEvent) =>
  !event.altKey &&
  !event.shiftKey &&
  (usesAppleDOMHotkeys(event) ? event.metaKey : event.ctrlKey);

export const attachBoardKeys = (host: HTMLElement, core: BoardViewCore) => {
  const { index } = core;

  const toolbar = () =>
    host.querySelector<HTMLElement>(':scope > [data-board-toolbar]');

  const toolbarControls = () =>
    [
      ...(toolbar()?.querySelectorAll<HTMLElement>(TOOLBAR_CONTROLS) ?? []),
    ].filter(
      (control) => !control.matches(':disabled, [aria-disabled="true"]')
    );

  const focusToolbar = () => {
    const [first] = toolbarControls();

    first?.focus();

    return !!first;
  };

  const selectEdited = () => {
    const edited = core.editedShape();

    if (edited) core.select([edited.key]);

    return !!edited;
  };

  const returnToBoard = () => selectEdited() || core.focusBoard();

  // Shift+Tab leaves the toolbar here instead of through the browser, because
  // Firefox moves focus before a roving-focus toolbar takes its own container
  // out of the Tab order, and the container sends focus back to the control.
  const toolbarKey = (
    event: KeyboardEvent,
    target: Element,
    bar: HTMLElement
  ) => {
    if (event.key === 'Escape') {
      const popup = target.closest(OPEN_POPUP);

      if (popup && bar.contains(popup)) return false;
      core.cancelInteraction();

      return returnToBoard();
    }
    if (event.key !== 'Tab' || !event.shiftKey || !plainKey(event)) {
      return false;
    }

    return (
      !toolbarControls().some(
        (control) =>
          control !== target &&
          control.tabIndex >= 0 &&
          control.compareDocumentPosition(target) &
            control.DOCUMENT_POSITION_FOLLOWING
      ) && returnToBoard()
    );
  };

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

  const pick = (shapes: readonly BoardShapeLayout[], direction: BoardPlace) => {
    const entries = index.entries();
    const [first] = shapes;
    const own = first && entries.find(({ key }) => key === first.key);
    const frame = own?.kind === 'shape' ? own.frame : undefined;
    const layouts = entries.flatMap(({ id, key }) =>
      id === frame ? [] : (index.layout(key) ?? [])
    );
    const start = first?.box ?? { height: 0, width: 0, ...core.viewCenter() };
    const next =
      pickInDirection(layouts, start, direction) ??
      (first
        ? undefined
        : (core.shapeAt(start) ?? frontmostAround(layouts, start)));

    if (!next) {
      core.voice.repeatSelection();

      return true;
    }
    if (!core.inView(next)) {
      core.reveal([entries.findIndex(({ key }) => key === next.key)]);
    }
    core.select([next.key]);

    return true;
  };

  // Shift with 0 or 1 types another character on many layouts, such as = for
  // Shift+0 on a German one, so those two read the physical key. A Swiss
  // layout types + only with Shift+1, so a + there zooms in.
  const cameraKey = (event: KeyboardEvent) => {
    if (!plainKey(event)) return false;
    if (event.shiftKey && event.code === 'Digit0') core.zoomTo(1);
    else if (event.shiftKey && event.code === 'Digit1' && event.key !== '+') {
      core.fit();
    } else if (event.key === '=' || event.key === '+') core.zoomStep(1);
    else if (event.key === '-') core.zoomStep(-1);
    else if (event.key === 'PageDown' || event.key === 'PageUp') {
      const page = event.key === 'PageDown' ? 0.8 : -0.8;

      core.pan(event.shiftKey ? { x: page, y: 0 } : { x: 0, y: page });
    } else return false;

    return true;
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
    if (
      (onTarget || selected.length > 0) &&
      event.key === 'Enter' &&
      event.shiftKey &&
      plainKey(event)
    ) {
      return focusToolbar();
    }

    const arrow = ARROWS[event.key];

    if ((onTarget || selected.length > 0) && arrow && pickKey(event)) {
      return pick(selected, arrow);
    }
    if ((onTarget || selected.length > 0) && cameraKey(event)) return true;
    if (selected.length > 0) return shapeKey(event, selected);

    return onTarget && focusKey(event);
  };

  const boardTakes = (event: KeyboardEvent, target: Element) => {
    if (!host.contains(target)) return target.contains(host) && boardKey(event);
    if (event.key === 'Escape' && selectEdited()) return true;

    return takes(event, core.selectedShapes());
  };

  const keyTaken = (event: KeyboardEvent, target: Element) => {
    const bar = target.closest<HTMLElement>('[data-board-toolbar]');

    if (bar?.parentElement === host) return toolbarKey(event, target, bar);
    if (event.key === 'Escape' && core.cancelInteraction()) return true;

    return !bar && boardTakes(event, target);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const { target } = event;

    if (!(target instanceof Element) || !keyTaken(event, target)) return;
    event.preventDefault();
    event.stopPropagation();
  };
  const view = host.ownerDocument.defaultView;

  view?.addEventListener('keydown', onKeyDown, true);

  return () => {
    view?.removeEventListener('keydown', onKeyDown, true);
  };
};

// Outside a text field, Chrome on macOS goes Back on Command with Left and
// Forward on Command with Right. The toolbar wrapper runs this after the
// control's own handler, because a control such as a Radix menu trigger, which
// opens on Mod with Down, skips a key that is already prevented.
export const keepToolbarArrowFromBrowser = (event: React.KeyboardEvent) => {
  if (
    ARROWS[event.key] &&
    pickKey(event.nativeEvent) &&
    event.target instanceof Element &&
    !isTextField(event.target)
  ) {
    event.preventDefault();
  }
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
