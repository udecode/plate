import type { DefinitionOf } from '../../../core';
import { BaseSuggestionPlugin } from '../../../features/suggestion/lib/BaseSuggestionPlugin';
import { toPlatePlugin } from '../../core';

export type SuggestionPluginState = {
  activeId: string | null;
  hoverId: string | null;
};

const initialState: SuggestionPluginState = {
  activeId: null,
  hoverId: null,
};

/** @experimental Enables support for suggestions in the editor. */
export const SuggestionPlugin = toPlatePlugin(BaseSuggestionPlugin, {
  initialState,
});

export type SuggestionDefinition = DefinitionOf<typeof SuggestionPlugin>;
