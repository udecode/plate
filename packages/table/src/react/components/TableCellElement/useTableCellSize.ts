import React from 'react';

import type { NodeEntry } from '@platejs/plite';
import type { TTableCellElement, TTableRowElement } from '@platejs/utils';

import { KEYS } from '@platejs/utils';
import {
  useEditorPlugin,
  useElement,
  useElementSelector,
} from '@platejs/core/react';

import { useCellIndices } from '../../hooks/useCellIndices';
import { TablePlugin } from '../../TablePlugin';
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
      key: KEYS.tr,
    }
  );

  return React.useMemo(
    () => api.getCellSize({ cellIndices, colSizes, element, rowSize }),
    [api, cellIndices, colSizes, element, rowSize]
  );
}
