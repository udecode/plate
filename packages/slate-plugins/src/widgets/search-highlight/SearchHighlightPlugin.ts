import { SlatePlugin } from 'common/types';
import { HighlightPlugin } from 'marks';
import {
  MARK_SEARCH_HIGHLIGHT,
  SearchHighlightPluginOptions,
} from 'widgets/search-highlight/types';

export const SearchHighlightPlugin = ({
  typeSearchHighlight = MARK_SEARCH_HIGHLIGHT,
  bg,
}: SearchHighlightPluginOptions = {}): SlatePlugin => ({
  ...HighlightPlugin({ typeHighlight: typeSearchHighlight, bg }),
});
