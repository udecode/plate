import React from 'react';

import { useEditorPlugin, useElement } from '@udecode/plate/react';

import { type TTableCellElement, getTableCellBorders } from '../../../lib';
import { useCellIndices } from '../../hooks/useCellIndices';
import { TablePlugin } from '../../TablePlugin';

export function useTableCellBorders({
  element: el,
}: {
  element?: TTableCellElement;
} = {}) {
  const { editor } = useEditorPlugin(TablePlugin);
  const element = useElement<TTableCellElement>() ?? el;
  const cellIndices = useCellIndices();

  return React.useMemo(() => {
    return getTableCellBorders(editor, { cellIndices, element });
  }, [editor, element, cellIndices]);
}
