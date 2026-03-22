/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';

import type { TTableCellElement } from 'platejs';

import { KEYS } from 'platejs';
import { useEditorPlugin, useEditorSelector, useReadOnly } from 'platejs/react';

import { getSelectedCellEntries, getSelectedCellsBoundingBox } from '../../lib';
import { TablePlugin } from '../TablePlugin';

export const useTableMergeState = () => {
  const { api, editor, getOptions } = useEditorPlugin(TablePlugin);

  const { disableMerge } = getOptions();

  if (disableMerge) return { canMerge: false, canSplit: false };

  const readOnly = useReadOnly();
  const someTable = useEditorSelector(
    (editor) => editor.api.some({ match: { type: KEYS.table } }),
    []
  );
  const selectionExpanded = useEditorSelector(
    (editor) => editor.api.isExpanded(),
    []
  );

  const collapsed = !readOnly && someTable && !selectionExpanded;

  const selectedCellEntries = useEditorSelector(
    (editor) => getSelectedCellEntries(editor),
    []
  );
  const isRectangularSelection = React.useMemo(() => {
    if (selectedCellEntries.length <= 1) return false;

    const selectedCells = selectedCellEntries.map(
      ([cell]) => cell as TTableCellElement
    );
    const { maxCol, maxRow, minCol, minRow } = getSelectedCellsBoundingBox(
      editor,
      selectedCells
    );
    const selectedArea = selectedCells.reduce(
      (total, cell) =>
        total + api.table.getColSpan(cell) * api.table.getRowSpan(cell),
      0
    );

    return selectedArea === (maxCol - minCol + 1) * (maxRow - minRow + 1);
  }, [api.table, editor, selectedCellEntries]);

  if (!selectedCellEntries) return { canMerge: false, canSplit: false };

  const canMerge =
    !readOnly &&
    someTable &&
    selectionExpanded &&
    selectedCellEntries.length > 1 &&
    isRectangularSelection;

  const canSplit =
    collapsed &&
    selectedCellEntries.length === 1 &&
    (api.table.getColSpan(selectedCellEntries[0][0] as TTableCellElement) > 1 ||
      api.table.getRowSpan(selectedCellEntries[0][0] as TTableCellElement) > 1);

  return { canMerge, canSplit };
};
