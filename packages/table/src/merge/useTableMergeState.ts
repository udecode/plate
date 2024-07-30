/* eslint-disable react-hooks/rules-of-hooks */
import { useEditorRef, useEditorSelector } from '@udecode/plate-common';
import {
  getPluginOptions,
  isSelectionExpanded,
} from '@udecode/plate-common/server';
import { useReadOnly, useSelected } from 'slate-react';

import type { TTableCellElement, TablePluginOptions } from '../types';

import { ELEMENT_TABLE } from '../TablePlugin';
import { getTableGridAbove } from '../queries';
import { getColSpan } from '../queries/getColSpan';
import { getRowSpan } from '../queries/getRowSpan';
import { useTableStore } from '../stores';
import { isTableRectangular } from './isTableRectangular';

export const useTableMergeState = () => {
  const editorRef = useEditorRef();

  const { enableMerging } = getPluginOptions<TablePluginOptions>(
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

  const selectedCellEntries = useEditorSelector(
    (editor) =>
      getTableGridAbove(editor, {
        format: 'cell',
      }),
    []
  );

  if (!selectedCellEntries) return { canMerge: false, canUnmerge: false };

  const canMerge =
    !readOnly &&
    selected &&
    selectionExpanded &&
    selectedCellEntries.length > 1 &&
    isTableRectangular(selectedTable);

  const canUnmerge =
    collapsed &&
    selectedCellEntries.length === 1 &&
    (getColSpan(selectedCellEntries[0][0] as TTableCellElement) > 1 ||
      getRowSpan(selectedCellEntries[0][0] as TTableCellElement) > 1);

  return { canMerge, canUnmerge };
};
