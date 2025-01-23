import React from 'react';

import { useEditorPlugin, useElement } from '@udecode/plate/react';

import { type TTableCellElement, computeCellIndices } from '../../lib';
import { TablePlugin } from '../TablePlugin';

export const useCellIndices = () => {
  const { editor, useOption } = useEditorPlugin(TablePlugin);
  const element = useElement<TTableCellElement>();
  const cellIndices = useOption('cellIndices', element.id!);

  return React.useMemo(() => {
    if (!cellIndices) {
      return (
        computeCellIndices(editor, {
          cellNode: element,
        }) ?? { col: 0, row: 0 }
      );
    }

    return cellIndices ?? { col: 0, row: 0 };
  }, [cellIndices, editor, element]);
};
