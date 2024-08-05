import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@udecode/plate-combobox';
import { createPlugin } from '@udecode/plate-common/server';

export const KEY_SLASH_COMMAND = 'slash_command';

export const ELEMENT_SLASH_INPUT = 'slash_input';

export const SlashInputPlugin = createPlugin({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: ELEMENT_SLASH_INPUT,
});

export const SlashPlugin = createPlugin<
  'slash_command',
  TriggerComboboxPluginOptions
>({
  key: KEY_SLASH_COMMAND,
  options: {
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: ELEMENT_SLASH_INPUT,
    }),
    trigger: '/',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [SlashInputPlugin],
  withOverrides: withTriggerCombobox,
});
