/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo } from 'react';
import {
  getPluginOptions,
  isCollapsed,
  isExpanded,
  useEditorRef,
  useEditorState,
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

  const editor = useEditorState();

  const readOnly = useReadOnly();
  const selected = useSelected();

  const collapsed = !readOnly && selected && isCollapsed(editor.selection);
  const selectedTables = useTableStore().get.selectedTable();
  const selectedTable = selectedTables?.[0];

  const selectedCellEntries = useMemo(
    () =>
      getTableGridAbove(editor, {
        format: 'cell',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor.selection]
  );

  const canMerge = useMemo(() => {
    return (
      !readOnly &&
      selected &&
      isExpanded(editor.selection) &&
      isTableRectangular(selectedTable)
    );
  }, [readOnly, selected, editor.selection, selectedTable]);

  const canUnmerge =
    collapsed &&
    selectedCellEntries &&
    selectedCellEntries.length === 1 &&
    (getColSpan(selectedCellEntries[0][0] as any) > 1 ||
      getRowSpan(selectedCellEntries[0][0] as any) > 1);

  return { canMerge, canUnmerge };
};
