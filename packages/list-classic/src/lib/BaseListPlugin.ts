import { type PluginConfig, createBasePlugin } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  toggleBulletedList,
  toggleNumberedList,
  toggleTaskList,
} from './transforms';

import { withList } from './withList';
import { withDeleteBackwardList } from './withDeleteBackwardList';
import { withDeleteForwardList } from './withDeleteForwardList';
import { withDeleteFragmentList } from './withDeleteFragmentList';
import { withInsertBreakList } from './withInsertBreakList';
import { withInsertFragmentList } from './withInsertFragmentList';
import { withNormalizeList } from './withNormalizeList';

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
    tab: () => boolean;
    toggle: {
      bulletedList: () => void;
      list: (options: { type: string }) => void;
      numberedList: () => void;
      taskList: (defaultChecked?: boolean) => void;
    };
    untab: () => boolean;
  }
>;

export type ListTransaction = Pick<
  EditorUpdateTransaction,
  'blocks' | 'fragment' | 'nodes' | 'refs' | 'selection' | 'text'
>;

export const BaseBulletedListPlugin = createBasePlugin({
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
}).extendTx(({ editor }) => (tx) => ({
  toggle: () => toggleBulletedList(editor, tx),
}));

export const BaseNumberedListPlugin = createBasePlugin({
  key: KEYS.olClassic,
  node: { isContainer: true, isElement: true },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'OL' }] } } },
  render: { as: 'ol' },
}).extendTx(({ editor }) => (tx) => ({
  toggle: () => toggleNumberedList(editor, tx),
}));

export const BaseTaskListPlugin = createBasePlugin({
  key: KEYS.taskList,
  node: { isContainer: true, isElement: true },
  options: {
    inheritCheckStateOnLineEndBreak: false,
    inheritCheckStateOnLineStartBreak: false,
  },
  render: { as: 'ul' },
}).extendTx(({ editor }) => (tx) => ({
  toggle: () => toggleTaskList(editor, tx),
}));

export const BaseListItemPlugin = createBasePlugin({
  key: KEYS.li,
  inject: {
    plugins: {
      [KEYS.html]: {
        parser: {
          preInsert: ({ editor, type }) =>
            editor.read.nodes.some({ match: { type } }),
        },
      },
    },
  },
  node: { isContainer: true, isElement: true, isStrictSiblings: true },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'LI' }] } } },
  render: { as: 'li' },
});

export const BaseListItemContentPlugin = createBasePlugin({
  key: KEYS.lic,
  node: {
    isElement: true,
  },
});

/** Enables support for bulleted, numbered and to-do lists. */
export const BaseListPlugin = createBasePlugin<ListConfig>({
  key: KEYS.listClassic,
  plugins: [
    BaseBulletedListPlugin,
    BaseNumberedListPlugin,
    BaseTaskListPlugin,
    BaseListItemPlugin,
    BaseListItemContentPlugin,
  ],
})
  .extendTx(withList)
  .extendExtension(withInsertBreakList)
  .extendExtension(withDeleteBackwardList)
  .extendExtension(withDeleteForwardList)
  .extendExtension(withDeleteFragmentList)
  .extendExtension(withInsertFragmentList)
  .extendExtension(withNormalizeList);
