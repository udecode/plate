import { createPluginFactory } from '@udecode/plate-core';
import { MARK_SUGGESTION } from './constants';
import { SuggestionPlugin } from './types';
import { useHooksSuggestion } from './useHooksSuggestion';
import { withSuggestion } from './withSuggestion';

export const createSuggestionPlugin = createPluginFactory<SuggestionPlugin>({
  key: MARK_SUGGESTION,
  isLeaf: true,
  useHooks: useHooksSuggestion,
  withOverrides: withSuggestion,
});
