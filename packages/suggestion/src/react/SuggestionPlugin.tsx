import type { DefinitionOf } from '@platejs/core';
import { toPlatePlugin } from '@platejs/core/react';

import { BaseSuggestionPlugin } from '../lib/BaseSuggestionPlugin';

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
