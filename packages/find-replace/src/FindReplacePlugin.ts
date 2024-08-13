import { createPlugin } from '@udecode/plate-common';

import type { FindReplacePluginOptions } from './types';

import { decorateFindReplace } from './decorateFindReplace';

export const FindReplacePlugin = createPlugin<
  'search_highlight',
  FindReplacePluginOptions
>({
  decorate: decorateFindReplace,
  isLeaf: true,
  key: 'search_highlight',
});
