import React from 'react';

import type { TTableCellElement } from 'platejs';

import { useEditorPlugin, useElement } from 'platejs/react';

import { getTableCellBorders } from '../../../lib';
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

  return React.useMemo(
    () => getTableCellBorders(editor, { cellIndices, element }),
    [editor, element, cellIndices]
  );
}
