import type { HotkeyPluginOptions } from '@udecode/plate-common';

import { extendPlugin } from '@udecode/plate-common/react';

import {
  type SuggestionConfig as BaseSuggestionConfig,
  SuggestionPlugin as BaseSuggestionPlugin,
} from '../lib/SuggestionPlugin';
import { useHooksSuggestion } from './useHooksSuggestion';

export type SuggestionConfig = {
  options: HotkeyPluginOptions;
} & BaseSuggestionConfig;

/** Enables support for suggestions in the editor. */
export const SuggestionPlugin = extendPlugin(BaseSuggestionPlugin, {
  useHooks: useHooksSuggestion,
});
