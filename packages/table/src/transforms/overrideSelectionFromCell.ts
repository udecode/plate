import {
  isHotkey,
  isRangeAcrossBlocks,
  isRangeInSameBlock,
  PlateEditor,
  TRange,
  Value,
} from '@udecode/plate-common/server';

import { keyShiftEdges } from '../constants';
import { getCellTypes } from '../utils/index';
import { moveSelectionFromCell } from './index';

/**
 * Override the new selection if the previous selection and the new one are in different cells.
 */
export const overrideSelectionFromCell = <V extends Value = Value>(
  editor: PlateEditor<V>,
  newSelection?: TRange | null
) => {
  let hotkey: string | undefined;

  if (
    !editor.currentKeyboardEvent ||
    !['up', 'down', 'shift+up', 'shift+right', 'shift+down', 'shift+left'].some(
      (key) => {
        const valid = isHotkey(key, editor.currentKeyboardEvent!);
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
  const reverse = ['up', 'shift+up'].includes(hotkey);

  setTimeout(() => {
    moveSelectionFromCell(editor, {
      at: prevSelection,
      reverse,
      edge,
      fromOneCell: true,
    });
  }, 0);
};
