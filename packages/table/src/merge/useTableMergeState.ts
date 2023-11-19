import { useMemo } from 'react';
import { isCollapsed, isExpanded, useEditorState } from '@udecode/plate-common';
import { useReadOnly, useSelected } from 'slate-react';

import { getTableGridAbove } from '../queries';
import { useTableStore } from '../stores';
import { isTableRectangular } from './isTableRectangular';

export const useTableMergeState = () => {
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
  }, [editor.selection, selectedTable, readOnly, selected]);

  const canUnmerge =
    collapsed &&
    selectedCellEntries &&
    selectedCellEntries.length === 1 &&
    ((selectedCellEntries[0][0] as any)?.colSpan > 1 ||
      (selectedCellEntries[0][0] as any)?.rowSpan > 1);

  return { canMerge, canUnmerge };
};
