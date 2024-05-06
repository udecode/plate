import { createPluginFactory } from '@udecode/plate-common/server';

import type { SuggestionPlugin } from './types';

import { MARK_SUGGESTION } from './constants';
import { useHooksSuggestion } from './useHooksSuggestion';
import { withSuggestion } from './withSuggestion';

export const createSuggestionPlugin = createPluginFactory<SuggestionPlugin>({
  isLeaf: true,
  key: MARK_SUGGESTION,
  useHooks: useHooksSuggestion,
  withOverrides: withSuggestion,
});
