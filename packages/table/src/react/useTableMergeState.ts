import React from 'react';

import type { TTableCellElement } from '@platejs/utils';

import { KEYS } from '@platejs/utils';
import { useEditorPlugin, useEditorSelector } from '@platejs/core/react';
import { useEditorReadOnly } from '@platejs/plite-react';

import { TablePlugin } from './TablePlugin';

export const useTableMergeState = () => {
  const { editor, getOptions } = useEditorPlugin(TablePlugin);
  const table = editor.plugin(TablePlugin).api;

  const { disableMerge } = getOptions();

  const readOnly = useEditorReadOnly();
  const someTable = useEditorSelector((editor) =>
    editor.read.nodes.some({ match: { type: KEYS.table } })
  );
  const selectionExpanded = useEditorSelector((editor) =>
    editor.read.selection.isExpanded()
  );

  const collapsed = !readOnly && someTable && !selectionExpanded;

  const selectedCellEntries = useEditorSelector((editor) =>
    editor.plugin(TablePlugin).api.getSelectedCellEntries()
  );
  const isRectangularSelection = React.useMemo(() => {
    if (selectedCellEntries.length <= 1) return false;

    const selectedCells = selectedCellEntries.map(
      ([cell]) => cell as TTableCellElement
    );
    const { maxCol, maxRow, minCol, minRow } =
      table.getSelectedCellsBoundingBox(selectedCells);
    const selectedArea = selectedCells.reduce(
      (total, cell) => total + table.getColSpan(cell) * table.getRowSpan(cell),
      0
    );

    return selectedArea === (maxCol - minCol + 1) * (maxRow - minRow + 1);
  }, [selectedCellEntries, table]);

  const canMerge =
    !disableMerge &&
    !readOnly &&
    someTable &&
    selectionExpanded &&
    selectedCellEntries.length > 1 &&
    isRectangularSelection;

  const canSplit =
    !disableMerge &&
    collapsed &&
    selectedCellEntries.length === 1 &&
    (table.getColSpan(selectedCellEntries[0][0] as TTableCellElement) > 1 ||
      table.getRowSpan(selectedCellEntries[0][0] as TTableCellElement) > 1);

  return { canMerge, canSplit };
};
