import { TNode } from '@udecode/plate-common/server';

import { KEY_SUGGESTION_ID } from '../constants';

export const getSuggestionId = (node: TNode) => {
  return node[KEY_SUGGESTION_ID] as string | undefined;
};
