/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';

import type { TTableCellElement } from '@platejs/utils';

import { KEYS } from '@platejs/utils';
import { useEditorPlugin, useEditorSelector } from '@platejs/core/react';
import { useEditorReadOnly } from '@platejs/plite-react';

import { getSelectedCellEntries, getSelectedCellsBoundingBox } from '../../lib';
import { TablePlugin } from '../TablePlugin';

export const useTableMergeState = () => {
  const { api, editor, getOptions } = useEditorPlugin(TablePlugin);

  const { disableMerge } = getOptions();

  if (disableMerge) return { canMerge: false, canSplit: false };

  const readOnly = useEditorReadOnly();
  const someTable = useEditorSelector(
    (editor) => editor.read.nodes.some({ match: { type: KEYS.table } }),
    []
  );
  const selectionExpanded = useEditorSelector(
    (editor) => editor.read.selection.isExpanded(),
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
      (total, cell) => total + api.getColSpan(cell) * api.getRowSpan(cell),
      0
    );

    return selectedArea === (maxCol - minCol + 1) * (maxRow - minRow + 1);
  }, [api, editor, selectedCellEntries]);

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
    (api.getColSpan(selectedCellEntries[0][0] as TTableCellElement) > 1 ||
      api.getRowSpan(selectedCellEntries[0][0] as TTableCellElement) > 1);

  return { canMerge, canSplit };
};
