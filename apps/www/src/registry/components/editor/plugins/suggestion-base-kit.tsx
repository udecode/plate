import { BaseSuggestionPlugin } from '@platejs/suggestion';

import {
  SuggestionLeafStatic,
  VoidRemoveSuggestionOverlayStatic,
} from '@/registry/ui/suggestion-node-static';

export const BaseSuggestionKit = [
  BaseSuggestionPlugin.configure({
    render: {
      belowRootNodes: VoidRemoveSuggestionOverlayStatic as any,
      node: SuggestionLeafStatic as any,
    },
  }),
];
