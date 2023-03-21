import { TNode } from '@udecode/plate-common';
import { KEY_SUGGESTION_ID } from '../constants';

export const getSuggestionId = (node: TNode) => {
  return node[KEY_SUGGESTION_ID] as string | undefined;
};
