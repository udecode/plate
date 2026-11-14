import type * as React from 'react';

import { Hotkeys } from '../../../core';
import { usesAppleDOMHotkeys } from '../../../dom/plite-dom.internal';
import type {
  BoardPlace,
  BoardRestackDirection,
  BoardSize,
} from '../../../features/board/lib';
import { isImeConfirmKeyEvent } from '../../utils/dispatchPlateShortcut.internal';
import { attachBoardConnect } from './boardConnect.internal';
import type { BoardBox, BoardShapeLayout } from './boardIndex.internal';
import {
  BOARD_PLACE_SIZE,
  freePointFrom,
  frontmostAround,
  pickInDirection,
} from './boardPick.internal';
import type {
  BoardPlaceTool,
  BoardTool,
  BoardViewCore,
} from './boardView.internal';

const TOOL_KEYS: Readonly<Record<string, BoardTool>> = {
  a: 'arrow',
  e: 'eraser',
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

const PLACE_GAP = 24;

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
  const connect = attachBoardConnect(host, core);

  const inThisBoard = (element: Element) =>
    element.closest('[data-board]') === host;

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

  const endConnectOnHistoryKey = (event: KeyboardEvent) => {
    const history = Hotkeys.isUndo(event) || Hotkeys.isRedo(event);

    if (history && connect.active()) core.cancelInteraction();

    return history;
  };

  // Shift+Tab leaves the toolbar here instead of through the browser, because
  // Firefox moves focus before a roving-focus toolbar takes its own container
  // out of the Tab order, and the container sends focus back to the control.
  const toolbarKey = (
    event: KeyboardEvent,
    target: Element,
    bar: HTMLElement
  ) => {
    if (endConnectOnHistoryKey(event)) return false;
    if (event.key === 'Escape') {
      const popup = target.closest(OPEN_POPUP);

      if (popup && bar.contains(popup)) return false;
      if (event.repeat) return true;
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

  const stepOut = (event: KeyboardEvent) => {
    if (event.repeat) return;
    if (core.state().tool === 'select') core.selectBoard();
    else core.setTool('select');
  };

  const historyKey = (event: KeyboardEvent) => {
    if (!endConnectOnHistoryKey(event)) return false;
    if (Hotkeys.isUndo(event)) core.undo();
    else core.redo();

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

  const pick = (
    first: BoardShapeLayout | undefined,
    direction: BoardPlace,
    layouts: readonly BoardShapeLayout[]
  ) => {
    const start = first?.box ?? { height: 0, width: 0, ...core.viewCenter() };

    return (
      pickInDirection(layouts, start, direction) ??
      (first
        ? undefined
        : (core.shapeAt(start) ?? frontmostAround(layouts, start)))
    );
  };

  const pickSelection = (
    shapes: readonly BoardShapeLayout[],
    direction: BoardPlace
  ) => {
    const entries = index.entries();
    const [first] = shapes;
    const own = first && entries.find(({ key }) => key === first.key);
    const frame = own?.kind === 'shape' ? own.frame : undefined;
    const next = pick(
      first,
      direction,
      entries.flatMap(({ id, key }) =>
        id === frame ? [] : (index.layout(key) ?? [])
      )
    );

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

  const spanOfShapes = (shapes: readonly BoardShapeLayout[]) => {
    if (shapes.length === 0) return undefined;

    let left = Number.POSITIVE_INFINITY;
    let top = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;
    let bottom = Number.NEGATIVE_INFINITY;

    for (const { box } of shapes) {
      left = Math.min(left, box.x);
      top = Math.min(top, box.y);
      right = Math.max(right, box.x + box.width);
      bottom = Math.max(bottom, box.y + box.height);
    }

    return { height: bottom - top, width: right - left, x: left, y: top };
  };

  const centeredOnView = (size: BoardSize): BoardBox => {
    const center = core.viewCenter();

    return {
      height: size.height,
      width: size.width,
      x: center.x - size.width / 2,
      y: center.y - size.height / 2,
    };
  };

  const placeBeside = (
    tool: Exclude<BoardPlaceTool, 'frame'>,
    around?: BoardBox
  ) => {
    const size = BOARD_PLACE_SIZE[tool];
    const start = around
      ? { x: around.x + around.width + PLACE_GAP, y: around.y }
      : centeredOnView(size);
    const point = freePointFrom(start, size, index.entries());

    return !!point && core.place(tool, { ...point, ...size });
  };

  const placeFrame = (around?: BoardBox) =>
    around
      ? core.place(
          'frame',
          {
            height: around.height + 2 * PLACE_GAP,
            width: around.width + 2 * PLACE_GAP,
            x: around.x - PLACE_GAP,
            y: around.y - PLACE_GAP,
          },
          { takesShapes: true }
        )
      : core.place('frame', centeredOnView(BOARD_PLACE_SIZE.frame));

  const placeWith = (tool: BoardPlaceTool) => {
    core.cancelInteraction();

    const around = spanOfShapes(core.selectedShapes());
    const placed =
      tool === 'frame' ? placeFrame(around) : placeBeside(tool, around);

    if (!placed) {
      core.voice.repeatSelection();

      return;
    }

    const [shape] = core.selectedShapes();

    if (shape && !core.inView(shape)) {
      core.reveal([index.entries().findIndex(({ key }) => key === shape.key)]);
    }
  };

  const placeKey = (event: KeyboardEvent) => {
    const { tool } = core.state();

    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      !plainKey(event) ||
      (tool !== 'frame' && tool !== 'geo' && tool !== 'note') ||
      !core.writable()
    ) {
      return false;
    }
    if (!event.repeat) placeWith(tool);

    return true;
  };

  const aimInOrder = (backward: boolean) => {
    const candidates = connect.candidates();
    const order = new Map(index.entries().map(({ key }, at) => [key, at]));
    const orderOf = (layout: BoardShapeLayout | undefined) =>
      (layout && order.get(layout.key)) ?? -1;
    const at = orderOf(connect.aimFrom());
    const next = backward
      ? (candidates.findLast((layout) => orderOf(layout) < at) ??
        candidates.at(-1))
      : (candidates.find((layout) => orderOf(layout) > at) ?? candidates[0]);

    if (next) connect.aimAt(next);
    else connect.sayAim();
  };

  const connectKey = (
    event: KeyboardEvent,
    selected: readonly BoardShapeLayout[]
  ) => {
    const arrow = ARROWS[event.key];
    const enter = event.key === 'Enter' && !event.shiftKey && plainKey(event);

    if (connect.active()) {
      if (event.key === 'Tab' && plainKey(event)) {
        aimInOrder(event.shiftKey);
      } else if (arrow && pickKey(event)) {
        const next = pick(connect.aimFrom(), arrow, connect.candidates());

        if (next) connect.aimAt(next);
        else connect.sayAim();
      } else if (enter) {
        if (!event.repeat) connect.finish();
      } else return false;

      return true;
    }
    if (!enter || core.state().tool !== 'arrow' || !core.writable()) {
      return false;
    }
    if (selected.length > 1) {
      if (!event.repeat) core.voice.repeatSelection();

      return true;
    }

    const [from] = selected;

    if (!from || from.kind === 'arrow') return false;
    if (!event.repeat) connect.start(from);

    return true;
  };

  // Shift with 0 or 1 types another character on many layouts, such as = for
  // Shift+0 on a German one, so those two read the physical key. A Swiss
  // layout types + only with Shift+1, so a + there zooms in.
  const cameraKey = (event: KeyboardEvent) => {
    if (!plainKey(event)) return false;
    if (event.shiftKey && event.code === 'Digit0') core.resetZoom();
    else if (event.shiftKey && event.code === 'Digit1' && event.key !== '+') {
      core.fit();
    } else if (event.key === '=' || event.key === '+') core.zoomIn();
    else if (event.key === '-') core.zoomOut();
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
      stepOut(event);
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
      if (
        !event.repeat &&
        shapes.length === 1 &&
        shapes[0].holdsText &&
        core.writable()
      ) {
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
      stepOut(event);
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
    event.key === 'Enter' &&
    plainKey(event) &&
    core.boardSelected() &&
    (selectFirst() || core.deselectOnBoard());

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
      return event.repeat || focusToolbar();
    }

    if (
      (onTarget || selected.length > 0) &&
      (placeKey(event) || connectKey(event, selected))
    ) {
      return true;
    }

    const arrow = ARROWS[event.key];

    if ((onTarget || selected.length > 0) && arrow && pickKey(event)) {
      return pickSelection(selected, arrow);
    }
    if ((onTarget || selected.length > 0) && cameraKey(event)) return true;
    if (selected.length > 0) return shapeKey(event, selected);

    return onTarget && focusKey(event);
  };

  const boardTakes = (event: KeyboardEvent, target: Element) => {
    if (!host.contains(target)) return target.contains(host) && boardKey(event);
    if (!inThisBoard(target)) return false;
    if (event.key === 'Escape' && selectEdited()) return true;

    return takes(event, core.selectedShapes());
  };

  const keyTaken = (event: KeyboardEvent, target: Element) => {
    const bar = target.closest<HTMLElement>('[data-board-toolbar]');

    if (bar && inThisBoard(bar)) return toolbarKey(event, target, bar);
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
    connect.detach();
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
