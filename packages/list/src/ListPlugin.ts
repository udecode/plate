import {
  KEY_DESERIALIZE_HTML,
  createPlugin,
  someNode,
} from '@udecode/plate-common';

import type { ListPluginOptions } from './types';

import { onKeyDownList } from './onKeyDownList';
import { withList } from './withList';

export const KEY_LIST = 'list';

export const ELEMENT_UL = 'ul';

export const ELEMENT_OL = 'ol';

export const ELEMENT_LI = 'li';

export const ELEMENT_LIC = 'lic';

export const ListUnorderedPlugin = createPlugin<'ul', ListPluginOptions>({
  deserializeHtml: {
    rules: [
      {
        validNodeName: 'UL',
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownList,
  },
  isElement: true,
  key: ELEMENT_UL,
  withOverrides: withList,
});

export const ListOrderedPlugin = createPlugin<'ol', ListPluginOptions>({
  deserializeHtml: { rules: [{ validNodeName: 'OL' }] },
  handlers: {
    onKeyDown: onKeyDownList,
  },
  isElement: true,
  key: ELEMENT_OL,
});

export const ListItemPlugin = createPlugin({
  deserializeHtml: { rules: [{ validNodeName: 'LI' }] },
  isElement: true,
  key: ELEMENT_LI,
}).extend(({ editor, plugin: { type } }) => ({
  inject: {
    pluginsByKey: {
      [KEY_DESERIALIZE_HTML]: {
        editor: {
          insertData: {
            preInsert: () => {
              return someNode(editor, { match: { type } });
            },
          },
        },
      },
    },
  },
}));

export const ListItemContentPlugin = createPlugin({
  isElement: true,
  key: ELEMENT_LIC,
});

/** Enables support for bulleted, numbered and to-do lists. */
export const ListPlugin = createPlugin({
  key: KEY_LIST,
  plugins: [
    ListUnorderedPlugin,
    ListOrderedPlugin,
    ListItemPlugin,
    ListItemContentPlugin,
  ],
});
