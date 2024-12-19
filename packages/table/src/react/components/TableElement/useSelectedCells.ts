import React from 'react';

import { useEditorRef } from '@udecode/plate-common/react';
import { useReadOnly, useSelected } from 'slate-react';

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

  const [selectedCells, setSelectedCells] = useTableStore().use.selectedCells();
  const setSelectedTable = useTableStore().set.selectedTable();

  React.useEffect(() => {
    if (!selected || readOnly) {
      setSelectedCells(null);
      setSelectedTable(null);
    }
  }, [selected, editor, setSelectedCells, readOnly, setSelectedTable]);

  React.useEffect(() => {
    if (readOnly) return;

    const tableEntries = getTableGridAbove(editor, { format: 'table' });
    const cellEntries = getTableGridAbove(editor, { format: 'cell' });

    if (cellEntries?.length > 1) {
      const cells = cellEntries.map((entry) => entry[0]);
      const tables = tableEntries.map((entry) => entry[0]);

      if (JSON.stringify(cells) !== JSON.stringify(selectedCells)) {
        setSelectedCells(cells);
        setSelectedTable(tables);
      }
    } else if (selectedCells) {
      setSelectedCells(null);
      setSelectedTable(null);
    }
  }, [
    editor,
    editor.selection,
    readOnly,
    selectedCells,
    setSelectedCells,
    setSelectedTable,
  ]);
};
