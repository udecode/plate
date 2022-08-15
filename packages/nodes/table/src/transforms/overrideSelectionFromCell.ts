import {
  isRangeAcrossBlocks,
  isRangeInSameBlock,
  PlateEditor,
  TRange,
  Value,
} from '@udecode/plate-core';
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
  if (
    !editor.lastKeyDown ||
    ![
      'up',
      'down',
      'shift+up',
      'shift+right',
      'shift+down',
      'shift+left',
    ].includes(editor.lastKeyDown) ||
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

  const edge = keyShiftEdges[editor.lastKeyDown];

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
  const reverse = ['up', 'shift+up'].includes(editor.lastKeyDown);

  setTimeout(() => {
    moveSelectionFromCell(editor, {
      at: prevSelection,
      reverse,
      edge,
      fromOneCell: true,
    });
  }, 0);
};
