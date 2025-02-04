import {
  useEditorPlugin,
  useElement,
  useStoreValue,
} from '@udecode/plate/react';

import type { TTableElement } from '../../../lib';

import { useTableStore } from '../../stores';
import { TablePlugin } from '../../TablePlugin';
import { useSelectedCells } from './useSelectedCells';

export const useTableElement = () => {
  const { editor, getOptions, useOption } = useEditorPlugin(TablePlugin);

  const { disableMarginLeft } = getOptions();

  const element = useElement<TTableElement>();
  const selectedCells = useOption('selectedCells');
  const marginLeftOverride = useStoreValue(
    useTableStore(),
    'marginLeftOverride'
  );

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
          editor.tf.collapse();
        }
      },
    },
  };
};
