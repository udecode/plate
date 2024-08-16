import { type PluginConfig, createTPlugin } from '@udecode/plate-common';

import { useHooksSuggestion } from './useHooksSuggestion';
import { withSuggestion } from './withSuggestion';

export const SUGGESTION_KEYS = {
  id: 'suggestionId',
} as const;

export type SuggestionConfig = PluginConfig<
  'suggestion',
  {
    currentUserId?: string;
    hotkey?: string;
  }
>;

export const SuggestionPlugin = createTPlugin<SuggestionConfig>({
  isLeaf: true,
  key: 'suggestion',
  useHooks: useHooksSuggestion,
  withOverrides: withSuggestion,
});
