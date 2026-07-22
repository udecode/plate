import {
  type InferConfig,
  type PluginConfig,
  type PluginReference,
  createBasePlugin,
} from '@platejs/core';
import type {
  EditorCoreUpdateTransaction,
  EditorTransactionSpecBuilder,
} from '@platejs/plite';
import { property, schema, target } from '@platejs/plite';
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

export type ListPluginOptions = {
  enableResetOnShiftTab?: boolean;
  /** Inherit the checked state of above node after insert break at the end */
  inheritCheckStateOnLineEndBreak?: boolean;
  /** Inherit the checked state of below node after insert break at the start */
  inheritCheckStateOnLineStartBreak?: boolean;
  /** Element plugins allowed as direct list-item children. */
  validLiChildren?: readonly PluginReference[];
};

export type ListPluginTransaction = {
  tab: () => boolean;
  toggle: {
    bulletedList: () => void;
    list: (options: { type: string }) => void;
    numberedList: () => void;
    taskList: (defaultChecked?: boolean) => void;
  };
  untab: () => boolean;
};

export type ListCorrectionTransaction = Pick<
  EditorCoreUpdateTransaction,
  'nodes'
>;

export type ListTransaction = EditorTransactionSpecBuilder;

export const BaseListItemContentPlugin = createBasePlugin({
  key: KEYS.lic,
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      slice: { preserveContext: true },
      topLevel: false,
    },
  },
});

const BaseBulletedListPluginShell = createBasePlugin({
  key: KEYS.ulClassic,
});

const BaseNumberedListPluginShell = createBasePlugin({
  key: KEYS.olClassic,
});

const BaseTaskListPluginShell = createBasePlugin({
  key: KEYS.taskList,
});

export const BaseListItemPlugin = createBasePlugin({
  key: KEYS.li,
  schema: ({ plugins }) => {
    const [contentType, bulletedType, numberedType, taskType] =
      plugins.elementTypes([
        BaseListItemContentPlugin,
        BaseBulletedListPluginShell,
        BaseNumberedListPluginShell,
        BaseTaskListPluginShell,
      ]);

    return {
      element: {
        content: schema.content.types(
          [contentType, bulletedType, numberedType, taskType],
          {
            default: { type: contentType },
            min: 1,
          }
        ),
        slice: { preserveContext: true },
        topLevel: false,
      },
    };
  },
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'LI' }] } } },
  render: { as: 'li' },
});

export const BaseBulletedListPlugin = createBasePlugin({
  key: KEYS.ulClassic,
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: 'UL' }],
      },
    },
  },
  render: { as: 'ul' },
  schema: ({ plugins }) => {
    const listItemType = plugins.elementType(BaseListItemPlugin);

    return {
      element: {
        content: schema.content.type(listItemType, {
          default: { type: listItemType },
          min: 1,
        }),
        slice: { preserveContext: true },
      },
    };
  },
}).extendTx(({ editor }) => (tx) => ({
  toggle: () => toggleBulletedList(editor, tx),
}));

export const BaseNumberedListPlugin = createBasePlugin({
  key: KEYS.olClassic,
  parsers: { html: { deserializer: { rules: [{ validNodeName: 'OL' }] } } },
  render: { as: 'ol' },
  schema: ({ plugins }) => {
    const listItemType = plugins.elementType(BaseListItemPlugin);

    return {
      element: {
        content: schema.content.type(listItemType, {
          default: { type: listItemType },
          min: 1,
        }),
        slice: { preserveContext: true },
      },
    };
  },
}).extendTx(({ editor }) => (tx) => ({
  toggle: () => toggleNumberedList(editor, tx),
}));

export const BaseTaskListPlugin = createBasePlugin({
  key: KEYS.taskList,
  options: {
    inheritCheckStateOnLineEndBreak: false,
    inheritCheckStateOnLineStartBreak: false,
  },
  render: { as: 'ul' },
  schema: ({ plugins }) => {
    const listItemType = plugins.elementType(BaseListItemPlugin);

    return {
      element: {
        content: schema.content.type(listItemType, {
          default: { type: listItemType },
          min: 1,
        }),
        slice: { preserveContext: true },
      },
    };
  },
}).extendTx(({ editor }) => (tx) => ({
  toggle: () => toggleTaskList(editor, tx),
}));

type ListContract = PluginConfig<
  'listClassic',
  ListPluginOptions,
  {},
  { listClassic: ListPluginTransaction },
  {},
  {},
  readonly [],
  readonly [
    typeof BaseBulletedListPlugin,
    typeof BaseNumberedListPlugin,
    typeof BaseTaskListPlugin,
    typeof BaseListItemPlugin,
    typeof BaseListItemContentPlugin,
  ]
>;

/** Enables support for bulleted, numbered and to-do lists. */
export const BaseListPlugin = createBasePlugin<ListContract>({
  key: KEYS.listClassic,
  options: { validLiChildren: [] },
  plugins: [
    BaseBulletedListPlugin,
    BaseNumberedListPlugin,
    BaseTaskListPlugin,
    BaseListItemPlugin,
    BaseListItemContentPlugin,
  ],
  schema: ({ plugins }) => {
    const listItemType = plugins.elementType(BaseListItemPlugin);
    const taskListType = plugins.elementType(BaseTaskListPlugin);

    return {
      properties: [
        schema.elementProperty(
          'checked',
          property.boolean({ default: false }),
          {
            target: target.and(
              target.type(listItemType),
              target.parent(target.type(taskListType))
            ),
            typeChange: 'preserve-if-allowed',
          }
        ),
      ],
    };
  },
})
  .extend(({ getOptions }) => ({
    plugins: [
      BaseBulletedListPlugin,
      BaseNumberedListPlugin,
      BaseTaskListPlugin,
      BaseListItemPlugin.extend({
        schema: ({ plugins }) => {
          const [contentType, bulletedType, numberedType, taskType] =
            plugins.elementTypes([
              BaseListItemContentPlugin,
              BaseBulletedListPlugin,
              BaseNumberedListPlugin,
              BaseTaskListPlugin,
            ]);
          const validLiChildren = plugins.elementTypes(
            getOptions().validLiChildren ?? []
          );

          return {
            element: {
              content: schema.content.types(
                [
                  contentType,
                  bulletedType,
                  numberedType,
                  taskType,
                  ...validLiChildren,
                ],
                {
                  default: { type: contentType },
                  min: 1,
                }
              ),
              slice: { preserveContext: true },
              topLevel: false,
            },
          };
        },
      }),
      BaseListItemContentPlugin,
    ],
  }))
  .extendTx(withList)
  .extendExtension(withInsertBreakList)
  .extendExtension(withDeleteBackwardList)
  .extendExtension(withDeleteForwardList)
  .extendExtension(withDeleteFragmentList)
  .extendExtension(withInsertFragmentList)
  .extendExtension(withNormalizeList);

export type ListConfig = InferConfig<typeof BaseListPlugin>;
