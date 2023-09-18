import { useEditorState } from '@udecode/plate-common';

import { isTableBorderHidden } from '../../queries/index';
import { useTableStore } from '../../stores/index';
import { getOnSelectTableBorderFactory } from './getOnSelectTableBorderFactory';

export const useTableBordersDropdownMenuContentState = () => {
  const editor = useEditorState();
  const selectedCells = useTableStore().get.selectedCells();

  const hasBottomBorder = !isTableBorderHidden(editor, 'bottom');
  const hasTopBorder = !isTableBorderHidden(editor, 'top');
  const hasLeftBorder = !isTableBorderHidden(editor, 'left');
  const hasRightBorder = !isTableBorderHidden(editor, 'right');

  const hasOuterBorders =
    hasBottomBorder && hasTopBorder && hasLeftBorder && hasRightBorder;
  const hasNoBorders =
    !hasBottomBorder && !hasTopBorder && !hasLeftBorder && !hasRightBorder;

  return {
    hasBottomBorder,
    hasTopBorder,
    hasLeftBorder,
    hasRightBorder,
    hasNoBorders,
    hasOuterBorders,
    getOnSelectTableBorder: getOnSelectTableBorderFactory(
      editor,
      selectedCells
    ),
  };
};
