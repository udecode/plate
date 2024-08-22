import { toPlatePlugin } from '@udecode/plate-common/react';

import { SuggestionPlugin as BaseSuggestionPlugin } from '../lib/SuggestionPlugin';
import { useHooksSuggestion } from './useHooksSuggestion';

/** Enables support for suggestions in the editor. */
export const SuggestionPlugin = toPlatePlugin(BaseSuggestionPlugin, {
  useHooks: useHooksSuggestion,
});
