import { useEditorRef, useEditorSelector } from '@udecode/plate-common';

import { isTableBorderHidden } from '../../queries/index';
import { useTableStore } from '../../stores/index';
import { getOnSelectTableBorderFactory } from './getOnSelectTableBorderFactory';

export const useTableBordersDropdownMenuContentState = () => {
  const editor = useEditorRef();
  const selectedCells = useTableStore().get.selectedCells();

  const {
    hasBottomBorder,
    hasTopBorder,
    hasLeftBorder,
    hasRightBorder,
    // eslint-disable-next-line @typescript-eslint/no-shadow
  } = useEditorSelector((editor) => ({
    hasBottomBorder: !isTableBorderHidden(editor, 'bottom'),
    hasTopBorder: !isTableBorderHidden(editor, 'top'),
    hasLeftBorder: !isTableBorderHidden(editor, 'left'),
    hasRightBorder: !isTableBorderHidden(editor, 'right'),
  }), []);

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
