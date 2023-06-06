import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { isSelectionAtBlockStart, someNode } from '@udecode/plate-common';
import { KEY_LIST_STYLE_TYPE } from '@udecode/plate-indent-list';
import { ELEMENT_LI } from '@udecode/plate-list';
import { TabbablePlugin } from '@udecode/plate-tabbable';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { TabbableElement } from './TabbableElement';

import { MyPlatePlugin } from '@/plate/plate.types';

const TABBABLE_ELEMENT = 'tabbable_element';

export const tabbablePlugin: Partial<MyPlatePlugin<TabbablePlugin>> = {
  options: {
    query: (editor) => {
      if (isSelectionAtBlockStart(editor)) return false;

      return !someNode(editor, {
        match: (n) => {
          return !!(
            n.type &&
            ([ELEMENT_TABLE, ELEMENT_LI, ELEMENT_CODE_BLOCK].includes(
              n.type as string
            ) ||
              n[KEY_LIST_STYLE_TYPE])
          );
        },
      });
    },
  },
  plugins: [
    {
      key: TABBABLE_ELEMENT,
      isElement: true,
      isVoid: true,
      component: TabbableElement,
    },
  ],
};
