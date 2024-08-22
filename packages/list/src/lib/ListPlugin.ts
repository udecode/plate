import {
  DeserializeHtmlPlugin,
  type OmitFirst,
  type PluginConfig,
  bindFirst,
  createSlatePlugin,
  createTSlatePlugin,
  someNode,
} from '@udecode/plate-common';

import {
  toggleBulletedList,
  toggleList,
  toggleNumberedList,
} from './transforms';

export type ListPluginOptions = {
  enableResetOnShiftTab?: boolean;
  /** Valid children types for list items, in addition to p and ul types. */
  validLiChildrenTypes?: string[];
};

export type ListConfig = PluginConfig<
  'list',
  ListPluginOptions,
  {},
  {
    toggle: {
      bulletedList: OmitFirst<typeof toggleBulletedList>;
      list: OmitFirst<typeof toggleList>;
      numberedList: OmitFirst<typeof toggleNumberedList>;
    };
  }
>;

export const BulletedListPlugin = createSlatePlugin({
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

export const NumberedListPlugin = createSlatePlugin({
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
    BulletedListPlugin,
    NumberedListPlugin,
    ListItemPlugin,
    ListItemContentPlugin,
  ],
}).extendEditorTransforms(({ editor }) => ({
  toggle: {
    bulletedList: bindFirst(toggleBulletedList, editor),
    list: bindFirst(toggleList, editor),
    numberedList: bindFirst(toggleNumberedList, editor),
  },
}));
