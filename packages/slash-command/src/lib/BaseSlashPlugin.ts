import {
  type PluginConfig,
  type TElement,
  createSlatePlugin,
  createTSlatePlugin,
  KEYS,
} from '@udecode/plate';
import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@udecode/plate-combobox';

export type SlashConfig = PluginConfig<
  'slash_command',
  TriggerComboboxPluginOptions
>;

export interface TSlashInputElement extends TElement {}

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
