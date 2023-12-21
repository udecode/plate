/* eslint-disable react-hooks/rules-of-hooks */
import {
  getPluginOptions,
  isSelectionExpanded,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common';
import { useReadOnly, useSelected } from 'slate-react';

import { ELEMENT_TABLE } from '../createTablePlugin';
import { getTableGridAbove } from '../queries';
import { getColSpan } from '../queries/getColSpan';
import { getRowSpan } from '../queries/getRowSpan';
import { useTableStore } from '../stores';
import { TablePlugin } from '../types';
import { isTableRectangular } from './isTableRectangular';

export const useTableMergeState = () => {
  const editorRef = useEditorRef();

  const { enableMerging } = getPluginOptions<TablePlugin>(
    editorRef,
    ELEMENT_TABLE
  );

  if (!enableMerging) return { canMerge: false, canUnmerge: false };

  const readOnly = useReadOnly();
  const selected = useSelected();
  const selectionExpanded = useEditorSelector(isSelectionExpanded, []);

  const collapsed = !readOnly && selected && !selectionExpanded;
  const selectedTables = useTableStore().get.selectedTable();
  const selectedTable = selectedTables?.[0];

  const selectedCellEntries = useEditorSelector((editor) =>
    getTableGridAbove(editor, {
      format: 'cell',
    }), []
  );

  const canMerge = !readOnly &&
    selected &&
    selectionExpanded &&
    isTableRectangular(selectedTable);

  const canUnmerge =
    collapsed &&
    selectedCellEntries &&
    selectedCellEntries.length === 1 &&
    (getColSpan(selectedCellEntries[0][0] as any) > 1 ||
      getRowSpan(selectedCellEntries[0][0] as any) > 1);

  return { canMerge, canUnmerge };
};
