import { SlatePlugin } from '@udecode/slate-plugins-core';
import { setDefaults } from '../../common/utils/setDefaults';
import { HighlightPlugin } from '../../marks/highlight';
import { DEFAULTS_SEARCH_HIGHLIGHT } from './defaults';
import { SearchHighlightPluginOptions } from './types';

export const SearchHighlightPlugin = (
  options?: SearchHighlightPluginOptions
): SlatePlugin => {
  const { search_highlight } = setDefaults(options, DEFAULTS_SEARCH_HIGHLIGHT);

  return {
    ...HighlightPlugin({ highlight: search_highlight }),
  };
};
