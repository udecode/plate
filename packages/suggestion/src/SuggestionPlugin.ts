import { createPlugin } from '@udecode/plate-common';

import type { SuggestionPluginOptions } from './types';

import { useHooksSuggestion } from './useHooksSuggestion';
import { withSuggestion } from './withSuggestion';

export const SuggestionPlugin = createPlugin<
  'suggestion',
  SuggestionPluginOptions
>({
  isLeaf: true,
  key: 'suggestion',
  useHooks: useHooksSuggestion,
  withOverrides: withSuggestion,
});

export const KEY_SUGGESTION_ID = 'suggestionId';
