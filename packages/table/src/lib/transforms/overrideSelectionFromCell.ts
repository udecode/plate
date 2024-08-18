import {
  type SlateEditor,
  type TRange,
  isHotkey,
  isRangeAcrossBlocks,
  isRangeInSameBlock,
} from '@udecode/plate-common';

import { keyShiftEdges } from '../../react';
import { getCellTypes } from '../utils/index';
import { moveSelectionFromCell } from './index';

/**
 * Override the new selection if the previous selection and the new one are in
 * different cells.
 */
export const overrideSelectionFromCell = (
  editor: SlateEditor,
  newSelection?: TRange | null
) => {
  let hotkey: string | undefined;

  if (
    !editor.currentKeyboardEvent ||
    !['up', 'down', 'shift+up', 'shift+right', 'shift+down', 'shift+left'].some(
      (key) => {
        const valid = isHotkey(key, editor.currentKeyboardEvent as any);

        if (valid) hotkey = key;

        return valid;
      }
    ) ||
    !editor.selection?.focus ||
    !newSelection?.focus ||
    !isRangeAcrossBlocks(editor, {
      at: {
        anchor: editor.selection.focus,
        focus: newSelection.focus,
      },
      match: { type: getCellTypes(editor) },
    })
  ) {
    return;
  }
  if (!hotkey) return;

  const edge = (keyShiftEdges as any)[hotkey];

  // if the previous selection was in many cells, return
  if (
    edge &&
    !isRangeInSameBlock(editor, {
      at: editor.selection,
      match: { type: getCellTypes(editor) },
    })
  ) {
    return;
  }

  const prevSelection = editor.selection;
  const reverse = ['shift+up', 'up'].includes(hotkey);

  setTimeout(() => {
    moveSelectionFromCell(editor, {
      at: prevSelection,
      edge,
      fromOneCell: true,
      reverse,
    });
  }, 0);
};
