import {
  DeserializeHtmlPlugin,
  type HotkeyPluginOptions,
  type PluginConfig,
  createSlatePlugin,
  someNode,
} from '@udecode/plate-common';

import { onKeyDownList } from './onKeyDownList';
import { withList } from './withList';

export type ListPluginOptions = {
  enableResetOnShiftTab?: boolean;
  /** Valid children types for list items, in addition to p and ul types. */
  validLiChildrenTypes?: string[];
} & HotkeyPluginOptions;

export type ListConfig = PluginConfig<any, ListPluginOptions>;

export const ListUnorderedPlugin = createSlatePlugin<'ul', ListPluginOptions>({
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

export const ListOrderedPlugin = createSlatePlugin<'ol', ListPluginOptions>({
  deserializeHtml: { rules: [{ validNodeName: 'OL' }] },
  handlers: {
    onKeyDown: onKeyDownList,
  },
  isElement: true,
  key: 'ol',
});

export const ListItemPlugin = createSlatePlugin({
  deserializeHtml: { rules: [{ validNodeName: 'LI' }] },
  isElement: true,
  key: 'li',
}).extend(({ editor, type }) => ({
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

export const ListItemContentPlugin = createSlatePlugin({
  isElement: true,
  key: 'lic',
});

/** Enables support for bulleted, numbered and to-do lists. */
export const ListPlugin = createSlatePlugin({
  key: 'list',
  plugins: [
    ListUnorderedPlugin,
    ListOrderedPlugin,
    ListItemPlugin,
    ListItemContentPlugin,
  ],
});
