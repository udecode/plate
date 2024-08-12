import { useEditorRef, useEditorSelector } from '@udecode/plate-common/react';

import { isTableBorderHidden } from '../../queries/index';
import { useTableStore } from '../../stores/index';
import { getOnSelectTableBorderFactory } from './getOnSelectTableBorderFactory';

export const useTableBordersDropdownMenuContentState = () => {
  const editor = useEditorRef();
  const selectedCells = useTableStore().get.selectedCells();

  /* eslint-disable @typescript-eslint/no-shadow */
  const hasBottomBorder = useEditorSelector(
    (editor) => !isTableBorderHidden(editor, 'bottom'),
    []
  );
  const hasTopBorder = useEditorSelector(
    (editor) => !isTableBorderHidden(editor, 'top'),
    []
  );
  const hasLeftBorder = useEditorSelector(
    (editor) => !isTableBorderHidden(editor, 'left'),
    []
  );
  const hasRightBorder = useEditorSelector(
    (editor) => !isTableBorderHidden(editor, 'right'),
    []
  );
  /* eslint-enable @typescript-eslint/no-shadow */

  const hasOuterBorders =
    hasBottomBorder && hasTopBorder && hasLeftBorder && hasRightBorder;
  const hasNoBorders =
    !hasBottomBorder && !hasTopBorder && !hasLeftBorder && !hasRightBorder;

  return {
    getOnSelectTableBorder: getOnSelectTableBorderFactory(
      editor,
      selectedCells
    ),
    hasBottomBorder,
    hasLeftBorder,
    hasNoBorders,
    hasOuterBorders,
    hasRightBorder,
    hasTopBorder,
  };
};
