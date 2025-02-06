import {
  type PluginConfig,
  type TElement,
  createSlatePlugin,
  createTSlatePlugin,
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
  key: 'slash_input',
  node: { isElement: true, isInline: true, isVoid: true },
});

export const BaseSlashPlugin = createTSlatePlugin<SlashConfig>({
  key: 'slash_command',
  options: {
    trigger: '/',
    triggerPreviousCharPattern: /^\s?$/,
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: BaseSlashInputPlugin.key,
    }),
  },
  plugins: [BaseSlashInputPlugin],
}).overrideEditor(withTriggerCombobox);
