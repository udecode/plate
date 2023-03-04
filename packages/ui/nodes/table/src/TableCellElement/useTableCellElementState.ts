import { TElement, useElement, usePlateEditorRef } from '@udecode/plate-core';
import { getTableColumnIndex } from '@udecode/plate-table';
import { useReadOnly } from 'slate-react';
import { useIsCellSelected } from '../hooks';
import { useTableStore } from '../table.atoms';

export type TableCellElementState = {
  colIndex: number;
  readOnly: boolean;
  hovered: boolean;
  selected: boolean;
};

export const useTableCellElementState = ({
  ignoreReadOnly,
}: {
  /**
   * Ignores editable readOnly mode
   */
  ignoreReadOnly?: boolean;
} = {}): TableCellElementState => {
  const editor = usePlateEditorRef();
  const element = useElement<TElement>();
  const hoveredColIndex = useTableStore().get.hoveredColIndex();
  const isCellSelected = useIsCellSelected(element);

  const readOnly = useReadOnly();

  const colIndex = getTableColumnIndex(editor, element);

  return {
    colIndex,
    readOnly: !ignoreReadOnly && readOnly,
    selected: isCellSelected,
    hovered: hoveredColIndex === colIndex,
  };
};
