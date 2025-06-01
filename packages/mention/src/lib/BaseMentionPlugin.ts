import {
  type PluginConfig,
  type TMentionElement,
  createSlatePlugin,
  createTSlatePlugin,
  KEYS,
} from '@udecode/plate';
import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@udecode/plate-combobox';

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
  key: KEYS.mentionInput,
  node: { isElement: true, isInline: true, isVoid: true },
});

/** Enables support for autocompleting @mentions. */
export const BaseMentionPlugin = createTSlatePlugin<MentionConfig>({
  key: KEYS.mention,
  node: { isElement: true, isInline: true, isMarkableVoid: true, isVoid: true },
  options: {
    trigger: '@',
    triggerPreviousCharPattern: /^\s?$/,
    createComboboxInput: (trigger) => ({
      children: [{ text: '' }],
      trigger,
      type: KEYS.mentionInput,
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
