import { createPlugin } from '@udecode/plate-common';

import type { SuggestionPluginOptions } from './types';

import { MARK_SUGGESTION } from './constants';
import { useHooksSuggestion } from './useHooksSuggestion';
import { withSuggestion } from './withSuggestion';

export const SuggestionPlugin = createPlugin<
  'suggestion',
  SuggestionPluginOptions
>({
  isLeaf: true,
  key: MARK_SUGGESTION,
  useHooks: useHooksSuggestion,
  withOverrides: withSuggestion,
});
