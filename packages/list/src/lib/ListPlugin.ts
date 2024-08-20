import {
  DeserializeHtmlPlugin,
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
  someNode,
} from '@udecode/plate-common';

export type ListPluginOptions = {
  enableResetOnShiftTab?: boolean;
  /** Valid children types for list items, in addition to p and ul types. */
  validLiChildrenTypes?: string[];
};

export type ListConfig = PluginConfig<'list', ListPluginOptions>;

export const ListUnorderedPlugin = createSlatePlugin({
  deserializeHtml: {
    rules: [
      {
        validNodeName: 'UL',
      },
    ],
  },
  isElement: true,
  key: 'ul',
});

export const ListOrderedPlugin = createSlatePlugin({
  deserializeHtml: { rules: [{ validNodeName: 'OL' }] },
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
export const ListPlugin = createTSlatePlugin<ListConfig>({
  key: 'list',
  // TODO react
  // withOverrides: withList,
  plugins: [
    ListUnorderedPlugin,
    ListOrderedPlugin,
    ListItemPlugin,
    ListItemContentPlugin,
  ],
});
