import {
  TriggerComboboxPlugin,
  withTriggerCombobox,
} from '@udecode/plate-combobox';
import { createPluginFactory } from '@udecode/plate-common';

export const KEY_SLASH_COMMAND = 'slash_command';
export const ELEMENT_SLASH_INPUT = 'slash_input';

export const createSlashPlugin = createPluginFactory<TriggerComboboxPlugin>({
  key: KEY_SLASH_COMMAND,
  withOverrides: withTriggerCombobox,
  plugins: [
    {
      key: ELEMENT_SLASH_INPUT,
      isElement: true,
      isInline: true,
      isVoid: true,
    },
  ],
  options: {
    combobox: {
      trigger: '/',
      triggerPreviousCharPattern: /^\s?$/,
      createInputNode: () => ({
        type: ELEMENT_SLASH_INPUT,
        children: [{ text: '' }],
      }),
    },
  },
});
