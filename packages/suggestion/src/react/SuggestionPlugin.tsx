import type { ExtendConfig, HotkeyPluginOptions } from '@udecode/plate-common';

import { toPlatePlugin } from '@udecode/plate-common/react';

import {
  type SuggestionConfig as BaseSuggestionConfig,
  SuggestionPlugin as BaseSuggestionPlugin,
} from '../lib/SuggestionPlugin';
import { useHooksSuggestion } from './useHooksSuggestion';

export type SuggestionConfig = ExtendConfig<
  BaseSuggestionConfig,
  HotkeyPluginOptions
>;

/** Enables support for suggestions in the editor. */
export const SuggestionPlugin = toPlatePlugin(BaseSuggestionPlugin, {
  useHooks: useHooksSuggestion,
});
