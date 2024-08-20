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
  isLeaf: true,
  key: 'search_highlight',
});
