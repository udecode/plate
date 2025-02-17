import { toPlatePlugin } from '@udecode/plate/react';

import { BaseSuggestionPlugin } from '../lib/BaseSuggestionPlugin';

/** @experimental Enables support for suggestions in the editor. */
export const SuggestionPlugin = toPlatePlugin(BaseSuggestionPlugin);
