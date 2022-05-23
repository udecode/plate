import { useEffect } from 'react';
import { TElement, useEditorRef } from '@udecode/plate-core';
import { useAtom } from 'jotai';
import { useSelected } from 'slate-react';
import { getSubTableAbove } from '../../../../../nodes/table/src/queries/getSubTableAbove';
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
    const cells = getSubTableAbove(editor, { format: 'cell' }) as
      | TElement[]
      | undefined;
    if (cells && cells.length > 1) {
      if (JSON.stringify(cells) !== JSON.stringify(selectedCells)) {
        setSelectedCells(cells);
      }
    } else if (selectedCells) {
      setSelectedCells(null);
    }
  }, [editor, editor.selection, selectedCells, setSelectedCells]);
};
