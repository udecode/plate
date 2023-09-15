import { useEffect } from 'react';
import { usePlateEditorRef } from '@udecode/plate-common';
import { useReadOnly, useSelected } from 'slate-react';

import { getTableGridAbove } from '../../queries/index';
import { useTableStore } from '../../stores/tableStore';

/**
 * Many grid cells above and diff -> set
 * No many grid cells above and diff -> unset
 * No selection -> unset
 */
export const useSelectedCells = () => {
  const readOnly = useReadOnly();
  const selected = useSelected();
  const editor = usePlateEditorRef();

  const [selectedCells, setSelectedCells] = useTableStore().use.selectedCells();
  const setSelectedSubTable = useTableStore().set.selectedSubTable();
  const setSelectedCellEntries = useTableStore().set.selectedCellEntries();

  useEffect(() => {
    if (!selected || readOnly) setSelectedCells(null);
  }, [selected, editor, setSelectedCells, readOnly]);

  useEffect(() => {
    if (readOnly) return;

    const { cellEntries, tableEntries } = getTableGridAbove(editor, {
      format: 'all',
    });
    setSelectedSubTable(tableEntries);
    setSelectedCellEntries(cellEntries);

    if (cellEntries?.length > 1) {
      const cells = cellEntries.map((entry) => entry[0]);

      if (JSON.stringify(cells) !== JSON.stringify(selectedCells)) {
        setSelectedCells(cells);
      }
    } else if (selectedCells) {
      setSelectedCells(null);
    }
  }, [
    editor,
    editor.selection,
    readOnly,
    selectedCells,
    setSelectedCellEntries,
    setSelectedCells,
    setSelectedSubTable,
  ]);
};
