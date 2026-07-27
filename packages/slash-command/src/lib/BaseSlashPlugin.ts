import {
  createTriggerComboboxExtension,
  type TriggerComboboxPluginState,
} from '@platejs/combobox';
import { type InferConfig, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

type SlashPluginState = TriggerComboboxPluginState;

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

const slashInitialState: SlashPluginState = {
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
  initialState: slashInitialState,

  editOnly: true,
  extension: (context) => createTriggerComboboxExtension(context),
});

export type SlashConfig = InferConfig<typeof BaseSlashPlugin>;
