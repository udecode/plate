import { definePlugin, type DefinitionOf, PLUGINS } from '../../../core';
import type { ComboboxState } from '../../combobox';

const TRIGGER_PREVIOUS_CHAR_PATTERN = /^\s?$/;

export type SlashPluginState = ComboboxState;

/** Slash command trigger policy; a `useCombobox` popup renders the menu. */
export const BaseSlashPlugin = definePlugin(PLUGINS.slashCommand, {
  initialState: (): SlashPluginState => ({
    maxQueryLength: 75,
    queryPattern: null,
    trigger: '/',
    triggerQuery: null,
    triggerPreviousCharPattern: TRIGGER_PREVIOUS_CHAR_PATTERN,
  }),

  editOnly: true,
});

export type SlashDefinition = DefinitionOf<typeof BaseSlashPlugin>;
