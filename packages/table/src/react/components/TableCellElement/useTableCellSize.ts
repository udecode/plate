import React from 'react';

import type { TNodeEntry } from '@udecode/plate-common';

import {
  useEditorPlugin,
  useElement,
  useElementSelector,
} from '@udecode/plate-common/react';

import type { TTableRowElement } from '../../../lib';

import { TablePlugin, TableRowPlugin } from '../../TablePlugin';
import { useCellIndices } from '../../hooks/useCellIndices';
import { useTableColSizes } from '../TableElement';

export function useTableCellSize() {
  const { api } = useEditorPlugin(TablePlugin);

  const element = useElement();
  const colSizes = useTableColSizes();
  const cellIndices = useCellIndices();
  const rowSize = useElementSelector(
    ([node]: TNodeEntry<TTableRowElement>) => node.size,
    [],
    {
      key: TableRowPlugin.key,
    }
  );

  return React.useMemo(
    () => api.table.getCellSize({ cellIndices, colSizes, element, rowSize }),
    [api.table, cellIndices, colSizes, element, rowSize]
  );
}
