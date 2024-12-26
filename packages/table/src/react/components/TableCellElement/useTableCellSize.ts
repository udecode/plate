import React from 'react';

import { useEditorPlugin, useElement } from '@udecode/plate-common/react';

import { TablePlugin } from '../../TablePlugin';
import { useCellIndices } from '../../hooks/useCellIndices';
import { useTableColSizes } from '../TableElement';

export function useTableCellSize() {
  const { api } = useEditorPlugin(TablePlugin);

  const element = useElement();
  const colSizes = useTableColSizes();
  const cellIndices = useCellIndices();

  return React.useMemo(
    () => api.table.getCellSize({ cellIndices, colSizes, element }),
    [api.table, cellIndices, colSizes, element]
  );
}
