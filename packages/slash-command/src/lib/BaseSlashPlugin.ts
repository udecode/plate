import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@platejs/combobox';
import { type InferConfig, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

type SlashPluginOptions = TriggerComboboxPluginOptions;

export const BaseSlashInputPlugin = createBasePlugin({
  key: KEYS.slashInput,
  editOnly: true,
  schema: {
    element: {
      properties: {
        trigger: property.string(),
        userId: property.string(),
        value: property.string(),
      },
      void: 'inline',
    },
  },
  type: NODES.slashInput,
});

const slashPluginOptions: SlashPluginOptions = {
  trigger: '/',
  triggerPreviousCharPattern: /^\s?$/,
  createComboboxInput: () => ({
    children: [{ text: '' }],
    type: NODES.slashInput,
  }),
};

export const BaseSlashPlugin = createBasePlugin({
  key: KEYS.slashCommand,
  editOnly: true,
  options: slashPluginOptions,
  plugins: [BaseSlashInputPlugin],
}).extendExtension(withTriggerCombobox);

export type SlashConfig = InferConfig<typeof BaseSlashPlugin>;
