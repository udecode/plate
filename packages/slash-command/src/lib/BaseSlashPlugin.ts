import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@platejs/combobox';
import { type PluginConfig, createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export type SlashConfig = PluginConfig<
  'slash_command',
  TriggerComboboxPluginOptions
>;

export const BaseSlashInputPlugin = createBasePlugin({
  key: KEYS.slashInput,
  editOnly: true,
  node: { isElement: true, isInline: true, isVoid: true },
});

export const BaseSlashPlugin = createBasePlugin<SlashConfig>({
  key: KEYS.slashCommand,
  editOnly: true,
  options: {
    trigger: '/',
    triggerPreviousCharPattern: /^\s?$/,
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: KEYS.slashInput,
    }),
  },
  plugins: [BaseSlashInputPlugin],
}).extendExtension(withTriggerCombobox);
