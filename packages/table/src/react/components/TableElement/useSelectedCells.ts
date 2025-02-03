import React from 'react';

import { useEditorRef, useReadOnly, useSelected } from '@udecode/plate/react';

import { getTableGridAbove } from '../../../lib';
import { useTableStore } from '../../stores';

/**
 * Many grid cells above and diff -> set No many grid cells above and diff ->
 * unset No selection -> unset
 */
export const useSelectedCells = () => {
  const readOnly = useReadOnly();
  const selected = useSelected();
  const editor = useEditorRef();

  const [selectedCells, setSelectedCells] =
    useTableStore().useSelectedCellsState();
  const setSelectedTables = useTableStore().useSetSelectedTables();

  React.useEffect(() => {
    if (!selected || readOnly) {
      setSelectedCells(null);
      setSelectedTables(null);
    }
  }, [selected, editor, setSelectedCells, readOnly, setSelectedTables]);

  React.useEffect(() => {
    if (readOnly) return;

    const tableEntries = getTableGridAbove(editor, { format: 'table' });
    const cellEntries = getTableGridAbove(editor, { format: 'cell' });

    if (cellEntries?.length > 1) {
      const cells = cellEntries.map((entry) => entry[0]);
      const tables = tableEntries.map((entry) => entry[0]);

      if (JSON.stringify(cells) !== JSON.stringify(selectedCells)) {
        setSelectedCells(cells);
        setSelectedTables(tables);
      }
    } else if (selectedCells) {
      setSelectedCells(null);
      setSelectedTables(null);
    }
  }, [
    editor,
    editor.selection,
    readOnly,
    selectedCells,
    setSelectedCells,
    setSelectedTables,
  ]);
};
