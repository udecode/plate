import { SlatePlugin } from '../../common';
import { HighlightPlugin } from '../../marks/highlight';
import { MARK_SEARCH_HIGHLIGHT, SearchHighlightPluginOptions } from './types';

export const SearchHighlightPlugin = ({
  typeSearchHighlight = MARK_SEARCH_HIGHLIGHT,
  bg,
}: SearchHighlightPluginOptions = {}): SlatePlugin => ({
  ...HighlightPlugin({ typeHighlight: typeSearchHighlight, bg }),
});
