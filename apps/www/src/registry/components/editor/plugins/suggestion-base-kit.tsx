import { BaseSuggestionPlugin } from '@platejs/suggestion';

import { SuggestionLeafStatic } from '../../../ui/suggestion-node-static';

export const BaseSuggestionKit = [
  BaseSuggestionPlugin.withComponent(SuggestionLeafStatic),
];
