import React from 'react';

import { collapseSelection } from '@udecode/plate-common';
import { useEditorPlugin, useElement } from '@udecode/plate-common/react';

import { type TTableElement, computeCellIndices } from '../../../lib';
import { TablePlugin } from '../../TablePlugin';
import { useTableStore } from '../../stores';
import { useSelectedCells } from './useSelectedCells';

export const useTableElement = () => {
  const { editor, getOptions } = useEditorPlugin(TablePlugin);

  const { disableMarginLeft } = getOptions();

  const element = useElement<TTableElement>();
  const selectedCells = useTableStore().get.selectedCells();
  const marginLeftOverride = useTableStore().get.marginLeftOverride();

  const marginLeft = disableMarginLeft
    ? 0
    : (marginLeftOverride ?? element.marginLeft ?? 0);

  React.useEffect(() => {
    // TODO: only if indices are empty
    computeCellIndices(editor, {
      tableNode: element,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useSelectedCells();

  return {
    isSelectingCell: !!selectedCells,
    marginLeft,
    props: {
      onMouseDown: () => {
        // until cell dnd is supported, we collapse the selection on mouse down
        if (selectedCells) {
          collapseSelection(editor);
        }
      },
    },
  };
};
