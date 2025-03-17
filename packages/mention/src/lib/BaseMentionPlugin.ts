import {
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate';
import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@udecode/plate-combobox';

import type { TMentionElement } from './types';

export type MentionConfig = PluginConfig<
  'mention',
  {
    insertSpaceAfterMention?: boolean;
  } & TriggerComboboxPluginOptions,
  {},
  {
    insert: {
      mention: (options: { search: string; value: any; key?: any }) => void;
    };
  }
>;

export const BaseMentionInputPlugin = createSlatePlugin({
  key: 'mention_input',
  node: { isElement: true, isInline: true, isVoid: true },
});

/** Enables support for autocompleting @mentions. */
export const BaseMentionPlugin = createTSlatePlugin<MentionConfig>({
  key: 'mention',
  node: { isElement: true, isInline: true, isMarkableVoid: true, isVoid: true },
  options: {
    trigger: '@',
    triggerPreviousCharPattern: /^\s?$/,
    createComboboxInput: (trigger) => ({
      children: [{ text: '' }],
      trigger,
      type: BaseMentionInputPlugin.key,
    }),
  },
  plugins: [BaseMentionInputPlugin],
})
  .extendEditorTransforms<MentionConfig['transforms']>(({ editor, type }) => ({
    insert: {
      mention: ({ key, value }) => {
        editor.tf.insertNodes<TMentionElement>({
          key,
          children: [{ text: '' }],
          type,
          value,
        });
      },
    },
  }))
  .overrideEditor(withTriggerCombobox as any);
