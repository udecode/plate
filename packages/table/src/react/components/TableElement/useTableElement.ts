import type { TTableElement } from 'platejs';

import { useEditorPlugin, useElement } from 'platejs/react';

import { useTableValue } from '../../stores';
import { TablePlugin } from '../../TablePlugin';

export const useTableElement = () => {
  const { editor, getOptions } = useEditorPlugin(TablePlugin);

  const { disableMarginLeft } = getOptions();

  const element = useElement<TTableElement>();
  const marginLeftOverride = useTableValue('marginLeftOverride');

  const marginLeft = disableMarginLeft
    ? 0
    : (marginLeftOverride ?? element.marginLeft ?? 0);

  return {
    marginLeft,
    props: {
      onMouseDown: () => {
        // until cell dnd is supported, we collapse the selection on mouse down
        if (editor.getOption(TablePlugin, 'isSelectingCell')) {
          editor.tf.collapse();
        }
      },
    },
  };
};
