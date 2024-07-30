import { Hotkeys, type KeyboardHandler } from '@udecode/plate-common';
import {
  type KeyboardHandlerReturnType,
  type TElement,
  getAboveNode,
  isHotkey,
  select,
} from '@udecode/plate-common/server';

import type { TablePluginOptions } from './types';

import { keyShiftEdges } from './constants';
import {
  getNextTableCell,
  getPreviousTableCell,
  getTableEntries,
} from './queries/index';
import { moveSelectionFromCell } from './transforms/index';

export const onKeyDownTable: KeyboardHandler<TablePluginOptions> =
  (editor, { type }): KeyboardHandlerReturnType =>
  (e) => {
    if (e.defaultPrevented) return;

    const isKeyDown: any = {
      'shift+down': isHotkey('shift+down', e),
      'shift+left': isHotkey('shift+left', e),
      'shift+right': isHotkey('shift+right', e),
      'shift+up': isHotkey('shift+up', e),
    };

    Object.keys(isKeyDown).forEach((key) => {
      if (
        isKeyDown[key] && // if many cells are selected
        moveSelectionFromCell(editor, {
          edge: (keyShiftEdges as any)[key],
          reverse: key === 'shift+up',
        })
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    const isTab = Hotkeys.isTab(editor, e);
    const isUntab = Hotkeys.isUntab(editor, e);

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

      e.preventDefault();
      e.stopPropagation();
    }
    if (isHotkey('mod+a', e)) {
      const res = getAboveNode<TElement>(editor, { match: { type } });

      if (!res) return;

      const [, tablePath] = res;

      // select the whole table
      select(editor, tablePath);

      e.preventDefault();
      e.stopPropagation();
    }
  };
