import { createPluginFactory } from '@udecode/plate-common/server';

import { decorateFindReplace } from './decorateFindReplace';
import { FindReplacePlugin } from './types';

export const MARK_SEARCH_HIGHLIGHT = 'search_highlight';

export const createFindReplacePlugin = createPluginFactory<FindReplacePlugin>({
  key: MARK_SEARCH_HIGHLIGHT,
  isLeaf: true,
  decorate: decorateFindReplace,
});
