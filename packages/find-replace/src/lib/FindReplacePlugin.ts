import { type PluginConfig, createTSlatePlugin, KEYS } from '@udecode/plate';

import { decorateFindReplace } from './decorateFindReplace';

export type FindReplaceConfig = PluginConfig<
  'search_highlight',
  {
    /** Searching text to highlight */
    search?: string;
  }
>;

export const FindReplacePlugin = createTSlatePlugin<FindReplaceConfig>({
  key: KEYS.searchHighlight,
  decorate: decorateFindReplace,
  node: { isLeaf: true },
  options: { search: '' },
});
