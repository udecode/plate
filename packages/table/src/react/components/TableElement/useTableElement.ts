import { collapseSelection } from '@udecode/plate-common';
import { useEditorPlugin, useElement } from '@udecode/plate-common/react';

import type { TTableElement } from '../../../lib';

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
