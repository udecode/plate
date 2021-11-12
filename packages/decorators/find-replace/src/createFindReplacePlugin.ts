import { createPlugin } from '@udecode/plate-core';
import { getFindReplaceDecorate } from './getFindReplaceDecorate';
import { FindReplacePlugin } from './types';

export const MARK_SEARCH_HIGHLIGHT = 'search_highlight';

export const createFindReplacePlugin = createPlugin<FindReplacePlugin>({
  key: MARK_SEARCH_HIGHLIGHT,
  isLeaf: true,
  decorate: getFindReplaceDecorate(),
});
