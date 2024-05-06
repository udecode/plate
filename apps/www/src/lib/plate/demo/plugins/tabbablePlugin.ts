import type { TabbablePlugin } from '@udecode/plate-tabbable';

import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import {
  type PlatePlugin,
  isSelectionAtBlockStart,
  someNode,
} from '@udecode/plate-common';
import { KEY_LIST_STYLE_TYPE } from '@udecode/plate-indent-list';
import { ELEMENT_LI } from '@udecode/plate-list';
import { ELEMENT_TABLE } from '@udecode/plate-table';

import { TabbableElement } from './TabbableElement';

const TABBABLE_ELEMENT = 'tabbable_element';

export const tabbablePlugin: Partial<PlatePlugin<TabbablePlugin>> = {
  options: {
    query: (editor) => {
      if (isSelectionAtBlockStart(editor)) return false;

      return !someNode(editor, {
        match: (n) => {
          return !!(
            n.type &&
            ([ELEMENT_CODE_BLOCK, ELEMENT_LI, ELEMENT_TABLE].includes(
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
      component: TabbableElement,
      isElement: true,
      isVoid: true,
      key: TABBABLE_ELEMENT,
    },
  ],
};
