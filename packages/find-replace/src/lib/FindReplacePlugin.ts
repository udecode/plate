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
  key: 'search_highlight',
  decorate: decorateFindReplace,
  node: { isLeaf: true },
  options: { search: '' },
});
