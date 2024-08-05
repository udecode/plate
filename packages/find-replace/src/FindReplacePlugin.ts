import { createPlugin } from '@udecode/plate-common/server';

import type { FindReplacePluginOptions } from './types';

import { decorateFindReplace } from './decorateFindReplace';

export const MARK_SEARCH_HIGHLIGHT = 'search_highlight';

export const FindReplacePlugin = createPlugin<
  'search_highlight',
  FindReplacePluginOptions
>({
  decorate: decorateFindReplace,
  isLeaf: true,
  key: MARK_SEARCH_HIGHLIGHT,
});
