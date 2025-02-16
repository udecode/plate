import { SuggestionPlugin } from '@udecode/plate-suggestion/react';

import { SuggestionBelowNodes } from '@/registry/default/plate-ui/suggestion-line-break';

export const suggestionPlugin = SuggestionPlugin.extend({
  options: {
    currentUserId: 'testId',
  },
  render: {
    belowNodes: SuggestionBelowNodes as any,
  },
});
