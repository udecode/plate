import { useMemo } from 'react';
import { isCollapsed, isExpanded, useEditorState } from '@udecode/plate-common';
import { useReadOnly, useSelected } from 'slate-react';

import { useTableStore } from '../stores';
import { isTableRectangular } from './isTableRectangular';

export const useTableMergeState = () => {
  const editor = useEditorState();

  const readOnly = useReadOnly();
  const selected = useSelected();

  const collapsed = !readOnly && selected && isCollapsed(editor.selection);
  const selectedCells = useTableStore().get.selectedCells();
  const selectedTables = useTableStore().get.selectedTable();
  const selectedTable = selectedTables?.[0];

  const canMerge = useMemo(() => {
    return (
      !readOnly &&
      selected &&
      isExpanded(editor.selection) &&
      isTableRectangular(selectedTable)
    );
  }, [editor.selection, selectedTable, readOnly, selected]);

  const canUnmerge =
    collapsed &&
    selectedCells &&
    selectedCells.length === 1 &&
    ((selectedCells[0] as any)?.colSpan > 1 ||
      (selectedCells[0] as any)?.rowSpan > 1);

  return { canMerge, canUnmerge };
};
