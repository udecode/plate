import { createPluginFactory } from '@udecode/plate-common/server';

import type { FindReplacePlugin } from './types';

import { decorateFindReplace } from './decorateFindReplace';

export const MARK_SEARCH_HIGHLIGHT = 'search_highlight';

export const createFindReplacePlugin = createPluginFactory<FindReplacePlugin>({
  decorate: decorateFindReplace,
  isLeaf: true,
  key: MARK_SEARCH_HIGHLIGHT,
});
