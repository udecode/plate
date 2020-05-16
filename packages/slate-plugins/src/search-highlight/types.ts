export interface DecorateSearchHighlightOptions {
  typeSearchHighlight?: string;
  /**
   * Searching text to highlight
   */
  search: string;
}

export interface SearchHighlightPluginOptions {
  typeSearchHighlight?: string;
  bg?: string;
}

export const MARK_SEARCH_HIGHLIGHT = 'search_highlight';
