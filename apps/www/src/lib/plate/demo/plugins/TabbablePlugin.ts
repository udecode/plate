import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import {
  createPlugin,
  isSelectionAtBlockStart,
  someNode,
} from '@udecode/plate-common';
import { KEY_LIST_STYLE_TYPE } from '@udecode/plate-indent-list';
import { ELEMENT_LI } from '@udecode/plate-list';
import { TabbablePlugin as TabbableBasePlugin } from '@udecode/plate-tabbable';
import { ELEMENT_TABLE } from '@udecode/plate-table';

import { TabbableElement } from './TabbableElement';

export const TabbablePlugin = TabbableBasePlugin.extend({
  plugins: [
    createPlugin({
      component: TabbableElement,
      isElement: true,
      isVoid: true,
      key: 'tabbable_element',
    }),
  ],
}).configure(({ editor }) => ({
  query: () => {
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
}));
