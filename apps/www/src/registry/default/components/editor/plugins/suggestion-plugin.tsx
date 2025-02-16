import { SuggestionPlugin } from '@udecode/plate-suggestion/react';

import { SuggestionBelowNodes } from '@/registry/default/plate-ui/suggestion-line-break';

export const suggestionPlugin = SuggestionPlugin.extend({
  options: {
    currentUserId: '1',
  },
  render: {
    belowNodes: SuggestionBelowNodes as any,
  },
});
