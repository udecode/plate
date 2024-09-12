import {
  HtmlPlugin,
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

export const BaseBulletedListPlugin = createSlatePlugin({
  key: 'ul',
  node: { isElement: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'UL',
          },
        ],
      },
    },
  },
});

export const BaseNumberedListPlugin = createSlatePlugin({
  key: 'ol',
  node: { isElement: true },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'OL' }] } } },
});

export const BaseListItemPlugin = createSlatePlugin({
  key: 'li',
  node: { isElement: true },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'LI' }] } } },
}).extend(({ editor, type }) => ({
  inject: {
    plugins: {
      [HtmlPlugin.key]: {
        parser: {
          preInsert: () => {
            return someNode(editor, { match: { type } });
          },
        },
      },
    },
  },
}));

export const BaseListItemContentPlugin = createSlatePlugin({
  key: 'lic',
  node: { isElement: true },
});

/** Enables support for bulleted, numbered and to-do lists. */
export const BaseListPlugin = createTSlatePlugin<ListConfig>({
  key: 'list',
  // TODO react
  // extendEditor: withList,
  plugins: [
    BaseBulletedListPlugin,
    BaseNumberedListPlugin,
    BaseListItemPlugin,
    BaseListItemContentPlugin,
  ],
}).extendEditorTransforms(({ editor }) => ({
  toggle: {
    bulletedList: bindFirst(toggleBulletedList, editor),
    list: bindFirst(toggleList, editor),
    numberedList: bindFirst(toggleNumberedList, editor),
  },
}));
