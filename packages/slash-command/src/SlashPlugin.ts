import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@udecode/plate-combobox';
import { createPlugin } from '@udecode/plate-common';


export const SlashInputPlugin = createPlugin({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: 'slash_input',
});

export const SlashPlugin = createPlugin<
  'slash_command',
  TriggerComboboxPluginOptions
>({
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
