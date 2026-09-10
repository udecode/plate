import type { DefinitionOf } from '../../../core';
import { BaseSuggestionPlugin } from '../../../features/suggestion/lib/BaseSuggestionPlugin';
import { toPlatePlugin } from '../../core';

/** @experimental Enables support for suggestions in the editor. */
export const SuggestionPlugin = toPlatePlugin(BaseSuggestionPlugin);

export type SuggestionDefinition = DefinitionOf<typeof SuggestionPlugin>;
