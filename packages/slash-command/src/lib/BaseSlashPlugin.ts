import {
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
  KEYS,
} from 'platejs';
import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@platejs/combobox';

export type SlashConfig = PluginConfig<
  'slash_command',
  TriggerComboboxPluginOptions
>;

export const BaseSlashInputPlugin = createSlatePlugin({
  key: KEYS.slashInput,
  editOnly: true,
  node: { isElement: true, isInline: true, isVoid: true },
});

export const BaseSlashPlugin = createTSlatePlugin<SlashConfig>({
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
}).overrideEditor(withTriggerCombobox);
