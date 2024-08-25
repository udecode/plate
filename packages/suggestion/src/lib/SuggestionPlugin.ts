import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-common';

import { withSuggestion } from './withSuggestion';

export const SUGGESTION_KEYS = {
  id: 'suggestionId',
} as const;

export type SuggestionConfig = PluginConfig<
  'suggestion',
  {
    currentUserId?: string;
  }
>;

export const SuggestionPlugin = createTSlatePlugin<SuggestionConfig>({
  extendEditor: withSuggestion,
  key: 'suggestion',
  node: { isLeaf: true },
});
