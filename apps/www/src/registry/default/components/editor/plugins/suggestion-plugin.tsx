import { SuggestionPlugin } from '@udecode/plate-suggestion/react';

import { BlockComments } from '@/registry/default/plate-ui/block-comments';
import { SuggestionBelowNodes } from '@/registry/default/plate-ui/suggestion-line-break';

export const suggestionPlugin = SuggestionPlugin.extend({
  options: {
    currentUserId: 'testId',
  },
  render: {
    aboveNodes: BlockComments as any,
    belowNodes: SuggestionBelowNodes,
  },
});
