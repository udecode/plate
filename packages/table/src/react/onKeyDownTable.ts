import type { KeyboardHandler } from 'platejs/react';

import { Hotkeys } from 'platejs';

import {
  type TableConfig,
  getCellTypes,
  KEY_SHIFT_EDGES,
  moveSelectionFromCell,
} from '../lib';
import {
  getTableMoveSelectionContext,
  hasAdjacentBlockInCell,
  shouldMoveSelectionFromCell,
} from '../lib/transforms/shouldMoveSelectionFromCell';

const shouldMoveSingleCellSelection = (
  editor: Parameters<KeyboardHandler<TableConfig>>[0]['editor'],
  key: keyof typeof KEY_SHIFT_EDGES
) => {
  const context = getTableMoveSelectionContext(editor, editor.selection?.focus);

  if (!context) return false;

  const { blockPath, cellPath, point } = context;

  if (key === 'shift+left') {
    return editor.api.isStart(point, cellPath);
  }

  if (key === 'shift+right') {
    return editor.api.isEnd(point, cellPath);
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

export const onKeyDownTable: KeyboardHandler<TableConfig> = ({
  editor,
  event,
}) => {
  if (event.defaultPrevented) return;

  const compositeKeyCode = 229;

  if (
    // This exception only occurs when IME composition is triggered, and can be identified by this keycode
    event.which === compositeKeyCode &&
    editor.selection &&
    editor.api.isExpanded()
  ) {
    // fix the exception of inputting Chinese when selecting multiple cells
    const tdEntries = Array.from(
      editor.api.nodes({
        at: editor.selection,
        match: { type: getCellTypes(editor) },
      })
    );

    if (tdEntries.length > 1) {
      editor.tf.collapse({
        edge: 'end',
      });

      return;
    }
  }

  const isKeyDown: any = {
    'shift+down': Hotkeys.isExtendDownward(event),
    'shift+left': Hotkeys.isExtendBackward(event),
    'shift+right': Hotkeys.isExtendForward(event),
    'shift+up': Hotkeys.isExtendUpward(event),
  };

  Object.keys(isKeyDown).forEach((key) => {
    if (!isKeyDown[key]) return;

    const handled =
      moveSelectionFromCell(editor, {
        edge: (KEY_SHIFT_EDGES as any)[key],
        reverse: key === 'shift+up',
      }) ||
      (shouldMoveSingleCellSelection(
        editor,
        key as keyof typeof KEY_SHIFT_EDGES
      ) &&
        moveSelectionFromCell(editor, {
          at: editor.selection!,
          edge: (KEY_SHIFT_EDGES as any)[key],
          fromOneCell: true,
          reverse: key === 'shift+up',
        }));

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
};
