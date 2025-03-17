import {
  useEditorPlugin,
  useElement,
  usePluginOption,
} from '@udecode/plate/react';

import type { TTableElement } from '../../../lib';

import { useTableValue } from '../../stores';
import { TablePlugin } from '../../TablePlugin';
import { useSelectedCells } from './useSelectedCells';

export const useTableElement = () => {
  const { editor, getOptions } = useEditorPlugin(TablePlugin);

  const { disableMarginLeft } = getOptions();

  const element = useElement<TTableElement>();
  const selectedCells = usePluginOption(TablePlugin, 'selectedCells');
  const marginLeftOverride = useTableValue('marginLeftOverride');

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
