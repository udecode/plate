import { BaseSuggestionPlugin } from '@udecode/plate-suggestion';

import { SuggestionLeafStatic } from '@/registry/ui/suggestion-node-static';

export const BaseSuggestionKit = [
  BaseSuggestionPlugin.withComponent(SuggestionLeafStatic),
];
