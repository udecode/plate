import { useEffect } from 'react';
import { useEditorRef } from '@udecode/plate-core';
import { useAtom } from 'jotai';
import { useSelected } from 'slate-react';
import { getGridCellsAbove } from '../../../../../nodes/table/src/queries/getGridCellsAbove';
import { selectedCellsAtom } from '../table.atoms';

/**
 * Many grid cells above and diff -> set
 * No many grid cells above and diff -> unset
 * No selection -> unset
 */
export const useSelectedCells = () => {
  const selected = useSelected();
  const editor = useEditorRef();

  const [selectedCells, setSelectedCells] = useAtom(selectedCellsAtom);

  useEffect(() => {
    if (!selected) setSelectedCells(null);
  }, [selected, editor, setSelectedCells]);

  useEffect(() => {
    const cells = getGridCellsAbove(editor);
    if (cells && cells.length > 1) {
      if (JSON.stringify(cells) !== JSON.stringify(selectedCells)) {
        setSelectedCells(cells);
      }
    } else if (selectedCells) {
      setSelectedCells(null);
    }
  }, [editor, editor.selection, selectedCells, setSelectedCells]);
};
