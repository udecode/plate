import { getPluginRenderLeaf } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_SEARCH_HIGHLIGHT } from './defaults';

export const SearchHighlightPlugin = (): SlatePlugin => ({
  renderLeaf: getPluginRenderLeaf(MARK_SEARCH_HIGHLIGHT),
});
