import {
  type TriggerComboboxPlugin,
  withTriggerCombobox,
} from '@udecode/plate-combobox';
import { createPluginFactory } from '@udecode/plate-common/server';

export const KEY_SLASH_COMMAND = 'slash_command';
export const ELEMENT_SLASH_INPUT = 'slash_input';

export const createSlashPlugin = createPluginFactory<TriggerComboboxPlugin>({
  key: KEY_SLASH_COMMAND,
  options: {
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: ELEMENT_SLASH_INPUT,
    }),
    trigger: '/',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [
    {
      isElement: true,
      isInline: true,
      isVoid: true,
      key: ELEMENT_SLASH_INPUT,
    },
  ],
  withOverrides: withTriggerCombobox,
});
