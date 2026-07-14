import type { KeyboardHandler } from '@platejs/core/react';
import type { WithAnyKey } from '@platejs/core';

import { Hotkeys } from '@platejs/core';

import {
  type TableConfig,
  getCellTypes,
  KEY_SHIFT_EDGES,
  moveLineTable,
  moveSelectionFromCell,
  selectAllTable,
  tabTable,
} from '../lib';
import {
  getTableMoveSelectionContext,
  hasAdjacentBlockInCell,
  shouldMoveSelectionFromCell,
} from '../lib/transforms/shouldMoveSelectionFromCell';

const shouldMoveSingleCellSelection = (
  editor: Parameters<KeyboardHandler<WithAnyKey<TableConfig>>>[0]['editor'],
  key: keyof typeof KEY_SHIFT_EDGES
) => {
  const context = getTableMoveSelectionContext(
    editor,
    editor.read.selection()?.focus
  );

  if (!context) return false;

  const { blockPath, cellPath, point } = context;

  if (key === 'shift+left') {
    return editor.read.points.isStart(point, cellPath);
  }

  if (key === 'shift+right') {
    return editor.read.points.isEnd(point, cellPath);
  }

  if (
    hasAdjacentBlockInCell(editor, {
      blockPath,
      cellPath,
      reverse: key === 'shift+up',
    })
  ) {
    return false;
  }

  return shouldMoveSelectionFromCell(editor, {
    blockPath,
    point,
    reverse: key === 'shift+up',
  });
};

export const onKeyDownTable: KeyboardHandler<WithAnyKey<TableConfig>> = ({
  editor,
  event,
}) => {
  if (event.defaultPrevented) return;

  const compositeKeyCode = 229;

  if (
    // This exception only occurs when IME composition is triggered, and can be identified by this keycode
    event.which === compositeKeyCode &&
    editor.read.selection() &&
    editor.read.selection.isExpanded()
  ) {
    // fix the exception of inputting Chinese when selecting multiple cells
    const tdEntries = Array.from(
      editor.read.nodes.entries({
        at: editor.read.selection()!,
        match: { type: getCellTypes(editor) },
      })
    );

    if (tdEntries.length > 1) {
      editor.update.selection.collapse({
        edge: 'end',
      });

      return;
    }
  }

  const isKeyDown = {
    'shift+down': Hotkeys.isExtendDownward(event),
    'shift+left': Hotkeys.isExtendBackward(event),
    'shift+right': Hotkeys.isExtendForward(event),
    'shift+up': Hotkeys.isExtendUpward(event),
  };

  (Object.keys(isKeyDown) as (keyof typeof isKeyDown)[]).forEach((key) => {
    if (!isKeyDown[key]) return;

    const handled =
      moveSelectionFromCell(editor, {
        edge: KEY_SHIFT_EDGES[key],
        reverse: key === 'shift+up',
      }) ||
      (shouldMoveSingleCellSelection(editor, key) &&
        moveSelectionFromCell(editor, {
          at: editor.read.selection()!,
          edge: KEY_SHIFT_EDGES[key],
          fromOneCell: true,
          reverse: key === 'shift+up',
        }));

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  const handled = Hotkeys.isMoveLineBackward(event)
    ? moveLineTable(editor, { reverse: true })
    : Hotkeys.isMoveLineForward(event)
      ? moveLineTable(editor, { reverse: false })
      : Hotkeys.isUntab(editor, event)
        ? tabTable(editor, { reverse: true })
        : Hotkeys.isTab(editor, event)
          ? tabTable(editor)
          : Hotkeys.isSelectAll(event)
            ? selectAllTable(editor)
            : false;

  if (handled) {
    event.preventDefault();
    event.stopPropagation();
  }
};
