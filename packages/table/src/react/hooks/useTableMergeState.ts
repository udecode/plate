/* eslint-disable react-hooks/rules-of-hooks */
import {
  useEditorPlugin,
  useEditorSelector,
  useReadOnly,
  useSelected,
} from '@udecode/plate-common/react';

import {
  type TTableCellElement,
  getTableGridAbove,
  isTableRectangular,
} from '../../lib';
import { TablePlugin } from '../TablePlugin';
import { useTableStore } from '../stores';

export const useTableMergeState = () => {
  const { api, getOptions } = useEditorPlugin(TablePlugin);

  const { disableMerge } = getOptions();

  if (disableMerge) return { canMerge: false, canSplit: false };

  const readOnly = useReadOnly();
  const selected = useSelected();
  const selectionExpanded = useEditorSelector(
    (editor) => editor.api.isExpanded(),
    []
  );

  const collapsed = !readOnly && selected && !selectionExpanded;
  const selectedTables = useTableStore().get.selectedTables();
  const selectedTable = selectedTables?.[0];

  const selectedCellEntries = useEditorSelector(
    (editor) =>
      getTableGridAbove(editor, {
        format: 'cell',
      }),
    []
  );

  if (!selectedCellEntries) return { canMerge: false, canSplit: false };

  const canMerge =
    !readOnly &&
    selected &&
    selectionExpanded &&
    selectedCellEntries.length > 1 &&
    isTableRectangular(selectedTable);

  const canSplit =
    collapsed &&
    selectedCellEntries.length === 1 &&
    (api.table.getColSpan(selectedCellEntries[0][0] as TTableCellElement) > 1 ||
      api.table.getRowSpan(selectedCellEntries[0][0] as TTableCellElement) > 1);

  return { canMerge, canSplit };
};
