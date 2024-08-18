import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@udecode/plate-combobox';
import {
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate-common';

export const SlashInputPlugin = createSlatePlugin({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: 'slash_input',
});

export type SlashConfig = PluginConfig<
  'slash_command',
  TriggerComboboxPluginOptions
>;

export const SlashPlugin = createTSlatePlugin<SlashConfig>({
  key: 'slash_command',
  options: {
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: SlashInputPlugin.key,
    }),
    trigger: '/',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [SlashInputPlugin],
  withOverrides: withTriggerCombobox,
});
