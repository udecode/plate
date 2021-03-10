import { useRenderLeaf } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_SEARCH_HIGHLIGHT } from './defaults';

export const SearchHighlightPlugin = (): SlatePlugin => ({
  renderLeaf: useRenderLeaf(MARK_SEARCH_HIGHLIGHT),
});
