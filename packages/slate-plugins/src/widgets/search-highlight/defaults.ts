import { MarkOnKeyDownOptions } from '../../common/utils/onKeyDownMark';
import { ItalicPluginOptionsValues } from '../../marks/italic/types';
import { SearchHighlightKeyOption } from './types';

export const MARK_SEARCH_HIGHLIGHT = 'search_highlight';

export const DEFAULTS_SEARCH_HIGHLIGHT: Record<
  SearchHighlightKeyOption,
  ItalicPluginOptionsValues & MarkOnKeyDownOptions
> = {
  search_highlight: {
    type: MARK_SEARCH_HIGHLIGHT,
    rootProps: {
      as: 'span',
      className: 'slate-search-highlight',
      styles: {
        root: {
          backgroundColor: '#fff59d',
        },
      },
    },
  },
};
