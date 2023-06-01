import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_LI,
  ELEMENT_TABLE,
  isSelectionAtBlockStart,
  KEY_LIST_STYLE_TYPE,
  TabbablePlugin,
} from '@udecode/plate';
import { someNode } from '@udecode/plate-common';
import { TabbableElement } from './TabbableElement';

import { MyPlatePlugin } from '@/types/plate.types';

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
