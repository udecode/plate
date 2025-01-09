import type { TNode } from '@udecode/plate';

import { SUGGESTION_KEYS } from '../BaseSuggestionPlugin';

export const getSuggestionId = (node: TNode) => {
  return node[SUGGESTION_KEYS.id] as string | undefined;
};
