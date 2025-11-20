import {
  type OmitFirst,
  type PluginConfig,
  bindFirst,
  createSlatePlugin,
  createTSlatePlugin,
  KEYS,
} from 'platejs';

import {
  toggleBulletedList,
  toggleList,
  toggleNumberedList,
  toggleTaskList,
} from './transforms';
import { withList } from './withList';

export type ListConfig = PluginConfig<
  'listClassic',
  {
    enableResetOnShiftTab?: boolean;
    /** Inherit the checked state of above node after insert break at the end */
    inheritCheckStateOnLineEndBreak?: boolean;
    /** Inherit the checked state of below node after insert break at the start */
    inheritCheckStateOnLineStartBreak?: boolean;
    /** Valid children types for list items, in addition to p and ul types. */
    validLiChildrenTypes?: string[];
  },
  {},
  {
    toggle: {
      bulletedList: OmitFirst<typeof toggleBulletedList>;
      list: OmitFirst<typeof toggleList>;
      numberedList: OmitFirst<typeof toggleNumberedList>;
      taskList: OmitFirst<typeof toggleTaskList>;
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

export const BaseTaskListPlugin = createSlatePlugin({
  key: KEYS.taskList,
  node: { isContainer: true, isElement: true },
  options: {
    inheritCheckStateOnLineEndBreak: false,
    inheritCheckStateOnLineStartBreak: false,
  },
  render: { as: 'ul' },
}).extendTransforms(({ editor }) => ({
  toggle: () => {
    toggleTaskList(editor);
  },
}));

export const BaseListItemPlugin = createSlatePlugin({
  key: KEYS.li,
  inject: {
    plugins: {
      [KEYS.html]: {
        parser: {
          preInsert: ({ editor, type }) => editor.api.some({ match: { type } }),
        },
      },
    },
  },
  node: { isContainer: true, isElement: true, isStrictSiblings: true },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'LI' }] } } },
  render: { as: 'li' },
});

export const BaseListItemContentPlugin = createSlatePlugin({
  key: KEYS.lic,
  node: {
    isElement: true,
  },
});

/** Enables support for bulleted, numbered and to-do lists. */
export const BaseListPlugin = createTSlatePlugin<ListConfig>({
  key: KEYS.listClassic,
  plugins: [
    BaseBulletedListPlugin,
    BaseNumberedListPlugin,
    BaseTaskListPlugin,
    BaseListItemPlugin,
    BaseListItemContentPlugin,
  ],
})
  .overrideEditor(withList)
  .extendEditorTransforms(({ editor }) => ({
    toggle: {
      bulletedList: bindFirst(toggleBulletedList, editor),
      list: bindFirst(toggleList, editor),
      numberedList: bindFirst(toggleNumberedList, editor),
      taskList: bindFirst(toggleTaskList, editor),
    },
  }));
