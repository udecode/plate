import {
  type TElement,
  collapseSelection,
  getAboveNode,
  getNodeEntries,
  isExpanded,
  isHotkey,
  select,
} from '@udecode/plate-common';
import { type KeyboardHandler, Hotkeys } from '@udecode/plate-common/react';

import {
  type TableConfig,
  KEY_SHIFT_EDGES,
  getCellTypes,
  getNextTableCell,
  getPreviousTableCell,
  getTableEntries,
  moveSelectionFromCell,
} from '../lib';

export const onKeyDownTable: KeyboardHandler<TableConfig> = ({
  editor,
  event,
  type,
}) => {
  if (event.defaultPrevented) return;

  const compositeKeyCode = 229;

  if (
    // This exception only occurs when IME composition is triggered, and can be identified by this keycode
    event.which === compositeKeyCode &&
    editor.selection &&
    isExpanded(editor.selection)
  ) {
    // fix the exception of inputting Chinese when selecting multiple cells
    const tdEntries = Array.from(
      getNodeEntries(editor, {
        at: editor.selection,
        match: { type: getCellTypes(editor) },
      })
    );

    if (tdEntries.length > 1) {
      collapseSelection(editor, {
        edge: 'end',
      });

      return;
    }
  }

  const isKeyDown: any = {
    'shift+down': isHotkey('shift+down', event),
    'shift+left': isHotkey('shift+left', event),
    'shift+right': isHotkey('shift+right', event),
    'shift+up': isHotkey('shift+up', event),
  };

  Object.keys(isKeyDown).forEach((key) => {
    if (
      isKeyDown[key] && // if many cells are selected
      moveSelectionFromCell(editor, {
        edge: (KEY_SHIFT_EDGES as any)[key],
        reverse: key === 'shift+up',
      })
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  const isTab = Hotkeys.isTab(editor, event);
  const isUntab = Hotkeys.isUntab(editor, event);

  if (isTab || isUntab) {
    const entries = getTableEntries(editor);

    if (!entries) return;

    const { cell, row } = entries;
    const [, cellPath] = cell;

    if (isUntab) {
      // move left with shift+tab
      const previousCell = getPreviousTableCell(editor, cell, cellPath, row);

      if (previousCell) {
        const [, previousCellPath] = previousCell;
        select(editor, previousCellPath);
      }
    } else if (isTab) {
      // move right with tab
      const nextCell = getNextTableCell(editor, cell, cellPath, row);

      if (nextCell) {
        const [, nextCellPath] = nextCell;
        select(editor, nextCellPath);
      }
    }

    event.preventDefault();
    event.stopPropagation();
  }
  if (isHotkey('mod+a', event)) {
    const res = getAboveNode<TElement>(editor, { match: { type } });

    if (!res) return;

    const [, tablePath] = res;

    // select the whole table
    select(editor, tablePath);

    event.preventDefault();
    event.stopPropagation();
  }
};
