import {
  triggerCombobox,
  type TriggerComboboxPluginState,
} from '@platejs/combobox';
import { type DefinitionOf, defineBasePlugin } from '@platejs/core';
import { type ElementOf, property } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

const TRIGGER_PREVIOUS_CHAR_PATTERN = /^\s?$/;

export type SlashPluginState = TriggerComboboxPluginState & {
  createComboboxInput: NonNullable<
    TriggerComboboxPluginState['createComboboxInput']
  >;
  trigger: NonNullable<TriggerComboboxPluginState['trigger']>;
  triggerPreviousCharPattern: NonNullable<
    TriggerComboboxPluginState['triggerPreviousCharPattern']
  >;
};

export const BaseSlashInputPlugin = defineBasePlugin(PLUGINS.slashInput, {
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
  editOnly: true,
});

export type SlashInputElement = ElementOf<typeof BaseSlashInputPlugin>;

export const BaseSlashPlugin = defineBasePlugin(PLUGINS.slashCommand, {
  dependencies: [BaseSlashInputPlugin],
  initialState: ({ editor }): SlashPluginState => ({
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: editor.plugin(BaseSlashInputPlugin).schema.type,
    }),
    trigger: '/',
    triggerPreviousCharPattern: TRIGGER_PREVIOUS_CHAR_PATTERN,
  }),

  editOnly: true,
}).extend(({ editor, store }) => ({
  commands: (context) =>
    triggerCombobox(context, {
      editor,
      getState: () => store.get(),
      type: editor.plugin(BaseSlashInputPlugin).schema.type,
    }),
}));

export type SlashDefinition = DefinitionOf<typeof BaseSlashPlugin>;
