import {
  DeserializeHtmlPlugin,
  createPlugin,
  someNode,
} from '@udecode/plate-common';

import type { ListPluginOptions } from './types';

import { onKeyDownList } from './onKeyDownList';
import { withList } from './withList';

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
  key: 'ul',
  withOverrides: withList,
});

export const ListOrderedPlugin = createPlugin<'ol', ListPluginOptions>({
  deserializeHtml: { rules: [{ validNodeName: 'OL' }] },
  handlers: {
    onKeyDown: onKeyDownList,
  },
  isElement: true,
  key: 'ol',
});

export const ListItemPlugin = createPlugin({
  deserializeHtml: { rules: [{ validNodeName: 'LI' }] },
  isElement: true,
  key: 'li',
}).extend(({ editor, plugin: { type } }) => ({
  inject: {
    plugins: {
      [DeserializeHtmlPlugin.key]: {
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
  key: 'lic',
});

/** Enables support for bulleted, numbered and to-do lists. */
export const ListPlugin = createPlugin({
  key: 'list',
  plugins: [
    ListUnorderedPlugin,
    ListOrderedPlugin,
    ListItemPlugin,
    ListItemContentPlugin,
  ],
});
