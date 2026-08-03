import {
  triggerCombobox,
  type TriggerComboboxPluginState,
} from '@platejs/combobox';
import { type DefinitionOf, defineBasePlugin } from '@platejs/core';
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

export const BaseSlashInputPlugin = defineBasePlugin(KEYS.slashInput, {
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

export const BaseSlashPlugin = defineBasePlugin(KEYS.slashCommand, {
  dependencies: [BaseSlashInputPlugin],
  initialState: slashInitialState,

  editOnly: true,
}).extend(({ editor, plugin, store, type }) =>
  triggerCombobox({
    editor,
    getState: () => store.get(),
    name: plugin.name,
    type,
  })
);

export type SlashDefinition = DefinitionOf<typeof BaseSlashPlugin>;
