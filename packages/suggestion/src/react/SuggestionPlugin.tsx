import { toPlatePlugin } from '@udecode/plate-common/react';

import { BaseSuggestionPlugin } from '../lib/BaseSuggestionPlugin';
import { useHooksSuggestion } from './useHooksSuggestion';

/** Enables support for suggestions in the editor. */
export const SuggestionPlugin = toPlatePlugin(BaseSuggestionPlugin, {
  useHooks: useHooksSuggestion as any,
});
