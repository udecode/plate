import React from 'react';

import type { NodeEntry } from '@udecode/plate';

import {
  useEditorPlugin,
  useElement,
  useElementSelector,
} from '@udecode/plate/react';

import type { TTableCellElement, TTableRowElement } from '../../../lib';

import { useCellIndices } from '../../hooks/useCellIndices';
import { TablePlugin, TableRowPlugin } from '../../TablePlugin';
import { useTableColSizes } from '../TableElement';

export function useTableCellSize({
  element: el,
}: {
  element?: TTableCellElement;
} = {}) {
  const { api } = useEditorPlugin(TablePlugin);

  const element = useElement() ?? el;
  const colSizes = useTableColSizes();
  const cellIndices = useCellIndices();
  const rowSize = useElementSelector(
    ([node]: NodeEntry<TTableRowElement>) => node.size,
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
