import {
  useEditorRef,
  useEditorSelector,
  useElement,
} from '@udecode/plate/react';

import type { TTableElement } from '../../../lib';

import {
  type TableBorderStates,
  getSelectedCellsBorders,
} from '../../../lib/queries/getSelectedCellsBorders';
import { useTableStore } from '../../stores';
import { getOnSelectTableBorderFactory } from './getOnSelectTableBorderFactory';

export const useTableBordersDropdownMenuContentState = ({
  element: el,
}: {
  element?: TTableElement;
} = {}) => {
  const editor = useEditorRef();
  const element = useElement() ?? el;
  const selectedCells = useTableStore().useSelectedCellsValue();
  const borderStates = useEditorSelector<TableBorderStates>(
    (editor) => getSelectedCellsBorders(editor, selectedCells),
    [selectedCells, element]
  );

  return {
    getOnSelectTableBorder: getOnSelectTableBorderFactory(
      editor,
      selectedCells
    ),
    hasBottomBorder: borderStates.bottom,
    hasLeftBorder: borderStates.left,
    hasNoBorders: borderStates.none,
    hasOuterBorders: borderStates.outer,
    hasRightBorder: borderStates.right,
    hasTopBorder: borderStates.top,
  };
};
