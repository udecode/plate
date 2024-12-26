import React from 'react';

import { useEditorPlugin, useElement } from '@udecode/plate-common/react';

import { type TTableCellElement, getTableCellBorders } from '../../../lib';
import { TablePlugin } from '../../TablePlugin';
import { useCellIndices } from '../../hooks/useCellIndices';

export function useTableCellBorders() {
  const { editor } = useEditorPlugin(TablePlugin);
  const element = useElement<TTableCellElement>();
  const cellIndices = useCellIndices();

  return React.useMemo(() => {
    return getTableCellBorders(editor, { cellIndices, element });
  }, [editor, element, cellIndices]);
}
