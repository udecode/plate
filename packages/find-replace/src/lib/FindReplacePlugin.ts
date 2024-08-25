import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-common';

import { decorateFindReplace } from './decorateFindReplace';

export type FindReplaceConfig = PluginConfig<
  'search_highlight',
  {
    /** Searching text to highlight */
    search?: string;
  }
>;

export const FindReplacePlugin = createTSlatePlugin<FindReplaceConfig>({
  decorate: decorateFindReplace,
  key: 'search_highlight',
  node: { isLeaf: true },
  options: { search: '' },
});
