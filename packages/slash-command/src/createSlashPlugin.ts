import { withInsertTextTriggerCombobox } from '@udecode/plate-combobox';
import { createPluginFactory } from '@udecode/plate-common';

import { SlashPlugin } from './types';

export const KEY_SLASH_COMMAND = 'slash_command';
export const ELEMENT_SLASH_INPUT = 'slash_input';

export const createSlashPlugin = createPluginFactory<SlashPlugin>({
  key: KEY_SLASH_COMMAND,
  withOverrides: withInsertTextTriggerCombobox,
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
