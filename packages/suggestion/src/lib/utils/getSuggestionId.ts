import type { TNode } from '@udecode/plate-common';

import { SUGGESTION_KEYS } from '../SuggestionPlugin';

export const getSuggestionId = (node: TNode) => {
  return node[SUGGESTION_KEYS.id] as string | undefined;
};
