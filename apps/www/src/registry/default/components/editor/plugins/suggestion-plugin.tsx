import { SuggestionPlugin } from '@udecode/plate-suggestion/react';

import { renderSuggestionBelowNodes } from '@/registry/default/plate-ui/suggestion-line-break';

export const suggestionPlugin = SuggestionPlugin.extend({
  options: {
    currentUserId: 'testId',
  },
  render: {
    belowNodes: renderSuggestionBelowNodes as any,
  },
});
