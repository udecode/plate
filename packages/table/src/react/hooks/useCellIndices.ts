import React from 'react';

import { useEditorPlugin, useElement } from '@udecode/plate-common/react';

import type { TTableCellElement } from '../../lib';

import { TablePlugin } from '../TablePlugin';

export const useCellIndices = () => {
  const { editor, useOption } = useEditorPlugin(TablePlugin);
  const element = useElement<TTableCellElement>();
  const cellIndices = useOption('_cellIndices');
  const versionCellIndices = useOption('_versionCellIndices');

  return React.useMemo(() => {
    if (!versionCellIndices) return undefined as never;

    const indices = cellIndices[element.id!];

    if (!indices) {
      editor.api.debug.error(
        'No cell indices found for element. Make sure all table cells have an id.',
        'TABLE_CELL_INDICES'
      );

      return { col: 0, row: 0 };
    }

    return indices;
  }, [cellIndices, editor.api.debug, element, versionCellIndices]);
};
