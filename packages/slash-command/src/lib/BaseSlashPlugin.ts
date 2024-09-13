import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@udecode/plate-combobox';
import {
  type PluginConfig,
  type TElement,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate-common';

export interface TSlashInputElement extends TElement {}

export type SlashConfig = PluginConfig<
  'slash_command',
  TriggerComboboxPluginOptions
>;

export const BaseSlashInputPlugin = createSlatePlugin({
  key: 'slash_input',
  node: { isElement: true, isInline: true, isVoid: true },
});

export const BaseSlashPlugin = createTSlatePlugin<SlashConfig>({
  key: 'slash_command',
  extendEditor: withTriggerCombobox,
  options: {
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: BaseSlashInputPlugin.key,
    }),
    trigger: '/',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [BaseSlashInputPlugin],
});
