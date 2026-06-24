import type { TriggerComboboxPluginOptions } from '@platejs/combobox';
import {
  type PluginConfig,
  type EditorPlugin,
  createEditorPlugin,
  KEYS,
} from 'platejs';

export type SlashConfig = PluginConfig<
  'slash_command',
  TriggerComboboxPluginOptions
>;

export const BaseSlashInputPlugin = createEditorPlugin({
  key: KEYS.slashInput,
  editOnly: true,
  node: { isElement: true, isInline: true, isVoid: true },
});

const BaseSlashPluginBase: EditorPlugin<SlashConfig> =
  createEditorPlugin<SlashConfig>({
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
  });

export const BaseSlashPlugin: EditorPlugin<SlashConfig> & {
  runtimeTriggerCombobox: boolean;
} = Object.assign(BaseSlashPluginBase, {
  runtimeTriggerCombobox: true,
});
