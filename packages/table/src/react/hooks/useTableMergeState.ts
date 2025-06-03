/* eslint-disable react-hooks/rules-of-hooks */
import type { TTableCellElement } from '@udecode/plate';

import { KEYS } from '@udecode/plate';
import {
  useEditorPlugin,
  useEditorSelector,
  usePluginOption,
  useReadOnly,
} from '@udecode/plate/react';

import { getTableGridAbove, isTableRectangular } from '../../lib';
import { TablePlugin } from '../TablePlugin';

export const useTableMergeState = () => {
  const { api, getOptions } = useEditorPlugin(TablePlugin);

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
  const selectedTables = usePluginOption(TablePlugin, 'selectedTables');
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
    someTable &&
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
