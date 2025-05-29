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
  node: { isContainer: true, isElement: true },
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
  render: { as: 'ul' },
}).extendTransforms(({ editor }) => ({
  toggle: () => {
    toggleBulletedList(editor);
  },
}));

export const BaseNumberedListPlugin = createSlatePlugin({
  key: KEYS.olClassic,
  node: { isContainer: true, isElement: true },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'OL' }] } } },
  render: { as: 'ol' },
}).extendTransforms(({ editor }) => ({
  toggle: () => {
    toggleNumberedList(editor);
  },
}));

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
  node: { isContainer: true, isElement: true },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'LI' }] } } },
  render: { as: 'li' },
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
