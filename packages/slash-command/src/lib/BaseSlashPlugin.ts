import {
  createTriggerComboboxExtension,
  type TriggerComboboxPluginState,
} from '@platejs/combobox';
import { type InferConfig, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

export type SlashPluginState = TriggerComboboxPluginState & {
  createComboboxInput: NonNullable<
    TriggerComboboxPluginState['createComboboxInput']
  >;
  trigger: NonNullable<TriggerComboboxPluginState['trigger']>;
  triggerPreviousCharPattern: NonNullable<
    TriggerComboboxPluginState['triggerPreviousCharPattern']
  >;
};

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
  extension: ({ editor, plugin, store, type }) =>
    createTriggerComboboxExtension({
      editor,
      getState: () => store.get(),
      name: plugin.key,
      type,
    }),
});

export type SlashConfig = InferConfig<typeof BaseSlashPlugin>;
