import {
  type OmitFirst,
  type PluginConfig,
  bindFirst,
  createSlatePlugin,
  createTSlatePlugin,
  KEYS,
} from '@udecode/plate';

import {
  toggleBulletedList,
  toggleList,
  toggleNumberedList,
} from './transforms';

export type ListConfig = PluginConfig<
  'listClassic',
  {
    enableResetOnShiftTab?: boolean;
    /** Valid children types for list items, in addition to p and ul types. */
    validLiChildrenTypes?: string[];
  },
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
  key: KEYS.ulClassic,
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
  key: KEYS.olClassic,
  node: { isElement: true },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'OL' }] } } },
});

export const BaseListItemPlugin = createSlatePlugin({
  key: KEYS.li,
  inject: {
    plugins: {
      [KEYS.html]: {
        parser: {
          preInsert: ({ editor, type }) => {
            return editor.api.some({ match: { type } });
          },
        },
      },
    },
  },
  node: { isElement: true },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'LI' }] } } },
});

export const BaseListItemContentPlugin = createSlatePlugin({
  key: KEYS.lic,
  node: { isElement: true },
});

/** Enables support for bulleted, numbered and to-do lists. */
export const BaseListPlugin = createTSlatePlugin<ListConfig>({
  key: KEYS.listClassic,
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
