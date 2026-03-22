import type { TTableElement } from 'platejs';

import { useEditorPlugin, useEditorSelector, useElement } from 'platejs/react';

import {
  type TableBorderStates,
  getSelectedCellsBorders,
} from '../../../lib/queries/getSelectedCellsBorders';
import { TablePlugin } from '../../TablePlugin';
import { getOnSelectTableBorderFactory } from './getOnSelectTableBorderFactory';

export const useTableBordersDropdownMenuContentState = ({
  element: el,
}: {
  element?: TTableElement;
} = {}) => {
  const { editor } = useEditorPlugin(TablePlugin);
  const element = useElement() ?? el;
  const borderStates = useEditorSelector<TableBorderStates>(
    (editor) => getSelectedCellsBorders(editor),
    [element]
  );

  return {
    getOnSelectTableBorder: getOnSelectTableBorderFactory(editor),
    hasBottomBorder: borderStates.bottom,
    hasLeftBorder: borderStates.left,
    hasNoBorders: borderStates.none,
    hasOuterBorders: borderStates.outer,
    hasRightBorder: borderStates.right,
    hasTopBorder: borderStates.top,
  };
};
