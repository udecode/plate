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
  editOnly: true,
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
  dependencies: [BaseSlashInputPlugin],
  options: slashPluginOptions,

  editOnly: true,
  extension: (context) => withTriggerCombobox(context),
});

export type SlashConfig = InferConfig<typeof BaseSlashPlugin>;
