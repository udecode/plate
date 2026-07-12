import { type PluginConfig, createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { decorateFindReplace } from './decorateFindReplace';

export type FindReplaceConfig = PluginConfig<
  'search_highlight',
  {
    /** Searching text to highlight */
    search?: string;
  }
>;

export const FindReplacePlugin = createBasePlugin<FindReplaceConfig>({
  key: KEYS.searchHighlight,
  decorate: decorateFindReplace,
  node: { isLeaf: true },
  options: { search: '' },
});
