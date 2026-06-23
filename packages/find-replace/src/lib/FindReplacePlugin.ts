import { type PluginConfig, createEditorPlugin, KEYS } from 'platejs';

import { decorateFindReplace } from './decorateFindReplace';

export type FindReplaceConfig = PluginConfig<
  'search_highlight',
  {
    /** Searching text to highlight */
    search?: string;
  }
>;

export const FindReplacePlugin = createEditorPlugin<FindReplaceConfig>({
  key: KEYS.searchHighlight,
  decorate: decorateFindReplace,
  node: { isLeaf: true },
  options: { search: '' },
});
